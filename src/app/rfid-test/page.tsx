'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRFIDReader, CardUtils } from '@/lib/rfid-reader'
import { toast } from 'sonner'

export default function RFIDTestPage() {
  const [isActive, setIsActive] = useState(false)
  const { isListening, lastCard, error, startListening, stopListening } = useRFIDReader()

  const toggleReader = async () => {
    if (isActive) {
      stopListening()
      setIsActive(false)
      toast.info('RFID Reader stopped')
    } else {
      await startListening()
      setIsActive(true)
      toast.success('RFID Reader started - tap your card now!')
    }
  }

  useEffect(() => {
    if (lastCard) {
      console.log('REAL CARD DETECTED:', lastCard)
      toast.success(`Card UID: ${lastCard.uid}`)
    }
  }, [lastCard])

  useEffect(() => {
    if (error) {
      console.error('RFID Error:', error)
      toast.error(`Reader Error: ${error}`)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">RFID Reader Test</h1>
          <p className="text-gray-600">Direct hardware testing - NO mock data</p>
        </div>

        <Card className={isActive ? 'ring-2 ring-green-500' : ''}>
          <CardHeader>
            <CardTitle>XT-N424 WR Reader Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Reader Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={isListening ? "default" : "secondary"}>
                  {isListening ? "🟢 LISTENING" : "🔴 STOPPED"}
                </Badge>
                <span className="text-sm text-gray-500">
                  Status: {isListening ? 'Ready for card tap' : 'Click start to begin'}
                </span>
              </div>
              
              <Button 
                onClick={toggleReader}
                variant={isActive ? "destructive" : "default"}
              >
                {isActive ? "Stop Reader" : "Start Reader"}
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Testing Instructions:</h3>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Click "Start Reader" above</li>
                <li>2. Make sure this browser window is focused (click anywhere on page)</li>
                <li>3. Tap your 13.56MHz RFID card on the XT-N424 WR reader</li>
                <li>4. The UID should appear below automatically</li>
              </ol>
            </div>

            {/* Results */}
            {lastCard ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">✅ CARD DETECTED!</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Raw UID:</strong> <code className="bg-green-100 px-2 py-1 rounded">{lastCard.uid}</code></p>
                  <p><strong>Formatted:</strong> {CardUtils.formatUID(lastCard.uid)}</p>
                  <p><strong>Card Type:</strong> {lastCard.type.toUpperCase()}</p>
                  <p><strong>Detected At:</strong> {new Date(lastCard.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">❌ ERROR</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : isListening ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">🔄 WAITING FOR CARD</h3>
                <p className="text-sm text-yellow-700">
                  Listening for keyboard input from your XT-N424 WR reader...
                  <br />Tap your card on the reader now!
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">💤 READER IDLE</h3>
                <p className="text-sm text-gray-600">Click "Start Reader" to begin testing</p>
              </div>
            )}

            {/* Debug Info */}
            <details className="bg-gray-100 rounded-lg p-4">
              <summary className="cursor-pointer font-medium">Debug Information</summary>
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <p><strong>Reader Active:</strong> {isActive ? 'YES' : 'NO'}</p>
                <p><strong>Listening:</strong> {isListening ? 'YES' : 'NO'}</p>
                <p><strong>Last Error:</strong> {error || 'None'}</p>
                <p><strong>Browser Focus:</strong> {document.hasFocus() ? 'YES' : 'NO'}</p>
                <p><strong>Expected Behavior:</strong> Card tap → Keyboard input → UID capture</p>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}