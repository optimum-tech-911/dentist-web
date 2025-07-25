# Media Files Disappearing Issue - RESOLVED

## Problem Description

Photos and videos in the application were disappearing after approximately 1 hour, showing as broken image icons instead of the actual media content.

## Root Cause Analysis

The issue was caused by the use of **Supabase signed URLs with a 1-hour expiry time (3600 seconds)** for serving media files from the gallery storage bucket. 

### Key Issues:
1. **Signed URLs with expiry**: The `GalleryService.getImages()` and related methods were using `createSignedUrl(filePath, 3600)` which creates URLs that expire after 1 hour.
2. **URL regeneration**: Once expired, the URLs became invalid and media would not load.
3. **Performance impact**: Each page load required new signed URL generation, adding unnecessary API calls.

## Solution Implemented

### 1. Switched to Public URLs
- **Changed from**: `createSignedUrl(filePath, 3600)` (expires in 1 hour)
- **Changed to**: `getPublicUrl(filePath)` (permanent URLs, no expiry)

This is safe because:
- The gallery storage bucket is already configured as **public** (`public: true`)
- Media files are not sensitive data
- Access control is still enforced for upload/delete operations through RLS policies

### 2. Updated Gallery Service Methods

**Updated methods in `src/lib/gallery.ts`:**
- `uploadImage()`: Now generates public URLs for newly uploaded files
- `getImages()`: Returns public URLs for all gallery images/videos
- `getImageById()`: Returns public URL for a specific media file

### 3. Enhanced Video Support
- Updated storage bucket to support video files (`video/mp4`, `video/webm`, `video/ogg`)
- Increased file size limit from 5MB to 20MB to accommodate videos
- Gallery components already supported both images and videos

### 4. Database Migration
Created migration `20250719000000_update_gallery_bucket_for_videos.sql` to:
- Update bucket file size limit to 20MB
- Add video MIME types to allowed types
- Update storage policies to reflect "media" instead of just "images"

## Files Modified

1. **`src/lib/gallery.ts`** - Main fix: switched from signed URLs to public URLs
2. **`supabase/migrations/20250711000002_create_gallery_storage_bucket.sql`** - Updated initial bucket config
3. **`supabase/migrations/20250719000000_update_gallery_bucket_for_videos.sql`** - New migration for existing installations

## Benefits of the Fix

1. **No more disappearing media**: Public URLs never expire
2. **Better performance**: No need to generate signed URLs on each request
3. **Simplified codebase**: Removed async URL generation in `getImages()`
4. **CDN optimization**: Public URLs can be better cached by CDNs
5. **Video support**: Full support for video files alongside images

## Security Considerations

- The gallery bucket remains secure for write operations (upload/delete) through RLS policies
- Only authenticated users can upload/modify/delete media
- Public URLs only allow read access, which is appropriate for gallery content
- Media files are not sensitive personal data that require private access

## Verification

The build completes successfully without TypeScript errors, confirming all changes are compatible with the existing codebase.

## Future Recommendations

1. **Monitor storage usage**: With video support and 20MB limit, monitor storage quotas
2. **Image optimization**: Consider implementing automatic image compression for large uploads
3. **CDN configuration**: Leverage Supabase's CDN for better global performance
4. **Backup strategy**: Ensure media files are included in backup procedures

## Rollback Plan

If needed, the changes can be rolled back by:
1. Reverting `src/lib/gallery.ts` to use `createSignedUrl()`
2. Running a migration to revert bucket settings
3. However, this would restore the original issue of disappearing media

The current solution is the recommended approach for gallery-type media storage.