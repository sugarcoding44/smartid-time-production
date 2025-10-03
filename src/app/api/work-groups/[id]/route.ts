import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { id } = await params

    // Get specific work group
    const { data: workGroup, error } = await supabase
      .from('work_groups')
      .select(`
        id,
        name,
        description,
        default_start_time,
        default_end_time,
        break_start_time,
        break_end_time,
        working_days,
        is_active,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching work group:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Work group not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch work group' }, { status: 500 })
    }

    // Get member count for this work group
    const { data: assignments, error: assignmentError } = await supabase
      .from('user_work_group_assignments')
      .select('user_id')
      .eq('work_group_id', id)
      .eq('is_active', true)
      .lte('effective_from', new Date().toISOString().split('T')[0])
      .or(`effective_to.is.null,effective_to.gte.${new Date().toISOString().split('T')[0]}`)

    const memberCount = assignmentError ? 0 : assignments?.length || 0

    // Format the response
    const formattedWorkGroup = {
      id: workGroup.id,
      name: workGroup.name,
      description: workGroup.description,
      schedule_start: workGroup.default_start_time,
      schedule_end: workGroup.default_end_time,
      break_start: workGroup.break_start_time || '12:00:00',
      break_end: workGroup.break_end_time || '13:00:00',
      working_days: mapWorkingDaysFromNumbers(workGroup.working_days),
      member_count: memberCount,
      created_at: workGroup.created_at
    }

    return NextResponse.json({
      success: true,
      data: formattedWorkGroup
    })

  } catch (error) {
    console.error('Error in work group GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { id } = await params
    const body = await request.json()

    const {
      name,
      description,
      schedule_start,
      schedule_end,
      break_start,
      break_end,
      working_days,
      user_id
    } = body

    // Validate required fields
    if (!name || !schedule_start || !schedule_end || !working_days?.length) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, schedule_start, schedule_end, working_days' 
      }, { status: 400 })
    }

    // Convert working days from string array to number array
    const workingDaysNumbers = mapWorkingDaysToNumbers(working_days)

    // Update the work group
    const { data: workGroup, error } = await supabase
      .from('work_groups')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        default_start_time: schedule_start,
        default_end_time: schedule_end,
        break_start_time: break_start || '12:00:00',
        break_end_time: break_end || '13:00:00',
        working_days: workingDaysNumbers,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      console.error('Error updating work group:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Work group not found' }, { status: 404 })
      }
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'A work group with this name already exists' 
        }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to update work group' }, { status: 500 })
    }

    // Get member count for this work group
    const { data: assignments, error: assignmentError } = await supabase
      .from('user_work_group_assignments')
      .select('user_id')
      .eq('work_group_id', id)
      .eq('is_active', true)
      .lte('effective_from', new Date().toISOString().split('T')[0])
      .or(`effective_to.is.null,effective_to.gte.${new Date().toISOString().split('T')[0]}`)

    const memberCount = assignmentError ? 0 : assignments?.length || 0

    // Format the response
    const formattedWorkGroup = {
      id: workGroup.id,
      name: workGroup.name,
      description: workGroup.description,
      schedule_start: workGroup.default_start_time,
      schedule_end: workGroup.default_end_time,
      break_start: workGroup.break_start_time,
      break_end: workGroup.break_end_time,
      working_days: mapWorkingDaysFromNumbers(workGroup.working_days),
      member_count: memberCount,
      created_at: workGroup.created_at
    }

    return NextResponse.json({
      success: true,
      data: formattedWorkGroup
    })

  } catch (error) {
    console.error('Error in work group PUT API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { id } = await params

    // Check if work group has any active assignments
    const { data: assignments, error: assignmentError } = await supabase
      .from('user_work_group_assignments')
      .select('id')
      .eq('work_group_id', id)
      .eq('is_active', true)
      .lte('effective_from', new Date().toISOString().split('T')[0])
      .or(`effective_to.is.null,effective_to.gte.${new Date().toISOString().split('T')[0]}`)

    if (assignmentError) {
      console.error('Error checking work group assignments:', assignmentError)
      return NextResponse.json({ error: 'Failed to check work group assignments' }, { status: 500 })
    }

    if (assignments && assignments.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete work group with active member assignments. Please remove all members first.' 
      }, { status: 400 })
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('work_groups')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_active', true)

    if (error) {
      console.error('Error deleting work group:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Work group not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to delete work group' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Work group deleted successfully'
    })

  } catch (error) {
    console.error('Error in work group DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions to map working days between formats
function mapWorkingDaysToNumbers(days: string[]): number[] {
  const dayMap: { [key: string]: number } = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 7
  }
  
  return days.map(day => dayMap[day]).filter(num => num !== undefined)
}

function mapWorkingDaysFromNumbers(numbers: number[]): string[] {
  const numberMap: { [key: number]: string } = {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
    7: 'sunday'
  }
  
  return numbers.map(num => numberMap[num]).filter(day => day !== undefined)
}
