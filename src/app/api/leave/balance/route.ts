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
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, institution_id, full_name, employee_id')
        .eq('id', userId)
        .eq('status', 'active')
        .single()

      if (userError || !userData) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404, headers: corsHeaders })
      }

      user = userData
    }

    // Get leave types for the institution
    const { data: leaveTypes, error: leaveTypesError } = await supabase
      .from('leave_types')
      .select('id, name, default_quota_days')
      .eq('institution_id', user.institution_id)
      .eq('is_active', true)

    if (leaveTypesError) {
      console.error('Error fetching leave types:', leaveTypesError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch leave types'
      }, { status: 500, headers: corsHeaders })
    }

    // Calculate total leave balance from all leave types
    let totalLeave = 0
    for (const leaveType of leaveTypes || []) {
      totalLeave += leaveType.default_quota_days || 0
    }

    // Get used leave days from applications for current year
    const currentYear = new Date().getFullYear()
    const yearStart = `${currentYear}-01-01`
    const yearEnd = `${currentYear}-12-31`

    const { data: usedDays, error: usedError } = await supabase
      .from('leave_applications')
      .select('total_days')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .gte('start_date', yearStart)
      .lte('end_date', yearEnd)

    if (usedError) {
      console.error('Error fetching used leave days:', usedError)
    }

    const usedLeave = usedDays?.reduce((sum, app) => sum + (app.total_days || 0), 0) || 0
    const remainingLeave = totalLeave - usedLeave

    return NextResponse.json({
      success: true,
      data: {
        total_leave: totalLeave,
        used_leave: usedLeave,
        remaining_leave: remainingLeave,
        year: currentYear
      },
      source: 'database'
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error in leave balance API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500, headers: corsHeaders })
  }
}