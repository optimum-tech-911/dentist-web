-- 🗑️ REMOVE "Notre Mission" COVER IMAGE
-- Run this in: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/sql

-- First, check current state
SELECT id, title, image, status FROM public.posts WHERE title = 'Notre Mission';

-- Try to update with explicit NULL
UPDATE public.posts 
SET image = NULL
WHERE title = 'Notre Mission' AND image IS NOT NULL;

-- Check if it worked
SELECT id, title, image, status FROM public.posts WHERE title = 'Notre Mission';

-- If that doesn't work, try deleting and recreating the post without the image
-- (This is a more aggressive approach)

-- First, backup the post data
-- SELECT * FROM public.posts WHERE title = 'Notre Mission';

-- Then delete the post
-- DELETE FROM public.posts WHERE title = 'Notre Mission';

-- Then recreate it without the image
-- INSERT INTO public.posts (title, content, category, author_email, author_id, status, created_at, updated_at)
-- VALUES (
--   'Notre Mission',
--   '<iframe src="https://www.youtube.com/embed/_s09LWFdWRw" frameborder="0" allowfullscreen="allowfullscreen" class="w-full aspect-video rounded-lg my-4"></iframe><p></p>',
--   'Prévention',
--   'drabdessadok@outlook.com',
--   '5e451a66-4cc4-47e0-8ef4-c3fa524cbd02',
--   'approved',
--   '2025-07-21T07:29:19.07631+00:00',
--   NOW()
-- );

-- Final check
SELECT id, title, image, status FROM public.posts WHERE title = 'Notre Mission';