import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      address,
      city,
      state,
      postalCode,
      country,
      latitude,
      longitude,
      attendanceRadius
    } = body

    // Validate required fields
    if (!address || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Address, latitude, and longitude are required' },
        { status: 400 }
      )
    }

    // Create supabase client with server-side cookies
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Authentication required', needsAuth: true },
        { status: 401 }
      )
    }

    console.log('🔄 Updating location for user:', user.id)

    // Get user's institution_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('institution_id')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData?.institution_id) {
      console.error('❌ User or institution not found:', userError)
      return NextResponse.json(
        { error: 'Institution not found for user' },
        { status: 404 }
      )
    }

    // Use service client to update institution location
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await serviceSupabase
      .from('institution_locations')
      .update({
        address,
        city,
        state,
        postal_code: postalCode,
        country,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        attendance_radius: parseInt(attendanceRadius) || 300,
        updated_at: new Date().toISOString()
      })
      .eq('institution_id', (userData as any).institution_id)
      .eq('is_primary', true)
      .select()

    if (error) {
      console.error('❌ Database error updating location:', error)
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 500 }
      )
    }

    console.log('✅ Location updated successfully for user:', user.id)

    return NextResponse.json({
      message: 'Location updated successfully',
      profile: data?.[0] || null
    })

  } catch (error) {
    console.error('Location update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}