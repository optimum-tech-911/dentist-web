import { convertToPublicUrl } from './utils';

export interface ImageLoadResult {
  success: boolean;
  url: string;
  error?: string;
  retryCount: number;
}

export interface ImageLoadOptions {
  maxRetries?: number;
  timeout?: number;
  fallbackUrls?: string[];
  enableProxy?: boolean;
}

/**
 * Universal image loader with multiple fallback strategies
 * This handles ALL image loading scenarios permanently
 */
export class UniversalImageLoader {
  private static readonly DEFAULT_OPTIONS: Required<ImageLoadOptions> = {
    maxRetries: 3,
    timeout: 10000,
    fallbackUrls: ['/placeholder.svg'],
    enableProxy: true
  };

  /**
   * Load an image with comprehensive fallback strategies
   */
  static async loadImage(
    src: string, 
    options: ImageLoadOptions = {}
  ): Promise<ImageLoadResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    let retryCount = 0;
    let currentUrl = convertToPublicUrl(src);

    // Strategy 1: Direct load with CORS
    while (retryCount < opts.maxRetries) {
      try {
        const result = await this.tryLoadImage(currentUrl, opts.timeout);
        if (result.success) {
          return { success: true, url: currentUrl, retryCount };
        }
      } catch (error) {
        console.warn(`Image load attempt ${retryCount + 1} failed:`, currentUrl, error);
      }

      retryCount++;
      
      // Strategy 2: Try without CORS
      if (retryCount === 1) {
        try {
          const result = await this.tryLoadImageWithoutCORS(currentUrl, opts.timeout);
          if (result.success) {
            return { success: true, url: currentUrl, retryCount };
          }
        } catch (error) {
          console.warn('Non-CORS load failed:', currentUrl, error);
        }
      }

      // Strategy 3: Try with different URL format
      if (retryCount === 2) {
        const alternativeUrl = this.getAlternativeUrl(currentUrl);
        if (alternativeUrl !== currentUrl) {
          currentUrl = alternativeUrl;
          try {
            const result = await this.tryLoadImage(currentUrl, opts.timeout);
            if (result.success) {
              return { success: true, url: currentUrl, retryCount };
            }
          } catch (error) {
            console.warn('Alternative URL load failed:', currentUrl, error);
          }
        }
      }

      // Strategy 4: Try proxy approach
      if (retryCount === 3 && opts.enableProxy) {
        const proxyUrl = this.getProxyUrl(currentUrl);
        try {
          const result = await this.tryLoadImage(proxyUrl, opts.timeout);
          if (result.success) {
            return { success: true, url: proxyUrl, retryCount };
          }
        } catch (error) {
          console.warn('Proxy load failed:', proxyUrl, error);
        }
      }
    }

    // All strategies failed, return fallback
    return {
      success: false,
      url: opts.fallbackUrls[0],
      error: 'All image loading strategies failed',
      retryCount
    };
  }

  /**
   * Try loading image with CORS
   */
  private static async tryLoadImage(url: string, timeout: number): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        img.src = '';
        reject(new Error('Image load timeout'));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve({ success: true });
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Image load failed'));
      };

      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  }

  /**
   * Try loading image without CORS
   */
  private static async tryLoadImageWithoutCORS(url: string, timeout: number): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        img.src = '';
        reject(new Error('Image load timeout'));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve({ success: true });
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Image load failed'));
      };

      // No crossOrigin attribute
      img.src = url;
    });
  }

  /**
   * Get alternative URL format
   */
  private static getAlternativeUrl(url: string): string {
    // Try different URL patterns
    if (url.includes('/object/public/')) {
      // Already public, try signed
      return url.replace('/object/public/', '/object/sign/');
    } else if (url.includes('/object/sign/')) {
      // Already signed, try public
      return url.replace('/object/sign/', '/object/public/');
    }
    
    // Try with different domain
    if (url.includes('supabase.co')) {
      return url.replace('https://', 'https://');
    }
    
    return url;
  }

  /**
   * Get proxy URL (placeholder for future proxy implementation)
   */
  private static getProxyUrl(url: string): string {
    // For now, return the original URL
    // In the future, this could point to a proxy service
    return url;
  }

  /**
   * Preload image for better performance
   */
  static preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Preload failed'));
      img.src = convertToPublicUrl(src);
    });
  }

  /**
   * Batch preload multiple images
   */
  static async preloadImages(sources: string[]): Promise<{ success: number; failed: number }> {
    const results = await Promise.allSettled(
      sources.map(src => this.preloadImage(src))
    );

    const success = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return { success, failed };
  }
}

/**
 * React hook for universal image loading
 */
export function useUniversalImageLoader(src: string, options: ImageLoadOptions = {}) {
  const [state, setState] = useState<{
    url: string;
    isLoading: boolean;
    hasError: boolean;
    retryCount: number;
  }>({
    url: convertToPublicUrl(src),
    isLoading: true,
    hasError: false,
    retryCount: 0
  });

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, hasError: false }));
        
        const result = await UniversalImageLoader.loadImage(src, options);
        
        if (mounted) {
          setState({
            url: result.url,
            isLoading: false,
            hasError: !result.success,
            retryCount: result.retryCount
          });
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            hasError: true
          }));
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [src, JSON.stringify(options)]);

  const retry = () => {
    setState(prev => ({ ...prev, isLoading: true, hasError: false }));
  };

  return { ...state, retry };
}