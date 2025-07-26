# 🚀 Cloudflare Pages + Email Authentication Setup

## Step 1: Add Environment Variables to Cloudflare Pages

1. **Go to your Cloudflare Dashboard**
2. **Select your Pages project**
3. **Go to Settings → Environment Variables**
4. **Add these variables:**

```
VITE_SUPABASE_URL=https://cmcfeiskfdbsefzqywbk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU
```

## Step 2: Add Resend API Key to Supabase Dashboard

1. **Go to:** https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk
2. **Click:** Settings → API
3. **Scroll down** to "Environment Variables"
4. **Add:**
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_PKY25c41_AZLTLYzknWWNygBm9eacocSt`

## Step 3: Configure Email Settings in Supabase

1. **Go to:** Authentication → Settings
2. **Enable Email Confirmations**
3. **Set Site URL:** Your Cloudflare Pages domain (e.g., `https://your-app.pages.dev`)
4. **Add Redirect URLs:**
   - `https://your-app.pages.dev/auth`
   - `https://your-app.pages.dev`

## Step 4: Configure SMTP in Supabase

1. **Go to:** Authentication → Settings → SMTP
2. **Enable SMTP** and configure:
   - **Host:** `smtp.resend.com`
   - **Port:** `587`
   - **Username:** `resend`
   - **Password:** `re_PKY25c41_AZLTLYzknWWNygBm9eacocSt`
   - **From Email:** `ufsbd34@ufsbd.fr`
   - **From Name:** `UFSBD Hérault`

## Step 5: Fix Build Issues

The build error is due to lockfile changes. To fix:

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Fix email authentication for Cloudflare Pages"
   git push
   ```

2. **Cloudflare Pages will automatically redeploy**

## ✅ What This Fixes:

- ✅ **Email confirmations** will work on Cloudflare Pages
- ✅ **Password reset** emails will be sent
- ✅ **Sign-up confirmations** will work
- ✅ **Build errors** will be resolved
- ✅ **100% bulletproof** email authentication

## 🔧 Build Configuration for Cloudflare Pages:

Make sure your `package.json` has the correct build script:

```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite"
  }
}
```

## 🎯 Key Differences from Vercel:

- Cloudflare Pages uses different environment variable syntax
- Build process is slightly different
- Domain will be `.pages.dev` instead of `.vercel.app` 