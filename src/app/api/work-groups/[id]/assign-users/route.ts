import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workGroupId } = await params
    const body = await request.json()
    const { user_ids, assigned_by_user_id } = body

    if (!workGroupId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Work group ID is required' 
      }, { status: 400 })
    }

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'User IDs array is required' 
      }, { status: 400 })
    }

    if (!assigned_by_user_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Assigned by user ID is required' 
      }, { status: 400 })
    }

    console.log('🔄 Starting user assignment process:', {
      workGroupId,
      userIdsCount: user_ids.length,
      assignedBy: assigned_by_user_id
    })

    // Use service role client like in the work-groups route
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check for existing assignments for these users in this work group
    const today = new Date().toISOString().split('T')[0]
    const { data: existingAssignments, error: checkError } = await supabase
      .from('user_work_group_assignments')
      .select('user_id')
      .eq('work_group_id', workGroupId)
      .in('user_id', user_ids)
      .eq('effective_from', today)
      .eq('is_active', true)

    if (checkError) {
      console.error('Error checking existing assignments:', checkError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to check existing assignments' 
      }, { status: 500 })
    }

    // Filter out users who already have assignments for today
    const existingUserIds = (existingAssignments || []).map(a => a.user_id)
    const newUserIds = user_ids.filter(userId => !existingUserIds.includes(userId))
    
    if (newUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All users are already assigned to this work group for today',
        data: {
          assignments: [],
          skipped_count: user_ids.length
        }
      })
    }

    if (existingUserIds.length > 0) {
      console.log(`⚠️  Skipping ${existingUserIds.length} users who are already assigned for today:`, existingUserIds)
    }

    // Get the work group to find the institution_id
    const { data: workGroup, error: workGroupError } = await supabase
      .from('work_groups')
      .select('institution_id')
      .eq('id', workGroupId)
      .single()
      
    if (workGroupError || !workGroup) {
      console.error('Error fetching work group:', workGroupError)
      return NextResponse.json({ 
        success: false, 
        error: 'Work group not found' 
      }, { status: 404 })
    }

    console.log('📋 Work group details:', workGroup)

    // Create new assignments with institution_id (only for users not already assigned)
    const assignments = newUserIds.map(userId => ({
      user_id: userId,
      work_group_id: workGroupId,
      institution_id: workGroup.institution_id,
      effective_from: today, // Use the same date variable
      is_active: true,
      // Only include fields that actually exist in the table
      ...(assigned_by_user_id && { assigned_by: assigned_by_user_id })
    }))

    console.log('💾 Attempting to insert assignments:', assignments)

    const { data: assignmentData, error: assignmentError } = await supabase
      .from('user_work_group_assignments')
      .insert(assignments)
      .select()

    if (assignmentError) {
      console.error('Error creating work group assignments:', assignmentError)
      console.error('Assignment data that failed:', assignments)
      
      // Provide more detailed error information
      let errorMessage = 'Failed to create work group assignments'
      if (assignmentError.message) {
        errorMessage += `: ${assignmentError.message}`
      }
      if (assignmentError.details) {
        errorMessage += ` (${assignmentError.details})`
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMessage,
        debug: {
          assignments,
          supabaseError: assignmentError
        }
      }, { status: 500 })
    }

    // Get updated work group info with member count
    const { data: workGroupData, error: fetchError } = await supabase
      .from('work_groups')
      .select(`
        *,
        user_work_group_assignments!inner(
          user_id,
          users(
            id,
            full_name,
            employee_id,
            primary_role,
            department
          )
        )
      `)
      .eq('id', workGroupId)
      .eq('user_work_group_assignments.is_active', true)
      .single()

    if (fetchError) {
      console.error('Error fetching updated work group:', fetchError)
      // Still return success since the assignment worked
    }

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${newUserIds.length} new users to work group${
        existingUserIds.length > 0 
          ? ` (${existingUserIds.length} users were already assigned)` 
          : ''
      }`,
      data: {
        assignments: assignmentData,
        work_group: workGroupData,
        newly_assigned_count: newUserIds.length,
        already_assigned_count: existingUserIds.length,
        total_requested: user_ids.length
      }
    })

  } catch (error) {
    console.error('Error in work group user assignment:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Remove users from work group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workGroupId } = await params
    const body = await request.json()
    const { user_ids } = body

    if (!workGroupId || !user_ids || !Array.isArray(user_ids)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Work group ID and user IDs are required' 
      }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Deactivate assignments
    const { data, error } = await supabase
      .from('user_work_group_assignments')
      .update({ 
        is_active: false,
        effective_to: new Date().toISOString().split('T')[0]
      })
      .eq('work_group_id', workGroupId)
      .in('user_id', user_ids)
      .eq('is_active', true)

    if (error) {
      console.error('Error removing users from work group:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to remove users from work group' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${user_ids.length} users from work group`,
      data
    })

  } catch (error) {
    console.error('Error removing users from work group:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}