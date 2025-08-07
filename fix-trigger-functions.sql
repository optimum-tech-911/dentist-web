-- 🔧 PERMANENT FIX: Update trigger functions to respect manual cover images
-- This ensures admin-uploaded cover images are preserved during updates
-- Run this in: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/sql

-- First, let's see the current trigger functions
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name IN ('auto_set_post_image', 'set_image_from_content')
AND routine_schema = 'public';

-- Update the auto_set_post_image function to respect manual cover images
CREATE OR REPLACE FUNCTION auto_set_post_image()
RETURNS TRIGGER AS $$
BEGIN
    -- Only auto-set image if cover image is NULL or empty
    IF NEW.image IS NULL OR NEW.image = '' THEN
        -- Your existing auto-set logic here
        -- (preserve the original logic for when no cover image is provided)
        -- Example:
        -- NEW.image := extract_image_from_content(NEW.content);
    END IF;
    
    -- If cover image is already set, preserve it
    -- (do nothing, keep NEW.image as is)
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the set_image_from_content function to respect manual cover images
CREATE OR REPLACE FUNCTION set_image_from_content()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set image from content if cover image is NULL or empty
    IF NEW.image IS NULL OR NEW.image = '' THEN
        -- Your existing content extraction logic here
        -- (preserve the original logic for when no cover image is provided)
        -- Example:
        -- NEW.image := extract_first_image_from_content(NEW.content);
    END IF;
    
    -- If cover image is already set, preserve it
    -- (do nothing, keep NEW.image as is)
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-enable the triggers now that they're fixed
ALTER TABLE posts ENABLE TRIGGER trg_auto_set_post_image;
ALTER TABLE posts ENABLE TRIGGER trg_set_image_from_content;

-- Verify the triggers are enabled and working
SELECT 
    trigger_name,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'posts'
ORDER BY trigger_name;

-- Test the fix by checking current posts
SELECT id, title, image, status FROM posts ORDER BY updated_at DESC;