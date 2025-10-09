import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// CORS headers for mobile app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const employeeId = searchParams.get('employeeId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId && !employeeId) {
      return NextResponse.json({
        success: false,
        error: 'Either userId or employeeId is required'
      }, { status: 400, headers: corsHeaders })
    }

    let user: any = null

    // Find user by employee_id if provided, otherwise by user ID
    if (employeeId) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, institution_id, full_name, employee_id')
        .eq('employee_id', employeeId)
        .eq('status', 'active')
        .single()

      if (userError || !userData) {
        return NextResponse.json({
          success: false,
          error: 'User not found with provided employee ID'
        }, { status: 404, headers: corsHeaders })
      }

      user = userData
    } else {
      // Look up user by auth_user_id (from Supabase Auth)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, institution_id, full_name, employee_id, auth_user_id')
        .eq('auth_user_id', userId)
        .eq('status', 'active')
        .single()

      if (userError || !userData) {
        return NextResponse.json({
          success: false,
          error: 'User not found with provided auth user ID'
        }, { status: 404, headers: corsHeaders })
      }

      user = userData
    }

    // Get leave history for the user
    const { data: leaveHistory, error: historyError } = await supabase
      .from('leave_applications')
      .select(`
        id,
        application_number,
        start_date,
        end_date,
        total_days,
        reason,
        status,
        applied_date,
        approved_date,
        rejected_date,
        approval_comments,
        rejection_reason,
        created_at,
        leave_types!leave_applications_leave_type_id_fkey (
          id,
          name,
          code,
          color
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (historyError) {
      console.error('Error fetching leave history:', historyError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch leave history'
      }, { status: 500, headers: corsHeaders })
    }

    // Format the response for mobile app
    const formattedHistory = leaveHistory?.map(leave => ({
      id: leave.id,
      applicationNumber: leave.application_number,
      leaveType: (leave.leave_types as any)?.name || 'Unknown',
      leaveTypeCode: (leave.leave_types as any)?.code || '',
      startDate: leave.start_date,
      endDate: leave.end_date,
      totalDays: leave.total_days,
      reason: leave.reason,
      status: leave.status,
      appliedDate: leave.applied_date,
      approvedDate: leave.approved_date,
      rejectedDate: leave.rejected_date,
      approvalComments: leave.approval_comments,
      rejectionReason: leave.rejection_reason,
      createdAt: leave.created_at
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedHistory,
      source: 'database'
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error in leave history API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500, headers: corsHeaders })
  }
}