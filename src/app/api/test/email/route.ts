import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, testType = 'welcome' } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Test data
    const testData = {
      fullName: 'Test User',
      employeeId: 'TC0001',
      email: email,
      setupUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/setup-password?token=test-token-123`,
      institutionName: 'Test Institution'
    }

    let emailResult

    if (testType === 'welcome') {
      const emailContent = emailTemplates.newUserWelcome(testData)
      emailResult = await sendEmail({
        to: email,
        subject: '[TEST] ' + emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      })
    } else {
      return NextResponse.json(
        { error: 'Unknown test type' },
        { status: 400 }
      )
    }

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: emailResult.messageId,
        testData
      })
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send test email',
          details: emailResult.error
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
