/**
 * Native RFID Reader Hardware Test
 * Tests the XT-N424 WR reader with the X-Telcom RFID1356.dll
 */

const { NativeRFIDReader } = require('./src/lib/rfid-native.js')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

class RFIDTester {
  constructor() {
    this.reader = null
  }

  async start() {
    console.log('🔧 XT-N424 WR Native RFID Reader Test\n')
    
    try {
      this.reader = new NativeRFIDReader()
      
      // Set up event handlers
      this.setupEventHandlers()
      
      // Initialize reader
      console.log('📡 Initializing RFID reader...')
      const initResult = await this.reader.initialize()
      
      if (!initResult) {
        console.error('❌ Failed to initialize RFID reader')
        console.log('\n💡 Make sure:')
        console.log('   - XT-N424 WR reader is connected via USB')
        console.log('   - RFID1356.dll is in the correct location')
        console.log('   - Visual Studio Build Tools are installed')
        process.exit(1)
      }
      
      console.log('✅ RFID reader initialized')
      
      // Connect to reader
      console.log('🔌 Connecting to XT-N424 WR...')
      const connectResult = await this.reader.connect()
      
      if (!connectResult) {
        console.error('❌ Failed to connect to reader')
        console.log('\\n💡 Check:')
        console.log('   - Reader is powered on')
        console.log('   - USB connection is stable')
        console.log('   - No other software is using the reader')
        process.exit(1)
      }
      
      console.log('✅ Connected to XT-N424 WR reader')
      console.log('📊 Reader status:', this.reader.getStatus())
      
      // Show menu
      this.showMenu()
      
    } catch (error) {
      console.error('❌ Error during initialization:', error.message)
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
    console.log('\\n' + '='.repeat(50))
    console.log('📋 RFID Reader Commands:')
    console.log('   1) Start polling for cards')
    console.log('   2) Stop polling') 
    console.log('   3) Check reader status')
    console.log('   4) Disconnect and exit')
    console.log('='.repeat(50))
    
    rl.question('Enter command (1-4): ', (answer) => {
      this.handleMenuCommand(answer.trim())
    })
  }

  showCardMenu(card) {
    console.log('\\n' + '='.repeat(50))
    console.log('🎯 Card Options:')
    console.log('   1) Continue polling')
    console.log('   2) Save card info to file')
    console.log('   3) Test with Supabase (if available)')
    console.log('   4) Stop polling')
    console.log('='.repeat(50))
    
    rl.question('Enter option (1-4): ', (answer) => {
      this.handleCardCommand(answer.trim(), card)
    })
  }

  handleMenuCommand(command) {
    switch (command) {
      case '1':
        console.log('\\n🔄 Starting card polling...')
        console.log('💡 Place a card near the reader to detect it')
        this.reader.startPolling(300) // Poll every 300ms
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
        this.showMenu()
        break
        
      case '4':
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
    const filename = `card-${card.uid}-${Date.now()}.json`
    
    try {
      const cardData = {
        ...card,
        detectedAt: new Date(card.timestamp).toISOString(),
        reader: 'XT-N424-WR'
      }
      
      fs.writeFileSync(filename, JSON.stringify(cardData, null, 2))
      console.log(`\\n💾 Card saved to: ${filename}`)
      
    } catch (error) {
      console.error('❌ Failed to save card:', error.message)
    }
  }

  async testWithSupabase(card) {
    console.log('\\n🚀 Testing Supabase integration...')
    
    try {
      // This would integrate with your existing Supabase setup
      console.log('📤 Would send to Supabase:')
      console.log('   Table: rfid_cards')
      console.log('   Data:', {
        uid: card.uid,
        card_type: card.type,
        detected_at: new Date(card.timestamp).toISOString(),
        reader_type: 'XT-N424-WR'
      })
      
      console.log('✅ Integration test successful (simulated)')
      
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
const tester = new RFIDTester()
tester.start().catch((error) => {
  console.error('❌ Fatal error:', error.message)
  process.exit(1)
})