import { supabase } from '@/integrations/supabase/client';
import { GalleryService, type GalleryImage } from './gallery';
import { convertToPublicUrl } from '@/lib/utils';

export interface HealthCheckResult {
  totalImages: number;
  brokenImages: GalleryImage[];
  workingImages: GalleryImage[];
  timestamp: Date;
}

/**
 * Health check for gallery images
 * Verifies that all image URLs return 200 OK
 */
export async function checkGalleryHealth(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    totalImages: 0,
    brokenImages: [],
    workingImages: [],
    timestamp: new Date()
  };

  try {
    // Get latest images from gallery
    const images = await GalleryService.getImages();
    result.totalImages = images.length;

    // Test each image URL
    const healthChecks = await Promise.allSettled(
      images.map(async (image) => {
        const publicUrl = convertToPublicUrl(image.url);
        
        try {
          const response = await fetch(publicUrl, { 
            method: 'HEAD',
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });
          
          if (response.ok) {
            return { image, status: 'working', url: publicUrl };
          } else {
            console.warn(`Image health check failed: ${image.name} (${response.status})`);
            return { image, status: 'broken', url: publicUrl, statusCode: response.status };
          }
        } catch (error) {
          console.error(`Image health check error: ${image.name}`, error);
          return { image, status: 'broken', url: publicUrl, error: error.message };
        }
      })
    );

    // Process results
    healthChecks.forEach((check) => {
      if (check.status === 'fulfilled') {
        const { image, status } = check.value;
        if (status === 'working') {
          result.workingImages.push(image);
        } else {
          result.brokenImages.push(image);
        }
      }
    });

    // Log results
    if (result.brokenImages.length > 0) {
      console.error('Gallery Health Check - Broken Images Found:', {
        total: result.totalImages,
        broken: result.brokenImages.length,
        brokenImages: result.brokenImages.map(img => ({
          id: img.id,
          name: img.name,
          file_path: img.file_path,
          url: img.url
        }))
      });
    } else {
      console.log('Gallery Health Check - All images working:', {
        total: result.totalImages,
        working: result.workingImages.length
      });
    }

    return result;

  } catch (error) {
    console.error('Gallery health check failed:', error);
    throw error;
  }
}

/**
 * Quick health check for latest 3 images (for dashboard indicator)
 */
export async function quickHealthCheck(): Promise<{ status: 'healthy' | 'warning' | 'error', brokenCount: number }> {
  try {
    const images = await GalleryService.getImages();
    const latestImages = images.slice(0, 3);
    
    const checks = await Promise.allSettled(
      latestImages.map(async (image) => {
        const publicUrl = convertToPublicUrl(image.url);
        const response = await fetch(publicUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        return response.ok;
      })
    );

    const brokenCount = checks.filter(check => 
      check.status === 'rejected' || (check.status === 'fulfilled' && !check.value)
    ).length;

    if (brokenCount === 0) {
      return { status: 'healthy', brokenCount: 0 };
    } else if (brokenCount <= 1) {
      return { status: 'warning', brokenCount };
    } else {
      return { status: 'error', brokenCount };
    }

  } catch (error) {
    console.error('Quick health check failed:', error);
    return { status: 'error', brokenCount: -1 };
  }
}

/**
 * Send health check report via email (if email service is available)
 */
export async function sendHealthCheckReport(result: HealthCheckResult): Promise<void> {
  try {
    // This would integrate with your email service
    // For now, just log the report
    const report = {
      subject: `Gallery Health Check Report - ${result.timestamp.toISOString()}`,
      body: `
        Gallery Health Check Results:
        
        Total Images: ${result.totalImages}
        Working Images: ${result.workingImages.length}
        Broken Images: ${result.brokenImages.length}
        
        ${result.brokenImages.length > 0 ? `
        Broken Images:
        ${result.brokenImages.map(img => 
          `- ${img.name} (ID: ${img.id}, Path: ${img.file_path})`
        ).join('\n')}
        ` : 'All images are working correctly!'}
      `
    };

    console.log('Health Check Report:', report);
    
    // TODO: Integrate with email service when available
    // await sendEmail(report.subject, report.body);
    
  } catch (error) {
    console.error('Failed to send health check report:', error);
  }
}