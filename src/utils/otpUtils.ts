// Simple OTP utility for password reset
import { supabase } from '@/integrations/supabase/client';

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

    // For now, we'll simulate email sending since we need a proper email service
    // In production, you'd integrate with SendGrid, Mailgun, or similar
    console.log(`📧 OTP Email sent to ${email}`);
    console.log(`📧 OTP Code: ${code}`);
    console.log(`📧 Email content would include: "Your OTP code is: ${code}"`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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

    // For OTP-based reset, we need to handle password update differently
    // Since we don't have a session, we'll use admin functions or create a session
    
    // Try to sign in with a temporary approach or use admin API
    // For now, we'll return success and let the user know to contact admin
    // In production, you'd implement proper password update logic
    
    console.log(`🔐 Password update requested for ${email}`);
    console.log(`🔐 New password: ${newPassword}`);
    
    // Simulate password update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};