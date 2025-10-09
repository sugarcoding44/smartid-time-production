# 📧 Email Setup Guide for SmartID TIME Mobile Users

## 🎯 **Goal**
Send email invitations to users so they can set up passwords and login to the SmartID TIME mobile app.

## 📱 **Complete User Flow**
1. **Admin adds user** → Web Admin (localhost:3003)
2. **System sends email** → User receives welcome email with setup link
3. **User sets password** → Clicks link, creates secure password
4. **User downloads mobile app** → SmartID TIME mobile app
5. **User logs in** → Uses email + password to access mobile app

---

## 🔧 **Step 1: Configure Email Settings**

### **Option A: Gmail Setup (Recommended)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account → Security
   - Under "2-Step Verification" → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password (like: `abcd efgh ijkl mnop`)

3. **Update `.env.local`** with your Gmail credentials:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=youremail@gmail.com
   SMTP_PASS=abcdefghijklmnop
   SMTP_SECURE=false
   FROM_EMAIL=youremail@gmail.com
   FROM_NAME=SmartID TIME
   ```

### **Option B: Outlook/Hotmail**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=youremail@outlook.com
SMTP_PASS=your-password
SMTP_SECURE=false
FROM_EMAIL=youremail@outlook.com
FROM_NAME=SmartID TIME
```

---

## 🔧 **Step 2: Run Database Migration**

You already created the `user_setup_tokens` table, but let's verify it's working:

1. Go to **Supabase Dashboard** → SQL Editor
2. Run this query to check:
   ```sql
   SELECT * FROM public.user_setup_tokens LIMIT 5;
   ```

---

## 🔧 **Step 3: Test Email Configuration**

1. **Navigate to test page**: http://localhost:3003/test-email
2. **Enter your email address**
3. **Click "Send Test Email"**
4. **Check your inbox** for the test email

---

## 🔧 **Step 4: Restart Web Server**

After updating `.env.local`, restart the web server:

```bash
# Stop current server (Ctrl+C in terminal)
npm run dev
```

---

## 📝 **Step 5: Add User and Send Email**

### **Adding New User:**
1. **Go to**: http://localhost:3003/simple-users-v2
2. **Click "Add User"**
3. **Fill in details**:
   - Full Name: `John Doe`
   - IC Number: `901234567890`
   - Email: `john@example.com` ← **IMPORTANT: Include email**
   - Phone: `+60123456789`
   - Role: `Teacher/Staff/Student`

4. **Click "Create User"**

### **Resend Email (if needed):**
- **Hover over user card** → Click blue email icon (📧)
- This resends the welcome email with setup link

---

## 📧 **What User Receives**

### **Email Content:**
```
Subject: Welcome to smartID TIME - Set up your account

Hello John Doe,

Welcome to smartID TIME! Your account has been created successfully.

Account Details:
- Full Name: John Doe
- Employee ID: TC-0001
- Email: john@example.com

IMPORTANT SECURITY STEP:
To complete your registration, you need to set up your password.

[SET UP YOUR PASSWORD] ← Click this button

What happens next:
1. Click the button above to set your password
2. Download the SmartID Hub Mobile App  
3. Login using your email and new password
4. Access attendance, e-wallet, leave requests, and more!

IMPORTANT: These credentials are for the SmartID TIME Mobile App only.
Setup link expires in 24 hours.
```

---

## 🔐 **Step 6: User Sets Password**

When user clicks the setup link:
1. **Redirected to password setup page**
2. **Enters new password** (minimum 8 characters)
3. **Confirms password**
4. **Account is activated**

---

## 📱 **Step 7: User Downloads Mobile App**

Users can access the mobile app at:
- **Web Version**: http://localhost:3001
- **Mobile App**: (When you build and distribute the actual mobile app)

### **Login Credentials:**
- **Email**: `john@example.com`
- **Password**: The password they just set up

---

## 🔍 **Troubleshooting**

### **Email Not Sending:**
1. **Check SMTP credentials** in `.env.local`
2. **Verify app password** (for Gmail)
3. **Check server console** for error messages
4. **Test email function** at `/test-email`

### **User Can't Set Password:**
1. **Check if link expired** (24 hour limit)
2. **Verify database table** exists
3. **Try resending email** with new token

### **User Can't Login to Mobile:**
1. **Verify password was set** successfully
2. **Check email matches** exactly
3. **Try password reset** if needed

---

## 📊 **Monitoring Email Delivery**

### **Check Email Status:**
1. **Web Admin Console** shows email sent/failed status
2. **Database query**:
   ```sql
   SELECT * FROM user_setup_tokens 
   WHERE used_at IS NULL 
   ORDER BY created_at DESC;
   ```

### **Success Indicators:**
- ✅ **User Creation**: "User created successfully and welcome email sent!"
- ✅ **Email Sent**: Blue email icon appears on user cards
- ✅ **Password Set**: User can login to mobile app

---

## 🎉 **Complete Workflow Example**

1. **Admin**: Adds `sarah@school.edu` via web admin
2. **System**: Sends welcome email to Sarah
3. **Sarah**: Receives email, clicks setup link
4. **Sarah**: Sets password `MySecure123`
5. **Sarah**: Opens mobile app at localhost:3001
6. **Sarah**: Logs in with `sarah@school.edu` + `MySecure123`
7. **Sarah**: Accesses GPS calibration, attendance, dashboard

---

## ⚙️ **Current Setup Status**

- ✅ **Database**: user_setup_tokens table created
- ✅ **API**: Email sending functionality implemented  
- ✅ **Templates**: Professional email templates ready
- ✅ **Mobile App**: Running on localhost:3001
- ✅ **Web Admin**: Running on localhost:3003
- 🟡 **SMTP**: Needs your actual email credentials

**Next Step**: Update `.env.local` with your email credentials and test!