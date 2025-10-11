/**
 * Native RFID Reader Integration
 * Interfaces with X-Telcom RFID1356.dll directly
 */

const { EventEmitter } = require('events')
const path = require('path')

class NativeRFIDReader extends EventEmitter {
  constructor() {
    super()
    this.isConnected = false
    this.isPolling = false
    this.dllPath = null
    this.rfidLib = null
    this.pollInterval = null
    this.lastUID = ''
    this.connectionType = null
  }

  /**
   * Initialize the RFID library
   */
  async initialize() {
    try {
      // Path to your RFID1356.dll
      this.dllPath = path.join(
        'C:', 'Users', 'user', 'Downloads', 'NTAG424_SDK',
        'NTAG424  Tag SDK and demo',
        'ntag424 function 1 SDK 20240722',
        'RFID1356.dll'
      )

      // Load the DLL using ffi-napi (after VS Build Tools is installed)
      const ffi = require('ffi-napi')
      const ref = require('ref-napi')

      this.rfidLib = ffi.Library(this.dllPath, {
        // Communication functions based on RFID1356.h
        'openhid': ['int', ['uint16', 'uint16', 'uint8']],  // vendor_id, product_id, hid_number
        'closehid': ['int', []],
        'openpcsc': ['int', ['uint8', 'char*']],  // namelen, name
        'closepcsc': ['int', []],
        'PiccReset': ['int', ['uint8']],  // reset time in ms
        'PiccActivateA': ['int', ['uint8', 'uint8', 'char*', 'char*', 'char*', 'char*']], // mode, req_code, atq, sak, uid_len, uid
        'PiccAutoListCard': ['int', ['char*', 'char*']], // len, settings
        'ReaderTxRx': ['int', ['uint16', 'char*', 'uint16*', 'char*']]  // senlen, sendata, relen, redata
      })

      console.log('Native RFID Reader: DLL loaded successfully')
      return true
    } catch (error) {
      console.error('Native RFID Reader: Failed to load DLL', error.message)
      this.emit('error', error)
      return false
    }
  }

  /**
   * Connect to the XT-N424 WR reader
   */
  async connect() {
    if (!this.rfidLib) {
      throw new Error('RFID library not initialized')
    }

    try {
      // XT-N424 WR specific connection
      // First try HID connection (typical for XT-N424 WR)
      const vendor_id = 0x072F  // X-Telcom vendor ID
      const product_id = 0x2200  // Typical product ID for XT-N424 WR
      
      console.log('Native RFID Reader: Attempting HID connection...')
      const hidResult = this.rfidLib.openhid(vendor_id, product_id, 0)
      
      if (hidResult === 0) {
        console.log('Native RFID Reader: HID connection successful')
        this.connectionType = 'HID'
      } else {
        // Try PC/SC connection as fallback
        console.log('Native RFID Reader: HID failed, trying PC/SC...')
        const readerName = 'ACS ACR122U'  // Common PC/SC name
        const pcscResult = this.rfidLib.openpcsc(readerName.length, readerName)
        
        if (pcscResult === 0) {
          console.log('Native RFID Reader: PC/SC connection successful')
          this.connectionType = 'PCSC'
        } else {
          throw new Error(`Failed to connect via HID (${hidResult}) or PC/SC (${pcscResult})`)
        }
      }

      // Reset the PICC interface
      const resetResult = this.rfidLib.PiccReset(1)  // 1ms reset
      if (resetResult !== 0) {
        console.warn(`Warning: PICC reset returned ${resetResult}`)
      }

      this.isConnected = true
      this.emit('connected')
      console.log('Native RFID Reader: Connected to XT-N424 WR via', this.connectionType)
      return true
    } catch (error) {
      console.error('Native RFID Reader: Connection failed', error)
      this.emit('error', error)
      return false
    }
  }

  /**
   * Disconnect from reader
   */
  async disconnect() {
    if (this.rfidLib && this.isConnected) {
      this.stopPolling()
      
      // Close connection based on type
      if (this.connectionType === 'HID') {
        this.rfidLib.closehid()
      } else if (this.connectionType === 'PCSC') {
        this.rfidLib.closepcsc()
      }
      
      this.isConnected = false
      this.connectionType = null
      this.emit('disconnected')
      console.log('Native RFID Reader: Disconnected')
    }
  }

  /**
   * Start polling for cards
   */
  startPolling(intervalMs = 500) {
    if (!this.isConnected) {
      throw new Error('Reader not connected')
    }

    if (this.isPolling) {
      return
    }

    this.isPolling = true
    console.log('Native RFID Reader: Started polling')

    this.pollInterval = setInterval(() => {
      this.pollForCard()
    }, intervalMs)
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
    this.isPolling = false
    console.log('Native RFID Reader: Stopped polling')
  }

  /**
   * Poll for card presence
   */
  pollForCard() {
    try {
      if (!this.rfidLib || !this.isConnected) return

      // Use PiccActivateA to detect and activate ISO14443A cards (like NTAG424)
      const atqBuffer = Buffer.alloc(2)
      const sakBuffer = Buffer.alloc(1)
      const uidLenBuffer = Buffer.alloc(1)
      const uidBuffer = Buffer.alloc(10)  // Max UID length
      
      // Try to activate ISO14443-A card
      const activateResult = this.rfidLib.PiccActivateA(
        0,  // mode: 0 = activate if present
        0x52,  // req_code: WUPA (Wake Up)
        atqBuffer,
        sakBuffer, 
        uidLenBuffer,
        uidBuffer
      )
      
      if (activateResult === 0) {
        // Card detected successfully
        const uidLen = uidLenBuffer.readUInt8(0)
        
        if (uidLen > 0 && uidLen <= 10) {
          // Extract UID bytes
          const uidBytes = []
          for (let i = 0; i < uidLen; i++) {
            uidBytes.push(uidBuffer.readUInt8(i).toString(16).padStart(2, '0').toUpperCase())
          }
          
          const uid = uidBytes.join('')
          
          if (uid && uid !== this.lastUID) {
            this.lastUID = uid
            
            const sakHex = sakBuffer.readUInt8(0).toString(16).padStart(2, '0').toUpperCase()
            
            const card = {
              uid: uid,
              type: this.detectCardType(uid, sakHex),
              timestamp: Date.now(),
              uidLength: uidLen,
              atq: atqBuffer.readUInt16BE(0).toString(16).padStart(4, '0').toUpperCase(),
              sak: sakHex
            }

            this.emit('cardDetected', card)
            console.log('Native RFID Reader: Card detected', uid)
          }
        }
      } else {
        // No card present or activation failed
        if (this.lastUID) {
          this.emit('cardRemoved')
          this.lastUID = ''
          console.log('Native RFID Reader: Card removed')
        }
      }
    } catch (error) {
      console.error('Native RFID Reader: Polling error', error)
      this.emit('error', error)
    }
  }

  /**
   * Detect card type from UID and card info
   */
  detectCardType(uid, sak = null) {
    const uidLength = uid.replace(/[^0-9A-F]/g, '').length
    
    // NTAG424 DNA typically has 7-byte UID (14 hex chars)
    if (uidLength === 14) {
      // Check if first byte indicates NXP manufacturer
      if (uid.startsWith('04')) {
        return 'ntag424'
      }
      return 'iso14443a-7byte'
    } 
    
    // Classic Mifare/NTAG has 4-byte UID (8 hex chars) 
    else if (uidLength === 8) {
      if (sak) {
        const sakValue = parseInt(sak, 16)
        // Common SAK values for different card types
        if (sakValue === 0x00) return 'ntag213/215/216'
        if (sakValue === 0x08) return 'mifare-1k'
        if (sakValue === 0x18) return 'mifare-4k'
        if (sakValue === 0x20) return 'mifare-plus'
      }
      return 'mifare-classic'
    }
    
    // 10-byte UID (20 hex chars) - double size
    else if (uidLength === 20) {
      return 'iso14443a-10byte'
    }
    
    return `unknown-${uidLength}chars`
  }

  /**
   * Get reader status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      polling: this.isPolling,
      dllLoaded: !!this.rfidLib
    }
  }
}

module.exports = { NativeRFIDReader }