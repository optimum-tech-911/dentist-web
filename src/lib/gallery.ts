import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type GalleryImage = Database['public']['Tables']['gallery_images']['Row'] & {
  url: string;
};

// Environment-based bucket selection
const getGalleryBucket = () => {
  const isDev = import.meta.env.DEV;
  const isStaging = import.meta.env.VITE_ENVIRONMENT === 'staging';
  
  if (isDev || isStaging) {
    return 'gallery-staging';
  }
  return 'gallery';
};

export class GalleryService {
  /**
   * Upload an image to the gallery
   */
  static async uploadImage(file: File, userId?: string): Promise<GalleryImage | null> {
    try {
      // Get userId if not provided
      let uid = userId;
      if (!uid) {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user?.id) throw new Error('Utilisateur non authentifié.');
        uid = authData.user.id;
      }
      
      // Sanitize filename to avoid URL issues
      const sanitizeFileName = (name: string) => {
        return name
          .replace(/\s+/g, '_') // Replace spaces with underscores
          .toLowerCase() // Convert to lowercase
          .replace(/[^a-z0-9._-]/g, '') // Remove special characters except dots, underscores, hyphens
          .replace(/_{2,}/g, '_') // Replace multiple underscores with single
          .replace(/\.{2,}/g, '.') // Replace multiple dots with single
          .replace(/^\.+|\.+$/g, ''); // Remove leading/trailing dots
      };
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const sanitizedName = sanitizeFileName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension first
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${sanitizedName}.${fileExt}`;
      const filePath = `${uid}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(getGalleryBucket())
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL (no expiry)
      const { data: urlData } = supabase.storage
        .from(getGalleryBucket())
        .getPublicUrl(filePath);

      // Save metadata to database
      const { data: dbData, error: dbError } = await supabase
        .from('gallery_images')
        .insert({
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: uid
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from(getGalleryBucket()).remove([filePath]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      return {
        ...dbData,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Gallery upload error:', error);
      throw error;
    }
  }

  /**
   * Get all gallery images
   */
  static async getImages(): Promise<GalleryImage[]> {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Ensure data is an array
      if (!data || !Array.isArray(data)) {
        console.warn('No data returned from gallery_images table');
        return [];
      }

      // Get public URLs for all images (no expiry)
      const imagesWithUrls = data
        .filter(image => image && image.file_path) // Filter out invalid images
        .map((image) => {
          try {
            const { data: urlData } = supabase.storage
              .from(getGalleryBucket())
              .getPublicUrl(image.file_path);

            return {
              ...image,
              url: urlData?.publicUrl || ''
            };
          } catch (urlError) {
            console.warn('Error getting URL for image:', image.file_path, urlError);
            return {
              ...image,
              url: ''
            };
          }
        })
        .filter(image => image && image.id); // Filter out images without ID

      return imagesWithUrls;

    } catch (error) {
      console.error('Gallery fetch error:', error);
      // Return empty array instead of throwing to prevent page crash
      return [];
    }
  }

  /**
   * Delete an image from the gallery
   */
  static async deleteImage(imageId: string, filePath: string): Promise<void> {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(getGalleryBucket())
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        console.error('Database delete error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

    } catch (error) {
      console.error('Gallery delete error:', error);
      throw error;
    }
  }

  /**
   * Get a single image by ID
   */
  static async getImageById(imageId: string): Promise<GalleryImage | null> {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('id', imageId)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Get public URL (no expiry)
      const { data: urlData } = supabase.storage
        .from(getGalleryBucket())
        .getPublicUrl(data.file_path);

      return {
        ...data,
        url: urlData.publicUrl
      };

    } catch (error) {
      console.error('Gallery get image error:', error);
      throw error;
    }
  }

  /**
   * Convert temporary signed URLs to public URLs in article content
   */
  static async convertTemporaryUrlsInContent(content: string): Promise<string> {
    console.log('🔄 convertTemporaryUrlsInContent called with content length:', content?.length);
    
    if (!content) {
      console.log('⏭️ No content to process');
      return content;
    }

    // Find all img tags with gallery signed URLs
    const imgRegex = /<img[^>]+src="([^"]*\/storage\/v1\/object\/sign\/gallery\/[^"]*)"[^>]*>/g;
    let updatedContent = content;
    let match;
    let conversionCount = 0;

    // Reset regex state
    imgRegex.lastIndex = 0;
    
    console.log('🔍 Searching for signed URLs in content...');
    
    while ((match = imgRegex.exec(content)) !== null) {
      const signedUrl = match[1];
      console.log('🔍 Found signed URL in content:', signedUrl);
      try {
        // Extract file path from the signed URL
        const urlParts = signedUrl.split('/gallery/')[1]?.split('?')[0];
        if (urlParts) {
          console.log('🔍 Extracted file path:', urlParts);
          // Convert to public URL
          const { data } = supabase.storage
            .from(getGalleryBucket())
            .getPublicUrl(urlParts);
          
          if (data?.publicUrl) {
            // Replace the signed URL with public URL
            updatedContent = updatedContent.replace(signedUrl, data.publicUrl);
            conversionCount++;
            console.log('✅ Converted content image URL:', signedUrl, '→', data.publicUrl);
          }
        }
      } catch (error) {
        console.log('Could not convert signed URL to public URL:', error);
      }
    }

    console.log(`✅ Content processing complete. Converted ${conversionCount} signed URLs to public URLs`);
    return updatedContent;
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check if file exists
    if (!file) {
      return { isValid: false, error: 'Aucun fichier sélectionné.' };
    }

    // Check if file has required properties
    if (!file.name || !file.type || file.size === undefined) {
      return { isValid: false, error: 'Fichier invalide.' };
    }

    // Allow images and videos
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    
    if (!allowedImageTypes.includes(file.type) && !allowedVideoTypes.includes(file.type)) {
      return { isValid: false, error: `${file.name} n'est pas un fichier image ou vidéo valide.` };
    }
    
    // Check file size (max 20MB for video, 5MB for image)
    if (allowedImageTypes.includes(file.type) && file.size > 5 * 1024 * 1024) {
      return { isValid: false, error: `${file.name} est trop volumineux (max 5MB pour les images).` };
    }
    if (allowedVideoTypes.includes(file.type) && file.size > 20 * 1024 * 1024) {
      return { isValid: false, error: `${file.name} est trop volumineux (max 20MB pour les vidéos).` };
    }
    return { isValid: true };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (!bytes || isNaN(bytes) || bytes < 0) return '0 Bytes';
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    // Ensure i is within bounds
    const sizeIndex = Math.min(i, sizes.length - 1);
    return parseFloat((bytes / Math.pow(k, sizeIndex)).toFixed(2)) + ' ' + sizes[sizeIndex];
  }
} 