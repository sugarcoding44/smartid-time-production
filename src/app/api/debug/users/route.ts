import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get current session to verify we're authenticated as admin
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Query users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        auth_user_id,
        primary_system,
        status,
        employee_id
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Query auth users (this requires admin privileges)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Error fetching auth users:', authError)
    }

    // Find mismatches
    const mismatches = []
    if (authUsers && authUsers.users) {
      for (const authUser of authUsers.users) {
        const matchingUser = users?.find(u => u.auth_user_id === authUser.id)
        if (!matchingUser) {
          mismatches.push({
            auth_id: authUser.id,
            email: authUser.email,
            created_at: authUser.created_at,
            issue: 'Auth user exists but no matching users table record'
          })
        }
      }
    }

    for (const user of users || []) {
      if (user.auth_user_id) {
        const matchingAuthUser = authUsers?.users?.find(au => au.id === user.auth_user_id)
        if (!matchingAuthUser) {
          mismatches.push({
            user_id: user.id,
            full_name: user.full_name,
            email: user.email,
            auth_user_id: user.auth_user_id,
            issue: 'Users table record exists but no matching auth user'
          })
        }
      } else {
        mismatches.push({
          user_id: user.id,
          full_name: user.full_name,
          email: user.email,
          auth_user_id: user.auth_user_id,
          issue: 'Users table record has null auth_user_id'
        })
      }
    }

    return NextResponse.json({
      users_table_count: users?.length || 0,
      auth_users_count: authUsers?.users?.length || 0,
      users_table: users,
      auth_users: authUsers?.users?.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at
      })) || [],
      mismatches,
      debug_info: {
        current_session_user_id: session.user.id,
        current_session_email: session.user.email
      }
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
