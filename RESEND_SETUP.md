# Resend Email Setup Guide

This guide will help you set up Resend as your email provider to replace Mailjet.

## 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and create an account
2. Navigate to the API Keys section
3. Create a new API key
4. Copy the API key (it starts with `re_`)

## 2. Environment Variables

Add the following environment variable to your `.env` file:

```env
VITE_RESEND_API_KEY=re_your_api_key_here
```

## 3. Supabase Configuration

The Supabase configuration has been updated to use Resend's SMTP settings. Make sure to set the environment variable in your Supabase project:

```env
RESEND_API_KEY=re_your_api_key_here
```

## 4. Domain Verification

1. In your Resend dashboard, go to the Domains section
2. Add your domain (e.g., `ufsbd.fr`)
3. Follow the DNS verification steps
4. Once verified, you can send emails from `ufsbd34@ufsbd.fr`

## 5. Features Implemented

- ✅ Password reset emails
- ✅ Contact form notifications
- ✅ Welcome emails for new users
- ✅ Professional email templates in French
- ✅ Error handling and logging

## 6. Testing

To test the email functionality:

1. Try the "Forgot Password" feature on the login page
2. Submit a contact form
3. Check your Resend dashboard for email delivery status

## 7. Email Templates

The following email templates have been created:

- **Password Reset**: Professional template with UFSBD branding
- **Contact Notification**: Formatted notification for contact submissions
- **Welcome Email**: Welcome message for new users

All templates are in French and include proper UFSBD branding.

## 8. Troubleshooting

### Common Issues:

#### "Missing API key" Error
If you see this error: `Missing API key. Pass it to the constructor new Resend("re_123")`

1. **Check your .env file** - Make sure you have:
   ```env
   VITE_RESEND_API_KEY=re_your_actual_api_key_here
   ```

2. **Restart your development server** after adding the environment variable:
   ```bash
   npm run dev
   ```

3. **Check browser console** - The app will now show environment variable status in development mode

4. **Test the setup** - Open browser console and run:
   ```javascript
   testEmailService()
   ```

#### Environment Variables Not Loading
- Make sure your `.env` file is in the root directory (same level as `package.json`)
- Ensure the file is named exactly `.env` (not `.env.local` or `.env.example`)
- Restart your development server after making changes

#### API Key Format
- Resend API keys start with `re_`
- Make sure there are no extra spaces or quotes around the key

#### Domain Verification
- You must verify your domain in Resend before sending emails
- For testing, you can use Resend's sandbox domain temporarily

## 9. Migration from Mailjet

The migration is complete! Your application now uses Resend instead of Mailjet for all email functionality. 