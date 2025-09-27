# Email Setup for New User Registration

This document explains how to configure and use the email functionality for new user registration in SmartID Hub.

## Overview

When a new user is added to the system through the admin interface, an automated email will be sent to the user's email address (if provided) with:
- Welcome message with user details
- Secure password setup link that expires in 24 hours
- Instructions for completing registration

## 🚀 Quick Setup

### 1. Configure Environment Variables

Add these variables to your `.env.local` file:

```env
# SMTP Configuration
SMTP_HOST=your_smtp_server_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_SECURE=false
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=SmartID Hub

# App URL (for setup links)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Run Database Migration

Execute the SQL migration to create the user setup tokens table:

```sql
-- Run this in your Supabase SQL editor or psql
-- File: sql/migrations/009_user_setup_tokens.sql
\i sql/migrations/009_user_setup_tokens.sql
```

### 3. Test the Email Functionality

1. Go to User Management in your admin dashboard
2. Add a new user with a valid email address
3. The system will automatically send a welcome email
4. Check the user's email for the setup link

## 📧 Email Flow

### For Administrators

1. **Add New User**: Create user through admin interface
2. **Email Sent**: System automatically sends welcome email if email provided
3. **Confirmation**: Admin sees confirmation of email sent/failed
4. **Monitor**: Check logs for email delivery status

### For New Users

1. **Receive Email**: Gets welcome email with account details
2. **Click Setup Link**: Accesses password setup page
3. **Set Password**: Creates secure password (min 8 characters)
4. **Login**: Can now access SmartID Hub with email/password

## 🔒 Security Features

- **Token Expiration**: Setup links expire after 24 hours
- **One-Time Use**: Each setup token can only be used once
- **Secure Generation**: Tokens use cryptographically secure random generation
- **Database Tracking**: All tokens are logged and tracked

## 📋 Email Template

The welcome email includes:
- Professional SmartID Hub branding
- User's full name, employee ID, and email
- Institution name (if available)  
- Secure password setup button
- Clear instructions and security notes
- Responsive HTML design

## 🛠 SMTP Configuration Examples

### Gmail (with App Password)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
SMTP_SECURE=false
FROM_EMAIL=your-email@gmail.com
FROM_NAME=SmartID Hub
```

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_SECURE=false
FROM_EMAIL=your-email@outlook.com
FROM_NAME=SmartID Hub
```

### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
SMTP_SECURE=false
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=SmartID Hub
```

## 🔧 API Endpoints

### Create User with Email
```javascript
POST /api/users
{
  "full_name": "John Doe",
  "primary_role": "teacher", 
  "ic_number": "123456789012",
  "email": "john@example.com",  // Email triggers welcome email
  "phone": "+1234567890",
  "institution_id": "uuid"
}
```

### Verify Setup Token
```javascript
GET /api/auth/setup-password?token=abc123
```

### Set Password
```javascript
POST /api/auth/setup-password
{
  "token": "abc123",
  "password": "securepassword",
  "confirmPassword": "securepassword"
}
```

## 📊 Database Tables

### user_setup_tokens
- `id`: UUID primary key
- `user_id`: Foreign key to users table
- `token`: Unique setup token
- `expires_at`: Token expiration timestamp
- `used_at`: When token was used (NULL if unused)
- `created_at`/`updated_at`: Timestamps

## 🐛 Troubleshooting

### Email Not Sending
1. Check SMTP credentials in environment variables
2. Verify SMTP server allows connections
3. Check application logs for detailed error messages
4. Test SMTP connection independently

### Setup Link Not Working
1. Verify token hasn't expired (24 hour limit)
2. Check token hasn't been used already
3. Ensure database migration was applied
4. Check app URL in environment variables

### User Can't Login After Setup
1. Verify auth user was created in Supabase Auth
2. Check auth_id was linked in users table
3. Ensure email matches exactly

## 📱 Mobile App Integration

The email functionality works with the Flutter mobile app:
- Users receive setup email from web admin
- Can complete password setup on web or mobile
- Login credentials work across both platforms

## 🔄 Resending Setup Emails

To resend a setup email (manual process):
1. Generate new setup token via API or admin interface
2. Send new email with updated link
3. Previous tokens remain valid until expiration

## 💡 Best Practices

1. **Always provide email** when creating users for automatic setup
2. **Verify email addresses** before creating users  
3. **Monitor email logs** for delivery issues
4. **Set up proper SPF/DKIM** records for email deliverability
5. **Use secure app passwords** for email providers
6. **Test email flow** in staging environment first

## 📈 Next Steps

- Set up email monitoring/analytics
- Implement email templates for other notifications
- Add email preferences for users
- Create admin dashboard for email status tracking
