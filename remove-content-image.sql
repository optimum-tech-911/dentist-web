-- 🔧 REMOVE COVER IMAGE FROM ARTICLE CONTENT
-- This script removes the cover image that was accidentally placed in the article content

-- First, let's see the current content
SELECT 
  id,
  title,
  content,
  image,
  status
FROM posts 
WHERE id = '2e731e37-25d9-4bd0-ad71-2dabed1b5a27';

-- 🔒 SAFE UPDATE: Remove the cover image from content
-- This will remove any img tags that reference the cover image path
UPDATE posts 
SET 
  content = REPLACE(
    content, 
    '<img src="gallery/user/cover.jpg"', 
    '<!-- REMOVED COVER IMAGE -->'
  ),
  updated_at = NOW()
WHERE id = '2e731e37-25d9-4bd0-ad71-2dabed1b5a27'
  AND content LIKE '%gallery/user/cover.jpg%';

-- ✅ VERIFICATION: Check if the content was cleaned
SELECT 
  id,
  title,
  LEFT(content, 200) as content_preview,
  image,
  status
FROM posts 
WHERE id = '2e731e37-25d9-4bd0-ad71-2dabed1b5a27';

-- 🔍 FINAL CHECK: See the complete post
SELECT 
  id,
  title,
  content,
  image,
  status,
  updated_at
FROM posts 
WHERE id = '2e731e37-25d9-4bd0-ad71-2dabed1b5a27';