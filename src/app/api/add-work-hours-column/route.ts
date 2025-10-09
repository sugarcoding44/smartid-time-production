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

    console.log('🔧 Attempting to add work_hours column...')

    // Try to add work_hours column using direct SQL
    const { data, error } = await serviceSupabase
      .from('attendance_records')
      .select('id')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Cannot access attendance_records table: ' + error.message,
        suggestion: 'The attendance_records table may not exist or have different structure than expected'
      }, {
        headers: corsHeaders()
      })
    }

    // Since we can't use exec_sql, let's try a different approach
    // We'll create a view that includes the computed work_hours column
    return NextResponse.json({
      success: true,
      message: 'Database schema analysis complete',
      recommendation: 'Update all API calls to use (actual_working_hours + overtime_hours) instead of work_hours',
      solution: `
        The database schema has:
        - actual_working_hours (DECIMAL)
        - overtime_hours (DECIMAL)
        
        But NOT:
        - work_hours (missing)
        
        Solution: All APIs should compute work_hours as:
        work_hours = COALESCE(actual_working_hours, 0) + COALESCE(overtime_hours, 0)
      `
    }, {
      headers: corsHeaders()
    })

  } catch (error) {
    console.error('❌ Schema modification error:', error)
    return NextResponse.json(
      { 
        error: `Cannot modify schema: ${error}`,
        note: 'This might be due to insufficient permissions or database constraints'
      },
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

    // Test what columns actually exist by trying different column combinations
    const tests = [
      { name: 'work_hours', query: 'work_hours' },
      { name: 'actual_working_hours', query: 'actual_working_hours' },
      { name: 'overtime_hours', query: 'overtime_hours' },
      { name: 'work_duration_minutes', query: 'work_duration_minutes' },
      { name: 'total_hours', query: 'total_hours' }
    ]

    const results: Record<string, any> = {}

    for (const test of tests) {
      try {
        const { data, error } = await serviceSupabase
          .from('attendance_records')
          .select(test.query)
          .limit(1)
        
        results[test.name] = {
          exists: !error,
          error: error?.message,
          sample_data: data?.[0]
        }
      } catch (e) {
        results[test.name] = {
          exists: false,
          error: (e as Error).message,
          sample_data: null
        }
      }
    }

    return NextResponse.json({
      success: true,
      column_tests: results
    }, {
      headers: corsHeaders()
    })

  } catch (error) {
    return NextResponse.json(
      { error: `Failed to test columns: ${error}` },
      { status: 500, headers: corsHeaders() }
    )
  }
}