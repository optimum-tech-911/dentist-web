// Simple OTP utility for password reset
import { supabase } from '@/integrations/supabase/client';
import { createOTPEmailTemplate, createPlainTextOTPEmail } from './emailTemplates';
import { sendRealEmail } from './emailService';

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

export const sendOTPEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const code = generateOTP();
    storeOTP(email, code);

    // Create email content with OTP code
    const subject = 'Password Reset OTP - UFSBD34';
    const htmlContent = createOTPEmailTemplate(code, email);
    const textContent = createPlainTextOTPEmail(code, email);

    console.log(`🔐 Generated OTP: ${code} for ${email}`);

    // Send the email using real email service
    const result = await sendRealEmail({
      to: email,
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent
    });

    if (!result.success) {
      return { success: false, error: result.error || 'Failed to send email' };
    }

    // Log success
    console.log(`📧 REAL EMAIL SENT to ${email}`);
    console.log(`📧 OTP Code: ${code}`);
    console.log(`📧 Email contains the OTP code: ${code}`);
    console.log('📧 Check your email inbox and spam folder!');
    
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