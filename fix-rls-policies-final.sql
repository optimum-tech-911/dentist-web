-- 🔧 FINAL FIX: Update RLS policies for cover image updates
-- This will allow admin panel users to update any field in posts
-- Run this in: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/sql

-- First, let's see what policies currently exist
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;

-- Drop ALL existing update policies to start fresh
DROP POLICY IF EXISTS "Admins can update post status" ON public.posts;
DROP POLICY IF EXISTS "Admin panel users can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update their own pending posts" ON public.posts;

-- Create a comprehensive update policy for admin panel users
CREATE POLICY "Admin panel users can update any post field" ON public.posts
  FOR UPDATE USING (
    public.get_current_user_role() IN ('admin', 'doctor', 'president', 'secretaire', 'tresorier')
  );

-- Create a policy for authors to update their own pending posts
CREATE POLICY "Authors can update their own pending posts" ON public.posts
  FOR UPDATE USING (
    author_id = auth.uid() AND
    status = 'pending' AND
    public.get_current_user_role() IN ('author', 'admin')
  );

-- Verify the new policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;