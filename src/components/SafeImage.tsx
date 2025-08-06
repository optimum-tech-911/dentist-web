import React, { useState, useRef, useEffect } from 'react';
import { convertToPublicUrl } from '@/lib/utils';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (event: Event) => void;
  onLoad?: (event: Event) => void;
  crossOrigin?: 'anonymous' | 'use-credentials';
  loading?: 'lazy' | 'eager';
}

export function SafeImage({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.svg',
  onError,
  onLoad,
  crossOrigin = 'anonymous',
  loading = 'lazy'
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(convertToPublicUrl(src));
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentSrc(convertToPublicUrl(src));
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = (event: Event) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(event);
  };

  const handleError = (event: Event) => {
    console.warn('Image failed to load:', currentSrc);
    
    if (!hasError && currentSrc !== fallbackSrc) {
      // First error, try fallback
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
    } else {
      // Even fallback failed
      setIsLoading(false);
      setHasError(true);
      onError?.(event);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={className}
        crossOrigin={crossOrigin}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}

      />

      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-xs">
          Image unavailable
        </div>
      )}
    </div>
  );
}

/**
 * Hook for handling image loading with retry logic
 */
export function useImageLoader(src: string, fallbackSrc: string = '/placeholder.svg') {
  const [imageSrc, setImageSrc] = useState<string>(convertToPublicUrl(src));
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setImageSrc(convertToPublicUrl(src));
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  const retry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      setHasError(false);
      // Force reload by adding timestamp
      setImageSrc(`${convertToPublicUrl(src)}?retry=${retryCount + 1}&t=${Date.now()}`);
    } else {
      // Max retries reached, use fallback
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
  };

  const handleError = () => {
    if (retryCount < 3) {
      retry();
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return {
    imageSrc,
    isLoading,
    hasError,
    retryCount,
    retry,
    handleError,
    handleLoad
  };
}