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

function getBases(): string[] {
  const envBase = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  const bases: string[] = [];
  if (envBase) {
    const trimmed = envBase.replace(/\/$/, '');
    bases.push(`${trimmed}/storage/v1/object/public/gallery/`);
  }
  bases.push('https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery/');
  bases.push('https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery-staging/');
  return bases;
}

function buildCandidates(src: string): string[] {
  if (!src) return [];
  const candidates: string[] = [];
  const clean = src.split('?')[0];
  const bases = getBases();

  const addUnique = (u?: string) => {
    if (u && !candidates.includes(u)) candidates.push(u);
  };

  // Absolute URLs first via converter
  if (clean.startsWith('http')) {
    addUnique(convertToPublicUrl(clean));
    const rel = clean.split('/object/sign/gallery/')[1] || clean.split('/object/public/gallery/')[1] || clean.split('/gallery/')[1];
    if (rel) {
      const path = rel.split('?')[0];
      bases.forEach(b => addUnique(`${b}${path}`));
    }
    return candidates.filter(Boolean);
  }

  // Starts with gallery/
  if (clean.startsWith('gallery/')) {
    const path = clean.substring('gallery/'.length);
    bases.forEach(b => addUnique(`${b}${path}`));
    return candidates.filter(Boolean);
  }

  // Raw key
  bases.forEach(b => addUnique(`${b}${clean}`));
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