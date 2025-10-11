'use client'

import React from 'react'
import { RFIDReaderComponent } from '@/components/features/rfid-reader-component'
import { RFIDAttendance } from '@/components/features/rfid-attendance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RFIDCard } from '@/lib/rfid-reader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function RFIDDemoPage() {
  const handleCardEnrollment = (card: RFIDCard) => {
    console.log('Card enrolled:', card)
  }

  const handleAttendanceRecord = (record: any) => {
    console.log('Attendance recorded:', record)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            RFID Integration Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            13.56MHz NFC/RFID Card Enrollment and Attendance System
          </p>
          <div className="flex justify-center gap-3">
            <Badge variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-800">
              MIFARE Compatible
            </Badge>
            <Badge variant="secondary" className="px-3 py-1 bg-green-100 text-green-800">
              Keyboard Wedge
            </Badge>
            <Badge variant="secondary" className="px-3 py-1 bg-purple-100 text-purple-800">
              PC/SC Ready
            </Badge>
          </div>
        </div>

        {/* Demo Tabs */}
        <Tabs defaultValue="enrollment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="enrollment">Card Enrollment</TabsTrigger>
            <TabsTrigger value="attendance">Attendance System</TabsTrigger>
            <TabsTrigger value="integration">Integration Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>RFID Card Enrollment</CardTitle>
                <CardDescription>
                  Test the card enrollment process that's integrated into your existing card issuance system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RFIDReaderComponent
                  onCardDetected={handleCardEnrollment}
                  isActive={false}
                  title="Test Card Enrollment"
                  description="Tap your NFC/RFID card or use test mode"
                  showTestMode={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <RFIDAttendance
              onAttendanceRecord={handleAttendanceRecord}
              deviceId="DEMO_READER_01"
              location="Demo Location"
            />
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Hardware Setup */}
              <Card>
                <CardHeader>
                  <CardTitle>Hardware Setup</CardTitle>
                  <CardDescription>Requirements and configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Supported Readers:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 13.56MHz NFC/RFID readers</li>
                      <li>• Keyboard wedge mode readers</li>
                      <li>• PC/SC compatible readers</li>
                      <li>• ACR122U, Identiv readers</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Card Types:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• MIFARE Classic 1K/4K</li>
                      <li>• MIFARE Ultralight</li>
                      <li>• NTAG213/215/216</li>
                      <li>• ISO14443 Type A cards</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Software Integration */}
              <Card>
                <CardHeader>
                  <CardTitle>Integration Flow</CardTitle>
                  <CardDescription>How the system works</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Card Enrollment:</h4>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Go to Cards → Issue Smart Card</li>
                      <li>2. Select user and click "Issue Card"</li>
                      <li>3. System prompts for RFID card tap</li>
                      <li>4. Card UID is captured and stored</li>
                      <li>5. Card is programmed and printed</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Attendance Tracking:</h4>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Employee taps enrolled card</li>
                      <li>2. System looks up user by RFID UID</li>
                      <li>3. Records check-in/check-out time</li>
                      <li>4. Updates attendance status</li>
                      <li>5. Shows confirmation to user</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* API Endpoints */}
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoints</CardTitle>
                  <CardDescription>Available API routes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Smart Cards API:</h4>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      POST /api/smart-cards<br/>
                      {`{ user_id, card_number, rfid_uid }`}
                    </code>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">RFID Attendance API:</h4>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      POST /api/attendance/rfid-checkin<br/>
                      {`{ rfid_uid, device_id, location }`}
                    </code>
                  </div>
                </CardContent>
              </Card>

              {/* Database Updates */}
              <Card>
                <CardHeader>
                  <CardTitle>Database Schema</CardTitle>
                  <CardDescription>Required fields and relationships</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">smart_cards table:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• <code>nfc_id</code> - stores RFID UID</li>
                      <li>• <code>card_number</code> - card display number</li>
                      <li>• <code>user_id</code> - linked user</li>
                      <li>• <code>status</code> - active/inactive</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">attendance_records table:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• <code>verification_method</code> - RFID_CARD</li>
                      <li>• <code>device_id</code> - reader identifier</li>
                      <li>• <code>location</code> - physical location</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-blue-900">Ready to Use!</h3>
              <p className="text-sm text-blue-700">
                The RFID integration is now fully integrated into your existing smartID Time system. 
                Go to <strong>Dashboard → Cards</strong> to start enrolling users, or use the attendance 
                components in your time tracking interfaces.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}