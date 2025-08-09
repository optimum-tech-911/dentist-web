import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from '@/integrations/supabase/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Prefer the primary 'gallery' bucket, with fallback to 'gallery-staging' if needed
const PRIMARY_BUCKET = 'gallery';
const FALLBACK_BUCKET = 'gallery-staging';

function getPublicUrlFromBucket(bucket: string, path: string): string | '' {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || '';
  } catch {
    return '';
  }
}

/**
 * Convert any URL or file path to a permanent public URL
 * @param url - The URL or file path to convert
 * @returns A permanent public URL
 */
export function convertToPublicUrl(url: string): string {
  if (!url) return '';

  // Already a public URL
  if (url.includes('/object/public/')) return url;

  // Signed URL → extract path and build public URL from gallery bucket
  if (url.includes('/object/sign/')) {
    const afterGallery = url.split('/gallery/')[1]?.split('?')[0] || '';
    if (afterGallery) {
      // Try primary, then fallback bucket
      return (
        getPublicUrlFromBucket(PRIMARY_BUCKET, afterGallery) ||
        getPublicUrlFromBucket(FALLBACK_BUCKET, afterGallery) ||
        url
      );
    }
  }

  // Raw storage path (no http)
  if (!url.startsWith('http')) {
    // Remove optional leading 'gallery/' and query params
    const cleanPath = (url.startsWith('gallery/') ? url.substring(8) : url).split('?')[0];
    // Try primary, then fallback bucket
    return (
      getPublicUrlFromBucket(PRIMARY_BUCKET, cleanPath) ||
      getPublicUrlFromBucket(FALLBACK_BUCKET, cleanPath) ||
      ''
    );
  }

  // Full URL
  if (url.startsWith('http')) return url;

  // Unknown format
  return '';
}

/**
 * Create a proxy URL for images to avoid CORS issues
 * This can be used as a fallback when direct loading fails
 */
export function createImageProxyUrl(url: string): string {
  return url;
}

export function loadImageWithFallback(
  src: string, 
  onError: (event: Event) => void,
  fallbackSrc: string = ''
): void {
  const img = new Image();
  
  img.onload = () => {};
  
  img.onerror = (event) => {
    if (src !== fallbackSrc) {
      loadImageWithFallback(fallbackSrc, onError, '/placeholder.svg');
    } else {
      onError(event);
    }
  };
  
  img.crossOrigin = 'anonymous';
  img.src = src;
}
