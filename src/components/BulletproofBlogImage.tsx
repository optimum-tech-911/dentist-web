import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BulletproofBlogImageProps {
  src: string;
  alt: string;
  className?: string;
  title?: string;
  postId?: string;
}

// Generate a deterministic color based on text
function generateColorFromText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

// Create a beautiful gradient placeholder
function createGradientPlaceholder(title: string, width: number = 400, height: number = 300): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const color1 = generateColorFromText(title);
  const color2 = generateColorFromText(title + 'secondary');
  
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  
  const words = title.split(' ');
  const lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width - 40 && currentLine !== '') {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  });
  lines.push(currentLine.trim());
  
  const lineHeight = 30;
  const startY = (height - (lines.length * lineHeight)) / 2 + lineHeight;
  
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + (index * lineHeight));
  });
  
  return canvas.toDataURL('image/jpeg', 0.8);
}

export function BulletproofBlogImage({ src, alt, className = '', title = '', postId }: BulletproofBlogImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [fallbackLevel, setFallbackLevel] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // Maximum bulletproof fallback URLs
  const getFallbackUrls = (originalSrc: string): string[] => {
    const urls: string[] = [];
    
    // Level 0: Original converted URL
    urls.push(convertToPublicUrl(originalSrc));
    
    // Level 1: Try direct Supabase public URL variations
    if (originalSrc && !originalSrc.startsWith('http')) {
      // Remove any prefixes and try clean path
      let cleanPath = originalSrc;
      if (cleanPath.startsWith('gallery/')) {
        cleanPath = cleanPath.substring(8);
      }
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
      }
      
      urls.push(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery/${cleanPath}`);
      
      // Try with different bucket names
      urls.push(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/images/${cleanPath}`);
      urls.push(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/uploads/${cleanPath}`);
    }
    
    // Level 2: Try original URL as-is if it looks like a URL
    if (originalSrc && originalSrc.includes('/')) {
      urls.push(originalSrc);
    }
    
    // Level 3: Try to get a fresh signed URL
    if (originalSrc && !originalSrc.startsWith('http')) {
      const signedUrlPromise = getSignedUrl(originalSrc);
      signedUrlPromise.then(signedUrl => {
        if (signedUrl && !urls.includes(signedUrl)) {
          urls.push(signedUrl);
        }
      });
    }
    
    // Level 4: Generic medical/dental stock images
    urls.push('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop&crop=center');
    urls.push('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center');
    urls.push('https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=400&h=300&fit=crop&crop=center');
    
    // Level 5: Placeholder service
    urls.push(`https://picsum.photos/400/300?random=${postId || Math.random()}`);
    urls.push('https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Article+Image');
    
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

  // Get signed URL as fallback
  async function getSignedUrl(path: string): Promise<string> {
    try {
      let cleanPath = path;
      if (path.startsWith('gallery/')) {
        cleanPath = path.substring(8);
      }
      if (path.startsWith('/')) {
        cleanPath = path.substring(1);
      }
      
      const { data, error } = await supabase.storage
        .from('gallery')
        .createSignedUrl(cleanPath, 3600); // 1 hour expiry
      
      if (error) throw error;
      return data?.signedUrl || '';
    } catch (error) {
      console.warn('Error creating signed URL:', error);
      return '';
    }
  }

  // Try loading an image URL
  const tryLoadImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url) {
        resolve(false);
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        resolve(false);
      }, 10000); // 10 second timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      img.src = url;
    });
  };

  // Load image with fallback chain
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
      console.log(`🔄 Trying to load image for "${title}" with ${fallbackUrls.length} fallback options`);
      
      // Try each URL in sequence
      for (let i = 0; i < fallbackUrls.length; i++) {
        if (!isMounted) return;
        
        const url = fallbackUrls[i];
        console.log(`📷 Attempting URL ${i + 1}/${fallbackUrls.length}: ${url}`);
        
        const success = await tryLoadImage(url);
        
        if (success && isMounted) {
          console.log(`✅ Successfully loaded image from URL ${i + 1}: ${url}`);
          setCurrentSrc(url);
          setIsLoading(false);
          setHasError(false);
          setFallbackLevel(i);
          
          // Cache successful URL
          await cacheImage(url);
          return;
        }
      }
      
      // If all URLs failed, create a custom placeholder
      if (isMounted) {
        console.log(`❌ All ${fallbackUrls.length} URLs failed, generating custom placeholder`);
        const placeholder = await generateEmergencyImage(title || alt || 'Article Image');
        setCurrentSrc(placeholder);
        setIsLoading(false);
        setHasError(true);
        setFallbackLevel(99);
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

  // Generate emergency image
  async function generateEmergencyImage(imageTitle: string): Promise<string> {
    try {
      const { generateEmergencyImage } = await import('@/lib/emergency-image-generator');
      return generateEmergencyImage(imageTitle, title);
    } catch (error) {
      console.warn('Failed to generate emergency image:', error);
      // Fallback to the canvas-based placeholder
      return createGradientPlaceholder(imageTitle);
    }
  }

  // Retry mechanism
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Error handler for img element
  const handleImageError = () => {
    console.warn(`🚨 Image element error for: ${currentSrc}`);
    if (retryCount < 3) {
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
      <div className={`${className} bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center animate-pulse`}>
        <div className="flex flex-col items-center space-y-2 text-blue-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-sm font-medium">Loading image...</div>
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
      
      {/* Fallback level indicator (only in development) */}
      {process.env.NODE_ENV === 'development' && fallbackLevel > 0 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {fallbackLevel === 99 ? 'Generated' : `Fallback ${fallbackLevel}`}
        </div>
      )}
      
      {/* Retry button for failed images */}
      {hasError && retryCount < 3 && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <button
            onClick={handleRetry}
            className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Retry ({3 - retryCount} left)
          </button>
        </div>
      )}
    </div>
  );
}