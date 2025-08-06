import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UltimateImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
}

export function UltimateImage({
  src,
  alt,
  className = '',
  onError,
  onLoad,
  loading = 'lazy'
}: UltimateImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [workingUrls, setWorkingUrls] = useState<string[]>([]);
  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    ultimateLoadImage();
    
    // Start continuous monitoring
    const interval = setInterval(() => {
      monitorCurrentImage();
    }, 15000); // Check every 15 seconds
    
    setMonitoringInterval(interval);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [src]);

  const monitorCurrentImage = async () => {
    if (!currentSrc || currentSrc.startsWith('blob:') || currentSrc.startsWith('data:')) {
      return;
    }
    
    try {
      console.log('🔍 ULTIMATE - Monitoring current image:', currentSrc);
      
      const isStillWorking = await testImageLoad(currentSrc);
      
      if (!isStillWorking) {
        console.warn('⚠️ ULTIMATE - Current image stopped working, reloading...');
        ultimateLoadImage();
      }
    } catch (error) {
      console.warn('⚠️ ULTIMATE - Monitoring failed, reloading...');
      ultimateLoadImage();
    }
  };

  const ultimateLoadImage = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setAttempts(0);
      setWorkingUrls([]);

      console.log('🚨 ULTIMATE - Starting ultimate load for:', src);

      // PHASE 1: Generate ALL possible URLs (50+ variations)
      const allUrls = await generateUltimateUrls(src);
      console.log('🚨 ULTIMATE - Generated URLs:', allUrls.length);

      // PHASE 2: Pre-test ALL URLs with aggressive testing
      console.log('🚨 ULTIMATE - Pre-testing all URLs...');
      const testedUrls = await preTestUltimateUrls(allUrls);
      setWorkingUrls(testedUrls);
      console.log('🚨 ULTIMATE - Working URLs found:', testedUrls.length);

      if (testedUrls.length === 0) {
        console.error('❌ ULTIMATE - NO WORKING URLS FOUND!');
        setHasError(true);
        onError?.('No working URLs found - trying ultimate methods');
        
        // Try ultimate methods
        const ultimateResult = await tryUltimateMethods(src);
        if (ultimateResult) {
          setCurrentSrc(ultimateResult);
          setIsLoading(false);
          onLoad?.();
          return;
        }
        
        // Keep trying
        setTimeout(() => {
          ultimateLoadImage();
        }, 3000);
        return;
      }

      // PHASE 3: Use ONLY working URLs with multiple strategies
      console.log('🚨 ULTIMATE - Using only working URLs');
      for (let attempt = 1; attempt <= 20; attempt++) {
        setAttempts(attempt);
        console.log(`🚨 ULTIMATE - Attempt ${attempt}/20 with working URLs`);
        
        for (const workingUrl of testedUrls) {
          try {
            console.log(`🚨 ULTIMATE - Testing working URL: ${workingUrl}`);
            
            const isWorking = await testUrlWithUltimateStrategies(workingUrl);
            if (isWorking) {
              console.log(`✅ ULTIMATE SUCCESS: ${workingUrl} works!`);
              setCurrentSrc(workingUrl);
              setIsLoading(false);
              onLoad?.();
              return;
            }
          } catch (error) {
            console.warn(`❌ ULTIMATE FAILED: ${workingUrl}:`, error);
          }
        }

        // Wait before next attempt
        if (attempt < 20) {
          await sleep(200 * attempt);
        }
      }

      // PHASE 4: If working URLs fail, try ultimate methods
      console.log('🚨 ULTIMATE - Working URLs failed, trying ultimate methods');
      
      const ultimateResult = await tryUltimateMethods(src);
      if (ultimateResult) {
        setCurrentSrc(ultimateResult);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      // PHASE 5: Last resort - create image from data
      console.log('🚨 ULTIMATE - Trying last resort methods');
      const lastResortResult = await tryLastResortUltimate(src);
      if (lastResortResult) {
        setCurrentSrc(lastResortResult);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      // PHASE 6: If everything fails, show error but keep trying
      console.error('❌ ULTIMATE - ALL methods failed for:', src);
      setHasError(true);
      onError?.('All loading methods failed - but we will keep trying');

      // Keep trying in background
      setTimeout(() => {
        ultimateLoadImage();
      }, 3000);

    } catch (error) {
      console.error('❌ ULTIMATE - Critical error:', error);
      setHasError(true);
      onError?.(error instanceof Error ? error.message : 'Critical loading error');
      
      // Keep trying
      setTimeout(() => {
        ultimateLoadImage();
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const preTestUltimateUrls = async (urls: string[]): Promise<string[]> => {
    const workingUrls: string[] = [];
    
    console.log('🚨 ULTIMATE - Pre-testing', urls.length, 'URLs...');
    
    for (const url of urls) {
      try {
        // Test 1: HEAD request with ultimate headers
        let isWorking = false;
        
        try {
          const response = await fetch(url, { 
            method: 'HEAD',
            mode: 'cors',
            headers: {
              'Accept': 'image/*',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Referer': 'https://ufsbd1.pages.dev/',
              'Origin': 'https://ufsbd1.pages.dev',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Sec-Fetch-Dest': 'image',
              'Sec-Fetch-Mode': 'cors',
              'Sec-Fetch-Site': 'cross-site',
              'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
              'Sec-Ch-Ua-Mobile': '?0',
              'Sec-Ch-Ua-Platform': '"Windows"'
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://ufsbd1.pages.dev/',
                'Origin': 'https://ufsbd1.pages.dev'
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
            console.log(`✅ ULTIMATE - Working URL found: ${url}`);
          }
        }
      } catch (error) {
        console.warn(`❌ ULTIMATE - URL failed pre-test: ${url}`);
      }
    }
    
    console.log(`🚨 ULTIMATE - Found ${workingUrls.length} working URLs out of ${urls.length}`);
    return workingUrls;
  };

  const testImageLoad = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        img.src = '';
        resolve(false);
      }, 15000); // 15 second timeout

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
  };

  const testUrlWithUltimateStrategies = async (url: string): Promise<boolean> => {
    const strategies = [
      testWithCORS,
      testWithoutCORS,
      testWithFetch,
      testWithImage,
      testWithHead,
      testWithRetry
    ];

    for (const strategy of strategies) {
      try {
        const result = await strategy(url, 20000); // 20 second timeout
        if (result) {
          return true;
        }
      } catch (error) {
        console.warn(`Strategy failed for ${url}:`, error);
      }
    }

    return false;
  };

  const tryUltimateMethods = async (imagePath: string): Promise<string | null> => {
    // Method 1: Try to download and create blob with ultimate headers
    const blobUrls = [
      `/api/ultimate-proxy?url=${encodeURIComponent(imagePath)}`,
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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://ufsbd1.pages.dev/',
            'Origin': 'https://ufsbd1.pages.dev',
            'Sec-Fetch-Dest': 'image',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site'
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          console.log('✅ ULTIMATE - Blob URL created:', objectUrl);
          return objectUrl;
        }
      } catch (error) {
        console.warn('ULTIMATE - Blob method failed for:', blobUrl, error);
      }
    }

    // Method 2: Try canvas approach with ultimate URLs
    const canvasUrls = [
      imagePath,
      `https://supabase.co/storage/v1/object/public/gallery/${imagePath}`,
      `https://supabase.com/storage/v1/object/public/gallery/${imagePath}`,
      `https://supabase.co/storage/v1/object/public/gallery-staging/${imagePath}`,
      `https://supabase.com/storage/v1/object/public/gallery-staging/${imagePath}`
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
          console.log('✅ ULTIMATE - Canvas data URL created');
          return dataUrl;
        };
        
        img.src = canvasUrl;
      } catch (error) {
        console.warn('ULTIMATE - Canvas method failed for:', canvasUrl, error);
      }
    }

    // Method 3: Try base64 encoding with ultimate URLs
    const base64Urls = [
      imagePath,
      `https://supabase.co/storage/v1/object/public/gallery/${imagePath}`,
      `https://supabase.com/storage/v1/object/public/gallery/${imagePath}`,
      `https://supabase.co/storage/v1/object/public/gallery-staging/${imagePath}`,
      `https://supabase.com/storage/v1/object/public/gallery-staging/${imagePath}`
    ];

    for (const base64Url of base64Urls) {
      try {
        const response = await fetch(base64Url, {
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://ufsbd1.pages.dev/',
            'Origin': 'https://ufsbd1.pages.dev',
            'Cache-Control': 'no-cache',
            'Sec-Fetch-Dest': 'image',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site'
          }
        });
        const blob = await response.blob();
        const reader = new FileReader();
        
        return new Promise((resolve) => {
          reader.onload = () => {
            const base64 = reader.result as string;
            console.log('✅ ULTIMATE - Base64 created');
            resolve(base64);
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn('ULTIMATE - Base64 method failed for:', base64Url, error);
      }
    }

    // Method 4: Try ultimate Cloudflare bypass
    try {
      const ultimateBypassUrls = [
        `https://supabase.co/storage/v1/object/public/gallery/${imagePath}?bypass=ultimate`,
        `https://supabase.com/storage/v1/object/public/gallery/${imagePath}?bypass=ultimate`,
        `https://supabase.co/storage/v1/object/public/gallery-staging/${imagePath}?bypass=ultimate`,
        `https://supabase.com/storage/v1/object/public/gallery-staging/${imagePath}?bypass=ultimate`
      ];

      for (const bypassUrl of ultimateBypassUrls) {
        const response = await fetch(bypassUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://ufsbd1.pages.dev/',
            'Origin': 'https://ufsbd1.pages.dev',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'image',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"'
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          console.log('✅ ULTIMATE - Ultimate bypass successful:', objectUrl);
          return objectUrl;
        }
      }
    } catch (error) {
      console.warn('ULTIMATE - Ultimate bypass failed:', error);
    }

    return null;
  };

  const tryLastResortUltimate = async (imagePath: string): Promise<string | null> => {
    // Method 1: Try different Supabase projects with ultimate configs
    const ultimateProjects = [
      'https://supabase.co/storage/v1/object/public/gallery/',
      'https://supabase.com/storage/v1/object/public/gallery/',
      'https://xyz.supabase.co/storage/v1/object/public/gallery/',
      'https://supabase.co/storage/v1/object/sign/gallery/',
      'https://supabase.com/storage/v1/object/sign/gallery/',
      'https://supabase.co/storage/v1/object/public/gallery-staging/',
      'https://supabase.com/storage/v1/object/public/gallery-staging/',
      'https://xyz.supabase.co/storage/v1/object/public/gallery-staging/'
    ];

    for (const project of ultimateProjects) {
      try {
        const url = `${project}${imagePath}`;
        const response = await fetch(url, { 
          method: 'HEAD',
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://ufsbd1.pages.dev/',
            'Origin': 'https://ufsbd1.pages.dev'
          }
        });
        if (response.ok) {
          console.log('✅ ULTIMATE - Last resort URL found:', url);
          return url;
        }
      } catch (error) {
        console.warn('ULTIMATE - Last resort failed for:', project);
      }
    }

    // Method 2: Try to create a simple image element with ultimate config
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.setAttribute('referrerpolicy', 'no-referrer');
      img.src = imagePath;
      
      return new Promise((resolve) => {
        img.onload = () => {
          console.log('✅ ULTIMATE - Simple image loaded');
          resolve(imagePath);
        };
        img.onerror = () => {
          console.warn('ULTIMATE - Simple image failed');
          resolve(null);
        };
      });
    } catch (error) {
      console.warn('ULTIMATE - Simple image method failed:', error);
    }

    return null;
  };

  const handleImageError = (event: Event) => {
    console.warn('❌ ULTIMATE IMAGE ERROR:', currentSrc, event);
    setHasError(true);
    onError?.('Image failed to load');
    
    // Immediate retry with exponential backoff
    const retryDelay = Math.min(1000 * Math.pow(2, attempts), 30000); // Max 30 seconds
    setTimeout(() => {
      console.log(`🔄 ULTIMATE - Retrying after ${retryDelay}ms...`);
      ultimateLoadImage();
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
    ultimateLoadImage();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        <div className="ml-2 text-sm text-gray-600">
          Loading image...
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
          {hasError && 'ERROR'}
        </div>
      )}
    </div>
  );
}

/**
 * Generate ALL possible URLs for ultimate image (50+ variations)
 */
async function generateUltimateUrls(imagePath: string): Promise<string[]> {
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
    console.warn('ULTIMATE - Failed to generate gallery URL:', error);
  }

  try {
    const { data: stagingData } = supabase.storage.from('gallery-staging').getPublicUrl(imagePath);
    if (stagingData?.publicUrl) {
      urls.push(stagingData.publicUrl);
    }
  } catch (error) {
    console.warn('ULTIMATE - Failed to generate staging URL:', error);
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
    urls.push(`https://supabase.co/storage/v1/object/public/gallery-staging/${baseName}.${ext}`);
    urls.push(`https://supabase.com/storage/v1/object/public/gallery-staging/${baseName}.${ext}`);
  }

  // 8. Try with different Supabase project configurations
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

  // 9. Try with different URL encodings
  urls.push(`https://supabase.co/storage/v1/object/public/gallery/${encodeURIComponent(imagePath)}`);
  urls.push(`https://supabase.com/storage/v1/object/public/gallery/${encodeURIComponent(imagePath)}`);
  urls.push(`https://supabase.co/storage/v1/object/public/gallery-staging/${encodeURIComponent(imagePath)}`);
  urls.push(`https://supabase.com/storage/v1/object/public/gallery-staging/${encodeURIComponent(imagePath)}`);

  // 10. Try with different path variations
  const pathVariations = [
    imagePath,
    imagePath.toLowerCase(),
    imagePath.toUpperCase(),
    imagePath.replace(/[^a-zA-Z0-9.-]/g, '_'),
    imagePath.replace(/[^a-zA-Z0-9.-]/g, '-')
  ];

  for (const path of pathVariations) {
    urls.push(`https://supabase.co/storage/v1/object/public/gallery/${path}`);
    urls.push(`https://supabase.com/storage/v1/object/public/gallery/${path}`);
    urls.push(`https://supabase.co/storage/v1/object/public/gallery-staging/${path}`);
    urls.push(`https://supabase.com/storage/v1/object/public/gallery-staging/${path}`);
  }

  // Remove duplicates and filter empty
  return [...new Set(urls)].filter(url => url && url.length > 0);
}

/**
 * Test URL with CORS (ultimate)
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
 * Test URL without CORS (ultimate)
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
 * Test URL with fetch (ultimate)
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://ufsbd1.pages.dev/',
        'Origin': 'https://ufsbd1.pages.dev',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"'
      }
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Test URL with image (ultimate)
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
 * Test URL with head request (ultimate)
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://ufsbd1.pages.dev/',
        'Origin': 'https://ufsbd1.pages.dev',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"'
      }
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Test URL with retry (ultimate)
 */
async function testWithRetry(url: string): Promise<boolean> {
  for (let i = 0; i < 15; i++) {
    try {
      const result = await testWithCORS(url, 10000);
      if (result) return true;
    } catch (error) {
      if (i === 14) return false;
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