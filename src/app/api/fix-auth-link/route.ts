import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// This endpoint will link the current auth user to a user record
export async function GET(request: NextRequest) {
  try {
    // Create service client using the environment variable that should exist
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // The auth user we know from the debug output
    const authUserId = '7a4d71fa-6fad-418c-978f-1142468960ff'
    const authEmail = 'nadia@pointgate.net'
    
    // First, try to find existing user with matching email
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', authEmail)
      .single()
    
    if (existingUser && !findError) {
      // Update the existing user to link with auth
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          auth_user_id: authUserId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()
      
      if (updateError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to update user: ' + updateError.message
        }, { status: 400 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Successfully linked existing user to auth',
        user: updatedUser
      })
    }
    
    // No existing user found, create new one
    // Find an institution first
    const { data: institutions, error: instError } = await supabase
      .from('institutions')
      .select('id, name')
      .limit(1)
    
    if (instError || !institutions || institutions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No institutions found. Please create an institution first.'
      }, { status: 400 })
    }
    
    const institutionId = institutions[0].id
    
    // Create new user linked to auth
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authUserId,
        full_name: 'Nadia Admin',
        email: authEmail,
        employee_id: 'AD0001',
        primary_role: 'admin',
        primary_system: 'hub_web',
        smartid_hub_role: 'admin',
        ic_number: '000000-00-0000',
        institution_id: institutionId,
        status: 'active'
      })
      .select()
      .single()
    
    if (createError) {
      // Check if it's a unique constraint error
      if (createError.message.includes('duplicate')) {
        // Try to find and update the user without email match
        const { data: userById } = await supabase
          .from('users')
          .select('*')
          .or(`id.eq.${authUserId},auth_user_id.eq.${authUserId}`)
          .single()
        
        if (userById) {
          const { data: updated } = await supabase
            .from('users')
            .update({ 
              auth_user_id: authUserId,
              email: authEmail,
              institution_id: institutionId
            })
            .eq('id', userById.id)
            .select()
            .single()
          
          return NextResponse.json({
            success: true,
            message: 'Found and updated existing user by ID',
            user: updated
          })
        }
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to create user: ' + createError.message
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully created new user linked to auth',
      user: newUser,
      institution: institutions[0].name
    })
    
  } catch (error) {
    console.error('Fix auth link error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected error occurred'
    }, { status: 500 })
  }
}