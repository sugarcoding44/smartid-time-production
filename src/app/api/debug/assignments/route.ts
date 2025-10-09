import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { searchParams } = new URL(request.url)
    const workGroupId = searchParams.get('work_group_id')

    // Get all assignments (raw data)
    const { data: allAssignments, error: allError } = await supabase
      .from('user_work_group_assignments')
      .select('*')
      .order('created_at', { ascending: false })
    
    console.log('🔍 All assignments in database:', allAssignments)

    // Get assignments with user data
    const { data: assignmentsWithUsers, error: usersError } = await supabase
      .from('user_work_group_assignments')
      .select(`
        *,
        users (
          id,
          full_name,
          employee_id
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // If specific work group requested, filter it
    let filteredData = assignmentsWithUsers
    if (workGroupId) {
      filteredData = assignmentsWithUsers?.filter(a => a.work_group_id === workGroupId) || []
    }

    const currentDate = new Date().toISOString().split('T')[0]
    
    return NextResponse.json({
      success: true,
      debug: {
        currentDate,
        totalAssignments: allAssignments?.length || 0,
        activeAssignments: assignmentsWithUsers?.length || 0,
        filteredAssignments: filteredData?.length || 0,
        workGroupId,
        allAssignments: allAssignments?.slice(0, 5), // First 5 for debugging
        assignmentsWithUsers: filteredData?.slice(0, 5)
      }
    })

  } catch (error) {
    console.error('Error in debug assignments API:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}