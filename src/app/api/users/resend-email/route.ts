import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates, generateSetupToken } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create a service role client for admin operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user details
    const { data: user, error: userError } = await serviceSupabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.email) {
      return NextResponse.json(
        { error: 'User has no email address' },
        { status: 400 }
      )
    }

    // Generate new setup token
    const setupToken = generateSetupToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

    // Store setup token in database
    const { error: tokenError } = await serviceSupabase
      .from('user_setup_tokens')
      .insert({
        user_id: user.id,
        token: setupToken,
        expires_at: expiresAt.toISOString()
      })

    if (tokenError) {
      console.error('Failed to create setup token:', tokenError)
      return NextResponse.json(
        { error: 'Failed to create setup token: ' + tokenError.message },
        { status: 500 }
      )
    }

    // Get institution name for email
    const { data: institutionData } = await serviceSupabase
      .from('institutions')
      .select('name')
      .eq('id', user.institution_id)
      .single()

    // Create setup URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'
    const setupUrl = `${baseUrl}/setup-password?token=${setupToken}`

    // Generate email content
    const emailContent = emailTemplates.newUserWelcome({
      fullName: user.full_name,
      employeeId: user.employee_id,
      email: user.email,
      setupUrl: setupUrl,
      institutionName: institutionData?.name
    })

    // Send email
    const emailResult = await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    })

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: `Welcome email resent to ${user.email}`,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          employee_id: user.employee_id
        }
      })
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: emailResult.error
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Resend email error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while resending email' },
      { status: 500 }
    )
  }
}