import React, { useState, useEffect } from 'react';
import { BulletproofGalleryService } from '@/lib/bulletproof-gallery';
import { BulletproofImage } from './BulletproofImage';

interface BulletproofArticleImageProps {
  imageId: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export function BulletproofArticleImage({
  imageId,
  alt = 'Article image',
  className = '',
  fallbackSrc = '/placeholder.svg',
  onError,
  onLoad,
  loading = 'lazy',
  priority = false
}: BulletproofArticleImageProps) {
  const [imageData, setImageData] = useState<any>(null);
  const [workingUrl, setWorkingUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadImage();
  }, [imageId]);

  const loadImage = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      // Get working URL from bulletproof service
      const url = await BulletproofGalleryService.getWorkingUrl(imageId);
      
      if (url === '/placeholder.svg') {
        // Image not found or all URLs failed
        setHasError(true);
        setWorkingUrl(fallbackSrc);
        onError?.('Image not found or unavailable');
      } else {
        // Got working URL
        setWorkingUrl(url);
        setImageData({ id: imageId, url });
        onLoad?.();
      }
    } catch (error) {
      console.error('Failed to load article image:', error);
      setHasError(true);
      setWorkingUrl(fallbackSrc);
      onError?.(error instanceof Error ? error.message : 'Failed to load image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadImage();
  };

  const handleImageError = (event: Event) => {
    console.warn('Article image failed to load:', workingUrl);
    setHasError(true);
    setWorkingUrl(fallbackSrc);
    onError?.('Image failed to load');
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (hasError && workingUrl === fallbackSrc) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-500 text-sm`}>
        <div className="text-center">
          <div className="mb-2">Image unavailable</div>
          {retryCount < 3 && (
            <button
              onClick={handleRetry}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <BulletproofImage
      src={workingUrl}
      alt={alt}
      className={className}
      fallbackSrc={fallbackSrc}
      loading={loading}
      onError={handleImageError}
      onLoad={handleImageLoad}
      retryOnError={true}
      maxRetries={3}
      timeout={10000}
    />
  );
}

/**
 * Hook for article image loading with health monitoring
 */
export function useArticleImage(imageId: string) {
  const [state, setState] = useState<{
    url: string;
    isLoading: boolean;
    hasError: boolean;
    healthStatus: 'healthy' | 'warning' | 'error';
    retryCount: number;
  }>({
    url: '',
    isLoading: true,
    hasError: false,
    healthStatus: 'healthy',
    retryCount: 0
  });

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, hasError: false }));

        // Get image data with health status
        const image = await BulletproofGalleryService.getImage(imageId);
        
        if (!mounted) return;

        if (!image) {
          setState({
            url: '/placeholder.svg',
            isLoading: false,
            hasError: true,
            healthStatus: 'error',
            retryCount: 0
          });
          return;
        }

        // Get working URL
        const workingUrl = await BulletproofGalleryService.getWorkingUrl(imageId);
        
        if (!mounted) return;

        setState({
          url: workingUrl,
          isLoading: false,
          hasError: workingUrl === '/placeholder.svg',
          healthStatus: image.health_status,
          retryCount: 0
        });

      } catch (error) {
        if (!mounted) return;

        setState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
          healthStatus: 'error'
        }));
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [imageId]);

  const retry = () => {
    setState(prev => ({ ...prev, isLoading: true, hasError: false }));
  };

  return { ...state, retry };
}

/**
 * High-performance article image with preloading
 */
export function PreloadedArticleImage({
  imageId,
  priority = false,
  ...props
}: BulletproofArticleImageProps & { priority?: boolean }) {
  const [isPreloaded, setIsPreloaded] = useState(false);

  useEffect(() => {
    if (priority) {
      // Preload the image
      BulletproofGalleryService.getWorkingUrl(imageId)
        .then(url => {
          if (url !== '/placeholder.svg') {
            const img = new Image();
            img.onload = () => setIsPreloaded(true);
            img.src = url;
          }
        })
        .catch(() => setIsPreloaded(false));
    }
  }, [imageId, priority]);

  return (
    <BulletproofArticleImage
      imageId={imageId}
      priority={priority}
      {...props}
    />
  );
}

/**
 * Lazy article image with intersection observer
 */
export function LazyArticleImage({
  imageId,
  threshold = 0.1,
  ...props
}: BulletproofArticleImageProps & { threshold?: number }) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={containerRef} className={props.className}>
      {isInView ? (
        <BulletproofArticleImage
          imageId={imageId}
          {...props}
        />
      ) : (
        <div className={`${props.className} bg-gray-200 animate-pulse`} />
      )}
    </div>
  );
}