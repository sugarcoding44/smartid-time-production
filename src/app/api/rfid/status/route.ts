import { NextResponse } from 'next/server'

// CORS handler
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

export async function GET() {
  try {
    console.log('🔍 Checking RFID reader status...')
    
    // Check if we're on Windows
    if (process.platform !== 'win32') {
      return NextResponse.json({
        connected: false,
        error: 'Platform not supported',
        message: 'RFID scanning is only supported on Windows',
        reader_type: 'SmartID-Card-Reader',
        status: 'unavailable'
      }, { headers: corsHeaders() })
    }

    try {
      console.log('🔧 Testing Koffi RFID connection...')
      const koffi = require('koffi')
      const path = require('path')
      
      // DLL path
      const dllPath = path.join(
        'C:', 'Users', 'user', 'Downloads', 'NTAG424_SDK',
        'NTAG424  Tag SDK and demo',
        'COMM-demo software 250116',
        'COMM-demo software 250116',
        'RFID1356.dll'
      )
      
      // Check if DLL exists
      const fs = require('fs')
      if (!fs.existsSync(dllPath)) {
        return NextResponse.json({
          connected: false,
          error: 'DLL not found',
          message: 'RFID1356.dll not found at expected location',
          reader_type: 'SmartID-Card-Reader',
          status: 'dll_missing',
          dll_path: dllPath
        }, { headers: corsHeaders() })
      }
      
      // Load DLL
      console.log('📖 Loading DLL:', dllPath)
      const rfidLib = koffi.load(dllPath)
      
      // Define functions
      const openhid = rfidLib.func('openhid', 'int', ['uint16', 'uint16', 'uint8'])
      const closehid = rfidLib.func('closehid', 'int', [])
      
      // Test connection
      console.log('🔌 Testing HID connection...')
      const vendor_id = 0x0483
      const product_id = 0x5750
      const hidResult = openhid(vendor_id, product_id, 0)
      
      if (hidResult === 0) {
        // Connection successful - close it immediately
        closehid()
        
        console.log('✅ RFID reader connected successfully')
        return NextResponse.json({
          connected: true,
          reader_type: 'SmartID-Card-Reader',
          status: 'ready',
          connection_type: 'HID',
          vendor_id: '0x0483',
          product_id: '0x5750',
          message: 'RFID reader is connected and ready'
        }, { headers: corsHeaders() })
      } else {
        console.log('❌ HID connection failed:', hidResult)
        return NextResponse.json({
          connected: false,
          error: 'Connection failed',
          message: 'Unable to connect to RFID reader. Please check USB connection.',
          reader_type: 'XT-N424-WR',
          status: 'disconnected',
          hid_error_code: hidResult
        }, { headers: corsHeaders() })
      }
      
    } catch (koffiError: any) {
      console.error('🚨 Koffi error:', koffiError.message)
      return NextResponse.json({
        connected: false,
        error: 'Koffi error',
        message: 'Failed to initialize RFID library: ' + koffiError.message,
        reader_type: 'XT-N424-WR',
        status: 'error'
      }, { headers: corsHeaders() })
    }
    
  } catch (error: any) {
    console.error('❌ Status check failed:', error)
    return NextResponse.json({
      connected: false,
      error: 'Status check failed',
      message: 'Unable to check reader status: ' + error.message,
      reader_type: 'XT-N424-WR',
      status: 'unknown'
    }, { 
      status: 500, 
      headers: corsHeaders() 
    })
  }
}