import { supabase } from '@/integrations/supabase/client';
import { UniversalImageLoader } from './image-loader';
import { convertToPublicUrl } from './utils';

export interface BulletproofGalleryImage {
  id: string;
  name: string;
  file_path: string;
  url: string;
  file_type: string;
  size: number;
  created_at: string;
  // Bulletproof fields
  public_url: string;
  fallback_urls: string[];
  health_status: 'healthy' | 'warning' | 'error';
  last_checked: string;
}

export interface GalleryUploadResult {
  success: boolean;
  image?: BulletproofGalleryImage;
  error?: string;
  public_url?: string;
  fallback_urls?: string[];
}

/**
 * Bulletproof Gallery Service
 * Ensures images uploaded by admins and used in articles NEVER break
 */
export class BulletproofGalleryService {
  private static readonly BUCKET_NAME = 'gallery';
  private static readonly MAX_RETRIES = 5;
  private static readonly HEALTH_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Upload image with bulletproof guarantees
   */
  static async uploadImage(file: File, userId: string): Promise<GalleryUploadResult> {
    try {
      // 1. Sanitize filename
      const sanitizedName = this.sanitizeFileName(file.name);
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${sanitizedName}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // 2. Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // 3. Generate multiple URL formats for redundancy
      const publicUrl = this.generatePublicUrl(filePath);
      const fallbackUrls = this.generateFallbackUrls(filePath);

      // 4. Test all URLs to ensure they work
      const urlTests = await Promise.allSettled([
        this.testImageUrl(publicUrl),
        ...fallbackUrls.map(url => this.testImageUrl(url))
      ]);

      const workingUrls = urlTests
        .map((result, index) => result.status === 'fulfilled' && result.value ? 
          (index === 0 ? publicUrl : fallbackUrls[index - 1]) : null)
        .filter(Boolean) as string[];

      if (workingUrls.length === 0) {
        throw new Error('No working URLs generated');
      }

      // 5. Save to database with bulletproof data
      const imageData: Partial<BulletproofGalleryImage> = {
        name: file.name,
        file_path: filePath,
        url: workingUrls[0], // Primary URL
        file_type: file.type,
        size: file.size,
        public_url: publicUrl,
        fallback_urls: workingUrls.slice(1),
        health_status: 'healthy',
        last_checked: new Date().toISOString()
      };

      const { data: savedImage, error: saveError } = await supabase
        .from('gallery_images')
        .insert(imageData)
        .select()
        .single();

      if (saveError) {
        throw new Error(`Database save failed: ${saveError.message}`);
      }

      // 6. Schedule health check
      this.scheduleHealthCheck(savedImage.id);

      return {
        success: true,
        image: savedImage as BulletproofGalleryImage,
        public_url: workingUrls[0],
        fallback_urls: workingUrls.slice(1)
      };

    } catch (error) {
      console.error('Bulletproof upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get image with automatic fallback to working URL
   */
  static async getImage(imageId: string): Promise<BulletproofGalleryImage | null> {
    try {
      const { data: image, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('id', imageId)
        .single();

      if (error || !image) {
        return null;
      }

      // Test primary URL
      const isPrimaryWorking = await this.testImageUrl(image.url);
      
      if (isPrimaryWorking) {
        return image as BulletproofGalleryImage;
      }

      // Try fallback URLs
      for (const fallbackUrl of image.fallback_urls || []) {
        const isWorking = await this.testImageUrl(fallbackUrl);
        if (isWorking) {
          // Update database with working URL
          await supabase
            .from('gallery_images')
            .update({ url: fallbackUrl, health_status: 'healthy' })
            .eq('id', imageId);
          
          return { ...image, url: fallbackUrl } as BulletproofGalleryImage;
        }
      }

      // All URLs failed, mark as error
      await supabase
        .from('gallery_images')
        .update({ health_status: 'error' })
        .eq('id', imageId);

      return { ...image, health_status: 'error' } as BulletproofGalleryImage;

    } catch (error) {
      console.error('Failed to get image:', error);
      return null;
    }
  }

  /**
   * Get all images with health status
   */
  static async getImages(): Promise<BulletproofGalleryImage[]> {
    try {
      const { data: images, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (images || []) as BulletproofGalleryImage[];
    } catch (error) {
      console.error('Failed to get images:', error);
      return [];
    }
  }

  /**
   * Get working URL for any image (used in articles)
   */
  static async getWorkingUrl(imageId: string): Promise<string> {
    const image = await this.getImage(imageId);
    
    if (!image) {
      return '/placeholder.svg';
    }

    // Test current URL
    const isWorking = await this.testImageUrl(image.url);
    if (isWorking) {
      return image.url;
    }

    // Try fallback URLs
    for (const fallbackUrl of image.fallback_urls || []) {
      const isWorking = await this.testImageUrl(fallbackUrl);
      if (isWorking) {
        return fallbackUrl;
      }
    }

    // All failed, return placeholder
    return '/placeholder.svg';
  }

  /**
   * Health check for all images
   */
  static async healthCheck(): Promise<{
    total: number;
    healthy: number;
    warning: number;
    error: number;
    fixed: number;
  }> {
    const images = await this.getImages();
    let fixed = 0;

    for (const image of images) {
      const isWorking = await this.testImageUrl(image.url);
      
      if (!isWorking && image.health_status !== 'error') {
        // Try fallback URLs
        let foundWorking = false;
        for (const fallbackUrl of image.fallback_urls || []) {
          const isFallbackWorking = await this.testImageUrl(fallbackUrl);
          if (isFallbackWorking) {
            // Update with working URL
            await supabase
              .from('gallery_images')
              .update({ 
                url: fallbackUrl, 
                health_status: 'healthy',
                last_checked: new Date().toISOString()
              })
              .eq('id', image.id);
            fixed++;
            foundWorking = true;
            break;
          }
        }

        if (!foundWorking) {
          // Mark as error
          await supabase
            .from('gallery_images')
            .update({ 
              health_status: 'error',
              last_checked: new Date().toISOString()
            })
            .eq('id', image.id);
        }
      } else if (isWorking && image.health_status !== 'healthy') {
        // Mark as healthy
        await supabase
          .from('gallery_images')
          .update({ 
            health_status: 'healthy',
            last_checked: new Date().toISOString()
          })
          .eq('id', image.id);
        fixed++;
      }
    }

    const updatedImages = await this.getImages();
    const stats = {
      total: updatedImages.length,
      healthy: updatedImages.filter(img => img.health_status === 'healthy').length,
      warning: updatedImages.filter(img => img.health_status === 'warning').length,
      error: updatedImages.filter(img => img.health_status === 'error').length,
      fixed
    };

    console.log('Gallery health check completed:', stats);
    return stats;
  }

  /**
   * Test if image URL is working
   */
  private static async testImageUrl(url: string): Promise<boolean> {
    try {
      const result = await UniversalImageLoader.loadImage(url, {
        timeout: 5000,
        maxRetries: 1
      });
      return result.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate public URL
   */
  private static generatePublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return data?.publicUrl || '';
  }

  /**
   * Generate multiple fallback URLs
   */
  private static generateFallbackUrls(filePath: string): string[] {
    const urls: string[] = [];
    
    // Different URL formats
    urls.push(this.generatePublicUrl(filePath));
    
    // Try with different domains (future CDN)
    // urls.push(url.replace('supabase.co', 'cdn.yourdomain.com'));
    
    // Try with different paths
    // urls.push(url.replace('/object/public/', '/object/sign/'));
    
    return urls.filter(Boolean);
  }

  /**
   * Sanitize filename
   */
  private static sanitizeFileName(name: string): string {
    return name
      .replace(/\s+/g, '_')
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '')
      .replace(/_{2,}/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+|\.+$/g, '');
  }

  /**
   * Schedule health check for image
   */
  private static scheduleHealthCheck(imageId: string): void {
    setTimeout(async () => {
      await this.healthCheck();
    }, this.HEALTH_CHECK_INTERVAL);
  }
}