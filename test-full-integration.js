/**
 * Complete SmartID Time RFID Integration Test
 * Tests the full pipeline from card detection to database storage
 */

const { RFIDSupabaseService } = require('./src/lib/rfid-supabase-service.js')
const { createClient } = require('./src/lib/supabase/client.ts')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

class FullIntegrationTest {
  constructor() {
    this.supabase = null
    this.rfidService = null
    this.currentUser = null
  }

  async start() {
    console.log('🚀 SmartID Time - Full RFID Integration Test\n')

    try {
      // 1. Initialize Supabase connection
      await this.initializeSupabase()
      
      // 2. Set up user context (mock for testing)
      await this.setupUserContext()
      
      // 3. Initialize RFID service
      await this.initializeRFIDService()
      
      // 4. Set up event handlers
      this.setupEventHandlers()
      
      // 5. Start the service
      await this.startRFIDService()
      
      // 6. Show interactive menu
      this.showMainMenu()
      
    } catch (error) {
      console.error('❌ Integration test failed:', error.message)
      process.exit(1)
    }
  }

  async initializeSupabase() {
    try {
      // Create Supabase client
      this.supabase = createClient()
      
      // Test connection by fetching institutions
      const { data, error } = await this.supabase
        .from('institutions')
        .select('id, name')
        .limit(1)
      
      if (error && !error.message.includes('Failed to fetch')) {
        throw error
      }
      
      console.log('✅ Supabase connection initialized')
      
    } catch (error) {
      console.error('❌ Supabase initialization failed:', error.message)
      console.log('💡 Make sure your .env.local file has:')
      console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
      console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
      throw error
    }
  }

  async setupUserContext() {
    // For testing, we'll use a mock user context
    // In real app, this would come from auth
    this.currentUser = {
      id: '12345678-1234-5678-9012-123456789012', // Mock auth user ID
      email: 'test@example.com'
    }
    
    console.log('✅ User context set up (mock)')
  }

  async initializeRFIDService() {
    try {
      // Create RFID service with options
      this.rfidService = new RFIDSupabaseService(this.supabase, {
        pollingInterval: 300,
        attendanceMode: true,
        walletEnabled: true,
        autoEnrollment: false,
        defaultLocation: null // Configure as needed
      })
      
      // Initialize with user context
      const initResult = await this.rfidService.initialize(this.currentUser)
      
      if (initResult) {
        console.log('✅ RFID Service initialized')
      } else {
        throw new Error('RFID Service initialization failed')
      }
      
    } catch (error) {
      console.error('❌ RFID Service initialization failed:', error.message)
      throw error
    }
  }

  setupEventHandlers() {
    // Card detection events
    this.rfidService.on('cardDetected', (card) => {
      console.log('\\n🎯 RAW CARD DETECTED:', card)
    })

    this.rfidService.on('enrolledCardDetected', ({ card, user, enrollment, accessEvent }) => {
      console.log('\\n👤 ENROLLED CARD DETECTED!')
      console.log('   User:', user.full_name, `(${user.employee_id})`)
      console.log('   Card:', card.uid, `(${card.type})`)
      console.log('   Access Level:', enrollment.access_level)
      console.log('   Processing Time:', accessEvent.processing_time_ms, 'ms')
    })

    this.rfidService.on('unknownCardDetected', ({ card, cardRecord }) => {
      console.log('\\n❓ UNKNOWN CARD DETECTED!')
      console.log('   UID:', card.uid)
      console.log('   Type:', card.type)
      console.log('   Would you like to enroll this card?')
      this.promptCardEnrollment(card)
    })

    // Attendance events
    this.rfidService.on('attendanceRecorded', ({ record, user, recordType }) => {
      console.log(`\\n⏰ ATTENDANCE ${recordType.toUpperCase()}`)
      console.log('   User:', user.full_name)
      console.log('   Time:', new Date(record.record_time).toLocaleString())
      console.log('   Location:', record.location_id || 'Default')
    })

    // Wallet events
    this.rfidService.on('walletAccessed', ({ wallet, user, card }) => {
      console.log('\\n💳 WALLET ACCESSED')
      console.log('   User:', user.full_name)
      console.log('   Wallet:', wallet.wallet_number)
      console.log('   Balance:', wallet.currency_code, wallet.balance)
    })

    // Service events
    this.rfidService.on('started', () => {
      console.log('\\n🟢 RFID Service is now running')
      console.log('💡 Place a card near the XT-N424 WR reader to test')
    })

    this.rfidService.on('stopped', () => {
      console.log('\\n🔴 RFID Service stopped')
    })

    // Error events
    this.rfidService.on('error', (error) => {
      console.error('\\n❌ Service Error:', error.message)
    })

    this.rfidService.on('readerError', (error) => {
      console.error('\\n📡 Reader Error:', error.message)
    })

    this.rfidService.on('cardProcessingError', ({ card, error }) => {
      console.error('\\n🎯 Card Processing Error:', error.message)
      console.log('   Card:', card.uid)
    })
  }

  async startRFIDService() {
    try {
      const startResult = await this.rfidService.start()
      
      if (!startResult) {
        throw new Error('Failed to start RFID service')
      }
      
    } catch (error) {
      console.error('❌ Failed to start RFID service:', error.message)
      throw error
    }
  }

  showMainMenu() {
    console.log('\\n' + '='.repeat(60))
    console.log('📋 SmartID Time - RFID Integration Test Menu')
    console.log('='.repeat(60))
    console.log('   1) View service status')
    console.log('   2) View active card enrollments')
    console.log('   3) View recent card access events')
    console.log('   4) Enroll a card manually')
    console.log('   5) View wallet balances')
    console.log('   6) Simulate attendance record')
    console.log('   7) Refresh cache')
    console.log('   8) Stop service and exit')
    console.log('='.repeat(60))
    
    rl.question('Enter option (1-8): ', (answer) => {
      this.handleMenuOption(answer.trim())
    })
  }

  async handleMenuOption(option) {
    switch (option) {
      case '1':
        await this.showServiceStatus()
        break
      case '2':
        await this.showActiveEnrollments()
        break
      case '3':
        await this.showRecentAccessEvents()
        break
      case '4':
        await this.manualCardEnrollment()
        break
      case '5':
        await this.showWalletBalances()
        break
      case '6':
        await this.simulateAttendance()
        break
      case '7':
        await this.refreshCache()
        break
      case '8':
        await this.stopAndExit()
        return
      default:
        console.log('❌ Invalid option')
    }
    
    setTimeout(() => this.showMainMenu(), 2000)
  }

  async showServiceStatus() {
    console.log('\\n📊 Service Status:')
    console.log('─'.repeat(40))
    
    const status = this.rfidService.getStatus()
    console.log('Running:', status.isRunning ? '✅' : '❌')
    
    if (status.readerStatus) {
      console.log('Reader Connected:', status.readerStatus.connected ? '✅' : '❌')
      console.log('Reader Polling:', status.readerStatus.polling ? '✅' : '❌')
      console.log('Connection Type:', status.readerStatus.connectionType || 'None')
    }
    
    console.log('Institution:', status.currentInstitution)
    console.log('Cache Size:', status.cacheSize.enrollments, 'enrollments')
    console.log('Polling Interval:', status.options.pollingInterval, 'ms')
    console.log('Attendance Mode:', status.options.attendanceMode ? '✅' : '❌')
    console.log('Wallet Enabled:', status.options.walletEnabled ? '✅' : '❌')
  }

  async showActiveEnrollments() {
    console.log('\\n👥 Active Card Enrollments:')
    console.log('─'.repeat(50))
    
    try {
      const { data, error } = await this.supabase
        .from('active_card_enrollments')
        .select('*')
        .limit(10)
      
      if (error) throw error
      
      if (data && data.length > 0) {
        data.forEach((enrollment, index) => {
          console.log(`${index + 1}. ${enrollment.user_name} (${enrollment.employee_id})`)
          console.log(`   Card: ${enrollment.card_uid} (${enrollment.card_type})`)
          console.log(`   Access: ${enrollment.access_level}`)
          console.log(`   Wallet: ${enrollment.wallet_number} - ${enrollment.wallet_balance || 0} MYR`)
          console.log('')
        })
      } else {
        console.log('No active enrollments found')
      }
    } catch (error) {
      console.error('❌ Error fetching enrollments:', error.message)
    }
  }

  async showRecentAccessEvents() {
    console.log('\\n📋 Recent Card Access Events:')
    console.log('─'.repeat(50))
    
    try {
      const { data, error } = await this.supabase
        .from('recent_card_access')
        .select('*')
        .limit(10)
      
      if (error) throw error
      
      if (data && data.length > 0) {
        data.forEach((event, index) => {
          console.log(`${index + 1}. ${event.event_type} - ${event.access_result}`)
          console.log(`   Card: ${event.card_uid}`)
          console.log(`   User: ${event.user_name || 'Unknown'}`)
          console.log(`   Time: ${new Date(event.detected_at).toLocaleString()}`)
          console.log(`   Processing: ${event.processing_time_ms}ms`)
          console.log('')
        })
      } else {
        console.log('No recent events found')
      }
    } catch (error) {
      console.error('❌ Error fetching events:', error.message)
    }
  }

  async manualCardEnrollment() {
    console.log('\\n➕ Manual Card Enrollment')
    console.log('─'.repeat(30))
    
    rl.question('Enter card UID: ', async (cardUid) => {
      if (!cardUid.trim()) {
        console.log('❌ Card UID required')
        return
      }
      
      rl.question('Enter user ID: ', async (userId) => {
        if (!userId.trim()) {
          console.log('❌ User ID required')
          return
        }
        
        try {
          const enrollment = await this.rfidService.enrollCard(cardUid, userId)
          console.log('✅ Card enrolled successfully!')
          console.log('   Enrollment ID:', enrollment.id)
        } catch (error) {
          console.error('❌ Enrollment failed:', error.message)
        }
      })
    })
  }

  async showWalletBalances() {
    console.log('\\n💳 Wallet Balances:')
    console.log('─'.repeat(40))
    
    try {
      const { data, error } = await this.supabase
        .from('card_wallets')
        .select(`
          *,
          card_enrollments!inner(
            users!inner(full_name, employee_id)
          )
        `)
        .eq('wallet_status', 'active')
        .limit(10)
      
      if (error) throw error
      
      if (data && data.length > 0) {
        data.forEach((wallet, index) => {
          const user = wallet.card_enrollments.users
          console.log(`${index + 1}. ${user.full_name} (${user.employee_id})`)
          console.log(`   Wallet: ${wallet.wallet_number}`)
          console.log(`   Balance: ${wallet.currency_code} ${wallet.balance}`)
          console.log(`   Status: ${wallet.wallet_status}`)
          console.log('')
        })
      } else {
        console.log('No active wallets found')
      }
    } catch (error) {
      console.error('❌ Error fetching wallets:', error.message)
    }
  }

  async simulateAttendance() {
    console.log('\\n⏰ Attendance Simulation')
    console.log('This would show recent attendance records...')
    // Implementation would show recent attendance records
  }

  async refreshCache() {
    console.log('\\n🔄 Refreshing cache...')
    await this.rfidService.refreshCache()
    console.log('✅ Cache refreshed')
  }

  async stopAndExit() {
    console.log('\\n🛑 Stopping RFID service...')
    await this.rfidService.stop()
    console.log('👋 Goodbye!')
    rl.close()
    process.exit(0)
  }

  async promptCardEnrollment(card) {
    console.log('\\n➕ Card Enrollment Prompt')
    console.log(`Unknown card detected: ${card.uid}`)
    rl.question('Do you want to enroll this card? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        rl.question('Enter user ID for enrollment: ', async (userId) => {
          if (userId.trim()) {
            try {
              await this.rfidService.enrollCard(card.uid, userId)
              console.log('✅ Card enrolled successfully!')
            } catch (error) {
              console.error('❌ Enrollment failed:', error.message)
            }
          }
        })
      }
    })
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\\n\\n🛑 Interrupted by user')
  process.exit(0)
})

// Start the test
const test = new FullIntegrationTest()
test.start().catch((error) => {
  console.error('❌ Test failed:', error.message)
  process.exit(1)
})