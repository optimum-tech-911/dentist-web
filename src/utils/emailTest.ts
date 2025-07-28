// Test email sending with Resend
import { sendRealEmail } from './emailService';
import { createOTPEmailTemplate, createPlainTextOTPEmail } from './emailTemplates';

export const testEmailSending = async (testEmail: string) => {
  try {
    console.log('🧪 Testing email sending with Resend...');
    console.log(`Test email: ${testEmail}`);
    
    // Generate test OTP
    const testOTP = '123456';
    
    // Create email content
    const subject = 'Test Email - UFSBD34 OTP';
    const htmlContent = createOTPEmailTemplate(testOTP, testEmail);
    const textContent = createPlainTextOTPEmail(testOTP, testEmail);
    
    console.log('📧 Sending test email...');
    
    // Send the email
    const result = await sendRealEmail({
      to: testEmail,
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent
    });
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Check your email inbox for the test email');
      console.log(`📧 OTP Code: ${testOTP}`);
      return true;
    } else {
      console.error('❌ Test email failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Test email error:', error);
    return false;
  }
};

// Test function that can be called from browser console
(window as any).testEmailSending = testEmailSending;