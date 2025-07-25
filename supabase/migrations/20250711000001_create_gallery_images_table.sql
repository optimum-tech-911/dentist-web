-- Create gallery_images table
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_uploaded_by ON public.gallery_images(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON public.gallery_images(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to view all images
CREATE POLICY "Allow authenticated users to view gallery images" ON public.gallery_images
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own images
CREATE POLICY "Allow authenticated users to insert gallery images" ON public.gallery_images
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Allow users to update their own images
CREATE POLICY "Allow users to update their own gallery images" ON public.gallery_images
    FOR UPDATE USING (auth.uid() = uploaded_by);

-- Allow users to delete their own images
CREATE POLICY "Allow users to delete their own gallery images" ON public.gallery_images
    FOR DELETE USING (auth.uid() = uploaded_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_gallery_images_updated_at 
    BEFORE UPDATE ON public.gallery_images 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 