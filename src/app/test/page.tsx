'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestPage() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...')
  const [authState, setAuthState] = useState<any>(null)
  const [manualLogout, setManualLogout] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test Supabase connection
      const { data, error } = await supabase
        .from('institutions')
        .select('count')
        .limit(1)

      if (error) {
        setConnectionStatus(`❌ Connection Error: ${error.message}`)
      } else {
        setConnectionStatus('✅ Supabase connected successfully!')
      }

      // Check auth state
      const { data: { session } } = await supabase.auth.getSession()
      setAuthState({
        hasSession: !!session,
        userId: session?.user?.id || null,
        email: session?.user?.email || null
      })

    } catch (error) {
      setConnectionStatus(`❌ Unexpected error: ${error}`)
    }
  }

  const handleManualLogout = async () => {
    try {
      setManualLogout(true)
      
      // Clear Supabase session
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      }
      
      // Clear all local storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      alert('Logged out! You can now go to /auth/signin')
      
      // Refresh auth state
      testConnection()
      
    } catch (error) {
      console.error('Manual logout error:', error)
    } finally {
      setManualLogout(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 SmartID Test Page</h1>
        
        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Database Connection</h2>
            <p className="text-lg">{connectionStatus}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            {authState ? (
              <div className="space-y-2">
                <p><strong>Has Session:</strong> {authState.hasSession ? '✅ Yes' : '❌ No'}</p>
                <p><strong>User ID:</strong> {authState.userId || 'None'}</p>
                <p><strong>Email:</strong> {authState.email || 'None'}</p>
              </div>
            ) : (
              <p>Loading auth state...</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={testConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🔄 Refresh Connection Test
              </button>
              
              <button
                onClick={handleManualLogout}
                disabled={manualLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {manualLogout ? '🔄 Logging out...' : '🚪 Force Logout'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Navigation</h2>
            <div className="space-y-2">
              <a href="/auth" className="block text-blue-600 hover:underline">🔑 Go to Registration</a>
              <a href="/auth/signin" className="block text-blue-600 hover:underline">🔐 Go to Sign In</a>
              <a href="/dashboard" className="block text-blue-600 hover:underline">📊 Go to Dashboard</a>
              <a href="/logout" className="block text-blue-600 hover:underline">🚪 Logout Page</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
