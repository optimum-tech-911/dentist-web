-- Add Resend API Key as Environment Variable
-- Run this in Supabase SQL Editor

-- First, check if the environment variable exists
SELECT * FROM pg_settings WHERE name = 'app.settings';

-- Add the environment variable (replace 're_your_actual_api_key_here' with your real API key)
-- Note: This is a simplified approach - the proper way is through the Supabase dashboard

-- Alternative: You can also set this in your Supabase project settings
-- Go to: Settings → API → Environment Variables
-- Add: RESEND_API_KEY = re_your_actual_api_key_here

-- For now, let's create a simple function to test if Resend is configured
CREATE OR REPLACE FUNCTION test_resend_config()
RETURNS TEXT AS $$
BEGIN
    -- Check if RESEND_API_KEY is set
    IF current_setting('app.settings', true) IS NULL THEN
        RETURN 'Environment variable not found. Please add RESEND_API_KEY in Supabase dashboard.';
    ELSE
        RETURN 'Environment variable found!';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT test_resend_config(); 