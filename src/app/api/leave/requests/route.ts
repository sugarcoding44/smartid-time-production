import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

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

    // Get user's institution if not provided
    let queryInstitutionId = institutionId
    if (!queryInstitutionId) {
      const { data: currentUser } = await serviceSupabase
        .from('users')
        .select('institution_id')
        .or(`auth_user_id.eq.${user.id},id.eq.${user.id}`)
        .single()
      
      queryInstitutionId = currentUser?.institution_id
    }

    if (!queryInstitutionId) {
      return NextResponse.json(
        { error: 'Institution ID not found' },
        { status: 400 }
      )
    }

    // Check if leave_applications table exists
    const { data: tableCheck, error: tableError } = await serviceSupabase
      .from('leave_applications')
      .select('id')
      .limit(1)

    if (tableError && tableError.message.includes('relation') && tableError.message.includes('does not exist')) {
      // Return mock data if table doesn't exist
      return NextResponse.json({
        success: true,
        data: [
          {
            id: '1',
            userId: 'user1',
            userName: 'Ahmad bin Ali',
            employeeId: 'TC0001',
            leaveType: 'Annual Leave',
            startDate: '2024-03-20',
            endDate: '2024-03-22',
            days: 3,
            reason: 'Family vacation',
            status: 'pending',
            appliedOn: '2024-03-15'
          },
          {
            id: '2',
            userId: 'user2',
            userName: 'Siti Nurhaliza',
            employeeId: 'TC0002',
            leaveType: 'Medical Leave',
            startDate: '2024-03-18',
            endDate: '2024-03-18',
            days: 1,
            reason: 'Medical appointment',
            status: 'approved',
            appliedOn: '2024-03-17'
          }
        ],
        message: 'Using mock data - leave_applications table not found'
      })
    }

    // First get users from the institution
    const { data: institutionUsers } = await serviceSupabase
      .from('users')
      .select('id')
      .eq('institution_id', queryInstitutionId)
    
    const userIds = institutionUsers?.map(u => u.id) || []
    
    // Build query
    let query = serviceSupabase
      .from('leave_applications')
      .select(`
        id,
        application_number,
        user_id,
        leave_type_id,
        start_date,
        end_date,
        total_days,
        reason,
        status,
        applied_date,
        approved_date,
        rejected_date,
        approval_comments,
        rejection_reason
      `)
      .in('user_id', userIds)

    // Add filters
    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: requests, error } = await query
      .order('applied_date', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch leave requests: ' + error.message },
        { status: 400 }
      )
    }

    // Get user details for the requests
    const requestUserIds = [...new Set(requests?.map(r => r.user_id) || [])]
    const { data: users } = await serviceSupabase
      .from('users')
      .select('id, full_name, employee_id, primary_role, ic_number')
      .in('id', requestUserIds)
    
    const userMap = new Map(users?.map(u => [u.id, u]) || [])
    
    // Get leave type details
    const leaveTypeIds = [...new Set(requests?.map(r => r.leave_type_id).filter(Boolean) || [])]
    const { data: leaveTypes } = await serviceSupabase
      .from('leave_types')
      .select('id, name, color, code')
      .in('id', leaveTypeIds)
    
    const leaveTypeMap = new Map(leaveTypes?.map(lt => [lt.id, lt]) || [])

    // Transform the data
    const transformedRequests = requests?.map(request => {
      const user = userMap.get(request.user_id)
      const leaveType = leaveTypeMap.get(request.leave_type_id)
      
      return {
        id: request.id,
        application_number: request.application_number,
        user_id: request.user_id,
        user: user ? {
          full_name: user.full_name,
          employee_id: user.employee_id,
          primary_role: user.primary_role,
          ic_number: user.ic_number
        } : null,
        leave_type_id: request.leave_type_id,
        leave_type: leaveType ? {
          name: leaveType.name,
          color: leaveType.color || 'blue',
          code: leaveType.code
        } : null,
        start_date: request.start_date,
        end_date: request.end_date,
        days_count: request.total_days || calculateDays(request.start_date, request.end_date),
        reason: request.reason,
        status: request.status,
        applied_date: request.applied_date,
        reviewed_date: request.approved_date || request.rejected_date,
        notes: request.approval_comments || request.rejection_reason
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: transformedRequests
    })

  } catch (error) {
    console.error('Leave requests fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, leave_type_id, start_date, end_date, reason } = body

    if (!user_id || !leave_type_id || !start_date || !end_date || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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

    // Check if table exists
    const { error: tableError } = await serviceSupabase
      .from('leave_applications')
      .select('id')
      .limit(1)

    if (tableError && tableError.message.includes('relation') && tableError.message.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        message: 'Leave request created (mock)',
        data: {
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending'
        }
      })
    }

    // Create leave application
    const { data: newRequest, error: createError } = await serviceSupabase
      .from('leave_applications')
      .insert({
        user_id,
        leave_type_id,
        start_date,
        end_date,
        total_days: calculateDays(start_date, end_date),
        reason,
        status: 'pending',
        applied_date: new Date().toISOString(),
        application_number: `LA${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json(
        { error: 'Failed to create leave request: ' + createError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newRequest,
      message: 'Leave request submitted successfully'
    })

  } catch (error) {
    console.error('Leave request creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create leave request' },
      { status: 500 }
    )
  }
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return diffDays
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('id')
    const action = searchParams.get('action') // 'approve' or 'reject'
    
    if (!applicationId || !action) {
      return NextResponse.json(
        { error: 'Application ID and action are required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { notes } = body

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

    // Get current user info
    const { data: currentUser } = await serviceSupabase
      .from('users')
      .select('id, full_name')
      .or(`auth_user_id.eq.${user.id},id.eq.${user.id}`)
      .single()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
      current_approver_id: currentUser.id
    }

    if (action === 'approve') {
      updateData.status = 'approved'
      updateData.approved_date = new Date().toISOString()
      if (notes) {
        updateData.approval_comments = notes
      }
    } else if (action === 'reject') {
      updateData.status = 'rejected'
      updateData.rejected_date = new Date().toISOString()
      if (notes) {
        updateData.rejection_reason = notes
      }
    }

    const { data: updatedApplication, error } = await serviceSupabase
      .from('leave_applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single()

    if (error) {
      console.error('Leave application update error:', error)
      return NextResponse.json(
        { error: 'Failed to update leave application: ' + error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Leave application ${action}d successfully`,
      data: updatedApplication
    })

  } catch (error) {
    console.error('Leave application update error:', error)
    return NextResponse.json(
      { error: 'Failed to update leave application' },
      { status: 500 }
    )
  }
}
