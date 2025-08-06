# CORS Fix Guide for Supabase Storage Images

## Problem
Your images are failing to load due to CORS (Cross-Origin Resource Sharing) errors from Supabase storage. The error messages show:
- Status code: 307 (redirect)
- Status code: 204 (no content) 
- Status code: null (CORS request did not succeed)

## Root Cause
The Supabase storage buckets are not properly configured to allow cross-origin requests from your domain (`https://ufsbd34.fr`).

## Solutions

### Solution 1: Configure CORS in Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Configure Storage CORS Settings**
   - Go to Storage > Settings
   - Find the CORS configuration section
   - Add the following configuration:

```json
{
  "allowedOrigins": [
    "https://ufsbd34.fr",
    "https://www.ufsbd34.fr",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4173"
  ],
  "allowedMethods": ["GET", "HEAD", "OPTIONS"],
  "allowedHeaders": [
    "Accept",
    "Accept-Language", 
    "Content-Language",
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Origin",
    "Referer",
    "User-Agent"
  ],
  "maxAge": 86400,
  "credentials": false
}
```

3. **Apply to both buckets**
   - Apply this configuration to both `gallery` and `gallery-staging` buckets
   - Save the settings

### Solution 2: Run SQL Script (Alternative)

If the dashboard method doesn't work, run the SQL script:

1. Go to Supabase Dashboard > SQL Editor
2. Run the contents of `fix-supabase-cors.sql`
3. This will configure the buckets and policies

### Solution 3: Temporary Proxy Solution (Immediate Fix)

I've implemented a temporary proxy solution that bypasses CORS issues:

1. **New Components Added:**
   - `CORSProxyImage.tsx` - Image component that uses proxy
   - `vite-proxy-plugin.ts` - Vite plugin for proxy API
   - Updated `PendingPosts.tsx` to use the proxy

2. **How it works:**
   - Images are proxied through `/api/proxy-image?url=...`
   - The proxy fetches images server-side, avoiding CORS
   - Proper caching and error handling included

3. **Testing the fix:**
   - Restart your development server
   - Check the admin pending page
   - Images should now load without CORS errors

## Verification Steps

### 1. Test CORS Configuration
```bash
# Test if CORS is working
curl -H "Origin: https://ufsbd34.fr" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Accept" \
     -X OPTIONS \
     "https://supabase.co/storage/v1/object/public/gallery/test-image.jpg"
```

### 2. Check Browser Console
- Open browser dev tools
- Go to Network tab
- Load the admin pending page
- Look for successful image requests (200 status)
- No more CORS errors should appear

### 3. Test Image Loading
- Navigate to `/admin/pending`
- Images should load immediately
- No loading spinners or error messages
- Console should show "CORS Proxy image loaded successfully"

## Troubleshooting

### If images still don't load:

1. **Check Supabase Storage Settings**
   - Verify buckets are public
   - Check file permissions
   - Ensure CORS is properly configured

2. **Test with different browsers**
   - Chrome, Firefox, Safari
   - Check if issue is browser-specific

3. **Check network requests**
   - Open browser dev tools
   - Look for failed requests
   - Check response headers

4. **Verify proxy is working**
   - Test `/api/proxy-image?url=https://example.com/image.jpg`
   - Should return the image

### If you see proxy errors:

1. **Check Vite plugin**
   - Ensure `vite-proxy-plugin.ts` is loaded
   - Restart development server

2. **Check image URLs**
   - Verify URLs are valid
   - Check if images exist in Supabase storage

## Long-term Solution

Once CORS is properly configured in Supabase:

1. **Remove proxy components**
   - Replace `CORSProxyImage` with regular `ClientImage`
   - Remove `vite-proxy-plugin.ts`
   - Update `PendingPosts.tsx` to use original components

2. **Optimize image loading**
   - Use proper image optimization
   - Implement lazy loading
   - Add proper error handling

## Files Modified

- ✅ `src/components/CORSProxyImage.tsx` - New proxy image component
- ✅ `src/pages/admin/PendingPosts.tsx` - Updated to use proxy
- ✅ `vite-proxy-plugin.ts` - Vite plugin for proxy API
- ✅ `vite.config.ts` - Added proxy plugin
- ✅ `fix-supabase-cors.sql` - SQL script for CORS configuration
- ✅ `configure-supabase-cors.js` - Dashboard configuration script

## Next Steps

1. **Immediate**: Test the proxy solution
2. **Short-term**: Configure CORS in Supabase dashboard
3. **Long-term**: Remove proxy and use direct image loading

The proxy solution should work immediately while you configure the proper CORS settings in Supabase.