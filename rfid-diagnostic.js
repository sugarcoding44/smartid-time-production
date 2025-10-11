/**
 * RFID Reader Diagnostic Tool
 * Helps diagnose XT-N424 WR reader connection issues
 */

const { KoffiRFIDReader } = require('./src/lib/rfid-native-koffi.js')
const { execSync } = require('child_process')

console.log('🔧 XT-N424 WR RFID Reader Diagnostic Tool\n')

async function runDiagnostics() {
  // 1. Check if DLL exists and loads
  console.log('📋 1. Checking RFID1356.dll...')
  let reader
  try {
    reader = new KoffiRFIDReader()
    const initResult = await reader.initialize()
    
    if (initResult) {
      console.log('✅ RFID1356.dll loaded successfully')
    } else {
      console.log('❌ Failed to load RFID1356.dll')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ DLL loading error:', error.message)
    process.exit(1)
  }

  // 2. Check USB devices
  console.log('\n📋 2. Scanning USB devices...')
  let usbDevices
  try {
  const usbDevices = execSync('powershell -Command "Get-PnpDevice -PresentOnly | Where-Object { $_.Class -eq \'USB\' -or $_.Class -eq \'HIDClass\' } | Select-Object FriendlyName, InstanceId, Status | Format-Table -AutoSize"', { encoding: 'utf8' })
  
  console.log('Current USB/HID devices:')
  console.log(usbDevices)
  
  // Look for potential X-Telcom devices
  if (usbDevices.toLowerCase().includes('072f') || 
      usbDevices.toLowerCase().includes('x-telcom') ||
      usbDevices.toLowerCase().includes('rfid')) {
    console.log('✅ Potential X-Telcom/RFID device found!')
  } else {
    console.log('⚠️ No obvious X-Telcom/RFID devices found')
    console.log('💡 Connect your XT-N424 WR reader and run this script again')
  }
} catch (error) {
  console.warn('⚠️ Could not scan USB devices:', error.message)
}

// 3. Check COMM.exe process
console.log('\n📋 3. Checking for conflicting processes...')
try {
  const processes = execSync('tasklist /FI "IMAGENAME eq COMM.exe"', { encoding: 'utf8' })
  
  if (processes.includes('COMM.exe')) {
    console.log('⚠️ COMM.exe is running - this may conflict with our reader')
    console.log('💡 Close COMM.exe before testing the native integration')
  } else {
    console.log('✅ No conflicting COMM.exe process found')
  }
} catch (error) {
  console.log('✅ No conflicting processes detected')
}

  // 4. Test different HID vendor/product ID combinations
  console.log('\n📋 4. Testing different HID connection parameters...')

// Common X-Telcom vendor/product ID combinations
const testCombinations = [
  { vendor: 0x072F, product: 0x2200, name: 'X-Telcom XT-N424 WR (Primary)' },
  { vendor: 0x072F, product: 0x2100, name: 'X-Telcom XT-N424 WR (Alt 1)' },
  { vendor: 0x072F, product: 0x2000, name: 'X-Telcom XT-N424 WR (Alt 2)' },
  { vendor: 0x072F, product: 0x0001, name: 'X-Telcom Generic (Alt 3)' }
]

for (const combo of testCombinations) {
  try {
    console.log(`  Testing ${combo.name}...`)
    const result = reader.openhid(combo.vendor, combo.product, 0)
    
    if (result === 0) {
      console.log(`  ✅ SUCCESS: Connected via HID with VID:${combo.vendor.toString(16).padStart(4,'0').toUpperCase()}, PID:${combo.product.toString(16).padStart(4,'0').toUpperCase()}`)
      reader.closehid()
      break
    } else {
      console.log(`  ❌ Failed (error ${result})`)
    }
  } catch (error) {
    console.log(`  ❌ Exception: ${error.message}`)
  }
}

// 5. Test PC/SC connection with different reader names
console.log('\n📋 5. Testing PC/SC connections...')
const pcscReaderNames = [
  'ACS ACR122U PICC Interface',
  'ACS ACR122U',
  'X-Telcom XT-N424 WR',
  'Microsoft Usbccid Smartcard Reader',
  'Generic CCID Reader'
]

for (const readerName of pcscReaderNames) {
  try {
    console.log(`  Testing PC/SC: ${readerName}...`)
    const result = reader.openpcsc(readerName.length, readerName)
    
    if (result === 0) {
      console.log(`  ✅ SUCCESS: Connected via PC/SC with "${readerName}"`)
      reader.closepcsc()
      break
    } else {
      console.log(`  ❌ Failed (error ${result})`)
    }
  } catch (error) {
    console.log(`  ❌ Exception: ${error.message}`)
  }
}

// 6. Instructions for user
console.log('\n📋 6. Next Steps:')
console.log('─'.repeat(60))

if (!usbDevices.toLowerCase().includes('072f')) {
  console.log('🔌 CONNECT YOUR XT-N424 WR READER:')
  console.log('   1. Connect the XT-N424 WR via USB cable')
  console.log('   2. Wait for Windows to detect the device')
  console.log('   3. Check Device Manager for new USB devices')
  console.log('   4. Run this diagnostic script again')
  console.log('')
}

console.log('📖 IF READER IS CONNECTED BUT NOT DETECTED:')
console.log('   1. Try a different USB port')
console.log('   2. Check the USB cable')
console.log('   3. Install X-Telcom drivers if available')
console.log('   4. Check Device Manager for unknown devices')
console.log('')

console.log('✅ IF CONNECTION SUCCEEDED:')
console.log('   1. Run: node rfid-test-koffi-hardware.js')
console.log('   2. Select option 1 to start polling')
console.log('   3. Place cards near the reader to test detection')
console.log('')

console.log('🎯 READER DETECTED SUCCESSFULLY?')
console.log('   Your reader is ready for integration with SmartID Time!')

  console.log('\n🎉 Diagnostic completed!')
}

// Run the diagnostics
runDiagnostics().catch(error => {
  console.error('❌ Diagnostic failed:', error.message)
  process.exit(1)
})
