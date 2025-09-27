import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates, generateSetupToken } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      full_name, 
      primary_role, 
      ic_number, 
      email, 
      phone, 
      institution_id 
    } = body

    if (!full_name || !primary_role || !ic_number || !institution_id) {
      return NextResponse.json(
        { error: 'Missing required fields: full_name, primary_role, ic_number, institution_id' },
        { status: 400 }
      )
    }

    // Create a service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Generate employee ID
    const typePrefix = {
      teacher: 'TC',
      staff: 'ST',
      student: 'SD',
      admin: 'AD'
    }[primary_role as string] || 'US'

    // Get count of existing users with same role in the institution
    const { count } = await serviceSupabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('institution_id', institution_id)
      .eq('primary_role', primary_role)

    const nextNumber = (count || 0) + 1
    const employee_id = `${typePrefix}${nextNumber.toString().padStart(4, '0')}`

    // Prepare user data - users created via web admin are for mobile app access
    const userData = {
      full_name,
      employee_id,
      primary_role,
      primary_system: 'hub_mobile', // Users created via web admin are for mobile app access
      smartid_hub_role: primary_role,
      ic_number,
      email: email || null,
      phone: phone || null,
      institution_id,
      status: 'active'
    }

    // Insert user into Supabase
    const { data: insertedUser, error: insertError } = await serviceSupabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (insertError) {
      console.error('User creation failed:', insertError)
      
      if (insertError.message.includes('duplicate key')) {
        if (insertError.message.includes('employee_id')) {
          return NextResponse.json(
            { error: 'Employee ID already exists. Please try again.' },
            { status: 400 }
          )
        } else if (insertError.message.includes('ic_number')) {
          return NextResponse.json(
            { error: 'IC Number already exists. Please check and try again.' },
            { status: 400 }
          )
        } else {
          return NextResponse.json(
            { error: 'Duplicate entry detected. Please check your data.' },
            { status: 400 }
          )
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to create user: ' + insertError.message },
        { status: 400 }
      )
    }

    // Send welcome email with password setup link (only if email is provided)
    let emailSent = false
    let emailError = null
    
    if (email) {
      try {
        // Generate setup token
        const setupToken = generateSetupToken()
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

        // Store setup token in database
        const { error: tokenError } = await serviceSupabase
          .from('user_setup_tokens')
          .insert({
            user_id: insertedUser.id,
            token: setupToken,
            expires_at: expiresAt.toISOString()
          })

        if (tokenError) {
          console.error('Failed to create setup token:', tokenError)
          emailError = 'Failed to create setup token'
        } else {
          // Get institution name for email
          const { data: institutionData } = await serviceSupabase
            .from('institutions')
            .select('name')
            .eq('id', institution_id)
            .single()

          // Create setup URL
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          const setupUrl = `${baseUrl}/setup-password?token=${setupToken}`

          // Generate email content
          const emailContent = emailTemplates.newUserWelcome({
            fullName: full_name,
            employeeId: employee_id,
            email: email,
            setupUrl: setupUrl,
            institutionName: institutionData?.name
          })

          // Send email
          const emailResult = await sendEmail({
            to: email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text
          })

          if (emailResult.success) {
            emailSent = true
            console.log(`Welcome email sent to ${email}`)
          } else {
            emailError = emailResult.error
            console.error(`Failed to send welcome email to ${email}:`, emailResult.error)
          }
        }
      } catch (error) {
        emailError = error instanceof Error ? error.message : 'Unknown email error'
        console.error('Email sending error:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: email 
        ? (emailSent 
          ? 'User created successfully and welcome email sent!' 
          : 'User created successfully, but email sending failed. The user can be set up manually.')
        : 'User created successfully (no email provided)',
      user: insertedUser,
      email: {
        sent: emailSent,
        error: emailError
      }
    })

  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during user creation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institution_id') || searchParams.get('institutionId')
    
    if (!institutionId) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      )
    }

    // Create a service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First try with palm columns, if they don't exist, try without
    let users, error
    
    try {
      const { data, error: palmError } = await serviceSupabase
        .from('users')
        .select(`
          id,
          full_name,
          employee_id,
          primary_role,
          smartid_hub_role,
          email,
          ic_number,
          phone,
          institution_id,
          status,
          palm_id,
          palm_enrolled_at,
          last_palm_scan,
          palm_scan_count,
          palm_status,
          palm_quality,
          created_at,
          updated_at
        `)
        .eq('institution_id', institutionId)
        .eq('status', 'active')
        .order('full_name', { ascending: true })
      
      users = data
      error = palmError
    } catch (palmError) {
      // If palm columns don't exist, fetch without them
      console.warn('Palm columns not found, fetching basic user data:', palmError)
      
      const { data, error: basicError } = await serviceSupabase
        .from('users')
        .select(`
          id,
          full_name,
          employee_id,
          primary_role,
          smartid_hub_role,
          email,
          ic_number,
          phone,
          institution_id,
          status,
          created_at,
          updated_at
        `)
        .eq('institution_id', institutionId)
        .eq('status', 'active')
        .order('full_name', { ascending: true })
      
      // Add default palm values
      users = data?.map(user => ({
        ...user,
        palm_id: null,
        palm_enrolled_at: null,
        last_palm_scan: null,
        palm_scan_count: 0,
        palm_status: 'pending',
        palm_quality: null
      })) || []
      
      error = basicError
    }

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users: ' + error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: users || [],
      users: users || [] // Keep both for backwards compatibility
    })

  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching users' },
      { status: 500 }
    )
  }
}
