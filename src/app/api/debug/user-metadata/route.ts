import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Create a service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user with admin privileges
    const { data: userData, error: userError } = await serviceSupabase.auth.admin.getUserById(userId)

    if (userError || !userData.user) {
      return NextResponse.json({ 
        error: 'Failed to get user: ' + userError?.message,
        userId 
      }, { status: 400 })
    }

    // Also check if user exists in users table
    const { data: dbUser, error: dbUserError } = await serviceSupabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    return NextResponse.json({
      success: true,
      userId,
      authUser: {
        id: userData.user.id,
        email: userData.user.email,
        email_confirmed_at: userData.user.email_confirmed_at,
        created_at: userData.user.created_at,
        user_metadata: userData.user.user_metadata,
        app_metadata: userData.user.app_metadata
      },
      dbUser: dbUser || null,
      dbUserError: dbUserError?.message || null
    })

  } catch (error) {
    console.error('Debug user metadata error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred: ' + String(error) },
      { status: 500 }
    )
  }
}
