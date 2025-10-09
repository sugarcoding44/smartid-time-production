import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    // Validate and sanitize date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      // If invalid date, use today's date
      date = new Date().toISOString().split('T')[0]
    }
    
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
    const { data: currentUser } = await supabase
      .from('users')
      .select('institution_id')
      .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id}`)
      .single()

    if (!currentUser?.institution_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Institution not found' 
      }, { status: 404 })
    }

    // Try to get attendance data from the attendance table
    let attendanceRecords: any[] = []
    let attendanceError = null
    
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('date', date)
      
      attendanceRecords = data || []
      attendanceError = error
    } catch (error) {
      console.error('Attendance table query error:', error)
      // If attendance table doesn't exist, return basic analytics
      return NextResponse.json({
        success: true,
        analytics: {
          averageCheckInTime: null,
          peakActivityHour: 'N/A',
          attendanceRate: 0,
          punctualityRate: 0,
          totalUsers: 0,
          presentUsers: 0,
          lateUsers: 0,
          absentUsers: 0,
          earlyLeaveUsers: 0,
          workingHoursDistribution: {
            underTime: 0,
            normalTime: 0,
            overTime: 0
          },
          checkInTimes: [],
          checkOutTimes: []
        }
      })
    }

    if (attendanceError && !attendanceError.message.includes('does not exist')) {
      console.error('Error fetching attendance data:', attendanceError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch attendance data' 
      }, { status: 500 })
    }

    // Get all users for the institution to calculate total metrics
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, employee_id, primary_role, smartid_time_role, primary_system')
      .eq('institution_id', currentUser.institution_id)
      .in('primary_system', ['time_web', 'time_mobile'])

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch users data' 
      }, { status: 500 })
    }

    const totalUsers = allUsers?.length || 0
    const records = attendanceRecords

    // Calculate analytics
    const analytics = calculateDailyAnalytics(records, totalUsers)

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Error in daily analytics API:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

function calculateDailyAnalytics(records: any[], totalUsers: number) {
  // Ensure records is an array
  if (!Array.isArray(records)) {
    records = []
  }
  
  // Ensure totalUsers is a valid number
  if (typeof totalUsers !== 'number' || totalUsers < 0) {
    totalUsers = 0
  }
  
  const presentRecords = records.filter(r => 
    r && r.status && ['present', 'late', 'in_progress', 'completed'].includes(r.status)
  )
  const lateRecords = records.filter(r => r && r.status === 'late')
  const absentUsers = Math.max(0, totalUsers - presentRecords.length)
  const earlyLeaveRecords = records.filter(r => r && r.status === 'early_leave')

  // Calculate average check-in time
  const checkInTimes = records
    .filter(r => r.check_in_time)
    .map(r => new Date(`${r.date}T${r.check_in_time}`))
    .filter(date => !isNaN(date.getTime()))

  let averageCheckInTime = null
  if (checkInTimes.length > 0) {
    const avgMs = checkInTimes.reduce((sum, time) => 
      sum + (time.getHours() * 3600 + time.getMinutes() * 60) * 1000, 0) / checkInTimes.length
    const avgDate = new Date(avgMs)
    const hours = Math.floor(avgMs / 3600000)
    const minutes = Math.floor((avgMs % 3600000) / 60000)
    averageCheckInTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  // Calculate peak activity hour (most common check-in hour)
  const checkInHours = checkInTimes.map(time => time.getHours())
  const hourCounts: { [key: number]: number } = {}
  checkInHours.forEach(hour => {
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  
  let peakActivityHour = 'N/A'
  if (Object.keys(hourCounts).length > 0) {
    const peakHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b
    )
    const hour = parseInt(peakHour)
    peakActivityHour = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`
  }

  // Calculate attendance and punctuality rates
  const attendanceRate = totalUsers > 0 ? (presentRecords.length / totalUsers) * 100 : 0
  const punctualityRate = presentRecords.length > 0 ? 
    ((presentRecords.length - lateRecords.length) / presentRecords.length) * 100 : 0

  // Calculate working hours distribution
  const workingHoursDistribution = {
    underTime: records.filter(r => r.work_hours && r.work_hours < 7).length,
    normalTime: records.filter(r => r.work_hours && r.work_hours >= 7 && r.work_hours <= 8).length,
    overTime: records.filter(r => r.work_hours && r.work_hours > 8).length
  }

  // Get check-out times for additional analytics
  const checkOutTimes = records
    .filter(r => r.check_out_time)
    .map(r => {
      const time = new Date(`${r.date}T${r.check_out_time}`)
      return time.getHours()
    })

  return {
    averageCheckInTime: averageCheckInTime || null,
    peakActivityHour: peakActivityHour || 'N/A',
    attendanceRate: isNaN(attendanceRate) ? 0 : Math.round(attendanceRate * 10) / 10,
    punctualityRate: isNaN(punctualityRate) ? 0 : Math.round(punctualityRate * 10) / 10,
    totalUsers: totalUsers || 0,
    presentUsers: presentRecords.length || 0,
    lateUsers: lateRecords.length || 0,
    absentUsers: absentUsers || 0,
    earlyLeaveUsers: earlyLeaveRecords.length || 0,
    workingHoursDistribution: {
      underTime: workingHoursDistribution.underTime || 0,
      normalTime: workingHoursDistribution.normalTime || 0,
      overTime: workingHoursDistribution.overTime || 0
    },
    checkInTimes: Array.isArray(checkInHours) ? checkInHours : [],
    checkOutTimes: Array.isArray(checkOutTimes) ? checkOutTimes : []
  }
}