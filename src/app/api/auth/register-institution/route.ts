import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      institutionName,
      institutionCode,
      institutionType,
      // Admin data
      adminName,
      adminEmail,
      adminIcNumber,
      adminPassword,
      subscriptionPlan
    } = body

    // Create a Supabase client with anon key for auth operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Create a service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Create admin user account (but don't confirm email yet)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=signup`,
        data: {
          full_name: adminName,
          // Store registration data in user metadata temporarily
          pending_institution: JSON.stringify({
            name: institutionName,
            registration_number: institutionCode || `INST${Date.now()}`,
            type: institutionType || 'school',
            subscription_plan: subscriptionPlan,
            contact_person: adminName,
            email: adminEmail,
            admin_ic_number: adminIcNumber
          })
        }
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: 'Failed to create admin account: ' + authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 400 }
      )
    }

    // Registration successful - user needs to verify email
    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      email: adminEmail,
      requiresEmailVerification: true
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
