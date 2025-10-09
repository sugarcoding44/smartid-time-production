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

    console.log('🔧 Analyzing attendance_records schema issue...')

    const steps = []

    // Check if work_hours column exists
    const { data: workHoursTest, error: workHoursError } = await serviceSupabase
      .from('attendance_records')
      .select('work_hours')
      .limit(1)

    if (workHoursError && workHoursError.message.includes('work_hours does not exist')) {
      steps.push('❌ Confirmed: work_hours column does not exist')
      
      // Check what columns do exist
      const { data: actualTest, error: actualError } = await serviceSupabase
        .from('attendance_records')
        .select('actual_working_hours, overtime_hours, work_duration_minutes')
        .limit(1)

      if (!actualError) {
        steps.push('✅ Found: actual_working_hours, overtime_hours, work_duration_minutes columns exist')
        
        // The solution is to modify the API to use existing columns instead of expecting work_hours
        steps.push('💡 Solution: Update attendance API to use existing columns')
        steps.push('📝 Recommendation: Change queries from work_hours to (actual_working_hours + overtime_hours)')
        
        // Check a few records to see data patterns
        const { data: sampleRecords } = await serviceSupabase
          .from('attendance_records')
          .select('id, actual_working_hours, overtime_hours, work_duration_minutes')
          .limit(5)

        const analysis = {
          total_records: sampleRecords?.length || 0,
          has_actual_hours: sampleRecords?.some(r => r.actual_working_hours !== null) || false,
          has_overtime: sampleRecords?.some(r => r.overtime_hours !== null) || false,
          has_duration_minutes: sampleRecords?.some(r => r.work_duration_minutes !== null) || false
        }
        
        steps.push(`📊 Data analysis: ${JSON.stringify(analysis)}`)
        
        return NextResponse.json({
          success: true,
          message: 'Schema analysis complete - work_hours column missing but can be computed',
          issue: 'Column work_hours does not exist in attendance_records table',
          solution: 'Use (actual_working_hours + overtime_hours) or work_duration_minutes/60 instead',
          data: {
            steps,
            sample_records: sampleRecords,
            analysis
          }
        }, {
          headers: corsHeaders()
        })
      } else {
        steps.push(`❌ Error checking other columns: ${actualError.message}`)
      }
    } else if (!workHoursError) {
      steps.push('✅ work_hours column exists - no fix needed')
    } else {
      steps.push(`⚠️ Unexpected error: ${workHoursError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Schema check completed',
      data: { steps }
    }, {
      headers: corsHeaders()
    })

  } catch (error) {
    console.error('❌ Schema analysis error:', error)
    return NextResponse.json(
      { error: `Failed to analyze schema: ${error}` },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if work_hours column exists by trying to select it
    const { data: workHoursTest, error: workHoursError } = await serviceSupabase
      .from('attendance_records')
      .select('work_hours')
      .limit(1)

    // Check current attendance records structure
    const { data: sample, error: sampleError } = await serviceSupabase
      .from('attendance_records')
      .select('id, actual_working_hours, overtime_hours, work_duration_minutes')
      .limit(5)

    return NextResponse.json({
      success: true,
      work_hours_exists: !workHoursError,
      work_hours_error: workHoursError?.message,
      sample_data: sample,
      sample_error: sampleError?.message,
      analysis: {
        has_actual_working_hours: sample?.some(r => r.actual_working_hours !== null) || false,
        has_overtime_hours: sample?.some(r => r.overtime_hours !== null) || false,
        has_work_duration_minutes: sample?.some(r => r.work_duration_minutes !== null) || false
      }
    }, {
      headers: corsHeaders()
    })

  } catch (error) {
    return NextResponse.json(
      { error: `Failed to check schema: ${error}` },
      { status: 500, headers: corsHeaders() }
    )
  }
}
