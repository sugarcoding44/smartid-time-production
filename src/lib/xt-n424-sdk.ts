/**
 * X-Telcom XT-N424 WR SDK Integration
 * Uses the RFID1356.dll from NTAG424 SDK
 */

import { EventEmitter } from 'events'

export interface XTCard {
  uid: string
  type: 'ntag424' | 'mifare' | 'unknown'
  timestamp: number
  atr?: string
  data?: any
}

export class XTelcomReader extends EventEmitter {
  private isConnected: boolean = false
  private polling: boolean = false
  private pollInterval?: NodeJS.Timeout
  private lastUID: string = ''

  constructor() {
    super()
  }

  /**
   * Initialize the reader connection
   */
  async connect(): Promise<boolean> {
    try {
      // For now, we'll simulate the connection
      // In a real implementation, this would load the DLL and call connection functions
      this.isConnected = true
      this.emit('connected')
      console.log('XT-N424 WR: Connected')
      return true
    } catch (error) {
      console.error('XT-N424 WR: Connection failed', error)
      this.emit('error', error)
      return false
    }
  }

  /**
   * Disconnect from reader
   */
  async disconnect(): Promise<void> {
    this.isConnected = false
    this.stopPolling()
    this.emit('disconnected')
    console.log('XT-N424 WR: Disconnected')
  }

  /**
   * Start polling for cards
   */
  startPolling(intervalMs: number = 1000): void {
    if (!this.isConnected) {
      throw new Error('Reader not connected')
    }

    if (this.polling) {
      return
    }

    this.polling = true
    console.log('XT-N424 WR: Started polling')

    this.pollInterval = setInterval(() => {
      this.pollForCard()
    }, intervalMs)
  }

  /**
   * Stop polling for cards
   */
  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = undefined
    }
    this.polling = false
    console.log('XT-N424 WR: Stopped polling')
  }

  /**
   * Manual card detection (for testing)
   */
  simulateCardDetection(uid: string): void {
    const card: XTCard = {
      uid: uid.toUpperCase(),
      type: this.detectCardType(uid),
      timestamp: Date.now()
    }

    this.lastUID = card.uid
    this.emit('cardDetected', card)
    console.log('XT-N424 WR: Card detected (simulated)', card.uid)
  }

  /**
   * Poll for card presence (placeholder - would use actual SDK calls)
   */
  private async pollForCard(): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Call RFID1356.dll functions to check for card presence
      // 2. Read card UID using SDK functions
      // 3. Emit card events
      
      // For now, we'll create a placeholder that can be triggered manually
      // This simulates the polling behavior
      
    } catch (error) {
      console.error('XT-N424 WR: Polling error', error)
      this.emit('error', error)
    }
  }

  /**
   * Detect card type from UID
   */
  private detectCardType(uid: string): 'ntag424' | 'mifare' | 'unknown' {
    const uidLength = uid.replace(/[^0-9A-F]/g, '').length
    
    if (uidLength === 14) {
      return 'ntag424' // NTAG424 typically has 7-byte UID
    } else if (uidLength === 8) {
      return 'mifare' // MIFARE Classic has 4-byte UID
    }
    
    return 'unknown'
  }

  /**
   * Get reader status
   */
  getStatus(): { connected: boolean, polling: boolean } {
    return {
      connected: this.isConnected,
      polling: this.polling
    }
  }
}

/**
 * React hook for X-Telcom reader
 */
import React from 'react'

export function useXTelcomReader() {
  const [isConnected, setIsConnected] = React.useState(false)
  const [isPolling, setIsPolling] = React.useState(false)
  const [lastCard, setLastCard] = React.useState<XTCard | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const readerRef = React.useRef<XTelcomReader | null>(null)

  React.useEffect(() => {
    readerRef.current = new XTelcomReader()

    const handleConnected = () => {
      setIsConnected(true)
      setError(null)
    }

    const handleDisconnected = () => {
      setIsConnected(false)
      setIsPolling(false)
    }

    const handleCardDetected = (card: XTCard) => {
      setLastCard(card)
      setError(null)
    }

    const handleError = (err: Error) => {
      setError(err.message)
      console.error('XT-N424 WR Error:', err)
    }

    readerRef.current.on('connected', handleConnected)
    readerRef.current.on('disconnected', handleDisconnected)
    readerRef.current.on('cardDetected', handleCardDetected)
    readerRef.current.on('error', handleError)

    return () => {
      if (readerRef.current) {
        readerRef.current.removeAllListeners()
        readerRef.current.disconnect()
      }
    }
  }, [])

  const connect = React.useCallback(async () => {
    if (readerRef.current) {
      const success = await readerRef.current.connect()
      return success
    }
    return false
  }, [])

  const disconnect = React.useCallback(async () => {
    if (readerRef.current) {
      await readerRef.current.disconnect()
    }
  }, [])

  const startPolling = React.useCallback(() => {
    if (readerRef.current && isConnected) {
      readerRef.current.startPolling()
      setIsPolling(true)
    }
  }, [isConnected])

  const stopPolling = React.useCallback(() => {
    if (readerRef.current) {
      readerRef.current.stopPolling()
      setIsPolling(false)
    }
  }, [])

  const simulateCard = React.useCallback((uid: string) => {
    if (readerRef.current) {
      readerRef.current.simulateCardDetection(uid)
    }
  }, [])

  return {
    isConnected,
    isPolling,
    lastCard,
    error,
    connect,
    disconnect,
    startPolling,
    stopPolling,
    simulateCard
  }
}