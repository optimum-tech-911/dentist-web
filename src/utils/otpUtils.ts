// Simple OTP utility for password reset
import { supabase } from '@/integrations/supabase/client';
import { createOTPEmailTemplate, createPlainTextOTPEmail } from './emailTemplates';

// Store OTP codes in localStorage (for demo purposes)
// In production, you'd use a database table
const OTP_STORAGE_KEY = 'ufsbd_otp_codes';

interface OTPCode {
  email: string;
  code: string;
  expiresAt: string;
  used: boolean;
}

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (email: string, code: string): void => {
  const otpData: OTPCode = {
    email: email.toLowerCase(),
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    used: false
  };

  try {
    const existingOTPs = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '[]');
    // Remove old OTPs for this email
    const filteredOTPs = existingOTPs.filter((otp: OTPCode) => otp.email !== email.toLowerCase());
    filteredOTPs.push(otpData);
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(filteredOTPs));
  } catch (error) {
    console.error('Error storing OTP:', error);
  }
};

export const verifyOTP = (email: string, code: string): boolean => {
  try {
    const otps: OTPCode[] = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '[]');
    const otp = otps.find(o => 
      o.email === email.toLowerCase() && 
      o.code === code && 
      !o.used && 
      new Date(o.expiresAt) > new Date()
    );

    if (otp) {
      // Mark as used
      otp.used = true;
      localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

// Function to send email using a third-party service
const sendEmailWithService = async (to: string, subject: string, htmlContent: string, textContent: string) => {
  // For now, we'll use a simple approach that works with most email services
  // In production, you'd integrate with SendGrid, Mailgun, AWS SES, etc.
  
  try {
    // This is a placeholder for actual email service integration
    // You would replace this with your chosen email service
    
    // Example with SendGrid (you'd need to install @sendgrid/mail):
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: to,
      from: 'noreply@ufsbd34.fr',
      subject: subject,
      text: textContent,
      html: htmlContent,
    };
    
    await sgMail.send(msg);
    */
    
    // For development, we'll simulate the email sending
    console.log('📧 EMAIL SENT (Simulated):');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Content Length: ${htmlContent.length} characters`);
    console.log(`Text Content Length: ${textContent.length} characters`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Failed to send email' };
  }
};

export const sendOTPEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const code = generateOTP();
    storeOTP(email, code);

    // Create email content with OTP code
    const subject = 'Password Reset OTP - UFSBD34';
    const htmlContent = createOTPEmailTemplate(code, email);
    const textContent = createPlainTextOTPEmail(code, email);

    // Send the email
    const result = await sendEmailWithService(email, subject, htmlContent, textContent);

    if (!result.success) {
      return { success: false, error: result.error || 'Failed to send email' };
    }

    // For development, also log the OTP to console
    console.log(`📧 REAL EMAIL SENT to ${email}`);
    console.log(`📧 OTP Code: ${code}`);
    console.log(`📧 Email contains the OTP code: ${code}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error in sendOTPEmail:', error);
    return { success: false, error: 'Failed to send OTP email' };
  }
};

export const updatePasswordWithOTP = async (email: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user exists
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !users) {
      return { success: false, error: 'User not found' };
    }

    // Get current session (should be available after clicking reset link)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
    }

    if (!session) {
      // If no session, the user needs to click the reset link from email
      return { 
        success: false, 
        error: 'No active session. Please click the reset link from your email first.' 
      };
    }

    // Update password using the current session
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};