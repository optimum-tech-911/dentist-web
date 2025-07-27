-- Create function to force confirm user email
-- This function will set email_confirmed_at for any user to allow immediate sign in

CREATE OR REPLACE FUNCTION force_confirm_user(user_email TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Update the user's email_confirmed_at field
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE email = user_email 
  AND email_confirmed_at IS NULL;
  
  -- Return success message
  IF FOUND THEN
    RETURN 'User email confirmed successfully';
  ELSE
    RETURN 'User already confirmed or not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION force_confirm_user(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION force_confirm_user(TEXT) TO anon;

-- Also create an RPC wrapper for easier access
CREATE OR REPLACE FUNCTION public.force_confirm_user_rpc(user_email TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN force_confirm_user(user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to the RPC wrapper
GRANT EXECUTE ON FUNCTION public.force_confirm_user_rpc(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.force_confirm_user_rpc(TEXT) TO anon;