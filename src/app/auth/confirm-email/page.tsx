'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { CheckCircle, Mail, RefreshCw } from 'lucide-react'

export default function ConfirmEmailPage() {
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const handleResendEmail = async () => {
    if (!email) return
    
    setResendLoading(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setResendMessage('Verification email sent successfully!')
      } else {
        setResendMessage(result.error || 'Failed to resend email. Please try again.')
      }
    } catch (error) {
      setResendMessage('Failed to resend email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Check Your Email"
      subtitle="We've sent you a verification link to complete your registration"
    >
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Verification Email Sent
          </h3>
          {email && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We've sent a verification link to <strong>{email}</strong>
            </p>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Next Steps:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
                <li>1. Check your email inbox (and spam folder)</li>
                <li>2. Click the verification link in the email</li>
                <li>3. Your institution will be set up automatically</li>
                <li>4. You can then sign in to your SmartID Hub</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the email?
          </p>
          
          <Button
            onClick={handleResendEmail}
            disabled={resendLoading || !email}
            variant="outline"
            className="w-full"
          >
            {resendLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </>
            )}
          </Button>
          
          {resendMessage && (
            <p className={`text-sm ${
              resendMessage.includes('successfully') 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {resendMessage}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Having trouble? Contact support at{' '}
            <a href="mailto:support@smartidhq.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              support@smartidhq.com
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
