'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useRFIDReader, RFIDCard, CardUtils } from '@/lib/rfid-reader'
import { Clock, UserCheck, UserX, Wifi, WifiOff, AlertCircle, CheckCircle, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

interface AttendanceRecord {
  id: string
  user_id: string
  check_in_time?: string
  check_out_time?: string
  status: 'present' | 'absent' | 'late'
  verification_method: string
  user: {
    full_name: string
    employee_id: string
    department: string
  }
}

interface RFIDAttendanceProps {
  onAttendanceRecord?: (record: AttendanceRecord) => void
  className?: string
  deviceId?: string
  location?: string
}

export function RFIDAttendance({
  onAttendanceRecord,
  className = "",
  deviceId = "RFID_READER_01",
  location = "Main Entrance"
}: RFIDAttendanceProps) {
  const [isActive, setIsActive] = useState(false)
  const [lastAttendance, setLastAttendance] = useState<AttendanceRecord | null>(null)
  const [processing, setProcessing] = useState(false)
  const { isListening, lastCard, error, startListening, stopListening } = useRFIDReader()

  const handleCardDetected = useCallback(async (card: RFIDCard) => {
    if (processing) return
    
    setProcessing(true)
    
    try {
      // Call attendance API
      const response = await fetch('/api/attendance/rfid-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfid_uid: card.uid,
          device_id: deviceId,
          location: location,
          verification_method: 'RFID_CARD'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record attendance')
      }

      const attendanceRecord: AttendanceRecord = {
        id: data.attendance_id,
        user_id: data.user_id,
        check_in_time: data.check_in_time,
        check_out_time: data.check_out_time,
        status: data.status,
        verification_method: 'RFID_CARD',
        user: {
          full_name: data.user_name,
          employee_id: data.employee_id,
          department: data.department || 'N/A'
        }
      }

      setLastAttendance(attendanceRecord)
      onAttendanceRecord?.(attendanceRecord)

      // Show success message
      const action = data.check_out_time ? 'Check-out' : 'Check-in'
      toast.success(`${action} successful for ${data.user_name}`)

    } catch (error) {
      console.error('Attendance error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to record attendance')
    } finally {
      setProcessing(false)
    }
  }, [processing, deviceId, location, onAttendanceRecord])

  // Handle card detection
  useEffect(() => {
    if (lastCard && isActive) {
      handleCardDetected(lastCard)
    }
  }, [lastCard, isActive, handleCardDetected])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(`RFID Reader Error: ${error}`)
    }
  }, [error])

  const toggleReader = async () => {
    if (isActive) {
      stopListening()
      setIsActive(false)
    } else {
      await startListening()
      setIsActive(true)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <Card className={`${className} ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isListening ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
              <Clock className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <CardTitle className="text-lg">RFID Attendance System</CardTitle>
              <CardDescription>13.56MHz NFC/RFID card reader for time tracking</CardDescription>
            </div>
          </div>
          
          <Button
            onClick={toggleReader}
            variant={isActive ? "destructive" : "default"}
            size="sm"
          >
            {isActive ? (
              <>
                <WifiOff className="w-4 h-4 mr-2" />
                Stop Reader
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                Start Reader
              </>
            )}
          </Button>
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
          
          <div className="text-sm text-gray-500">
            Device: {deviceId} | Location: {location}
          </div>
        </div>

        {/* Processing Indicator */}
        {processing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing attendance...</span>
            </div>
            <Progress value={50} className="h-2" />
          </div>
        )}

        {/* Last Attendance Record */}
        {lastAttendance ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-green-900">Attendance Recorded</h4>
                <div className="text-sm text-green-700 mt-1 space-y-1">
                  <p><strong>Employee:</strong> {lastAttendance.user.full_name} ({lastAttendance.user.employee_id})</p>
                  <p><strong>Department:</strong> {lastAttendance.user.department}</p>
                  {lastAttendance.check_in_time && (
                    <p><strong>Check-in:</strong> {formatTime(lastAttendance.check_in_time)}</p>
                  )}
                  {lastAttendance.check_out_time && (
                    <p><strong>Check-out:</strong> {formatTime(lastAttendance.check_out_time)}</p>
                  )}
                  <p><strong>Status:</strong> 
                    <Badge variant="outline" className={`ml-2 ${
                      lastAttendance.status === 'present' ? 'bg-green-50 text-green-700' :
                      lastAttendance.status === 'late' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {lastAttendance.status.toUpperCase()}
                    </Badge>
                  </p>
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
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Click "Start Reader" to activate the RFID reader</li>
              <li>• Employees can tap their enrolled NFC/RFID cards</li>
              <li>• The system will automatically record check-in/check-out times</li>
              <li>• Attendance status is determined based on work schedules</li>
            </ul>
          </div>
        )}

        {/* Stats */}
        {lastAttendance && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                <UserCheck className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-sm text-gray-500 mt-1">Check-ins Today</div>
              <div className="text-lg font-semibold">--</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                <UserX className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-sm text-gray-500 mt-1">Check-outs Today</div>
              <div className="text-lg font-semibold">--</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                <Clock className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-sm text-gray-500 mt-1">Late Arrivals</div>
              <div className="text-lg font-semibold">--</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RFIDAttendance