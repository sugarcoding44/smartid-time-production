import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { user_id, new_email, update_auth = false } = await request.json()
    
    if (!user_id || !new_email) {
      return NextResponse.json(
        { error: 'user_id and new_email are required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass auth
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First, get the current user data
    const { data: currentUser, error: getUserError } = await serviceSupabase
      .from('users')
      .select('id, full_name, email, auth_user_id')
      .eq('id', user_id)
      .single()

    if (getUserError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`📧 Updating email for ${currentUser.full_name}`)
    console.log(`   From: ${currentUser.email}`)
    console.log(`   To: ${new_email}`)

    // Update the user record
    const { data: updatedUser, error: updateError } = await serviceSupabase
      .from('users')
      .update({
        email: new_email,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update user email' },
        { status: 500 }
      )
    }

    // If requested and user has auth account, update auth email too
    if (update_auth && currentUser.auth_user_id) {
      try {
        await serviceSupabase.auth.admin.updateUserById(
          currentUser.auth_user_id,
          { email: new_email }
        )
        console.log(`✅ Also updated auth email for user ${currentUser.auth_user_id}`)
      } catch (authError) {
        console.error('⚠️ Failed to update auth email:', authError)
        return NextResponse.json({
          success: true,
          message: 'User email updated but auth email update failed',
          user: updatedUser,
          auth_warning: 'Auth email not updated - user may need to re-register'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated email for ${updatedUser.full_name}`,
      user: updatedUser,
      changes: {
        old_email: currentUser.email,
        new_email: new_email,
        auth_updated: update_auth && currentUser.auth_user_id
      }
    })

  } catch (error) {
    console.error('Update email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
