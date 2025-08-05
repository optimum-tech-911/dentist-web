import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from '@/integrations/supabase/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a signed URL to a permanent public URL
 * @param url - The URL to convert (can be signed or already public)
 * @returns A permanent public URL
 */
export function convertToPublicUrl(url: string): string {
  // Check if it's already a public URL
  if (url.includes('/object/public/')) {
    return url;
  }
  
  // Check if it's a signed URL
  if (url.includes('/object/sign/')) {
    try {
      // Extract the file path from the signed URL
      const urlParts = url.split('/gallery/')[1]?.split('?')[0];
      if (urlParts) {
        // Convert to public URL
        const { data } = supabase.storage
          .from('gallery')
          .getPublicUrl(urlParts);
        
        return data?.publicUrl || url;
      }
    } catch (error) {
      console.error('Error converting URL:', error);
    }
  }
  
  return url;
}
