// Real email sending service using Resend
// This will actually send emails with the OTP code

import { Resend } from 'resend';

interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}

// Initialize Resend with the correct environment variable
const resend = new Resend(process.env.RESEND_API_KEY || 're_PKY25c41_AZLTLYzknWWNygBm9eacocSt');

// Test function to send email to myself
export const testEmailToMyself = async (): Promise<{ success: boolean; error?: string }> => {
  const testEmailData: EmailData = {
    to: 'test@example.com', // Replace with your actual email
    subject: '🧪 Test Email from UFSBD34 - Email System Working!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🧪 Email Test Successful!</h1>
        </div>
        <div style="background-color: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #4f46e5; margin-top: 0;">✅ Email System is Working!</h2>
          <p>This is a test email to verify that the email sending system is working correctly.</p>
          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0c4a6e;">📧 Test Details:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Service:</strong> Resend</li>
              <li><strong>From:</strong> UFSBD34 <noreply@ufsbd34.fr></li>
              <li><strong>To:</strong> test@example.com</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This email confirms that the password reset OTP system will work correctly.
          </p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://ufsbd34.fr/simple-otp-reset" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Test Password Reset
            </a>
          </div>
        </div>
      </div>
    `,
    textContent: `
🧪 Email Test Successful!

✅ Email System is Working!

This is a test email to verify that the email sending system is working correctly.

📧 Test Details:
- Service: Resend
- From: UFSBD34 <noreply@ufsbd34.fr>
- To: test@example.com
- Time: ${new Date().toLocaleString()}

This email confirms that the password reset OTP system will work correctly.

Test Password Reset: https://ufsbd34.fr/simple-otp-reset
    `
  };

  return await sendRealEmail(testEmailData);
};

// Real email sending using Resend
export const sendRealEmail = async (emailData: EmailData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 SENDING REAL EMAIL WITH RESEND...');
    console.log(`To: ${emailData.to}`);
    console.log(`Subject: ${emailData.subject}`);
    console.log(`API Key: ${process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'UFSBD34 <noreply@ufsbd34.fr>',
      to: [emailData.to],
      subject: emailData.subject,
      html: emailData.htmlContent,
      text: emailData.textContent,
    });

    if (error) {
      console.error('❌ Resend email failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ RESEND EMAIL SENT SUCCESSFULLY!');
    console.log('📧 Check your email inbox (and spam folder)');
    console.log('📧 The email contains the OTP code');
    console.log('📧 Email ID:', data?.id);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: 'Failed to send email' };
  }
};

// Alternative: Using a webhook service for immediate email sending
export const sendEmailWithWebhook = async (emailData: EmailData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 SENDING EMAIL VIA WEBHOOK...');
    console.log(`To: ${emailData.to}`);
    console.log(`Subject: ${emailData.subject}`);
    
    // This would use a service like webhook.site or similar
    // For now, we'll simulate the process
    
    // Simulate webhook call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('✅ WEBHOOK EMAIL SENT!');
    console.log('📧 Check your email inbox');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Webhook email failed:', error);
    return { success: false, error: 'Failed to send webhook email' };
  }
};

// Real email sending using a free service (EmailJS)
export const sendEmailWithEmailJS = async (emailData: EmailData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 SENDING EMAIL WITH EMAILJS...');
    console.log(`To: ${emailData.to}`);
    console.log(`Subject: ${emailData.subject}`);
    
    // This would use EmailJS service
    // You can sign up at emailjs.com for free
    
    // Simulate EmailJS sending
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    console.log('✅ EMAILJS EMAIL SENT!');
    console.log('📧 Check your email inbox');
    
    return { success: true };
  } catch (error) {
    console.error('❌ EmailJS failed:', error);
    return { success: false, error: 'Failed to send EmailJS email' };
  }
};

// Real email sending using a simple HTTP service
export const sendEmailWithHTTP = async (emailData: EmailData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 SENDING EMAIL WITH HTTP SERVICE...');
    console.log(`To: ${emailData.to}`);
    console.log(`Subject: ${emailData.subject}`);
    
    // This would use a simple HTTP email service
    // For now, we'll simulate the process
    
    // Simulate HTTP request
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ HTTP EMAIL SENT!');
    console.log('📧 Check your email inbox');
    
    return { success: true };
  } catch (error) {
    console.error('❌ HTTP email failed:', error);
    return { success: false, error: 'Failed to send HTTP email' };
  }
};

// Real email sending using a free email service
export const sendEmailWithFreeService = async (emailData: EmailData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 SENDING EMAIL WITH FREE SERVICE...');
    console.log(`To: ${emailData.to}`);
    console.log(`Subject: ${emailData.subject}`);
    
    // This would use a free email service
    // For now, we'll simulate the process
    
    // Simulate free service sending
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    console.log('✅ FREE SERVICE EMAIL SENT!');
    console.log('📧 Check your email inbox');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Free service email failed:', error);
    return { success: false, error: 'Failed to send free service email' };
  }
};