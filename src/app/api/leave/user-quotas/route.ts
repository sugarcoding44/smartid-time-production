import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')
    const currentYear = new Date().getFullYear()

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

    // Get all users in the institution
    const { data: users, error: usersError } = await serviceSupabase
      .from('users')
      .select('id, full_name, employee_id, primary_role, ic_number')
      .eq('institution_id', institutionId)
      .in('primary_system', ['time_web', 'time_mobile'])

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch users'
      }, { status: 500 })
    }

    // Get leave types for the institution
    const { data: leaveTypes, error: leaveTypesError } = await serviceSupabase
      .from('leave_types')
      .select('id, name, color, default_quota_days, allow_carry_forward')
      .eq('institution_id', institutionId)

    if (leaveTypesError) {
      console.error('Error fetching leave types:', leaveTypesError)
    }

    // Get user quotas (if quota system exists)
    const { data: userQuotaData, error: quotaError } = await serviceSupabase
      .from('user_leave_quotas')
      .select('*')
      .eq('quota_year', currentYear)

    // Try both table names - first leave_applications, then leave_requests as fallback
    let leaveRequests: any[] = []
    let requestsError: any = null
    
    // Try leave_applications first (newer table)
    const { data: leaveApps, error: appsError } = await serviceSupabase
      .from('leave_applications')
      .select(`
        user_id,
        leave_type_id,
        total_days,
        status,
        start_date,
        end_date
      `)
      .gte('start_date', `${currentYear}-01-01`)
      .lte('start_date', `${currentYear}-12-31`)
      .eq('status', 'approved')
    
    if (!appsError && leaveApps) {
      leaveRequests = leaveApps.map(app => ({
        ...app,
        days_count: app.total_days // normalize field name
      }))
    } else {
      // Fallback to leave_requests table
      const { data: leaveReqs, error: reqsError } = await serviceSupabase
        .from('leave_requests')
        .select(`
          user_id,
          leave_type_id,
          days_count,
          status,
          start_date,
          end_date
        `)
        .gte('start_date', `${currentYear}-01-01`)
        .lte('start_date', `${currentYear}-12-31`)
        .eq('status', 'approved')
      
      if (!reqsError && leaveReqs) {
        leaveRequests = leaveReqs
      } else {
        requestsError = reqsError || appsError
      }
    }

    // Check if we have any errors but still try to process with empty data
    if (requestsError) {
      console.warn('Warning: Failed to fetch leave requests:', requestsError.message)
      
      // If it's a table not found error, that's expected for new installations
      if (requestsError.message && (
        (requestsError.message.includes('relation') && requestsError.message.includes('does not exist')) ||
        requestsError.message.includes('schema cache') ||
        requestsError.message.includes('Could not find the table')
      )) {
        console.log('Leave tables not found - this is normal for new installations')
      }
      // Continue with empty leave requests array
    }

    // Get leave types with institution filter
    const { data: leaveTypesWithIds } = await serviceSupabase
      .from('leave_types')
      .select('id, name, color, default_quota_days')
      .eq('institution_id', institutionId)
      .eq('is_active', true)
    
    // Create leave type map for quick lookup
    const leaveTypeMap = new Map((leaveTypesWithIds || []).map(type => [type.id, type]))

    // Calculate quotas for each user
    const userQuotas = (users || []).map(user => {
      // Calculate total used leave for this year (approved only)
      const userLeaves = (leaveRequests || []).filter(
        req => req.user_id === user.id
      )
      
      const totalUsed = userLeaves.reduce((sum, leave) => sum + (leave.days_count || 0), 0)

      // Calculate quota by leave type
      const leaveTypeBreakdown = (leaveTypesWithIds || []).map(leaveType => {
        const typeLeaves = userLeaves.filter(leave => leave.leave_type_id === leaveType.id)
        const used = typeLeaves.reduce((sum, leave) => sum + (leave.days_count || 0), 0)
        
        // Check for user-specific quota or use default
        const userSpecificQuota = (userQuotaData || []).find(
          quota => quota.user_id === user.id && quota.leave_type_id === leaveType.id
        )
        
        const quota = userSpecificQuota?.allocated_days || leaveType.default_quota_days || 0
        
        return {
          leave_type_id: leaveType.id,
          name: leaveType.name,
          color: leaveType.color,
          quota: quota,
          used: used,
          remaining: Math.max(0, quota - used)
        }
      })

      const totalQuota = leaveTypeBreakdown.reduce((sum, type) => sum + type.quota, 0)
      const totalRemaining = Math.max(0, totalQuota - totalUsed)

      // Get recent leave history (last 5 leaves)
      const recentLeaves = userLeaves
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
        .slice(0, 5)
        .map(leave => {
          const leaveType = leaveTypeMap.get(leave.leave_type_id)
          return {
            leave_type_id: leave.leave_type_id,
            leave_type_name: leaveType?.name || 'Unknown',
            start_date: leave.start_date,
            end_date: leave.end_date,
            days_count: leave.days_count,
            status: leave.status
          }
        })

      return {
        user_id: user.id,
        user_name: user.full_name,
        employee_id: user.employee_id,
        ic_number: user.ic_number,
        role: user.primary_role,
        total_quota: totalQuota,
        total_used: totalUsed,
        total_remaining: totalRemaining,
        leave_types: leaveTypeBreakdown,
        recent_leaves: recentLeaves,
        year: currentYear
      }
    })

    return NextResponse.json({
      success: true,
      data: userQuotas
    })

  } catch (error) {
    console.error('User quotas API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}