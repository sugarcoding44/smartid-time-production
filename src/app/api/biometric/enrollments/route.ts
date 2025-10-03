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
      .from('biometric_enrollments')
      .select(`
        id,
        user_id,
        enrollment_type,
        enrollment_data,
        status,
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

    const { data: enrollments, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      // Check if table doesn't exist
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          data: [],
          message: 'Biometric enrollments table not found'
        })
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch enrollments: ' + error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: enrollments || []
    })

  } catch (error) {
    console.error('Biometric enrollments fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch biometric enrollments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, enrollment_type, enrollment_data } = body

    if (!user_id || !enrollment_type) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, enrollment_type' },
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

    // Check if enrollment already exists
    const { data: existing } = await serviceSupabase
      .from('biometric_enrollments')
      .select('id')
      .eq('user_id', user_id)
      .eq('enrollment_type', enrollment_type)
      .single()

    if (existing) {
      // Update existing enrollment
      const { data: updated, error: updateError } = await serviceSupabase
        .from('biometric_enrollments')
        .update({
          enrollment_data,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update enrollment: ' + updateError.message },
          { status: 400 }
        )
      }

      // If palm enrollment, update user's palm_id
      if (enrollment_type === 'palm' && enrollment_data?.palm_id) {
        await serviceSupabase
          .from('users')
          .update({ 
            palm_id: enrollment_data.palm_id,
            palm_enrolled_at: new Date().toISOString()
          })
          .eq('id', user_id)
      }

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Enrollment updated successfully'
      })
    } else {
      // Create new enrollment
      const { data: created, error: createError } = await serviceSupabase
        .from('biometric_enrollments')
        .insert({
          user_id,
          institution_id: targetUser.institution_id,
          enrollment_type,
          enrollment_data,
          status: 'active'
        })
        .select()
        .single()

      if (createError) {
        // Handle table not existing
        if (createError.message.includes('relation') && createError.message.includes('does not exist')) {
          // Just update the user table if biometric_enrollments doesn't exist
          if (enrollment_type === 'palm' && enrollment_data?.palm_id) {
            const { error: userUpdateError } = await serviceSupabase
              .from('users')
              .update({ 
                palm_id: enrollment_data.palm_id,
                palm_enrolled_at: new Date().toISOString()
              })
              .eq('id', user_id)

            if (userUpdateError) {
              return NextResponse.json(
                { error: 'Failed to update user palm data: ' + userUpdateError.message },
                { status: 400 }
              )
            }

            return NextResponse.json({
              success: true,
              data: { 
                user_id, 
                enrollment_type, 
                palm_id: enrollment_data.palm_id 
              },
              message: 'Palm enrollment saved to user record'
            })
          }
        }
        
        return NextResponse.json(
          { error: 'Failed to create enrollment: ' + createError.message },
          { status: 400 }
        )
      }

      // If palm enrollment, update user's palm_id
      if (enrollment_type === 'palm' && enrollment_data?.palm_id) {
        await serviceSupabase
          .from('users')
          .update({ 
            palm_id: enrollment_data.palm_id,
            palm_enrolled_at: new Date().toISOString()
          })
          .eq('id', user_id)
      }

      return NextResponse.json({
        success: true,
        data: created,
        message: 'Enrollment created successfully'
      })
    }

  } catch (error) {
    console.error('Biometric enrollment error:', error)
    return NextResponse.json(
      { error: 'Failed to process enrollment' },
      { status: 500 }
    )
  }
}