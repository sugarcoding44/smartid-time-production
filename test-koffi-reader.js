/**
 * Test Koffi RFID Reader
 * Tests the Koffi-based native RFID implementation
 */

const { KoffiRFIDReader } = require('./src/lib/rfid-native-koffi.js')
const fs = require('fs')
const path = require('path')

console.log('🔧 Testing Koffi RFID Reader...\n')

// 1. Test basic Koffi functionality
console.log('🧪 Testing basic Koffi functionality...')
try {
  const koffi = require('koffi')
  
  // Test with kernel32.dll
  const kernel32 = koffi.load('kernel32.dll')
  const GetTickCount = kernel32.func('GetTickCount', 'uint32', [])
  const tickCount = GetTickCount()
  
  console.log(`✅ Koffi working! System uptime: ${tickCount}ms\n`)
  
} catch (error) {
  console.error('❌ Koffi test failed:', error.message)
  process.exit(1)
}

// 2. Check if RFID DLL exists
console.log('🔍 Checking for RFID1356.dll...')
const dllPath = path.join(
  'C:', 'Users', 'user', 'Downloads', 'NTAG424_SDK',
  'NTAG424  Tag SDK and demo',
  'COMM-demo software 250116',
  'COMM-demo software 250116',
  'RFID1356.dll'
)

if (!fs.existsSync(dllPath)) {
  console.error('❌ RFID1356.dll not found at:', dllPath)
  console.log('💡 Please verify the SDK extraction path')
  process.exit(1)
}

console.log('✅ RFID1356.dll found')

// 3. Try to load the DLL with Koffi
console.log('🔧 Testing RFID DLL loading with Koffi...')
try {
  const koffi = require('koffi')
  const rfidLib = koffi.load(dllPath)
  
  console.log('✅ RFID1356.dll loaded successfully with Koffi')
  
  // Try to bind some functions
  try {
    const PiccReset = rfidLib.func('PiccReset', 'int', ['uint8'])
    console.log('✅ PiccReset function bound successfully')
    
    const openhid = rfidLib.func('openhid', 'int', ['uint16', 'uint16', 'uint8'])
    console.log('✅ openhid function bound successfully')
    
    const PiccActivateA = rfidLib.func('PiccActivateA', 'int', [
      'uint8', 'uint8',
      koffi.pointer('uint8'),
      koffi.pointer('uint8'),
      koffi.pointer('uint8'),
      koffi.pointer('uint8')
    ])
    console.log('✅ PiccActivateA function bound successfully')
    
  } catch (funcError) {
    console.warn('⚠️ Some functions could not be bound:', funcError.message)
  }
  
} catch (dllError) {
  console.error('❌ Failed to load RFID DLL with Koffi:', dllError.message)
  process.exit(1)
}

// 4. Test the KoffiRFIDReader class
console.log('\n🧪 Testing KoffiRFIDReader class...')
try {
  const reader = new KoffiRFIDReader()
  
  console.log('✅ KoffiRFIDReader instantiated')
  console.log('Initial status:', reader.getStatus())
  
  // Test event handling
  reader.on('connected', () => console.log('📡 Event: Reader connected'))
  reader.on('disconnected', () => console.log('📡 Event: Reader disconnected'))
  reader.on('error', (error) => console.log('⚠️ Event: Error -', error.message))
  reader.on('cardDetected', (card) => {
    console.log('🎯 Event: Card detected!')
    console.log('  UID:', card.uid)
    console.log('  Type:', card.type)
    console.log('  ATQ:', card.atq)
    console.log('  SAK:', card.sak)
  })
  
  console.log('✅ Event handlers registered')
  
  // Test initialization
  console.log('\n🔧 Testing reader initialization...')
  reader.initialize().then(initResult => {
    if (initResult) {
      console.log('✅ Reader initialized successfully')
      
      // If you want to test connection (requires hardware):
      // Uncomment the next lines if your XT-N424 WR is connected
      /*
      console.log('\n🔌 Testing connection (requires XT-N424 WR hardware)...')
      reader.connect().then(connectResult => {
        if (connectResult) {
          console.log('✅ Reader connected! You can now test card detection.')
          console.log('💡 Place a card near the reader to test detection')
          
          // Start polling for a short time
          reader.startPolling(500)
          
          setTimeout(() => {
            reader.stopPolling()
            reader.disconnect()
            process.exit(0)
          }, 10000)
        } else {
          console.log('❌ Connection failed - reader may not be connected')
          process.exit(1)
        }
      })
      */
      
    } else {
      console.log('❌ Reader initialization failed')
      process.exit(1)
    }
  })
  
} catch (classError) {
  console.error('❌ KoffiRFIDReader test failed:', classError.message)
  process.exit(1)
}

console.log('\n🎉 Koffi RFID Reader test completed!')
console.log('\n💡 Next steps:')
console.log('1. Connect your XT-N424 WR reader via USB')
console.log('2. Uncomment the connection test code above')
console.log('3. Run this script again to test with real hardware')
console.log('4. Use: node rfid-test-koffi-hardware.js (create this for full hardware test)')