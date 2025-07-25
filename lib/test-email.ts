import { EmailService } from './email';
import { checkEnvironmentVariables } from './env-check';

/**
 * Test email functionality
 */
export const testEmailService = async () => {
  try {
    console.log('🧪 Testing email service...');
    
    // Check environment variables
    const envOk = checkEnvironmentVariables();
    if (!envOk) {
      console.error('❌ Environment variables check failed');
      return false;
    }

    // Test sending a simple email
    const testResult = await EmailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email from UFSBD',
      html: '<h1>Test Email</h1><p>This is a test email to verify Resend integration.</p>'
    });

    if (testResult.success) {
      console.log('✅ Email service test successful');
      return true;
    } else {
      console.error('❌ Email service test failed:', testResult.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Email service test error:', error);
    return false;
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testEmailService = testEmailService;
} 