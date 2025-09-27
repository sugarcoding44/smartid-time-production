'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface PalmEnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    full_name: string
    employee_id: string
    role: string
    palm_id?: string | null
    isReEnrollment?: boolean
  }
  onEnrollmentComplete: (userId: string, palmId: string) => void
}

export function PalmEnrollmentModal({ isOpen, onClose, user, onEnrollmentComplete }: PalmEnrollmentModalProps) {
  const [step, setStep] = useState<'instructions' | 'scanning' | 'processing' | 'success' | 'error'>('instructions')
  const [progress, setProgress] = useState(0)
  const [palmId, setPalmId] = useState('')
  const [scanAttempts, setScanAttempts] = useState(0)

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setStep('instructions')
      setProgress(0)
      setPalmId('')
      setScanAttempts(0)
    }
  }, [isOpen])

  const startScanning = async () => {
    setStep('scanning')
    setProgress(0)
    setScanAttempts(prev => prev + 1)

    try {
      console.log(`Starting palm scanning for ${user.full_name}...`)
      
      // First check if scanner is ready
      const deviceResponse = await fetch('/api/palm/scanner/device')
      const deviceData = await deviceResponse.json()
      
      if (!deviceData.success || !deviceData.data.is_ready) {
        console.warn('Palm scanner not ready, attempting initialization...')
        
        // Try to initialize the scanner
        const initResponse = await fetch('/api/palm/scanner/device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'initialize' })
        })
        
        const initData = await initResponse.json()
        if (!initData.success) {
          throw new Error(initData.error || 'Failed to initialize palm scanner')
        }
      }
      
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90 // Hold at 90% until capture completes
          }
          return prev + 5
        })
      }, 200)
      
      console.log('🤚 Calling palm scanner capture API...')
      
      // Capture palm using the real SDK
      const captureResponse = await fetch('/api/palm/scanner/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          hand_type: 'right',
          quality_threshold: 70,
          timeout_ms: 10000,
          capture_images: true,
          enrollment_session_id: `enrollment_${user.id}_${Date.now()}`
        })
      })
      
      clearInterval(progressInterval)
      setProgress(100)
      setStep('processing')
      
      const captureData = await captureResponse.json()
      
      // Wait a moment for processing animation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (captureData.success && captureData.data.template_data) {
        const qualityScore = captureData.data.quality_score || 95
        const newPalmId = `PLM${Date.now()}_${Math.floor(Math.random() * 10000)}`
        
        console.log(`✅ Palm capture successful for ${user.full_name}:`, {
          quality: qualityScore,
          palmId: newPalmId,
          captureTime: captureData.data.capture_duration_ms
        })
        
        setPalmId(newPalmId)
        setStep('success')
        
        // Complete enrollment after showing success
        setTimeout(() => {
          onEnrollmentComplete(user.id, newPalmId)
          onClose()
          toast.success(`Palm biometric ${user.isReEnrollment ? 're-enrolled' : 'enrolled'} successfully for ${user.full_name}`)
        }, 2000)
      } else {
        console.log('❌ Palm capture failed:', captureData.error || captureData.details)
        setStep('error')
        toast.error(captureData.error || 'Palm capture failed. Please try again.')
      }
      
    } catch (error) {
      console.error('Error during palm scanning:', error)
      setStep('error')
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred during palm scanning')
    }
  }

  const retryScanning = () => {
    if (scanAttempts >= 3) {
      toast.error('Maximum scan attempts reached. Please try again later.')
      onClose()
      return
    }
    startScanning()
  }

  const renderContent = () => {
    switch (step) {
      case 'instructions':
        return (
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">✋</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Palm Biometric {user.isReEnrollment ? 'Re-enrollment' : 'Enrollment'}
              </h3>
              <p className="text-gray-600 mb-4">
                Please follow the instructions to {user.isReEnrollment ? 're-enroll' : 'enroll'} {user.full_name}&apos;s palm biometric.
              </p>
              {user.isReEnrollment && user.palm_id && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-800">
                    <strong>Current Palm ID:</strong> {user.palm_id}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    This will be replaced with a new palm template.
                  </p>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Place your palm flat on the scanner</li>
                  <li>• Keep your hand steady during scanning</li>
                  <li>• Do not move until scanning is complete</li>
                  <li>• Ensure good lighting and clean hands</li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={startScanning} 
              className={`w-full ${user.isReEnrollment 
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800' 
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
              }`}
            >
              {user.isReEnrollment ? 'Start Re-enrollment Scan' : 'Start Palm Scan'}
            </Button>
          </div>
        )

      case 'scanning':
        return (
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4 animate-pulse">✋</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Scanning Palm...</h3>
              <p className="text-gray-600 mb-4">Place your palm flat on the scanner and keep it steady</p>
              <Progress value={progress} className="w-full mb-2" />
              <p className="text-sm text-gray-500">{progress}% complete</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                <span>Using X-Telcom Palm SDK v1.3.41</span>
              </div>
            </div>
            <Badge variant="outline" className="animate-pulse">
              🔴 Hardware scanning in progress...
            </Badge>
          </div>
        )

      case 'processing':
        return (
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">⚙️</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Processing Biometric Data</h3>
              <p className="text-gray-600">Extracting palm vein features using advanced algorithms...</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span>Processing IR and RGB palm data...</span>
              </div>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">✅</div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-700">
                {user.isReEnrollment ? 'Re-enrollment Successful!' : 'Enrollment Successful!'}
              </h3>
              <p className="text-gray-600 mb-4">
                Palm biometric has been successfully {user.isReEnrollment ? 're-enrolled' : 'enrolled'}.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Palm ID:</strong> {palmId}
                </p>
                <p className="text-sm text-green-800">
                  <strong>User:</strong> {user?.full_name} ({user?.employee_id})
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              ✓ Biometric Enrolled
            </Badge>
          </div>
        )

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">❌</div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-red-700">Enrollment Failed</h3>
              <p className="text-gray-600 mb-4">
                Palm scan could not be completed. Please ensure proper hand placement and try again.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  Attempt {scanAttempts} of 3 failed
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Check device connection and ensure palm is properly positioned
                </p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
              <div className="font-medium mb-1">Tips for successful enrollment:</div>
              <ul className="text-left space-y-1 ml-4">
                <li>• Ensure palm scanner is connected and powered</li>
                <li>• Place palm flat on scanner surface</li>
                <li>• Keep hand steady during scanning</li>
                <li>• Ensure adequate lighting</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={retryScanning} className="flex-1 bg-gradient-to-r from-red-600 to-red-700">
                Retry Scan ({3 - scanAttempts} attempts left)
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Don't render modal if user is null
  if (!user) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Palm Biometric {user.isReEnrollment ? 'Re-enrollment' : 'Enrollment'}
          </DialogTitle>
          <DialogDescription>
            {user.isReEnrollment ? 'Re-enroll' : 'Enroll'} palm biometric for {user.full_name} ({user.employee_id})
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          {renderContent()}
        </div>
        {step === 'instructions' && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
