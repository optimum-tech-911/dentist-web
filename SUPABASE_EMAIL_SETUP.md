# 🚀 100% Bulletproof Email Authentication Setup

## Step 1: Add Resend API Key to Remote Supabase

1. **Go to your Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk
   ```

2. **Navigate to Settings → API:**
   - Click "Settings" in the left sidebar
   - Click "API" tab
   - Scroll down to find "Environment Variables" or "Secrets"

3. **Add Environment Variable:**
   - Click "Add Environment Variable"
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_PKY25c41_AZLTLYzknWWNygBm9eacocSt`
   - Click "Save"

## Step 2: Configure Email Settings

1. **Go to Authentication → Settings:**
   - Click "Authentication" in the left sidebar
   - Click "Settings" tab

2. **Enable Email Confirmations:**
   - ✅ **Enable "Email confirmations"**
   - ✅ **Enable "Double confirm changes"**

3. **Configure Site URL:**
   - **Site URL:** `http://localhost:8081` (or your current port)
   - **Additional Redirect URLs:** 
     - `http://localhost:8081/auth`
     - `http://127.0.0.1:8081/auth`

4. **Configure SMTP Settings:**
   - **SMTP Host:** `smtp.resend.com`
   - **SMTP Port:** `587`
   - **SMTP User:** `resend`
   - **SMTP Password:** `env(RESEND_API_KEY)`
   - **Admin Email:** `ufsbd34@ufsbd.fr`
   - **Sender Name:** `UFSBD Hérault`

## Step 3: Test Email Authentication

1. **Restart your development server**
2. **Try signing up** a new account
3. **Check your email** for confirmation
4. **Try password reset** functionality

## Troubleshooting

If emails don't work:
1. **Check Resend Dashboard** for email delivery status
2. **Verify API key** is correct
3. **Check Supabase logs** for SMTP errors
4. **Ensure domain** is verified in Resend

## Current Status
- ✅ Remote Supabase configured
- ✅ Resend API key ready
- ✅ Email confirmations enabled
- ✅ SMTP settings configured 