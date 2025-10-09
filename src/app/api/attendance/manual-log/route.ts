import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, check_in_time, check_out_time, status, notes, date, logged_by, verification_method } = body

    // Get the authenticated user
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the user is a superadmin
    const { data: currentUser } = await supabase
      .from('users')
      .select('primary_role, smartid_time_role')
      .or(`auth_user_id.eq.${user.id},id.eq.${user.id}`)
      .single()
    
    const userRole = currentUser?.smartid_time_role || currentUser?.primary_role
    if (userRole !== 'superadmin') {
      return NextResponse.json(
        { error: 'Access denied. Superadmin privileges required.' },
        { status: 403 }
      )
    }

    // Create a service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if attendance_records table exists
    const { data: tableCheck, error: tableError } = await serviceSupabase
      .from('attendance_records')
      .select('id')
      .limit(1)

    if (tableError && tableError.message.includes('relation') && tableError.message.includes('does not exist')) {
      return NextResponse.json({
        success: false,
        error: 'Attendance records table not found. Please set up attendance tracking first.'
      })
    }

    // Calculate work hours if both check-in and check-out times are provided
    let actualWorkingHours = null
    if (check_in_time && check_out_time) {
      const checkIn = new Date(`${date}T${check_in_time}`)
      const checkOut = new Date(`${date}T${check_out_time}`)
      const diffMs = checkOut.getTime() - checkIn.getTime()
      actualWorkingHours = Math.max(0, diffMs / (1000 * 60 * 60)) // Convert to hours
    }

    // Check if record already exists for this user and date
    const { data: existingRecord } = await serviceSupabase
      .from('attendance_records')
      .select('id')
      .eq('user_id', user_id)
      .eq('date', date)
      .single()

    if (existingRecord) {
      // Update existing record
      const { data, error } = await serviceSupabase
        .from('attendance_records')
        .update({
          check_in_time: check_in_time,
          check_out_time: check_out_time,
          actual_working_hours: actualWorkingHours,
          status: status,
          verification_method: verification_method,
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { success: false, error: 'Failed to update attendance record: ' + error.message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        data: data,
        message: 'Attendance record updated successfully'
      })
    } else {
      // Create new record
      const { data, error } = await serviceSupabase
        .from('attendance_records')
        .insert({
          user_id: user_id,
          date: date,
          check_in_time: check_in_time,
          check_out_time: check_out_time,
          actual_working_hours: actualWorkingHours,
          status: status,
          verification_method: verification_method,
          notes: notes,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { success: false, error: 'Failed to create attendance record: ' + error.message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        data: data,
        message: 'Attendance record created successfully'
      })
    }

  } catch (error) {
    console.error('Manual attendance logging error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log attendance' },
      { status: 500 }
    )
  }
}