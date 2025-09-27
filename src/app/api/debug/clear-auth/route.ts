import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Create service role client to check database
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current user from auth (if any)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const body = await request.json()
    const { email } = body

    // Check if user exists in auth
    if (email) {
      const { data: authUsers, error: authError } = await serviceSupabase.auth.admin.listUsers()
      console.log('Auth users:', authUsers?.users?.map(u => ({ id: u.id, email: u.email })))
      
      const targetAuthUser = authUsers?.users?.find(u => u.email === email)
      console.log('Target auth user:', targetAuthUser?.id, targetAuthUser?.email)

      if (targetAuthUser) {
        // Check if they exist in database
        const { data: dbUser, error: dbError } = await serviceSupabase
          .from('users')
          .select('*')
          .eq('id', targetAuthUser.id)
          .single()

        console.log('DB user:', dbUser)
        console.log('DB error:', dbError)

        return NextResponse.json({
          success: true,
          authUser: {
            id: targetAuthUser.id,
            email: targetAuthUser.email,
            user_metadata: targetAuthUser.user_metadata,
            created_at: targetAuthUser.created_at
          },
          dbUser,
          dbError
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'No user found with that email',
      email
    })

  } catch (error) {
    console.error('Clear auth error:', error)
    return NextResponse.json(
      { error: 'Failed to check auth state' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Create service role client to check database
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // List all auth users
    const { data: authUsers, error: authError } = await serviceSupabase.auth.admin.listUsers()
    
    // List all db users
    const { data: dbUsers, error: dbError } = await serviceSupabase
      .from('users')
      .select('id, email, full_name, institution_id')

    return NextResponse.json({
      success: true,
      authUsers: authUsers?.users?.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        has_pending_institution: !!u.user_metadata?.pending_institution
      })),
      dbUsers,
      authError,
      dbError
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Failed to get debug info' },
      { status: 500 }
    )
  }
}
