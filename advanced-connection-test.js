/**
 * Advanced XT-N424 WR Connection Test
 * Tests multiple vendor/product ID combinations and troubleshoots connection issues
 */

const { KoffiRFIDReader } = require('./src/lib/rfid-native-koffi.js')

console.log('🔧 Advanced XT-N424 WR Connection Test\n')

async function testConnection() {
  // Check if COMM.exe is running
  const { execSync } = require('child_process')
  try {
    const processes = execSync('tasklist | findstr COMM.exe', { encoding: 'utf8' })
    if (processes.includes('COMM.exe')) {
      console.log('⚠️ WARNING: COMM.exe is running!')
      console.log('   This will prevent our native connection from working.')
      console.log('   Please close COMM.exe and try again.\n')
      console.log('💡 To close COMM.exe:')
      console.log('   1. Close the COMM application window')
      console.log('   2. Or run: taskkill /F /IM COMM.exe')
      console.log('   3. Then run this test again\n')
    }
  } catch (error) {
    console.log('✅ No COMM.exe process detected\n')
  }

  const reader = new KoffiRFIDReader()
  
  console.log('📡 Initializing RFID reader...')
  const initResult = await reader.initialize()
  
  if (!initResult) {
    console.error('❌ Failed to initialize reader')
    return
  }
  
  console.log('✅ Reader initialized\n')

  // Test different vendor/product ID combinations that might work with XT-N424 WR
  const testCombinations = [
    // X-Telcom official IDs
    { vendor: 0x072F, product: 0x2200, name: 'X-Telcom XT-N424 WR (Standard)' },
    { vendor: 0x072F, product: 0x2100, name: 'X-Telcom XT-N424 WR (Alt 1)' },
    { vendor: 0x072F, product: 0x2000, name: 'X-Telcom XT-N424 WR (Alt 2)' },
    { vendor: 0x072F, product: 0x0001, name: 'X-Telcom Generic' },
    
    // Common RFID reader vendor IDs
    { vendor: 0x0BDA, product: 0x0001, name: 'Realtek-based RFID Reader' },
    { vendor: 0x1FC9, product: 0x0001, name: 'NXP-based RFID Reader' },
    { vendor: 0x04E6, product: 0x0001, name: 'SCM Microsystems' },
    { vendor: 0x076B, product: 0x0001, name: 'OmniKey Reader' },
    
    // Try some generic HID device combinations
    { vendor: 0x0483, product: 0x5750, name: 'ST Microelectronics HID' },
    { vendor: 0x2EA8, product: 0x2203, name: 'Generic HID Device' },
  ]

  console.log('🔍 Testing HID connections with different vendor/product IDs...\n')
  
  let connectionSuccess = false
  let successfulCombo = null

  for (const combo of testCombinations) {
    try {
      console.log(`Testing ${combo.name}...`)
      console.log(`  VID: 0x${combo.vendor.toString(16).padStart(4, '0').toUpperCase()}, PID: 0x${combo.product.toString(16).padStart(4, '0').toUpperCase()}`)
      
      const result = reader.openhid(combo.vendor, combo.product, 0)
      
      if (result === 0) {
        console.log(`  ✅ SUCCESS! Connected via HID`)
        connectionSuccess = true
        successfulCombo = combo
        
        // Test basic communication
        try {
          const resetResult = reader.PiccReset(1)
          console.log(`  📡 PICC Reset result: ${resetResult}`)
        } catch (resetError) {
          console.log(`  ⚠️ PICC Reset failed: ${resetError.message}`)
        }
        
        // Close connection for next test
        reader.closehid()
        break
      } else {
        console.log(`  ❌ Failed (error ${result})`)
      }
    } catch (error) {
      console.log(`  ❌ Exception: ${error.message}`)
    }
  }

  if (connectionSuccess) {
    console.log(`\n🎉 SUCCESS! Found working connection:`)
    console.log(`   Device: ${successfulCombo.name}`)
    console.log(`   VID: 0x${successfulCombo.vendor.toString(16).padStart(4, '0').toUpperCase()}`)
    console.log(`   PID: 0x${successfulCombo.product.toString(16).padStart(4, '0').toUpperCase()}`)
    
    console.log('\n🔧 Updating KoffiRFIDReader with correct IDs...')
    
    // Test full connection with the working IDs
    try {
      const workingResult = reader.openhid(successfulCombo.vendor, successfulCombo.product, 0)
      if (workingResult === 0) {
        reader.connectionType = 'HID'
        reader.isConnected = true
        
        console.log('✅ Full connection established!')
        console.log('📊 Reader Status:', {
          connected: reader.isConnected,
          connectionType: reader.connectionType,
          dllLoaded: !!reader.rfidLib
        })
        
        // Test card detection (without polling)
        console.log('\n🧪 Testing single card detection...')
        console.log('💡 If you have a card, place it on the reader now...')
        
        setTimeout(() => {
          try {
            reader.pollForCard()
            setTimeout(() => {
              console.log('\n✅ Card detection test completed')
              console.log('🚀 Your reader is ready for integration!')
              
              reader.closehid()
              process.exit(0)
            }, 2000)
          } catch (pollError) {
            console.log('⚠️ Card polling test failed:', pollError.message)
            reader.closehid()
            process.exit(0)
          }
        }, 3000)
        
      }
    } catch (testError) {
      console.log('❌ Full connection test failed:', testError.message)
    }
    
  } else {
    console.log('\n❌ No successful HID connections found')
    console.log('\n💡 Possible solutions:')
    console.log('   1. Make sure COMM.exe is completely closed')
    console.log('   2. Try a different USB port')
    console.log('   3. Check Device Manager for unknown devices')
    console.log('   4. The reader might need specific drivers')
    console.log('   5. Try running as Administrator')
    
    // Test PC/SC as fallback
    console.log('\n🔄 Testing PC/SC connection as fallback...')
    const pcscNames = [
      'X-Telcom XT-N424 WR',
      'ACS ACR122U PICC Interface', 
      'ACS ACR122U',
      'Microsoft Usbccid Smartcard Reader',
      'Generic CCID Reader'
    ]
    
    for (const name of pcscNames) {
      try {
        console.log(`Testing PC/SC: ${name}...`)
        const pcscResult = reader.openpcsc(name.length, name)
        if (pcscResult === 0) {
          console.log(`✅ PC/SC SUCCESS with "${name}"`)
          reader.closepcsc()
          connectionSuccess = true
          break
        } else {
          console.log(`❌ Failed (error ${pcscResult})`)
        }
      } catch (error) {
        console.log(`❌ Exception: ${error.message}`)
      }
    }
    
    if (!connectionSuccess) {
      console.log('\n❌ All connection attempts failed')
      console.log('📞 Next steps:')
      console.log('   - Contact X-Telcom support for specific driver requirements')
      console.log('   - Check if the reader needs to be in a specific mode')
      console.log('   - Verify the reader is working with the original COMM software')
    }
  }
}

testConnection().catch(error => {
  console.error('❌ Test failed:', error.message)
  process.exit(1)
})