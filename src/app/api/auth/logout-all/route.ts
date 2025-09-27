import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('🔄 Starting global logout process...')
    
    // Create service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all users (this will help us logout everyone)
    const { data: users, error: usersError } = await serviceSupabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return NextResponse.json({ error: usersError.message }, { status: 400 })
    }

    console.log(`📋 Found ${users?.users?.length || 0} users`)

    // Logout each user by invalidating their sessions
    let loggedOutCount = 0
    if (users?.users) {
      for (const user of users.users) {
        try {
          console.log(`🚪 Logging out user: ${user.email}`)
          
          // Sign out user globally (invalidates all sessions)
          const { error } = await serviceSupabase.auth.admin.signOut(user.id, 'global')
          
          if (!error) {
            loggedOutCount++
          } else {
            console.error(`❌ Error logging out ${user.email}:`, error)
          }
        } catch (error) {
          console.error(`❌ Exception logging out ${user.email}:`, error)
        }
      }
    }

    console.log(`✅ Successfully logged out ${loggedOutCount} users`)

    // Create response that clears cookies
    const response = NextResponse.json({ 
      success: true, 
      message: `Logged out all sessions successfully`,
      loggedOutCount,
      totalUsers: users?.users?.length || 0
    })
    
    // Clear all possible Supabase auth cookies
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'sb-provider-token',
      'supabase-auth-token',
      'supabase.auth.token'
    ]
    
    cookiesToClear.forEach(cookie => {
      response.cookies.delete(cookie)
      response.cookies.set(cookie, '', { 
        expires: new Date(0),
        path: '/',
        domain: 'localhost'
      })
    })
    
    return response
  } catch (error) {
    console.error('❌ Global logout error:', error)
    return NextResponse.json({ 
      error: 'Global logout failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  // Allow GET method too for easy browser access
  return POST()
}
