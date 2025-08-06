import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from '@/integrations/supabase/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Environment-based bucket selection
const getGalleryBucket = () => {
  const isDev = import.meta.env.DEV;
  const isStaging = import.meta.env.VITE_ENVIRONMENT === 'staging';
  
  if (isDev || isStaging) {
    return 'gallery-staging';
  }
  return 'gallery';
};

/**
 * Convert any URL or file path to a permanent public URL
 * @param url - The URL or file path to convert
 * @returns A permanent public URL
 */
export function convertToPublicUrl(url: string): string {
  if (!url) {
    return '/placeholder.svg';
  }

  // Check if it's already a public URL
  if (url.includes('/object/public/')) {
    return url;
  }
  
  // Check if it's a signed URL
  if (url.includes('/object/sign/')) {
    console.warn('⚠️ Signed URL detected — converting to public URL:', url);
    try {
      // Extract the file path from the signed URL
      const urlParts = url.split('/gallery/')[1]?.split('?')[0];
      if (urlParts) {
        // Convert to public URL
        const { data } = supabase.storage
          .from(getGalleryBucket())
          .getPublicUrl(urlParts);
        
        return data?.publicUrl || url;
      }
    } catch (error) {
      console.error('Error converting signed URL:', error);
    }
  }

  // Check if it's a raw file path (doesn't start with http)
  if (!url.startsWith('http')) {
    console.log('🔄 Converting raw file path to public URL:', url);
    try {
      // Convert raw path to public URL
      const { data } = supabase.storage
        .from(getGalleryBucket())
        .getPublicUrl(url);
      
      if (data?.publicUrl) {
        console.log('✅ Converted to public URL:', data.publicUrl);
        return data.publicUrl;
      } else {
        console.error('❌ Failed to generate public URL for:', url);
        return '/placeholder.svg';
      }
    } catch (error) {
      console.error('Error converting raw path:', error);
      return '/placeholder.svg';
    }
  }
  
  // If it's already a full URL, return as-is
  if (url.startsWith('http')) {
    return url;
  }

  // Fallback to placeholder
  console.warn('⚠️ Unknown URL format, using placeholder:', url);
  return '/placeholder.svg';
}

/**
 * Create a proxy URL for images to avoid CORS issues
 * This can be used as a fallback when direct loading fails
 */
export function createImageProxyUrl(url: string): string {
  // For now, return the original URL
  // In production, you might want to set up a proxy endpoint
  return url;
}

/**
 * Enhanced image loading with fallback
 * @param src - The image source URL
 * @param onError - Error handler
 * @param fallbackSrc - Fallback image source
 */
export function loadImageWithFallback(
  src: string, 
  onError: (event: Event) => void,
  fallbackSrc: string = '/placeholder.svg'
): void {
  const img = new Image();
  
  img.onload = () => {
    // Image loaded successfully
    console.log('Image loaded successfully:', src);
  };
  
  img.onerror = (event) => {
    console.warn('Image failed to load:', src, event);
    
    // Try the fallback
    if (src !== fallbackSrc) {
      console.log('Trying fallback image:', fallbackSrc);
      loadImageWithFallback(fallbackSrc, onError, '/placeholder.svg');
    } else {
      // Even fallback failed, call the error handler
      onError(event);
    }
  };
  
  // Add crossOrigin attribute to handle CORS
  img.crossOrigin = 'anonymous';
  img.src = src;
}
