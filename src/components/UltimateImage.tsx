import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UltimateImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
}

export function UltimateImage({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.svg',
  onError,
  onLoad,
  loading = 'lazy'
}: UltimateImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    loadImage();
  }, [src]);

  const loadImage = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setAttempts(0);

      // Generate ALL possible URLs
      const allUrls = await generateAllPossibleUrls(src);
      console.log('🔄 Generated URLs for:', src, allUrls);

      // Try each URL with multiple strategies
      for (let attempt = 1; attempt <= 5; attempt++) {
        for (const url of allUrls) {
          for (const strategy of getStrategies()) {
            try {
              console.log(`🔄 Testing URL: ${url} with strategy: ${strategy.name} (attempt ${attempt})`);
              
              const isWorking = await strategy.test(url);
              if (isWorking) {
                console.log(`✅ SUCCESS: URL ${url} works with strategy ${strategy.name}`);
                setCurrentSrc(url);
                setIsLoading(false);
                onLoad?.();
                return;
              }
            } catch (error) {
              console.warn(`❌ Failed: URL ${url} with strategy ${strategy.name}:`, error);
            }
          }
        }

        // Wait before next attempt
        if (attempt < 5) {
          await sleep(1000 * attempt);
        }
      }

      // ALL strategies failed
      console.error('❌ ALL strategies failed for image:', src);
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      onError?.('All loading strategies failed');

    } catch (error) {
      console.error('❌ Ultimate image load failed:', error);
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      onError?.(error instanceof Error ? error.message : 'Failed to load image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (event: Event) => {
    console.warn('❌ Ultimate image error:', currentSrc, event);
    setHasError(true);
    setCurrentSrc(fallbackSrc);
    onError?.('Image failed to load');
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleRetry = () => {
    loadImage();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  // Error state
  if (hasError && currentSrc === fallbackSrc) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-500 text-sm`}>
        <div className="text-center">
          <div className="mb-2">Image unavailable</div>
          <button
            onClick={handleRetry}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
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
        className={className}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          opacity: isLoading ? 0.5 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
      
      {/* Debug info in development */}
      {import.meta.env.DEV && (
        <div className="absolute top-0 left-0 bg-black bg-opacity-75 text-white text-xs p-1">
          {attempts > 0 && `Attempts: ${attempts}`}
          {hasError && 'Error'}
        </div>
      )}
    </div>
  );
}

/**
 * Generate ALL possible URLs for an image
 */
async function generateAllPossibleUrls(imagePath: string): Promise<string[]> {
  const urls: string[] = [];

  if (!imagePath) {
    return ['/placeholder.svg'];
  }

  // 1. Direct public URLs
  try {
    const { data: galleryData } = supabase.storage.from('gallery').getPublicUrl(imagePath);
    if (galleryData?.publicUrl) {
      urls.push(galleryData.publicUrl);
    }
  } catch (error) {
    console.warn('Failed to generate gallery URL:', error);
  }

  try {
    const { data: stagingData } = supabase.storage.from('gallery-staging').getPublicUrl(imagePath);
    if (stagingData?.publicUrl) {
      urls.push(stagingData.publicUrl);
    }
  } catch (error) {
    console.warn('Failed to generate staging URL:', error);
  }

  // 2. Raw Supabase URLs
  urls.push(`https://supabase.co/storage/v1/object/public/gallery/${imagePath}`);
  urls.push(`https://supabase.co/storage/v1/object/public/gallery-staging/${imagePath}`);
  urls.push(`https://supabase.com/storage/v1/object/public/gallery/${imagePath}`);
  urls.push(`https://supabase.com/storage/v1/object/public/gallery-staging/${imagePath}`);

  // 3. Alternative domain formats
  urls.push(`https://xyz.supabase.co/storage/v1/object/public/gallery/${imagePath}`);
  urls.push(`https://xyz.supabase.co/storage/v1/object/public/gallery-staging/${imagePath}`);

  // 4. Signed URL formats
  urls.push(`https://supabase.co/storage/v1/object/sign/gallery/${imagePath}`);
  urls.push(`https://supabase.com/storage/v1/object/sign/gallery/${imagePath}`);

  // 5. If it's already a full URL, add it
  if (imagePath.startsWith('http')) {
    urls.push(imagePath);
  }

  // 6. If it's a relative path, try different formats
  if (!imagePath.startsWith('http') && !imagePath.startsWith('/')) {
    urls.push(`/${imagePath}`);
    urls.push(`/images/${imagePath}`);
    urls.push(`/assets/${imagePath}`);
  }

  // Remove duplicates and filter empty
  return [...new Set(urls)].filter(url => url && url.length > 0);
}

/**
 * Get ALL testing strategies
 */
function getStrategies() {
  return [
    // Strategy 1: CORS with timeout
    {
      name: 'cors-with-timeout',
      test: async (url: string) => testWithCORS(url, 3000)
    },
    // Strategy 2: No CORS with timeout
    {
      name: 'no-cors-with-timeout',
      test: async (url: string) => testWithoutCORS(url, 3000)
    },
    // Strategy 3: Fetch with timeout
    {
      name: 'fetch-with-timeout',
      test: async (url: string) => testWithFetch(url, 3000)
    },
    // Strategy 4: Image with timeout
    {
      name: 'image-with-timeout',
      test: async (url: string) => testWithImage(url, 3000)
    },
    // Strategy 5: Head request
    {
      name: 'head-request',
      test: async (url: string) => testWithHead(url, 3000)
    }
  ];
}

/**
 * Test URL with CORS
 */
async function testWithCORS(url: string, timeout: number): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeoutId = setTimeout(() => {
      img.src = '';
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

    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

/**
 * Test URL without CORS
 */
async function testWithoutCORS(url: string, timeout: number): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeoutId = setTimeout(() => {
      img.src = '';
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
}

/**
 * Test URL with fetch
 */
async function testWithFetch(url: string, timeout: number): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'cors'
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Test URL with image
 */
async function testWithImage(url: string, timeout: number): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeoutId = setTimeout(() => {
      img.src = '';
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
}

/**
 * Test URL with head request
 */
async function testWithHead(url: string, timeout: number): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}