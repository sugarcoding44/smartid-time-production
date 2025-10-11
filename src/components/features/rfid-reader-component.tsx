'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRFIDReader, RFIDCard, CardUtils } from '@/lib/rfid-reader'
import { Wifi, WifiOff, CreditCard, Smartphone, AlertCircle, CheckCircle, Radio } from 'lucide-react'
import { toast } from 'sonner'

interface RFIDReaderComponentProps {
  onCardDetected: (card: RFIDCard) => void
  isActive?: boolean
  title?: string
  description?: string
  showTestMode?: boolean
  className?: string
}

export function RFIDReaderComponent({
  onCardDetected,
  isActive = false,
  title = "RFID Card Reader",
  description = "Tap your NFC/RFID card to enroll it",
  showTestMode = true,
  className = ""
}: RFIDReaderComponentProps) {
  const [countdown, setCountdown] = useState(0)
  const [testUID, setTestUID] = useState('')
  const { isListening, lastCard, error, startListening, stopListening, simulateCard } = useRFIDReader()

  // Auto-start/stop listening based on isActive prop
  useEffect(() => {
    if (isActive) {
      startListening()
      setCountdown(30) // 30 second timeout
    } else {
      stopListening()
      setCountdown(0)
    }
  }, [isActive, startListening, stopListening])

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0 && isActive) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && isActive) {
      stopListening()
      toast.warning('Card reading timeout. Please try again.')
    }
  }, [countdown, isActive, stopListening])

  // Handle card detection
  useEffect(() => {
    if (lastCard) {
      onCardDetected(lastCard)
      toast.success(`Card detected: ${CardUtils.formatUID(lastCard.uid)}`)
    }
  }, [lastCard, onCardDetected])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(`RFID Reader Error: ${error}`)
    }
  }, [error])

  const handleTestCard = () => {
    if (testUID) {
      if (CardUtils.isValidUID(testUID)) {
        simulateCard(testUID)
      } else {
        toast.error('Invalid UID format. Please enter a valid hex string.')
      }
    } else {
      // Generate random test UID
      const randomUID = CardUtils.generateTestUID()
      setTestUID(randomUID)
      simulateCard(randomUID)
    }
  }

  const progress = countdown > 0 ? ((30 - countdown) / 30) * 100 : 0

  return (
    <Card className={`${className} ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isListening ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
            <Radio className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Reader Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isListening ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Reader Active
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-gray-400" />
                <Badge variant="outline" className="text-gray-500">
                  Reader Idle
                </Badge>
              </>
            )}
          </div>
          
          {countdown > 0 && (
            <Badge variant="outline" className="text-blue-600">
              {countdown}s remaining
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        {isActive && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Waiting for card...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Card Detection Status */}
        {lastCard ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-green-900">Card Detected Successfully</h4>
                <div className="text-sm text-green-700 mt-1 space-y-1">
                  <p><strong>UID:</strong> {CardUtils.formatUID(lastCard.uid)}</p>
                  <p><strong>Type:</strong> {lastCard.type.toUpperCase()}</p>
                  <p><strong>Time:</strong> {new Date(lastCard.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Reader Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : isListening ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
                <h3 className="font-medium text-blue-900">Ready to Scan</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Please tap your NFC/RFID card on the reader
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Instructions */}
        {!isActive && !lastCard && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">How to use:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Make sure your RFID reader is connected</li>
              <li>• Click "Issue Smart Card" to activate the reader</li>
              <li>• Tap your 13.56MHz NFC/RFID card on the reader</li>
              <li>• The card UID will be automatically captured</li>
            </ul>
          </div>
        )}

        {/* Test Mode */}
        {showTestMode && (
          <div className="border-t pt-4 space-y-3">
            <Label className="text-sm font-medium text-gray-700">Test Mode</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter test UID (e.g., 04AABBCC)"
                value={testUID}
                onChange={(e) => setTestUID(e.target.value)}
                className="font-mono text-sm"
              />
              <Button 
                variant="outline" 
                onClick={handleTestCard}
                className="whitespace-nowrap"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Simulate Card
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              For testing without a physical reader. Leave empty to generate random UID.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RFIDReaderComponent