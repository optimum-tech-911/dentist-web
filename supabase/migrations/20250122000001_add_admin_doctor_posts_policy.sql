-- Add policy for admin and doctor to update posts
-- This allows admin and doctor roles to edit any post (including approved posts)

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can update post status" ON public.posts;

-- Create a new policy that allows admins and doctors to update any post fields
CREATE POLICY "Admins and doctors can update posts" ON public.posts
  FOR UPDATE USING (public.get_current_user_role() IN ('admin', 'doctor'));

-- Keep the existing policy for authors to update their own pending posts
-- (This policy already exists and should remain)