import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Testing service role configuration...')
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'NOT SET')
    console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (length: ' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'NOT SET')
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Environment variables not configured',
        details: {
          supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      })
    }

    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Test query: Get count of card_enrollments
    const { data, error, count } = await serviceSupabase
      .from('card_enrollments')
      .select('*', { count: 'exact', head: true })

    console.log('📊 Service role test query result:', { count, error })

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Service role query failed',
        details: error
      })
    }

    // Test specific enrollment query
    const { data: specificEnrollment, error: specificError } = await serviceSupabase
      .from('card_enrollments')
      .select('*')
      .eq('id', '9b1c7585-d6ea-4366-a9bf-1d29200654fd')
      .single()

    console.log('🎯 Specific enrollment query:', { specificEnrollment, specificError })

    return NextResponse.json({
      success: true,
      message: 'Service role is working',
      total_enrollments: count,
      test_enrollment_found: !!specificEnrollment,
      test_enrollment_data: specificEnrollment
    })

  } catch (error) {
    console.error('❌ Service role test error:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}