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

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const employeeId = searchParams.get('employeeId')
    const year = searchParams.get('year') || new Date().getFullYear().toString()

    if (!userId && !employeeId) {
      return NextResponse.json({
        success: false,
        error: 'Either userId or employeeId is required'
      }, { status: 400, headers: corsHeaders })
    }

    let user: any = null

    // Find user by auth_user_id if provided, otherwise by employee_id
    if (userId) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, institution_id, full_name, employee_id')
        .eq('auth_user_id', userId)
        .eq('status', 'active')
        .single()

      if (userError || !userData) {
        return NextResponse.json({
          success: false,
          error: 'User not found with provided auth user ID'
        }, { status: 404, headers: corsHeaders })
      }

      user = userData
    } else if (employeeId) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, institution_id, full_name, employee_id')
        .eq('employee_id', employeeId)
        .eq('status', 'active')
        .single()

      if (userError || !userData) {
        return NextResponse.json({
          success: false,
          error: 'User not found with provided employee ID'
        }, { status: 404, headers: corsHeaders })
      }

      user = userData
    }

    // Get user leave quotas for the specified year
    const { data: quotas, error: quotaError } = await supabase
      .from('user_leave_quotas')
      .select(`
        *,
        leave_types!user_leave_quotas_leave_type_id_fkey (
          id,
          name,
          code,
          color,
          has_annual_quota,
          default_quota_days
        )
      `)
      .eq('user_id', user.id)
      .eq('quota_year', parseInt(year))

    console.log('Quotas query result:', { quotas: quotas?.length || 0, error: quotaError })
    
    if (quotaError || !quotas || quotas.length === 0) {
      console.error('Error fetching user quotas or no quotas found:', quotaError)
      
      // If no quotas exist, create default quotas from leave types
      console.log('No quotas found, creating default quotas for user:', user.id, 'institution:', user.institution_id)
      
      const { data: leaveTypes, error: leaveTypesError } = await supabase
        .from('leave_types')
        .select('*')
        .eq('institution_id', user.institution_id)
        .eq('is_active', true)

      console.log('Leave types query result:', { 
        count: leaveTypes?.length || 0, 
        error: leaveTypesError,
        institutionId: user.institution_id 
      })

      if (leaveTypesError || !leaveTypes || leaveTypes.length === 0) {
        console.error('Failed to fetch leave types:', leaveTypesError)
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch leave types or no leave types found'
        }, { status: 500, headers: corsHeaders })
      }

      // Create default quotas - only include basic required columns
      const defaultQuotas = leaveTypes.map(leaveType => ({
        user_id: user.id,
        leave_type_id: leaveType.id,
        quota_year: parseInt(year),
        allocated_days: leaveType.default_quota_days || 14
      }))
      
      console.log('Creating quotas:', defaultQuotas)

      const { data: createdQuotas, error: createError } = await supabase
        .from('user_leave_quotas')
        .insert(defaultQuotas)
        .select(`
          *,
          leave_types!user_leave_quotas_leave_type_id_fkey (
            id,
            name,
            code,
            color,
            has_annual_quota,
            default_quota_days
          )
        `)

      if (createError) {
        console.error('Error creating default quotas:', createError)
        return NextResponse.json({
          success: false,
          error: 'Failed to create default quotas'
        }, { status: 500, headers: corsHeaders })
      }

      // Use created quotas
      const formattedQuotas = createdQuotas?.map(quota => ({
        leaveTypeId: quota.leave_type_id,
        leaveTypeName: quota.leave_types?.name || 'Unknown',
        leaveTypeCode: quota.leave_types?.code || '',
        leaveTypeColor: quota.leave_types?.color || '#6366f1',
        allocatedDays: quota.allocated_days,
        usedDays: quota.used_days,
        remainingDays: quota.available_days,
        quotaYear: quota.quota_year,
        hasAnnualQuota: quota.leave_types?.has_annual_quota || false
      })) || []

      return NextResponse.json({
        success: true,
        data: {
          userId: user.id,
          userName: user.full_name,
          employeeId: user.employee_id,
          quotaYear: parseInt(year),
          quotas: formattedQuotas
        }
      }, { headers: corsHeaders })
    }

    // Format existing quotas response
    const formattedQuotas = quotas?.map(quota => ({
      leaveTypeId: quota.leave_type_id,
      leaveTypeName: quota.leave_types?.name || 'Unknown',
      leaveTypeCode: quota.leave_types?.code || '',
      leaveTypeColor: quota.leave_types?.color || '#6366f1',
      allocatedDays: quota.allocated_days,
      usedDays: quota.used_days,
      remainingDays: quota.available_days,
      quotaYear: quota.quota_year,
      hasAnnualQuota: quota.leave_types?.has_annual_quota || false
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        userName: user.full_name,
        employeeId: user.employee_id,
        quotaYear: parseInt(year),
        quotas: formattedQuotas
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error in leave quota API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500, headers: corsHeaders })
  }
}