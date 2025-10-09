import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (!institutionId) {
      return NextResponse.json(
        { success: false, error: 'Institution ID is required' },
        { status: 400 }
      )
    }

    // Get the authenticated user
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create service role client
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Try both table names - first leave_applications, then leave_requests as fallback
    let onLeaveData: any[] = []
    let onLeaveError: any = null
    
    // Try leave_applications first (newer table)
    const { data: leaveApps, error: appsError } = await serviceSupabase
      .from('leave_applications')
      .select(`
        id,
        user_id,
        leave_type_id,
        start_date,
        end_date,
        total_days,
        status
      `)
      .eq('status', 'approved')
      .lte('start_date', date)
      .gte('end_date', date)
    
    if (!appsError && leaveApps) {
      onLeaveData = leaveApps.map(app => ({
        ...app,
        days_count: app.total_days // normalize field name
      }))
    } else {
      // Fallback to leave_requests table
      const { data: leaveReqs, error: reqsError } = await serviceSupabase
        .from('leave_requests')
        .select(`
          id,
          user_id,
          leave_type_id,
          start_date,
          end_date,
          days_count,
          status
        `)
        .eq('status', 'approved')
        .lte('start_date', date)
        .gte('end_date', date)
      
      if (!reqsError && leaveReqs) {
        onLeaveData = leaveReqs
      } else {
        onLeaveError = reqsError || appsError
      }
    }

    if (onLeaveError) {
      console.error('Error fetching currently on leave:', onLeaveError)
      
      // Check if it's a table not found error or schema cache error
      if (onLeaveError.message && (
        (onLeaveError.message.includes('relation') && onLeaveError.message.includes('does not exist')) ||
        onLeaveError.message.includes('schema cache') ||
        onLeaveError.message.includes('Could not find the table')
      )) {
        return NextResponse.json({
          success: true,
          data: [], // Return empty array if tables don't exist yet
          message: 'Leave management system not set up yet'
        })
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch currently on leave data: ' + onLeaveError.message
      }, { status: 500 })
    }

    // Get unique user IDs and leave type IDs from the leave data
    const userIds = [...new Set(onLeaveData.map(record => record.user_id))]
    const leaveTypeIds = [...new Set(onLeaveData.map(record => record.leave_type_id).filter(Boolean))]
    
    // Fetch user data
    const { data: usersData } = await serviceSupabase
      .from('users')
      .select('id, full_name, employee_id, primary_role, ic_number, institution_id')
      .in('id', userIds)
      .eq('institution_id', institutionId)
    
    // Fetch leave type data
    const { data: leaveTypesData } = await serviceSupabase
      .from('leave_types')
      .select('id, name, color')
      .in('id', leaveTypeIds)
    
    // Create lookup maps
    const userMap = new Map(usersData?.map(user => [user.id, user]) || [])
    const leaveTypeMap = new Map(leaveTypesData?.map(type => [type.id, type]) || [])
    
    // Filter by institution and transform the data for frontend use
    const currentlyOnLeave = onLeaveData
      .filter(record => userMap.has(record.user_id)) // Only include users from the correct institution
      .map(record => {
        const user = userMap.get(record.user_id)
        const leaveType = leaveTypeMap.get(record.leave_type_id)
        const endDate = new Date(record.end_date)
        const currentDate = new Date(date)
        const timeDiff = endDate.getTime() - currentDate.getTime()
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))

        return {
          user_id: record.user_id,
          user_name: user?.full_name,
          employee_id: user?.employee_id,
          ic_number: user?.ic_number,
          role: user?.primary_role,
          leave_request_id: record.id,
          start_date: record.start_date,
          end_date: record.end_date,
          days_count: record.days_count,
          days_remaining: Math.max(0, daysRemaining),
          leave_type_name: leaveType?.name,
          leave_type_color: leaveType?.color,
          status: record.status
        }
      })

    return NextResponse.json({
      success: true,
      data: currentlyOnLeave
    })

  } catch (error) {
    console.error('Currently on leave API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}