import { NextRequest, NextResponse } from 'next/server'
import { getPalmScannerService } from '@/lib/palm-scanner/scanner-service'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { 
      user_id,
      hand_type = 'right',
      verification_purpose = 'attendance',
      system_source = 'palm_management'
    } = await request.json()

    console.log(`Starting palm verification for user ${user_id || 'unknown'}`)

    const scannerService = getPalmScannerService()
    
    // Check if scanner is ready
    const isReady = await scannerService.isDeviceReady()
    if (!isReady) {
      return NextResponse.json(
        { error: 'Palm scanner device is not ready' },
        { status: 503 }
      )
    }

    // Step 1: Capture new palm scan
    const scanResult = await scannerService.capturePalmScan({
      hand_type,
      quality_threshold: 70,
      timeout_ms: 5000,
      capture_images: false
    })

    if (!scanResult.success || !scanResult.template_data) {
      console.log('Palm capture failed for verification:', scanResult.error_message)
      
      // Log failed verification attempt
      await supabase.from('palm_verification_logs').insert({
        user_id: user_id || null,
        hand_type,
        verification_result: 'failed',
        confidence_score: 0,
        verification_purpose,
        system_source,
        error_message: scanResult.error_message || 'Capture failed',
        processing_time_ms: scanResult.capture_duration_ms
      })

      return NextResponse.json({
        success: false,
        result: 'capture_failed',
        error: scanResult.error_message,
        quality_score: scanResult.quality_score
      }, { status: 400 })
    }

    // Step 2: Get stored templates for matching
    let storedTemplates: Array<{ id: string; template: Buffer; hand_type: string }> = []

    if (user_id) {
      // Verification mode: match against specific user's templates
      const { data: userTemplates } = await supabase
        .from('palm_templates')
        .select('id, template_data, hand_type')
        .eq('user_id', user_id)
        .eq('status', 'active')

      storedTemplates = (userTemplates || []).map(t => ({
        id: t.id,
        template: Buffer.from(t.template_data),
        hand_type: t.hand_type
      }))
    } else {
      // Identification mode: match against all active templates
      const { data: allTemplates } = await supabase
        .from('palm_templates')
        .select('id, user_id, template_data, hand_type')
        .eq('status', 'active')
        .limit(1000) // Reasonable limit for performance

      storedTemplates = (allTemplates || []).map(t => ({
        id: t.id,
        template: Buffer.from(t.template_data),
        hand_type: t.hand_type,
        user_id: t.user_id
      }))
    }

    if (storedTemplates.length === 0) {
      console.log('No stored templates found for verification')
      
      await supabase.from('palm_verification_logs').insert({
        user_id: user_id || null,
        hand_type,
        verification_result: 'failed',
        confidence_score: 0,
        verification_purpose,
        system_source,
        error_message: 'No stored templates found',
        processing_time_ms: scanResult.capture_duration_ms
      })

      return NextResponse.json({
        success: false,
        result: 'no_templates',
        error: 'No stored templates found for verification'
      }, { status: 404 })
    }

    // Step 3: Verify captured template against stored templates
    const verificationResult = await scannerService.verifyPalm(
      scanResult.template_data,
      storedTemplates
    )

    // Step 4: Determine matched user (for identification mode)
    let matchedUserId = user_id
    if (!user_id && verificationResult.match_found && verificationResult.matched_template_id) {
      const matchedTemplate = storedTemplates.find(t => t.id === verificationResult.matched_template_id)
      if (matchedTemplate && 'user_id' in matchedTemplate) {
        matchedUserId = (matchedTemplate as any).user_id
      }
    }

    // Step 5: Log verification attempt
    const logData = {
      user_id: matchedUserId || null,
      template_id: verificationResult.matched_template_id || null,
      hand_type,
      verification_result: verificationResult.match_found ? 'success' : 'failed',
      confidence_score: verificationResult.confidence_score,
      match_threshold: 80,
      templates_compared: storedTemplates.length,
      best_match_score: verificationResult.confidence_score,
      processing_time_ms: verificationResult.processing_time_ms,
      verification_purpose,
      system_source,
      error_message: verificationResult.error_message || null
    }

    await supabase.from('palm_verification_logs').insert(logData)

    // Step 6: Update user's last verification time if successful
    if (verificationResult.match_found && matchedUserId) {
      await supabase
        .from('palm_templates')
        .update({ 
          last_used: new Date().toISOString(),
          verification_count: supabase.sql`verification_count + 1`
        })
        .eq('id', verificationResult.matched_template_id)
    }

    console.log(`Palm verification completed: ${verificationResult.match_found ? 'SUCCESS' : 'FAILED'}, confidence: ${verificationResult.confidence_score}%`)

    return NextResponse.json({
      success: true,
      result: verificationResult.match_found ? 'verified' : 'not_verified',
      data: {
        match_found: verificationResult.match_found,
        confidence_score: verificationResult.confidence_score,
        matched_user_id: matchedUserId,
        matched_template_id: verificationResult.matched_template_id,
        processing_time_ms: verificationResult.processing_time_ms,
        templates_compared: storedTemplates.length,
        capture_quality: scanResult.quality_score
      }
    })

  } catch (error) {
    console.error('Error in palm verification API:', error)
    return NextResponse.json(
      { 
        error: 'Palm verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
