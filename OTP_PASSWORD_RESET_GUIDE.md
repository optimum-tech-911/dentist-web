# OTP Password Reset System Guide

## 🚀 Overview

This project implements a secure OTP (One-Time Password) based password reset system that sends verification codes via email. Unlike traditional email link-based resets, this system uses 6-digit codes for enhanced security and better user experience.

## ✨ Features

### 🔐 Security Features
- **6-digit OTP codes** - Easy to enter, hard to guess
- **10-minute expiration** - Prevents code replay attacks
- **Rate limiting** - 2-minute cooldown between requests
- **Attempt limiting** - Maximum 3 attempts per OTP
- **Automatic cleanup** - Expired codes are properly invalidated

### 📧 Email Integration
- **Professional templates** - Beautiful HTML emails
- **Resend API** - Reliable email delivery
- **Multi-format** - Both HTML and plain text versions
- **Branded emails** - UFSBD Hérault styling

### 🎨 User Experience
- **3-step flow** - Email → OTP → New Password
- **Real-time validation** - Immediate feedback
- **Timer display** - Shows remaining time
- **Responsive design** - Works on all devices
- **Accessibility** - Screen reader friendly

## 🏗️ Architecture

### Database Schema
```sql
-- OTP password reset table
CREATE TABLE otp_password_reset (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3
);
```

### Database Functions
1. **`generate_password_reset_otp(email)`** - Creates new OTP
2. **`verify_otp_code(email, otp)`** - Validates OTP
3. **`verify_otp_and_reset_password(email, otp, password)`** - Resets password

### API Endpoints
- **`/functions/v1/otp-password-reset`** - OTP generation and email sending
- **Frontend: `/otp-reset-password`** - User interface

## 📋 Setup Instructions

### Prerequisites
- Supabase project
- Resend API account
- Node.js 18+
- Supabase CLI

### Quick Setup
```bash
# 1. Deploy everything automatically
./deploy-otp-reset.sh

# 2. Or run manual setup:
supabase db push                              # Deploy migration
supabase functions deploy otp-password-reset  # Deploy function
npm run build                                 # Build frontend
node test-otp-password-reset.mjs              # Test system
```

### Manual Configuration

#### 1. Database Migration
Run the SQL migration:
```bash
supabase db push
```

Or manually execute: `supabase/migrations/20250115_create_otp_password_reset.sql`

#### 2. Edge Function
Deploy the OTP function:
```bash
supabase functions deploy otp-password-reset
```

#### 3. Environment Variables
Add to your Edge Function environment:
```bash
RESEND_API_KEY=your_resend_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 4. Frontend Integration
The system is automatically integrated into your React app via the route `/otp-reset-password`.

## 🧪 Testing

### Automated Testing
```bash
# Run comprehensive test suite
node test-otp-password-reset.mjs
```

The test suite validates:
- ✅ Database setup and migrations
- ✅ OTP generation and expiration
- ✅ Email sending functionality
- ✅ OTP verification process
- ✅ Password reset completion
- ✅ Security features (rate limiting, attempts)

### Manual Testing
1. Go to `/otp-reset-password`
2. Enter your email address
3. Check your email for the OTP code
4. Enter the 6-digit code
5. Set your new password
6. Login with the new password

### Test Results Example
```
🧪 OTP PASSWORD RESET TEST REPORT
============================================

📊 Summary:
   Total Tests: 7
   Passed: 7
   Failed: 0
   Success Rate: 100.0%

📋 Test Results:
   ✅ databaseSetup
   ✅ userCreation
   ✅ otpGeneration
   ✅ emailSending
   ✅ otpVerification
   ✅ passwordReset
   ✅ emailDelivery
```

## 🔧 Configuration

### Email Templates
Edit `supabase/functions/otp-password-reset/index.ts` to customize:
- Email styling
- Company branding
- Message content
- OTP format

### Security Settings
Modify the database functions to adjust:
- OTP expiration time (default: 10 minutes)
- Attempt limits (default: 3 attempts)
- Rate limiting (default: 2-minute cooldown)
- OTP length (default: 6 digits)

### UI Customization
Update `src/pages/OTPPasswordReset.tsx` for:
- Visual styling
- Step flow
- Validation messages
- Timer display

## 🛡️ Security Considerations

### Implemented Protections
- **Time-based expiration** - Codes expire automatically
- **Attempt limiting** - Prevents brute force attacks
- **Rate limiting** - Prevents spam attacks
- **Single use** - Each OTP can only be used once
- **Secure generation** - Cryptographically random codes

### Best Practices
- OTP codes are never logged in plaintext
- Database functions use security definer
- Row-level security policies in place
- HTTPS required for all communications

## 📊 Monitoring

### Database Queries
```sql
-- Check recent OTP activity
SELECT user_email, created_at, used, attempts 
FROM otp_password_reset 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- Check success rates
SELECT 
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE used = true) as successful_resets,
    ROUND(COUNT(*) FILTER (WHERE used = true) * 100.0 / COUNT(*), 2) as success_rate
FROM otp_password_reset 
WHERE created_at > NOW() - INTERVAL '7 days';
```

### Edge Function Logs
```bash
# View function logs
supabase functions logs otp-password-reset

# Follow logs in real-time
supabase functions logs otp-password-reset --follow
```

## 🐛 Troubleshooting

### Common Issues

#### "OTP table not found"
**Solution:** Run the database migration
```bash
supabase db push
```

#### "Edge function failed"
**Solutions:**
1. Check Resend API key
2. Verify function deployment
3. Check function logs

#### "Email not received"
**Solutions:**
1. Check spam folder
2. Verify email domain
3. Check Resend dashboard
4. Test with different email

#### "OTP verification failed"
**Solutions:**
1. Check if OTP expired (10 minutes)
2. Verify correct email/OTP combination
3. Check attempt limits (max 3)
4. Try requesting new OTP

### Debug Mode
Enable debug logging by setting `import.meta.env.DEV = true` in your environment.

## 🚀 Production Deployment

### Pre-deployment Checklist
- [ ] Database migration deployed
- [ ] Edge function deployed
- [ ] Email domain verified
- [ ] Test suite passing
- [ ] Environment variables set
- [ ] SSL certificates valid

### Performance Optimization
- OTP table is automatically indexed
- Rate limiting prevents abuse
- Email templates are optimized
- Database functions are efficient

### Monitoring Setup
- Set up alerts for failed OTP requests
- Monitor email delivery rates
- Track password reset success rates
- Watch for suspicious activity patterns

## 📞 Support

### Getting Help
1. **Run tests first:** `node test-otp-password-reset.mjs`
2. **Check logs:** `supabase functions logs otp-password-reset`
3. **Verify configuration:** Database and email settings
4. **Review this guide:** Ensure all steps completed

### Common Commands
```bash
# Full deployment
./deploy-otp-reset.sh

# Test only
node test-otp-password-reset.mjs

# Deploy function only
supabase functions deploy otp-password-reset

# Deploy database only
supabase db push

# Check logs
supabase functions logs otp-password-reset
```

---

## 🎉 Success!

If all tests pass, your OTP password reset system is ready! Users can now securely reset their passwords using the `/otp-reset-password` page.

The system provides enterprise-grade security with an excellent user experience. 🚀