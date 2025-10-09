import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all users from the current institution
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    // For now, let's get all active users and simulate real-time data
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        employee_id,
        primary_role,
        smartid_time_role,
        institution_id,
        is_active
      `)
      .eq('is_active', true)
      .in('primary_system', ['time_web', 'time_mobile'])

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch users' 
      }, { status: 500 })
    }

    // Get today's attendance records
    let attendanceRecords = []
    let attendanceError = null

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
        .eq('date', date)
        .order('check_in_time', { ascending: false })

      if (!error) {
        attendanceRecords = data || []
      } else {
        attendanceError = error
      }
    } catch (error) {
      console.error('Attendance table might not exist:', error)
      attendanceError = error
    }

    // Get institution locations for location context
    let locations: any[] = []
    if (allUsers.length > 0) {
      const institutionId = allUsers[0].institution_id
      const { data: locationsData } = await supabase
        .from('institution_locations')
        .select('id, name, latitude, longitude, is_attendance_enabled')
        .eq('institution_id', institutionId)
        .eq('is_active', true)

      locations = locationsData || []
    }

    // Process real-time attendance data
    const attendanceData = []
    const userAttendanceMap = new Map()

    // First, map existing attendance records
    for (const record of attendanceRecords) {
      const user = record.users
      if (!user) continue

      const status = determineStatus(record)
      const locationName = getLocationName(record.location, locations)

      userAttendanceMap.set(user.id, {
        id: record.id,
        userId: user.id,
        userName: user.full_name,
        employeeId: user.employee_id,
        role: user.smartid_time_role || user.primary_role,
        status,
        lastActivity: record.check_out_time || record.check_in_time,
        location: locationName ? {
          name: locationName,
          coordinates: record.location ? [record.location.latitude, record.location.longitude] : [0, 0]
        } : undefined,
        workHours: record.total_work_hours
      })
    }

    // Add users without attendance records (absent users)
    for (const user of allUsers) {
      if (!userAttendanceMap.has(user.id)) {
        userAttendanceMap.set(user.id, {
          id: `absent-${user.id}`,
          userId: user.id,
          userName: user.full_name,
          employeeId: user.employee_id,
          role: user.smartid_time_role || user.primary_role,
          status: 'absent' as const,
          lastActivity: date,
          workHours: 0
        })
      }
    }

    // Convert to array and sort by last activity
    const sortedAttendanceData = Array.from(userAttendanceMap.values())
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())

    attendanceData.push(...sortedAttendanceData)

    // Calculate live statistics
    const totalUsers = allUsers.length
    const checkedInUsers = attendanceData.filter(record => 
      record.status === 'checked_in' || record.status === 'late'
    )
    const onTimeUsers = attendanceData.filter(record => record.status === 'checked_in')
    const lateUsers = attendanceData.filter(record => record.status === 'late')
    const absentUsers = attendanceData.filter(record => record.status === 'absent')

    // Calculate average check-in time
    const checkInTimes = attendanceRecords
      .filter(record => record.check_in_time)
      .map(record => new Date(record.check_in_time))
    
    let averageCheckInTime = '--:--'
    if (checkInTimes.length > 0) {
      const avgTime = new Date(
        checkInTimes.reduce((sum, time) => sum + time.getTime(), 0) / checkInTimes.length
      )
      averageCheckInTime = avgTime.toISOString()
    }

    // Find peak activity time (hour with most check-ins)
    const hourCounts = new Map()
    for (const record of attendanceRecords) {
      if (record.check_in_time) {
        const hour = new Date(record.check_in_time).getHours()
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
      }
    }

    let peakActivity = '--:--'
    if (hourCounts.size > 0) {
      const peakHour = Array.from(hourCounts.entries())
        .reduce((max, [hour, count]) => count > max[1] ? [hour, count] : max, [0, 0])[0]
      peakActivity = new Date(2024, 0, 1, peakHour, 0).toISOString()
    }

    const stats = {
      totalUsers,
      checkedIn: checkedInUsers.length,
      onTime: onTimeUsers.length,
      late: lateUsers.length,
      absent: absentUsers.length,
      averageCheckInTime,
      peakActivity
    }

    return NextResponse.json({
      success: true,
      attendanceData: attendanceData.slice(0, 50), // Limit to 50 most recent
      stats,
      lastUpdated: new Date().toISOString(),
      debug: {
        totalRecords: attendanceRecords.length,
        totalUsers: allUsers.length,
        hasAttendanceError: !!attendanceError,
        locationsCount: locations.length
      }
    })

  } catch (error) {
    console.error('Error in real-time attendance API:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Helper function to determine user status based on attendance record
function determineStatus(record: any): 'checked_in' | 'checked_out' | 'late' | 'absent' | 'on_leave' {
  if (!record.check_in_time) {
    return 'absent'
  }

  // If they have check-out time, they've completed their day
  if (record.check_out_time) {
    return 'checked_out'
  }

  // Check if they're late (assuming 9 AM is the standard start time)
  const checkInTime = new Date(record.check_in_time)
  const standardStartHour = 9 // 9 AM
  
  if (checkInTime.getHours() > standardStartHour || 
     (checkInTime.getHours() === standardStartHour && checkInTime.getMinutes() > 15)) {
    return 'late'
  }

  return 'checked_in'
}

// Helper function to get location name from coordinates
function getLocationName(location: any, locations: any[]): string | null {
  if (!location || !locations.length) return null
  
  // Find the closest location
  let closestLocation = null
  let minDistance = Infinity
  
  for (const loc of locations) {
    const distance = calculateDistance(
      location.latitude, location.longitude,
      loc.latitude, loc.longitude
    )
    
    if (distance < minDistance) {
      minDistance = distance
      closestLocation = loc
    }
  }
  
  return closestLocation ? closestLocation.name : null
}

// Calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180
  const φ2 = lat2 * Math.PI/180
  const Δφ = (lat2-lat1) * Math.PI/180
  const Δλ = (lon2-lon1) * Math.PI/180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}