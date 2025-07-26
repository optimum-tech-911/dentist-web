-- Create a function to handle password resets without email service
-- This function will generate a temporary password and update the user

CREATE OR REPLACE FUNCTION handle_password_reset(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    temp_password TEXT;
    result JSON;
BEGIN
    -- Check if user exists
    SELECT * INTO user_record 
    FROM auth.users 
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'User not found with this email address'
        );
    END IF;
    
    -- Generate a temporary password (8 characters, alphanumeric)
    temp_password := array_to_string(
        ARRAY(
            SELECT chr((65 + round(random() * 25))::int) -- Uppercase letters
            FROM generate_series(1, 4)
        ) ||
        ARRAY(
            SELECT chr((97 + round(random() * 25))::int) -- Lowercase letters
            FROM generate_series(1, 2)
        ) ||
        ARRAY(
            SELECT chr((48 + round(random() * 9))::int) -- Numbers
            FROM generate_series(1, 2)
        ),
        ''
    );
    
    -- Update the user's password in auth.users
    UPDATE auth.users 
    SET encrypted_password = crypt(temp_password, gen_salt('bf'))
    WHERE email = user_email;
    
    -- Log the password reset attempt
    INSERT INTO public.password_reset_logs (
        user_id,
        user_email,
        reset_timestamp,
        temp_password,
        used
    ) VALUES (
        user_record.id,
        user_email,
        NOW(),
        temp_password,
        false
    );
    
    -- Return success with temporary password
    RETURN json_build_object(
        'success', true,
        'message', 'Password reset successful',
        'temp_password', temp_password,
        'user_email', user_email
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'An error occurred during password reset: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a table to log password reset attempts
CREATE TABLE IF NOT EXISTS public.password_reset_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    reset_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    temp_password TEXT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_password_reset_logs_user_email 
ON public.password_reset_logs(user_email);

CREATE INDEX IF NOT EXISTS idx_password_reset_logs_user_id 
ON public.password_reset_logs(user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.password_reset_logs TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.password_reset_logs_id_seq TO anon, authenticated;

-- Enable RLS (Row Level Security)
ALTER TABLE public.password_reset_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own reset logs
CREATE POLICY "Users can view their own password reset logs" ON public.password_reset_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow password reset function to insert logs
CREATE POLICY "Allow password reset function to insert logs" ON public.password_reset_logs
    FOR INSERT WITH CHECK (true);

-- Function to mark a password reset as used
CREATE OR REPLACE FUNCTION mark_password_reset_used(user_email TEXT, temp_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.password_reset_logs 
    SET used = true, used_timestamp = NOW()
    WHERE user_email = $1 
    AND temp_password = $2 
    AND used = false;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION handle_password_reset(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_password_reset_used(TEXT, TEXT) TO anon, authenticated; 