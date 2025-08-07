-- 🔧 FIX POSTS COVER IMAGES
-- This script safely updates incorrect image values in the posts table
-- Only affects rows with null images or content image paths

-- First, let's see what we're working with
SELECT 
  id,
  title,
  image,
  status,
  created_at,
  updated_at
FROM posts 
WHERE image IS NULL 
   OR image LIKE '%content%'
   OR image = ''
ORDER BY updated_at DESC;

-- 🔒 SAFE UPDATE: Only update specific rows with correct cover images
-- Replace 'abc123' with the actual post ID you want to fix
-- Replace 'gallery/user/cover.jpg' with the correct cover image path

UPDATE posts 
SET 
  image = 'gallery/user/cover.jpg',  -- ← Replace with correct cover image path
  updated_at = NOW()
WHERE id = 'abc123'  -- ← Replace with actual post ID
  AND (image IS NULL OR image LIKE '%content%' OR image = '');

-- ✅ VERIFICATION: Check if the update worked
SELECT 
  id,
  title,
  image,
  status,
  updated_at
FROM posts 
WHERE id = 'abc123';  -- ← Replace with actual post ID

-- 🔍 COMPREHENSIVE CHECK: See all posts that might need fixing
SELECT 
  id,
  title,
  image,
  CASE 
    WHEN image IS NULL THEN 'NULL'
    WHEN image = '' THEN 'EMPTY'
    WHEN image LIKE '%content%' THEN 'CONTENT_IMAGE'
    ELSE 'VALID_COVER'
  END as image_status,
  status,
  updated_at
FROM posts 
ORDER BY updated_at DESC;

-- 📋 MANUAL FIX TEMPLATE (copy and modify for each broken post):
/*
-- Example 1: Fix post with ID 'abc123'
UPDATE posts 
SET image = 'gallery/user/cover.jpg', updated_at = NOW()
WHERE id = 'abc123';

-- Example 2: Fix post with ID 'def456' 
UPDATE posts 
SET image = 'gallery/user/another-cover.jpg', updated_at = NOW()
WHERE id = 'def456';

-- Example 3: Remove image from post that shouldn't have one
UPDATE posts 
SET image = NULL, updated_at = NOW()
WHERE id = 'ghi789';
*/