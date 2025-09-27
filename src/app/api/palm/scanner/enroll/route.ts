import { NextRequest, NextResponse } from 'next/server'
import { getPalmScannerService } from '@/lib/palm-scanner/scanner-service'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { 
      user_id,
      hand_type = 'right',
      enrollment_type = 'initial',
      required_captures = 3,
      quality_threshold = 80
    } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log(`Starting palm enrollment for user ${user_id}, type: ${enrollment_type}`)

    const scannerService = getPalmScannerService()
    
    // Check if scanner is ready
    const isReady = await scannerService.isDeviceReady()
    if (!isReady) {
      return NextResponse.json(
        { error: 'Palm scanner device is not ready' },
        { status: 503 }
      )
    }

    // Step 1: Create enrollment session
    const sessionToken = `enroll_${Date.now()}_${user_id}`
    
    const { data: enrollmentSession, error: sessionError } = await supabase
      .from('palm_enrollment_sessions')
      .insert({
        user_id,
        session_token: sessionToken,
        hand_type,
        enrollment_type,
        required_captures,
        completed_captures: 0,
        min_quality_threshold: quality_threshold,
        status: 'in_progress'
      })
      .select()
      .single()

    if (sessionError || !enrollmentSession) {
      console.error('Failed to create enrollment session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create enrollment session' },
        { status: 500 }
      )
    }

    console.log(`Created enrollment session: ${sessionToken}`)

    // Step 2: Perform multiple captures for template generation
    const captures = []
    const captureResults = []
    let bestQualityScore = 0
    let bestTemplate: Buffer | null = null

    for (let i = 0; i < required_captures; i++) {
      console.log(`Performing capture ${i + 1}/${required_captures}`)
      
      const scanResult = await scannerService.capturePalmScan({
        hand_type,
        quality_threshold,
        timeout_ms: 8000, // Longer timeout for enrollment
        capture_images: true
      })

      if (!scanResult.success) {
        console.log(`Capture ${i + 1} failed:`, scanResult.error_message)
        
        // Store failed capture info
        captureResults.push({
          capture_number: i + 1,
          success: false,
          quality_score: scanResult.quality_score,
          error: scanResult.error_message
        })
        
        continue
      }

      // Store successful capture
      const captureData = {
        session_id: enrollmentSession.id,
        user_id,
        capture_sequence: i + 1,
        hand_type,
        raw_image: scanResult.raw_image,
        processed_image: scanResult.processed_image,
        image_width: 640,
        image_height: 480,
        image_format: 'BMP',
        file_size_bytes: scanResult.raw_image?.length || 0,
        quality_score: scanResult.quality_score,
        vein_pattern_detected: true,
        roi_extracted: !!scanResult.roi_coordinates,
        features_extracted: 100, // Simulated
        device_id: 'PALM_DEVICE_001',
        processing_duration_ms: scanResult.capture_duration_ms,
        is_used_for_template: scanResult.quality_score === bestQualityScore || scanResult.quality_score > bestQualityScore,
        processing_status: 'processed'
      }

      const { data: captureRecord } = await supabase
        .from('palm_capture_images')
        .insert(captureData)
        .select()
        .single()

      if (captureRecord) {
        captures.push(captureRecord)
      }

      // Track best quality template
      if (scanResult.quality_score > bestQualityScore) {
        bestQualityScore = scanResult.quality_score
        bestTemplate = scanResult.template_data || null
      }

      captureResults.push({
        capture_number: i + 1,
        success: true,
        quality_score: scanResult.quality_score,
        template_size: scanResult.template_data?.length || 0,
        has_image: !!scanResult.raw_image
      })

      // Small delay between captures
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const successfulCaptures = captureResults.filter(c => c.success).length
    
    // Step 3: Check if enrollment requirements are met
    if (successfulCaptures === 0 || !bestTemplate) {
      // Update session as failed
      await supabase
        .from('palm_enrollment_sessions')
        .update({
          status: 'failed',
          completed_captures: successfulCaptures,
          error_message: 'No successful captures obtained'
        })
        .eq('id', enrollmentSession.id)

      return NextResponse.json({
        success: false,
        error: 'Enrollment failed - no successful captures',
        data: {
          session_id: enrollmentSession.id,
          captures_attempted: required_captures,
          successful_captures: successfulCaptures,
          capture_results: captureResults
        }
      }, { status: 400 })
    }

    // Step 4: Create palm template record
    const templateData = {
      user_id,
      hand_type,
      template_data: bestTemplate,
      template_hash: `hash_${Date.now()}_${user_id}`,
      quality_score: bestQualityScore,
      device_id: 'PALM_DEVICE_001',
      enrolled_by: user_id, // In production, this would be the admin user
      status: 'active',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    }

    const { data: palmTemplate, error: templateError } = await supabase
      .from('palm_templates')
      .insert(templateData)
      .select()
      .single()

    if (templateError || !palmTemplate) {
      console.error('Failed to create palm template:', templateError)
      
      await supabase
        .from('palm_enrollment_sessions')
        .update({
          status: 'failed',
          error_message: 'Failed to create template'
        })
        .eq('id', enrollmentSession.id)

      return NextResponse.json(
        { error: 'Failed to create palm template' },
        { status: 500 }
      )
    }

    // Step 5: Update enrollment session as completed
    await supabase
      .from('palm_enrollment_sessions')
      .update({
        template_id: palmTemplate.id,
        status: 'completed',
        completed_captures: successfulCaptures,
        final_quality_score: bestQualityScore,
        completed_at: new Date().toISOString()
      })
      .eq('id', enrollmentSession.id)

    // Step 6: Update user palm status
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        palm_enrollment_status: 'enrolled',
        palm_enrolled_hands: [hand_type],
        palm_last_enrollment: new Date().toISOString(),
        palm_enrollment_expires: templateData.expires_at,
        palm_verification_failures: 0,
        palm_locked_until: null
      })
      .eq('id', user_id)

    if (userUpdateError) {
      console.error('Failed to update user palm status:', userUpdateError)
    }

    console.log(`Palm enrollment completed successfully for user ${user_id}`)

    return NextResponse.json({
      success: true,
      message: `Palm ${enrollment_type} completed successfully`,
      data: {
        session_id: enrollmentSession.id,
        template_id: palmTemplate.id,
        quality_score: bestQualityScore,
        captures_attempted: required_captures,
        successful_captures: successfulCaptures,
        hand_type,
        enrollment_date: new Date().toISOString(),
        expires_at: templateData.expires_at,
        capture_results: captureResults
      }
    })

  } catch (error) {
    console.error('Error in palm enrollment API:', error)
    return NextResponse.json(
      { 
        error: 'Palm enrollment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
