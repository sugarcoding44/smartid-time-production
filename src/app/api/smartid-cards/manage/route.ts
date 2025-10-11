import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// CORS handler
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

// GET - List all SmartID cards
export async function GET(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const institutionId = searchParams.get('institution_id')

    if (action === 'enrollments') {
      // Get active card enrollments
      let query = serviceSupabase
        .from('active_card_enrollments')
        .select('*')
        .order('enrollment_date', { ascending: false })

      if (institutionId) {
        // Note: This would need institution filtering in the view
        // For now, return all active enrollments
      }

      const { data, error } = await query

      if (error) throw error

      return NextResponse.json({
        success: true,
        data: data || [],
        count: data?.length || 0
      }, { headers: corsHeaders() })
    }

    if (action === 'attendance') {
      // Get today's SmartID attendance
      const { data, error } = await serviceSupabase
        .from('todays_smartid_attendance')
        .select('*')
        .order('check_in_time', { ascending: false })

      if (error) throw error

      return NextResponse.json({
        success: true,
        data: data || [],
        count: data?.length || 0
      }, { headers: corsHeaders() })
    }

    if (action === 'access_events') {
      // Get recent access events
      const limit = parseInt(searchParams.get('limit') || '50')
      
      const { data, error } = await serviceSupabase
        .from('recent_card_access')
        .select('*')
        .limit(limit)

      if (error) throw error

      return NextResponse.json({
        success: true,
        data: data || [],
        count: data?.length || 0
      }, { headers: corsHeaders() })
    }

    // Default: Get all SmartID cards
    const { data, error } = await serviceSupabase
      .from('smartid_cards')
      .select(`
        *,
        card_enrollments (
          id,
          enrollment_status,
          enrollment_date,
          users (
            full_name,
            employee_id,
            email
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    }, { headers: corsHeaders() })

  } catch (error) {
    console.error('❌ Get cards error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `Failed to get cards: ${error}` 
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// POST - Register a new SmartID card
export async function POST(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { action, ...data } = body

    if (action === 'register_card') {
      // Register a new SmartID card
      const {
        card_uid,
        card_technology,
        card_chip_type,
        card_number,
        card_name,
        manufacturer,
        uid_length,
        atq,
        sak,
        reader_info
      } = data

      const { data: card, error } = await serviceSupabase
        .from('smartid_cards')
        .insert({
          card_uid,
          card_brand: 'SmartID Card',
          card_technology,
          card_chip_type,
          card_number,
          card_name,
          manufacturer: manufacturer || 'NXP',
          uid_length: uid_length || (card_technology === 'nfc' ? 4 : 7),
          atq,
          sak,
          is_active: true,
          reader_info: reader_info || {},
          technical_data: {
            atq,
            sak,
            technology: card_technology
          },
          detection_count: 0
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'SmartID card registered successfully',
        data: card
      }, { headers: corsHeaders() })
    }

    if (action === 'enroll_card') {
      // Enroll a card to a user
      const {
        card_uid,
        user_id,
        institution_id,
        enrolled_by,
        access_level,
        enrollment_reason,
        expiry_date
      } = data

      // First get the card ID
      const { data: cardData, error: cardError } = await serviceSupabase
        .from('smartid_cards')
        .select('id')
        .eq('card_uid', card_uid)
        .eq('is_active', true)
        .single()

      if (cardError || !cardData) {
        throw new Error(`Card with UID ${card_uid} not found or inactive`)
      }

      // Create enrollment
      const { data: enrollment, error: enrollError } = await serviceSupabase
        .from('card_enrollments')
        .insert({
          card_id: cardData.id,
          user_id,
          institution_id,
          enrollment_status: 'active',
          enrollment_date: new Date().toISOString(),
          expiry_date,
          access_level: access_level || 'standard',
          enrollment_reason: enrollment_reason || 'Manual enrollment via web portal',
          enrolled_by,
          usage_count: 0
        })
        .select(`
          *,
          smartid_cards(*),
          users(*),
          card_wallets(*)
        `)
        .single()

      if (enrollError) throw enrollError

      return NextResponse.json({
        success: true,
        message: 'Card enrolled successfully',
        data: enrollment
      }, { headers: corsHeaders() })
    }

    if (action === 'simulate_detection') {
      // Simulate card detection for testing
      const { card_uid } = data

      // Check if card is enrolled
      const { data: userInfo, error: userError } = await serviceSupabase
        .from('active_card_enrollments')
        .select('*')
        .eq('card_uid', card_uid)
        .single()

      if (userError || !userInfo) {
        return NextResponse.json({
          success: false,
          message: 'Card not enrolled in system',
          card_uid
        }, { headers: corsHeaders() })
      }

      // Create access event
      const { data: accessEvent, error: accessError } = await serviceSupabase
        .from('card_access_events')
        .insert({
          card_id: userInfo.card_id,
          enrollment_id: userInfo.enrollment_id,
          user_id: userInfo.user_id,
          institution_id: userInfo.institution_id,
          event_type: 'attendance_in',
          access_result: 'granted',
          reader_type: 'XT-N424-WR',
          reader_location: 'Web Portal Simulation',
          detected_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
          processing_time_ms: 50,
          technical_details: {
            uid: card_uid,
            type: userInfo.card_technology,
            simulation: true
          },
          device_info: {
            reader_type: 'XT-N424-WR',
            connection_type: 'Simulated',
            location: 'Web Portal'
          }
        })
        .select()
        .single()

      if (accessError) throw accessError

      // Process attendance
      const { data: attendanceResult, error: attendanceError } = await serviceSupabase
        .rpc('handle_rfid_attendance', {
          p_user_id: userInfo.user_id,
          p_institution_id: userInfo.institution_id,
          p_card_access_event_id: accessEvent.id,
          p_card_uid: card_uid,
          p_location: { simulation: true, source: 'web_portal' },
          p_device_id: 'WEB-PORTAL-SIM'
        })

      if (attendanceError) throw attendanceError

      return NextResponse.json({
        success: true,
        message: 'Card detection simulated successfully',
        action: attendanceResult.action,
        card_uid,
        user: userInfo,
        attendance: attendanceResult,
        access_event: accessEvent
      }, { headers: corsHeaders() })
    }

    if (action === 'block_card') {
      // Block/unblock a card enrollment
      const { card_uid, block } = data

      // Find the enrollment (check active, blocked, and pending statuses)
      const { data: enrollmentData, error: findError } = await serviceSupabase
        .from('card_enrollments')
        .select('id, card_id, user_id, enrollment_status')
        .eq('card_id', 
          serviceSupabase
            .from('smartid_cards')
            .select('id')
            .eq('card_uid', card_uid)
            .single()
        )
        .in('enrollment_status', ['active', 'blocked', 'pending'])
        .single()

      if (findError || !enrollmentData) {
        throw new Error(`Enrollment for card UID ${card_uid} not found or card is not issued`)
      }

      // Update enrollment status
      const { data: updatedEnrollment, error: updateError } = await serviceSupabase
        .from('card_enrollments')
        .update({
          enrollment_status: block ? 'blocked' : 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentData.id)
        .select(`
          *,
          smartid_cards(*),
          users(*)
        `)
        .single()

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        message: `Card ${block ? 'blocked' : 'unblocked'} successfully`,
        data: updatedEnrollment
      }, { headers: corsHeaders() })
    }

    if (action === 'unissue_card') {
      // Remove card enrollment (unissue card)
      const { card_uid } = data

      // Find the active enrollment
      const { data: enrollmentData, error: findError } = await serviceSupabase
        .from('card_enrollments')
        .select(`
          id,
          card_id,
          user_id,
          smartid_cards(card_uid, card_number),
          users(full_name)
        `)
        .eq('card_id', 
          serviceSupabase
            .from('smartid_cards')
            .select('id')
            .eq('card_uid', card_uid)
            .single()
        )
        .in('enrollment_status', ['active', 'blocked'])
        .single()

      if (findError || !enrollmentData) {
        throw new Error(`Enrollment for card UID ${card_uid} not found`)
      }

      // Update enrollment status to 'cancelled' (instead of deleting)
      const { data: cancelledEnrollment, error: cancelError } = await serviceSupabase
        .from('card_enrollments')
        .update({
          enrollment_status: 'cancelled',
          updated_at: new Date().toISOString(),
          cancellation_reason: 'Card unissued via web portal',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', enrollmentData.id)
        .select()
        .single()

      if (cancelError) throw cancelError

      return NextResponse.json({
        success: true,
        message: `Card unissued successfully from ${enrollmentData.users?.full_name}`,
        data: {
          card_uid,
          user_name: enrollmentData.users?.full_name,
          card_number: enrollmentData.smartid_cards?.card_number
        }
      }, { headers: corsHeaders() })
    }

    throw new Error('Invalid action specified')

  } catch (error) {
    console.error('❌ Card management error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `Operation failed: ${error}` 
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// PUT - Update SmartID card
export async function PUT(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { card_id, action, ...updateData } = body

    if (action === 'deactivate') {
      const { data, error } = await serviceSupabase
        .from('smartid_cards')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString() 
        })
        .eq('id', card_id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'Card deactivated successfully',
        data
      }, { headers: corsHeaders() })
    }

    if (action === 'activate') {
      const { data, error } = await serviceSupabase
        .from('smartid_cards')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString() 
        })
        .eq('id', card_id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'Card activated successfully',
        data
      }, { headers: corsHeaders() })
    }

    // Default update
    const { data, error } = await serviceSupabase
      .from('smartid_cards')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', card_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Card updated successfully',
      data
    }, { headers: corsHeaders() })

  } catch (error) {
    console.error('❌ Update card error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `Update failed: ${error}` 
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// DELETE - Remove SmartID card
export async function DELETE(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const cardId = searchParams.get('card_id')

    if (!cardId) {
      throw new Error('Card ID is required')
    }

    // Instead of deleting, deactivate the card
    const { data, error } = await serviceSupabase
      .from('smartid_cards')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString() 
      })
      .eq('id', cardId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Card deactivated successfully',
      data
    }, { headers: corsHeaders() })

  } catch (error) {
    console.error('❌ Delete card error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `Delete failed: ${error}` 
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}