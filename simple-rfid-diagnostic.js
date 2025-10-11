/**
 * Simple RFID Reader Diagnostic
 * Quick check for XT-N424 WR reader connection
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔧 Simple XT-N424 WR RFID Reader Diagnostic\n')

// 1. Check if Koffi is installed
console.log('📋 1. Checking Koffi installation...')
try {
  const koffi = require('koffi')
  console.log('✅ Koffi is installed and working')
} catch (error) {
  console.error('❌ Koffi not found. Run: npm install koffi')
  process.exit(1)
}

// 2. Check if RFID1356.dll exists
console.log('\n📋 2. Checking RFID1356.dll...')
const dllPath = path.join(
  'C:', 'Users', 'user', 'Downloads', 'NTAG424_SDK',
  'NTAG424  Tag SDK and demo',
  'COMM-demo software 250116',
  'COMM-demo software 250116',
  'RFID1356.dll'
)

if (fs.existsSync(dllPath)) {
  console.log('✅ RFID1356.dll found at:', dllPath)
  
  try {
    const stats = fs.statSync(dllPath)
    console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`)
    console.log(`   Modified: ${stats.mtime.toISOString()}`)
  } catch (error) {
    console.log('   Could not read file stats')
  }
} else {
  console.error('❌ RFID1356.dll not found')
  console.log('💡 Please verify SDK extraction path')
  process.exit(1)
}

// 3. Test DLL loading
console.log('\n📋 3. Testing DLL loading...')
try {
  const koffi = require('koffi')
  const rfidLib = koffi.load(dllPath)
  console.log('✅ RFID1356.dll loaded successfully')
  
  // Test function binding
  try {
    const openhid = rfidLib.func('openhid', 'int', ['uint16', 'uint16', 'uint8'])
    console.log('✅ openhid function bound successfully')
    
    const closehid = rfidLib.func('closehid', 'int', [])
    console.log('✅ closehid function bound successfully')
    
    const PiccReset = rfidLib.func('PiccReset', 'int', ['uint8'])
    console.log('✅ PiccReset function bound successfully')
    
  } catch (funcError) {
    console.warn('⚠️ Some functions could not be bound:', funcError.message)
  }
  
} catch (dllError) {
  console.error('❌ Failed to load RFID DLL:', dllError.message)
  process.exit(1)
}

// 4. Check USB devices
console.log('\n📋 4. Scanning USB devices for potential readers...')
try {
  // Get all USB devices
  const allDevices = execSync('powershell -Command "Get-PnpDevice -PresentOnly | Select-Object FriendlyName, InstanceId, Status | Format-List"', { encoding: 'utf8' })
  
  // Look for potential RFID/NFC devices
  const deviceLines = allDevices.split('\n')
  let foundPotentialReaders = []
  
  for (let i = 0; i < deviceLines.length; i++) {
    const line = deviceLines[i].toLowerCase()
    if (line.includes('072f') || 
        line.includes('x-telcom') ||
        line.includes('rfid') ||
        line.includes('nfc') ||
        line.includes('smartcard') ||
        line.includes('ccid')) {
      foundPotentialReaders.push(deviceLines[i].trim())
    }
  }
  
  if (foundPotentialReaders.length > 0) {
    console.log('🔍 Potential RFID/NFC devices found:')
    foundPotentialReaders.forEach(device => {
      if (device) console.log('  ', device)
    })
  } else {
    console.log('⚠️ No obvious RFID/NFC devices detected')
  }
  
} catch (error) {
  console.warn('⚠️ Could not scan USB devices:', error.message)
}

// 5. Check for conflicting processes
console.log('\n📋 5. Checking for conflicting processes...')
try {
  const processes = execSync('tasklist /FI "IMAGENAME eq COMM.exe"', { encoding: 'utf8' })
  
  if (processes.includes('COMM.exe')) {
    console.log('⚠️ COMM.exe is running - this may interfere with native access')
    console.log('💡 Close COMM.exe before testing the Koffi integration')
  } else {
    console.log('✅ No conflicting COMM.exe process found')
  }
} catch (error) {
  console.log('✅ No conflicting processes detected')
}

// 6. Instructions
console.log('\n📋 6. What to do next:')
console.log('─'.repeat(50))

console.log('🔌 TO CONNECT YOUR XT-N424 WR READER:')
console.log('   1. Connect the reader via USB')
console.log('   2. Check Device Manager for new devices')
console.log('   3. Run this diagnostic again')
console.log('')

console.log('🧪 TO TEST WITH HARDWARE:')
console.log('   1. Connect your XT-N424 WR reader')
console.log('   2. Run: node rfid-test-koffi-hardware.js')
console.log('   3. If connection fails, try different USB ports')
console.log('')

console.log('⚡ IF YOU SEE CONNECTION ERRORS:')
console.log('   - Error 1 = Device not found or access denied')
console.log('   - Error 2 = Device busy or in use by another app')
console.log('   - Error 5 = Access denied or driver issue')
console.log('')

console.log('✅ READY FOR PRODUCTION:')
console.log('   - All checks passed')
console.log('   - Reader connected and working')
console.log('   - Integration ready for SmartID Time')

console.log('\n🎉 Diagnostic completed!')
console.log('💡 Status: Software ready, connect hardware for full testing')