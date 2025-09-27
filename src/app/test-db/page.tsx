'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestDbPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')
  const [schools, setSchools] = useState<Array<Record<string, unknown>>>([])
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([])
  
  const supabase = createClient()

  const testConnection = useCallback(async () => {
    try {
      // Test basic connection
      const { error: healthError } = await supabase
        .from('institutions')
        .select('count')
        .limit(1)

      if (healthError) {
        setConnectionStatus(`Connection Error: ${healthError.message}`)
        return
      }

      setConnectionStatus('✅ Connected successfully!')

      // Fetch institution data
      const { data: schoolData, error: schoolError } = await supabase
        .from('institutions')
        .select('*')
        .limit(10)

      if (schoolError) {
        console.error('School registry error:', schoolError)
      } else {
        setSchools(schoolData || [])
      }

      // Fetch users data  
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(10)

      if (userError) {
        console.error('Users error:', userError)
      } else {
        setUsers(userData || [])
      }

    } catch (error) {
      setConnectionStatus(`Unexpected error: ${error}`)
    }
  }, [supabase])

  useEffect(() => {
    testConnection()
  }, [testConnection])

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <p className="text-lg">{connectionStatus}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Institutions ({schools.length})</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {schools.length > 0 ? (
              schools.map((school) => (
                <div key={school.id as string} className="p-3 bg-gray-50 rounded border">
                  <p><strong>Name:</strong> {school.name as string}</p>
                  <p><strong>Type:</strong> {school.type as string}</p>
                  <p><strong>Email:</strong> {school.email as string}</p>
                  <p><strong>Plan:</strong> {school.subscription_plan as string}</p>
                  <p><strong>Created:</strong> {school.created_at as string}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No institutions registered yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Users ({users.length})</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user.id as string} className="p-3 bg-gray-50 rounded border">
                  <p><strong>Name:</strong> {user.full_name as string}</p>
                  <p><strong>ID:</strong> {user.employee_id as string}</p>
                  <p><strong>Role:</strong> {user.primary_role as string}</p>
                  <p><strong>System:</strong> {user.primary_system as string}</p>
                  <p><strong>IC:</strong> {user.ic_number as string}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No users registered yet</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button 
          onClick={testConnection}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Refresh Data
        </button>
      </div>
    </div>
  )
}
