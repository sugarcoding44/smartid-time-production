import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || getDateXDaysAgo(30)
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    const department = searchParams.get('department') || 'all'
    
    const supabase = await createClient()
    
    // Get current authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    // Get user's institution
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('institution_id')
      .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id}`)
      .single()

    if (currentUserError) {
      console.error('Error fetching current user:', currentUserError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch current user' 
      }, { status: 500 })
    }

    if (!currentUser?.institution_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Institution not found' 
      }, { status: 404 })
    }

    // Get all users for analysis
    console.log('Fetching users for institution:', currentUser.institution_id)
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        employee_id,
        primary_role,
        smartid_time_role,
        institution_id
      `)
      .eq('institution_id', currentUser.institution_id)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch users' 
      }, { status: 500 })
    }

    // If no users found, return empty analytics
    if (!allUsers || allUsers.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: getEmptyAnalytics(),
        debug: {
          totalUsers: 0,
          totalRecords: 0,
          dateRange: { startDate, endDate },
          department
        }
      })
    }

    // Filter users by department/role if specified
    const filteredUsers = department === 'all' 
      ? (allUsers || []) 
      : (allUsers || []).filter(user => 
          user?.primary_role?.toLowerCase().includes(department.toLowerCase()) ||
          user?.smartid_time_role?.toLowerCase().includes(department.toLowerCase())
        )

    // Get attendance records for the date range
    let attendanceRecords: any[] = []
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          users!inner(
            id,
            full_name,
            employee_id,
            primary_role,
            smartid_time_role
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (!error) {
        attendanceRecords = data || []
        // Filter by role if needed
        if (department !== 'all') {
          attendanceRecords = attendanceRecords.filter(record =>
            record.users?.primary_role?.toLowerCase().includes(department.toLowerCase()) ||
            record.users?.smartid_time_role?.toLowerCase().includes(department.toLowerCase())
          )
        }
      }
    } catch (error) {
      console.error('Attendance table might not exist:', error)
      // Continue with empty records for demo purposes
    }

    // Generate analytics data
    const analytics = generateAnalytics(filteredUsers, attendanceRecords, startDate, endDate)

    return NextResponse.json({
      success: true,
      analytics,
      debug: {
        totalUsers: filteredUsers.length,
        totalRecords: attendanceRecords.length,
        dateRange: { startDate, endDate },
        department
      }
    })

  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

function generateAnalytics(users: any[], attendanceRecords: any[], startDate: string, endDate: string) {
  // Helper function to get date range
  const getDateRange = (start: string, end: string) => {
    const dates = []
    const currentDate = new Date(start)
    const lastDate = new Date(end)
    
    while (currentDate <= lastDate) {
      dates.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
  }

  const dateRange = getDateRange(startDate, endDate)
  const totalWorkingDays = dateRange.length

  // Daily trends analysis
  const dailyTrends = dateRange.map(date => {
    const dayRecords = attendanceRecords.filter(r => r.date === date)
    const present = dayRecords.filter(r => r.check_in_time).length
    const late = dayRecords.filter(r => isLateCheckIn(r.check_in_time)).length
    const absent = users.length - present
    
    return {
      date,
      present,
      absent,
      late,
      total: users.length,
      rate: users.length > 0 ? Math.round((present / users.length) * 100) : 0
    }
  })

  // Department statistics (using primary_role since there's no department column)
  const departmentGroups = groupBy(users, user => user.smartid_time_role || user.primary_role || 'Unassigned')
  const departmentStats = Object.entries(departmentGroups).map(([dept, deptUsers]) => {
    const deptRecords = attendanceRecords.filter(r => 
      deptUsers.some(u => u.id === r.user_id)
    )
    
    const totalPossibleDays = deptUsers.length * totalWorkingDays
    const presentDays = deptRecords.filter(r => r.check_in_time).length
    const lateDays = deptRecords.filter(r => isLateCheckIn(r.check_in_time)).length
    const workingHours = deptRecords.filter(r => r.total_work_hours).map(r => r.total_work_hours)
    
    return {
      department: dept,
      attendanceRate: totalPossibleDays > 0 ? Math.round((presentDays / totalPossibleDays) * 100) : 0,
      avgWorkingHours: workingHours.length > 0 ? workingHours.reduce((a, b) => a + b, 0) / workingHours.length : 0,
      lateArrivals: lateDays,
      earlyDepartures: 0 // Calculate based on check-out times if needed
    }
  })

  // Time distribution analysis
  const timeDistribution = Array.from({ length: 24 }, (_, hour) => {
    const checkIns = attendanceRecords.filter(r => 
      r.check_in_time && new Date(r.check_in_time).getHours() === hour
    ).length
    
    const checkOuts = attendanceRecords.filter(r => 
      r.check_out_time && new Date(r.check_out_time).getHours() === hour
    ).length
    
    return { hour, checkIns, checkOuts }
  })

  // Individual performance analysis
  const individualPerformance = users.map(user => {
    const userRecords = attendanceRecords.filter(r => r.user_id === user.id)
    const presentDays = userRecords.filter(r => r.check_in_time).length
    const lateDays = userRecords.filter(r => isLateCheckIn(r.check_in_time)).length
    const workingHours = userRecords.filter(r => r.total_work_hours).map(r => r.total_work_hours)
    
    const attendanceRate = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0
    const punctualityScore = presentDays > 0 ? Math.round(((presentDays - lateDays) / presentDays) * 100) : 100
    
    return {
      userId: user.id,
      userName: user.full_name,
      employeeId: user.employee_id,
      department: user.smartid_time_role || user.primary_role || 'Unassigned',
      attendanceRate,
      punctualityScore,
      avgWorkingHours: workingHours.length > 0 ? workingHours.reduce((a, b) => a + b, 0) / workingHours.length : 0,
      totalDays: totalWorkingDays,
      presentDays,
      lateDays,
      absentDays: totalWorkingDays - presentDays
    }
  }).sort((a, b) => b.attendanceRate - a.attendanceRate) // Sort by attendance rate

  // Summary calculations
  const allPresentDays = attendanceRecords.filter(r => r.check_in_time).length
  const allPossibleDays = users.length * totalWorkingDays
  const allLateArrivals = attendanceRecords.filter(r => isLateCheckIn(r.check_in_time)).length
  const allWorkingHours = attendanceRecords.filter(r => r.total_work_hours).map(r => r.total_work_hours)
  
  // Find peak activity hour
  const peakHour = timeDistribution.reduce((max, curr) => 
    curr.checkIns > max.checkIns ? curr : max
  , { hour: 9, checkIns: 0 })

  // Identify users needing attention
  const needsAttention = individualPerformance
    .filter(user => user.attendanceRate < 80 || user.punctualityScore < 70)
    .slice(0, 10)
    .map(user => ({
      userId: user.userId,
      userName: user.userName,
      issue: user.attendanceRate < 60 ? 'Poor attendance' : 
             user.punctualityScore < 50 ? 'Frequent tardiness' : 
             'Below average performance',
      severity: user.attendanceRate < 50 ? 'high' as const : 
               user.attendanceRate < 70 ? 'medium' as const : 
               'low' as const
    }))

  const summary = {
    totalWorkingDays,
    overallAttendanceRate: allPossibleDays > 0 ? Math.round((allPresentDays / allPossibleDays) * 100) : 0,
    avgWorkingHours: allWorkingHours.length > 0 ? allWorkingHours.reduce((a, b) => a + b, 0) / allWorkingHours.length : 0,
    punctualityRate: allPresentDays > 0 ? Math.round(((allPresentDays - allLateArrivals) / allPresentDays) * 100) : 100,
    mostProductiveHour: `${peakHour.hour}:00`,
    topPerformer: individualPerformance[0]?.userName || 'N/A',
    needsAttention
  }

  return {
    dailyTrends,
    departmentStats,
    timeDistribution,
    individualPerformance,
    summary
  }
}

// Helper functions
function getDateXDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

function isLateCheckIn(checkInTime: string | null): boolean {
  if (!checkInTime) return false
  
  const checkIn = new Date(checkInTime)
  const hour = checkIn.getHours()
  const minute = checkIn.getMinutes()
  
  // Consider late if after 9:15 AM
  return hour > 9 || (hour === 9 && minute > 15)
}

function groupBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

function getEmptyAnalytics() {
  return {
    dailyTrends: [],
    departmentStats: [],
    timeDistribution: Array.from({ length: 24 }, (_, hour) => ({ hour, checkIns: 0, checkOuts: 0 })),
    individualPerformance: [],
    summary: {
      totalWorkingDays: 0,
      overallAttendanceRate: 0,
      avgWorkingHours: 0,
      punctualityRate: 0,
      mostProductiveHour: 'N/A',
      topPerformer: 'N/A',
      needsAttention: []
    }
  }
}
