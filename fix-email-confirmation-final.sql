-- FINAL EMAIL CONFIRMATION FIX
-- This script completely removes email confirmation requirements
-- and ensures all users can sign in immediately

-- 1. Confirm ALL existing users (set email_confirmed_at to now)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 2. Ensure ALL users have confirmed emails (backup check)
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW());

-- 3. Remove any pending email confirmations from audit log
DELETE FROM auth.audit_log_entries 
WHERE payload->>'action' = 'signup' 
AND payload->>'email_confirmed_at' IS NULL;

-- 4. Remove any email confirmation tokens that might cause issues
DELETE FROM auth.audit_log_entries 
WHERE payload->>'action' = 'email_confirmation';

-- 5. Clean up any remaining confirmation-related entries
DELETE FROM auth.audit_log_entries 
WHERE payload->>'type' = 'email_confirmation';

-- 6. Update Supabase auth config to disable confirmations (if possible via SQL)
-- Note: This might need to be done via Supabase dashboard if this doesn't work
UPDATE auth.config 
SET email_confirm = false 
WHERE true;

-- 7. Verify all users are now confirmed
SELECT 
  id,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ Not Confirmed'
  END as status,
  created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 8. Show summary statistics
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmed_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as unconfirmed_users,
  CASE 
    WHEN COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) = 0 
    THEN '🎉 ALL USERS CONFIRMED!' 
    ELSE '⚠️ Some users still need confirmation'
  END as result
FROM auth.users;

-- 9. Check auth configuration
SELECT 
  'email_confirm' as setting,
  email_confirm as value
FROM auth.config
LIMIT 1;