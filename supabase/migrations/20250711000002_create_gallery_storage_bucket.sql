-- Create gallery storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the gallery bucket
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery' AND 
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to view gallery images
CREATE POLICY "Allow authenticated users to view gallery images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'gallery' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to update their own uploaded images
CREATE POLICY "Allow users to update their own gallery images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'gallery' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own uploaded images
CREATE POLICY "Allow users to delete their own gallery images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  ); 