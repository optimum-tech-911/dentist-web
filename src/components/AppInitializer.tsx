import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Test basic functionality
        console.log('🚀 Initializing app...');
        
        // Test if we can create basic React elements
        if (!React.createElement) {
          throw new Error('React not properly loaded');
        }

        // Test if Supabase client is available
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        // Test basic Supabase connection (non-blocking)
        try {
          await supabase.from('posts').select('count').limit(1);
          console.log('✅ Supabase connection test passed');
        } catch (supabaseError) {
          console.warn('⚠️ Supabase connection issue (non-blocking):', supabaseError);
          // Don't fail initialization for Supabase issues
        }

        console.log('✅ App initialization complete');
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to avoid flash
    const timer = setTimeout(initializeApp, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <div className="mb-6">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Initialization Failed
          </h1>
          <p className="text-muted-foreground mb-6">
            The application failed to initialize properly.
          </p>
          <p className="text-sm text-red-600 mb-6 bg-red-50 p-3 rounded">
            Error: {initError}
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.href = '/diagnostic'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Diagnostics
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Application Error
          </h1>
          <p className="text-muted-foreground mb-6">
            Something went wrong during initialization.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppInitializer;