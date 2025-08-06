# Cloudflare CORS Fix Guide

## Problem
Your images are failing due to CORS errors, likely caused by Cloudflare's security settings blocking cross-origin requests to Supabase.

## Solution: Configure Cloudflare Settings

### Step 1: Access Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Select your domain (ufsbd34.fr)
3. Navigate to the appropriate section

### Step 2: Configure Security Settings

#### Option A: Disable Security Features Temporarily
1. Go to **Security** > **Settings**
2. Look for these settings and adjust them:
   - **Security Level**: Set to "Medium" or "Low" temporarily
   - **Browser Integrity Check**: Disable
   - **Always Use HTTPS**: Keep enabled
   - **TLS 1.3**: Keep enabled

#### Option B: Configure Page Rules
1. Go to **Rules** > **Page Rules**
2. Create a new page rule for Supabase URLs:
   ```
   URL Pattern: *supabase.co/*
   Settings:
   - Security Level: Medium
   - Browser Integrity Check: Off
   - Always Use HTTPS: On
   ```

#### Option C: Configure Firewall Rules
1. Go to **Security** > **WAF** (Web Application Firewall)
2. Create a custom rule:
   ```
   Rule Name: Allow Supabase Images
   Field: URI Path
   Operator: contains
   Value: supabase.co
   Action: Allow
   ```

### Step 3: Configure CORS Headers

#### Option A: Using Page Rules
1. Go to **Rules** > **Page Rules**
2. Create a page rule for your domain:
   ```
   URL Pattern: https://ufsbd34.fr/*
   Settings:
   - Custom Cache Key: Include all query string parameters
   - Cache Level: Cache Everything
   - Edge Cache TTL: 4 hours
   ```

#### Option B: Using Transform Rules
1. Go to **Rules** > **Transform Rules**
2. Create a new rule:
   ```
   Rule Name: Add CORS Headers
   When incoming requests match:
   - Field: URI Path
   - Operator: contains
   - Value: supabase.co
   
   Then:
   - Set static response
   - Add header: Access-Control-Allow-Origin: *
   - Add header: Access-Control-Allow-Methods: GET, HEAD, OPTIONS
   - Add header: Access-Control-Allow-Headers: Accept, Content-Type
   ```

### Step 4: Configure Workers (Advanced)

If the above doesn't work, create a Cloudflare Worker:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Check if this is a request to Supabase
  if (request.url.includes('supabase.co') || request.url.includes('supabase.com')) {
    // Clone the request
    const modifiedRequest = new Request(request, {
      headers: {
        ...request.headers,
        'Origin': 'https://ufsbd34.fr',
        'Referer': 'https://ufsbd34.fr/'
      }
    })
    
    // Fetch from Supabase
    const response = await fetch(modifiedRequest)
    
    // Add CORS headers
    const modifiedResponse = new Response(response.body, response)
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*')
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Accept, Content-Type')
    
    return modifiedResponse
  }
  
  // For other requests, pass through
  return fetch(request)
}
```

### Step 5: Check SSL/TLS Settings

1. Go to **SSL/TLS** > **Overview**
2. Ensure these settings:
   - **Encryption Mode**: Full (strict)
   - **Always Use HTTPS**: On
   - **Minimum TLS Version**: 1.2
   - **Opportunistic Encryption**: On

### Step 6: Configure Cache Settings

1. Go to **Caching** > **Configuration**
2. Set these options:
   - **Cache Level**: Standard
   - **Edge Cache TTL**: 4 hours
   - **Browser Cache TTL**: 4 hours

### Step 7: Test the Fix

After making changes:

1. **Clear Cloudflare Cache:**
   - Go to **Caching** > **Configuration**
   - Click "Purge Everything"

2. **Test in Browser:**
   - Open browser dev tools
   - Go to Network tab
   - Load your admin page
   - Check for CORS errors

3. **Test with curl:**
```bash
curl -H "Origin: https://ufsbd34.fr" \
     -H "Referer: https://ufsbd34.fr/" \
     -I "https://supabase.co/storage/v1/object/public/gallery/your-image.jpg"
```

## Quick Fix: Disable Security Features Temporarily

If you want a quick fix to test:

1. Go to **Security** > **Settings**
2. Set **Security Level** to "Medium"
3. Disable **Browser Integrity Check**
4. Save and test

## Alternative: Use Cloudflare Workers

Create a simple worker to proxy images:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Check if this is an image request
  if (url.pathname.startsWith('/api/proxy-image')) {
    const targetUrl = url.searchParams.get('url')
    
    if (targetUrl) {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/*'
        }
      })
      
      const newResponse = new Response(response.body, response)
      newResponse.headers.set('Access-Control-Allow-Origin', '*')
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
      
      return newResponse
    }
  }
  
  return fetch(request)
}
```

## Verification

After making changes:

1. **Check browser console** - No more CORS errors
2. **Check network tab** - Images loading with 200 status
3. **Test image loading** - Images should appear immediately

## If Still Not Working

1. **Check Supabase settings** - Ensure buckets are public
2. **Check image URLs** - Verify they're accessible
3. **Try different browsers** - Test in Chrome, Firefox, Safari
4. **Check Cloudflare logs** - Look for blocked requests

The Cloudflare settings should resolve the CORS issues you're experiencing.