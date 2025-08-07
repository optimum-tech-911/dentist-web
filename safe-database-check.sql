-- 🔍 SAFE DATABASE CHECK - No risky updates
-- Run this in: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/sql

-- 1. Check current posts and their image fields
SELECT id, title, image, updated_at, status 
FROM posts 
ORDER BY updated_at DESC 
LIMIT 5;

-- 2. Check table structure - verify image column exists and is correct
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'posts' 
AND column_name IN ('image', 'cover_image', 'thumbnail')
ORDER BY column_name;

-- 3. Check for triggers that might be interfering (read-only)
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'posts'
ORDER BY trigger_name;

-- 4. Check current RLS policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY policyname;

-- 5. Check for any check constraints
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints
WHERE constraint_name IN (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'posts' AND constraint_type = 'CHECK'
);

-- 6. Check the specific "Notre Mission" post
SELECT id, title, image, status, updated_at, author_email
FROM posts 
WHERE title = 'Notre Mission';