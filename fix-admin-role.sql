-- Fix Admin Role Assignment
-- Run this in your Supabase SQL Editor

-- 1. Check current users and their roles
SELECT id, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- 2. Find your specific user (replace with your email)
SELECT id, email, role 
FROM users 
WHERE email = 'your-email@example.com';

-- 3. Update your user to admin role (replace with your email)
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- 4. If user doesn't exist in users table, create entry
-- First, get your user ID from auth.users
-- Then run this (replace with your actual user ID and email):
INSERT INTO users (id, email, role) 
VALUES ('your-user-id-from-auth', 'your-email@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 5. Verify the update worked
SELECT id, email, role 
FROM users 
WHERE email = 'your-email@example.com';

-- 6. Check all admin users
SELECT id, email, role 
FROM users 
WHERE role = 'admin';

-- 7. If you need to create a test admin user
-- (Replace with actual email and user ID)
INSERT INTO users (id, email, role) 
VALUES ('test-user-id', 'test-admin@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 8. Clean up any duplicate entries (if needed)
DELETE FROM users 
WHERE id IN (
  SELECT id 
  FROM users 
  GROUP BY id 
  HAVING COUNT(*) > 1
);

-- 9. Verify the users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public';

-- 10. Check for any RLS (Row Level Security) policies that might block access
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users';