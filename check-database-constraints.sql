-- 🔍 CHECK DATABASE CONSTRAINTS AND TRIGGERS
-- This will help identify what's blocking all updates
-- Run this in: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/sql

-- Check for triggers on the posts table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'posts'
ORDER BY trigger_name;

-- Check for check constraints
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints
WHERE constraint_name IN (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'posts' AND constraint_type = 'CHECK'
);

-- Check for rules
SELECT 
    rulename,
    ev_type,
    ev_class,
    is_instead,
    ev_qual,
    ev_action
FROM pg_rewrite
WHERE ev_class = 'public.posts'::regclass;

-- Check table structure and constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;

-- Check for any foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'posts';

-- Try to see if there are any row-level security policies that might be interfering
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