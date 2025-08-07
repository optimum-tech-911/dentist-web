-- 🔧 REMOVE COVER IMAGE FROM "NOTRE MISSION" POST
-- This script removes the cover image from the Notre Mission post

-- First, let's see the current state
SELECT 
  id,
  title,
  image,
  status,
  updated_at
FROM posts 
WHERE id = '2e731e37-25d9-4bd0-ad71-2dabed1b5a27';

-- 🔒 SAFE UPDATE: Remove the cover image
UPDATE posts 
SET 
  image = NULL,  -- ← Remove cover image completely
  updated_at = NOW()
WHERE id = '2e731e37-25d9-4bd0-ad71-2dabed1b5a27';

-- ✅ VERIFICATION: Check if the update worked
SELECT 
  id,
  title,
  image,
  status,
  updated_at
FROM posts 
WHERE id = '2e731e37-25d9-4bd0-ad71-2dabed1b5a27';

-- 🔍 FINAL CHECK: See all posts
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