import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institution_id')

    if (!institutionId) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 })
    }

    // Get work groups for the institution
    const { data: workGroups, error } = await supabase
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
      .eq('institution_id', institutionId)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching work groups:', error)
      return NextResponse.json({ error: 'Failed to fetch work groups' }, { status: 500 })
    }

    // Get member counts for each work group
    const workGroupIds = workGroups?.map(wg => wg.id) || []
    
    let memberCounts: { [key: string]: number } = {}
    if (workGroupIds.length > 0) {
      const { data: assignments, error: assignmentError } = await supabase
        .from('user_work_group_assignments')
        .select('work_group_id')
        .in('work_group_id', workGroupIds)
        .eq('is_active', true)
        .lte('effective_from', new Date().toISOString().split('T')[0])
        .or(`effective_to.is.null,effective_to.gte.${new Date().toISOString().split('T')[0]}`)

      if (!assignmentError) {
        memberCounts = assignments?.reduce((acc, assignment) => {
          acc[assignment.work_group_id] = (acc[assignment.work_group_id] || 0) + 1
          return acc
        }, {} as { [key: string]: number }) || {}
      }
    }

    // Format the response
    const formattedWorkGroups = workGroups?.map(wg => ({
      id: wg.id,
      name: wg.name,
      description: wg.description,
      schedule_start: wg.default_start_time,
      schedule_end: wg.default_end_time,
      break_start: wg.break_start_time || '12:00:00',
      break_end: wg.break_end_time || '13:00:00',
      working_days: mapWorkingDaysFromNumbers(wg.working_days),
      member_count: memberCounts[wg.id] || 0,
      created_at: wg.created_at
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedWorkGroups
    })

  } catch (error) {
    console.error('Error in work groups API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const body = await request.json()

    const {
      institution_id,
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
    if (!institution_id || !name || !schedule_start || !schedule_end || !working_days?.length) {
      return NextResponse.json({ 
        error: 'Missing required fields: institution_id, name, schedule_start, schedule_end, working_days' 
      }, { status: 400 })
    }

    // Convert working days from string array to number array
    const workingDaysNumbers = mapWorkingDaysToNumbers(working_days)

    // Create the work group
    const { data: workGroup, error } = await supabase
      .from('work_groups')
      .insert({
        institution_id,
        name: name.trim(),
        description: description?.trim() || null,
        default_start_time: schedule_start,
        default_end_time: schedule_end,
        break_start_time: break_start || '12:00:00',
        break_end_time: break_end || '13:00:00',
        working_days: workingDaysNumbers,
        is_active: true,
        created_by: user_id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating work group:', error)
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'A work group with this name already exists' 
        }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to create work group' }, { status: 500 })
    }

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
      member_count: 0,
      created_at: workGroup.created_at
    }

    return NextResponse.json({
      success: true,
      data: formattedWorkGroup
    })

  } catch (error) {
    console.error('Error in work groups POST API:', error)
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
