import { supabase } from '@/integrations/supabase/client';

interface ConnectionStatus {
  isConnected: boolean;
  lastCheck: Date;
  errorCount: number;
  successCount: number;
}

class SupabaseConnectionManager {
  private static instance: SupabaseConnectionManager;
  private status: ConnectionStatus = {
    isConnected: false,
    lastCheck: new Date(),
    errorCount: 0,
    successCount: 0
  };
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  private constructor() {}

  static getInstance(): SupabaseConnectionManager {
    if (!SupabaseConnectionManager.instance) {
      SupabaseConnectionManager.instance = new SupabaseConnectionManager();
    }
    return SupabaseConnectionManager.instance;
  }

  /**
   * Test the Supabase connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('posts').select('id').limit(1);
      
      if (error) {
        this.status.isConnected = false;
        this.status.errorCount++;
        if (import.meta.env.DEV) {
          console.warn('❌ Supabase connection test failed:', error);
        }
        return false;
      }

      this.status.isConnected = true;
      this.status.successCount++;
      this.status.lastCheck = new Date();
      
      if (import.meta.env.DEV) {
        console.log(`✅ Supabase connection test successful (${this.status.successCount} successful, ${this.status.errorCount} failed)`);
      }
      
      return true;
    } catch (error) {
      this.status.isConnected = false;
      this.status.errorCount++;
      if (import.meta.env.DEV) {
        console.error('❌ Supabase connection test error:', error);
      }
      return false;
    }
  }

  /**
   * Start the keep-alive mechanism
   */
  startKeepAlive(intervalMinutes: number = 5): void {
    if (this.isActive) {
      if (import.meta.env.DEV) {
        console.log('🔄 Supabase keep-alive already active');
      }
      return;
    }

    this.isActive = true;
    
    // Test connection immediately
    this.testConnection();
    
    // Set up periodic keep-alive
    this.keepAliveInterval = setInterval(() => {
      if (!this.isActive) return;
      this.testConnection();
    }, intervalMinutes * 60 * 1000);

    if (import.meta.env.DEV) {
      console.log(`🚀 Supabase keep-alive started (every ${intervalMinutes} minutes)`);
    }
  }

  /**
   * Stop the keep-alive mechanism
   */
  stopKeepAlive(): void {
    this.isActive = false;
    
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    if (import.meta.env.DEV) {
      console.log('🛑 Supabase keep-alive stopped');
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  /**
   * Check if connection is healthy
   */
  isHealthy(): boolean {
    const timeSinceLastCheck = Date.now() - this.status.lastCheck.getTime();
    const maxTimeWithoutCheck = 10 * 60 * 1000; // 10 minutes
    
    return this.status.isConnected && timeSinceLastCheck < maxTimeWithoutCheck;
  }

  /**
   * Force a connection test
   */
  async forceTest(): Promise<boolean> {
    return await this.testConnection();
  }
}

// Export singleton instance
export const supabaseConnection = SupabaseConnectionManager.getInstance();

// React hook for using the connection manager
export function useSupabaseKeepAlive(intervalMinutes: number = 5) {
  const { useEffect } = require('react');
  
  useEffect(() => {
    supabaseConnection.startKeepAlive(intervalMinutes);
    
    return () => {
      supabaseConnection.stopKeepAlive();
    };
  }, [intervalMinutes]);
}

// Utility function to check connection health
export async function checkSupabaseHealth(): Promise<{
  isHealthy: boolean;
  status: ConnectionStatus;
  canConnect: boolean;
}> {
  const status = supabaseConnection.getStatus();
  const canConnect = await supabaseConnection.forceTest();
  
  return {
    isHealthy: supabaseConnection.isHealthy(),
    status,
    canConnect
  };
} 