import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('id')
    
    if (!institutionId) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass auth (same as debug endpoint)
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get institution data
    const { data: institution, error: institutionError } = await serviceSupabase
      .from('institutions')
      .select('*')
      .eq('id', institutionId)
      .single()

    if (institutionError) {
      console.error('Institution fetch error:', institutionError)
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: institution
    })

  } catch (error) {
    console.error('Institution API error:', error)
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

    // Get user's institution
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('institution_id, primary_role, smartid_time_role')
      .eq('id', user.id)
      .single()

    if (userError || !(userData as any)?.institution_id) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to update institution
    const userRole = (userData as any).smartid_time_role || (userData as any).primary_role
    if (!['superadmin', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Extract institution fields
    const {
      name,
      type,
      address,
      city,
      state,
      postal_code,
      phone,
      email,
      website
    } = body

    // Update institution
    const { data: updatedInstitution, error: updateError } = await supabase
      .from('institutions')
      .update({
        name,
        type,
        address,
        city,
        state,
        postal_code,
        phone,
        email,
        website,
        updated_at: new Date().toISOString()
      })
      .eq('id', (userData as any).institution_id)
      .select()
      .single()

    if (updateError) {
      console.error('Institution update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update institution' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedInstitution
    })

  } catch (error) {
    console.error('Institution update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
