/**
 * Native RFID Reader Integration using Koffi
 * Interfaces with X-Telcom RFID1356.dll directly
 */

const { EventEmitter } = require('events')
const path = require('path')

class KoffiRFIDReader extends EventEmitter {
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
   * Initialize the RFID library using Koffi
   */
  async initialize() {
    try {
      // Path to your RFID1356.dll
      this.dllPath = path.join(
        'C:', 'Users', 'user', 'Downloads', 'NTAG424_SDK',
        'NTAG424  Tag SDK and demo',
        'COMM-demo software 250116',
        'COMM-demo software 250116',
        'RFID1356.dll'
      )

      // Load the DLL using Koffi (no compilation needed!)
      const koffi = require('koffi')
      this.rfidLib = koffi.load(this.dllPath)

      // Define function prototypes based on RFID1356.h
      this.openhid = this.rfidLib.func('openhid', 'int', ['uint16', 'uint16', 'uint8'])
      this.closehid = this.rfidLib.func('closehid', 'int', [])
      this.openpcsc = this.rfidLib.func('openpcsc', 'int', ['uint8', koffi.pointer('char')])
      this.closepcsc = this.rfidLib.func('closepcsc', 'int', [])
      this.PiccReset = this.rfidLib.func('PiccReset', 'int', ['uint8'])
      this.PiccActivateA = this.rfidLib.func('PiccActivateA', 'int', [
        'uint8',  // mode
        'uint8',  // req_code
        koffi.pointer('uint8'),  // ATQ
        koffi.pointer('uint8'),  // SAK
        koffi.pointer('uint8'),  // UID length
        koffi.pointer('uint8')   // UID
      ])

      console.log('Koffi RFID Reader: DLL loaded successfully')
      return true
    } catch (error) {
      console.error('Koffi RFID Reader: Failed to load DLL', error.message)
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
      // Your reader uses ST Microelectronics USB controller
      const vendor_id = 0x0483  // ST Microelectronics vendor ID (found via testing)
      const product_id = 0x5750  // HID interface product ID (confirmed working)
      
      console.log('Koffi RFID Reader: Attempting HID connection...')
      const hidResult = this.openhid(vendor_id, product_id, 0)
      
      if (hidResult === 0) {
        console.log('Koffi RFID Reader: HID connection successful')
        this.connectionType = 'HID'
      } else {
        // Try PC/SC connection as fallback
        console.log('Koffi RFID Reader: HID failed, trying PC/SC...')
        const koffi = require('koffi')
        const readerName = 'ACS ACR122U PICC Interface'
        
        // Encode string to buffer (Koffi handles this automatically for strings)
        const pcscResult = this.openpcsc(readerName.length, readerName)
        
        if (pcscResult === 0) {
          console.log('Koffi RFID Reader: PC/SC connection successful')
          this.connectionType = 'PCSC'
        } else {
          throw new Error(`Failed to connect via HID (${hidResult}) or PC/SC (${pcscResult})`)
        }
      }

      // Reset the PICC interface
      const resetResult = this.PiccReset(1)  // 1ms reset
      if (resetResult !== 0) {
        console.warn(`Warning: PICC reset returned ${resetResult}`)
      }

      this.isConnected = true
      this.emit('connected')
      console.log('Koffi RFID Reader: Connected to XT-N424 WR via', this.connectionType)
      return true
    } catch (error) {
      console.error('Koffi RFID Reader: Connection failed', error)
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
        this.closehid()
      } else if (this.connectionType === 'PCSC') {
        this.closepcsc()
      }
      
      this.isConnected = false
      this.connectionType = null
      this.emit('disconnected')
      console.log('Koffi RFID Reader: Disconnected')
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
    console.log('Koffi RFID Reader: Started polling')

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
    console.log('Koffi RFID Reader: Stopped polling')
  }

  /**
   * Poll for card presence using Koffi
   */
  pollForCard() {
    try {
      if (!this.rfidLib || !this.isConnected) return

      // Allocate buffers for the card activation
      const koffi = require('koffi')
      const atqBuffer = koffi.alloc('uint8', 2)
      const sakBuffer = koffi.alloc('uint8', 1)
      const uidLenBuffer = koffi.alloc('uint8', 1)
      const uidBuffer = koffi.alloc('uint8', 10)  // Max UID length
      
      // Try to activate ISO14443-A card
      const activateResult = this.PiccActivateA(
        0,  // mode: 0 = activate if present
        0x52,  // req_code: WUPA (Wake Up)
        atqBuffer,
        sakBuffer, 
        uidLenBuffer,
        uidBuffer
      )
      
      if (activateResult === 0) {
        // Card detected successfully
        const uidLen = koffi.decode(uidLenBuffer, 'uint8')
        
        if (uidLen > 0 && uidLen <= 10) {
          // Extract UID bytes using koffi.decode
          const uidArray = koffi.decode(uidBuffer, koffi.array('uint8', uidLen))
          const uidBytes = []
          for (let i = 0; i < uidLen; i++) {
            uidBytes.push(uidArray[i].toString(16).padStart(2, '0').toUpperCase())
          }
          
          const uid = uidBytes.join('')
          
          if (uid && uid !== this.lastUID) {
            this.lastUID = uid
            
            const atqArray = koffi.decode(atqBuffer, koffi.array('uint8', 2))
            const sakValue = koffi.decode(sakBuffer, 'uint8')
            
            const sakHex = sakValue.toString(16).padStart(2, '0').toUpperCase()
            const atqHex = ((atqArray[1] << 8) | atqArray[0]).toString(16).padStart(4, '0').toUpperCase()
            
            const card = {
              uid: uid,
              type: this.detectCardType(uid, sakHex),
              timestamp: Date.now(),
              uidLength: uidLen,
              atq: atqHex,
              sak: sakHex
            }

            this.emit('cardDetected', card)
            console.log('Koffi RFID Reader: Card detected', uid)
          }
        }
      } else {
        // No card present or activation failed
        if (this.lastUID) {
          this.emit('cardRemoved')
          this.lastUID = ''
          console.log('Koffi RFID Reader: Card removed')
        }
      }
    } catch (error) {
      console.error('Koffi RFID Reader: Polling error', error)
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
      dllLoaded: !!this.rfidLib,
      connectionType: this.connectionType
    }
  }
}

module.exports = { KoffiRFIDReader }