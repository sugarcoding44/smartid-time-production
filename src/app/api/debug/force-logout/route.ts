import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Create service role client
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { email } = body

    // If email provided, sign out that specific user from all sessions
    if (email) {
      const { data: authUsers, error: authError } = await serviceSupabase.auth.admin.listUsers()
      const targetUser = authUsers?.users?.find(u => u.email === email)
      
      if (targetUser) {
        console.log('🚪 Signing out user:', email)
        await serviceSupabase.auth.admin.signOut(targetUser.id, 'global')
      }
    }

    // Create response with cleared cookies
    const response = NextResponse.json({
      success: true,
      message: 'All authentication cleared',
      clearedEmail: email
    })

    // Clear all Supabase-related cookies
    const cookieNames = [
      'supabase-auth-token',
      'supabase.auth.token', 
      'sb-access-token',
      'sb-refresh-token'
    ]

    cookieNames.forEach(name => {
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/',
        domain: 'localhost'
      })
    })

    // Clear session cookies
    response.cookies.set('session', '', {
      expires: new Date(0),
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Force logout error:', error)
    return NextResponse.json(
      { error: 'Failed to clear authentication' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Just clear cookies without user-specific logout
    const response = NextResponse.json({
      success: true,
      message: 'Cookies cleared'
    })

    // Clear all possible authentication cookies
    const cookieNames = [
      'supabase-auth-token',
      'supabase.auth.token', 
      'sb-access-token',
      'sb-refresh-token',
      'session'
    ]

    cookieNames.forEach(name => {
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/'
      })
    })

    return response

  } catch (error) {
    console.error('Cookie clear error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cookies' },
      { status: 500 }
    )
  }
}
