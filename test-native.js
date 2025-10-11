/**
 * Test Native Module Installation
 * Verifies Visual Studio Build Tools installation and FFI modules
 */

const { spawn, execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔧 Testing Native Module Installation...\n')

// 1. Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json')
if (!fs.existsSync(packageJsonPath)) {
  console.log('❌ package.json not found. Initializing npm project...')
  try {
    execSync('npm init -y', { stdio: 'inherit', cwd: __dirname })
    console.log('✅ npm project initialized\n')
  } catch (error) {
    console.error('❌ Failed to initialize npm project:', error.message)
    process.exit(1)
  }
} else {
  console.log('✅ package.json exists\n')
}

// 2. Try to install ffi-napi and ref-napi
console.log('📦 Installing native modules...')
try {
  console.log('Installing ffi-napi...')
  execSync('npm install ffi-napi', { 
    stdio: 'inherit', 
    cwd: __dirname,
    timeout: 300000 // 5 minutes
  })
  
  console.log('Installing ref-napi...')
  execSync('npm install ref-napi', { 
    stdio: 'inherit', 
    cwd: __dirname,
    timeout: 300000 // 5 minutes
  })
  
  console.log('✅ Native modules installed successfully!\n')
  
} catch (error) {
  console.error('❌ Failed to install native modules:')
  console.error(error.message)
  console.log('\n🔍 This usually means:')
  console.log('   - Visual Studio Build Tools not installed')
  console.log('   - Python not found')
  console.log('   - Windows SDK missing')
  console.log('\n💡 Install Visual Studio Build Tools with:')
  console.log('   - Desktop development with C++')
  console.log('   - Windows 10/11 SDK')
  process.exit(1)
}

// 3. Test loading the modules
console.log('🧪 Testing module loading...')
try {
  const ffi = require('ffi-napi')
  const ref = require('ref-napi')
  
  console.log('✅ ffi-napi loaded successfully')
  console.log('✅ ref-napi loaded successfully')
  
  // Test basic FFI functionality
  console.log('\n🔍 Testing basic FFI functionality...')
  
  // Try to load kernel32.dll (should exist on all Windows systems)
  const kernel32 = ffi.Library('kernel32.dll', {
    'GetTickCount': ['uint32', []]
  })
  
  const tickCount = kernel32.GetTickCount()
  console.log(`✅ FFI working! System uptime: ${tickCount}ms`)
  
} catch (error) {
  console.error('❌ Failed to load/test native modules:')
  console.error(error.message)
  process.exit(1)
}

// 4. Check if RFID DLL exists
console.log('\n🔍 Checking for RFID1356.dll...')
const dllPath = path.join(
  'C:', 'Users', 'user', 'Downloads', 'NTAG424_SDK',
  'NTAG424  Tag SDK and demo',
  'ntag424 function 1 SDK 20240722',
  'RFID1356.dll'
)

if (fs.existsSync(dllPath)) {
  console.log('✅ RFID1356.dll found at:', dllPath)
  
  // Try to get DLL info
  try {
    const stats = fs.statSync(dllPath)
    console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`)
    console.log(`   Modified: ${stats.mtime.toISOString()}`)
  } catch (error) {
    console.log('   Could not read DLL stats')
  }
} else {
  console.log('❌ RFID1356.dll not found at expected location:')
  console.log('   ', dllPath)
  console.log('\n💡 Please verify the SDK extraction path')
}

// 5. Test the native RFID class (without hardware)
console.log('\n🧪 Testing NativeRFIDReader class...')
try {
  const { NativeRFIDReader } = require('./src/lib/rfid-native.js')
  
  const reader = new NativeRFIDReader()
  
  console.log('✅ NativeRFIDReader class loaded')
  console.log('   Status:', reader.getStatus())
  
  // Test event handling
  reader.on('connected', () => console.log('📡 Event: Reader connected'))
  reader.on('error', (error) => console.log('⚠️ Event: Error -', error.message))
  
  console.log('✅ Event system working')
  
} catch (error) {
  console.error('❌ Failed to load NativeRFIDReader:')
  console.error(error.message)
}

console.log('\n🎉 Native module test completed!')
console.log('\nNext steps:')
console.log('1. Connect your XT-N424 WR reader')
console.log('2. Run: node rfid-test-native.js')
console.log('3. Test card detection')