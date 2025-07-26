# How to Find Environment Variables in Supabase

## Step-by-Step Visual Guide

### Step 1: Access Your Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click on your project

### Step 2: Navigate to Settings
- Look for the **"Settings"** option in the left sidebar
- It usually has a gear/cog icon ⚙️
- Click on it

### Step 3: Go to API Settings
- In the Settings menu, look for **"API"**
- Click on it
- This will open the API settings page

### Step 4: Find Environment Variables
- Scroll down on the API settings page
- Look for a section called **"Environment Variables"** or **"Secrets"**
- It might be near the bottom of the page

### Step 5: Add Your Resend API Key
- Click **"Add Environment Variable"** or **"Add Secret"**
- Set the **Name** to: `RESEND_API_KEY`
- Set the **Value** to: `re_your_actual_api_key_here` (replace with your real key)
- Click **Save**

## Alternative Locations (Different Supabase Versions)

### Option A: Project Settings
- Click on your project name (top left)
- Look for **"Settings"** or **"Configuration"**
- Find **"Environment Variables"** or **"Secrets"**

### Option B: Database Settings
- Go to **"Database"** in the left sidebar
- Look for **"Settings"** or **"Configuration"**
- Find **"Environment Variables"**

### Option C: Auth Settings
- Go to **"Authentication"** in the left sidebar
- Look for **"Settings"** or **"Configuration"**
- Find **"Email Settings"** or **"SMTP Configuration"**

## If You Still Can't Find It

### Check Your Supabase Plan
- Free tier might have limited access to environment variables
- Check if you're on the correct plan

### Contact Supabase Support
- Go to [supabase.com/support](https://supabase.com/support)
- Ask about environment variable configuration

### Alternative: Use Local Environment File
Create a `.env` file in your project root:
```env
VITE_RESEND_API_KEY=re_your_actual_api_key_here
```

## Quick Test
Once you find the environment variables section, add:
- **Name**: `RESEND_API_KEY`
- **Value**: Your actual Resend API key (starts with `re_`)

Then restart your development server and test the password reset functionality. 