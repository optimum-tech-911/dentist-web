-- Fix email confirmation issues
-- This script confirms all existing users and ensures no confirmation is required

-- 1. Confirm all existing users in auth.users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 2. Ensure all users are confirmed
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW());

-- 3. Remove any pending email confirmations
DELETE FROM auth.audit_log_entries 
WHERE payload->>'action' = 'signup' 
AND payload->>'email_confirmed_at' IS NULL;

-- 4. Verify all users are now confirmed
SELECT 
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ Not Confirmed'
  END as status
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check total confirmed vs unconfirmed users
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmed_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as unconfirmed_users
FROM auth.users;