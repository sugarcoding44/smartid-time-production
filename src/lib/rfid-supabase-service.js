/**
 * RFID Supabase Integration Service
 * Connects XT-N424 WR reader with Supabase database for SmartID Time
 */

const { KoffiRFIDReader } = require('./rfid-native-koffi.js')
const { EventEmitter } = require('events')

class RFIDSupabaseService extends EventEmitter {
  constructor(supabaseClient, options = {}) {
    super()
    
    this.supabase = supabaseClient
    this.reader = null
    this.isRunning = false
    this.currentUser = null
    this.currentInstitution = null
    
    // Configuration options
    this.options = {
      pollingInterval: options.pollingInterval || 300, // ms
      autoEnrollment: options.autoEnrollment || false,
      defaultLocation: options.defaultLocation || null,
      attendanceMode: options.attendanceMode || true,
      walletEnabled: options.walletEnabled || true,
      ...options
    }
    
    // Cache for frequently accessed data
    this.cache = {
      enrollments: new Map(),
      users: new Map(),
      locations: new Map()
    }
    
    console.log('🔧 RFID Supabase Service initialized')
  }

  /**
   * Initialize the service with user and institution context
   */
  async initialize(currentUser) {
    try {
      this.currentUser = currentUser
      
      // Get current user's institution
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('institution_id')
        .eq('auth_user_id', currentUser.id)
        .single()

      if (userError) throw userError
      this.currentInstitution = userData.institution_id

      // Initialize RFID reader
      this.reader = new KoffiRFIDReader()
      await this.reader.initialize()
      
      // Set up event handlers
      this.setupReaderEvents()
      
      console.log('✅ RFID Supabase Service initialized for institution:', this.currentInstitution)
      return true
      
    } catch (error) {
      console.error('❌ Failed to initialize RFID service:', error.message)
      this.emit('error', error)
      return false
    }
  }

  /**
   * Start the RFID service
   */
  async start() {
    if (this.isRunning || !this.reader) {
      throw new Error('Service already running or not initialized')
    }

    try {
      // Connect to reader
      await this.reader.connect()
      
      // Load cache data
      await this.refreshCache()
      
      // Start polling for cards
      this.reader.startPolling(this.options.pollingInterval)
      this.isRunning = true
      
      this.emit('started')
      console.log('🚀 RFID Service started - polling every', this.options.pollingInterval, 'ms')
      
      return true
    } catch (error) {
      console.error('❌ Failed to start RFID service:', error.message)
      this.emit('error', error)
      return false
    }
  }

  /**
   * Stop the RFID service
   */
  async stop() {
    if (!this.isRunning) return

    try {
      if (this.reader) {
        this.reader.stopPolling()
        await this.reader.disconnect()
      }
      
      this.isRunning = false
      this.cache.enrollments.clear()
      this.cache.users.clear()
      this.cache.locations.clear()
      
      this.emit('stopped')
      console.log('🛑 RFID Service stopped')
      
    } catch (error) {
      console.error('⚠️ Error stopping RFID service:', error.message)
      this.emit('error', error)
    }
  }

  /**
   * Set up RFID reader event handlers
   */
  setupReaderEvents() {
    this.reader.on('cardDetected', async (card) => {
      try {
        await this.handleCardDetection(card)
      } catch (error) {
        console.error('❌ Error handling card detection:', error.message)
        this.emit('error', error)
      }
    })

    this.reader.on('cardRemoved', () => {
      this.emit('cardRemoved')
    })

    this.reader.on('error', (error) => {
      console.error('⚠️ Reader error:', error.message)
      this.emit('readerError', error)
    })

    this.reader.on('connected', () => {
      console.log('📡 Reader connected')
      this.emit('readerConnected')
    })

    this.reader.on('disconnected', () => {
      console.log('📡 Reader disconnected')
      this.emit('readerDisconnected')
    })
  }

  /**
   * Handle card detection from reader
   */
  async handleCardDetection(card) {
    const startTime = Date.now()
    
    console.log('🎯 Card detected:', card.uid)
    this.emit('cardDetected', card)

    try {
      // 1. Find or create RFID card record
      const cardRecord = await this.findOrCreateCard(card)
      
      // 2. Find active enrollment for this card
      const enrollment = await this.findActiveEnrollment(cardRecord.id)
      
      // 3. Log access event
      const accessEvent = await this.logAccessEvent(card, cardRecord, enrollment, startTime)
      
      // 4. Handle based on enrollment status
      if (enrollment) {
        await this.handleEnrolledCard(card, cardRecord, enrollment, accessEvent)
      } else {
        await this.handleUnknownCard(card, cardRecord, accessEvent)
      }

    } catch (error) {
      console.error('❌ Error processing card:', error.message)
      
      // Log failed access event
      await this.logAccessEvent(card, null, null, startTime, 'error', error.message)
      
      this.emit('cardProcessingError', { card, error })
    }
  }

  /**
   * Find existing card or create new one
   */
  async findOrCreateCard(card) {
    // Check if card already exists
    const { data: existingCard, error: findError } = await this.supabase
      .from('rfid_cards')
      .select('*')
      .eq('card_uid', card.uid)
      .single()

    if (existingCard) {
      return existingCard
    }

    // Create new card record
    const { data: newCard, error: createError } = await this.supabase
      .from('rfid_cards')
      .insert({
        card_uid: card.uid,
        card_type: card.type,
        uid_length: card.uidLength,
        atq: card.atq,
        sak: card.sak,
        technical_data: {
          atq: card.atq,
          sak: card.sak,
          uid_length: card.uidLength,
          detection_timestamp: card.timestamp
        },
        reader_info: {
          reader_type: 'XT-N424-WR-Koffi',
          connection_type: this.reader.connectionType
        }
      })
      .select()
      .single()

    if (createError) throw createError

    console.log('➕ New card created:', card.uid)
    return newCard
  }

  /**
   * Find active enrollment for card
   */
  async findActiveEnrollment(cardId) {
    // Check cache first
    if (this.cache.enrollments.has(cardId)) {
      return this.cache.enrollments.get(cardId)
    }

    // Query database
    const { data: enrollment, error } = await this.supabase
      .from('card_enrollments')
      .select(`
        *,
        user_id,
        users!inner(id, full_name, employee_id, email)
      `)
      .eq('card_id', cardId)
      .eq('enrollment_status', 'active')
      .eq('institution_id', this.currentInstitution)
      .single()

    if (!error && enrollment) {
      // Cache the result
      this.cache.enrollments.set(cardId, enrollment)
      return enrollment
    }

    return null
  }

  /**
   * Log access event to database
   */
  async logAccessEvent(card, cardRecord, enrollment, startTime, result = 'granted', denialReason = null) {
    const processingTime = Date.now() - startTime

    const eventData = {
      card_id: cardRecord?.id,
      enrollment_id: enrollment?.id,
      user_id: enrollment?.user_id,
      institution_id: this.currentInstitution,
      location_id: this.options.defaultLocation,
      event_type: this.options.attendanceMode ? 'attendance_in' : 'verification',
      access_result: result,
      denial_reason: denialReason,
      reader_type: 'XT-N424-WR',
      reader_location: 'Main Office', // Configure as needed
      detected_at: new Date(card.timestamp).toISOString(),
      processing_time_ms: processingTime,
      technical_details: {
        uid: card.uid,
        type: card.type,
        atq: card.atq,
        sak: card.sak,
        uid_length: card.uidLength
      },
      device_info: {
        reader_type: 'XT-N424-WR-Koffi',
        connection_type: this.reader.connectionType,
        dll_version: '2023.06.01'
      }
    }

    const { data, error } = await this.supabase
      .from('card_access_events')
      .insert(eventData)
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to log access event:', error.message)
      throw error
    }

    return data
  }

  /**
   * Handle enrolled card detection
   */
  async handleEnrolledCard(card, cardRecord, enrollment, accessEvent) {
    console.log(`👤 Enrolled card: ${enrollment.users.full_name} (${enrollment.users.employee_id})`)
    
    // Emit successful card read
    this.emit('enrolledCardDetected', {
      card,
      user: enrollment.users,
      enrollment,
      accessEvent
    })

    // Handle attendance if enabled
    if (this.options.attendanceMode) {
      await this.recordAttendance(card, enrollment, accessEvent)
    }

    // Handle wallet operations if enabled
    if (this.options.walletEnabled) {
      await this.handleWalletAccess(card, enrollment)
    }
  }

  /**
   * Handle unknown/unenrolled card
   */
  async handleUnknownCard(card, cardRecord, accessEvent) {
    console.log('❓ Unknown card detected:', card.uid)
    
    this.emit('unknownCardDetected', {
      card,
      cardRecord,
      accessEvent
    })

    // Auto-enrollment if enabled
    if (this.options.autoEnrollment) {
      this.emit('autoEnrollmentRequested', {
        card,
        cardRecord
      })
    }
  }

  /**
   * Record attendance based on card detection
   */
  async recordAttendance(card, enrollment, accessEvent) {
    try {
      // Check if there's already an attendance record today
      const today = new Date().toISOString().split('T')[0]
      
      const { data: existingRecord, error: checkError } = await this.supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', enrollment.user_id)
        .gte('record_time', today + 'T00:00:00Z')
        .lt('record_time', today + 'T23:59:59Z')
        .eq('record_type', 'clock_in')
        .single()

      // Determine if this is clock in or clock out
      const recordType = existingRecord ? 'clock_out' : 'clock_in'
      
      // Create attendance record
      const { data: attendanceRecord, error: attendanceError } = await this.supabase
        .from('attendance_records')
        .insert({
          user_id: enrollment.user_id,
          schedule_id: '00000000-0000-0000-0000-000000000001', // Default schedule - configure as needed
          record_type: recordType,
          record_time: new Date(card.timestamp).toISOString(),
          location_id: this.options.defaultLocation,
          status: 'verified',
          verification_method: 'rfid_card',
          card_access_event_id: accessEvent.id,
          card_uid: card.uid,
          reader_type: 'XT-N424-WR',
          device_info: {
            reader_connection: this.reader.connectionType,
            processing_time: accessEvent.processing_time_ms
          },
          created_by: enrollment.user_id,
          updated_by: enrollment.user_id,
          notes: `RFID card ${recordType} via XT-N424 WR reader`
        })
        .select()
        .single()

      if (attendanceError) throw attendanceError

      console.log(`⏰ Attendance recorded: ${recordType} for ${enrollment.users.full_name}`)
      
      this.emit('attendanceRecorded', {
        record: attendanceRecord,
        user: enrollment.users,
        recordType
      })

    } catch (error) {
      console.error('❌ Failed to record attendance:', error.message)
      this.emit('attendanceError', { error, enrollment })
    }
  }

  /**
   * Handle wallet access
   */
  async handleWalletAccess(card, enrollment) {
    try {
      // Get wallet for this enrollment
      const { data: wallet, error } = await this.supabase
        .from('card_wallets')
        .select('*')
        .eq('enrollment_id', enrollment.id)
        .single()

      if (!error && wallet) {
        console.log(`💳 Wallet access: ${wallet.wallet_number} - Balance: ${wallet.currency_code} ${wallet.balance}`)
        
        this.emit('walletAccessed', {
          wallet,
          user: enrollment.users,
          card
        })
      }
    } catch (error) {
      console.error('⚠️ Wallet access error:', error.message)
    }
  }

  /**
   * Enroll a card to a user
   */
  async enrollCard(cardUid, userId, accessLevel = 'standard', options = {}) {
    try {
      // Find the card
      const { data: card, error: cardError } = await this.supabase
        .from('rfid_cards')
        .select('*')
        .eq('card_uid', cardUid)
        .single()

      if (cardError) throw cardError

      // Create enrollment
      const { data: enrollment, error: enrollError } = await this.supabase
        .from('card_enrollments')
        .insert({
          card_id: card.id,
          user_id: userId,
          institution_id: this.currentInstitution,
          enrollment_status: 'active',
          access_level: accessLevel,
          allowed_locations: options.allowedLocations || [],
          access_schedule: options.accessSchedule || {},
          enrollment_reason: options.reason || 'Manual enrollment',
          enrolled_by: this.currentUser.id
        })
        .select()
        .single()

      if (enrollError) throw enrollError

      // Clear cache to force refresh
      this.cache.enrollments.delete(card.id)
      
      console.log('✅ Card enrolled successfully:', cardUid)
      this.emit('cardEnrolled', { card, enrollment })
      
      return enrollment

    } catch (error) {
      console.error('❌ Card enrollment failed:', error.message)
      this.emit('enrollmentError', error)
      throw error
    }
  }

  /**
   * Refresh cache data
   */
  async refreshCache() {
    try {
      // Load active enrollments for this institution
      const { data: enrollments, error } = await this.supabase
        .from('card_enrollments')
        .select(`
          *,
          users!inner(id, full_name, employee_id, email)
        `)
        .eq('enrollment_status', 'active')
        .eq('institution_id', this.currentInstitution)

      if (!error && enrollments) {
        this.cache.enrollments.clear()
        enrollments.forEach(enrollment => {
          this.cache.enrollments.set(enrollment.card_id, enrollment)
        })
        
        console.log(`🔄 Cache refreshed: ${enrollments.length} active enrollments`)
      }

    } catch (error) {
      console.error('⚠️ Cache refresh error:', error.message)
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      readerStatus: this.reader ? this.reader.getStatus() : null,
      currentInstitution: this.currentInstitution,
      cacheSize: {
        enrollments: this.cache.enrollments.size,
        users: this.cache.users.size,
        locations: this.cache.locations.size
      },
      options: this.options
    }
  }
}

module.exports = { RFIDSupabaseService }