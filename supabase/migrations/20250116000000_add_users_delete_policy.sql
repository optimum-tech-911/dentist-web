-- Add missing DELETE policy for users table
-- This allows admins to delete users from the admin dashboard

CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (public.get_current_user_role() = 'admin');