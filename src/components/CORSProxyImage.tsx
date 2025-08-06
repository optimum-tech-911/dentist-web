import React, { useState, useEffect, useRef } from 'react';

interface CORSProxyImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
}

export function CORSProxyImage({
  src,
  alt,
  className = '',
  onError,
  onLoad,
  loading = 'lazy'
}: CORSProxyImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setHasError(false);

    // Convert Supabase URLs to proxy URLs
    const proxyUrl = convertToProxyUrl(src);
    setCurrentSrc(proxyUrl);
  }, [src]);

  const convertToProxyUrl = (originalUrl: string): string => {
    // If it's already a proxy URL, return as is
    if (originalUrl.includes('/api/proxy-image')) {
      return originalUrl;
    }

    // If it's a Supabase URL, convert to proxy
    if (originalUrl.includes('supabase.co') || originalUrl.includes('supabase.com')) {
      return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
    }

    // If it's a relative path, try to convert to Supabase URL first
    if (!originalUrl.startsWith('http') && !originalUrl.startsWith('/api/')) {
      const supabaseUrl = `https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery/${originalUrl}`;
      return `/api/proxy-image?url=${encodeURIComponent(supabaseUrl)}`;
    }

    return originalUrl;
  };

  const handleImageError = (event: Event) => {
    console.warn('CORS Proxy Image Error:', currentSrc, event);
    setHasError(true);
    setIsLoading(false);
    onError?.('Image failed to load through proxy');
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    // Force reload by adding timestamp
    const retryUrl = `${currentSrc}${currentSrc.includes('?') ? '&' : '?'}retry=${Date.now()}`;
    setCurrentSrc(retryUrl);
  };





  // Don't render anything if there's an error or no src
  if (hasError || !currentSrc) {
    return null;
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
      />
    </div>
  );
}