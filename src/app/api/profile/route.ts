import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile with institution data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        phone,
        primary_role,
        smartid_hub_role,
        employee_id,
        avatar_url,
        created_at,
        updated_at,
        last_login_at,
        two_factor_enabled,
        notifications_enabled,
        email_notifications,
        institution_id,
        institutions (
          id,
          name,
          type,
          address,
          city,
          state,
          postal_code,
          phone,
          email,
          website,
          logo_url,
          subscription_plan
        )
      `)
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile
    })

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Extract profile fields
    const {
      full_name,
      phone,
      two_factor_enabled,
      notifications_enabled,
      email_notifications
    } = body

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        full_name,
        phone,
        two_factor_enabled,
        notifications_enabled,
        email_notifications,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile
    })

  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
