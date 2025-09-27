import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 COMPLETE-SETUP API CALLED!')
    const body = await request.json()
    console.log('📝 Raw request body:', JSON.stringify(body, null, 2))
    
    const { userId, institutionData } = body

    if (!userId || !institutionData) {
      console.log('❌ Missing required data - userId:', !!userId, 'institutionData:', !!institutionData)
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      )
    }

    console.log('👤 Completing setup for user:', userId)
    console.log('🏢 Institution data:', JSON.stringify(institutionData, null, 2))

    // Create a service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Check if institution already exists or create new one
    let institution
    
      // First try to find existing institution
    const { data: existingInstitution, error: findError } = await serviceSupabase
      .from('institutions')
      .select('*')
      .eq('registration_number', institutionData.registration_number)
      .single()
    
    if (existingInstitution && !findError) {
      // Institution exists, check if user is already associated
      const { data: existingUser, error: userCheckError } = await serviceSupabase
        .from('users')
        .select('id')
        .eq('auth_user_id', userId)
        .single()
      
      if (existingUser && !userCheckError) {
        // User already exists, redirect to dashboard
        console.log('User already set up, redirecting to dashboard')
        return NextResponse.json({
          success: true,
          message: 'Account already set up',
          redirect: '/dashboard'
        })
      }
      
      institution = existingInstitution
      console.log('Using existing institution:', institution.id)
    } else {
      // Create new institution
      const { data: newInstitution, error: institutionError } = await serviceSupabase
        .from('institutions')
        .insert({
          name: institutionData.name,
          registration_number: institutionData.registration_number,
          type: institutionData.type,
          subscription_plan: institutionData.subscription_plan,
          status: 'active',
          contact_person: institutionData.contact_person,
          email: institutionData.email
        })
        .select()
        .single()

      if (institutionError) {
        console.error('Institution creation failed:', institutionError)
        return NextResponse.json(
          { error: 'Failed to create institution: ' + institutionError.message },
          { status: 400 }
        )
      }
      
      institution = newInstitution
      console.log('Institution created:', institution.id)
    }

    console.log('Institution created:', institution.id)

    // 2. Create user profile
    const { error: profileError } = await serviceSupabase
      .from('users')
      .insert({
        auth_user_id: userId,
        institution_id: institution.id,
        full_name: institutionData.contact_person,
        email: institutionData.email,
        primary_role: 'admin',
        primary_system: 'hub_web',
        smartid_hub_role: 'admin',
        employee_id: `ADM${Date.now()}`,
        ic_number: institutionData.admin_ic_number,
        phone: '+60123456789', // Placeholder
        status: 'active'
      })

    if (profileError) {
      console.error('Profile creation failed:', profileError)
      // Clean up institution if profile creation fails
      await serviceSupabase.from('institutions').delete().eq('id', institution.id)
      return NextResponse.json(
        { error: 'Failed to create user profile: ' + profileError.message },
        { status: 400 }
      )
    }

    console.log('User profile created for:', userId)

    // 3. Create default leave types for premium plans
    if (institutionData.subscription_plan === 'premium') {
      const defaultLeaveTypes = [
        { 
          name: 'Annual Leave', 
          code: 'AL',
          default_quota_days: 14.0, 
          description: 'Annual vacation leave',
          color: '#10B981'
        },
        { 
          name: 'Sick Leave', 
          code: 'SL',
          default_quota_days: 10.0, 
          description: 'Medical leave',
          color: '#EF4444',
          requires_medical_certificate: true
        },
        { 
          name: 'Emergency Leave', 
          code: 'EL',
          default_quota_days: 3.0, 
          description: 'Emergency situations',
          color: '#F59E0B',
          min_advance_notice_days: 0
        },
        { 
          name: 'Maternity Leave', 
          code: 'ML',
          default_quota_days: 60.0, 
          description: 'Maternity leave',
          color: '#EC4899',
          max_consecutive_days: 60,
          min_advance_notice_days: 30
        }
      ]

      const { error: leaveTypesError } = await serviceSupabase
        .from('leave_types')
        .insert(
          defaultLeaveTypes.map(type => ({
            ...type,
            institution_id: institution.id
          }))
        )

      if (leaveTypesError) {
        console.error('Failed to create leave types:', leaveTypesError)
        // Don't fail the whole process for this
      } else {
        console.log('Leave types created for institution:', institution.id)
      }
    }

    // 4. Clear the pending data from user metadata
    const { error: metadataError } = await serviceSupabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: institutionData.contact_person
        // pending_institution removed
      }
    })

    if (metadataError) {
      console.error('Failed to clear pending data:', metadataError)
      // Don't fail the whole process for this
    }

    console.log('Setup completed successfully for user:', userId)

    return NextResponse.json({
      success: true,
      message: 'Institution setup completed successfully',
      institution: {
        id: institution.id,
        name: institution.name,
        subscription_plan: institution.subscription_plan
      }
    })

  } catch (error) {
    console.error('Setup completion error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during setup' },
      { status: 500 }
    )
  }
}
