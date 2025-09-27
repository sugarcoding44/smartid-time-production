import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Setup location API called')
    const body = await request.json()
    console.log('📊 Received data:', {
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country,
      attendanceRadius: body.attendanceRadius
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
    
    console.log('🔐 Auth check result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message,
      userMetadata: user?.user_metadata
    })
    
    if (authError || !user) {
      console.error('❌ Authentication error:', authError)
      console.error('This likely means user completed registration but is not signed in')
      return NextResponse.json(
        { 
          error: 'Authentication required', 
          details: authError?.message,
          needsSignIn: true,
          message: 'Please sign in to save your institution location'
        },
        { status: 401 }
      )
    }

    console.log('✅ Authenticated user:', user.email)
    
    // Create service role client for admin operations (same as complete-setup)
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user info including institution_id  
    console.log('👥 Looking up user in database with ID:', user.id)
    const { data: userData, error: userError } = await serviceSupabase
      .from('users')
      .select('id, institution_id, full_name, email')
      .eq('auth_user_id', user.id)
      .single()

    console.log('👥 User lookup result:', {
      userData,
      userError: userError?.message
    })

    if (userError || !userData) {
      console.error('❌ User not found in database:', userError)
      return NextResponse.json(
        { error: 'User not found in database', details: userError?.message },
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
    console.log('🔍 Checking for existing location for institution:', userData.institution_id)
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
      created_by: userData.id,
      notes: 'Location set during initial institution setup'
    }

    if (existingLocation) {
      // Update existing location using service client
      console.log('🔄 Updating existing location:', existingLocation.id)
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
      // Create new location using service client
      console.log('✨ Creating new location for institution:', userData.institution_id)
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
