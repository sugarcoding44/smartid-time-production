import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { palm_id, palm_status, palm_enrolled_at, palm_quality } = body

    if (!palm_id) {
      return NextResponse.json(
        { error: 'Palm ID is required' },
        { status: 400 }
      )
    }

    // Create a service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the id from params
    const { id } = await params
    
    // Update user with palm data
    const { data: user, error } = await serviceSupabase
      .from('users')
      .update({
        palm_id,
        palm_status: palm_status || 'active',
        palm_enrolled_at: palm_enrolled_at || new Date().toISOString(),
        palm_quality: palm_quality || null,
        palm_scan_count: 0,
        last_palm_scan: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating palm data:', error)
      return NextResponse.json(
        { error: 'Failed to update palm data: ' + error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Palm biometric enrolled successfully',
      data: user
    })

  } catch (error) {
    console.error('Palm enrollment error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during palm enrollment' },
      { status: 500 }
    )
  }
}
