-- Fix posts.image fields that contain URLs instead of file paths
-- This migration cleans up any posts that have full URLs stored instead of raw file paths

-- Find and update posts with signed URLs
UPDATE posts
SET image = regexp_replace(image, '^.*gallery/', '')
WHERE image LIKE '%/object/sign/gallery/%';

-- Find and update posts with public URLs  
UPDATE posts
SET image = regexp_replace(image, '^.*gallery/', '')
WHERE image LIKE '%/object/public/gallery/%';

-- Find and update posts with full HTTP URLs
UPDATE posts
SET image = regexp_replace(image, '^.*gallery/', '')
WHERE image LIKE 'http%gallery/%';

-- Find and update posts with custom domain URLs
UPDATE posts
SET image = regexp_replace(image, '^.*gallery/', '')
WHERE image LIKE '%ufsbd34.fr%gallery/%';

-- Show the results
SELECT id, image, created_at 
FROM posts 
WHERE image IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 10;