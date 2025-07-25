-- Allow both admin and doctor to delete users from the users table
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

CREATE POLICY "Admins and doctors can delete users" ON public.users
  FOR DELETE USING (
    get_current_user_role() IN ('admin', 'doctor')
  ); 