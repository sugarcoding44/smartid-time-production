'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { RFIDReaderComponent } from './rfid-reader-component'
import { RFIDCard, CardUtils } from '@/lib/rfid-reader'

interface CardIssuanceModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    fullName: string
    employeeId: string
    userType: string
  }
  onIssuanceComplete: (userId: string, cardId: string, rfidUID?: string) => void
}

export function CardIssuanceModal({ isOpen, onClose, user, onIssuanceComplete }: CardIssuanceModalProps) {
  const [step, setStep] = useState<'instructions' | 'rfid-scan' | 'programming' | 'printing' | 'success' | 'error'>('instructions')
  const [progress, setProgress] = useState(0)
  const [cardId, setCardId] = useState('')
  const [rfidUID, setRfidUID] = useState('')
  const [detectedCard, setDetectedCard] = useState<RFIDCard | null>(null)
  const [issueAttempts, setIssueAttempts] = useState(0)

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setStep('instructions')
      setProgress(0)
      setCardId('')
      setRfidUID('')
      setDetectedCard(null)
      setIssueAttempts(0)
    }
  }, [isOpen])

  const startIssuance = () => {
    setStep('rfid-scan')
    setProgress(0)
    setIssueAttempts(prev => prev + 1)
  }

  const handleRFIDCardDetected = (card: RFIDCard) => {
    setDetectedCard(card)
    setRfidUID(card.uid)
    
    // Proceed to programming after a short delay
    setTimeout(() => {
      continueWithProgramming()
    }, 1500)
  }

  const continueWithProgramming = () => {
    setStep('programming')
    setProgress(0)

    // Simulate card programming process
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 50) {
          clearInterval(interval)
          setStep('printing')
          
          // Continue with printing phase
          const printInterval = setInterval(() => {
            setProgress(prev => {
              if (prev >= 100) {
                clearInterval(printInterval)
                
                // Simulate final processing
                setTimeout(() => {
                  const success = Math.random() > 0.05 // 95% success rate
                  if (success) {
                    // Use RFID UID as card number, or generate one if not available
                    const newCardId = rfidUID || `CRD${Math.floor(Math.random() * 100000)}`
                    setCardId(newCardId)
                    setStep('success')
                    setTimeout(() => {
                      onIssuanceComplete(user.id, newCardId, rfidUID)
                      onClose()
                      toast.success(`Smart card issued successfully for ${user.fullName}`)
                    }, 2000)
                  } else {
                    setStep('error')
                  }
                }, 1000)
                
                return 100
              }
              return prev + 2
            })
          }, 30)
          
          return 50
        }
        return prev + 2
      })
    }, 40)
  }

  const retryIssuance = () => {
    if (issueAttempts >= 3) {
      toast.error('Maximum issuance attempts reached. Please check card stock and try again later.')
      onClose()
      return
    }
    startIssuance()
  }

  const renderContent = () => {
    switch (step) {
      case 'instructions':
        return (
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">💳</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Smart Card Issuance</h3>
              <p className="text-gray-600 mb-4">
                Issue a new smart card for {user.fullName}.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2">Card Details:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Name:</strong> {user.fullName}</p>
                  <p><strong>Employee ID:</strong> {user.employeeId}</p>
                  <p><strong>Type:</strong> {user.userType}</p>
                  <p><strong>Features:</strong> Access Control, Attendance, Payments</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  📡 This process will enroll the user's physical RFID card and then program it.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Ensure RFID reader is connected and card printer has sufficient card stock.
                </p>
              </div>
            </div>
            <Button 
              onClick={startIssuance} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Issue Smart Card
            </Button>
          </div>
        )

      case 'rfid-scan':
        return (
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">📡</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">RFID Card Enrollment</h3>
              <p className="text-gray-600 mb-4">
                Please tap your NFC/RFID card on the reader to enroll it with {user.fullName}'s account.
              </p>
              <RFIDReaderComponent
                onCardDetected={handleRFIDCardDetected}
                isActive={true}
                title="Smart Card Reader"
                description="13.56MHz NFC/RFID card enrollment"
                showTestMode={true}
                className="max-w-md mx-auto"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('instructions')} className="flex-1">
                Back
              </Button>
              {detectedCard && (
                <Button onClick={continueWithProgramming} className="flex-1 bg-gradient-to-r from-green-600 to-green-700">
                  Continue with {CardUtils.formatUID(detectedCard.uid)}
                </Button>
              )}
            </div>
          </div>
        )

      case 'programming':
        return (
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4 animate-pulse">💳</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Programming Card...</h3>
              <p className="text-gray-600 mb-4">Writing user data to smart card chip</p>
              <Progress value={progress} className="w-full mb-2" />
              <p className="text-sm text-gray-500">{progress}% complete</p>
            </div>
            <Badge variant="outline" className="animate-pulse">
              🟡 Programming in progress...
            </Badge>
          </div>
        )

      case 'printing':
        return (
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4 animate-bounce">🖨️</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Printing Card...</h3>
              <p className="text-gray-600 mb-4">Printing card design and user information</p>
              <Progress value={progress} className="w-full mb-2" />
              <p className="text-sm text-gray-500">{progress}% complete</p>
            </div>
            <Badge variant="outline" className="animate-pulse">
              🔵 Printing in progress...
            </Badge>
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">✅</div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-700">Card Issued Successfully!</h3>
              <p className="text-gray-600 mb-4">Smart card has been programmed and printed successfully.</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Card ID:</strong> {cardId}
                </p>
                {rfidUID && (
                  <p className="text-sm text-green-800">
                    <strong>RFID UID:</strong> {CardUtils.formatUID(rfidUID)}
                  </p>
                )}
                {detectedCard && (
                  <p className="text-sm text-green-800">
                    <strong>Card Type:</strong> {detectedCard.type.toUpperCase()}
                  </p>
                )}
                <p className="text-sm text-green-800">
                  <strong>User:</strong> {user?.fullName} ({user?.employeeId})
                </p>
                <p className="text-sm text-green-800">
                  <strong>Status:</strong> Active
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-blue-800">
                  📋 Please collect the physical card from the printer and hand it to the user.
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              ✓ Card Issued
            </Badge>
          </div>
        )

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">❌</div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-red-700">Card Issuance Failed</h3>
              <p className="text-gray-600 mb-4">
                Smart card could not be issued. Please check printer status and card stock.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  Attempt {issueAttempts} of 3 failed
                </p>
                <p className="text-sm text-red-800">
                  Possible causes: Out of cards, printer offline, hardware malfunction
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={retryIssuance} className="flex-1 bg-gradient-to-r from-red-600 to-red-700">
                Retry Issuance
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
          <DialogTitle>Smart Card Issuance</DialogTitle>
          <DialogDescription>
            Issue smart card for {user.fullName} ({user.employeeId})
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
