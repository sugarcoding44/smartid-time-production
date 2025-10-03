import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get all columns from users table
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'nadia@pointgate.net')
      
    if (error) {
      return NextResponse.json({ error: error.message })
    }
    
    // Also try different ways to find the user
    const authUserId = '7a4d71fa-6fad-418c-978f-1142468960ff'
    
    const { data: byAuthId } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      
    const { data: byId } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
    
    return NextResponse.json({
      userByEmail: users,
      userByAuthId: byAuthId,
      userById: byId,
      authUserId: authUserId
    })
    
  } catch (error) {
    return NextResponse.json({ error: String(error) })
  }
}