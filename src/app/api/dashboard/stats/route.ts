import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
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

    // Get the user's institution ID
    const { data: currentUser, error: userError } = await serviceSupabase
      .from('users')
      .select('institution_id')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !currentUser?.institution_id) {
      return NextResponse.json(
        { error: 'User not associated with an institution' },
        { status: 400 }
      )
    }

    const institutionId = currentUser.institution_id

    // Fetch various statistics in parallel - handle missing tables gracefully
    const [usersData] = await Promise.all([
      // Get user counts by role
      serviceSupabase
        .from('users')
        .select('primary_role, palm_id')
        .eq('institution_id', institutionId)
        .eq('status', 'active')
    ])

    // Try to fetch from tables that might not exist
    let enrollmentsData: any = { data: null, error: null }
    let recentActivityData: any = { data: [], error: null }
    let attendanceData: any = { data: [], error: null }
    
    // Check if biometric_enrollments table exists
    try {
      enrollmentsData = await serviceSupabase
        .from('biometric_enrollments')
        .select('id, user_id, enrollment_type, status')
        .eq('institution_id', institutionId)
    } catch (error) {
      console.warn('biometric_enrollments table not found, using user palm_id instead')
    }
    
    // Try to get attendance records
    try {
      // First attempt with join
      const result = await serviceSupabase
        .from('attendance_records')
        .select(`
          id,
          user_id,
          check_in_time,
          check_out_time,
          users!inner(full_name, employee_id)
        `)
        .eq('users.institution_id', institutionId)
        .order('check_in_time', { ascending: false })
        .limit(10)
      
      recentActivityData = result
    } catch (error) {
      console.warn('Could not fetch attendance records with join:', error)
      // Try simpler approach without join
      try {
        const simpleResult = await serviceSupabase
          .from('attendance_records')
          .select('*')
          .order('check_in_time', { ascending: false })
          .limit(10)
        
        recentActivityData = simpleResult
      } catch (simpleError) {
        console.warn('attendance_records table not found')
      }
    }
    
    // Get today's attendance count
    try {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(todayStart)
      todayEnd.setDate(todayEnd.getDate() + 1)
      
      attendanceData = await serviceSupabase
        .from('attendance_records')
        .select('id')
        .gte('check_in_time', todayStart.toISOString())
        .lt('check_in_time', todayEnd.toISOString())
    } catch (error) {
      console.warn('Could not fetch today attendance count')
    }

    // Process user counts by role
    const userCounts = {
      total: usersData.data?.length || 0,
      teacher: 0,
      staff: 0,
      student: 0,
      admin: 0
    }

    usersData.data?.forEach((user: any) => {
      if (user.primary_role === 'teacher') userCounts.teacher++
      else if (user.primary_role === 'staff') userCounts.staff++
      else if (user.primary_role === 'student') userCounts.student++
      else if (user.primary_role === 'admin') userCounts.admin++
    })

    // Calculate enrollment progress
    const totalUsers = userCounts.total
    let enrolledUsers = 0
    
    // If we have biometric_enrollments table, use it
    if (enrollmentsData.data) {
      enrolledUsers = enrollmentsData.data.filter((e: any) => 
        e.enrollment_type === 'palm' && e.status === 'active'
      ).length
    } else {
      // Otherwise count users with palm_id
      enrolledUsers = usersData.data?.filter((u: any) => u.palm_id !== null).length || 0
    }
    
    const enrollmentRate = totalUsers > 0 ? Math.round((enrolledUsers / totalUsers) * 100) : 0

    // Process recent activities
    const activities = recentActivityData.data?.map((record: any) => {
      const now = new Date()
      const activityTime = new Date(record.check_in_time)
      const timeDiff = now.getTime() - activityTime.getTime()
      
      // Format time difference
      let timeAgo = ''
      if (timeDiff < 60000) {
        timeAgo = 'just now'
      } else if (timeDiff < 3600000) {
        timeAgo = `${Math.floor(timeDiff / 60000)} minutes ago`
      } else if (timeDiff < 86400000) {
        timeAgo = `${Math.floor(timeDiff / 3600000)} hours ago`
      } else {
        timeAgo = `${Math.floor(timeDiff / 86400000)} days ago`
      }
      
      // Handle both cases - with and without user join data
      const userIdentifier = record.users?.employee_id || record.user_id || 'User'

      return {
        icon: record.check_out_time ? '🚪' : '✋',
        title: record.check_out_time 
          ? `${userIdentifier} checked out`
          : `${userIdentifier} checked in`,
        time: timeAgo,
        color: record.check_out_time ? 'bg-red-500' : 'bg-green-500'
      }
    }) || []

    // Calculate attendance rate for today
    const todayAttendance = attendanceData.data?.length || 0
    const attendanceRate = totalUsers > 0 ? Math.round((todayAttendance / totalUsers) * 100) : 0

    return NextResponse.json({
      success: true,
      stats: {
        users: userCounts,
        enrollment: {
          rate: enrollmentRate,
          enrolled: enrolledUsers,
          total: totalUsers
        },
        attendance: {
          today: todayAttendance,
          rate: attendanceRate
        },
        recentActivities: activities
      }
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}