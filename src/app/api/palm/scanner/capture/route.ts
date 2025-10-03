import { NextRequest, NextResponse } from 'next/server'
import { getPalmScannerService } from '@/lib/palm-scanner/scanner-service'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { 
      user_id, 
      hand_type = 'right', 
      quality_threshold = 80,
      timeout_ms = 5000,
      capture_images = true,
      enrollment_session_id 
    } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log(`Starting palm capture for user ${user_id}, hand: ${hand_type}`)

    // Create service client for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const scannerService = getPalmScannerService()
    
    // Check if scanner is ready
    const isReady = await scannerService.isDeviceReady()
    if (!isReady) {
      return NextResponse.json(
        { error: 'Palm scanner device is not ready' },
        { status: 503 }
      )
    }

    // Capture palm scan using SDK
    const scanResult = await scannerService.capturePalmScan({
      hand_type,
      quality_threshold,
      timeout_ms,
      capture_images
    })

    if (!scanResult.success) {
      console.log('Palm capture failed:', scanResult.error_message)
      return NextResponse.json({
        success: false,
        error: scanResult.error_message,
        quality_score: scanResult.quality_score,
        capture_duration_ms: scanResult.capture_duration_ms
      }, { status: 400 })
    }

    console.log(`Palm capture successful, quality: ${scanResult.quality_score}%`)

    // Store capture data if enrollment session provided
    if (enrollment_session_id && scanResult.template_data) {
      const captureData = {
        session_id: enrollment_session_id,
        user_id,
        capture_sequence: 1, // This would be incremented in real implementation
        hand_type,
        raw_image: scanResult.raw_image,
        processed_image: scanResult.processed_image,
        thumbnail: null, // Could generate thumbnail from raw_image
        image_width: 640,
        image_height: 480,
        image_format: 'BMP',
        file_size_bytes: scanResult.raw_image?.length || 0,
        quality_score: scanResult.quality_score,
        vein_pattern_detected: true,
        roi_extracted: !!scanResult.roi_coordinates,
        features_extracted: 100, // Simulated feature count
        device_id: 'PALM_DEVICE_001',
        processing_duration_ms: scanResult.capture_duration_ms,
        is_used_for_template: true,
        processing_status: 'processed'
      }

      const { error: captureError } = await supabase
        .from('palm_capture_images')
        .insert(captureData)

      if (captureError) {
        console.error('Failed to store capture data:', captureError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        quality_score: scanResult.quality_score,
        template_data: scanResult.template_data ? scanResult.template_data.toString('base64') : null,
        roi_coordinates: scanResult.roi_coordinates,
        capture_duration_ms: scanResult.capture_duration_ms,
        has_raw_image: !!scanResult.raw_image,
        image_size_bytes: scanResult.raw_image?.length || 0
      }
    })

  } catch (error) {
    console.error('Error in palm capture API:', error)
    return NextResponse.json(
      { 
        error: 'Palm capture failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
