-- Fix CORS issues for gallery storage bucket
-- This migration updates the storage bucket to allow cross-origin requests

-- Update the gallery bucket CORS settings
UPDATE storage.buckets 
SET cors_origins = ARRAY['https://ufsbd34.fr', 'https://www.ufsbd34.fr', 'http://localhost:3000', 'http://localhost:5173']
WHERE id = 'gallery';

-- Also update staging bucket if it exists
UPDATE storage.buckets 
SET cors_origins = ARRAY['https://ufsbd34.fr', 'https://www.ufsbd34.fr', 'http://localhost:3000', 'http://localhost:5173']
WHERE id = 'gallery-staging';

-- Ensure public read access is maintained
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('gallery', 'gallery-staging');

-- Verify the changes
SELECT id, name, public, cors_origins 
FROM storage.buckets 
WHERE id IN ('gallery', 'gallery-staging');