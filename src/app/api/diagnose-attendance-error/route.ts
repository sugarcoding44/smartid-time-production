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

export async function GET(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const results: Record<string, any> = {
      table_tests: {} as Record<string, any>,
      column_tests: {},
      join_tests: {},
      errors: [],
      recommendations: []
    }

    // Test 1: Check attendance_records table structure
    console.log('🔍 Testing attendance_records table...')
    try {
      const { data, error } = await serviceSupabase
        .from('attendance_records')
        .select('*')
        .limit(1)

      results.table_tests.attendance_records = {
        exists: !error,
        error: error?.message,
        sample_columns: data?.[0] ? Object.keys(data[0]) : []
      }

      if (data?.[0]) {
        results.column_tests.attendance_records_columns = Object.keys(data[0])
      }
    } catch (e) {
      results.errors.push(`attendance_records test failed: ${(e as Error).message}`)
    }

    // Test 2: Check work_groups table structure
    console.log('🔍 Testing work_groups table...')
    try {
      const { data, error } = await serviceSupabase
        .from('work_groups')
        .select('*')
        .limit(1)

      results.table_tests.work_groups = {
        exists: !error,
        error: error?.message,
        sample_columns: data?.[0] ? Object.keys(data[0]) : []
      }

      if (data?.[0]) {
        results.column_tests.work_groups_columns = Object.keys(data[0])
      }
    } catch (e) {
      results.errors.push(`work_groups test failed: ${(e as Error).message}`)
    }

    // Test 3: Try the specific columns that might cause issues
    const columnsToTest = [
      'work_hours',
      'actual_working_hours', 
      'overtime_hours',
      'work_duration_minutes',
      'total_hours',
      'minimum_working_hours'
    ]

    for (const column of columnsToTest) {
      console.log(`🔍 Testing column: ${column}`)
      try {
        const { data, error } = await serviceSupabase
          .from('attendance_records')
          .select(column)
          .limit(1)

        results.column_tests[`attendance_records.${column}`] = {
          exists: !error,
          error: error?.message,
          sample_value: data?.[0] ? (data[0] as any)[column] : null
        }
      } catch (e) {
        results.column_tests[`attendance_records.${column}`] = {
          exists: false,
          error: (e as Error).message,
          sample_value: null
        }
      }
    }

    // Test 4: Try join queries that might be causing issues
    console.log('🔍 Testing potential join queries...')
    
    // Test simple join without problematic columns
    try {
      const { data, error } = await serviceSupabase
        .from('attendance_records')
        .select(`
          id,
          user_id,
          work_group_id,
          work_groups:work_group_id (
            id,
            name,
            minimum_working_hours
          )
        `)
        .limit(1)

      results.join_tests.attendance_work_groups_join = {
        success: !error,
        error: error?.message,
        sample_data: data?.[0]
      }
    } catch (e) {
      results.join_tests.attendance_work_groups_join = {
        success: false,
        error: (e as Error).message,
        sample_data: null
      }
    }

    // Test 5: Try to reproduce the exact error pattern
    try {
      const { data, error } = await serviceSupabase
        .from('attendance_records')
        .select('work_hours, actual_working_hours, overtime_hours')
        .limit(1)

      results.join_tests.reproduce_error = {
        success: !error,
        error: error?.message,
        is_exact_error: error?.message?.includes('work_hours does not exist') || false
      }
    } catch (e) {
      results.join_tests.reproduce_error = {
        success: false,
        error: (e as Error).message,
        is_exact_error: (e as Error).message.includes('work_hours does not exist')
      }
    }

    // Generate recommendations based on findings
    if (results.column_tests['attendance_records.work_hours']?.exists === false) {
      results.recommendations.push(
        'ISSUE FOUND: work_hours column does not exist in attendance_records table'
      )
      results.recommendations.push(
        'SOLUTION: Use (actual_working_hours + overtime_hours) instead of work_hours'
      )
    }

    if (results.table_tests.work_groups?.exists && results.column_tests.work_groups_columns?.includes('minimum_working_hours')) {
      results.recommendations.push(
        'AVAILABLE: work_groups.minimum_working_hours can be used for work hour calculations'
      )
    }

    console.log('✅ Diagnostic completed!')

    return NextResponse.json({
      success: true,
      diagnosis: results,
      summary: {
        attendance_records_exists: results.table_tests.attendance_records?.exists || false,
        work_groups_exists: results.table_tests.work_groups?.exists || false,
        work_hours_column_missing: results.column_tests['attendance_records.work_hours']?.exists === false,
        actual_working_hours_exists: results.column_tests['attendance_records.actual_working_hours']?.exists || false,
        overtime_hours_exists: results.column_tests['attendance_records.overtime_hours']?.exists || false
      }
    }, {
      headers: corsHeaders()
    })

  } catch (error) {
    console.error('❌ Diagnostic error:', error)
    return NextResponse.json(
      { error: `Diagnostic failed: ${error}` },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { test_query } = body

    if (!test_query) {
      return NextResponse.json(
        { error: 'test_query is required in request body' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log(`🧪 Testing custom query: ${test_query}`)

    const { data, error } = await serviceSupabase
      .from('attendance_records')
      .select(test_query)
      .limit(1)

    return NextResponse.json({
      success: true,
      query: test_query,
      result: {
        success: !error,
        error: error?.message,
        data: data?.[0],
        column_count: data?.[0] ? Object.keys(data[0]).length : 0,
        columns: data?.[0] ? Object.keys(data[0]) : []
      }
    }, {
      headers: corsHeaders()
    })

  } catch (error) {
    console.error('❌ Custom query test error:', error)
    return NextResponse.json(
      { error: `Test query failed: ${error}` },
      { status: 500, headers: corsHeaders() }
    )
  }
}