-- 🔧 BYPASS UPDATE ISSUE - Direct database update
-- This will directly update the database to remove the cover image
-- Run this in: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/sql

-- First, check current state
SELECT id, title, image, status FROM public.posts WHERE title = 'Notre Mission';

-- Direct update to remove cover image
UPDATE public.posts 
SET image = NULL, 
    updated_at = NOW()
WHERE title = 'Notre Mission';

-- Check if it worked
SELECT id, title, image, status, updated_at FROM public.posts WHERE title = 'Notre Mission';

-- If that doesn't work, try with explicit values
UPDATE public.posts 
SET image = NULL, 
    title = 'Notre Mission',
    content = content,
    category = category,
    author_email = author_email,
    author_id = author_id,
    status = status,
    updated_at = NOW()
WHERE title = 'Notre Mission';

-- Final check
SELECT id, title, image, status, updated_at FROM public.posts WHERE title = 'Notre Mission';