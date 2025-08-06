-- Fix Gallery Issues
-- This script creates the necessary database tables and storage buckets

-- 1. Create gallery_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_uploaded_by ON public.gallery_images(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON public.gallery_images(created_at DESC);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Allow authenticated users to view all images
CREATE POLICY "Allow authenticated users to view gallery images" ON public.gallery_images
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload gallery images" ON public.gallery_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own images
CREATE POLICY "Allow users to update own gallery images" ON public.gallery_images
  FOR UPDATE USING (auth.uid() = uploaded_by);

-- Allow users to delete their own images
CREATE POLICY "Allow users to delete own gallery images" ON public.gallery_images
  FOR DELETE USING (auth.uid() = uploaded_by);

-- 5. Create storage buckets if they don't exist
-- Note: This needs to be done through Supabase Dashboard or API
-- Go to Storage > Create bucket: 'gallery'
-- Go to Storage > Create bucket: 'gallery-staging'

-- 6. Create storage policies for gallery bucket
-- Allow public read access to gallery bucket
CREATE POLICY "Public read access to gallery" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

-- Allow authenticated users to upload to gallery
CREATE POLICY "Authenticated users can upload to gallery" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Allow users to update their own files in gallery
CREATE POLICY "Users can update own files in gallery" ON storage.objects
  FOR UPDATE USING (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files in gallery
CREATE POLICY "Users can delete own files in gallery" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 7. Create storage policies for gallery-staging bucket
-- Allow public read access to gallery-staging bucket
CREATE POLICY "Public read access to gallery-staging" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-staging');

-- Allow authenticated users to upload to gallery-staging
CREATE POLICY "Authenticated users can upload to gallery-staging" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery-staging' AND auth.role() = 'authenticated');

-- Allow users to update their own files in gallery-staging
CREATE POLICY "Users can update own files in gallery-staging" ON storage.objects
  FOR UPDATE USING (bucket_id = 'gallery-staging' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files in gallery-staging
CREATE POLICY "Users can delete own files in gallery-staging" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery-staging' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gallery_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to automatically update updated_at
CREATE TRIGGER update_gallery_images_updated_at_trigger
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION update_gallery_images_updated_at();

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.gallery_images TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;