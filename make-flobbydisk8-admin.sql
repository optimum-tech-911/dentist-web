-- Make flobbydisk8@gmail.com an admin user
-- This script will set the user role to 'admin' for this specific email

-- 1. First, check if the user exists in auth.users
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'flobbydisk8@gmail.com';

-- 2. If user exists in auth.users but not in public.users, insert them
INSERT INTO public.users (id, email, role)
SELECT 
  au.id, 
  au.email, 
  'admin'
FROM auth.users au
WHERE au.email = 'flobbydisk8@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- 3. Update existing user to admin role (if they already exist in public.users)
UPDATE public.users 
SET role = 'admin'
WHERE email = 'flobbydisk8@gmail.com';

-- 4. Ensure email is confirmed (just in case)
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email = 'flobbydisk8@gmail.com';

-- 5. Verify the admin role was set correctly
SELECT 
  pu.id,
  pu.email,
  pu.role,
  pu.created_at,
  au.email_confirmed_at
FROM public.users pu
JOIN auth.users au ON pu.id = au.id
WHERE pu.email = 'flobbydisk8@gmail.com';

-- 6. Show all admin users for verification
SELECT 
  email,
  role,
  created_at
FROM public.users 
WHERE role = 'admin'
ORDER BY created_at;