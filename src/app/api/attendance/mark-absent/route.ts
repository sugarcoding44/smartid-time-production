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

// Check if today is a working day for the work group
function isTodayWorkingDay(workingDays: number[], todayDayOfWeek: number): boolean {
  // Convert Sunday = 0 to Sunday = 7 for easier comparison
  const adjustedDay = todayDayOfWeek === 0 ? 7 : todayDayOfWeek
  return workingDays.includes(adjustedDay)
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
    const { date, institutionId, dryRun = false } = body

    // Use provided date or today
    const targetDate = date ? new Date(date) : new Date()
    const targetDateStr = targetDate.toISOString().split('T')[0]
    const dayOfWeek = targetDate.getDay() // 0 = Sunday, 1 = Monday, etc.

    console.log(`🔄 Starting absence marking process for ${targetDateStr} (day ${dayOfWeek})`)
    
    // Get all active work groups (optionally filter by institution)
    let workGroupQuery = serviceSupabase
      .from('work_groups')
      .select(`
        id,
        name,
        institution_id,
        default_end_time,
        working_days,
        institutions!inner(
          id,
          name,
          timezone
        )
      `)
      .eq('is_active', true)

    if (institutionId) {
      workGroupQuery = workGroupQuery.eq('institution_id', institutionId)
    }

    const { data: workGroups, error: workGroupError } = await workGroupQuery

    if (workGroupError) {
      console.error('Error fetching work groups:', workGroupError)
      return NextResponse.json({ error: 'Failed to fetch work groups' }, { status: 500 })
    }

    console.log(`📋 Found ${workGroups?.length || 0} active work groups`)

    let processedCount = 0
    let markedAbsentCount = 0
    const results: any[] = []

    for (const workGroup of workGroups || []) {
      console.log(`\n🏫 Processing work group: ${workGroup.name} (Institution: ${workGroup.institutions.name})`)
      
      // Check if today is a working day for this work group
      if (!isTodayWorkingDay(workGroup.working_days, dayOfWeek)) {
        console.log(`📅 Skipping ${workGroup.name} - not a working day (working days: ${workGroup.working_days.join(',')})`)
        continue
      }

      const institutionTimezone = workGroup.institutions.timezone || 'Asia/Kuala_Lumpur'
      
      // Calculate the cutoff time (work end time) in the institution's timezone
      const [endHour, endMinute] = workGroup.default_end_time.split(':').map(Number)
      const cutoffTime = new Date(targetDate)
      cutoffTime.setHours(endHour, endMinute, 0, 0)
      
      console.log(`⏰ Work end time: ${workGroup.default_end_time} (cutoff: ${cutoffTime.toISOString()})`)

      // Get all users assigned to this work group
      const { data: assignments, error: assignmentError } = await serviceSupabase
        .from('user_work_group_assignments')
        .select(`
          user_id,
          users!inner(
            id,
            employee_id,
            full_name,
            email
          )
        `)
        .eq('work_group_id', workGroup.id)
        .eq('is_active', true)

      if (assignmentError) {
        console.error(`Error fetching assignments for ${workGroup.name}:`, assignmentError)
        continue
      }

      console.log(`👥 Found ${assignments?.length || 0} assigned users`)

      for (const assignment of assignments || []) {
        const user = assignment.users
        processedCount++

        // Check if user already has an attendance record for the target date
        const { data: existingRecord, error: recordError } = await serviceSupabase
          .from('attendance_records')
          .select('id, status, check_in_time')
          .eq('employee_id', user.employee_id)
          .eq('date', targetDateStr)
          .maybeSingle()

        if (recordError) {
          console.error(`Error checking record for ${user.full_name}:`, recordError)
          continue
        }

        if (existingRecord) {
          console.log(`✅ ${user.full_name} already has record: ${existingRecord.status}`)
          continue
        }

        // User has no record and it's past work end time - mark as absent
        const now = new Date()
        const isNowPastCutoff = now > cutoffTime

        if (isNowPastCutoff || dryRun) {
          console.log(`❌ ${user.full_name} (${user.employee_id}) - no attendance record, marking as absent`)
          
          const absentRecord = {
            employee_id: user.employee_id,
            user_id: user.id,
            institution_id: workGroup.institution_id,
            work_group_id: workGroup.id,
            date: targetDateStr,
            status: 'absent',
            check_in_time: null,
            check_out_time: null,
            notes: `Automatically marked absent - no check-in by end of work day (${workGroup.default_end_time})`,
            verification_method: 'system_auto',
            created_at: now.toISOString(),
            updated_at: now.toISOString()
          }

          if (!dryRun) {
            const { error: insertError } = await serviceSupabase
              .from('attendance_records')
              .insert([absentRecord])

            if (insertError) {
              console.error(`Failed to mark ${user.full_name} as absent:`, insertError)
            } else {
              markedAbsentCount++
              console.log(`✅ Successfully marked ${user.full_name} as absent`)
            }
          } else {
            markedAbsentCount++
            console.log(`🧪 DRY RUN: Would mark ${user.full_name} as absent`)
          }

          results.push({
            user: {
              id: user.id,
              employee_id: user.employee_id,
              full_name: user.full_name,
              email: user.email
            },
            work_group: workGroup.name,
            institution: workGroup.institutions.name,
            action: dryRun ? 'would_mark_absent' : 'marked_absent',
            reason: `No check-in by ${workGroup.default_end_time}`
          })
        } else {
          console.log(`⏳ ${user.full_name} - still within work hours, not marking absent yet`)
        }
      }
    }

    console.log(`\n📊 Absence marking completed:`)
    console.log(`   - Processed: ${processedCount} users`)
    console.log(`   - Marked absent: ${markedAbsentCount} users`)
    console.log(`   - Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)

    return NextResponse.json({
      success: true,
      message: `Absence marking ${dryRun ? 'simulation' : 'process'} completed`,
      stats: {
        processed_users: processedCount,
        marked_absent: markedAbsentCount,
        date: targetDateStr,
        dry_run: dryRun
      },
      results: results
    }, { headers: corsHeaders() })

  } catch (error) {
    console.error('Error in absence marking:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders() }
    )
  }
}