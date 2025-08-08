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

function buildCandidates(src: string): string[] {
  if (!src) return [];
  const candidates: string[] = [];
  const clean = src.split('?')[0];

  const addUnique = (u?: string) => {
    if (u && !candidates.includes(u)) candidates.push(u);
  };

  // If absolute signed/public URLs
  if (clean.startsWith('http')) {
    addUnique(convertToPublicUrl(clean));
    // If it's a signed URL with gallery path, try both buckets
    const afterSign = clean.split('/object/sign/gallery/')[1];
    const afterPublic = clean.split('/object/public/gallery/')[1];
    const rel = afterSign || afterPublic || clean.split('/gallery/')[1];
    if (rel) {
      const path = rel.split('?')[0];
      addUnique(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery/${path}`);
      addUnique(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery-staging/${path}`);
    }
    return candidates.filter(Boolean);
  }

  // If starts with gallery/
  if (clean.startsWith('gallery/')) {
    const path = clean.substring('gallery/'.length);
    addUnique(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery/${path}`);
    addUnique(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery-staging/${path}`);
    return candidates.filter(Boolean);
  }

  // Otherwise treat as raw path key
  addUnique(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery/${clean}`);
  addUnique(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery-staging/${clean}`);
  return candidates.filter(Boolean);
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
  const [candidates, setCandidates] = useState<string[]>(buildCandidates(src));
  const [index, setIndex] = useState(0);
  const [currentSrc, setCurrentSrc] = useState<string>(candidates[0] || '');
  const [isExhausted, setIsExhausted] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const list = buildCandidates(src);
    setCandidates(list);
    setIndex(0);
    setIsExhausted(false);
    setCurrentSrc(list[0] || '');
  }, [src]);

  const handleLoad = (event: Event) => {
    onLoad?.(event);
  };

  const handleError = (event: Event) => {
    const nextIndex = index + 1;
    if (nextIndex < candidates.length) {
      setIndex(nextIndex);
      setCurrentSrc(candidates[nextIndex]);
      return;
    }
    // Exhausted candidates; try fallback
    if (!isExhausted && fallbackSrc && currentSrc !== fallbackSrc) {
      setIsExhausted(true);
      setCurrentSrc(fallbackSrc);
      return;
    }
    onError?.(event);
  };

  if (!currentSrc) return null;

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={className}
      crossOrigin={crossOrigin}
      loading={loading}
      onLoad={handleLoad as any}
      onError={handleError as any}
    />
  );
}

/**
 * Hook for handling image loading with retry logic
 */
export function useImageLoader(src: string, fallbackSrc: string = '') {
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