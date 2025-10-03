import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')
    const userId = searchParams.get('userId')
    const date = searchParams.get('date') // YYYY-MM-DD format
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get the authenticated user
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create a service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user's institution if not provided
    let queryInstitutionId = institutionId
    if (!queryInstitutionId) {
      const { data: currentUser } = await serviceSupabase
        .from('users')
        .select('institution_id')
        .or(`auth_user_id.eq.${user.id},id.eq.${user.id}`)
        .single()
      
      queryInstitutionId = currentUser?.institution_id
    }

    if (!queryInstitutionId) {
      return NextResponse.json(
        { error: 'Institution ID not found' },
        { status: 400 }
      )
    }

    // Check if attendance_records table exists
    const { data: tableCheck, error: tableError } = await serviceSupabase
      .from('attendance_records')
      .select('id')
      .limit(1)

    if (tableError && tableError.message.includes('relation') && tableError.message.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Attendance records table not found'
      })
    }

    // Build query - First get users from the institution
    const { data: institutionUsers } = await serviceSupabase
      .from('users')
      .select('id')
      .eq('institution_id', queryInstitutionId)
    
    const userIds = institutionUsers?.map(u => u.id) || []
    
    let query = serviceSupabase
      .from('attendance_records')
      .select(`
        id,
        user_id,
        check_in_time,
        check_out_time,
        work_hours,
        status,
        created_at
      `)
      .in('user_id', userIds)

    // Add filters
    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (date) {
      const dateStart = new Date(date)
      const dateEnd = new Date(date)
      dateEnd.setDate(dateEnd.getDate() + 1)
      
      query = query
        .gte('check_in_time', dateStart.toISOString())
        .lt('check_in_time', dateEnd.toISOString())
    } else if (startDate && endDate) {
      query = query
        .gte('check_in_time', startDate)
        .lte('check_in_time', endDate)
    }

    const { data: records, error } = await query
      .order('check_in_time', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch attendance records: ' + error.message },
        { status: 400 }
      )
    }

    // Get user details for the records
    const recordUserIds = [...new Set(records?.map(r => r.user_id) || [])]
    const { data: users } = await serviceSupabase
      .from('users')
      .select('id, full_name, employee_id, primary_role')
      .in('id', recordUserIds)
    
    const userMap = new Map(users?.map(u => [u.id, u]) || [])

    // Transform the data
    const transformedRecords = records?.map(record => {
      const user = userMap.get(record.user_id)
      return {
        id: record.id,
        userId: record.user_id,
        userName: user?.full_name || 'Unknown',
        employeeId: user?.employee_id || 'N/A',
        role: user?.primary_role || 'N/A',
        checkInTime: record.check_in_time,
        checkOutTime: record.check_out_time,
        workHours: record.work_hours,
        status: record.status || (record.check_out_time ? 'completed' : 'in_progress'),
        date: new Date(record.check_in_time).toISOString().split('T')[0]
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: transformedRecords
    })

  } catch (error) {
    console.error('Attendance records fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    )
  }
}