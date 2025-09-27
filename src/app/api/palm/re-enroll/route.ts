import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { userId, newPalmId, hand_type = 'right', quality_score = 95 } = await request.json()

    if (!userId || !newPalmId) {
      return NextResponse.json(
        { error: 'User ID and new Palm ID are required' },
        { status: 400 }
      )
    }

    console.log('Starting palm re-enrollment for user:', userId, 'new palm ID:', newPalmId)

    // First, get the current user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, employee_id, institution_id, palm_enrollment_status, palm_enrolled_hands')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('User not found:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Mark existing palm templates as replaced/inactive
    const { error: deactivateError } = await supabase
      .from('palm_templates')
      .update({ 
        status: 'replaced',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'active')

    if (deactivateError) {
      console.error('Error deactivating old templates:', deactivateError)
    }

    // Create new palm template record
    const { data: newTemplate, error: templateError } = await supabase
      .from('palm_templates')
      .insert({
        user_id: userId,
        hand_type,
        template_data: Buffer.from(newPalmId), // Simulated binary data
        template_hash: `hash_${newPalmId}_${Date.now()}`,
        quality_score,
        device_id: 'simulator_device',
        enrolled_by: userId, // In real implementation, this would be the admin user
        status: 'active',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      })
      .select()
      .single()

    if (templateError) {
      console.error('Error creating palm template:', templateError)
      return NextResponse.json(
        { error: 'Failed to create palm template' },
        { status: 500 }
      )
    }

    // Create enrollment session record
    const { error: sessionError } = await supabase
      .from('palm_enrollment_sessions')
      .insert({
        user_id: userId,
        template_id: newTemplate.id,
        session_token: `reEnroll_${Date.now()}_${userId}`,
        hand_type,
        enrollment_type: 're-enrollment',
        status: 'completed',
        required_captures: 3,
        completed_captures: 3,
        final_quality_score: quality_score,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })

    if (sessionError) {
      console.error('Error creating enrollment session:', sessionError)
    }

    // Update user palm status and data
    const { error: updateError } = await supabase
      .from('users')
      .update({
        palm_enrollment_status: 'enrolled',
        palm_enrolled_hands: [hand_type],
        palm_last_enrollment: new Date().toISOString(),
        palm_enrollment_expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        palm_verification_failures: 0,
        palm_locked_until: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user palm status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user palm status' },
        { status: 500 }
      )
    }

    console.log('Palm re-enrollment completed successfully for user:', userId)

    return NextResponse.json({
      success: true,
      message: 'Palm biometric re-enrolled successfully',
      data: {
        template_id: newTemplate.id,
        hand_type,
        quality_score,
        enrollment_date: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error in palm re-enrollment API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
