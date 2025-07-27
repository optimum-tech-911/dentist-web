-- Fix OTP System Issues
-- Run this in Supabase SQL Editor to clear existing OTP records

-- 1. Clear all existing OTP records for the test email
DELETE FROM public.otp_password_reset 
WHERE user_email = 'singhchouhanv473@gmail.com';

-- 2. Check if there are any OTP records left
SELECT * FROM public.otp_password_reset 
WHERE user_email = 'singhchouhanv473@gmail.com';

-- 3. Test the function again (this will create a fresh OTP)
SELECT generate_password_reset_otp('singhchouhanv473@gmail.com');