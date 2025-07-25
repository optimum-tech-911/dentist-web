-- Update gallery storage bucket to support videos and increase file size limit
UPDATE storage.buckets 
SET 
  file_size_limit = 20971520, -- 20MB limit
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/ogg']
WHERE id = 'gallery';

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own gallery images" ON storage.objects;

-- Create updated storage policies for the gallery bucket
-- Allow authenticated users to upload images and videos
CREATE POLICY "Allow authenticated users to upload gallery media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery' AND 
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to view gallery images and videos
CREATE POLICY "Allow authenticated users to view gallery media" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'gallery' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to update their own uploaded media
CREATE POLICY "Allow users to update their own gallery media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'gallery' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own uploaded media
CREATE POLICY "Allow users to delete their own gallery media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );