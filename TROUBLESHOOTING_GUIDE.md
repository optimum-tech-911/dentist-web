# Troubleshooting Guide

## Admin Dashboard Visibility Issues

### 1. Check User Role in Supabase
1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Find your user account
4. Check if the user has a role assigned in the `users` table
5. If no role is assigned, manually set it to 'admin'

### 2. Database Role Assignment
Run this SQL in your Supabase SQL editor to assign admin role:

```sql
-- Check if user exists in users table
SELECT * FROM users WHERE email = 'your-email@example.com';

-- If user doesn't exist, create entry
INSERT INTO users (id, email, role) 
VALUES ('your-user-id', 'your-email@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Verify the role was set
SELECT email, role FROM users WHERE email = 'your-email@example.com';
```

### 3. Browser Console Debugging
1. Open browser developer tools (F12)
2. Go to Console tab
3. Navigate to `/admin`
4. Look for these log messages:
   - `🛡️ ProtectedRoute check:` - Shows authentication status
   - `🔍 Checking role access:` - Shows role verification
   - `✅ Access granted` - Success message
   - `❌ Role not allowed` - Access denied

### 4. Common Issues and Solutions

#### Issue: User authenticated but no role assigned
**Solution:** The user exists in auth but not in the users table. The system should auto-create with 'viewer' role, but you need to manually update to 'admin'.

#### Issue: Role exists but access still denied
**Solution:** Check browser console for role mismatch. Ensure the role in database exactly matches 'admin' (case-sensitive).

#### Issue: Loading state stuck
**Solution:** Check network connectivity to Supabase. The auth system has fallbacks but may timeout.

## SEO and Google Indexing Issues

### 1. Immediate Actions

#### Submit Sitemap to Google
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property if not already added
3. Go to Sitemaps section
4. Submit: `https://ufsbd34.fr/sitemap.xml`

#### Request Indexing
1. In Google Search Console, use "URL Inspection"
2. Enter your domain: `https://ufsbd34.fr`
3. Click "Request Indexing"

### 2. Technical SEO Checks

#### Verify robots.txt
- Visit: `https://ufsbd34.fr/robots.txt`
- Should show: `User-agent: *` and `Allow: /`

#### Verify sitemap
- Visit: `https://ufsbd34.fr/sitemap.xml`
- Should show XML with your URLs

#### Check meta tags
- View page source
- Look for proper title, description, and Open Graph tags

### 3. Performance Issues

#### Check Core Web Vitals
1. Use [Google PageSpeed Insights](https://pagespeed.web.dev/)
2. Enter your domain
3. Check for performance issues

#### Common Performance Fixes
- Optimize images
- Minimize JavaScript
- Use CDN for static assets
- Enable compression

### 4. Cloudflare Settings

#### Check Cloudflare Configuration
1. Ensure "Always Online" is enabled
2. Check if any security rules are blocking Googlebot
3. Verify SSL/TLS settings
4. Check if any page rules are interfering

#### Recommended Cloudflare Settings
```
SSL/TLS: Full (strict)
Always Use HTTPS: On
Auto Minify: JavaScript, CSS, HTML
Brotli: On
Early Hints: On
```

### 5. Monitoring and Testing

#### Set up Google Analytics
- Verify tracking code is working
- Check for any blocking issues

#### Test with Google's Tools
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Structured Data Testing Tool](https://search.google.com/structured-data/testing-tool)

## Debugging Steps

### For Admin Dashboard:
1. Clear browser cache and cookies
2. Try incognito/private browsing
3. Check browser console for errors
4. Verify Supabase connection
5. Test with different browsers

### For SEO:
1. Check if site is accessible via direct URL
2. Test with different devices/locations
3. Use Google's "site:" operator: `site:ufsbd34.fr`
4. Check for any manual penalties in Search Console
5. Verify DNS and hosting stability

## Emergency Fixes

### If Admin Dashboard Still Not Working:
1. Temporarily bypass role check (for testing only)
2. Check Supabase logs for errors
3. Verify environment variables
4. Test with a fresh user account

### If Site Still Not Indexed:
1. Submit to Bing Webmaster Tools as well
2. Check for any security headers blocking crawlers
3. Verify site is not accidentally noindexed
4. Consider temporary removal of any blocking scripts

## Contact Information
- Supabase Support: Check your project dashboard
- Google Search Console: For indexing issues
- Cloudflare Support: For CDN/performance issues