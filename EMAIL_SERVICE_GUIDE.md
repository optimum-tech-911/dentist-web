# 📧 Email Service Setup & Troubleshooting Guide

## 🚨 IMPORTANT: This prevents white page errors!

The email service has been made **completely robust** to prevent application crashes. Here's how it works:

## 🔧 How the Email Service Works

### 1. **Robust Import System**
- Uses `require()` instead of ES6 imports to prevent module loading errors
- Wraps Resend initialization in try-catch blocks
- Falls back gracefully if Resend package is missing or API key is not configured

### 2. **Automatic Fallback**
- **Development Mode**: Logs emails to console instead of sending
- **Production Mode**: Returns error but doesn't crash the application
- **Always Available**: Email functions will always work, even without Resend

### 3. **Error Prevention**
- No more "Missing API key" errors that cause white pages
- Graceful degradation when email service is unavailable
- Application continues to function normally

## 📋 Setup Instructions

### **Option 1: Use Fallback (Recommended for Development)**
No setup required! The application will work immediately with console logging in development.

### **Option 2: Configure Resend (For Production)**

1. **Install Resend Package**
   ```bash
   npm install resend
   ```

2. **Get Resend API Key**
   - Sign up at [resend.com](https://resend.com)
   - Create an API key in your dashboard
   - Copy the API key (starts with `re_`)

3. **Set Environment Variable**
   Create or update your `.env` file:
   ```env
   VITE_RESEND_API_KEY=re_your_api_key_here
   ```

4. **Verify Domain (Required for Production)**
   - Add your domain in Resend dashboard
   - Verify domain ownership
   - Update sender email in `src/lib/email.ts`

## 🧪 Testing the Email Service

### **Development Testing**
1. Start the development server: `npm run dev`
2. Open browser console (F12)
3. Test email functions:
   ```javascript
   // Test password reset
   EmailService.sendPasswordResetEmail('test@example.com', 'https://example.com/reset')
   
   // Test contact form
   EmailService.sendContactNotification({
     name: 'Test User',
     email: 'test@example.com',
     phone: '123456789',
     message: 'Test message'
   })
   ```
4. Check console for email logs

### **Production Testing**
1. Deploy with Resend API key configured
2. Test actual email sending
3. Monitor Resend dashboard for delivery status

## 🛠️ Troubleshooting

### **White Page Issues**
If you see a white page, check:

1. **Browser Console (F12)**
   - Look for JavaScript errors
   - Check for "Missing API key" messages

2. **Environment Variables**
   ```bash
   # Check if variables are loaded
   echo $VITE_RESEND_API_KEY
   ```

3. **Package Installation**
   ```bash
   npm list resend
   ```

### **Email Not Sending**
1. **Check API Key**
   - Verify it starts with `re_`
   - Ensure it's not expired
   - Check Resend dashboard for errors

2. **Check Domain Verification**
   - Domain must be verified in Resend
   - Sender email must match verified domain

3. **Check Console Logs**
   - Look for error messages
   - Verify fallback is working

## 🔒 Security Best Practices

### **Environment Variables**
- Never commit API keys to version control
- Use `.env.local` for local development
- Use platform environment variables for production

### **Domain Verification**
- Always verify your domain in Resend
- Use verified domains for sender emails
- Monitor for unauthorized usage

## 📊 Monitoring

### **Development Monitoring**
- Check browser console for email logs
- Verify fallback service is working
- Test all email functions

### **Production Monitoring**
- Monitor Resend dashboard
- Check email delivery rates
- Set up error alerts

## 🚀 Deployment Checklist

### **Pre-Deployment**
- [ ] Resend API key configured
- [ ] Domain verified in Resend
- [ ] Environment variables set
- [ ] Email templates tested

### **Post-Deployment**
- [ ] Email functions working
- [ ] No console errors
- [ ] Emails being delivered
- [ ] Fallback working if needed

## 🔧 File Structure

```
src/lib/
├── email.ts              # Main email service (robust)
├── email-fallback.ts     # Fallback service
└── env-check.ts          # Environment validation
```

## 📞 Support

If you encounter issues:

1. **Check this guide first**
2. **Review browser console errors**
3. **Verify environment variables**
4. **Test with fallback service**

## ✅ Success Indicators

- ✅ Application loads without white page
- ✅ Email functions work in development (console logs)
- ✅ Email functions work in production (actual sending)
- ✅ No "Missing API key" errors
- ✅ Graceful fallback when Resend is unavailable

---

**Remember**: The email service is now **bulletproof** and will never cause your application to crash! 🛡️ 