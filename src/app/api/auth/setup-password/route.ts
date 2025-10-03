import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Setup token is required' },
        { status: 400 }
      )
    }

    // Create service role client
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify token and get user info
    const { data: tokenData, error: tokenError } = await serviceSupabase
      .from('user_setup_tokens')
      .select('id, user_id, expires_at, used_at')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired setup token' },
        { status: 400 }
      )
    }
    
    // Get user data
    const { data: userData, error: userError } = await serviceSupabase
      .from('users')
      .select('id, full_name, employee_id, email, primary_role')
      .eq('id', tokenData.user_id)
      .single()
      
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (new Date() > new Date(tokenData.expires_at)) {
      return NextResponse.json(
        { error: 'Setup token has expired' },
        { status: 400 }
      )
    }

    // Check if token is already used
    if (tokenData.used_at) {
      return NextResponse.json(
        { error: 'Setup token has already been used' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: userData,
      tokenId: tokenData.id
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during token verification' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password, confirmPassword } = body

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Token, password, and confirm password are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Create service role client
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify token
    const { data: tokenData, error: tokenError } = await serviceSupabase
      .from('user_setup_tokens')
      .select('id, user_id, expires_at, used_at')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid setup token' },
        { status: 400 }
      )
    }
    
    // Get user data
    const { data: userData, error: userError } = await serviceSupabase
      .from('users')
      .select('id, full_name, email')
      .eq('id', tokenData.user_id)
      .single()
      
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (new Date() > new Date(tokenData.expires_at)) {
      return NextResponse.json(
        { error: 'Setup token has expired' },
        { status: 400 }
      )
    }

    // Check if token is already used
    if (tokenData.used_at) {
      return NextResponse.json(
        { error: 'Setup token has already been used' },
        { status: 400 }
      )
    }

    // Create the user in Supabase Auth
    const { data: authUser, error: authError } = await serviceSupabase.auth.admin.createUser({
      email: userData.email,
      password: password,
      email_confirm: true, // Auto-confirm email since it was verified during registration
      user_metadata: {
        full_name: userData.full_name || '',
        setup_completed: true,
      }
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        { error: 'Failed to create user account: ' + authError.message },
        { status: 400 }
      )
    }

    // Update the users table with auth_id
    const { error: updateError } = await serviceSupabase
      .from('users')
      .update({ 
        auth_id: authUser.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenData.user_id)

    if (updateError) {
      console.error('User update error:', updateError)
      // Note: We don't return an error here as the auth user was created successfully
      // The auth_id can be linked later if needed
    }

    // Mark token as used
    const { error: tokenUpdateError } = await serviceSupabase
      .from('user_setup_tokens')
      .update({
        used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenData.id)

    if (tokenUpdateError) {
      console.error('Token update error:', tokenUpdateError)
      // This is not critical, but log it
    }

    return NextResponse.json({
      success: true,
      message: 'Password set successfully! You can now log in to the SmartID Hub Mobile App.',
      user: {
        id: authUser.user.id,
        email: authUser.user.email
      }
    })

  } catch (error) {
    console.error('Password setup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during password setup' },
      { status: 500 }
    )
  }
}
