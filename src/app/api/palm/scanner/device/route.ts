import { NextRequest, NextResponse } from 'next/server'
import { getPalmScannerService } from '@/lib/palm-scanner/scanner-service'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Getting palm scanner device info...')
    
    const scannerService = getPalmScannerService()
    
    // Initialize scanner if not already done
    const isInitialized = await scannerService.initialize()
    if (!isInitialized) {
      return NextResponse.json(
        { 
          error: 'Failed to initialize palm scanner',
          device_info: null,
          status: 'error'
        },
        { status: 503 }
      )
    }
    
    // Get device information
    const deviceInfo = await scannerService.getDeviceInfo()
    const isReady = await scannerService.isDeviceReady()
    
    return NextResponse.json({
      success: true,
      data: {
        ...deviceInfo,
        is_ready: isReady,
        connection_status: isReady ? 'connected' : 'disconnected',
        sdk_version: '1.3.41'
      }
    })
  } catch (error) {
    console.error('❌ Error getting device info:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get device information',
        details: error instanceof Error ? error.message : 'Unknown error',
        device_info: null,
        status: 'error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Palm scanner device management request...')
    
    const body = await request.json()
    const { action } = body
    const scannerService = getPalmScannerService()
    
    switch (action) {
      case 'initialize':
        console.log('Initializing palm scanner...')
        // Clean up first to ensure fresh start
        await scannerService.cleanup()
        
        const initialized = await scannerService.initialize()
        if (initialized) {
          const deviceInfo = await scannerService.getDeviceInfo()
          return NextResponse.json({
            success: true,
            message: 'Palm scanner initialized successfully',
            device_info: deviceInfo
          })
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to initialize palm scanner'
            },
            { status: 503 }
          )
        }
        
      case 'cleanup':
        console.log('Cleaning up palm scanner...')
        await scannerService.cleanup()
        return NextResponse.json({
          success: true,
          message: 'Palm scanner cleanup completed'
        })
        
      case 'status':
        console.log('Checking palm scanner status...')
        const isReady = await scannerService.isDeviceReady()
        const deviceInfo = await scannerService.getDeviceInfo()
        return NextResponse.json({
          success: true,
          is_ready: isReady,
          device_info: deviceInfo
        })
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "initialize", "cleanup", or "status"' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Error in device management:', error)
    return NextResponse.json(
      { 
        error: 'Device management failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
