import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ForceImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
}

export function ForceImage({
  src,
  alt,
  className = '',
  onError,
  onLoad,
  loading = 'lazy'
}: ForceImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    forceLoadImage();
  }, [src]);

  const forceLoadImage = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setAttempts(0);

      // Generate ALL possible URLs for the SAME image
      const allUrls = await generateAllPossibleUrls(src);
      console.log('🔄 FORCE LOADING - Generated URLs for:', src, allUrls);

      // Try each URL with ALL strategies until we get the SAME image
      for (let attempt = 1; attempt <= 10; attempt++) {
        setAttempts(attempt);
        
        for (const url of allUrls) {
          for (const strategy of getForceStrategies()) {
            try {
              console.log(`🔄 FORCE TESTING: ${url} with ${strategy.name} (attempt ${attempt})`);
              
              const isWorking = await strategy.test(url);
              if (isWorking) {
                console.log(`✅ FORCE SUCCESS: ${url} works with ${strategy.name}`);
                setCurrentSrc(url);
                setIsLoading(false);
                onLoad?.();
                return;
              }
            } catch (error) {
              console.warn(`❌ FORCE FAILED: ${url} with ${strategy.name}:`, error);
            }
          }
        }

        // Wait before next attempt
        if (attempt < 10) {
          await sleep(500 * attempt);
        }
      }

      // If we still can't load it, try the most aggressive approach
      console.log('🚨 FORCE FALLBACK: Trying aggressive loading for:', src);
      await tryAggressiveLoading(src);

    } catch (error) {
      console.error('❌ FORCE LOAD FAILED:', error);
      setHasError(true);
      onError?.(error instanceof Error ? error.message : 'Failed to force load image');
    } finally {
      setIsLoading(false);
    }
  };

  const tryAggressiveLoading = async (imagePath: string) => {
    // Try to download the image and create a blob URL
    try {
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(imagePath)}`, {
        method: 'GET',
        headers: {
          'Accept': 'image/*'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setCurrentSrc(blobUrl);
        setIsLoading(false);
        onLoad?.();
        return;
      }
    } catch (error) {
      console.warn('Aggressive loading failed:', error);
    }

    // Try canvas approach
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCurrentSrc(dataUrl);
        setIsLoading(false);
        onLoad?.();
      };
      
      img.src = imagePath;
    } catch (error) {
      console.warn('Canvas approach failed:', error);
    }
  };

  const handleImageError = (event: Event) => {
    console.warn('❌ FORCE IMAGE ERROR:', currentSrc, event);
    setHasError(true);
    onError?.('Image failed to load');
    
    // Retry with different approach
    setTimeout(() => {
      forceLoadImage();
    }, 1000);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleRetry = () => {
    forceLoadImage();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        <div className="ml-2 text-sm text-gray-600">Loading image...</div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className={`${className} bg-red-100 flex items-center justify-center text-red-500 text-sm`}>
        <div className="text-center">
          <div className="mb-2">Failed to load image</div>
          <button
            onClick={handleRetry}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Force Retry ({attempts}/10)
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
 * Generate ALL possible URLs for the SAME image
 */
async function generateAllPossibleUrls(imagePath: string): Promise<string[]> {
  const urls: string[] = [];

  if (!imagePath) {
    return [];
  }

  // 1. Direct Supabase URLs
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

  // 2. Raw Supabase URLs (both domains)
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

  // 7. Try with different file extensions
  const baseName = imagePath.split('.')[0];
  const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  for (const ext of extensions) {
    urls.push(`https://supabase.co/storage/v1/object/public/gallery/${baseName}.${ext}`);
    urls.push(`https://supabase.com/storage/v1/object/public/gallery/${baseName}.${ext}`);
  }

  // Remove duplicates and filter empty
  return [...new Set(urls)].filter(url => url && url.length > 0);
}

/**
 * Get ALL force loading strategies
 */
function getForceStrategies() {
  return [
    // Strategy 1: CORS with aggressive timeout
    {
      name: 'cors-aggressive',
      test: async (url: string) => testWithCORS(url, 10000)
    },
    // Strategy 2: No CORS with aggressive timeout
    {
      name: 'no-cors-aggressive',
      test: async (url: string) => testWithoutCORS(url, 10000)
    },
    // Strategy 3: Fetch with aggressive timeout
    {
      name: 'fetch-aggressive',
      test: async (url: string) => testWithFetch(url, 10000)
    },
    // Strategy 4: Image with aggressive timeout
    {
      name: 'image-aggressive',
      test: async (url: string) => testWithImage(url, 10000)
    },
    // Strategy 5: Head request with aggressive timeout
    {
      name: 'head-aggressive',
      test: async (url: string) => testWithHead(url, 10000)
    },
    // Strategy 6: Retry with backoff
    {
      name: 'retry-aggressive',
      test: async (url: string) => testWithRetry(url)
    }
  ];
}

/**
 * Test URL with CORS (aggressive)
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
 * Test URL without CORS (aggressive)
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
 * Test URL with fetch (aggressive)
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
 * Test URL with image (aggressive)
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
 * Test URL with head request (aggressive)
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
 * Test URL with retry (aggressive)
 */
async function testWithRetry(url: string): Promise<boolean> {
  for (let i = 0; i < 5; i++) {
    try {
      const result = await testWithCORS(url, 5000);
      if (result) return true;
    } catch (error) {
      if (i === 4) return false;
      await sleep(1000 * (i + 1));
    }
  }
  return false;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}