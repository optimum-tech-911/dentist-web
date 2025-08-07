-- 🔧 TEMPORARY FIX: Disable triggers on posts table
-- This will allow updates to work while we identify the problematic trigger
-- Run this in: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/sql

-- Disable all triggers on the posts table
ALTER TABLE public.posts DISABLE TRIGGER ALL;

-- Test if updates work now
-- (You can test in your admin panel)

-- To re-enable triggers later (after fixing the issue):
-- ALTER TABLE public.posts ENABLE TRIGGER ALL;

-- To see what triggers exist:
-- SELECT 
--   trigger_name,
--   event_manipulation,
--   action_statement
-- FROM information_schema.triggers 
-- WHERE event_object_table = 'posts';