-- Fix posts update policy to allow admins to update approved posts
-- This is needed for the EditBlog functionality to work properly

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can update post status" ON public.posts;

-- Create a new policy that allows admins to update any post fields
CREATE POLICY "Admins can update posts" ON public.posts
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- Keep the existing policy for authors to update their own pending posts
-- (This policy already exists and should remain)