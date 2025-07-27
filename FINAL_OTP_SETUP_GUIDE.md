# 🎯 Final OTP Password Reset Setup Guide

Your OTP password reset system is **almost ready**! You just need to complete the database setup.

## 📋 Current Status

✅ **Frontend**: `/otp-reset-password` page - READY  
✅ **Edge Function**: `otp-password-reset` - DEPLOYED  
✅ **Email Service**: Resend API - CONFIGURED  
⚠️ **Database Functions**: Need to be applied to your Supabase database

## 🔧 Complete the Setup

### Step 1: Apply Database Migration

You need to run the SQL migration in your Supabase database:

1. **Go to your Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard
   - Open your project: `cmcfeiskfdbsefzqywbk`

2. **Open SQL Editor**:
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**:
   - Copy the contents of `apply-otp-migration.sql` (created in your project)
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

### Step 2: Verify Database Setup

After running the migration, verify it worked by running this test query:

```sql
-- Test if the function exists
SELECT generate_password_reset_otp('test@example.com');
```

If you see a JSON response (even if it says user not found), the function is working!

### Step 3: Test the System

Once the database is set up, test your OTP system:

1. **Run the test script**:
   ```bash
   node simple-otp-test.mjs
   ```

2. **Manual testing**:
   - Go to your website: `/otp-reset-password`
   - Enter your email: `singhchouhanv473@gmail.com`
   - Check your email for the OTP code
   - Complete the password reset flow

## 🎯 What Each Component Does

### Frontend (`/otp-reset-password`)
- **Step 1**: User enters email
- **Step 2**: User enters 6-digit OTP from email
- **Step 3**: User sets new password

### Edge Function (`otp-password-reset`)
- Generates 6-digit OTP codes
- Sends beautiful HTML emails via Resend
- Stores OTP in database with 10-minute expiry

### Database Functions
- `generate_password_reset_otp()` - Creates OTP and stores in database
- `verify_otp_code()` - Validates OTP without resetting password
- `verify_otp_and_reset_password()` - Validates OTP and updates password

### Database Table (`otp_password_reset`)
- Stores OTP codes with expiry times
- Tracks usage and attempts
- Links to user accounts

## 🔍 Troubleshooting

### If OTP emails aren't sending:
1. Check spam/junk folder
2. Wait 1-2 minutes for delivery
3. Verify Resend API key is configured
4. Check Edge Function logs in Supabase

### If database functions are missing:
1. Make sure you ran the SQL migration
2. Check function permissions
3. Verify table exists: `SELECT * FROM public.otp_password_reset LIMIT 1;`

### If frontend shows errors:
1. Check browser console for errors
2. Verify API endpoints are correct
3. Test Edge Function directly with the test script

## 🚀 Once Setup is Complete

Your users will be able to:

1. **Request Password Reset**:
   - Visit `/otp-reset-password`
   - Enter their email address
   - Receive a professional email with 6-digit OTP

2. **Verify and Reset**:
   - Enter the OTP code (valid for 10 minutes)
   - Set their new password
   - Get redirected to login page

3. **Security Features**:
   - OTP expires after 10 minutes
   - Maximum 3 attempts per OTP
   - Previous OTPs invalidated when new one is generated
   - Rate limiting (can't request new OTP for 2 minutes)

## 📧 Email Template Features

Your OTP emails include:
- Professional UFSBD Hérault branding
- Large, easy-to-read OTP code
- Clear expiry warnings
- Step-by-step instructions
- Contact information

## 🎉 You're Almost There!

Just run that SQL migration and your OTP password reset system will be fully functional! 

**Need help?** The SQL code is in `apply-otp-migration.sql` - just copy and paste it into your Supabase SQL Editor.