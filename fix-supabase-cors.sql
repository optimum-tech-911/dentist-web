-- Fix CORS configuration for Supabase Storage
-- This script configures CORS settings to allow cross-origin requests from your domain

-- Enable CORS for the gallery bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, owner)
VALUES (
  'gallery',
  'gallery',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  auth.uid()
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- Enable CORS for the gallery-staging bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, owner)
VALUES (
  'gallery-staging',
  'gallery-staging',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  auth.uid()
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- Create storage policies for public access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-staging');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('gallery', 'gallery-staging') AND auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (
  bucket_id IN ('gallery', 'gallery-staging') AND auth.uid() = owner
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (
  bucket_id IN ('gallery', 'gallery-staging') AND auth.uid() = owner
);