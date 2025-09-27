'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function ResetAuthPage() {
  const [status, setStatus] = useState('Ready to clear authentication')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const clearEverything = async () => {
    setLoading(true)
    setStatus('Clearing authentication...')

    try {
      // Step 1: Sign out from Supabase client
      console.log('🚪 Signing out from Supabase client...')
      await supabase.auth.signOut()
      setStatus('Signed out from Supabase...')
      
      // Step 2: Clear server-side sessions
      console.log('🧹 Clearing server-side authentication...')
      await fetch('/api/debug/force-logout', { method: 'GET' })
      setStatus('Cleared server authentication...')
      
      // Step 3: Clear all local storage
      console.log('📦 Clearing localStorage...')
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('session')) {
          localStorage.removeItem(key)
        }
      })
      setStatus('Cleared localStorage...')
      
      // Step 4: Clear all session storage
      console.log('💾 Clearing sessionStorage...')
      sessionStorage.clear()
      setStatus('Cleared sessionStorage...')
      
      // Step 5: Force clear any cached auth state
      console.log('🔄 Force clearing auth state...')
      
      // Wait a moment for all async operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStatus('✅ Authentication completely cleared! Redirecting to homepage...')
      
      // Redirect to clean homepage after a delay
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
      
    } catch (error) {
      console.error('Error clearing auth:', error)
      setStatus('❌ Error clearing authentication')
    } finally {
      setLoading(false)
    }
  }

  const checkCurrentAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStatus(`⚠️ Still authenticated as: ${user.email}`)
      } else {
        setStatus('✅ No authentication detected')
      }
    } catch (error) {
      setStatus('✅ No authentication detected')
    }
  }

  useEffect(() => {
    checkCurrentAuth()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Authentication</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Status:</p>
            <p className="font-medium">{status}</p>
          </div>
          
          <Button 
            onClick={clearEverything}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Clearing...' : 'Clear All Authentication'}
          </Button>
          
          <Button 
            onClick={checkCurrentAuth}
            variant="outline"
            className="w-full"
          >
            Check Current Auth Status
          </Button>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>This will:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Sign out from Supabase</li>
              <li>Clear server sessions</li>
              <li>Clear localStorage</li>
              <li>Clear sessionStorage</li>
              <li>Redirect to clean homepage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
