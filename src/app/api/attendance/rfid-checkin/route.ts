import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rfid_uid, device_id, location, verification_method } = body

    if (!rfid_uid) {
      return NextResponse.json(
        { error: 'Missing required field: rfid_uid' },
        { status: 400 }
      )
    }

    // Get the authenticated user (for authorization)
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

    // First, find the user by RFID UID
    // Check both smart_cards table and users table
    let targetUser = null
    let smartCard = null

    // Try to find user via smart_cards table
    const { data: smartCardData } = await serviceSupabase
      .from('smart_cards')
      .select(`
        user_id,
        users!inner(
          id,
          full_name,
          employee_id,
          department,
          institution_id
        )
      `)
      .eq('nfc_id', rfid_uid)
      .eq('status', 'active')
      .single()

    if (smartCardData) {
      targetUser = smartCardData.users
      smartCard = smartCardData
    } else {
      // Fallback: check users table directly for smart_card_id
      const { data: userData } = await serviceSupabase
        .from('users')
        .select('id, full_name, employee_id, department, institution_id')
        .eq('smart_card_id', rfid_uid)
        .single()

      if (userData) {
        targetUser = userData
      }
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'RFID card not found or not enrolled. Please enroll the card first.' },
        { status: 404 }
      )
    }

    // Use the existing attendance function if available
    try {
      const { data: attendanceResult, error: attendanceError } = await serviceSupabase
        .rpc('record_premium_attendance', {
          user_id_param: targetUser.id,
          verification_method_param: verification_method || 'RFID_CARD',
          device_id_param: device_id,
          location_param: location
        })

      if (attendanceError) {
        throw attendanceError
      }

      if (attendanceResult && attendanceResult.length > 0) {
        const result = attendanceResult[0]
        
        return NextResponse.json({
          success: true,
          attendance_id: result.attendance_id,
          user_id: targetUser.id,
          user_name: targetUser.full_name,
          employee_id: targetUser.employee_id,
          department: targetUser.department,
          check_in_time: result.check_in_time,
          check_out_time: result.check_out_time,
          status: result.status,
          message: result.message,
          is_late: result.is_late || false,
          is_early_leave: result.is_early_leave || false,
          working_hours: result.working_hours || 0,
          overtime_hours: result.overtime_hours || 0
        })
      }
    } catch (dbError) {
      console.warn('Premium attendance function failed, trying basic method:', dbError)
    }

    // Fallback: use basic attendance recording
    try {
      const { data: basicResult, error: basicError } = await serviceSupabase
        .rpc('record_attendance', {
          user_id_param: targetUser.id,
          verification_method_param: verification_method || 'RFID_CARD',
          device_id_param: device_id,
          location_param: location
        })

      if (basicError) {
        throw basicError
      }

      if (basicResult && basicResult.length > 0) {
        const result = basicResult[0]
        
        return NextResponse.json({
          success: true,
          attendance_id: result.attendance_id,
          user_id: targetUser.id,
          user_name: targetUser.full_name,
          employee_id: targetUser.employee_id,
          department: targetUser.department,
          check_in_time: result.check_in_time,
          status: result.status,
          message: result.message
        })
      }
    } catch (basicError) {
      console.warn('Basic attendance function failed, using manual method:', basicError)
    }

    // Manual fallback: direct database insertion
    const now = new Date().toISOString()
    const today = new Date().toISOString().split('T')[0]

    // Check if there's already an attendance record for today
    const { data: existingRecord } = await serviceSupabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', targetUser.id)
      .eq('date', today)
      .single()

    let attendanceData
    if (existingRecord && !existingRecord.check_out_time) {
      // This is a check-out
      const { data: updatedRecord, error: updateError } = await serviceSupabase
        .from('attendance_records')
        .update({
          check_out_time: now,
          updated_at: now,
          verification_method: verification_method || 'RFID_CARD',
          device_id: device_id,
          location: location
        })
        .eq('id', existingRecord.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      attendanceData = updatedRecord
    } else {
      // This is a check-in (or new record)
      const { data: newRecord, error: insertError } = await serviceSupabase
        .from('attendance_records')
        .insert({
          user_id: targetUser.id,
          institution_id: targetUser.institution_id,
          date: today,
          check_in_time: now,
          verification_method: verification_method || 'RFID_CARD',
          device_id: device_id,
          location: location,
          status: 'present',
          created_at: now,
          updated_at: now
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      attendanceData = newRecord
    }

    return NextResponse.json({
      success: true,
      attendance_id: attendanceData.id,
      user_id: targetUser.id,
      user_name: targetUser.full_name,
      employee_id: targetUser.employee_id,
      department: targetUser.department,
      check_in_time: attendanceData.check_in_time,
      check_out_time: attendanceData.check_out_time,
      status: attendanceData.status,
      message: attendanceData.check_out_time ? 
        `Check-out recorded for ${targetUser.full_name}` : 
        `Check-in recorded for ${targetUser.full_name}`
    })

  } catch (error) {
    console.error('RFID attendance error:', error)
    return NextResponse.json(
      { error: 'Failed to record attendance: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}