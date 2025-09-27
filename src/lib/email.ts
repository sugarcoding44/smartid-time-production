import nodemailer from 'nodemailer'

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'SmartID Hub'}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Generate a secure token for password setup
export function generateSetupToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Email templates
export const emailTemplates = {
  newUserWelcome: (data: {
    fullName: string
    employeeId: string
    email: string
    setupUrl: string
    institutionName?: string
  }) => ({
    subject: `Welcome to SmartID Hub - Set up your account`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SmartID Hub</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 20px;
          }
          .title {
            color: #1e293b;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
          }
          .subtitle {
            color: #64748b;
            font-size: 16px;
            margin: 8px 0 0 0;
          }
          .info-card {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
          }
          .info-label {
            color: #64748b;
            font-weight: 500;
          }
          .info-value {
            color: #1e293b;
            font-weight: 600;
          }
          .setup-button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            transition: transform 0.2s;
          }
          .setup-button:hover {
            transform: translateY(-2px);
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
            text-align: center;
          }
          .security-note {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            color: #92400e;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              🎓 SmartID
            </div>
            <h1 class="title">Welcome to SmartID Hub!</h1>
            <p class="subtitle">Your account has been created successfully</p>
          </div>

          <p>Hello <strong>${data.fullName}</strong>,</p>

          <p>Welcome to SmartID Hub! Your account has been created and you're now part of ${data.institutionName || 'your institution'}. Here are your account details:</p>

          <div class="info-card">
            <div class="info-row">
              <span class="info-label">Full Name:</span>
              <span class="info-value">${data.fullName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Employee ID:</span>
              <span class="info-value">${data.employeeId}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email Address:</span>
              <span class="info-value">${data.email}</span>
            </div>
          </div>

          <div class="security-note">
            <strong>⚠️ Important Security Step</strong><br>
            To complete your registration and secure your account, you need to set up your password.
          </div>

          <div style="text-align: center;">
            <a href="${data.setupUrl}" class="setup-button">
              Set Up Your Password
            </a>
          </div>

          <p><strong>What happens next:</strong></p>
          <ul>
            <li>Click the button above to set your password</li>
            <li>Download the SmartID Hub Mobile App</li>
            <li>Login using your email and new password</li>
            <li>Access attendance, e-wallet, leave requests, and more!</li>
          </ul>

          <div style="background: #1e293b; border: 1px solid #334155; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <strong style="color: #60a5fa;">📱 Important: Mobile App Login</strong><br>
            <span style="color: #cbd5e1; font-size: 14px;">
              These credentials are for the <strong>SmartID Hub Mobile App</strong> only.<br>
              Download the app and use your email and password to login.<br>
              Web admin access is separate and managed by administrators.
            </span>
          </div>

          <div class="footer">
            <p>This setup link will expire in 24 hours for security reasons.</p>
            <p>If you didn't expect this email, please contact your system administrator.</p>
            <p>&copy; 2025 SmartID Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to SmartID Hub!

      Hello ${data.fullName},

      Your account has been created successfully. Here are your details:
      
      Full Name: ${data.fullName}
      Employee ID: ${data.employeeId}
      Email: ${data.email}

      To complete your registration, please set up your password by visiting:
      ${data.setupUrl}

      IMPORTANT: These credentials are for the SmartID Hub Mobile App only.
      After setting your password:
      1. Download the SmartID Hub Mobile App
      2. Login using your email and new password
      3. Access attendance, e-wallet, leave requests, and more!

      Note: Web admin access is separate and managed by administrators.
      
      This setup link will expire in 24 hours for security reasons.

      If you didn't expect this email, please contact your system administrator.

      © 2025 SmartID Hub. All rights reserved.
    `
  })
}
