'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Verifying email...')
  const supabase = createClient()

  const processSignupSetup = async (user: any) => {
    try {
      setStatus('Setting up your account...')
      console.log('📧 Processing signup setup for:', user.email)
      console.log('👤 Full user object:', JSON.stringify(user, null, 2))
      
      // Check if user has pending institution data
      const pendingInstitution = user.user_metadata?.pending_institution
      console.log('🏢 Pending institution data (raw):', pendingInstitution)
      console.log('🏢 Pending institution type:', typeof pendingInstitution)
      
      if (pendingInstitution) {
        console.log('🏗️ Found pending institution data, completing setup...')
        setStatus('Creating institution...')
        
        // Parse the institution data
        const institutionData = typeof pendingInstitution === 'string' 
          ? JSON.parse(pendingInstitution) 
          : pendingInstitution
        
        console.log('🏢 Parsed institution data:', institutionData)
        
        // Set session FIRST to ensure user is authenticated
        console.log('🔐 Setting session before API call...')
        try {
          // Get the tokens from the current auth context
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const urlParams = new URLSearchParams(window.location.search)
          const accessToken = hashParams.get('access_token') || urlParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token') || urlParams.get('refresh_token')
          
          if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (error) {
              console.error('❌ Pre-API session set error:', error)
            } else {
              console.log('✅ Pre-API session set successfully')
            }
          }
        } catch (preSessionError) {
          console.error('❌ Pre-API session setting failed:', preSessionError)
        }
        
        // Call complete-setup API
        console.log('🔄 Calling complete-setup API...')
        console.log('🔄 API payload:', {
          userId: user.id,
          institutionData
        })
        
        const response = await fetch('/api/auth/complete-setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            institutionData
          })
        })
        
        console.log('📍 Setup API response status:', response.status)
        const result = await response.json()
        console.log('📍 Setup API result:', result)
        console.log('📍 Response OK check:', response.ok)
        
        if (!response.ok) {
          console.error('❌ Setup completion failed:', result.error)
          setStatus(`Setup failed: ${result.error}`)
          toast.error(result.error || 'Failed to complete setup')
          console.log('❌ Redirecting to signin due to API error')
          setTimeout(() => router.push('/auth/signin'), 3000)
          return
        } else {
          console.log('✅ API call successful, proceeding with setup completion')
        }
        
        console.log('✅ Setup completed successfully')
        
        // Check if API specified a redirect path
        const redirectPath = result.redirect || '/setup-location'
        console.log('📍 API redirect suggestion:', result.redirect)
        console.log('📍 Final redirect path determined:', redirectPath)
        
        // TEMPORARY: Try immediate redirect for testing
        console.log('🚀 TESTING: Attempting immediate redirect...')
        window.location.href = redirectPath
        
        if (redirectPath === '/dashboard') {
          setStatus('Account already set up! Redirecting to dashboard...')
          toast.success('Welcome back!')
        } else {
          setStatus('Setup complete! Redirecting to location setup...')
          toast.success('Institution created successfully!')
        }
        
        // Set the session in Supabase before redirect to maintain auth state
        console.log('🔐 Setting Supabase session before redirect...')
        try {
          // Get the tokens from URL
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const urlParams = new URLSearchParams(window.location.search)
          const accessToken = hashParams.get('access_token') || urlParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token') || urlParams.get('refresh_token')
          
          console.log('🔑 Tokens available:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            accessTokenLength: accessToken?.length,
            refreshTokenLength: refreshToken?.length
          })
          
          if (accessToken && refreshToken) {
            console.log('🔄 Attempting to set session...')
            // Set the session explicitly with timeout
            try {
              const sessionPromise = supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              })
              
              // Add timeout to prevent hanging
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Session timeout')), 5000)
              )
              
              const { data, error } = await Promise.race([sessionPromise, timeoutPromise]) as any
              
              if (error) {
                console.error('❌ Session set error:', error)
              } else {
                console.log('✅ Session set successfully:', {
                  hasUser: !!data?.user,
                  hasSession: !!data?.session,
                  userEmail: data?.user?.email
                })
              }
            } catch (sessionError) {
              console.error('❌ Session setting timed out or failed:', sessionError)
            }
          } else {
            console.warn('⚠️ Missing tokens for session setup')
          }
        } catch (sessionError) {
          console.error('❌ Failed to set session:', sessionError)
        }
        
        // Always redirect regardless of session setting result
        console.log('🔄 Preparing redirect to:', redirectPath)
        
        // Redirect based on API response - use window.location to bypass middleware
        setTimeout(() => {
          console.log('🔄 Redirecting to:', redirectPath)
          console.log('🌐 Using window.location.href for direct navigation')
          window.location.href = redirectPath
        }, 2000)
      } else {
        console.log('⚠️ No pending institution data found!')
        console.log('📊 User metadata keys:', Object.keys(user.user_metadata || {}))
        console.log('📊 Full user metadata:', JSON.stringify(user.user_metadata, null, 2))
        setStatus('No setup data found. Redirecting to dashboard...')
        setTimeout(() => router.push('/dashboard'), 1500)
      }
    } catch (error) {
      console.error('❌ Setup error:', error)
      setStatus('Setup failed')
      toast.error('Setup failed')
      setTimeout(() => router.push('/auth/signin'), 3000)
    }
  }

  useEffect(() => {
    // Remove the failsafe timeout that's interfering

    const handleCallback = async () => {
      try {
        console.log('🔄 Callback started')
        console.log('🔍 URL:', window.location.href)
        console.log('🔍 Hash:', window.location.hash)
        console.log('🔍 Search:', window.location.search)
        
        // Handle Supabase auth callback first
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const urlParams = new URLSearchParams(window.location.search)
        
        const accessToken = hashParams.get('access_token') || urlParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token') || urlParams.get('refresh_token')
        const type = hashParams.get('type') || urlParams.get('type') || searchParams.get('type')
        const error = hashParams.get('error') || urlParams.get('error')
        
        console.log('🔍 Auth params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type,
          error
        })
        
        if (error) {
          console.error('❌ Auth error:', error)
          setStatus('Authentication failed')
          setTimeout(() => router.push('/auth/signin'), 2000)
          return
        }
        
        // If this is a signup callback, process setup directly using token
        if (type === 'signup' && accessToken) {
          console.log('📧 This is a signup callback - processing setup directly')
          
          try {
            // Parse JWT token to get user info directly
            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
            console.log('🔑 Token payload:', tokenPayload)
            
            const userId = tokenPayload.sub
            const email = tokenPayload.email
            const userMetadata = tokenPayload.user_metadata
            
            console.log('👤 User ID from token:', userId)
            console.log('📧 Email from token:', email)
            console.log('📋 User metadata from token:', userMetadata)
            
            if (userId && userMetadata?.pending_institution) {
              // Create a fake user object to pass to processSignupSetup
              const fakeUser = {
                id: userId,
                email: email,
                user_metadata: userMetadata
              }
              
              console.log('✅ Calling processSignupSetup directly with token data')
              await processSignupSetup(fakeUser)
              return
            } else {
              console.log('⚠️ No pending institution in token metadata')
              setStatus('No setup data found. Redirecting...')
              setTimeout(() => router.push('/dashboard'), 2000)
              return
            }
          } catch (tokenError) {
            console.error('❌ Failed to parse token:', tokenError)
            setStatus('Failed to process authentication')
            setTimeout(() => router.push('/auth/signin'), 2000)
            return
          }
        }
        
        console.log('🔍 Callback type:', type)
        
        // If we reach here and it's not a signup, redirect to dashboard
        console.log('📋 Regular signin or no user found, redirecting to dashboard')
        setStatus('Redirecting to dashboard...')
        setTimeout(() => router.push('/dashboard'), 1000)
      } catch (error) {
        console.error('❌ Callback error:', error)
        setStatus('An error occurred during authentication')
        toast.error('An error occurred during authentication')
        setTimeout(() => {
          console.log('🔄 Error occurred, redirecting to signin...')
          router.push('/auth/signin')
        }, 3000)
      }
    }

    console.log('🕰️ Starting callback immediately...')
    // Start callback immediately without delay
    handleCallback()
    
    // Cleanup function (no timers to clear)
    return () => {
      console.log('💭 Callback cleanup')
    }
  }, [router, searchParams, supabase])

  return (
    <AuthLayout
      title="Setting Up Your Account"
      subtitle="Please wait while we complete the setup process"
    >
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            Email Verified!
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {status}
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
