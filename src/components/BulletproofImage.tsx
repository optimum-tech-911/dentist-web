import React, { useState, useEffect, useRef } from 'react';
import { UniversalImageLoader, useUniversalImageLoader } from '@/lib/image-loader';
import { convertToPublicUrl } from '@/lib/utils';

interface BulletproofImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (event: Event) => void;
  onLoad?: (event: Event) => void;
  onRetry?: (retryCount: number) => void;
  loading?: 'lazy' | 'eager';
  placeholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
  retryOnError?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export function BulletproofImage({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.svg',
  onError,
  onLoad,
  onRetry,
  loading = 'lazy',
  placeholder,
  errorPlaceholder,
  retryOnError = true,
  maxRetries = 3,
  timeout = 10000
}: BulletproofImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // Use the universal image loader
  const { url, isLoading, hasError: loaderError, retryCount: loaderRetryCount, retry } = useUniversalImageLoader(src, {
    maxRetries,
    timeout,
    fallbackUrls: [fallbackSrc]
  });

  useEffect(() => {
    setCurrentSrc(url);
    setIsLoading(isLoading);
    setHasError(loaderError);
    setRetryCount(loaderRetryCount);
  }, [url, isLoading, loaderError, loaderRetryCount]);

  const handleLoad = (event: Event) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(event);
  };

  const handleError = (event: Event) => {
    console.warn('BulletproofImage error:', currentSrc, event);
    setIsLoading(false);
    setHasError(true);
    onError?.(event);
    
    // Auto-retry if enabled
    if (retryOnError && retryCount < maxRetries) {
      setTimeout(() => {
        retry();
        onRetry?.(retryCount + 1);
      }, 1000 * (retryCount + 1)); // Exponential backoff
    }
  };

  const handleManualRetry = () => {
    retry();
    onRetry?.(retryCount + 1);
  };

  // Default placeholders
  const defaultPlaceholder = (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
    </div>
  );

  const defaultErrorPlaceholder = (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-xs">
      <div className="text-center">
        <div className="mb-2">Image unavailable</div>
        {retryOnError && retryCount < maxRetries && (
          <button
            onClick={handleManualRetry}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={className}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoading ? 0.5 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
      
      {/* Loading placeholder */}
      {isLoading && (placeholder || defaultPlaceholder)}
      
      {/* Error placeholder */}
      {hasError && (errorPlaceholder || defaultErrorPlaceholder)}
      
      {/* Debug info in development */}
      {import.meta.env.DEV && (
        <div className="absolute top-0 left-0 bg-black bg-opacity-75 text-white text-xs p-1">
          {retryCount > 0 && `Retries: ${retryCount}`}
          {hasError && 'Error'}
        </div>
      )}
    </div>
  );
}

/**
 * High-performance image component with preloading
 */
export function PreloadedImage({
  src,
  alt,
  className = '',
  priority = false,
  ...props
}: BulletproofImageProps & { priority?: boolean }) {
  const [isPreloaded, setIsPreloaded] = useState(false);

  useEffect(() => {
    if (priority) {
      UniversalImageLoader.preloadImage(src)
        .then(() => setIsPreloaded(true))
        .catch(() => setIsPreloaded(false));
    }
  }, [src, priority]);

  return (
    <BulletproofImage
      src={src}
      alt={alt}
      className={className}
      {...props}
    />
  );
}

/**
 * Lazy image component with intersection observer
 */
export function LazyImage({
  src,
  alt,
  className = '',
  threshold = 0.1,
  ...props
}: BulletproofImageProps & { threshold?: number }) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className={className}>
      {isInView ? (
        <BulletproofImage
          src={src}
          alt={alt}
          className={className}
          {...props}
        />
      ) : (
        <div className={`${className} bg-gray-200 animate-pulse`} />
      )}
    </div>
  );
}

/**
 * Background image component
 */
export function BackgroundImage({
  src,
  className = '',
  children,
  ...props
}: Omit<BulletproofImageProps, 'alt'> & { children?: React.ReactNode }) {
  const { url, isLoading, hasError } = useUniversalImageLoader(src);

  return (
    <div
      className={className}
      style={{
        backgroundImage: hasError ? 'none' : `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: isLoading ? 0.5 : 1,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {children}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-xs">
          Background image unavailable
        </div>
      )}
    </div>
  );
}