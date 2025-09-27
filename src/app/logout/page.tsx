'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutPage() {
  const [status, setStatus] = useState('Logging out...')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    logout()
  }, [])

  const logout = async () => {
    try {
      // Clear local auth state
      setStatus('Clearing authentication state...')
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
        setStatus(`Logout error: ${error.message}`)
      } else {
        setStatus('Logged out successfully!')
      }
      
      // Clear all cookies manually
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/auth/signin'
      }, 2000)
      
    } catch (error) {
      console.error('Logout error:', error)
      setStatus(`Unexpected error: ${error}`)
    }
  }

  const forceRedirect = () => {
    window.location.href = '/auth/signin'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Logging Out
          </h2>
          <p className="mt-4 text-gray-600">{status}</p>
          
          <div className="mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
          
          <div className="mt-8">
            <button
              onClick={forceRedirect}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Sign In Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
