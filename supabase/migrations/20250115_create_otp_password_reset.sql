-- Create OTP-based password reset system
-- This replaces the temporary password system with a proper OTP flow

-- Create OTP password reset table
CREATE TABLE IF NOT EXISTS public.otp_password_reset (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_otp_password_reset_email 
ON public.otp_password_reset(user_email);

CREATE INDEX IF NOT EXISTS idx_otp_password_reset_otp 
ON public.otp_password_reset(otp_code);

CREATE INDEX IF NOT EXISTS idx_otp_password_reset_expires 
ON public.otp_password_reset(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.otp_password_reset ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own OTP records" ON public.otp_password_reset
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Allow OTP creation" ON public.otp_password_reset
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow OTP updates" ON public.otp_password_reset
    FOR UPDATE USING (true);

-- Function to generate OTP
CREATE OR REPLACE FUNCTION generate_password_reset_otp(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    otp_code TEXT;
    existing_otp RECORD;
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
    
    -- Check for existing valid OTP (within last 10 minutes)
    SELECT * INTO existing_otp
    FROM public.otp_password_reset
    WHERE user_email = user_email
    AND expires_at > NOW()
    AND used = false
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If valid OTP exists and was created less than 2 minutes ago, don't create new one
    IF existing_otp.id IS NOT NULL AND existing_otp.created_at > (NOW() - INTERVAL '2 minutes') THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Un code OTP a déjà été envoyé récemment. Veuillez attendre avant d''en demander un nouveau.'
        );
    END IF;
    
    -- Generate 6-digit OTP
    otp_code := LPAD((random() * 999999)::int::text, 6, '0');
    
    -- Invalidate any existing OTPs for this user
    UPDATE public.otp_password_reset 
    SET used = true, used_at = NOW()
    WHERE user_email = user_email 
    AND used = false;
    
    -- Insert new OTP record
    INSERT INTO public.otp_password_reset (
        user_id,
        user_email,
        otp_code,
        expires_at
    ) VALUES (
        user_record.id,
        user_email,
        otp_code,
        NOW() + INTERVAL '10 minutes'
    );
    
    -- Return success with OTP (for email service)
    RETURN json_build_object(
        'success', true,
        'message', 'Code OTP généré avec succès',
        'otp_code', otp_code,
        'user_email', user_email,
        'expires_at', (NOW() + INTERVAL '10 minutes')::text
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Une erreur est survenue lors de la génération du code OTP: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify OTP and reset password
CREATE OR REPLACE FUNCTION verify_otp_and_reset_password(
    user_email TEXT, 
    otp_code TEXT, 
    new_password TEXT
)
RETURNS JSON AS $$
DECLARE
    otp_record RECORD;
    user_record RECORD;
BEGIN
    -- Find valid OTP record
    SELECT * INTO otp_record
    FROM public.otp_password_reset
    WHERE user_email = verify_otp_and_reset_password.user_email
    AND otp_code = verify_otp_and_reset_password.otp_code
    AND expires_at > NOW()
    AND used = false
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        -- Increment attempts for any existing OTP
        UPDATE public.otp_password_reset 
        SET attempts = attempts + 1
        WHERE user_email = verify_otp_and_reset_password.user_email
        AND expires_at > NOW()
        AND used = false;
        
        RETURN json_build_object(
            'success', false,
            'message', 'Code OTP invalide ou expiré'
        );
    END IF;
    
    -- Check if max attempts exceeded
    IF otp_record.attempts >= otp_record.max_attempts THEN
        -- Mark as used to prevent further attempts
        UPDATE public.otp_password_reset 
        SET used = true, used_at = NOW()
        WHERE id = otp_record.id;
        
        RETURN json_build_object(
            'success', false,
            'message', 'Nombre maximum de tentatives dépassé. Veuillez demander un nouveau code OTP.'
        );
    END IF;
    
    -- Get user record
    SELECT * INTO user_record
    FROM auth.users
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Utilisateur non trouvé'
        );
    END IF;
    
    -- Update user password
    UPDATE auth.users 
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE email = user_email;
    
    -- Mark OTP as used
    UPDATE public.otp_password_reset 
    SET used = true, used_at = NOW()
    WHERE id = otp_record.id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Mot de passe réinitialisé avec succès'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Une erreur est survenue lors de la réinitialisation: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify OTP only (without password reset)
CREATE OR REPLACE FUNCTION verify_otp_code(user_email TEXT, otp_code TEXT)
RETURNS JSON AS $$
DECLARE
    otp_record RECORD;
BEGIN
    -- Find valid OTP record
    SELECT * INTO otp_record
    FROM public.otp_password_reset
    WHERE user_email = verify_otp_code.user_email
    AND otp_code = verify_otp_code.otp_code
    AND expires_at > NOW()
    AND used = false
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        -- Increment attempts for any existing OTP
        UPDATE public.otp_password_reset 
        SET attempts = attempts + 1
        WHERE user_email = verify_otp_code.user_email
        AND expires_at > NOW()
        AND used = false;
        
        RETURN json_build_object(
            'success', false,
            'message', 'Code OTP invalide ou expiré'
        );
    END IF;
    
    -- Check if max attempts exceeded
    IF otp_record.attempts >= otp_record.max_attempts THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Nombre maximum de tentatives dépassé. Veuillez demander un nouveau code OTP.'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Code OTP valide',
        'otp_id', otp_record.id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Une erreur est survenue lors de la vérification: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.otp_password_reset TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.otp_password_reset_id_seq TO anon, authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION generate_password_reset_otp(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_otp_and_reset_password(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_otp_code(TEXT, TEXT) TO anon, authenticated;