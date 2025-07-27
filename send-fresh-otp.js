#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cmcfeiskfdbsefzqywbk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

console.log('🔄 Sending Fresh OTP - Rate Limit Reset!');
console.log('========================================');
console.log('📧 Email: vsinghchouhan905@gmail.com');
console.log('⏰ Time:', new Date().toLocaleString());
console.log('');

try {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: 'vsinghchouhan905@gmail.com',
    options: {
      shouldCreateUser: false,
    }
  });

  if (error) {
    console.log('❌ Error:', error.message);
    console.log('Status:', error.status);
  } else {
    console.log('🎉 SUCCESS! Fresh OTP sent!');
    console.log('📨 Check your email for new 6-digit code');
    console.log('');
    console.log('🚀 Test the COMPLETE Password Reset Flow:');
    console.log('1. 📧 Get the 6-digit code from your email');
    console.log('2. 🌐 Go to: https://ufsbd34.fr/auth');
    console.log('3. 🔄 Click "Forgot Password"');
    console.log('4. 📨 Enter: vsinghchouhan905@gmail.com');
    console.log('5. 🔢 Enter: Fresh 6-digit OTP code');
    console.log('6. 🆕 NEW: Password change form appears!');
    console.log('7. 🔐 Set: Your new password');
    console.log('8. ✅ Success: Password changed & logged out');
    console.log('9. 🎯 Login: Use new password to sign in');
    console.log('');
    console.log('💡 The OTP now leads to password change - not just login!');
  }
} catch (err) {
  console.error('❌ Unexpected error:', err.message);
}