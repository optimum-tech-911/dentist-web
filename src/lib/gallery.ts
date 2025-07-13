import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type GalleryImage = Database['public']['Tables']['gallery_images']['Row'] & {
  url: string;
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
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${uid}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get signed URL
      const { data: urlData } = await supabase.storage
        .from('gallery')
        .createSignedUrl(filePath, 3600);

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
        await supabase.storage.from('gallery').remove([filePath]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      return {
        ...dbData,
        url: urlData?.signedUrl || ''
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

      if (error) throw error;

      // Get signed URLs for all images
      const imagesWithUrls = await Promise.all(
        data.map(async (image) => {
          const { data: urlData } = await supabase.storage
            .from('gallery')
            .createSignedUrl(image.file_path, 3600); // 1 hour expiry

          return {
            ...image,
            url: urlData?.signedUrl || ''
          };
        })
      );

      return imagesWithUrls;

    } catch (error) {
      console.error('Gallery fetch error:', error);
      throw error;
    }
  }

  /**
   * Delete an image from the gallery
   */
  static async deleteImage(imageId: string, filePath: string): Promise<void> {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('gallery')
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

      // Get signed URL
      const { data: urlData } = await supabase.storage
        .from('gallery')
        .createSignedUrl(data.file_path, 3600);

      return {
        ...data,
        url: urlData?.signedUrl || ''
      };

    } catch (error) {
      console.error('Gallery get image error:', error);
      throw error;
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: `${file.name} n'est pas une image valide.` };
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { isValid: false, error: `${file.name} est trop volumineux (max 5MB).` };
    }

    return { isValid: true };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 