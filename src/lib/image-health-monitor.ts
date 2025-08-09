// Real-time image health monitoring and auto-healing system
import { bulletproofImageCache } from './bulletproof-image-cache';
import { generateEmergencyImage } from './emergency-image-generator';

interface ImageHealthStatus {
  url: string;
  status: 'healthy' | 'warning' | 'critical' | 'failed';
  lastChecked: number;
  responseTime: number;
  errorCount: number;
  successCount: number;
  healingAttempts: number;
  isHealing: boolean;
  metadata?: {
    title?: string;
    category?: string;
    postId?: string;
  };
}

class ImageHealthMonitor {
  private healthMap = new Map<string, ImageHealthStatus>();
  private monitoringInterval?: number;
  private healingQueue = new Set<string>();
  private observers = new Map<string, Set<(status: ImageHealthStatus) => void>>();
  private isRunning = false;

  private readonly CHECK_INTERVAL = 30000; // 30 seconds
  private readonly TIMEOUT = 10000; // 10 seconds
  private readonly MAX_ERROR_COUNT = 3;
  private readonly MAX_HEALING_ATTEMPTS = 5;

  constructor() {
    this.startMonitoring();
    this.setupVisibilityChangeListener();
  }

  // Start the monitoring system
  startMonitoring(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🔍 Image Health Monitor started');
    
    this.monitoringInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, this.CHECK_INTERVAL);
    
    // Immediate initial check
    setTimeout(() => this.performHealthCheck(), 1000);
  }

  // Stop the monitoring system
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isRunning = false;
    console.log('⏹️ Image Health Monitor stopped');
  }

  // Setup visibility change listener to pause/resume monitoring
  private setupVisibilityChangeListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('👁️ Tab hidden, pausing image monitoring');
        this.stopMonitoring();
      } else {
        console.log('👁️ Tab visible, resuming image monitoring');
        this.startMonitoring();
      }
    });
  }

  // Register an image for monitoring
  registerImage(url: string, metadata?: { title?: string; category?: string; postId?: string }): void {
    if (!url || this.healthMap.has(url)) return;
    
    const status: ImageHealthStatus = {
      url,
      status: 'healthy',
      lastChecked: 0,
      responseTime: 0,
      errorCount: 0,
      successCount: 0,
      healingAttempts: 0,
      isHealing: false,
      metadata
    };
    
    this.healthMap.set(url, status);
    console.log(`📋 Registered image for monitoring: ${url}`);
    
    // Immediate health check for new images
    this.checkImageHealth(url);
  }

  // Unregister an image from monitoring
  unregisterImage(url: string): void {
    this.healthMap.delete(url);
    this.healingQueue.delete(url);
    this.observers.delete(url);
    console.log(`📋 Unregistered image from monitoring: ${url}`);
  }

  // Check health of a specific image
  private async checkImageHealth(url: string): Promise<void> {
    const status = this.healthMap.get(url);
    if (!status || status.isHealing) return;
    
    const startTime = Date.now();
    
    try {
      const success = await this.testImageUrl(url);
      const responseTime = Date.now() - startTime;
      
      status.lastChecked = Date.now();
      status.responseTime = responseTime;
      
      if (success) {
        status.successCount++;
        status.errorCount = Math.max(0, status.errorCount - 1); // Reduce error count on success
        
        if (status.errorCount === 0) {
          status.status = 'healthy';
        } else if (status.errorCount <= 1) {
          status.status = 'warning';
        }
        
        console.log(`✅ Image health check passed: ${url} (${responseTime}ms)`);
      } else {
        status.errorCount++;
        
        if (status.errorCount >= this.MAX_ERROR_COUNT) {
          status.status = 'critical';
          this.scheduleHealing(url);
        } else if (status.errorCount >= 2) {
          status.status = 'warning';
        }
        
        console.warn(`⚠️ Image health check failed: ${url} (errors: ${status.errorCount})`);
      }
      
    } catch (error) {
      status.errorCount++;
      status.status = status.errorCount >= this.MAX_ERROR_COUNT ? 'failed' : 'warning';
      status.lastChecked = Date.now();
      
      console.error(`❌ Image health check error: ${url}`, error);
    }
    
    // Notify observers
    this.notifyObservers(url, status);
  }

  // Test if an image URL is accessible
  private testImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        resolve(false);
      }, this.TIMEOUT);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      img.src = url;
    });
  }

  // Schedule healing for a failed image
  private scheduleHealing(url: string): void {
    if (this.healingQueue.has(url)) return;
    
    const status = this.healthMap.get(url);
    if (!status || status.healingAttempts >= this.MAX_HEALING_ATTEMPTS) {
      console.error(`💀 Image beyond healing: ${url}`);
      status && (status.status = 'failed');
      return;
    }
    
    this.healingQueue.add(url);
    console.log(`🚑 Scheduled healing for: ${url}`);
    
    // Process healing queue
    setTimeout(() => this.processHealingQueue(), 1000);
  }

  // Process the healing queue
  private async processHealingQueue(): Promise<void> {
    if (this.healingQueue.size === 0) return;
    
    console.log(`🚑 Processing healing queue (${this.healingQueue.size} images)`);
    
    for (const url of this.healingQueue) {
      await this.healImage(url);
      this.healingQueue.delete(url);
      
      // Small delay between healing attempts
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Heal a specific image
  private async healImage(url: string): Promise<void> {
    const status = this.healthMap.get(url);
    if (!status) return;
    
    status.isHealing = true;
    status.healingAttempts++;
    
    console.log(`🚑 Attempting to heal image: ${url} (attempt ${status.healingAttempts})`);
    
    try {
      // Strategy 1: Try to get from cache
      const cachedImage = await bulletproofImageCache.getCached(url);
      if (cachedImage) {
        console.log(`✅ Healed image from cache: ${url}`);
        status.status = 'healthy';
        status.errorCount = 0;
        status.isHealing = false;
        this.notifyObservers(url, status);
        return;
      }
      
      // Strategy 2: Try alternative URLs
      const alternativeUrls = this.generateAlternativeUrls(url);
      for (const altUrl of alternativeUrls) {
        const success = await this.testImageUrl(altUrl);
        if (success) {
          console.log(`✅ Healed image with alternative URL: ${altUrl}`);
          
          // Update the registered URL
          this.healthMap.delete(url);
          this.registerImage(altUrl, status.metadata);
          
          status.isHealing = false;
          return;
        }
      }
      
      // Strategy 3: Generate emergency replacement
      if (status.metadata) {
        const emergencyImage = generateEmergencyImage(
          status.metadata.title || 'Article Image',
          status.metadata.category
        );
        
        // Cache the emergency image
        await bulletproofImageCache.preload(emergencyImage);
        
        console.log(`🆘 Generated emergency replacement for: ${url}`);
        status.status = 'warning'; // Not perfect, but working
        status.errorCount = 1;
      }
      
    } catch (error) {
      console.error(`❌ Healing failed for: ${url}`, error);
      status.status = 'failed';
    }
    
    status.isHealing = false;
    this.notifyObservers(url, status);
  }

  // Generate alternative URLs to try
  private generateAlternativeUrls(url: string): string[] {
    const alternatives: string[] = [];
    
    // Try different protocols
    if (url.startsWith('https://')) {
      alternatives.push(url.replace('https://', 'http://'));
    } else if (url.startsWith('http://')) {
      alternatives.push(url.replace('http://', 'https://'));
    }
    
    // Try different bucket names if it's a Supabase URL
    if (url.includes('supabase.co/storage/v1/object/public/')) {
      const basePath = url.split('/public/')[1];
      if (basePath) {
        alternatives.push(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/images/${basePath}`);
        alternatives.push(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/uploads/${basePath}`);
        alternatives.push(`https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery-backup/${basePath}`);
      }
    }
    
    return alternatives;
  }

  // Perform health check on all registered images
  private async performHealthCheck(): Promise<void> {
    if (this.healthMap.size === 0) return;
    
    console.log(`🔍 Performing health check on ${this.healthMap.size} images`);
    
    // Check images in batches to avoid overwhelming the browser
    const urls = Array.from(this.healthMap.keys());
    const batchSize = 5;
    
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const promises = batch.map(url => this.checkImageHealth(url));
      
      await Promise.allSettled(promises);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`✅ Health check completed`);
  }

  // Subscribe to status changes for a specific image
  subscribeToImage(url: string, callback: (status: ImageHealthStatus) => void): () => void {
    if (!this.observers.has(url)) {
      this.observers.set(url, new Set());
    }
    
    this.observers.get(url)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const observers = this.observers.get(url);
      if (observers) {
        observers.delete(callback);
        if (observers.size === 0) {
          this.observers.delete(url);
        }
      }
    };
  }

  // Notify observers of status changes
  private notifyObservers(url: string, status: ImageHealthStatus): void {
    const observers = this.observers.get(url);
    if (observers) {
      observers.forEach(callback => {
        try {
          callback({ ...status }); // Send a copy to prevent mutation
        } catch (error) {
          console.error('Error in image health observer:', error);
        }
      });
    }
  }

  // Get health status for a specific image
  getImageHealth(url: string): ImageHealthStatus | null {
    const status = this.healthMap.get(url);
    return status ? { ...status } : null;
  }

  // Get overall health statistics
  getHealthStats(): {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    failed: number;
    healingQueue: number;
  } {
    const stats = {
      total: this.healthMap.size,
      healthy: 0,
      warning: 0,
      critical: 0,
      failed: 0,
      healingQueue: this.healingQueue.size
    };
    
    for (const status of this.healthMap.values()) {
      stats[status.status]++;
    }
    
    return stats;
  }

  // Force immediate health check for all images
  forceHealthCheck(): void {
    console.log('🔄 Forcing immediate health check');
    this.performHealthCheck();
  }

  // Emergency heal all failed images
  emergencyHealAll(): void {
    console.log('🚨 Emergency healing all failed images');
    
    for (const [url, status] of this.healthMap) {
      if (status.status === 'critical' || status.status === 'failed') {
        this.scheduleHealing(url);
      }
    }
  }
}

// Global health monitor instance
export const imageHealthMonitor = new ImageHealthMonitor();

// Utility functions
export function registerImageForMonitoring(
  url: string, 
  metadata?: { title?: string; category?: string; postId?: string }
): void {
  imageHealthMonitor.registerImage(url, metadata);
}

export function getImageHealthStatus(url: string): ImageHealthStatus | null {
  return imageHealthMonitor.getImageHealth(url);
}

export function subscribeToImageHealth(
  url: string, 
  callback: (status: ImageHealthStatus) => void
): () => void {
  return imageHealthMonitor.subscribeToImage(url, callback);
}

// Initialize on first import
if (typeof window !== 'undefined') {
  console.log('🏥 Image Health Monitor System Initialized');
  
  // Add global emergency controls for debugging
  (window as any).imageHealthMonitor = {
    getStats: () => imageHealthMonitor.getHealthStats(),
    forceCheck: () => imageHealthMonitor.forceHealthCheck(),
    emergencyHeal: () => imageHealthMonitor.emergencyHealAll(),
    getHealth: (url: string) => imageHealthMonitor.getImageHealth(url)
  };
}