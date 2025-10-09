import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// CORS headers for mobile app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

type Database_Functions = Database['public']['Functions']

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const body = await request.json()

    // Extract fields from mobile request
    const {
      userId,
      employeeId,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      supportingDocumentsUrls = [],
      status = 'pending',
      approvalLevel = 1,
      appliedDate
    } = body

    // Validate required fields
    if (!userId || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({
        error: 'Missing required fields: userId, leaveType, startDate, endDate, reason'
      }, { status: 400, headers: corsHeaders })
    }

    // First, look up the user by auth_user_id to get the database user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, institution_id, full_name, employee_id')
      .eq('auth_user_id', userId)
      .eq('status', 'active')
      .single()

    if (userError || !userData) {
      return NextResponse.json({
        error: 'User not found with provided auth user ID'
      }, { status: 404, headers: corsHeaders })
    }

    const databaseUserId = userData.id

    // Check for overlapping leave dates
    const { data: overlappingLeaves, error: overlapError } = await supabase
      .from('leave_applications')
      .select('id, start_date, end_date, status')
      .eq('user_id', databaseUserId)
      .in('status', ['pending', 'approved'])
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`)

    if (overlapError) {
      console.error('Error checking for overlapping leaves:', overlapError)
    } else if (overlappingLeaves && overlappingLeaves.length > 0) {
      const conflictingLeave = overlappingLeaves[0]
      return NextResponse.json({
        error: `Leave request conflicts with existing ${conflictingLeave.status} leave from ${conflictingLeave.start_date} to ${conflictingLeave.end_date}`
      }, { status: 400, headers: corsHeaders })
    }

    // Next, find the leave_type_id from the leaveType name/id
    let leaveTypeId = leaveType
    
    // If leaveType is not a UUID, find by name
    if (!leaveType.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const { data: leaveTypeData, error: leaveTypeError } = await supabase
        .from('leave_types')
        .select('id')
        .ilike('name', `%${leaveType}%`)
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (leaveTypeError || !leaveTypeData) {
        return NextResponse.json({
          error: `Leave type '${leaveType}' not found or inactive`
        }, { status: 400, headers: corsHeaders })
      }
      
      leaveTypeId = leaveTypeData.id
    }

    // Calculate working days (excluding weekends)
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    let workingDays = 0
    
    for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
        workingDays++
      }
    }

    // Generate application number and ID
    const applicationNumber = 'LA' + new Date().getFullYear() + '-' + Date.now()
    const applicationId = crypto.randomUUID()
    
    // Direct insert into leave_applications table
    const { data: newApplication, error: insertError } = await supabase
      .from('leave_applications')
      .insert({
        id: applicationId,
        user_id: databaseUserId,
        leave_type_id: leaveTypeId,
        application_number: applicationNumber,
        start_date: startDate,
        end_date: endDate,
        total_days: workingDays,
        reason: reason,
        status: 'pending',
        half_day_start: false,
        half_day_end: false,
        supporting_documents_urls: supportingDocumentsUrls.length > 0 ? supportingDocumentsUrls : null,
        applied_date: appliedDate || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error inserting leave application:', insertError)
      return NextResponse.json({
        success: false,
        error: insertError.message || 'Failed to submit leave request'
      }, { status: 500, headers: corsHeaders })
    }

    // Create initial approval workflow entry
    const { error: workflowError } = await supabase
      .from('leave_approval_workflow')
      .insert({
        id: crypto.randomUUID(),
        leave_application_id: applicationId,
        approval_level: 1,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (workflowError) {
      console.warn('Warning: Failed to create approval workflow entry:', workflowError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Leave application submitted successfully',
      data: {
        applicationId: applicationId,
        applicationNumber: applicationNumber,
        status: 'pending',
        totalDays: workingDays,
        supportingDocuments: supportingDocumentsUrls
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error in leave request POST API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500, headers: corsHeaders })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const body = await request.json()

    const {
      userId,
      employeeId,
      leaveApplicationId,
      status = 'cancelled'
    } = body

    // Validate required fields
    if (!userId || !leaveApplicationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, leaveApplicationId'
      }, { status: 400, headers: corsHeaders })
    }

    // First, look up the user by auth_user_id to get the database user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', userId)
      .eq('status', 'active')
      .single()

    if (userError || !userData) {
      return NextResponse.json({
        success: false,
        error: 'User not found with provided auth user ID'
      }, { status: 404, headers: corsHeaders })
    }

    const databaseUserId = userData.id

    // Verify user owns this application
    const { data: application, error: checkError } = await supabase
      .from('leave_applications')
      .select('id, status, user_id')
      .eq('id', leaveApplicationId)
      .eq('user_id', databaseUserId)
      .single()

    if (checkError || !application) {
      return NextResponse.json({
        success: false,
        error: 'Leave application not found or access denied'
      }, { status: 404, headers: corsHeaders })
    }

    // Check if application can be cancelled
    if (application.status === 'approved' || application.status === 'rejected') {
      return NextResponse.json({
        success: false,
        error: `Cannot cancel ${application.status} leave application`
      }, { status: 400, headers: corsHeaders })
    }

    // Update application status to cancelled
    const { error: updateError } = await supabase
      .from('leave_applications')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', leaveApplicationId)
      .eq('user_id', databaseUserId)

    if (updateError) {
      console.error('Error cancelling leave request:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to cancel leave request'
      }, { status: 500, headers: corsHeaders })
    }

    return NextResponse.json({
      success: true,
      message: 'Leave application cancelled successfully'
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error in leave request DELETE API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500, headers: corsHeaders })
  }
}
