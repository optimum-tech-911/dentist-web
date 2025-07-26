# Deployment Debugging Guide

If you're seeing a white page after deployment, follow these steps to diagnose and fix the issue.

## 1. Check Browser Console

1. Open your deployed site
2. Press F12 to open Developer Tools
3. Go to the Console tab
4. Look for any error messages (red text)

## 2. Common Issues and Solutions

### Environment Variables Missing
**Error**: `VITE_RESEND_API_KEY is not set` or similar
**Solution**: 
- Add environment variables to your hosting platform
- For Vercel: Go to Project Settings → Environment Variables
- For Netlify: Go to Site Settings → Environment Variables

### Supabase Connection Issues
**Error**: Supabase connection errors
**Solution**:
- Check if your Supabase URL and API key are correct
- Verify your Supabase project is active
- Check if your database is accessible

### Build Issues
**Error**: JavaScript errors in console
**Solution**:
- Run `npm run build` locally to check for build errors
- Check if all dependencies are installed: `npm install`

## 3. Quick Fixes

### Option 1: Disable Email Service Temporarily
If the issue is with Resend API, you can temporarily disable it:

1. Comment out the email service import in `src/hooks/useAuth.tsx`
2. Comment out the email service import in `src/components/ContactForm.tsx`
3. Rebuild and deploy

### Option 2: Check Network Tab
1. Open Developer Tools → Network tab
2. Refresh the page
3. Look for failed requests (red entries)
4. Check if any resources are failing to load

### Option 3: Test Locally
1. Run `npm run dev` locally
2. Check if the same issue occurs
3. If it works locally, the issue is with deployment configuration

## 4. Environment Variables Checklist

Make sure these are set in your hosting platform:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=re_your_resend_api_key
```

## 5. Hosting Platform Specific

### Vercel
- Check Function Logs in Vercel Dashboard
- Verify environment variables are set correctly
- Check if the build is successful

### Netlify
- Check Deploy Logs in Netlify Dashboard
- Verify environment variables in Site Settings
- Check if the build is successful

### Other Platforms
- Check the platform's error logs
- Verify environment variables are set
- Check if the build process completed successfully

## 6. Emergency Fallback

If you need to get the site working immediately:

1. Comment out the Resend email functionality
2. Use a simple fallback for password reset
3. Deploy without email features
4. Fix email issues later

## 7. Contact Support

If none of the above works:
1. Check the browser console for specific error messages
2. Note down the exact error text
3. Check your hosting platform's logs
4. Contact your hosting provider's support

## 8. Testing Checklist

- [ ] Site loads without white screen
- [ ] Navigation works
- [ ] Authentication works
- [ ] Blog posts load
- [ ] Contact form works
- [ ] Admin panel accessible (if applicable) 