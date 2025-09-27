import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, auth_user_id } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass auth
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (auth_user_id) {
      // Manual linking with specific auth_user_id
      const { data: updatedUser, error: updateError } = await serviceSupabase
        .from('users')
        .update({
          auth_user_id: auth_user_id,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .eq('status', 'active')
        .select()
        .single()

      if (updateError) {
        console.error('Manual link error:', updateError)
        return NextResponse.json(
          { error: 'Failed to link user manually' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Successfully linked ${email} to auth account ${auth_user_id}`,
        user: updatedUser
      })
    } else {
      // Auto-linking by finding auth user with same email
      console.log(`🔗 Auto-linking user with email: ${email}`)
      
      // First, find the auth user
      const { data: authUsers, error: authError } = await serviceSupabase.auth.admin.listUsers()
      
      if (authError) {
        console.error('Error fetching auth users:', authError)
        return NextResponse.json(
          { error: 'Failed to fetch auth users' },
          { status: 500 }
        )
      }

      const authUser = authUsers.users.find(u => u.email === email)
      
      if (!authUser) {
        return NextResponse.json(
          { error: `No auth account found for email: ${email}` },
          { status: 404 }
        )
      }

      // Update the user record with the auth_user_id
      const { data: updatedUser, error: updateError } = await serviceSupabase
        .from('users')
        .update({
          auth_user_id: authUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .eq('status', 'active')
        .select()
        .single()

      if (updateError) {
        console.error('Auto-link error:', updateError)
        return NextResponse.json(
          { error: 'Failed to auto-link user' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Successfully auto-linked ${email} to auth account ${authUser.id}`,
        user: updatedUser,
        auth_user: {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at
        }
      })
    }

  } catch (error) {
    console.error('Link auth API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Use service role client to bypass auth
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all users and their auth link status
    const { data: users, error: usersError } = await serviceSupabase
      .from('users')
      .select('id, full_name, email, auth_user_id, primary_role, status')
      .eq('status', 'active')
      .order('full_name')

    if (usersError) {
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get auth users for comparison
    const { data: authData, error: authError } = await serviceSupabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return NextResponse.json(
        { error: 'Failed to fetch auth users' },
        { status: 500 }
      )
    }

    const authUsers = authData.users

    // Create summary
    const linkStatus = users.map(user => ({
      ...user,
      auth_linked: !!user.auth_user_id,
      auth_available: authUsers.some(au => au.email === user.email),
      can_auto_link: !user.auth_user_id && authUsers.some(au => au.email === user.email)
    }))

    const summary = {
      total_users: users.length,
      linked_users: users.filter(u => u.auth_user_id).length,
      unlinked_users: users.filter(u => !u.auth_user_id).length,
      can_auto_link: users.filter(u => !u.auth_user_id && authUsers.some(au => au.email === u.email)).length
    }

    return NextResponse.json({
      success: true,
      summary,
      users: linkStatus,
      auth_users: authUsers.map(au => ({
        id: au.id,
        email: au.email,
        created_at: au.created_at,
        email_confirmed: !!au.email_confirmed_at
      }))
    })

  } catch (error) {
    console.error('Get link status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
