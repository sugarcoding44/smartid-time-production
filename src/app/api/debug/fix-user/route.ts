import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Use service role client for admin access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const body = await request.json()
    const { auth_user_id, new_full_name } = body
    
    if (!auth_user_id || !new_full_name) {
      return NextResponse.json({ 
        error: 'Missing required fields: auth_user_id, new_full_name' 
      }, { status: 400 })
    }
    
    console.log(`🔧 Fixing user name for auth ID: ${auth_user_id}`)
    console.log(`📝 New name: ${new_full_name}`)
    
    // Update the user record
    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: new_full_name,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', auth_user_id)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error updating user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('✅ User updated successfully:', data.full_name)
    
    return NextResponse.json({
      success: true,
      message: 'User name updated successfully',
      updated_user: data
    })

  } catch (error) {
    console.error('Fix user API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}