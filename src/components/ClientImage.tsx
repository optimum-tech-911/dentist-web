import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClientImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
}

export function ClientImage({
  src,
  alt,
  className = '',
  onError,
  onLoad,
  loading = 'lazy'
}: ClientImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [forceMode, setForceMode] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    forceLoadClientImage();
  }, [src]);

  const forceLoadClientImage = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setAttempts(0);
      setForceMode(false);

      console.log('🚨 CLIENT IMAGE - Starting force load for:', src);

      // PHASE 1: Generate ALL possible URLs
      const allUrls = await generateAllClientUrls(src);
      console.log('🚨 CLIENT IMAGE - Generated URLs:', allUrls);

      // PHASE 2: Try each URL with ALL strategies
      for (let attempt = 1; attempt <= 15; attempt++) {
        setAttempts(attempt);
        console.log(`🚨 CLIENT IMAGE - Attempt ${attempt}/15`);
        
        for (const url of allUrls) {
          for (const strategy of getClientStrategies()) {
            try {
              console.log(`🚨 CLIENT IMAGE - Testing: ${url} with ${strategy.name}`);
              
              const isWorking = await strategy.test(url);
              if (isWorking) {
                console.log(`✅ CLIENT SUCCESS: ${url} works with ${strategy.name}`);
                setCurrentSrc(url);
                setIsLoading(false);
                onLoad?.();
                return;
              }
            } catch (error) {
              console.warn(`❌ CLIENT FAILED: ${url} with ${strategy.name}:`, error);
            }
          }
        }

        // Wait before next attempt
        if (attempt < 15) {
          await sleep(200 * attempt);
        }
      }

      // PHASE 3: If still failing, try aggressive methods
      console.log('🚨 CLIENT IMAGE - Trying aggressive methods');
      setForceMode(true);
      
      const aggressiveResult = await tryAggressiveClientLoading(src);
      if (aggressiveResult) {
        setCurrentSrc(aggressiveResult);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      // PHASE 4: Last resort - create image from data
      console.log('🚨 CLIENT IMAGE - Trying last resort methods');
      const lastResortResult = await tryLastResortClientLoading(src);
      if (lastResortResult) {
        setCurrentSrc(lastResortResult);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      // PHASE 5: If everything fails, show error but keep trying
      console.error('❌ CLIENT IMAGE - ALL methods failed for:', src);
      setHasError(true);
      onError?.('All loading methods failed - but we will keep trying');

      // Keep trying in background
      setTimeout(() => {
        forceLoadClientImage();
      }, 5000);

    } catch (error) {
      console.error('❌ CLIENT IMAGE - Critical error:', error);
      setHasError(true);
      onError?.(error instanceof Error ? error.message : 'Critical loading error');
      
      // Keep trying
      setTimeout(() => {
        forceLoadClientImage();
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const tryAggressiveClientLoading = async (imagePath: string): Promise<string | null> => {
    // Method 1: Try to download and create blob
    try {
      const response = await fetch(`/api/client-proxy?url=${encodeURIComponent(imagePath)}`, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        console.log('✅ CLIENT - Blob URL created:', blobUrl);
        return blobUrl;
      }
    } catch (error) {
      console.warn('CLIENT - Blob method failed:', error);
    }

    // Method 2: Try canvas approach
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
        console.log('✅ CLIENT - Canvas data URL created');
        return dataUrl;
      };
      
      img.src = imagePath;
    } catch (error) {
      console.warn('CLIENT - Canvas method failed:', error);
    }

    // Method 3: Try base64 encoding
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          console.log('✅ CLIENT - Base64 created');
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('CLIENT - Base64 method failed:', error);
    }

    return null;
  };

  const tryLastResortClientLoading = async (imagePath: string): Promise<string | null> => {
    // Method 1: Try different Supabase projects
    const projects = [
      'https://supabase.co/storage/v1/object/public/gallery/',
      'https://supabase.com/storage/v1/object/public/gallery/',
      'https://xyz.supabase.co/storage/v1/object/public/gallery/',
      'https://supabase.co/storage/v1/object/sign/gallery/',
      'https://supabase.com/storage/v1/object/sign/gallery/'
    ];

    for (const project of projects) {
      try {
        const url = `${project}${imagePath}`;
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          console.log('✅ CLIENT - Last resort URL found:', url);
          return url;
        }
      } catch (error) {
        console.warn('CLIENT - Last resort failed for:', project);
      }
    }

    // Method 2: Try to create a simple image element
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imagePath;
      
      return new Promise((resolve) => {
        img.onload = () => {
          console.log('✅ CLIENT - Simple image loaded');
          resolve(imagePath);
        };
        img.onerror = () => {
          console.warn('CLIENT - Simple image failed');
          resolve(null);
        };
      });
    } catch (error) {
      console.warn('CLIENT - Simple image method failed:', error);
    }

    return null;
  };

  const handleImageError = (event: Event) => {
    console.warn('❌ CLIENT IMAGE ERROR:', currentSrc, event);
    setHasError(true);
    onError?.('Image failed to load');
    
    // Retry immediately
    setTimeout(() => {
      forceLoadClientImage();
    }, 1000);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleRetry = () => {
    forceLoadClientImage();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        <div className="ml-2 text-sm text-gray-600">
          {forceMode ? 'Force loading image...' : 'Loading image...'}
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className={`${className} bg-red-100 flex items-center justify-center text-red-500 text-sm`}>
        <div className="text-center">
          <div className="mb-2">Loading image...</div>
          <div className="text-xs text-gray-500">Retrying automatically...</div>
          <button
            onClick={handleRetry}
            className="text-xs text-blue-600 hover:text-blue-800 underline mt-2"
          >
            Force Retry Now
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
          {forceMode && 'FORCE MODE'}
          {hasError && 'ERROR'}
        </div>
      )}
    </div>
  );
}

/**
 * Generate ALL possible URLs for client image
 */
async function generateAllClientUrls(imagePath: string): Promise<string[]> {
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
    console.warn('CLIENT - Failed to generate gallery URL:', error);
  }

  try {
    const { data: stagingData } = supabase.storage.from('gallery-staging').getPublicUrl(imagePath);
    if (stagingData?.publicUrl) {
      urls.push(stagingData.publicUrl);
    }
  } catch (error) {
    console.warn('CLIENT - Failed to generate staging URL:', error);
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

  // 8. Try with different paths
  urls.push(`https://supabase.co/storage/v1/object/public/gallery-staging/${baseName}.jpg`);
  urls.push(`https://supabase.com/storage/v1/object/public/gallery-staging/${baseName}.jpg`);

  // Remove duplicates and filter empty
  return [...new Set(urls)].filter(url => url && url.length > 0);
}

/**
 * Get ALL client loading strategies
 */
function getClientStrategies() {
  return [
    // Strategy 1: CORS with aggressive timeout
    {
      name: 'cors-aggressive',
      test: async (url: string) => testWithCORS(url, 15000)
    },
    // Strategy 2: No CORS with aggressive timeout
    {
      name: 'no-cors-aggressive',
      test: async (url: string) => testWithoutCORS(url, 15000)
    },
    // Strategy 3: Fetch with aggressive timeout
    {
      name: 'fetch-aggressive',
      test: async (url: string) => testWithFetch(url, 15000)
    },
    // Strategy 4: Image with aggressive timeout
    {
      name: 'image-aggressive',
      test: async (url: string) => testWithImage(url, 15000)
    },
    // Strategy 5: Head request with aggressive timeout
    {
      name: 'head-aggressive',
      test: async (url: string) => testWithHead(url, 15000)
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
  for (let i = 0; i < 10; i++) {
    try {
      const result = await testWithCORS(url, 5000);
      if (result) return true;
    } catch (error) {
      if (i === 9) return false;
      await sleep(500 * (i + 1));
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