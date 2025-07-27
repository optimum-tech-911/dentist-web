# 🔧 Fix Supabase Password Reset "Invalid Link" Error

## ❌ Problem
Password reset emails show "invalid link" error because:
- Site URL is set to localhost instead of production domain
- Redirect URLs not properly configured in Supabase dashboard
- Email templates may reference wrong URLs

## ✅ Solution Applied in Code
I've already fixed the following in your codebase:

### 1. Updated Reset Password Function
**File**: `/src/hooks/useAuth.tsx`
- ✅ Changed redirect URL from `${window.location.origin}/reset-password` to `https://ufsbd34.fr/reset-password`

### 2. Updated Local Supabase Config
**File**: `/supabase/config.toml`
- ✅ Changed `site_url` from `http://localhost:8081` to `https://ufsbd34.fr`
- ✅ Added production URLs to `additional_redirect_urls`

## 🚨 REQUIRED: Manual Supabase Dashboard Configuration

**You MUST manually configure these settings in your Supabase dashboard:**

### Step 1: Update Site URL
1. Go to: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk
2. Navigate to: **Authentication** → **URL Configuration**
3. Set **Site URL** to: `https://ufsbd34.fr`

### Step 2: Add Redirect URLs
In the same **URL Configuration** page, add these redirect URLs:

```
https://ufsbd34.fr
https://ufsbd34.fr/auth
https://ufsbd34.fr/reset-password
http://localhost:8081
http://localhost:8081/auth
http://localhost:8081/reset-password
```

### Step 3: Update Email Template (Optional)
1. Go to: **Authentication** → **Email Templates**
2. Select: **Reset Password** template
3. Replace any `{{ .SiteURL }}` with `{{ .RedirectTo }}` if needed

## 🧪 Testing After Manual Configuration

After you've made the manual changes in Supabase dashboard:

1. **Test the password reset:**
   ```bash
   # Run this in your workspace
   node test-reset-fix.js
   ```

2. **Check your email** for the reset link
3. **Click the reset link** - it should now work correctly
4. **Reset your password** on the page

## 🎯 Expected Result

- ✅ Reset emails will contain valid links
- ✅ Links will redirect to: `https://ufsbd34.fr/reset-password`
- ✅ Password reset page will work correctly
- ✅ No more "invalid link" errors

## 📋 Quick Verification

The reset link in your email should look like:
```
https://ufsbd34.fr/reset-password?access_token=...&refresh_token=...&type=recovery
```

If it still shows `localhost` or gives invalid link errors, the manual Supabase dashboard configuration wasn't applied correctly.

## 🚀 Status

- ✅ **Code fixes**: Applied automatically
- ⚠️  **Dashboard config**: Requires manual setup
- 🧪 **Test email**: Sent to vsinghchouhan905@gmail.com

**Next step**: Apply the manual Supabase dashboard configuration above, then test the reset link in your email!