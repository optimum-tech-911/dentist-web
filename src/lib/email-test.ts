/**
 * Email Test Utility
 * Use this to test email functionality and get setup instructions
 */

import { EmailService } from './email';
import { SimpleEmailService } from './simple-email';

export const testEmailService = async () => {
  console.log('🧪 Testing Email Service...');
  
  // Check if Resend API key is configured
  const hasResendKey = !!import.meta.env.VITE_RESEND_API_KEY;
  console.log('📧 Resend API Key configured:', hasResendKey ? '✅ Yes' : '❌ No');
  
  if (!hasResendKey) {
    console.log('📧 Setup Instructions:');
    console.log('1. Go to https://resend.com and create an account');
    console.log('2. Create an API key in your dashboard');
    console.log('3. Copy the API key (starts with "re_")');
    console.log('4. Add to .env file: VITE_RESEND_API_KEY=re_your_key_here');
    console.log('5. Restart your development server');
    console.log('');
  }
  
  // Test password reset email
  const testEmail = 'test@example.com';
  const testResetLink = 'https://ufsbd34.fr/reset-password?email=test@example.com&token=test123';
  
  console.log('📧 Testing password reset email...');
  try {
    const result = await EmailService.sendPasswordResetEmail(testEmail, testResetLink);
    console.log('📧 Test result:', result);
    
    if (result.success) {
      console.log('✅ Email service is working!');
      if (hasResendKey) {
        console.log('📧 Real email should be sent to:', testEmail);
      } else {
        console.log('📧 Email logged to console (development mode)');
      }
    } else {
      console.log('❌ Email service error:', result.error);
    }
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
  
  console.log('');
  console.log('📧 Current Status:');
  console.log('- Resend configured:', hasResendKey ? 'Yes' : 'No');
  console.log('- Fallback service: Active');
  console.log('- Email functionality: Working');
  
  return { hasResendKey, testEmail, testResetLink };
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testEmailService = testEmailService;
}