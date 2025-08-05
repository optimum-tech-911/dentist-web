import React, { useState, useEffect, useRef } from 'react';
import { ErrorProofImageSystem } from '@/lib/error-proof-image-system';

interface ErrorProofImageProps {
  imageId: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  onRecovery?: (attempt: number) => void;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
  timeout?: number;
  placeholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
}

export function ErrorProofImage({
  imageId,
  alt = 'Image',
  className = '',
  fallbackSrc = '/placeholder.svg',
  onError,
  onLoad,
  onRecovery,
  loading = 'lazy',
  priority = false,
  retryOnError = true,
  maxRetries = 5,
  timeout = 15000,
  placeholder,
  errorPlaceholder
}: ErrorProofImageProps) {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    loadImage();
  }, [imageId]);

  const loadImage = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      // Get error-proof URL
      const url = await ErrorProofImageSystem.getWorkingUrl(imageId);
      
      if (url === '/placeholder.svg') {
        // Image not found or all URLs failed
        setHasError(true);
        setCurrentUrl(fallbackSrc);
        setHealthStatus('error');
        onError?.('Image not found or unavailable');
      } else {
        // Got working URL
        setCurrentUrl(url);
        setHealthStatus('healthy');
        onLoad?.();
      }
    } catch (error) {
      console.error('Failed to load error-proof image:', error);
      setHasError(true);
      setCurrentUrl(fallbackSrc);
      setHealthStatus('error');
      onError?.(error instanceof Error ? error.message : 'Failed to load image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      console.warn('Max retries reached for image:', imageId);
      return;
    }

    setRetryCount(prev => prev + 1);
    setRecoveryAttempts(prev => prev + 1);
    onRecovery?.(retryCount + 1);

    // Attempt recovery
    try {
      const image = await ErrorProofImageSystem.getErrorProofImage(imageId);
      if (image && image.url !== currentUrl) {
        setCurrentUrl(image.url);
        setHealthStatus(image.health_status);
        setHasError(false);
        onLoad?.();
        return;
      }
    } catch (error) {
      console.error('Recovery failed:', error);
    }

    // If recovery failed, try loading again
    await loadImage();
  };

  const handleImageError = async (event: Event) => {
    console.warn('Error-proof image failed to load:', currentUrl);
    setHasError(true);
    
    if (retryOnError && retryCount < maxRetries) {
      // Auto-retry with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      setTimeout(() => {
        handleRetry();
      }, delay);
    } else {
      // All retries failed, show placeholder
      setCurrentUrl(fallbackSrc);
      onError?.('Image failed to load after all retries');
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setHealthStatus('healthy');
    onLoad?.();
  };

  // Default placeholders
  const defaultPlaceholder = (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
    </div>
  );

  const defaultErrorPlaceholder = (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
      <div className="text-center">
        <div className="mb-2">Image unavailable</div>
        {retryOnError && retryCount < maxRetries && (
          <button
            onClick={handleRetry}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Retry ({maxRetries - retryCount} left)
          </button>
        )}
        {recoveryAttempts > 0 && (
          <div className="text-xs text-gray-400 mt-1">
            Recovery attempts: {recoveryAttempts}
          </div>
        )}
      </div>
    </div>
  );

  // Health status indicator
  const getHealthIndicator = () => {
    switch (healthStatus) {
      case 'healthy':
        return <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'warning':
        return <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'error':
        return <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        {placeholder || defaultPlaceholder}
      </div>
    );
  }

  if (hasError && currentUrl === fallbackSrc) {
    return (
      <div className={`relative ${className}`}>
        {errorPlaceholder || defaultErrorPlaceholder}
        {getHealthIndicator()}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={currentUrl}
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
      
      {/* Health indicator */}
      {getHealthIndicator()}
      
      {/* Debug info in development */}
      {import.meta.env.DEV && (
        <div className="absolute top-0 left-0 bg-black bg-opacity-75 text-white text-xs p-1">
          {retryCount > 0 && `Retries: ${retryCount}`}
          {recoveryAttempts > 0 && `Recovery: ${recoveryAttempts}`}
          {hasError && 'Error'}
        </div>
      )}
    </div>
  );
}

/**
 * Hook for error-proof image loading
 */
export function useErrorProofImage(imageId: string) {
  const [state, setState] = useState<{
    url: string;
    isLoading: boolean;
    hasError: boolean;
    healthStatus: 'healthy' | 'warning' | 'error';
    retryCount: number;
    recoveryAttempts: number;
  }>({
    url: '',
    isLoading: true,
    hasError: false,
    healthStatus: 'healthy',
    retryCount: 0,
    recoveryAttempts: 0
  });

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, hasError: false }));

        const image = await ErrorProofImageSystem.getErrorProofImage(imageId);
        
        if (!mounted) return;

        if (!image) {
          setState({
            url: '/placeholder.svg',
            isLoading: false,
            hasError: true,
            healthStatus: 'error',
            retryCount: 0,
            recoveryAttempts: 0
          });
          return;
        }

        const workingUrl = await ErrorProofImageSystem.getWorkingUrl(imageId);
        
        if (!mounted) return;

        setState({
          url: workingUrl,
          isLoading: false,
          hasError: workingUrl === '/placeholder.svg',
          healthStatus: image.health_status,
          retryCount: 0,
          recoveryAttempts: image.recovery_attempts || 0
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
 * High-performance error-proof image with preloading
 */
export function PreloadedErrorProofImage({
  imageId,
  priority = false,
  ...props
}: ErrorProofImageProps & { priority?: boolean }) {
  const [isPreloaded, setIsPreloaded] = useState(false);

  useEffect(() => {
    if (priority) {
      // Preload the image
      ErrorProofImageSystem.getWorkingUrl(imageId)
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
    <ErrorProofImage
      imageId={imageId}
      priority={priority}
      {...props}
    />
  );
}

/**
 * Lazy error-proof image with intersection observer
 */
export function LazyErrorProofImage({
  imageId,
  threshold = 0.1,
  ...props
}: ErrorProofImageProps & { threshold?: number }) {
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
        <ErrorProofImage
          imageId={imageId}
          {...props}
        />
      ) : (
        <div className={`${props.className} bg-gray-200 animate-pulse`} />
      )}
    </div>
  );
}