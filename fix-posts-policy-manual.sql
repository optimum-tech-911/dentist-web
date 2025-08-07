-- 🔧 FIX POSTS UPDATE POLICY
-- This SQL needs to be run manually in the Supabase Dashboard SQL Editor
-- to fix the EditBlog cover image update issue

-- Drop the existing restrictive policy that only allows updating post status
DROP POLICY IF EXISTS "Admins can update post status" ON public.posts;

-- Create a new policy that allows admins to update any post fields
CREATE POLICY "Admins can update posts" ON public.posts
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'posts' 
ORDER BY policyname;