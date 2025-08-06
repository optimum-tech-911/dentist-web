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
  const [workingUrls, setWorkingUrls] = useState<string[]>([]);
  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    forceLoadClientImage();
    
    // Start continuous monitoring
    const interval = setInterval(() => {
      monitorCurrentImage();
    }, 30000); // Check every 30 seconds
    
    setMonitoringInterval(interval);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [src]);

  const monitorCurrentImage = async () => {
    if (!currentSrc || currentSrc.startsWith('blob:') || currentSrc.startsWith('data:')) {
      return; // Don't monitor blob or data URLs
    }
    
    try {
      console.log('🔍 CLIENT IMAGE - Monitoring current image:', currentSrc);
      
      // Test if current image is still working
      const isStillWorking = await testImageLoad(currentSrc);
      
      if (!isStillWorking) {
        console.warn('⚠️ CLIENT IMAGE - Current image stopped working, reloading...');
        forceLoadClientImage();
      }
    } catch (error) {
      console.warn('⚠️ CLIENT IMAGE - Monitoring failed, reloading...');
      forceLoadClientImage();
    }
  };

  const forceLoadClientImage = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setAttempts(0);
      setForceMode(false);
      setWorkingUrls([]);

      console.log('🚨 CLIENT IMAGE - Starting force load for:', src);

      // PHASE 1: Generate ALL possible URLs
      const allUrls = await generateAllClientUrls(src);
      console.log('🚨 CLIENT IMAGE - Generated URLs:', allUrls);

      // PHASE 2: PRE-TEST ALL URLs to find working ones
      console.log('🚨 CLIENT IMAGE - Pre-testing all URLs...');
      const testedUrls = await preTestAllUrls(allUrls);
      setWorkingUrls(testedUrls);
      console.log('🚨 CLIENT IMAGE - Working URLs found:', testedUrls);

      if (testedUrls.length === 0) {
        console.error('❌ CLIENT IMAGE - NO WORKING URLS FOUND!');
        setHasError(true);
        onError?.('No working URLs found - trying aggressive methods');
        
        // Try aggressive methods
        setForceMode(true);
        const aggressiveResult = await tryAggressiveClientLoading(src);
        if (aggressiveResult) {
          setCurrentSrc(aggressiveResult);
          setIsLoading(false);
          onLoad?.();
          return;
        }
        
        // Keep trying
        setTimeout(() => {
          forceLoadClientImage();
        }, 5000);
        return;
      }

      // PHASE 3: Use ONLY working URLs
      console.log('🚨 CLIENT IMAGE - Using only working URLs');
      for (let attempt = 1; attempt <= 10; attempt++) {
        setAttempts(attempt);
        console.log(`🚨 CLIENT IMAGE - Attempt ${attempt}/10 with working URLs`);
        
        for (const workingUrl of testedUrls) {
          try {
            console.log(`🚨 CLIENT IMAGE - Testing working URL: ${workingUrl}`);
            
            const isWorking = await testUrlWithMultipleStrategies(workingUrl);
            if (isWorking) {
              console.log(`✅ CLIENT SUCCESS: ${workingUrl} works!`);
              setCurrentSrc(workingUrl);
              setIsLoading(false);
              onLoad?.();
              return;
            }
          } catch (error) {
            console.warn(`❌ CLIENT FAILED: ${workingUrl}:`, error);
          }
        }

        // Wait before next attempt
        if (attempt < 10) {
          await sleep(500 * attempt);
        }
      }

      // PHASE 4: If working URLs fail, try aggressive methods
      console.log('🚨 CLIENT IMAGE - Working URLs failed, trying aggressive methods');
      setForceMode(true);
      
      const aggressiveResult = await tryAggressiveClientLoading(src);
      if (aggressiveResult) {
        setCurrentSrc(aggressiveResult);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      // PHASE 5: Last resort - create image from data
      console.log('🚨 CLIENT IMAGE - Trying last resort methods');
      const lastResortResult = await tryLastResortClientLoading(src);
      if (lastResortResult) {
        setCurrentSrc(lastResortResult);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      // PHASE 6: If everything fails, show error but keep trying
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

  const preTestAllUrls = async (urls: string[]): Promise<string[]> => {
    const workingUrls: string[] = [];
    
    console.log('🚨 CLIENT IMAGE - Pre-testing', urls.length, 'URLs...');
    
    for (const url of urls) {
      try {
        // Test 1: HEAD request with Cloudflare bypass headers
        let isWorking = false;
        
        try {
          const response = await fetch(url, { 
            method: 'HEAD',
            mode: 'cors',
            headers: {
              'Accept': 'image/*',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://ufsbd34.fr/',
              'Origin': 'https://ufsbd34.fr',
              'Cache-Control': 'no-cache'
            }
          });
          isWorking = response.ok;
        } catch (error) {
          // If CORS fails, try without CORS but with headers
          try {
            const response = await fetch(url, { 
              method: 'HEAD',
              mode: 'no-cors',
              headers: {
                'Accept': 'image/*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://ufsbd34.fr/',
                'Origin': 'https://ufsbd34.fr'
              }
            });
            isWorking = response.type === 'opaque' || response.ok;
          } catch (innerError) {
            isWorking = false;
          }
        }
        
        if (isWorking) {
          // Test 2: Double-check with image load test
          const imageTest = await testImageLoad(url);
          if (imageTest) {
            workingUrls.push(url);
            console.log(`✅ CLIENT - Working URL found: ${url}`);
          }
        }
      } catch (error) {
        console.warn(`❌ CLIENT - URL failed pre-test: ${url}`);
      }
    }
    
    console.log(`🚨 CLIENT IMAGE - Found ${workingUrls.length} working URLs out of ${urls.length}`);
    return workingUrls;
  };

  const testImageLoad = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        img.src = '';
        resolve(false);
      }, 10000); // Increased timeout to 10 seconds

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };

      img.crossOrigin = 'anonymous';
      // Add Cloudflare bypass headers via data attributes
      img.setAttribute('referrerpolicy', 'no-referrer');
      img.src = url;
    });
  };

  const testUrlWithMultipleStrategies = async (url: string): Promise<boolean> => {
    const strategies = [
      testWithCORS,
      testWithoutCORS,
      testWithFetch,
      testWithImage,
      testWithHead
    ];

    for (const strategy of strategies) {
      try {
        const result = await strategy(url, 15000); // Increased timeout to 15 seconds
        if (result) {
          return true;
        }
      } catch (error) {
        console.warn(`Strategy failed for ${url}:`, error);
      }
    }

    return false;
  };

  const tryAggressiveClientLoading = async (imagePath: string): Promise<string | null> => {
    // Method 1: Try to download and create blob with Cloudflare bypass
    const blobUrls = [
      `/api/client-proxy?url=${encodeURIComponent(imagePath)}`,
      `/api/image-proxy?url=${encodeURIComponent(imagePath)}`,
      `/api/proxy-image?url=${encodeURIComponent(imagePath)}`
    ];

    for (const blobUrl of blobUrls) {
      try {
        const response = await fetch(blobUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/*',
            'Cache-Control': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://ufsbd34.fr/',
            'Origin': 'https://ufsbd34.fr'
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          console.log('✅ CLIENT - Blob URL created:', objectUrl);
          return objectUrl;
        }
      } catch (error) {
        console.warn('CLIENT - Blob method failed for:', blobUrl, error);
      }
    }

    // Method 2: Try canvas approach with Cloudflare bypass
    const canvasUrls = [
      imagePath,
      `https://supabase.co/storage/v1/object/public/gallery/${imagePath}`,
      `https://supabase.com/storage/v1/object/public/gallery/${imagePath}`
    ];

    for (const canvasUrl of canvasUrls) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.crossOrigin = 'anonymous';
        img.setAttribute('referrerpolicy', 'no-referrer');
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const dataUrl = canvas.toDataURL('image/jpeg');
          console.log('✅ CLIENT - Canvas data URL created');
          return dataUrl;
        };
        
        img.src = canvasUrl;
      } catch (error) {
        console.warn('CLIENT - Canvas method failed for:', canvasUrl, error);
      }
    }

    // Method 3: Try base64 encoding with Cloudflare bypass
    const base64Urls = [
      imagePath,
      `https://supabase.co/storage/v1/object/public/gallery/${imagePath}`,
      `https://supabase.com/storage/v1/object/public/gallery/${imagePath}`
    ];

    for (const base64Url of base64Urls) {
      try {
        const response = await fetch(base64Url, {
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://ufsbd34.fr/',
            'Origin': 'https://ufsbd34.fr',
            'Cache-Control': 'no-cache'
          }
        });
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
        console.warn('CLIENT - Base64 method failed for:', base64Url, error);
      }
    }

    // Method 4: Try Cloudflare-specific bypass
    try {
      const cloudflareBypassUrl = `https://supabase.co/storage/v1/object/public/gallery/${imagePath}?bypass=cloudflare`;
      const response = await fetch(cloudflareBypassUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://ufsbd34.fr/',
          'Origin': 'https://ufsbd34.fr',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'image',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        console.log('✅ CLIENT - Cloudflare bypass successful:', objectUrl);
        return objectUrl;
      }
    } catch (error) {
      console.warn('CLIENT - Cloudflare bypass failed:', error);
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
    
    // Immediate retry with exponential backoff
    const retryDelay = Math.min(1000 * Math.pow(2, attempts), 30000); // Max 30 seconds
    setTimeout(() => {
      console.log(`🔄 CLIENT IMAGE - Retrying after ${retryDelay}ms...`);
      forceLoadClientImage();
    }, retryDelay);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
    
    // Reset attempts on successful load
    setAttempts(0);
  };

  const handleRetry = () => {
    setAttempts(0); // Reset attempts for manual retry
    forceLoadClientImage();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        <div className="ml-2 text-sm text-gray-600">
          {forceMode ? 'Force loading image...' : 'Loading image...'}
          {workingUrls.length > 0 && ` (${workingUrls.length} working URLs found)`}
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
          {workingUrls.length > 0 && (
            <div className="text-xs text-green-600 mt-1">
              {workingUrls.length} working URLs available
            </div>
          )}
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
          {workingUrls.length > 0 && `Working: ${workingUrls.length}`}
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

  // 9. Try with different Supabase project configurations
  const projectConfigs = [
    'https://supabase.co/storage/v1/object/public/gallery/',
    'https://supabase.com/storage/v1/object/public/gallery/',
    'https://xyz.supabase.co/storage/v1/object/public/gallery/',
    'https://supabase.co/storage/v1/object/sign/gallery/',
    'https://supabase.com/storage/v1/object/sign/gallery/',
    'https://supabase.co/storage/v1/object/public/gallery-staging/',
    'https://supabase.com/storage/v1/object/public/gallery-staging/',
    'https://xyz.supabase.co/storage/v1/object/public/gallery-staging/'
  ];

  for (const config of projectConfigs) {
    urls.push(`${config}${imagePath}`);
  }

  // 10. Try with different URL encodings
  urls.push(`https://supabase.co/storage/v1/object/public/gallery/${encodeURIComponent(imagePath)}`);
  urls.push(`https://supabase.com/storage/v1/object/public/gallery/${encodeURIComponent(imagePath)}`);

  // Remove duplicates and filter empty
  return [...new Set(urls)].filter(url => url && url.length > 0);
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
    img.setAttribute('referrerpolicy', 'no-referrer');
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

    img.setAttribute('referrerpolicy', 'no-referrer');
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
      mode: 'cors',
      headers: {
        'Accept': 'image/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://ufsbd34.fr/',
        'Origin': 'https://ufsbd34.fr',
        'Cache-Control': 'no-cache'
      }
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

    img.crossOrigin = 'anonymous';
    img.setAttribute('referrerpolicy', 'no-referrer');
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
      signal: controller.signal,
      headers: {
        'Accept': 'image/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://ufsbd34.fr/',
        'Origin': 'https://ufsbd34.fr',
        'Cache-Control': 'no-cache'
      }
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