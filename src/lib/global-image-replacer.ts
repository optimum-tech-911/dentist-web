import { UniversalImageLoader } from './image-loader';

/**
 * Global image replacement system
 * This automatically enhances all image loading in the application
 */
export class GlobalImageReplacer {
  private static isInitialized = false;
  private static observer: MutationObserver | null = null;

  /**
   * Initialize global image replacement
   */
  static initialize() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    
    // Replace existing images
    this.replaceExistingImages();
    
    // Watch for new images
    this.observeNewImages();
    
    // Enhance image error handling
    this.enhanceImageErrorHandling();
    
    console.log('Global image replacement system initialized');
  }

  /**
   * Replace all existing images with enhanced loading
   */
  private static replaceExistingImages() {
    const images = document.querySelectorAll('img[src]');
    
    images.forEach(img => {
      this.enhanceImage(img as HTMLImageElement);
    });
  }

  /**
   * Watch for new images being added to the DOM
   */
  private static observeNewImages() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the added element is an image
            if (element.tagName === 'IMG') {
              this.enhanceImage(element as HTMLImageElement);
            }
            
            // Check for images within the added element
            const images = element.querySelectorAll('img[src]');
            images.forEach(img => {
              this.enhanceImage(img as HTMLImageElement);
            });
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Enhance a single image with bulletproof loading
   */
  private static enhanceImage(img: HTMLImageElement) {
    const originalSrc = img.src;
    
    // Skip if already enhanced
    if (img.dataset.enhanced === 'true') return;
    
    // Mark as enhanced
    img.dataset.enhanced = 'true';
    
    // Store original attributes
    const originalOnError = img.onerror;
    const originalOnLoad = img.onload;
    
    // Enhanced error handling
    img.onerror = async (event) => {
      console.warn('Image failed to load:', originalSrc);
      
      // Try universal loader
      try {
        const result = await UniversalImageLoader.loadImage(originalSrc);
        if (result.success) {
          img.src = result.url;
          return;
        }
      } catch (error) {
        console.error('Universal loader failed:', error);
      }
      
      // Fallback to placeholder
      img.src = '/placeholder.svg';
      
      // Call original error handler
      if (originalOnError) {
        originalOnError.call(img, event);
      }
    };
    
    // Enhanced load handling
    img.onload = (event) => {
      console.log('Image loaded successfully:', originalSrc);
      
      // Call original load handler
      if (originalOnLoad) {
        originalOnLoad.call(img, event);
      }
    };
    
    // Add CORS attribute
    if (!img.crossOrigin) {
      img.crossOrigin = 'anonymous';
    }
  }

  /**
   * Enhance image error handling globally
   */
  private static enhanceImageErrorHandling() {
    // Override the global image error handler
    const originalImage = window.Image;
    
    window.Image = function(...args) {
      const img = new originalImage(...args);
      
      // Add enhanced error handling
      const originalOnError = img.onerror;
      img.onerror = (event) => {
        console.warn('Dynamic image failed to load:', img.src);
        
        // Call original handler
        if (originalOnError) {
          originalOnError.call(img, event);
        }
      };
      
      return img;
    } as any;
    
    // Copy static properties
    Object.setPrototypeOf(window.Image, originalImage);
    Object.setPrototypeOf(window.Image.prototype, originalImage.prototype);
  }

  /**
   * Preload critical images
   */
  static preloadCriticalImages(sources: string[]) {
    return UniversalImageLoader.preloadImages(sources);
  }

  /**
   * Get image loading statistics
   */
  static getStats() {
    const images = document.querySelectorAll('img[src]');
    const enhanced = document.querySelectorAll('img[data-enhanced="true"]');
    const failed = document.querySelectorAll('img[src="/placeholder.svg"]');
    
    return {
      total: images.length,
      enhanced: enhanced.length,
      failed: failed.length,
      successRate: images.length > 0 ? ((images.length - failed.length) / images.length * 100).toFixed(1) : '0'
    };
  }

  /**
   * Cleanup
   */
  static cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isInitialized = false;
  }
}

/**
 * React hook for global image replacement
 */
export function useGlobalImageReplacement() {
  useEffect(() => {
    GlobalImageReplacer.initialize();
    
    return () => {
      GlobalImageReplacer.cleanup();
    };
  }, []);
}

/**
 * Auto-initialize on app start
 */
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      GlobalImageReplacer.initialize();
    });
  } else {
    GlobalImageReplacer.initialize();
  }
}