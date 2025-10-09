# Fix Email Invitation Issue - Step by Step Guide

## Problem
User `biskitsdoughbar@gmail.com` was added but didn't receive an email invitation to download the SmartID TIME mobile app.

## Root Causes Identified
1. **Missing Database Table**: The `user_setup_tokens` table doesn't exist
2. **Missing SMTP Configuration**: No email server configuration in environment variables

## Solutions

### Step 1: Create the Required Database Table

1. Go to your Supabase Dashboard:
   - Open https://supabase.com/dashboard
   - Select your SmartID TIME project
   - Go to "SQL Editor"

2. Copy and paste the contents of `setup_email_tables.sql` (created in this repo)

3. Click "Run" to execute the SQL

### Step 2: Configure SMTP Email Settings

You need to configure an email server to send emails. Here are options:

#### Option A: Using Gmail (Recommended for testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Gmail Settings → Security
   - Under "2-Step Verification", click "App passwords"
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Update `.env.local`** with your Gmail settings:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_SECURE=false
   FROM_EMAIL=your-email@gmail.com
   FROM_NAME=SmartID TIME
   ```

#### Option B: Using Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_SECURE=false
FROM_EMAIL=your-email@outlook.com
FROM_NAME=SmartID TIME
```

#### Option C: Using Your Domain Email

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
SMTP_SECURE=false
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=SmartID TIME
```

### Step 3: Test Email Configuration

1. Navigate to `/test-email` in your app (http://localhost:3003/test-email)
2. Enter a test email address
3. Click "Send Test Email"
4. Verify you receive the test email

### Step 4: Restart Your Application

After updating `.env.local`, restart your Next.js application:
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 5: Test User Registration with Email

1. Go to User Management page
2. Add a new user with a valid email address
3. The system should now send a welcome email
4. Check the email inbox for the invitation

## What the Email Contains

The email will include:
- Welcome message with user details (Name, Employee ID)
- Secure password setup link (expires in 24 hours)
- Instructions to:
  1. Click setup link to set password
  2. Download SmartID TIME mobile app
  3. Login with email and password

## Troubleshooting

### If Emails Still Don't Send:

1. **Check Server Logs**: Look for email errors in the console
2. **Verify SMTP Settings**: Ensure credentials are correct
3. **Test SMTP Connection**: Use an SMTP testing tool
4. **Check Spam Folder**: Emails might be filtered as spam
5. **Verify Email Provider**: Some providers block SMTP by default

### If Database Errors Occur:

1. **Verify Table Creation**: Check if `user_setup_tokens` table exists
2. **Check Permissions**: Ensure service role has access
3. **Review Migration**: Re-run the setup_email_tables.sql if needed

## Security Notes

- Setup tokens expire after 24 hours
- Each token can only be used once  
- Tokens are securely generated using crypto functions
- All email credentials should be kept secure

## Next Steps After Fix

1. **Re-add the User**: Since `biskitsdoughbar@gmail.com` didn't get an email, you may need to add them again
2. **Test with Multiple Users**: Verify the system works consistently
3. **Monitor Email Delivery**: Check logs for any ongoing issues

## Email Template Preview

The user will receive a professional email with:
- SmartID TIME branding
- Their account details
- Step-by-step setup instructions
- Mobile app download guidance
- Security information

Once this is set up, users will automatically receive email invitations when added to the system!