'use client'

import { useState, useEffect } from 'react'

export default function LogoutAllPage() {
  const [status, setStatus] = useState('Initializing...')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    logoutAll()
  }, [])

  const logoutAll = async () => {
    try {
      setStatus('🔄 Contacting server to logout all sessions...')
      
      const response = await fetch('/api/auth/logout-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setStatus(`✅ Success! Logged out ${result.loggedOutCount} of ${result.totalUsers} users`)
        
        // Also clear local browser state
        setStatus(prev => prev + '\n🧹 Clearing browser data...')
        
        // Clear localStorage and sessionStorage
        localStorage.clear()
        sessionStorage.clear()
        
        // Clear all cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        setStatus(prev => prev + '\n🎉 All sessions and browser data cleared!')
        setIsComplete(true)
        
      } else {
        setStatus(`❌ Error: ${result.error}`)
        if (result.details) {
          setStatus(prev => prev + `\nDetails: ${result.details}`)
        }
      }
      
    } catch (error) {
      setStatus(`❌ Network error: ${error}`)
    }
  }

  const goToAuth = () => {
    window.location.href = '/auth'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            🚪 Global Logout
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Clearing all authentication sessions
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div className="text-center">
              {!isComplete && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              )}
              
              <div className="bg-gray-50 rounded p-4 text-left">
                <pre className="text-sm whitespace-pre-wrap text-gray-700">
                  {status}
                </pre>
              </div>
            </div>
            
            {isComplete && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <p className="text-green-800 text-sm">
                    ✅ All sessions have been cleared! You can now register or sign in with a clean state.
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={goToAuth}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    🔑 Go to Registration
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/auth/signin'}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    🔐 Go to Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            This will clear all user sessions and browser data for a fresh start.
          </p>
        </div>
      </div>
    </div>
  )
}
