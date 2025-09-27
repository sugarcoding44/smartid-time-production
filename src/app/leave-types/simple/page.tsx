'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type LeaveType = Database['public']['Tables']['leave_types']['Row']

export default function SimpleLeaveTypesPage() {
  const [data, setData] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔥 Simple component mounted')
    
    const loadData = async () => {
      try {
        console.log('📡 Making direct API call...')
        const supabase = createClient()
        
        const { data: result, error: dbError } = await supabase
          .from('leave_types')
          .select('*')
          .order('name', { ascending: true })
        
        console.log('📊 API result:', { 
          count: result?.length || 0, 
          hasError: !!dbError,
          error: dbError 
        })
        
        if (dbError) {
          setError(dbError.message)
        } else {
          setData(result || [])
        }
      } catch (err) {
        console.error('❌ Exception:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
        console.log('✅ Loading complete')
      }
    }

    loadData()
  }, [])

  console.log('🔄 Component render - loading:', loading, 'data count:', data.length)

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Simple Leave Types Test</h1>
        
        {loading && <p>Loading...</p>}
        
        {error && <p className="text-red-500">Error: {error}</p>}
        
        {!loading && !error && (
          <div>
            <p>Found {data.length} leave types</p>
            {data.length === 0 && (
              <p className="mt-4 text-gray-500">
                No leave types found. This is normal if the table is empty.
              </p>
            )}
            {data.map((type) => (
              <div key={type.id} className="border p-4 mb-2 rounded">
                <h3 className="font-bold">{type.name}</h3>
                <p>Code: {type.code}</p>
                <p>Active: {type.is_active ? 'Yes' : 'No'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
