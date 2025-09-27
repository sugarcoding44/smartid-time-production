'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processing authentication...')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const handleAuthCallback = async () => {
    try {
      // First check if there's session data in URL hash
      if (typeof window !== 'undefined') {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        
        if (accessToken) {
          console.log('Found access token in URL, setting session...')
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || ''
          })
          
          if (sessionError) {
            console.error('Session error:', sessionError)
            setStatus('error')
            setMessage('Failed to establish session. Please try again.')
            return
          }
          
          console.log('Session established for user:', session?.user?.id)
        }
      }
      
      // Now get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('User error:', userError)
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        return
      }

      console.log('User authenticated:', user.id, user.email)

      // Check if this is a signup that needs institution setup
      const type = searchParams.get('type')
      if (type === 'signup' && user.user_metadata?.pending_institution) {
        setStatus('success')
        setMessage('Email verified! Now set up your institution location.')
        // Skip complex setup for now, go directly to location setup
        setTimeout(() => router.push('/setup-location'), 2000)
      } else {
        // Regular login - redirect to dashboard
        setStatus('success')
        setMessage('Authentication successful!')
        setTimeout(() => router.push('/dashboard'), 2000)
      }

    } catch (error) {
      console.error('Auth callback error:', error)
      setStatus('error')
      setMessage('An unexpected error occurred.')
    }
  }

  const handleSkipToLocation = () => {
    router.push('/setup-location')
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  const getIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600 dark:text-blue-400'
      case 'success':
        return 'text-green-600 dark:text-green-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
    }
  }

  return (
    <AuthLayout
      title="Processing Authentication"
      subtitle="Please wait while we complete your setup"
    >
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 flex items-center justify-center">
          {getIcon()}
        </div>

        <div className="space-y-2">
          <h3 className={`text-lg font-semibold ${getStatusColor()}`}>
            {status === 'processing' && 'Verifying your email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        {status === 'error' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Something went wrong. You can try these options:
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleSkipToLocation}
                size="sm"
              >
                Set Up Location
              </Button>
              <Button
                onClick={handleGoToDashboard}
                size="sm"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            This should only take a moment...
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
