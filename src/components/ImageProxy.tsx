import React, { useState, useEffect, useRef } from 'react';
import { convertToPublicUrl } from '@/lib/utils';

interface ImageProxyProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (event: Event) => void;
  onLoad?: (event: Event) => void;
  loading?: 'lazy' | 'eager';
}

export function ImageProxy({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.svg',
  onError,
  onLoad,
  loading = 'lazy'
}: ImageProxyProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        const publicUrl = convertToPublicUrl(src);
        setCurrentSrc(publicUrl);
        
        // Create a new image element to test loading
        const testImg = new Image();
        testImg.crossOrigin = 'anonymous';
        
        testImg.onload = () => {
          setIsLoading(false);
          onLoad?.(new Event('load'));
        };
        
        testImg.onerror = () => {
          console.warn('Image failed to load with CORS, trying alternative approach:', publicUrl);
          
          // Try without crossOrigin
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            setIsLoading(false);
            onLoad?.(new Event('load'));
          };
          
          fallbackImg.onerror = () => {
            console.error('Image completely failed to load:', publicUrl);
            setHasError(true);
            setIsLoading(false);
            setCurrentSrc(fallbackSrc);
            onError?.(new Event('error'));
          };
          
          fallbackImg.src = publicUrl;
        };
        
        testImg.src = publicUrl;
        
      } catch (error) {
        console.error('Error loading image:', error);
        setHasError(true);
        setIsLoading(false);
        setCurrentSrc(fallbackSrc);
        onError?.(new Event('error'));
      }
    };
    
    loadImage();
  }, [src, fallbackSrc, onError, onLoad]);

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={className}
        loading={loading}
        style={{
          opacity: isLoading ? 0.5 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
        </div>
      )}
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-xs">
          Image unavailable
        </div>
      )}
    </div>
  );
}

/**
 * Alternative approach using canvas to avoid CORS issues
 */
export function CanvasImage({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.svg',
  onError,
  onLoad
}: ImageProxyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadImageToCanvas = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        const publicUrl = convertToPublicUrl(src);
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          // Set canvas dimensions
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          
          // Draw image to canvas
          ctx.drawImage(img, 0, 0);
          
          setIsLoading(false);
          onLoad?.(new Event('load'));
        };
        
        img.onerror = () => {
          console.warn('Canvas image failed to load:', publicUrl);
          setHasError(true);
          setIsLoading(false);
          onError?.(new Event('error'));
        };
        
        img.src = publicUrl;
        
      } catch (error) {
        console.error('Error loading canvas image:', error);
        setHasError(true);
        setIsLoading(false);
        onError?.(new Event('error'));
      }
    };
    
    loadImageToCanvas();
  }, [src, onError, onLoad]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          opacity: isLoading ? 0.5 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-xs">
          Image unavailable
        </div>
      )}
    </div>
  );
}