import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Test basic API
    const basicTest = {
      success: true,
      message: 'API is working',
      timestamp: new Date().toISOString(),
      url: request.url
    }
    
    // Test Supabase connection
    let supabaseTest = null
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('users').select('count').limit(1)
      supabaseTest = { 
        connected: !error, 
        error: error?.message || null,
        hasData: !!data 
      }
    } catch (supabaseError) {
      supabaseTest = { 
        connected: false, 
        error: supabaseError instanceof Error ? supabaseError.message : 'Unknown Supabase error' 
      }
    }
    
    return NextResponse.json({
      ...basicTest,
      supabase: supabaseTest,
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
