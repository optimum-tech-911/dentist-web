// Ultra-aggressive image caching and preloading system
class BulletproofImageCache {
  private cache = new Map<string, string>();
  private preloadCache = new Map<string, HTMLImageElement>();
  private indexedDBCache?: IDBDatabase;
  private readonly DB_NAME = 'BulletproofImageCache';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'images';
  private readonly MAX_CACHE_SIZE = 100; // Maximum cached images

  constructor() {
    this.initIndexedDB();
    this.initServiceWorkerCache();
  }

  // Initialize IndexedDB for persistent storage
  private async initIndexedDB(): Promise<void> {
    try {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => {
        console.warn('❌ IndexedDB not available for image caching');
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        this.indexedDBCache = (event.target as IDBOpenDBRequest).result;
        console.log('✅ IndexedDB image cache initialized');
        this.cleanOldCachedImages();
      };
    } catch (error) {
      console.warn('⚠️ Failed to initialize IndexedDB cache:', error);
    }
  }

  // Initialize Service Worker caching
  private async initServiceWorkerCache(): Promise<void> {
    if ('serviceWorker' in navigator && 'caches' in window) {
      try {
        await caches.open('bulletproof-images-v1');
        console.log('✅ Service Worker cache initialized');
      } catch (error) {
        console.warn('⚠️ Failed to initialize Service Worker cache:', error);
      }
    }
  }

  // Clean old cached images to prevent storage bloat
  private async cleanOldCachedImages(): Promise<void> {
    if (!this.indexedDBCache) return;
    
    try {
      const transaction = this.indexedDBCache.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('timestamp');
      
      const request = index.openCursor();
      const items: Array<{ url: string; timestamp: number }> = [];
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          items.push({ url: cursor.key as string, timestamp: cursor.value.timestamp });
          cursor.continue();
        } else {
          // Sort by timestamp and keep only the most recent
          items.sort((a, b) => b.timestamp - a.timestamp);
          
          if (items.length > this.MAX_CACHE_SIZE) {
            const toDelete = items.slice(this.MAX_CACHE_SIZE);
            toDelete.forEach(item => {
              store.delete(item.url);
            });
            console.log(`🧹 Cleaned ${toDelete.length} old cached images`);
          }
        }
      };
    } catch (error) {
      console.warn('⚠️ Failed to clean old cached images:', error);
    }
  }

  // Convert image to base64 for caching
  private async imageToBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(blob);
      });
    } catch (error) {
      console.warn('⚠️ Failed to convert image to base64:', error);
      return null;
    }
  }

  // Store image in IndexedDB
  private async storeInIndexedDB(url: string, base64: string): Promise<void> {
    if (!this.indexedDBCache) return;
    
    try {
      const transaction = this.indexedDBCache.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      await store.put({
        url,
        base64,
        timestamp: Date.now()
      });
    } catch (error) {
      console.warn('⚠️ Failed to store image in IndexedDB:', error);
    }
  }

  // Retrieve image from IndexedDB
  private async getFromIndexedDB(url: string): Promise<string | null> {
    if (!this.indexedDBCache) return null;
    
    try {
      const transaction = this.indexedDBCache.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(url);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.base64 : null);
        };
        
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.warn('⚠️ Failed to retrieve image from IndexedDB:', error);
      return null;
    }
  }

  // Store in Service Worker cache
  private async storeInServiceWorkerCache(url: string): Promise<void> {
    if (!('caches' in window)) return;
    
    try {
      const cache = await caches.open('bulletproof-images-v1');
      await cache.add(url);
    } catch (error) {
      console.warn('⚠️ Failed to store in Service Worker cache:', error);
    }
  }

  // Get from Service Worker cache
  private async getFromServiceWorkerCache(url: string): Promise<Response | null> {
    if (!('caches' in window)) return null;
    
    try {
      const cache = await caches.open('bulletproof-images-v1');
      return await cache.match(url);
    } catch (error) {
      console.warn('⚠️ Failed to get from Service Worker cache:', error);
      return null;
    }
  }

  // Preload an image
  async preload(url: string): Promise<boolean> {
    if (!url || this.preloadCache.has(url)) return true;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        resolve(false);
      }, 15000); // 15 second timeout for preloading
      
      img.onload = async () => {
        clearTimeout(timeout);
        this.preloadCache.set(url, img);
        
        // Store in persistent caches
        const base64 = await this.imageToBase64(url);
        if (base64) {
          this.cache.set(url, base64);
          await this.storeInIndexedDB(url, base64);
        }
        
        await this.storeInServiceWorkerCache(url);
        
        console.log(`✅ Preloaded and cached: ${url}`);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      img.src = url;
    });
  }

  // Get cached image (tries multiple cache layers)
  async getCached(url: string): Promise<string | null> {
    // Layer 1: Memory cache
    if (this.cache.has(url)) {
      console.log(`📦 Retrieved from memory cache: ${url}`);
      return this.cache.get(url)!;
    }
    
    // Layer 2: Preload cache
    if (this.preloadCache.has(url)) {
      console.log(`📦 Retrieved from preload cache: ${url}`);
      return url; // Image is already loaded in browser
    }
    
    // Layer 3: IndexedDB cache
    const cachedBase64 = await this.getFromIndexedDB(url);
    if (cachedBase64) {
      console.log(`📦 Retrieved from IndexedDB cache: ${url}`);
      this.cache.set(url, cachedBase64); // Store in memory for faster access
      return cachedBase64;
    }
    
    // Layer 4: Service Worker cache
    const cachedResponse = await this.getFromServiceWorkerCache(url);
    if (cachedResponse) {
      console.log(`📦 Retrieved from Service Worker cache: ${url}`);
      return url; // Let browser handle the cached response
    }
    
    return null;
  }

  // Bulk preload multiple images
  async preloadBatch(urls: string[]): Promise<void> {
    console.log(`🚀 Starting batch preload of ${urls.length} images`);
    
    // Process in chunks to avoid overwhelming the browser
    const chunkSize = 3;
    for (let i = 0; i < urls.length; i += chunkSize) {
      const chunk = urls.slice(i, i + chunkSize);
      const promises = chunk.map(url => this.preload(url));
      
      await Promise.allSettled(promises);
      
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ Batch preload completed`);
  }

  // Check if image is cached
  isCached(url: string): boolean {
    return this.cache.has(url) || this.preloadCache.has(url);
  }

  // Clear all caches (nuclear option)
  async clearAll(): Promise<void> {
    this.cache.clear();
    this.preloadCache.clear();
    
    if (this.indexedDBCache) {
      const transaction = this.indexedDBCache.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      await store.clear();
    }
    
    if ('caches' in window) {
      await caches.delete('bulletproof-images-v1');
    }
    
    console.log('🧹 All image caches cleared');
  }

  // Get cache statistics
  getStats(): { memory: number; preload: number; total: number } {
    return {
      memory: this.cache.size,
      preload: this.preloadCache.size,
      total: this.cache.size + this.preloadCache.size
    };
  }
}

// Global cache instance
export const bulletproofImageCache = new BulletproofImageCache();

// Utility function to preload all images from posts
export async function preloadBlogImages(posts: Array<{ image?: string; title: string }>): Promise<void> {
  const imageUrls = posts
    .filter(post => post.image)
    .map(post => post.image!)
    .filter(url => url && !url.startsWith('data:')); // Skip base64 images
  
  if (imageUrls.length > 0) {
    await bulletproofImageCache.preloadBatch(imageUrls);
  }
}

// Initialize cache on first import
if (typeof window !== 'undefined') {
  console.log('🚀 Bulletproof Image Cache System Initialized');
}