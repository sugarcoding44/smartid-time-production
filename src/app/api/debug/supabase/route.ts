import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    console.log('🔍 Debug: Testing Supabase connection...')
    
    const supabase = await createClient()
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    }

    // Test 1: Basic connection
    try {
      console.log('📡 Testing basic connection...')
      const { data: healthCheck, error: healthError } = await supabase
        .from('institutions')
        .select('count')
        .limit(1)
      
      results.tests.push({
        name: 'Basic Connection',
        success: !healthError,
        data: healthCheck,
        error: healthError?.message
      })
    } catch (error) {
      results.tests.push({
        name: 'Basic Connection',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: Users table
    try {
      console.log('👥 Testing users table...')
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, email, primary_role')
        .limit(5)
      
      results.tests.push({
        name: 'Users Table',
        success: !usersError,
        data: usersData?.map(u => ({ id: u.id, name: u.full_name, email: u.email })),
        count: usersData?.length || 0,
        error: usersError?.message
      })
    } catch (error) {
      results.tests.push({
        name: 'Users Table',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 3: Institutions table
    try {
      console.log('🏢 Testing institutions table...')
      const { data: instData, error: instError } = await supabase
        .from('institutions')
        .select('id, name, subscription_plan')
        .limit(5)
      
      results.tests.push({
        name: 'Institutions Table',
        success: !instError,
        data: instData?.map(i => ({ id: i.id, name: i.name, plan: i.subscription_plan })),
        count: instData?.length || 0,
        error: instError?.message
      })
    } catch (error) {
      results.tests.push({
        name: 'Institutions Table',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 4: Specific user if provided
    if (userId) {
      try {
        console.log(`🔍 Testing specific user: ${userId}`)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
        
        results.tests.push({
          name: `Specific User (${userId})`,
          success: !userError,
          data: userData ? { 
            id: userData.id, 
            name: userData.full_name, 
            email: userData.email,
            role: userData.primary_role,
            institution_id: userData.institution_id
          } : null,
          error: userError?.message
        })
      } catch (error) {
        results.tests.push({
          name: `Specific User (${userId})`,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Test 5: Auth session
    try {
      console.log('🔐 Testing auth session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      results.tests.push({
        name: 'Auth Session',
        success: !sessionError,
        data: session ? {
          userId: session.user?.id,
          email: session.user?.email,
          hasSession: !!session
        } : null,
        error: sessionError?.message
      })
    } catch (error) {
      results.tests.push({
        name: 'Auth Session',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 6: Service Role Client (bypass auth)
    try {
      console.log('🔑 Testing with service role...')
      const serviceSupabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      const { data: serviceData, error: serviceError } = await serviceSupabase
        .from('users')
        .select('id, full_name, email, institution_id, primary_role')
        .limit(3)
      
      results.tests.push({
        name: 'Service Role Client',
        success: !serviceError,
        data: serviceData?.map(u => ({ 
          id: u.id, 
          name: u.full_name, 
          email: u.email,
          institution_id: u.institution_id,
          primary_role: u.primary_role
        })),
        count: serviceData?.length || 0,
        error: serviceError?.message
      })
    } catch (error) {
      results.tests.push({
        name: 'Service Role Client',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    console.log('✅ Debug tests completed')
    
    return NextResponse.json(results, { 
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0'
      }
    })

  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
