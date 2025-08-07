-- 🔧 FIX SPECIFIC POST COVER IMAGE
-- This script safely updates the "Notre Mission" post that has a NULL image

-- ✅ SAFE UPDATE: Only update the specific post with NULL image
-- Replace 'gallery/user/cover.jpg' with the actual correct cover image path

UPDATE posts 
SET 
  image = 'gallery/user/cover.jpg',  -- ← Replace with correct cover image path
  updated_at = NOW()
WHERE id = '2e731e37-25d9-4bd0-ad71-2dabed1b5a27'  -- ← Specific post ID
  AND image IS NULL;  -- ← Only update if image is NULL (extra safety)

-- ✅ VERIFICATION: Check if the update worked
SELECT 
  id,
  title,
  image,
  status,
  updated_at
FROM posts 
WHERE id = '2e731e37-25d9-4bd0-ad71-2dabed1b5a27';

-- 🔍 FINAL CHECK: See all posts to confirm
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