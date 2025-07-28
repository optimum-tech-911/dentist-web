// Email testing utilities for browser console
import { testEmailToMyself } from './emailService';

// Global function to test email sending from browser console
export const testEmailSending = async (email: string = 'test@example.com') => {
  console.log('🧪 Testing email sending...');
  console.log(`📧 Target email: ${email}`);
  
  try {
    const result = await testEmailToMyself();
    
    if (result.success) {
      console.log('✅ Email test successful!');
      console.log('📧 Check your email inbox (and spam folder)');
      console.log('📧 You should receive a test email from UFSBD34');
    } else {
      console.error('❌ Email test failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Email test error:', error);
    return { success: false, error: 'Test failed' };
  }
};

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testEmailSending = testEmailSending;
  (window as any).testEmailToMyself = testEmailToMyself;
}