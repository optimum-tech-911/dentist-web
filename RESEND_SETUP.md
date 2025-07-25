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

If emails are not being sent:

1. Check that your Resend API key is correct
2. Verify your domain is properly configured in Resend
3. Check the browser console for any error messages
4. Verify the environment variables are loaded correctly

## 9. Migration from Mailjet

The migration is complete! Your application now uses Resend instead of Mailjet for all email functionality. 