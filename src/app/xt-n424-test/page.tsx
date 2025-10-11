'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useXTelcomReader, XTCard } from '@/lib/xt-n424-sdk'
import { toast } from 'sonner'

export default function XTN424TestPage() {
  const [testUID, setTestUID] = useState('A0AC391A') // Your card's actual UID
  const { 
    isConnected, 
    isPolling, 
    lastCard, 
    error, 
    connect, 
    disconnect, 
    startPolling, 
    stopPolling, 
    simulateCard 
  } = useXTelcomReader()

  const handleConnect = async () => {
    const success = await connect()
    if (success) {
      toast.success('XT-N424 WR Connected!')
    } else {
      toast.error('Failed to connect to XT-N424 WR')
    }
  }

  const handleStartPolling = () => {
    try {
      startPolling()
      toast.success('Started polling for cards')
    } catch (err) {
      toast.error('Failed to start polling')
    }
  }

  const handleSimulateCard = () => {
    if (testUID) {
      simulateCard(testUID)
      toast.success(`Simulated card tap: ${testUID}`)
    }
  }

  const handleEnrollCard = async () => {
    if (lastCard) {
      // Test the Supabase integration
      try {
        const response = await fetch('/api/smart-cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: 'test-user-id', // You can replace with actual user ID
            card_number: lastCard.uid,
            rfid_uid: lastCard.uid
          })
        })

        const data = await response.json()

        if (response.ok) {
          toast.success(`Card enrolled! UID: ${lastCard.uid}`)
        } else {
          toast.error(`Enrollment failed: ${data.error}`)
        }
      } catch (error) {
        toast.error('Failed to enroll card')
        console.error('Enrollment error:', error)
      }
    }
  }

  const handleTestAttendance = async () => {
    if (lastCard) {
      try {
        const response = await fetch('/api/attendance/rfid-checkin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rfid_uid: lastCard.uid,
            device_id: 'XT-N424-WR-01',
            location: 'Main Entrance',
            verification_method: 'RFID_CARD'
          })
        })

        const data = await response.json()

        if (response.ok) {
          toast.success(`Attendance recorded for ${data.user_name || 'user'}`)
        } else {
          toast.error(`Attendance failed: ${data.error}`)
        }
      } catch (error) {
        toast.error('Failed to record attendance')
        console.error('Attendance error:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">XT-N424 WR SDK Integration</h1>
          <p className="text-gray-600">X-Telcom NTAG424 Reader with Supabase Integration</p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Reader Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "default" : "secondary"}>
                  {isConnected ? "🟢 CONNECTED" : "🔴 DISCONNECTED"}
                </Badge>
                <Badge variant={isPolling ? "default" : "secondary"}>
                  {isPolling ? "📡 POLLING" : "💤 IDLE"}
                </Badge>
              </div>
              <div className="flex gap-2">
                {!isConnected ? (
                  <Button onClick={handleConnect}>Connect XT-N424 WR</Button>
                ) : (
                  <Button variant="outline" onClick={disconnect}>Disconnect</Button>
                )}
              </div>
            </div>

            {isConnected && !isPolling && (
              <Button onClick={handleStartPolling} className="w-full">
                Start Card Polling
              </Button>
            )}

            {isPolling && (
              <Button onClick={stopPolling} variant="outline" className="w-full">
                Stop Polling
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Card Detection */}
        <Card>
          <CardHeader>
            <CardTitle>Card Detection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastCard ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">✅ CARD DETECTED</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>UID:</strong> <code className="bg-green-100 px-2 py-1 rounded">{lastCard.uid}</code></p>
                  <p><strong>Type:</strong> {lastCard.type.toUpperCase()}</p>
                  <p><strong>Detected:</strong> {new Date(lastCard.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleEnrollCard} size="sm">
                    Enroll Card
                  </Button>
                  <Button onClick={handleTestAttendance} variant="outline" size="sm">
                    Test Attendance
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">🔄 WAITING FOR CARD</h3>
                <p className="text-sm text-blue-700">
                  {isPolling 
                    ? "Polling for cards... Place your card on the XT-N424 WR reader."
                    : "Start polling to detect cards."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Test with Known Card UID</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter card UID (e.g., A0AC391A)"
                  value={testUID}
                  onChange={(e) => setTestUID(e.target.value)}
                  className="font-mono"
                />
                <Button onClick={handleSimulateCard}>
                  Simulate Card Tap
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Use your actual card UID: A0AC391A (from COMM software)
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Integration Status</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p>✅ SDK Integration: Ready</p>
                <p>✅ Supabase API: Available</p>
                <p>✅ Card Enrollment: Functional</p>
                <p>✅ Attendance Tracking: Functional</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">❌ ERROR</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-1">Step 1: Connect</h4>
                <p className="text-sm text-gray-600">Click "Connect XT-N424 WR" to initialize the SDK</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Step 2: Start Polling</h4>
                <p className="text-sm text-gray-600">Click "Start Card Polling" to begin detecting cards</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Step 3: Test Card Detection</h4>
                <p className="text-sm text-gray-600">Use "Simulate Card Tap" with your card UID: A0AC391A</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Step 4: Test Integration</h4>
                <p className="text-sm text-gray-600">Once a card is detected, use "Enroll Card" or "Test Attendance"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}