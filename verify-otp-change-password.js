#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cmcfeiskfdbsefzqywbk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Get OTP from command line argument
const otpCode = process.argv[2];

if (!otpCode) {
  console.log('❌ Please provide OTP code as argument');
  console.log('Usage: node verify-otp-change-password.js YOUR_OTP_CODE');
  console.log('Example: node verify-otp-change-password.js 123456');
  process.exit(1);
}

console.log('🔐 OTP Verification & Password Change Test');
console.log('=========================================');
console.log('📧 Email: vsinghchouhan905@gmail.com');
console.log('🔢 OTP Code:', otpCode);
console.log('🔐 New Password: varun124');
console.log('⏰ Time:', new Date().toLocaleString());
console.log('');

async function verifyOtpAndChangePassword() {
  try {
    console.log('🔄 Step 1: Verifying OTP...');
    
    // Verify OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email: 'vsinghchouhan905@gmail.com',
      token: otpCode,
      type: 'email'
    });

    if (error) {
      console.log('❌ OTP Verification failed:', error.message);
      return;
    }

    if (!data.session) {
      console.log('❌ No session created after OTP verification');
      return;
    }

    console.log('✅ Step 1: OTP verified successfully!');
    console.log('👤 User authenticated:', data.user.email);
    console.log('');

    console.log('🔄 Step 2: Changing password to "varun124"...');
    
    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: 'varun124'
    });

    if (updateError) {
      console.log('❌ Password update failed:', updateError.message);
      return;
    }

    console.log('✅ Step 2: Password changed successfully!');
    console.log('');

    console.log('🎉 SUCCESS! Complete password reset flow worked!');
    console.log('📋 Summary:');
    console.log('- ✅ OTP verified');
    console.log('- ✅ Password changed to "varun124"');
    console.log('- ✅ You can now login with:');
    console.log('  📧 Email: vsinghchouhan905@gmail.com');
    console.log('  🔐 Password: varun124');
    console.log('');
    console.log('🔗 Test login at: https://ufsbd34.fr/auth');

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

verifyOtpAndChangePassword();