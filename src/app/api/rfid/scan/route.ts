import { NextRequest, NextResponse } from 'next/server'

// CORS handler
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { timeout = 10000, reader_type = 'XT-N424-WR' } = body

    console.log(`🔍 Starting REAL RFID scan with ${reader_type} reader (timeout: ${timeout}ms)`)

    // DIRECT Koffi integration - embedded to avoid module resolution issues
    try {
      console.log('📡 Initializing Koffi RFID reader...')
      const koffi = require('koffi')
      const path = require('path')
      
      // DLL path
      const dllPath = path.join(
        'C:', 'Users', 'user', 'Downloads', 'NTAG424_SDK',
        'NTAG424  Tag SDK and demo',
        'COMM-demo software 250116',
        'COMM-demo software 250116',
        'RFID1356.dll'
      )
      
      // Load DLL
      console.log('📖 Loading DLL:', dllPath)
      const rfidLib = koffi.load(dllPath)
      
      // Define functions
      const openhid = rfidLib.func('openhid', 'int', ['uint16', 'uint16', 'uint8'])
      const closehid = rfidLib.func('closehid', 'int', [])
      const PiccReset = rfidLib.func('PiccReset', 'int', ['uint8'])
      const PiccActivateA = rfidLib.func('PiccActivateA', 'int', [
        'uint8',
        'uint8',
        koffi.pointer('uint8'),
        koffi.pointer('uint8'),
        koffi.pointer('uint8'),
        koffi.pointer('uint8')
      ])
      
      // Connect to reader
      console.log('🔌 Connecting to XT-N424 WR reader...')
      const vendor_id = 0x0483
      const product_id = 0x5750
      const hidResult = openhid(vendor_id, product_id, 0)
      
      if (hidResult !== 0) {
        throw new Error(`Failed to connect to HID reader: ${hidResult}`)
      }
      
      console.log('✅ Connected to reader via HID')
      
      // Reset PICC
      PiccReset(1)
      
      // Poll for card
      const startTime = Date.now()
      let cardDetected: any = null
      
      console.log('🔄 Polling for card...')
      while (Date.now() - startTime < timeout && !cardDetected) {
        const atqBuffer = koffi.alloc('uint8', 2)
        const sakBuffer = koffi.alloc('uint8', 1)
        const uidLenBuffer = koffi.alloc('uint8', 1)
        const uidBuffer = koffi.alloc('uint8', 10)
        
        const activateResult = PiccActivateA(
          0,
          0x52,
          atqBuffer,
          sakBuffer,
          uidLenBuffer,
          uidBuffer
        )
        
        if (activateResult === 0) {
          const uidLen = koffi.decode(uidLenBuffer, 'uint8')
          if (uidLen > 0 && uidLen <= 10) {
            const uidArray = koffi.decode(uidBuffer, koffi.array('uint8', uidLen))
            const uidBytes = []
            for (let i = 0; i < uidLen; i++) {
              uidBytes.push(uidArray[i].toString(16).padStart(2, '0').toUpperCase())
            }
            const uid = uidBytes.join('')
            
            const atqArray = koffi.decode(atqBuffer, koffi.array('uint8', 2))
            const sakValue = koffi.decode(sakBuffer, 'uint8')
            
            cardDetected = {
              uid,
              uidLength: uidLen,
              atq: ((atqArray[1] << 8) | atqArray[0]).toString(16).padStart(4, '0').toUpperCase(),
              sak: sakValue.toString(16).padStart(2, '0').toUpperCase()
            }
            break
          }
        }
        
        // Wait 200ms before next poll
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Disconnect
      closehid()
      
      if (!cardDetected) {
        throw new Error('Scan timeout - no card detected')
      }
      
      console.log(`✅ REAL CARD DETECTED: ${cardDetected.uid}`)
      
      // Detect card type based on ATQ/SAK values
      let cardType = 'unknown'
      let cardChipType = 'unknown'
      const atqValue = parseInt(cardDetected.atq, 16)
      const sakValue = parseInt(cardDetected.sak, 16)
      
      // Card type detection logic based on ISO14443A standards
      if (sakValue === 0x00) {
        if (atqValue === 0x4400) {
          cardType = 'nfc'
          cardChipType = 'ultralight'
        } else if (atqValue === 0x0044) {
          cardType = 'nfc' 
          cardChipType = 'ntag213'
        }
      } else if (sakValue === 0x08) {
        cardType = 'rfid'
        cardChipType = 'mifare_classic_1k'
      } else if (sakValue === 0x18) {
        cardType = 'rfid'
        cardChipType = 'mifare_classic_4k'
      } else if (sakValue === 0x20) {
        cardType = 'nfc'
        cardChipType = 'ntag424'
      } else if (sakValue === 0x04) {
        cardType = 'nfc'
        cardChipType = 'ntag215'
      } else {
        // Generic detection based on UID pattern
        if (cardDetected.uid.startsWith('04')) {
          cardType = 'nfc'
          cardChipType = cardDetected.uidLength === 7 ? 'ntag213' : 'ntag215'
        } else {
          cardType = 'rfid'
          cardChipType = 'mifare_classic'
        }
      }
      
      console.log(`🔍 Card type detected: ${cardType}, chip: ${cardChipType} (ATQ: ${cardDetected.atq}, SAK: ${cardDetected.sak})`)
      
      return NextResponse.json({
        success: true,
        card_uid: cardDetected.uid,
        reader_type: reader_type,
        detected_at: new Date().toISOString(),
        card_type: cardType,
        card_chip_type: cardChipType,
        manufacturer: cardDetected.uid.startsWith('04') ? 'NXP' : 'Unknown',
        technical_data: {
          atq: cardDetected.atq,
          sak: cardDetected.sak,
          uid_length: cardDetected.uidLength
        }
      }, { headers: corsHeaders() })
      
    } catch (koffiError: any) {
      console.error('🚨 Koffi RFID Error:', koffiError.message)
      return NextResponse.json({
        success: false,
        error: 'No card detected',
        message: koffiError.message || 'Please place a card on the reader and try again'
      }, { status: 400, headers: corsHeaders() })
    }

    // TODO: Real RFID reader implementation would look like this:
    /*
    try {
      // Initialize connection to XT-N424 WR reader
      const reader = new RFID_Reader({
        port: 'COM3', // or USB/serial port
        baudRate: 115200,
        timeout: timeout
      })
      
      // Send scan command
      const scanResult = await reader.scanCard()
      
      if (scanResult.card_detected) {
        return NextResponse.json({
          success: true,
          card_uid: scanResult.uid,
          reader_type: reader_type,
          detected_at: new Date().toISOString(),
          signal_strength: scanResult.signal_strength,
          card_type: scanResult.card_type,
          manufacturer: scanResult.manufacturer,
          technical_data: {
            atq: scanResult.atq,
            sak: scanResult.sak,
            memory_size: scanResult.memory_size
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'No card detected',
          message: 'Please place a card on the reader and try again'
        }, { status: 400 })
      }
    } catch (readerError) {
      console.error('RFID Reader Error:', readerError)
      return NextResponse.json({
        success: false,
        error: 'Reader connection failed',
        message: 'Unable to connect to RFID reader. Please check connection.'
      }, { status: 500 })
    }
    */

  } catch (error) {
    console.error('❌ RFID scan error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `RFID scan failed: ${error}`,
        message: 'An error occurred while scanning for cards'
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function GET() {
  // Get reader status
  return NextResponse.json({
    reader_status: 'connected', // mock status
    reader_type: 'XT-N424-WR',
    firmware_version: '2.1.4',
    connection_type: 'USB',
    supported_card_types: [
      'MIFARE Classic 1K/4K',
      'MIFARE Ultralight',
      'NTAG213/215/216',
      'NTAG424 DNA',
      'ISO14443A'
    ],
    ready: true
  }, {
    headers: corsHeaders()
  })
}