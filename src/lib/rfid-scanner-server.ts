/**
 * Server-only RFID scanner wrapper
 * This file safely imports Koffi only on the server side
 */

export interface ScanResult {
  success: boolean
  card_uid?: string
  reader_type?: string
  detected_at?: string
  card_type?: string
  manufacturer?: string
  technical_data?: {
    atq?: string
    sak?: string
    uid_length?: number
  }
  error?: string
  message?: string
  note?: string
}

export async function scanCard(timeout: number = 10000, readerType: string = 'XT-N424-WR'): Promise<ScanResult> {
  // Ensure we're running server-side
  if (typeof window !== 'undefined') {
    throw new Error('RFID scanning must run server-side only')
  }
  
  // Check if we're on Windows
  if (process.platform !== 'win32') {
    return {
      success: false,
      error: 'Platform not supported',
      message: 'RFID scanning is only supported on Windows'
    }
  }

  try {
    console.log('🔧 Loading Koffi RFID reader for web application...')
    
    // Use the EXACT same require approach as the working CLI script
    const { KoffiRFIDReader } = require('./rfid-native-koffi.js')
    const reader = new KoffiRFIDReader()
    
    try {
      // Initialize the RFID library
      console.log('Initializing Koffi RFID reader...')
      const initialized = await reader.initialize()
      if (!initialized) {
        throw new Error('Failed to initialize RFID library')
      }
      
      // Connect to the reader
      console.log('Connecting to XT-N424 WR reader...')
      const connected = await reader.connect()
      if (!connected) {
        throw new Error('Failed to connect to RFID reader')
      }
      
      // Set up card detection promise
      const cardDetectionPromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reader.stopPolling()
          reader.disconnect()
          reject(new Error('Scan timeout - no card detected'))
        }, timeout)
        
        reader.once('cardDetected', (card: any) => {
          clearTimeout(timeoutId)
          reader.stopPolling()
          reader.disconnect()
          resolve(card)
        })
        
        reader.once('error', (error: any) => {
          clearTimeout(timeoutId)
          reader.stopPolling()
          reader.disconnect()
          reject(error)
        })
      })
      
      // Start polling for cards
      console.log('Starting card polling...')
      reader.startPolling(200) // Poll every 200ms for faster detection
      
      // Wait for card detection or timeout
      const detectedCard: any = await cardDetectionPromise
      
      console.log(`✅ Card detected: ${detectedCard.uid}`)
      
      return {
        success: true,
        card_uid: detectedCard.uid,
        reader_type: readerType,
        detected_at: new Date().toISOString(),
        card_type: detectedCard.type,
        manufacturer: detectedCard.uid.startsWith('04') ? 'NXP' : 'Unknown',
        technical_data: {
          atq: detectedCard.atq,
          sak: detectedCard.sak,
          uid_length: detectedCard.uidLength
        }
      }
      
    } catch (readerError: any) {
      console.error('RFID Reader Error:', readerError)
      
      // Clean up
      try {
        reader.stopPolling()
        reader.disconnect()
      } catch (cleanupError) {
        console.warn('Cleanup error:', cleanupError)
      }
      
      return {
        success: false,
        error: 'No card detected',
        message: readerError.message || 'Please place a card on the reader and try again'
      }
    }
    
  } catch (importError: any) {
    console.error('🔴 Failed to import Koffi RFID module:')
    console.error('Error message:', importError.message)
    console.error('Error stack:', importError.stack)
    console.error('Error code:', importError.code)
    console.log('🔄 Falling back to mock RFID mode')
    
    // Fallback to mock mode for development/testing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate a test card UID
    const testUIDs = [
      '04A1B2C3D4E5F6',
      '041A2B3C4D5E6F', 
      '04ABCDEF123456',
      '04DEADBEEFCAFE',
      '04BADCAFFEEDFA'
    ]
    
    const randomUID = testUIDs[Math.floor(Math.random() * testUIDs.length)]
    
    return {
      success: true,
      card_uid: randomUID,
      reader_type: 'Mock-' + readerType,
      detected_at: new Date().toISOString(),
      card_type: 'ntag424',
      manufacturer: 'NXP',
      technical_data: {
        atq: '0044',
        sak: '00',
        uid_length: 7
      },
      note: 'Mock mode - Koffi RFID library not available'
    }
  }
}