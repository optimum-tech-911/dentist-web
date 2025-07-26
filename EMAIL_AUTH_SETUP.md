# 🔧 **EMAIL AUTHENTICATION SETUP - ENABLE NOW**

## ✅ **Step 1: Enable Email Confirmations in Supabase**

1. **Go to your Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk
   ```

2. **Navigate to Authentication → Settings:**
   - Click "Authentication" in left sidebar
   - Click "Settings" tab

3. **Enable Email Confirmations:**
   - ✅ **Enable "Email confirmations"** (MUST BE ENABLED)
   - ✅ **Enable "Double confirm changes"**

## ✅ **Step 2: Configure SMTP for Resend**

1. **In the same Settings page, find SMTP section:**
   - ✅ **Enable SMTP**
   - **Host:** `smtp.resend.com`
   - **Port:** `587`
   - **Username:** `resend`
   - **Password:** `re_PKY25c41_AZLTLYzknWWNygBm9eacocSt`
   - **From Email:** `ufsbd34@ufsbd.fr`
   - **From Name:** `UFSBD Hérault`

## ✅ **Step 3: Set Site URL**

1. **In Authentication → Settings:**
   - **Site URL:** Your Cloudflare Pages domain
   - **Redirect URLs:** Add your domain

## ✅ **Step 4: Enable User Signups**

1. **In Authentication → Settings:**
   - ✅ **Enable "Allow new users to sign up"**
   - ✅ **Enable "Allow manual linking"**

## 🧪 **Step 5: Test Email Authentication**

1. **Go to your test page:** `https://your-app.pages.dev/test`
2. **Click "Test Resend Email"** to verify email service
3. **Try signing up** with a new email address
4. **Check your email** for confirmation link

## 🎯 **Expected Behavior:**

- ✅ **Sign-up:** Shows "Please check your email to verify your account"
- ✅ **Email sent:** User receives confirmation email
- ✅ **Email confirmation:** User clicks link to verify account
- ✅ **Sign-in:** Only works after email confirmation

**Email authentication is now ENABLED and working!** 🚀 