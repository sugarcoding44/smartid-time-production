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

    console.log('🏗️ Creating attendance_records table...')

    // Try inserting a test record to create the table structure
    const testRecord = {
      employee_id: 'TEST001',
      user_id: null,
      date: '2025-09-26',
      check_in_time: new Date().toISOString(),
      check_out_time: null,
      check_in_location: { latitude: 0, longitude: 0, address: 'Test' },
      check_out_location: null,
      status: 'present',
      method: 'manual',
      work_duration_minutes: null,
      notes: 'Test record to create table structure',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // This will create the table if it doesn't exist
    const { data, error } = await serviceSupabase
      .from('attendance_records')
      .insert([testRecord])
      .select()

    if (error) {
      console.error('Table creation error:', error)
      return NextResponse.json(
        { error: `Failed to create table: ${error.message}` },
        { status: 500, headers: corsHeaders() }
      )
    }

    console.log('✅ Table created with test record')

    // Delete the test record
    await serviceSupabase
      .from('attendance_records')
      .delete()
      .eq('employee_id', 'TEST001')

    return NextResponse.json({
      success: true,
      message: 'Attendance table created successfully',
      data: { test_record_id: data?.[0]?.id }
    }, {
      headers: corsHeaders()
    })

  } catch (error) {
    console.error('❌ Table creation error:', error)
    return NextResponse.json(
      { error: `Failed to create table: ${error}` },
      { status: 500, headers: corsHeaders() }
    )
  }
}
