import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseHealth } from '@/lib/supabase-connection';

const DiagnosticPage = () => {
  const [diagnostics, setDiagnostics] = useState({
    timestamp: new Date().toISOString(),
    environment: 'unknown',
    supabaseStatus: 'checking...',
    supabaseHealth: null,
    routerStatus: 'loaded',
    errors: []
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      const errors = [];
      
      try {
        // Check environment
        const isDev = import.meta.env.DEV;
        const environment = isDev ? 'development' : 'production';
        
        // Check Supabase connection
        let supabaseStatus = 'unknown';
        let supabaseHealth = null;
        
        try {
          const health = await checkSupabaseHealth();
          supabaseHealth = health;
          supabaseStatus = health.canConnect ? 'connected' : 'failed';
        } catch (error) {
          supabaseStatus = 'error';
          errors.push(`Supabase: ${error.message}`);
        }

        // Test a simple Supabase query
        try {
          const { data, error } = await supabase.from('posts').select('count').limit(1);
          if (error) {
            errors.push(`Supabase query error: ${error.message}`);
          }
        } catch (error) {
          errors.push(`Supabase query exception: ${error.message}`);
        }

        setDiagnostics({
          timestamp: new Date().toISOString(),
          environment,
          supabaseStatus,
          supabaseHealth,
          routerStatus: 'working',
          errors
        });
      } catch (error) {
        setDiagnostics(prev => ({
          ...prev,
          errors: [...prev.errors, `Diagnostic error: ${error.message}`]
        }));
      }
    };

    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔍 Deployment Diagnostics
          </h1>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  Environment Status
                </h2>
                <p><strong>Environment:</strong> {diagnostics.environment}</p>
                <p><strong>Timestamp:</strong> {diagnostics.timestamp}</p>
                <p><strong>Router:</strong> {diagnostics.routerStatus}</p>
              </div>

              <div className={`p-4 rounded-lg ${
                diagnostics.supabaseStatus === 'connected' ? 'bg-green-50' : 
                diagnostics.supabaseStatus === 'checking...' ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <h2 className="text-lg font-semibold mb-2">
                  Supabase Connection
                </h2>
                <p><strong>Status:</strong> {diagnostics.supabaseStatus}</p>
                {diagnostics.supabaseHealth && (
                  <div className="mt-2 text-sm">
                    <p><strong>Healthy:</strong> {diagnostics.supabaseHealth.isHealthy ? 'Yes' : 'No'}</p>
                    <p><strong>Can Connect:</strong> {diagnostics.supabaseHealth.canConnect ? 'Yes' : 'No'}</p>
                    <p><strong>Success Count:</strong> {diagnostics.supabaseHealth.status.successCount}</p>
                    <p><strong>Error Count:</strong> {diagnostics.supabaseHealth.status.errorCount}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {diagnostics.errors.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-red-900 mb-2">
                    ⚠️ Issues Found
                  </h2>
                  <ul className="space-y-1">
                    {diagnostics.errors.map((error, index) => (
                      <li key={index} className="text-red-800 text-sm">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  📋 Configuration Info
                </h2>
                <div className="text-sm space-y-1">
                  <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                  <p><strong>URL:</strong> {window.location.href}</p>
                  <p><strong>Referrer:</strong> {document.referrer || 'Direct'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              🚀 Quick Fixes
            </h2>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• If Supabase connection fails, check your database accessibility</li>
              <li>• Verify your hosting platform has the correct redirects for SPA routing</li>
              <li>• Check browser console (F12) for additional error messages</li>
              <li>• Try accessing /diagnostic directly if the main page is white</li>
            </ul>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Refresh Diagnostics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;