import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BulletproofBlogImageProps {
  src: string;
  alt: string;
  className?: string;
  title?: string;
  postId?: string;
}

export function BulletproofBlogImage({ src, alt, className = '', title = '', postId }: BulletproofBlogImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [fallbackLevel, setFallbackLevel] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // Ultra-aggressive fallback URLs - focuses on finding the EXACT image
  const getFallbackUrls = (originalSrc: string): string[] => {
    const urls: string[] = [];
    
    if (!originalSrc) return urls;
    
    // Level 0: Original converted URL
    const convertedUrl = convertToPublicUrl(originalSrc);
    if (convertedUrl) urls.push(convertedUrl);
    
    // Level 1: If it's already a path, try direct Supabase variations
    if (!originalSrc.startsWith('http')) {
      let cleanPath = originalSrc;
      
      // Remove prefixes
      if (cleanPath.startsWith('gallery/')) {
        cleanPath = cleanPath.substring(8);
      }
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
      }
      
      // Try multiple bucket and path combinations
      const buckets = ['gallery', 'images', 'uploads', 'public', 'storage'];
      buckets.forEach(bucket => {
        urls.push(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/${bucket}/${cleanPath}`);
      });
      
      // Try with gallery prefix maintained
      if (originalSrc.startsWith('gallery/')) {
        urls.push(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/${originalSrc}`);
      }
    }
    
    // Level 2: Try original URL as-is
    if (originalSrc.includes('/')) {
      urls.push(originalSrc);
    }
    
    // Level 3: Try different protocols
    if (originalSrc.startsWith('https://')) {
      urls.push(originalSrc.replace('https://', 'http://'));
    } else if (originalSrc.startsWith('http://')) {
      urls.push(originalSrc.replace('http://', 'https://'));
    }
    
    // Level 4: Try signed URL creation
    if (!originalSrc.startsWith('http')) {
      // We'll handle this async in the loading process
    }
    
    // Level 5: Try with different file extensions (in case of extension issues)
    const extensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    const baseUrl = originalSrc.split('.')[0];
    extensions.forEach(ext => {
      if (!originalSrc.endsWith(ext)) {
        urls.push(convertToPublicUrl(baseUrl + ext));
      }
    });
    
    return urls.filter((url, index, self) => url && self.indexOf(url) === index);
  };

  // Convert URL to public URL
  function convertToPublicUrl(url: string): string {
    if (!url) return '';
    
    // Already a full URL
    if (url.startsWith('http')) return url;
    
    // Already a public URL
    if (url.includes('/object/public/')) return url;
    
    // Convert signed URL
    if (url.includes('/object/sign/')) {
      try {
        const urlParts = url.split('/gallery/')[1]?.split('?')[0];
        if (urlParts) {
          const { data } = supabase.storage.from('gallery').getPublicUrl(urlParts);
          return data?.publicUrl || url;
        }
      } catch (error) {
        console.warn('Error converting signed URL:', error);
      }
    }
    
    // Raw file path
    let cleanPath = url;
    if (url.startsWith('gallery/')) {
      cleanPath = url.substring(8);
    }
    if (url.startsWith('/')) {
      cleanPath = url.substring(1);
    }
    
    try {
      const { data } = supabase.storage.from('gallery').getPublicUrl(cleanPath);
      return data?.publicUrl || '';
    } catch (error) {
      console.warn('Error generating public URL:', error);
      return '';
    }
  }

  // Get signed URL as additional fallback
  async function getSignedUrl(path: string): Promise<string[]> {
    const signedUrls: string[] = [];
    
    try {
      let cleanPath = path;
      if (path.startsWith('gallery/')) {
        cleanPath = path.substring(8);
      }
      if (path.startsWith('/')) {
        cleanPath = path.substring(1);
      }
      
      // Try different buckets for signed URLs
      const buckets = ['gallery', 'images', 'uploads'];
      
      for (const bucket of buckets) {
        try {
          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(cleanPath, 3600); // 1 hour expiry
          
          if (!error && data?.signedUrl) {
            signedUrls.push(data.signedUrl);
          }
        } catch (bucketError) {
          console.warn(`Failed to get signed URL from ${bucket}:`, bucketError);
        }
      }
    } catch (error) {
      console.warn('Error creating signed URLs:', error);
    }
    
    return signedUrls;
  }

  // Try loading an image URL with extended timeout for slow connections
  const tryLoadImage = (url: string, timeout: number = 15000): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url) {
        resolve(false);
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const timeoutId = setTimeout(() => {
        resolve(false);
      }, timeout);
      
      img.onload = () => {
        clearTimeout(timeoutId);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };
      
      img.src = url;
    });
  };

  // Load image with aggressive fallback chain
  useEffect(() => {
    let isMounted = true;
    
    const loadImageChain = async () => {
      setIsLoading(true);
      setHasError(false);
      
      // Check cache first
      const cachedImage = await getCachedImage(src);
      if (cachedImage && isMounted) {
        console.log(`📦 Using cached image for "${title}"`);
        setCurrentSrc(cachedImage);
        setIsLoading(false);
        setHasError(false);
        setFallbackLevel(0);
        return;
      }
      
      const fallbackUrls = getFallbackUrls(src);
      console.log(`🔍 Aggressively searching for exact image "${title}" with ${fallbackUrls.length} URL variants`);
      
      // Try each URL with increasing timeout (first attempts are faster)
      for (let i = 0; i < fallbackUrls.length; i++) {
        if (!isMounted) return;
        
        const url = fallbackUrls[i];
        const timeout = Math.min(5000 + (i * 2000), 20000); // Progressively longer timeouts
        
        console.log(`🔎 Attempt ${i + 1}/${fallbackUrls.length}: ${url} (timeout: ${timeout}ms)`);
        
        const success = await tryLoadImage(url, timeout);
        
        if (success && isMounted) {
          console.log(`✅ FOUND THE EXACT IMAGE! URL ${i + 1}: ${url}`);
          setCurrentSrc(url);
          setIsLoading(false);
          setHasError(false);
          setFallbackLevel(i);
          
          // Cache successful URL
          await cacheImage(url);
          return;
        }
      }
      
      // Try signed URLs as additional fallback
      if (!src.startsWith('http') && isMounted) {
        console.log(`🔐 Trying signed URLs for: ${src}`);
        const signedUrls = await getSignedUrl(src);
        
        for (let i = 0; i < signedUrls.length; i++) {
          if (!isMounted) return;
          
          const url = signedUrls[i];
          console.log(`🔐 Signed URL attempt ${i + 1}/${signedUrls.length}: ${url}`);
          
          const success = await tryLoadImage(url, 15000);
          
          if (success && isMounted) {
            console.log(`✅ FOUND WITH SIGNED URL! ${url}`);
            setCurrentSrc(url);
            setIsLoading(false);
            setHasError(false);
            setFallbackLevel(fallbackUrls.length + i);
            
            await cacheImage(url);
            return;
          }
        }
      }
      
      // If we still haven't found the image, mark as failed
      if (isMounted) {
        console.error(`❌ EXACT IMAGE NOT FOUND after ${fallbackUrls.length} attempts: ${src}`);
        setHasError(true);
        setIsLoading(false);
        setFallbackLevel(999);
      }
    };

    loadImageChain();
    
    return () => {
      isMounted = false;
    };
  }, [src, title, alt, retryCount]);

  // Cache successful image
  async function cacheImage(url: string): Promise<void> {
    try {
      const { bulletproofImageCache } = await import('@/lib/bulletproof-image-cache');
      await bulletproofImageCache.preload(url);
      console.log(`💾 Cached successful image: ${url}`);
    } catch (error) {
      console.warn('Failed to cache image:', error);
    }
  }

  // Get cached image
  async function getCachedImage(url: string): Promise<string | null> {
    try {
      const { bulletproofImageCache } = await import('@/lib/bulletproof-image-cache');
      return await bulletproofImageCache.getCached(url);
    } catch (error) {
      console.warn('Failed to get cached image:', error);
      return null;
    }
  }

  // Retry mechanism
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Error handler for img element
  const handleImageError = () => {
    console.warn(`🚨 Image element error for: ${currentSrc}`);
    if (retryCount < 5) { // Increased retry attempts
      handleRetry();
    }
  };

  // Success handler
  const handleImageLoad = () => {
    console.log(`✅ Image element loaded successfully: ${currentSrc}`);
    setIsLoading(false);
    setHasError(false);
  };

  if (isLoading) {
    return (
      <div className={`${className} bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center`}>
        <div className="flex flex-col items-center space-y-2 text-blue-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-sm font-medium">Searching for image...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`${className} bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center p-4`}>
        <div className="text-red-600 text-center">
          <div className="text-lg font-semibold mb-2">⚠️ Image Not Found</div>
          <div className="text-sm mb-3">Could not locate the exact image after extensive search</div>
          <div className="text-xs text-red-500 mb-3">Original: {src}</div>
          {retryCount < 5 && (
            <button
              onClick={handleRetry}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Retry Search ({5 - retryCount} left)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
      
      {/* Success indicator (only in development) */}
      {process.env.NODE_ENV === 'development' && fallbackLevel > 0 && (
        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
          Found via method {fallbackLevel + 1}
        </div>
      )}
    </div>
  );
}