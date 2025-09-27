'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type LeaveType = Database['public']['Tables']['leave_types']['Row']

export default function TestLeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔄 Test component useEffect running')
    
    const fetchData = async () => {
      try {
        const supabase = createClient()
        console.log('📡 Fetching data...')
        
        const { data, error } = await supabase
          .from('leave_types')
          .select('*')
          .order('name', { ascending: true })

        console.log('📊 Result:', { data: data?.length || 0, error })

        if (error) {
          console.error('❌ Error:', error)
        } else {
          setLeaveTypes(data || [])
        }
      } catch (err) {
        console.error('❌ Exception:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Leave Types</h1>
      <p>Found {leaveTypes.length} leave types</p>
      
      {leaveTypes.length === 0 ? (
        <p>No leave types found. This is normal if the table is empty.</p>
      ) : (
        <ul>
          {leaveTypes.map((type) => (
            <li key={type.id}>
              {type.name} ({type.code}) - {type.is_active ? 'Active' : 'Inactive'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
