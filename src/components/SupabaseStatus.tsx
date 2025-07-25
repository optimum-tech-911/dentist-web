import { useState, useEffect } from 'react';
import { checkSupabaseHealth } from '@/lib/supabase-connection';

interface SupabaseStatusProps {
  showDetails?: boolean;
}

export function SupabaseStatus({ showDetails = false }: SupabaseStatusProps) {
  const [status, setStatus] = useState<{
    isHealthy: boolean;
    status: any;
    canConnect: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const health = await checkSupabaseHealth();
      setStatus(health);
    } catch (error) {
      console.error('Error checking Supabase status:', error);
      setStatus({
        isHealthy: false,
        status: { error: error.message },
        canConnect: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Check status every 30 seconds in development
    if (import.meta.env.DEV) {
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  if (!status) {
    return (
      <div className="text-sm text-muted-foreground">
        Checking Supabase connection...
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <div 
          className={`w-2 h-2 rounded-full ${
            status.isHealthy ? 'bg-green-500' : 'bg-red-500'
          }`} 
        />
        <span className={status.isHealthy ? 'text-green-600' : 'text-red-600'}>
          Supabase: {status.isHealthy ? 'Connected' : 'Disconnected'}
        </span>
        {loading && <span className="text-muted-foreground">(checking...)</span>}
      </div>
      
      {showDetails && import.meta.env.DEV && (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer text-muted-foreground">
            Connection Details
          </summary>
          <div className="mt-1 p-2 bg-muted rounded text-muted-foreground">
            <div>Can Connect: {status.canConnect ? 'Yes' : 'No'}</div>
            <div>Last Check: {status.status.lastCheck?.toLocaleTimeString()}</div>
            <div>Success Count: {status.status.successCount}</div>
            <div>Error Count: {status.status.errorCount}</div>
          </div>
        </details>
      )}
    </div>
  );
} 