# Gallery Setup with Supabase Storage

This document explains how to set up the gallery functionality using Supabase storage for the UFSBD website.

## Database Setup

### 1. Run Migrations

The following migrations need to be applied to your Supabase database:

1. **Create gallery_images table** (`20250711000001_create_gallery_images_table.sql`)
   - Creates the `gallery_images` table to store image metadata
   - Sets up Row Level Security (RLS) policies
   - Creates indexes for better performance

2. **Create gallery storage bucket** (`20250711000002_create_gallery_storage_bucket.sql`)
   - Creates the `gallery` storage bucket
   - Sets up storage policies for authenticated users
   - Configures file size limits (5MB) and allowed MIME types

### 2. Manual Setup Steps

If you prefer to set up manually through the Supabase dashboard:

#### Database Table
```sql
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

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to view gallery images" ON public.gallery_images
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert gallery images" ON public.gallery_images
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Allow users to update their own gallery images" ON public.gallery_images
    FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Allow users to delete their own gallery images" ON public.gallery_images
    FOR DELETE USING (auth.uid() = uploaded_by);
```

#### Storage Bucket
1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `gallery`
3. Set it as public
4. Set file size limit to 5MB
5. Add allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`

#### Storage Policies
```sql
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
```

## Features

### Gallery Management
- **Upload Images**: Drag and drop or click to upload multiple images
- **Image Validation**: Automatic validation of file type and size
- **Image Preview**: Click on images to view full-size preview
- **Delete Images**: Remove images from both storage and database
- **Copy URLs**: Copy image URLs for use in articles or other content

### Security
- **Authentication Required**: Only authenticated users can upload/delete images
- **Row Level Security**: Users can only manage their own uploaded images
- **File Validation**: Server-side validation of file types and sizes
- **Secure URLs**: Signed URLs with expiration for secure access

### Integration
- **Article Writing**: Images can be selected and inserted into articles
- **Organigram**: Profile pictures can be selected from the gallery
- **Responsive Design**: Gallery works on all device sizes

## Usage

### For Administrators
1. Navigate to Admin Panel → Gallery Management
2. Upload images using the upload button
3. Manage existing images (preview, delete, copy URLs)
4. Use image URLs in articles or other content

### For Article Writers
1. When writing articles, use the gallery integration to select images
2. Copy image URLs from the gallery for embedding
3. Images are automatically optimized and served via CDN

## Technical Details

### File Storage
- Images are stored in Supabase Storage bucket `gallery`
- Unique filenames are generated to prevent conflicts
- Images are served via Supabase CDN for fast loading

### Database Schema
```typescript
interface GalleryImage {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  url: string; // Generated signed URL
}
```

### API Endpoints
The gallery uses the following Supabase operations:
- `storage.from('gallery').upload()` - Upload images
- `storage.from('gallery').remove()` - Delete images
- `storage.from('gallery').createSignedUrl()` - Generate access URLs
- `from('gallery_images').select()` - Fetch image metadata
- `from('gallery_images').insert()` - Save image metadata
- `from('gallery_images').delete()` - Remove image metadata

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size (max 5MB)
   - Verify file type is supported
   - Ensure user is authenticated

2. **Images Not Loading**
   - Check storage bucket permissions
   - Verify RLS policies are correct
   - Check network connectivity

3. **Permission Errors**
   - Ensure user has proper authentication
   - Check RLS policies match user role
   - Verify storage bucket is public

### Debug Steps
1. Check browser console for errors
2. Verify Supabase connection in client configuration
3. Test storage bucket permissions in Supabase dashboard
4. Check database policies are correctly applied

## Future Enhancements

- Image compression and optimization
- Bulk upload functionality
- Image categories and tags
- Advanced search and filtering
- Image editing capabilities
- Integration with external image services 