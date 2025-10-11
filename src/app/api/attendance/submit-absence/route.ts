import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// CORS handler
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { 
      userId, 
      employeeId,
      date,
      reason, 
      documentation, // Array of file URLs or base64 data
      absenceType, // 'sick', 'emergency', 'personal', 'medical', 'family'
      contactNumber,
      additionalNotes
    } = body

    console.log('📝 Absence documentation submission:', {
      userId,
      employeeId, 
      date,
      reason,
      absenceType,
      documentCount: documentation?.length || 0
    })

    // Validate required fields
    if (!userId && !employeeId) {
      return NextResponse.json(
        { error: 'userId or employeeId is required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    if (!date || !reason || !absenceType) {
      return NextResponse.json(
        { error: 'date, reason, and absenceType are required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const targetDate = new Date(date).toISOString().split('T')[0]

    // Get user info if we only have userId
    let userEmployeeId = employeeId
    let actualUserId = userId
    let institutionId = null
    let workGroupId = null

    if (!userEmployeeId && userId) {
      const userData = await serviceSupabase
        .from('users')
        .select('employee_id, id, institution_id')
        .or(`auth_user_id.eq.${userId},id.eq.${userId}`)
        .single()
      
      if (userData.error) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 400, headers: corsHeaders() }
        )
      }
      
      userEmployeeId = userData.data.employee_id
      actualUserId = userData.data.id
      institutionId = userData.data.institution_id
    }

    if (!userEmployeeId) {
      return NextResponse.json(
        { error: 'Could not determine employee ID' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Get work group assignment if we don't have it
    if (!workGroupId) {
      const { data: assignment } = await serviceSupabase
        .from('user_work_group_assignments')
        .select('work_group_id')
        .eq('user_id', actualUserId)
        .eq('is_active', true)
        .single()
      
      workGroupId = assignment?.work_group_id || null
    }

    // Check if there's already an attendance record for this date
    const { data: existingRecord, error: recordError } = await serviceSupabase
      .from('attendance_records')
      .select('id, status, notes')
      .eq('employee_id', userEmployeeId)
      .eq('date', targetDate)
      .maybeSingle()

    if (recordError) {
      console.error('Error checking existing record:', recordError)
      return NextResponse.json(
        { error: 'Failed to check existing attendance record' },
        { status: 500, headers: corsHeaders() }
      )
    }

    const now = new Date()
    
    // Prepare absence documentation
    const absenceDocumentation = {
      type: absenceType,
      reason: reason,
      contact_number: contactNumber || null,
      additional_notes: additionalNotes || null,
      documentation_files: documentation || [],
      submitted_at: now.toISOString(),
      submission_method: 'mobile_app'
    }

    let attendanceRecord
    const recordNotes = `Absence documentation submitted: ${reason}${additionalNotes ? ` | Notes: ${additionalNotes}` : ''}`

    if (existingRecord) {
      // Update existing record
      const updatedNotes = existingRecord.notes 
        ? `${existingRecord.notes} | ${recordNotes}`
        : recordNotes

      const { data, error } = await serviceSupabase
        .from('attendance_records')
        .update({
          status: 'absent_documented',
          notes: updatedNotes,
          absence_documentation: absenceDocumentation,
          updated_at: now.toISOString()
        })
        .eq('id', existingRecord.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating attendance record:', error)
        return NextResponse.json(
          { error: 'Failed to update attendance record' },
          { status: 500, headers: corsHeaders() }
        )
      }
      
      attendanceRecord = data
      console.log(`✅ Updated existing attendance record for ${userEmployeeId}`)
    } else {
      // Create new record with absence documentation
      const newRecord = {
        employee_id: userEmployeeId,
        user_id: actualUserId,
        institution_id: institutionId,
        work_group_id: workGroupId,
        date: targetDate,
        status: 'absent_documented',
        check_in_time: null,
        check_out_time: null,
        notes: recordNotes,
        absence_documentation: absenceDocumentation,
        verification_method: 'documentation_submission',
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }

      const { data, error } = await serviceSupabase
        .from('attendance_records')
        .insert([newRecord])
        .select()
        .single()

      if (error) {
        console.error('Error creating attendance record:', error)
        return NextResponse.json(
          { error: 'Failed to create attendance record' },
          { status: 500, headers: corsHeaders() }
        )
      }
      
      attendanceRecord = data
      console.log(`✅ Created new attendance record with documentation for ${userEmployeeId}`)
    }

    // Create notification for supervisor (optional)
    try {
      const { data: supervisorData } = await serviceSupabase
        .from('users')
        .select('id, full_name, email')
        .eq('institution_id', institutionId)
        .contains('permissions', ['approve_attendance'])
        .limit(5)

      if (supervisorData && supervisorData.length > 0) {
        console.log(`📧 Found ${supervisorData.length} supervisors to notify`)
        
        // You could implement email notifications here
        // or create records in a notifications table
      }
    } catch (notificationError) {
      console.warn('Could not send supervisor notifications:', notificationError)
      // Don't fail the request if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: 'Absence documentation submitted successfully',
      data: {
        attendance_record_id: attendanceRecord.id,
        status: attendanceRecord.status,
        submission_time: now.toISOString(),
        date: targetDate,
        absence_type: absenceType,
        documentation_count: documentation?.length || 0
      }
    }, { headers: corsHeaders() })

  } catch (error) {
    console.error('Error in absence documentation submission:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// GET endpoint to retrieve absence documentation for a specific date range
export async function GET(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const institutionId = searchParams.get('institutionId')

    if (!userId && !employeeId && !institutionId) {
      return NextResponse.json(
        { error: 'userId, employeeId, or institutionId is required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    let query = serviceSupabase
      .from('attendance_records')
      .select(`
        id,
        employee_id,
        date,
        status,
        notes,
        absence_documentation,
        created_at,
        updated_at,
        users!inner(
          id,
          full_name,
          email
        )
      `)
      .in('status', ['absent_documented', 'absent'])

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    } else if (userId) {
      query = query.eq('user_id', userId)
    } else if (institutionId) {
      query = query.eq('institution_id', institutionId)
    }

    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data: records, error } = await query
      .order('date', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching absence records:', error)
      return NextResponse.json(
        { error: 'Failed to fetch absence records' },
        { status: 500, headers: corsHeaders() }
      )
    }

    return NextResponse.json({
      success: true,
      data: records || [],
      count: records?.length || 0
    }, { headers: corsHeaders() })

  } catch (error) {
    console.error('Error fetching absence documentation:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}