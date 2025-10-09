import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get current authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    // Get user information with work group details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        user_work_group_assignments!inner(
          assigned_at,
          work_groups!inner(
            id,
            name,
            description,
            default_start_time,
            default_end_time,
            late_threshold_minutes,
            early_threshold_minutes,
            working_days,
            created_at
          )
        )
      `)
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      
      // If user not found with work group, try without work group assignment
      const { data: userWithoutWorkGroup, error: userWithoutWorkGroupError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userWithoutWorkGroupError) {
        return NextResponse.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404 })
      }

      // Return user data without work group
      return NextResponse.json({
        success: true,
        data: {
          ...userWithoutWorkGroup,
          work_group: null
        }
      })
    }

    // Process and flatten work group data
    const { user_work_group_assignments, ...userWithoutAssignments } = user
    const processedUser = {
      ...userWithoutAssignments,
      work_group: (user_work_group_assignments as any)?.[0]?.work_groups || null,
      work_group_assigned_at: (user_work_group_assignments as any)?.[0]?.assigned_at || null
    }

    // Return processed user data
    return NextResponse.json({
      success: true,
      data: processedUser
    })

  } catch (error) {
    console.error('Error in user details API:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}