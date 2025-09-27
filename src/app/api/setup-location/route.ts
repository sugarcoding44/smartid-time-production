import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Setup location API called')
    const body = await request.json()
    console.log('📊 Received data:', {
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      city: body.city,
      state: body.state
    })
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

    // Use server-side Supabase client for authentication
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Authentication required', details: authError?.message },
        { status: 401 }
      )
    }

    console.log('✅ Authenticated user:', user.email)

    // Get user info including institution_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, institution_id')
      .eq('id', user.id)
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
    const { data: existingLocation, error: checkError } = await supabase
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
      location_type: 'campus',
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
      created_by: user.id,
      notes: 'Location set during initial institution setup'
    }

    if (existingLocation) {
      // Update existing location
      const { data: updatedLocation, error: updateError } = await supabase
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
      const { data: newLocation, error: insertError } = await supabase
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
