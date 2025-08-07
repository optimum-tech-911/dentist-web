-- 🔧 FIX COVER IMAGE UPDATE FOR ADMIN PANEL USERS
-- This allows anyone who can access the admin panel to update article cover images
-- Go to: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/sql

-- Drop the existing restrictive policy that only allows status updates
DROP POLICY IF EXISTS "Admins can update post status" ON public.posts;

-- Create a new policy that allows admin panel users to update any post fields (including cover images)
CREATE POLICY "Admin panel users can update posts" ON public.posts
  FOR UPDATE USING (
    public.get_current_user_role() IN ('admin', 'doctor', 'president', 'secretaire', 'tresorier')
  );

-- Verify the policies after applying
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