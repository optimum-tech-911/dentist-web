-- FINAL FIX: Clean OTP Functions (Copy and paste this entire code)

CREATE OR REPLACE FUNCTION generate_password_reset_otp(p_user_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    otp_code TEXT;
    existing_otp RECORD;
BEGIN
    -- Check if user exists
    SELECT * INTO user_record 
    FROM auth.users u
    WHERE u.email = p_user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'User not found with this email address'
        );
    END IF;
    
    -- Check for existing valid OTP
    SELECT * INTO existing_otp
    FROM public.otp_password_reset otp
    WHERE otp.user_email = p_user_email
    AND otp.expires_at > NOW()
    AND otp.used = false
    ORDER BY otp.created_at DESC
    LIMIT 1;
    
    -- Rate limiting check
    IF existing_otp.id IS NOT NULL AND existing_otp.created_at > (NOW() - INTERVAL '2 minutes') THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Un code OTP a déjà été envoyé récemment. Veuillez attendre avant d''en demander un nouveau.'
        );
    END IF;
    
    -- Generate 6-digit OTP
    otp_code := LPAD((random() * 999999)::int::text, 6, '0');
    
    -- Invalidate existing OTPs
    UPDATE public.otp_password_reset 
    SET used = true, used_at = NOW()
    WHERE user_email = p_user_email 
    AND used = false;
    
    -- Insert new OTP
    INSERT INTO public.otp_password_reset (
        user_id,
        user_email,
        otp_code,
        expires_at
    ) VALUES (
        user_record.id,
        p_user_email,
        otp_code,
        NOW() + INTERVAL '10 minutes'
    );
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'message', 'Code OTP généré avec succès',
        'otp_code', otp_code,
        'user_email', p_user_email,
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

CREATE OR REPLACE FUNCTION verify_otp_and_reset_password(
    p_user_email TEXT, 
    p_otp_code TEXT, 
    p_new_password TEXT
)
RETURNS JSON AS $$
DECLARE
    otp_record RECORD;
    user_record RECORD;
BEGIN
    -- Find valid OTP
    SELECT * INTO otp_record
    FROM public.otp_password_reset otp
    WHERE otp.user_email = p_user_email
    AND otp.otp_code = p_otp_code
    AND otp.expires_at > NOW()
    AND otp.used = false
    ORDER BY otp.created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        -- Increment attempts
        UPDATE public.otp_password_reset 
        SET attempts = attempts + 1
        WHERE user_email = p_user_email
        AND expires_at > NOW()
        AND used = false;
        
        RETURN json_build_object(
            'success', false,
            'message', 'Code OTP invalide ou expiré'
        );
    END IF;
    
    -- Check max attempts
    IF otp_record.attempts >= otp_record.max_attempts THEN
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
    FROM auth.users u
    WHERE u.email = p_user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Utilisateur non trouvé'
        );
    END IF;
    
    -- Update password
    UPDATE auth.users 
    SET encrypted_password = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE email = p_user_email;
    
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

CREATE OR REPLACE FUNCTION verify_otp_code(p_user_email TEXT, p_otp_code TEXT)
RETURNS JSON AS $$
DECLARE
    otp_record RECORD;
BEGIN
    -- Find valid OTP
    SELECT * INTO otp_record
    FROM public.otp_password_reset otp
    WHERE otp.user_email = p_user_email
    AND otp.otp_code = p_otp_code
    AND otp.expires_at > NOW()
    AND otp.used = false
    ORDER BY otp.created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        -- Increment attempts
        UPDATE public.otp_password_reset 
        SET attempts = attempts + 1
        WHERE user_email = p_user_email
        AND expires_at > NOW()
        AND used = false;
        
        RETURN json_build_object(
            'success', false,
            'message', 'Code OTP invalide ou expiré'
        );
    END IF;
    
    -- Check max attempts
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