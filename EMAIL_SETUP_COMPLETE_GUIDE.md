# 🚀 100% Bulletproof Email Authentication Setup Guide

## ✅ **Step 1: Add Resend API Key to Supabase Dashboard**

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

## ✅ **Step 2: Configure Email Settings in Supabase**

1. **Go to Authentication → Settings:**
   - Click "Authentication" in the left sidebar
   - Click "Settings" tab

2. **Enable Email Confirmations:**
   - ✅ **Enable "Email confirmations"**
   - ✅ **Enable "Double confirm changes"**

3. **Set Site URL:**
   - **Site URL:** Your Cloudflare Pages domain (e.g., `https://your-app.pages.dev`)
   - **Add Redirect URLs:**
     - `https://your-app.pages.dev/auth`
     - `https://your-app.pages.dev`

## ✅ **Step 3: Configure SMTP in Supabase**

1. **Go to Authentication → Settings → SMTP:**
   - Click "Authentication" → "Settings"
   - Find "SMTP" section

2. **Enable SMTP and configure:**
   - ✅ **Enable SMTP**
   - **Host:** `smtp.resend.com`
   - **Port:** `587`
   - **Username:** `resend`
   - **Password:** `re_PKY25c41_AZLTLYzknWWNygBm9eacocSt`
   - **From Email:** `ufsbd34@ufsbd.fr`
   - **From Name:** `UFSBD Hérault`

## ✅ **Step 4: Test Email Authentication**

### **Test 1: Sign Up with Email Confirmation**
1. Go to your app: `https://your-app.pages.dev`
2. Click "Don't have an account? Sign up"
3. Enter a test email and password
4. Click "Sign Up"
5. **Expected:** Toast message "Please check your email to verify your account"
6. **Check your email** for confirmation link

### **Test 2: Password Reset**
1. Go to Sign In page
2. Click "Forgot Password?"
3. Enter your email
4. Click "Send Reset Email"
5. **Expected:** Toast message "Reset email sent!"
6. **Check your email** for reset link

## ✅ **Step 5: Verify Resend API Key**

1. **Go to Resend Dashboard:**
   ```
   https://resend.com/api-keys
   ```

2. **Verify your API key:**
   - Key: `re_PKY25c41_AZLTLYzknWWNygBm9eacocSt`
   - Status: Should be "Active"
   - Permissions: Should have "Send emails" permission

## ✅ **Step 6: Check Email Delivery**

1. **Check Spam/Junk folder** if you don't receive emails
2. **Verify sender domain** in Resend dashboard
3. **Check Resend logs** for delivery status

## 🔧 **Troubleshooting**

### **If emails don't send:**
1. **Check Supabase logs** in Authentication → Logs
2. **Verify API key** is correctly added to Supabase
3. **Check Resend dashboard** for delivery status
4. **Verify domain** is configured in Resend

### **If app shows "error sending confirmation email":**
1. **Check browser console** (F12) for errors
2. **Verify Supabase connection** is working
3. **Check if SMTP is enabled** in Supabase settings

## 🎯 **Expected Results**

After completing all steps:
- ✅ **Sign-up emails** will be sent automatically
- ✅ **Password reset emails** will work
- ✅ **Email confirmations** will be required
- ✅ **No more "error sending confirmation email"**

## 📧 **Email Templates**

The emails will use Supabase default templates:
- **Sign-up confirmation:** "Confirm your email address"
- **Password reset:** "Reset your password"

## 🚀 **Final Steps**

1. **Commit and push** the restored app
2. **Wait for Cloudflare Pages** to rebuild
3. **Test email functionality** on the live site
4. **Verify emails are received** in your inbox

**This setup will give you 100% working email authentication!** 🎉 