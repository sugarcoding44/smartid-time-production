'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthLayout } from '@/components/layout/auth-layout'
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
            setTimeout(() => router.push('/auth'), 3000)
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
        setTimeout(() => router.push('/auth'), 3000)
        return
      }

      console.log('User authenticated:', user.id, user.email)

      // Check if this is a signup that needs institution setup
      const type = searchParams.get('type')
      if (type === 'signup' && user.user_metadata?.pending_institution) {
        setMessage('Setting up your institution...')
        
        try {
          const institutionData = JSON.parse(user.user_metadata.pending_institution)
          console.log('Processing institution setup for:', institutionData)

          // Call our API to complete the institution setup with timeout
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
          
          const response = await fetch('/api/auth/complete-setup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              institutionData
            }),
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)

          const result = await response.json()

          if (response.ok) {
            if (result.redirect) {
              setStatus('success')
              setMessage('Welcome back! Redirecting to dashboard...')
              setTimeout(() => router.push(result.redirect), 2000)
            } else {
              setStatus('success')
              setMessage('Institution setup complete! Now set up your location.')
              // Redirect to location setup page
              setTimeout(() => router.push('/setup-location'), 2000)
            }
          } else {
            throw new Error(result.error || 'Setup failed')
          }

        } catch (setupError) {
          console.error('Institution setup error:', setupError)
          setStatus('error')
          
          if (setupError instanceof Error && setupError.name === 'AbortError') {
            setMessage('Setup timed out. Redirecting to dashboard...')
            setTimeout(() => router.push('/dashboard'), 3000)
          } else {
            setMessage('Failed to set up institution. Please contact support.')
          }
        }
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
      setTimeout(() => router.push('/auth'), 3000)
    }
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
            {status === 'processing' && 'Setting up your account...'}
            {status === 'success' && 'Setup Complete!'}
            {status === 'error' && 'Setup Failed'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        {status === 'processing' && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            This may take a few moments...
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
