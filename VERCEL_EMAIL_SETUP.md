# 🚀 Vercel + Email Authentication Setup

## Step 1: Add Environment Variables to Vercel

1. **Go to your Vercel Dashboard**
2. **Select your project**
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
3. **Set Site URL:** Your Vercel domain (e.g., `https://your-app.vercel.app`)
4. **Add Redirect URLs:**
   - `https://your-app.vercel.app/auth`
   - `https://your-app.vercel.app`

## Step 4: Configure SMTP in Supabase

1. **Go to:** Authentication → Settings → SMTP
2. **Enable SMTP** and configure:
   - **Host:** `smtp.resend.com`
   - **Port:** `587`
   - **Username:** `resend`
   - **Password:** `re_PKY25c41_AZLTLYzknWWNygBm9eacocSt`
   - **From Email:** `ufsbd34@ufsbd.fr`
   - **From Name:** `UFSBD Hérault`

## Step 5: Redeploy on Vercel

1. **Push your changes to GitHub**
2. **Vercel will automatically redeploy**
3. **Test email authentication**

## ✅ What This Fixes:

- ✅ **Email confirmations** will work on Vercel
- ✅ **Password reset** emails will be sent
- ✅ **Sign-up confirmations** will work
- ✅ **100% bulletproof** email authentication 