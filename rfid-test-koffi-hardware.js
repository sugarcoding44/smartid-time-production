/**
 * Koffi RFID Reader Hardware Test
 * Tests the XT-N424 WR reader with real hardware using Koffi
 */

const { KoffiRFIDReader } = require('./src/lib/rfid-native-koffi.js')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

class KoffiRFIDTester {
  constructor() {
    this.reader = null
  }

  async start() {
    console.log('🔧 XT-N424 WR Koffi RFID Reader Hardware Test\n')
    
    try {
      this.reader = new KoffiRFIDReader()
      
      // Set up event handlers
      this.setupEventHandlers()
      
      // Initialize reader
      console.log('📡 Initializing Koffi RFID reader...')
      const initResult = await this.reader.initialize()
      
      if (!initResult) {
        console.error('❌ Failed to initialize RFID reader')
        console.log('\n💡 Make sure:')
        console.log('   - XT-N424 WR reader is connected via USB')
        console.log('   - RFID1356.dll is in the correct location')
        console.log('   - Koffi package is installed')
        process.exit(1)
      }
      
      console.log('✅ RFID reader initialized')
      
      // Connect to reader
      console.log('🔌 Connecting to XT-N424 WR...')
      const connectResult = await this.reader.connect()
      
      if (!connectResult) {
        console.error('❌ Failed to connect to reader')
        console.log('\\n💡 Check:')
        console.log('   - Reader is powered on and connected via USB')
        console.log('   - USB connection is stable')
        console.log('   - No other software is using the reader (close COMM.exe if running)')
        console.log('   - Device Manager shows the reader properly')
        process.exit(1)
      }
      
      console.log('✅ Connected to XT-N424 WR reader')
      console.log('📊 Reader status:', this.reader.getStatus())
      
      // Show menu
      this.showMenu()
      
    } catch (error) {
      console.error('❌ Error during initialization:', error.message)
      console.error('Stack:', error.stack)
      process.exit(1)
    }
  }

  setupEventHandlers() {
    this.reader.on('connected', () => {
      console.log('📡 Reader connected successfully')
    })
    
    this.reader.on('disconnected', () => {
      console.log('📡 Reader disconnected')
    })
    
    this.reader.on('cardDetected', (card) => {
      console.log('\\n🎯 CARD DETECTED!')
      console.log('   UID:', card.uid)
      console.log('   Type:', card.type)
      console.log('   UID Length:', card.uidLength, 'bytes')
      console.log('   ATQ:', card.atq)
      console.log('   SAK:', card.sak)
      console.log('   Time:', new Date(card.timestamp).toLocaleString())
      
      // Beep sound (if terminal supports it)
      process.stdout.write('\\x07')
      
      this.showCardMenu(card)
    })
    
    this.reader.on('cardRemoved', () => {
      console.log('\\n📤 Card removed')
      this.showMenu()
    })
    
    this.reader.on('error', (error) => {
      console.error('\\n⚠️ Reader error:', error.message)
      this.showMenu()
    })
  }

  showMenu() {
    console.log('\\n' + '='.repeat(60))
    console.log('📋 Koffi RFID Reader Commands:')
    console.log('   1) Start polling for cards')
    console.log('   2) Stop polling') 
    console.log('   3) Check reader status')
    console.log('   4) Test single card detection')
    console.log('   5) Disconnect and exit')
    console.log('='.repeat(60))
    
    rl.question('Enter command (1-5): ', (answer) => {
      this.handleMenuCommand(answer.trim())
    })
  }

  showCardMenu(card) {
    console.log('\\n' + '='.repeat(60))
    console.log('🎯 Card Options:')
    console.log('   1) Continue polling')
    console.log('   2) Save card info to JSON file')
    console.log('   3) Test with Supabase integration (simulate)')
    console.log('   4) Show detailed card information')
    console.log('   5) Stop polling and return to main menu')
    console.log('='.repeat(60))
    
    rl.question('Enter option (1-5): ', (answer) => {
      this.handleCardCommand(answer.trim(), card)
    })
  }

  handleMenuCommand(command) {
    switch (command) {
      case '1':
        console.log('\\n🔄 Starting card polling...')
        console.log('💡 Place a card near the reader to detect it')
        console.log('💡 Remove and place cards to test detection')
        try {
          this.reader.startPolling(300) // Poll every 300ms
        } catch (error) {
          console.error('❌ Failed to start polling:', error.message)
          this.showMenu()
        }
        break
        
      case '2':
        console.log('\\n⏸️ Stopping polling...')
        this.reader.stopPolling()
        this.showMenu()
        break
        
      case '3':
        console.log('\\n📊 Reader Status:')
        const status = this.reader.getStatus()
        console.log('   Connected:', status.connected ? '✅' : '❌')
        console.log('   Polling:', status.polling ? '✅' : '❌')
        console.log('   DLL Loaded:', status.dllLoaded ? '✅' : '❌')
        console.log('   Connection Type:', status.connectionType || 'None')
        this.showMenu()
        break
        
      case '4':
        console.log('\\n🎯 Testing single card detection...')
        console.log('💡 Place a card near the reader now')
        
        // Try single detection
        try {
          this.reader.pollForCard()
          setTimeout(() => {
            console.log('Single detection test completed')
            this.showMenu()
          }, 1000)
        } catch (error) {
          console.error('❌ Single detection failed:', error.message)
          this.showMenu()
        }
        break
        
      case '5':
        this.disconnect()
        break
        
      default:
        console.log('❌ Invalid command')
        this.showMenu()
    }
  }

  handleCardCommand(command, card) {
    switch (command) {
      case '1':
        // Continue polling, menu will show again on next card
        break
        
      case '2':
        this.saveCardToFile(card)
        break
        
      case '3':
        this.testWithSupabase(card)
        break
        
      case '4':
        this.showDetailedCardInfo(card)
        break
        
      case '5':
        console.log('\\n⏸️ Stopping polling...')
        this.reader.stopPolling()
        this.showMenu()
        break
        
      default:
        console.log('❌ Invalid option')
        this.showCardMenu(card)
    }
  }

  saveCardToFile(card) {
    const fs = require('fs')
    const filename = `koffi-card-${card.uid}-${Date.now()}.json`
    
    try {
      const cardData = {
        ...card,
        detectedAt: new Date(card.timestamp).toISOString(),
        reader: 'XT-N424-WR-Koffi',
        sdk: 'X-Telcom RFID1356.dll via Koffi'
      }
      
      fs.writeFileSync(filename, JSON.stringify(cardData, null, 2))
      console.log(`\\n💾 Card saved to: ${filename}`)
      
    } catch (error) {
      console.error('❌ Failed to save card:', error.message)
    }
  }

  showDetailedCardInfo(card) {
    console.log('\\n📋 Detailed Card Information:')
    console.log('─'.repeat(40))
    console.log('UID:', card.uid)
    console.log('Card Type:', card.type)
    console.log('UID Length:', card.uidLength, 'bytes')
    console.log('ATQ (Answer to Request):', card.atq)
    console.log('SAK (Select Acknowledge):', card.sak)
    console.log('Detection Time:', new Date(card.timestamp).toLocaleString())
    console.log('Reader Connection:', this.reader.getStatus().connectionType)
    
    // Additional analysis
    if (card.uid.startsWith('04')) {
      console.log('\\n🔍 Analysis: NXP Semiconductor manufacturer')
    }
    
    if (card.type.includes('ntag424')) {
      console.log('🎯 This appears to be an NTAG424 DNA card!')
      console.log('💡 This card supports advanced security features')
    }
    
    console.log('─'.repeat(40))
  }

  async testWithSupabase(card) {
    console.log('\\n🚀 Testing Supabase integration (simulated)...')
    
    try {
      // This would integrate with your existing Supabase setup
      console.log('📤 Would send to Supabase database:')
      console.log('   Table: rfid_cards')
      console.log('   Data:', {
        uid: card.uid,
        card_type: card.type,
        detected_at: new Date(card.timestamp).toISOString(),
        reader_type: 'XT-N424-WR-Koffi',
        atq: card.atq,
        sak: card.sak,
        uid_length: card.uidLength
      })
      
      // Simulate API call delay
      console.log('⏳ Simulating API call...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('✅ Supabase integration test successful (simulated)')
      console.log('💡 Integrate with your actual Supabase client to make this real')
      
    } catch (error) {
      console.error('❌ Supabase test failed:', error.message)
    }
  }

  async disconnect() {
    console.log('\\n🔌 Disconnecting from reader...')
    
    if (this.reader) {
      await this.reader.disconnect()
    }
    
    console.log('👋 Goodbye!')
    rl.close()
    process.exit(0)
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\\n\\n🛑 Interrupted by user')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\\n\\n🛑 Terminating...')
  process.exit(0)
})

// Start the tester
const tester = new KoffiRFIDTester()
tester.start().catch((error) => {
  console.error('❌ Fatal error:', error.message)
  console.error('Stack:', error.stack)
  process.exit(1)
})