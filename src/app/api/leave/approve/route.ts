import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// CORS headers for mobile app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

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
    const {
      applicationId,
      action, // 'approve' or 'reject'
      comments,
      approverId
    } = body

    if (!applicationId || !action || !approverId) {
      return NextResponse.json({
        error: 'Missing required fields: applicationId, action, approverId'
      }, { status: 400, headers: corsHeaders })
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({
        error: 'Action must be either "approve" or "reject"'
      }, { status: 400, headers: corsHeaders })
    }

    // Get the current application with leave type info
    const { data: application, error: fetchError } = await supabase
      .from('leave_applications')
      .select(`
        *,
        users!leave_applications_user_id_fkey (
          id, full_name, employee_id
        ),
        leave_types!leave_applications_leave_type_id_fkey (
          id, name, code
        )
      `)
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json({
        error: 'Leave application not found'
      }, { status: 404, headers: corsHeaders })
    }

    if (application.status !== 'pending') {
      return NextResponse.json({
        error: `Cannot ${action} application with status: ${application.status}`
      }, { status: 400, headers: corsHeaders })
    }

    // Calculate working days for the leave period
    const startDate = new Date(application.start_date)
    const endDate = new Date(application.end_date)
    let workingDays = 0
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
        workingDays++
      }
    }

    // Update application status
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      updated_at: new Date().toISOString()
    }

    if (action === 'approve') {
      updateData.approved_date = new Date().toISOString()
      updateData.approval_comments = comments
    } else {
      updateData.rejected_date = new Date().toISOString()
      updateData.rejection_reason = comments
    }

    const { error: updateError } = await supabase
      .from('leave_applications')
      .update(updateData)
      .eq('id', applicationId)

    if (updateError) {
      console.error(`Error ${action}ing leave application:`, updateError)
      return NextResponse.json({
        error: `Failed to ${action} leave application`
      }, { status: 500, headers: corsHeaders })
    }

    // If approved, deduct from user's leave balance
    if (action === 'approve') {
      console.log(`🎯 Deducting ${workingDays} working days from ${application.users?.full_name}'s ${application.leave_types?.name} balance`)
      
      // Get current leave quota
      const currentYear = new Date().getFullYear()
      const { data: quotaData, error: quotaError } = await supabase
        .from('user_leave_quotas')
        .select('*')
        .eq('user_id', application.user_id)
        .eq('leave_type_id', application.leave_type_id)
        .eq('quota_year', currentYear)
        .single()

      if (quotaError) {
        console.warn('No leave quota found for user, creating default quota')
        
        // Create default quota if doesn't exist
        const { data: leaveType } = await supabase
          .from('leave_types')
          .select('default_quota_days')
          .eq('id', application.leave_type_id)
          .single()
        
        if (leaveType) {
          const { error: createQuotaError } = await supabase
            .from('user_leave_quotas')
            .insert({
              user_id: application.user_id,
              leave_type_id: application.leave_type_id,
              quota_year: currentYear,
              allocated_days: leaveType.default_quota_days,
              used_days: workingDays,
              remaining_days: (leaveType.default_quota_days || 0) - workingDays
            })
          
          if (createQuotaError) {
            console.error('Error creating leave quota:', createQuotaError)
          }
        }
      } else {
        // Update existing quota
        const newUsedDays = (quotaData.used_days || 0) + workingDays
        const newRemainingDays = quotaData.allocated_days - newUsedDays
        
        const { error: updateQuotaError } = await supabase
          .from('user_leave_quotas')
          .update({
            used_days: newUsedDays,
            remaining_days: newRemainingDays,
            updated_at: new Date().toISOString()
          })
          .eq('id', quotaData.id)
        
        if (updateQuotaError) {
          console.error('Error updating leave quota:', updateQuotaError)
        } else {
          console.log(`✅ Updated leave balance: ${newUsedDays} used, ${newRemainingDays} remaining`)
        }
      }
    }

    // Update approval workflow
    const { error: workflowError } = await supabase
      .from('leave_approval_workflow')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        decision_date: new Date().toISOString(),
        comments: comments,
        approver_id: approverId
      })
      .eq('leave_application_id', applicationId)
      .eq('approval_level', application.approval_level)

    if (workflowError) {
      console.error('Error updating approval workflow:', workflowError)
      // Don't fail the request if workflow update fails
    }

    return NextResponse.json({
      success: true,
      message: `Leave application ${action}ed successfully`,
      data: {
        applicationId,
        status: action === 'approve' ? 'approved' : 'rejected',
        workingDays: action === 'approve' ? workingDays : null
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error in leave approval API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500, headers: corsHeaders })
  }
}