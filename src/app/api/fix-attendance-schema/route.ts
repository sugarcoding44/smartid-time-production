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

    console.log('🔧 Fixing attendance_records table schema...')

    const steps = []

    // 1. Add missing columns
    try {
      await serviceSupabase.rpc('exec_sql', {
        query: `ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS employee_id VARCHAR;`
      })
      steps.push('✅ Added employee_id column')
    } catch (e) {
      steps.push(`⚠️ employee_id column: ${(e as Error).message}`)
    }

    try {
      await serviceSupabase.rpc('exec_sql', {
        query: `ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS check_in_location JSONB;`
      })
      steps.push('✅ Added check_in_location column')
    } catch (e) {
      steps.push(`⚠️ check_in_location column: ${(e as Error).message}`)
    }

    try {
      await serviceSupabase.rpc('exec_sql', {
        query: `ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS check_out_location JSONB;`
      })
      steps.push('✅ Added check_out_location column')
    } catch (e) {
      steps.push(`⚠️ check_out_location column: ${(e as Error).message}`)
    }

    // 2. Update status constraint
    try {
      await serviceSupabase.rpc('exec_sql', {
        query: `
          ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS attendance_records_status_check;
          ALTER TABLE attendance_records ADD CONSTRAINT attendance_records_status_check 
          CHECK (status::text = ANY (ARRAY[
              'present'::character varying,
              'late'::character varying,
              'absent'::character varying,
              'early_leave'::character varying,
              'pending_approval'::character varying
          ]::text[]));
        `
      })
      steps.push('✅ Updated status constraint to include pending_approval')
    } catch (e) {
      steps.push(`⚠️ Status constraint: ${(e as Error).message}`)
    }

    // 3. Update verification_method constraint
    try {
      await serviceSupabase.rpc('exec_sql', {
        query: `
          ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS attendance_records_verification_method_check;
          ALTER TABLE attendance_records ADD CONSTRAINT attendance_records_verification_method_check 
          CHECK (verification_method::text = ANY (ARRAY[
              'palm_vein'::character varying,
              'nfc_card'::character varying,
              'manual'::character varying,
              'manual_mobile'::character varying,
              'manual_web'::character varying,
              'palm'::character varying,
              'smart_card'::character varying,
              'biometric'::character varying
          ]::text[]));
        `
      })
      steps.push('✅ Updated verification_method constraint')
    } catch (e) {
      steps.push(`⚠️ Verification method constraint: ${(e as Error).message}`)
    }

    // 4. Populate employee_id from users table
    try {
      const { data, error } = await serviceSupabase.rpc('exec_sql', {
        query: `
          UPDATE attendance_records 
          SET employee_id = users.employee_id
          FROM users 
          WHERE attendance_records.user_id = users.id 
          AND attendance_records.employee_id IS NULL;
        `
      })
      steps.push('✅ Populated employee_id from users table')
    } catch (e) {
      steps.push(`⚠️ Employee ID population: ${(e as Error).message}`)
    }

    // 5. Migrate existing location data
    try {
      await serviceSupabase.rpc('exec_sql', {
        query: `
          UPDATE attendance_records 
          SET check_in_location = jsonb_build_object('address', location)
          WHERE location IS NOT NULL 
          AND check_in_location IS NULL;
        `
      })
      steps.push('✅ Migrated location data to JSON format')
    } catch (e) {
      steps.push(`⚠️ Location migration: ${(e as Error).message}`)
    }

    // 6. Create indexes
    try {
      await serviceSupabase.rpc('exec_sql', {
        query: `
          CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_id ON attendance_records(employee_id);
          CREATE INDEX IF NOT EXISTS idx_attendance_records_check_in_location ON attendance_records USING GIN(check_in_location);
          CREATE INDEX IF NOT EXISTS idx_attendance_records_check_out_location ON attendance_records USING GIN(check_out_location);
        `
      })
      steps.push('✅ Created indexes for new columns')
    } catch (e) {
      steps.push(`⚠️ Index creation: ${(e as Error).message}`)
    }

    // 7. Test the updated structure
    const { data: testData, error: testError } = await serviceSupabase
      .from('attendance_records')
      .select('id, employee_id, user_id, check_in_location, verification_method, status')
      .limit(3)

    console.log('✅ Schema update completed!')

    return NextResponse.json({
      success: true,
      message: 'Attendance records table schema updated successfully',
      data: {
        steps,
        sample_records: testData,
        test_error: testError
      }
    }, {
      headers: corsHeaders()
    })

  } catch (error) {
    console.error('❌ Schema update error:', error)
    return NextResponse.json(
      { error: `Failed to update schema: ${error}` },
      { status: 500, headers: corsHeaders() }
    )
  }
}
