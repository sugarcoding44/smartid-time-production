import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const institutionId = searchParams.get('institution_id')
    const status = searchParams.get('status') // pending, approved, rejected, cancelled
    const userId = searchParams.get('user_id') // Filter by specific user
    const approverId = searchParams.get('approver_id') // For managers to see their assigned applications
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!institutionId) {
      return NextResponse.json({ 
        error: 'Institution ID is required' 
      }, { status: 400 })
    }

    // Build query
    let query = supabase
      .from('leave_applications')
      .select(`
        id,
        application_number,
        start_date,
        end_date,
        total_days,
        reason,
        status,
        approval_level,
        applied_date,
        approved_date,
        rejected_date,
        approval_comments,
        rejection_reason,
        half_day_start,
        half_day_end,
        emergency_contact,
        handover_notes,
        medical_certificate_url,
        supporting_documents_urls,
        created_at,
        updated_at,
        current_approver_id,
        users!leave_applications_user_id_fkey (
          id,
          full_name,
          employee_id,
          primary_role,
          email,
          phone
        ),
        leave_types!leave_applications_leave_type_id_fkey (
          id,
          name,
          code,
          color,
          is_paid
        ),
        leave_approval_workflow (
          id,
          approval_level,
          status,
          decision_date,
          comments,
          approver_id,
          approver_role,
          users!leave_approval_workflow_approver_id_fkey (
            id,
            full_name,
            primary_role
          )
        )
      `)

    // Filter by institution through user relationship
    query = query.eq('users.institution_id', institutionId)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (approverId) {
      query = query.eq('current_approver_id', approverId)
    }

    if (startDate && endDate) {
      query = query.gte('start_date', startDate).lte('end_date', endDate)
    } else if (startDate) {
      query = query.gte('start_date', startDate)
    } else if (endDate) {
      query = query.lte('end_date', endDate)
    }

    // Ordering and pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: applications, error, count } = await query

    if (error) {
      console.error('Error fetching leave applications:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch leave applications' 
      }, { status: 500 })
    }

    // Format the response
    const formattedApplications = applications?.map(app => ({
      id: app.id,
      applicationNumber: app.application_number,
      startDate: app.start_date,
      endDate: app.end_date,
      totalDays: app.total_days,
      reason: app.reason,
      status: app.status,
      approvalLevel: app.approval_level,
      appliedDate: app.applied_date,
      approvedDate: app.approved_date,
      rejectedDate: app.rejected_date,
      approvalComments: app.approval_comments,
      rejectionReason: app.rejection_reason,
      halfDayStart: app.half_day_start,
      halfDayEnd: app.half_day_end,
      emergencyContact: app.emergency_contact,
      handoverNotes: app.handover_notes,
      medicalCertificateUrl: app.medical_certificate_url,
      supportingDocumentsUrls: app.supporting_documents_urls,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
      currentApproverId: app.current_approver_id,
      
      // User information
      user: app.users ? {
        id: (app.users as any).id,
        fullName: (app.users as any).full_name,
        employeeId: (app.users as any).employee_id,
        primaryRole: (app.users as any).primary_role,
        email: (app.users as any).email,
        phone: (app.users as any).phone
      } : null,

      // Leave type information
      leaveType: app.leave_types ? {
        id: (app.leave_types as any).id,
        name: (app.leave_types as any).name,
        code: (app.leave_types as any).code,
        color: mapDatabaseColorToFrontend((app.leave_types as any).color),
        isPaid: (app.leave_types as any).is_paid,
        icon: getIconForLeaveType((app.leave_types as any).name)
      } : null,

      // Approval workflow
      approvalWorkflow: app.leave_approval_workflow?.map(workflow => ({
        id: workflow.id,
        approvalLevel: workflow.approval_level,
        status: workflow.status,
        decisionDate: workflow.decision_date,
        comments: workflow.comments,
        approverId: workflow.approver_id,
        approverRole: workflow.approver_role,
        approver: workflow.users ? {
          id: (workflow.users as any).id,
          fullName: (workflow.users as any).full_name,
          primaryRole: (workflow.users as any).primary_role
        } : null
      })) || []
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedApplications,
      pagination: {
        offset,
        limit,
        total: count || 0
      }
    })

  } catch (error) {
    console.error('Error in leave applications API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const body = await request.json()
    const {
      applicationId,
      action, // 'approve' or 'reject'
      comments,
      approverId
    } = body

    if (!applicationId || !action || !approverId) {
      return NextResponse.json({
        error: 'Missing required fields: applicationId, action, approverId'
      }, { status: 400 })
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({
        error: 'Action must be either "approve" or "reject"'
      }, { status: 400 })
    }

    // Get the current application
    const { data: application, error: fetchError } = await supabase
      .from('leave_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json({
        error: 'Leave application not found'
      }, { status: 404 })
    }

    if (application.status !== 'pending') {
      return NextResponse.json({
        error: `Cannot ${action} application with status: ${application.status}`
      }, { status: 400 })
    }

    // Update application based on action
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (action === 'approve') {
      updateData.status = 'approved'
      updateData.approved_date = new Date().toISOString()
      updateData.approval_comments = comments
    } else {
      updateData.status = 'rejected'
      updateData.rejected_date = new Date().toISOString()
      updateData.rejection_reason = comments
    }

    // Update the application
    const { error: updateError } = await supabase
      .from('leave_applications')
      .update(updateData)
      .eq('id', applicationId)

    if (updateError) {
      console.error(`Error ${action}ing leave application:`, updateError)
      return NextResponse.json({
        error: `Failed to ${action} leave application`
      }, { status: 500 })
    }

    // Update approval workflow
    const { error: workflowError } = await supabase
      .from('leave_approval_workflow')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        decision_date: new Date().toISOString(),
        comments: comments
      })
      .eq('leave_application_id', applicationId)
      .eq('approver_id', approverId)
      .eq('approval_level', application.approval_level)

    if (workflowError) {
      console.error('Error updating approval workflow:', workflowError)
      // Don't fail the request if workflow update fails
    }

    return NextResponse.json({
      success: true,
      message: `Leave application ${action}ed successfully`
    })

  } catch (error) {
    console.error('Error in leave applications PUT API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Helper functions
function mapDatabaseColorToFrontend(dbColor: string | null): string {
  const colorMap: { [key: string]: string } = {
    '#3B82F6': 'blue',
    '#10B981': 'green', 
    '#EF4444': 'red',
    '#F59E0B': 'orange',
    '#8B5CF6': 'purple',
    '#EC4899': 'pink',
    '#6366F1': 'indigo'
  }
  return colorMap[dbColor || '#3B82F6'] || 'blue'
}

function getIconForLeaveType(name: string): string {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('annual') || lowerName.includes('vacation')) return '🏖️'
  if (lowerName.includes('sick') || lowerName.includes('medical')) return '🏥'
  if (lowerName.includes('emergency')) return '🚨'
  if (lowerName.includes('maternity') || lowerName.includes('paternity')) return '👶'
  if (lowerName.includes('study') || lowerName.includes('education')) return '📚'
  if (lowerName.includes('compassionate') || lowerName.includes('bereavement')) return '🕊️'
  return '📋'
}