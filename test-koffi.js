/**
 * Alternative Native Module Test using Koffi
 * Tests a different FFI library that may be more compatible
 */

const { spawn, execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔧 Testing Koffi FFI Library...\n')

// Try installing koffi instead
console.log('📦 Installing koffi (alternative to ffi-napi)...')
try {
  execSync('npm install koffi', { 
    stdio: 'inherit', 
    cwd: __dirname,
    timeout: 300000 // 5 minutes
  })
  
  console.log('✅ Koffi installed successfully!\n')
  
} catch (error) {
  console.error('❌ Failed to install koffi:')
  console.error(error.message)
  process.exit(1)
}

// Test koffi functionality
console.log('🧪 Testing koffi...')
try {
  const koffi = require('koffi')
  
  console.log('✅ Koffi loaded successfully')
  
  // Test basic FFI functionality with kernel32.dll
  console.log('🔍 Testing basic FFI functionality...')
  
  const lib = koffi.load('kernel32.dll')
  const GetTickCount = lib.func('GetTickCount', 'uint32', [])
  
  const tickCount = GetTickCount()
  console.log(`✅ FFI working! System uptime: ${tickCount}ms`)
  
} catch (error) {
  console.error('❌ Failed to load/test koffi:')
  console.error(error.message)
  process.exit(1)
}

// Check if RFID DLL exists
console.log('\n🔍 Checking for RFID1356.dll...')
const dllPath = path.join(
  'C:', 'Users', 'user', 'Downloads', 'NTAG424_SDK',
  'NTAG424  Tag SDK and demo',
  'ntag424 function 1 SDK 20240722',
  'RFID1356.dll'
)

if (fs.existsSync(dllPath)) {
  console.log('✅ RFID1356.dll found at:', dllPath)
  
  // Try to load the DLL with koffi
  console.log('🔍 Testing RFID DLL loading...')
  try {
    const koffi = require('koffi')
    const rfidLib = koffi.load(dllPath)
    
    console.log('✅ RFID1356.dll loaded successfully with koffi')
    
    // Try to call a simple function
    try {
      const PiccReset = rfidLib.func('PiccReset', 'int', ['uint8'])
      console.log('✅ Found PiccReset function')
    } catch (funcError) {
      console.log('⚠️ Could not bind PiccReset function:', funcError.message)
    }
    
  } catch (dllError) {
    console.error('❌ Failed to load RFID DLL with koffi:', dllError.message)
  }
  
} else {
  console.log('❌ RFID1356.dll not found at expected location')
}

console.log('\n🎉 Koffi test completed!')
console.log('\nNext steps:')
console.log('1. Connect your XT-N424 WR reader')
console.log('2. Create updated native reader with koffi')
console.log('3. Test card detection')