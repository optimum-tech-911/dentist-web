# Gallery Fix Guide

## Problem
You're getting a "Erreur de page - Erreur de chargement" error in the admin gallery, and there are CORS issues with images.

## Root Causes
1. **Database table missing** - `gallery_images` table might not exist
2. **Storage buckets not configured** - `gallery` and `gallery-staging` buckets missing
3. **CORS issues** - Cloudflare blocking cross-origin requests
4. **Authentication issues** - User not properly authenticated
5. **RLS policies missing** - Row Level Security blocking access

## Solutions

### Step 1: Fix Database Schema

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project
   - Go to SQL Editor

2. **Run the Database Fix Script**
   - Copy and paste the contents of `fix-gallery-issues.sql`
   - Click "Run" to execute the script
   - This will create the necessary tables and policies

### Step 2: Create Storage Buckets

1. **Go to Storage in Supabase Dashboard**
   - Navigate to Storage > Buckets
   - Click "Create bucket"

2. **Create 'gallery' bucket**
   - Name: `gallery`
   - Public bucket: ✅ Checked
   - File size limit: 50MB
   - Allowed MIME types: `image/*`

3. **Create 'gallery-staging' bucket**
   - Name: `gallery-staging`
   - Public bucket: ✅ Checked
   - File size limit: 50MB
   - Allowed MIME types: `image/*`

### Step 3: Fix CORS Issues (Cloudflare)

1. **Go to Cloudflare Dashboard**
   - Navigate to https://dash.cloudflare.com
   - Select your domain: `ufsbd34.fr`

2. **Disable Security Features Temporarily**
   - Go to Security > Settings
   - Set Security Level to "Medium"
   - Disable Browser Integrity Check
   - Save changes

3. **Clear Cloudflare Cache**
   - Go to Caching > Configuration
   - Click "Purge Everything"
   - Wait 1-2 minutes

### Step 4: Test the Fix

1. **Run the Debug Script**
   - Open browser console on your site
   - Copy and paste the contents of `debug-gallery-issue.js`
   - Press Enter to run the debug
   - Check the console output for any errors

2. **Test Gallery Access**
   - Go to `/admin/gallery`
   - Check if the page loads without errors
   - Try uploading an image
   - Check if images display properly

### Step 5: Verify Authentication

1. **Check if user is authenticated**
   - Open browser console
   - Run: `await supabase.auth.getUser()`
   - Should return user data, not null

2. **Check user role**
   - Run: `await supabase.rpc('get_current_user_role')`
   - Should return 'admin' or appropriate role

### Step 6: Alternative Quick Fix

If the above doesn't work, try this temporary fix:

1. **Disable RLS temporarily**
   ```sql
   ALTER TABLE public.gallery_images DISABLE ROW LEVEL SECURITY;
   ```

2. **Allow all storage access**
   ```sql
   CREATE POLICY "Allow all storage access" ON storage.objects
     FOR ALL USING (true);
   ```

3. **Test again**
   - Go to `/admin/gallery`
   - Should work now

### Step 7: Re-enable Security (After Testing)

Once everything works:

1. **Re-enable RLS**
   ```sql
   ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
   ```

2. **Re-enable Cloudflare security**
   - Go back to Cloudflare settings
   - Re-enable security features
   - Test to ensure it still works

## Troubleshooting

### If you still get errors:

1. **Check browser console**
   - Look for specific error messages
   - Check Network tab for failed requests

2. **Check Supabase logs**
   - Go to Supabase Dashboard > Logs
   - Look for errors related to gallery

3. **Test with different browsers**
   - Try Chrome, Firefox, Safari
   - Check if issue is browser-specific

4. **Check environment variables**
   - Ensure `VITE_SUPABASE_URL` is set correctly
   - Ensure `VITE_SUPABASE_ANON_KEY` is set correctly

### Common Error Messages:

- **"relation 'gallery_images' does not exist"** → Run the SQL fix script
- **"bucket not found"** → Create the storage buckets
- **"CORS error"** → Fix Cloudflare settings
- **"permission denied"** → Check RLS policies
- **"not authenticated"** → Check user login status

## Verification Checklist

After applying fixes:

- ✅ Database table `gallery_images` exists
- ✅ Storage buckets `gallery` and `gallery-staging` exist
- ✅ RLS policies are configured
- ✅ Cloudflare CORS issues are resolved
- ✅ User is authenticated
- ✅ Gallery page loads without errors
- ✅ Images can be uploaded
- ✅ Images display properly
- ✅ No console errors

## Files Created

- ✅ `fix-gallery-issues.sql` - Database schema fix
- ✅ `debug-gallery-issue.js` - Diagnostic script
- ✅ `GALLERY_FIX_GUIDE.md` - This guide

The gallery should work properly after applying these fixes!