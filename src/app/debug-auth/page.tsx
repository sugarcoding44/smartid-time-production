'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugAuthPage() {
  const [authUser, setAuthUser] = useState<any>(null)
  const [dbUser, setDbUser] = useState<any>(null)
  const [institution, setInstitution] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check auth user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      setAuthUser(user)
      console.log('Auth user:', user)

      if (user) {
        // Check database user
        const { data: dbUserData, error: dbUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        console.log('DB user:', dbUserData, 'Error:', dbUserError)
        setDbUser(dbUserData)

        if (dbUserData?.institution_id) {
          // Check institution
          const { data: institutionData, error: institutionError } = await supabase
            .from('institutions')
            .select('*')
            .eq('id', dbUserData.institution_id)
            .single()
          
          console.log('Institution:', institutionData, 'Error:', institutionError)
          setInstitution(institutionData)
        }
      }
    } catch (error) {
      console.error('Debug error:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearAuth = async () => {
    await supabase.auth.signOut()
    setAuthUser(null)
    setDbUser(null)
    setInstitution(null)
    window.location.href = '/auth'
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <button 
        onClick={clearAuth}
        className="mb-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear Auth & Redirect to Login
      </button>

      <div className="space-y-6">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Auth User</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(authUser, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Database User</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(dbUser, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Institution</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(institution, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
