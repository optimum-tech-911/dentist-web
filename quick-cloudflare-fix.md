# Quick Cloudflare Fix for CORS Issues

## Immediate Fix (5 minutes)

### Step 1: Access Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Select your domain: `ufsbd34.fr`

### Step 2: Disable Security Features Temporarily
1. Go to **Security** > **Settings**
2. Change these settings:
   - **Security Level**: Set to "Medium" or "Low"
   - **Browser Integrity Check**: Turn OFF
   - **Always Use HTTPS**: Keep ON
3. Click **Save**

### Step 3: Clear Cache
1. Go to **Caching** > **Configuration**
2. Click **"Purge Everything"**
3. Wait 1-2 minutes

### Step 4: Test
1. Open your admin page
2. Check browser console
3. Images should now load without CORS errors

## If That Doesn't Work

### Alternative: Create Page Rule
1. Go to **Rules** > **Page Rules**
2. Click **"Create Page Rule"**
3. Set:
   - **URL**: `*supabase.co/*`
   - **Settings**:
     - Security Level: Medium
     - Browser Integrity Check: Off
4. Click **Save and Deploy**

### Alternative: Use Cloudflare Workers
1. Go to **Workers & Pages**
2. Create a new worker
3. Use this code:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // If it's a Supabase image request
  if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.com')) {
    const response = await fetch(request)
    const newResponse = new Response(response.body, response)
    
    // Add CORS headers
    newResponse.headers.set('Access-Control-Allow-Origin', '*')
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    newResponse.headers.set('Access-Control-Allow-Headers', 'Accept, Content-Type')
    
    return newResponse
  }
  
  return fetch(request)
}
```

## Verification

After making changes:
- ✅ No CORS errors in browser console
- ✅ Images load with 200 status
- ✅ No more "Cross-Origin Request Blocked" messages

## If Still Not Working

1. **Check if Cloudflare is enabled** for your domain
2. **Try bypassing Cloudflare** temporarily (set DNS to direct)
3. **Check Supabase storage** - ensure images are public
4. **Test in incognito mode** - clear browser cache

The Cloudflare security settings are likely blocking the cross-origin requests to Supabase. Disabling them temporarily should fix the issue immediately.