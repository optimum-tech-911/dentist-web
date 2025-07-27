-- Assign admin role to tinnichor6@gmail.com
-- This script can be run in Supabase SQL Editor

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'), 
  '{role}', 
  '"admin"'
)
WHERE email = 'tinnichor6@gmail.com';

-- Also update the users table if it exists
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'tinnichor6@gmail.com';

-- If the user doesn't exist in public.users table, create the record
INSERT INTO public.users (id, email, role, created_at)
SELECT 
  auth.users.id,
  auth.users.email,
  'admin',
  NOW()
FROM auth.users 
WHERE auth.users.email = 'tinnichor6@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE public.users.email = 'tinnichor6@gmail.com'
  );

-- Verify the update
SELECT 
  au.email,
  au.raw_user_meta_data->>'role' as auth_role,
  pu.role as public_role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'tinnichor6@gmail.com';