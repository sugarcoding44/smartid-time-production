import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const institutionId = searchParams.get('institutionId')

    // Get the authenticated user
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create a service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // If no institutionId provided, get from current user
    let queryInstitutionId = institutionId
    if (!queryInstitutionId) {
      const { data: currentUser } = await serviceSupabase
        .from('users')
        .select('institution_id')
        .eq('auth_user_id', user.id)
        .single()
      
      queryInstitutionId = currentUser?.institution_id
    }

    if (!queryInstitutionId) {
      return NextResponse.json(
        { error: 'Institution ID not found' },
        { status: 400 }
      )
    }

    // Build query
    let query = serviceSupabase
      .from('smart_cards')
      .select(`
        id,
        user_id,
        card_number,
        status,
        issued_at,
        expires_at,
        created_at,
        updated_at,
        users!inner(
          full_name,
          employee_id,
          primary_role
        )
      `)
      .eq('institution_id', queryInstitutionId)

    // Add user filter if provided
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: cards, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      // Check if table doesn't exist
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        // Try to get smart card info from users table
        const { data: users } = await serviceSupabase
          .from('users')
          .select('id, full_name, employee_id, primary_role, smart_card_id')
          .eq('institution_id', queryInstitutionId)
          .not('smart_card_id', 'is', null)

        return NextResponse.json({
          success: true,
          data: users?.map(user => ({
            id: user.smart_card_id,
            user_id: user.id,
            card_number: user.smart_card_id,
            status: 'active',
            users: {
              full_name: user.full_name,
              employee_id: user.employee_id,
              primary_role: user.primary_role
            }
          })) || [],
          message: 'Smart cards table not found, using user data'
        })
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch smart cards: ' + error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: cards || []
    })

  } catch (error) {
    console.error('Smart cards fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch smart cards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, card_number, rfid_uid } = body

    if (!user_id || !card_number) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, card_number' },
        { status: 400 }
      )
    }

    // Get the authenticated user
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create a service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the user's institution ID
    const { data: targetUser } = await serviceSupabase
      .from('users')
      .select('institution_id, full_name')
      .eq('id', user_id)
      .single()

    if (!targetUser?.institution_id) {
      return NextResponse.json(
        { error: 'User not found or not associated with an institution' },
        { status: 400 }
      )
    }

    // Try to insert into smart_cards table
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 2) // 2 year expiry

    const { data: created, error: createError } = await serviceSupabase
      .from('smart_cards')
      .insert({
        user_id,
        institution_id: targetUser.institution_id,
        card_number,
        nfc_id: rfid_uid || card_number, // Use RFID UID if provided, otherwise use card_number
        smartid_hq_card_id: rfid_uid || card_number, // For compatibility
        status: 'active',
        issued_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (createError) {
      // Handle table not existing
      if (createError.message.includes('relation') && createError.message.includes('does not exist')) {
        // Just update the user table if smart_cards doesn't exist
        const { error: userUpdateError } = await serviceSupabase
          .from('users')
          .update({ 
            smart_card_id: rfid_uid || card_number // Store RFID UID if available
          })
          .eq('id', user_id)

        if (userUpdateError) {
          return NextResponse.json(
            { error: 'Failed to update user card data: ' + userUpdateError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          data: { 
            user_id, 
            card_number,
            nfc_id: rfid_uid || card_number,
            status: 'active'
          },
          message: 'Smart card saved to user record'
        })
      }

      // Check if duplicate card number
      if (createError.message.includes('duplicate')) {
        return NextResponse.json(
          { error: 'Card number already exists' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to issue smart card: ' + createError.message },
        { status: 400 }
      )
    }

    // Update user's smart_card_id with RFID UID
    await serviceSupabase
      .from('users')
      .update({ smart_card_id: rfid_uid || card_number })
      .eq('id', user_id)

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Smart card issued successfully'
    })

  } catch (error) {
    console.error('Smart card issuance error:', error)
    return NextResponse.json(
      { error: 'Failed to issue smart card' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { card_id, status } = body

    if (!card_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: card_id, status' },
        { status: 400 }
      )
    }

    // Get the authenticated user
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create a service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update card status
    const { data: updated, error: updateError } = await serviceSupabase
      .from('smart_cards')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', card_id)
      .select()
      .single()

    if (updateError) {
      // If table doesn't exist, we can't update status
      if (updateError.message.includes('relation') && updateError.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          message: 'Smart cards table not found, status update skipped'
        })
      }
      
      return NextResponse.json(
        { error: 'Failed to update card status: ' + updateError.message },
        { status: 400 }
      )
    }

    // If card is being deactivated, clear from user record
    if (status === 'inactive' || status === 'lost' || status === 'stolen') {
      await serviceSupabase
        .from('users')
        .update({ smart_card_id: null })
        .eq('smart_card_id', updated.card_number)
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Card status updated to ${status}`
    })

  } catch (error) {
    console.error('Smart card update error:', error)
    return NextResponse.json(
      { error: 'Failed to update smart card' },
      { status: 500 }
    )
  }
}