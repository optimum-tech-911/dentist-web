# 🚨 White Page Deployment Troubleshooting Guide

If your deployed site shows a white page, follow this step-by-step troubleshooting guide.

## 🔍 Step 1: Access Diagnostic Page

First, try accessing the diagnostic page directly:
- Go to: `https://your-domain.com/diagnostic`
- This page bypasses normal app initialization and will show you exactly what's failing

## 🔧 Step 2: Check Browser Console

1. Open your deployed site
2. Press `F12` (or `Cmd+Option+I` on Mac)
3. Go to the **Console** tab
4. Look for red error messages

### Common Console Errors:

#### A. Supabase Connection Errors
```
Error: Failed to fetch from Supabase
```
**Solution**: 
- Check if your Supabase project is active
- Verify database accessibility from your domain
- Check Supabase project settings for allowed origins

#### B. CORS Errors
```
Access to fetch has been blocked by CORS policy
```
**Solution**:
- Add your deployment domain to Supabase allowed origins
- In Supabase Dashboard → Settings → API → URL Configuration

#### C. JavaScript/Module Loading Errors
```
Failed to load module script
```
**Solution**:
- Check if all assets are being served correctly
- Verify your hosting platform is serving files with correct MIME types

## 🔧 Step 3: Platform-Specific Checks

### For Cloudflare Pages:
1. Check **Functions** tab for any errors
2. Verify **Custom domains** are properly configured
3. Check **Environment variables** (if any are needed)
4. Ensure **Build output directory** is set to `dist`

### For Vercel:
1. Check **Functions** logs in dashboard
2. Verify **Environment Variables** in project settings
3. Check **Domains** configuration
4. Review **Build logs** for any issues

### For Netlify:
1. Check **Deploy logs** in site dashboard
2. Verify **Environment variables** in Site settings
3. Check **Domain management** settings
4. Ensure `_redirects` file is working (should contain: `/*    /index.html   200`)

## 🔧 Step 4: Specific Fixes for This Project

### Fix 1: Supabase Database Access
The app tries to connect to Supabase immediately. If the database is unreachable:

1. **Check Supabase Project Status**:
   - Go to your Supabase dashboard
   - Ensure project is not paused or suspended
   - Check if there are any service outages

2. **Verify Database Permissions**:
   - Ensure your `posts` table exists and is accessible
   - Check Row Level Security (RLS) policies if enabled

### Fix 2: Asset Loading Issues
Check if assets are loading correctly:

1. Open **Network** tab in browser dev tools
2. Refresh the page
3. Look for failed requests (red entries)
4. Common issues:
   - CSS files not loading (check MIME types)
   - JavaScript modules failing to load
   - Image assets returning 404

### Fix 3: Base URL Configuration
If your site is deployed to a subdirectory, you may need to update the base URL:

1. In `vite.config.ts`, update the `base` property:
```typescript
export default defineConfig({
  base: "/your-subdirectory/", // if deployed to subdirectory
  // ... rest of config
});
```

### Fix 4: Router Configuration
Ensure SPA routing works correctly:

1. Verify `_redirects` file exists in the `dist` folder after build
2. Content should be: `/*    /index.html   200`
3. For other platforms, configure catch-all routing

## 🔧 Step 5: Emergency Fallback

If you need the site working immediately, you can temporarily disable problematic features:

### Disable Supabase Initialization Check
1. Comment out the Supabase test in `AppInitializer.tsx`:
```typescript
// Test basic Supabase connection (non-blocking)
try {
  // await supabase.from('posts').select('count').limit(1);
  console.log('✅ Supabase connection test skipped');
} catch (supabaseError) {
  console.warn('⚠️ Supabase connection issue (non-blocking):', supabaseError);
}
```

### Create a Simple Landing Page
1. Create a minimal `src/pages/SimpleLanding.tsx`:
```typescript
export default function SimpleLanding() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">Site Under Maintenance</h1>
    </div>
  );
}
```

2. Temporarily replace the main route in `App.tsx`:
```typescript
<Route path="/" element={<SimpleLanding />} />
```

## 🔧 Step 6: Build and Test Locally

Always test the production build locally before deploying:

```bash
npm run build
npm run preview
```

Open `http://localhost:4173` and check if the issue occurs locally.

## 📞 Getting Help

If none of the above works:

1. **Check the diagnostic page**: `your-domain.com/diagnostic`
2. **Copy the exact error messages** from browser console
3. **Note your hosting platform** (Cloudflare, Vercel, Netlify, etc.)
4. **Check if it works locally** with `npm run preview`

## 🎯 Quick Checklist

- [ ] Diagnostic page accessible and shows green status
- [ ] No red errors in browser console
- [ ] Supabase project is active and accessible
- [ ] `_redirects` file exists and is correct
- [ ] Assets are loading correctly (check Network tab)
- [ ] Works locally with `npm run preview`
- [ ] Hosting platform configuration is correct

## 🔍 Debug Commands

Run these to gather information:

```bash
# Check if build works
npm run build

# Test production build locally
npm run preview

# Check for any dependency issues
npm audit

# Verify all files are in dist
ls -la dist/
```

Remember: The diagnostic page at `/diagnostic` is your best friend for identifying the exact cause of deployment issues!