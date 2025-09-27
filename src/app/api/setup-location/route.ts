import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Setup location API called')
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
        { error: 'Address and coordinates are required' },
        { status: 400 }
      )
    }

    // Create service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user from session - try Authorization header first, then cookies
    const authHeader = request.headers.get('authorization')
    let session = null
    let sessionError = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Use Authorization header
      const token = authHeader.split(' ')[1]
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data, error } = await supabaseClient.auth.getUser(token)
      if (data.user && !error) {
        session = { user: data.user, access_token: token }
      } else {
        sessionError = error
      }
    } else {
      // Fall back to cookies
      const cookieStore = cookies()
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set() {},
            remove() {}
          }
        }
      )

      const { data: sessionData, error } = await supabaseClient.auth.getSession()
      session = sessionData.session
      sessionError = error
    }
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      console.log('Session data:', session)
      console.log('Available cookies:', cookieStore.getAll().map(c => c.name))
      return NextResponse.json(
        { error: 'Authentication required', details: sessionError?.message },
        { status: 401 }
      )
    }

    // Get user info including institution_id
    const { data: userData, error: userError } = await serviceSupabase
      .from('users')
      .select('id, institution_id')
      .eq('id', session.user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!userData.institution_id) {
      return NextResponse.json(
        { error: 'Institution not found for user' },
        { status: 400 }
      )
    }

    // Check if location already exists for this institution
    const { data: existingLocation, error: checkError } = await serviceSupabase
      .from('institution_locations')
      .select('id')
      .eq('institution_id', userData.institution_id)
      .eq('is_primary', true)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing location:', checkError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    const locationData = {
      institution_id: userData.institution_id,
      name: 'Main Campus',
      location_type: 'main_campus',
      address,
      city,
      state,
      postal_code: postalCode,
      country: country || 'Malaysia',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      attendance_radius: attendanceRadius || 300,
      is_attendance_enabled: true,
      is_primary: true,
      is_active: true,
      location_status: 'verified',
      created_by: session.user.id,
      notes: 'Location set during initial institution setup',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (existingLocation) {
      // Update existing location
      const { data: updatedLocation, error: updateError } = await serviceSupabase
        .from('institution_locations')
        .update(locationData)
        .eq('id', existingLocation.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating location:', updateError)
        return NextResponse.json(
          { error: 'Failed to update location' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Institution location updated successfully',
        location: updatedLocation
      })
    } else {
      // Create new location
      const { data: newLocation, error: insertError } = await serviceSupabase
        .from('institution_locations')
        .insert([locationData])
        .select()
        .single()

      if (insertError) {
        console.error('Error creating location:', insertError)
        return NextResponse.json(
          { error: 'Failed to create location' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Institution location saved successfully',
        location: newLocation
      })
    }

  } catch (error) {
    console.error('Location setup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
