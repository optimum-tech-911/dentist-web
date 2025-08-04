-- Fix gallery storage bucket for public access
-- Since the bucket is marked as public (public: true), we need to allow public read access

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated users to view gallery media" ON storage.objects;

-- Create new policy that allows public read access for gallery bucket
CREATE POLICY "Allow public read access to gallery media" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'gallery'
  );

-- Keep existing policies for write operations (upload/delete) - they should still require authentication
-- These policies should already exist from previous migrations but let's ensure they're correct

-- Recreate upload policy (authenticated users only)
DROP POLICY IF EXISTS "Allow authenticated users to upload gallery media" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload gallery media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery' AND 
    auth.role() = 'authenticated'
  );

-- Recreate update policy (own files only)
DROP POLICY IF EXISTS "Allow users to update their own gallery media" ON storage.objects;
CREATE POLICY "Allow users to update their own gallery media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'gallery' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Recreate delete policy (own files only)
DROP POLICY IF EXISTS "Allow users to delete their own gallery media" ON storage.objects;
CREATE POLICY "Allow users to delete their own gallery media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );