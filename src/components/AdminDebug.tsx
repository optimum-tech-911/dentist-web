import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle, User, Shield } from 'lucide-react';

export function AdminDebug() {
  const { user, userRole, loading, refreshUserRole } = useAuth();

  const debugInfo = {
    isAuthenticated: !!user,
    userEmail: user?.email,
    userId: user?.id,
    userRole,
    loading,
    hasAdminRole: userRole === 'admin',
    hasRequiredRole: userRole === 'admin' || userRole === 'doctor' || userRole === 'author',
  };

  const handleRefreshRole = async () => {
    console.log('🔄 Manually refreshing user role...');
    await refreshUserRole();
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          Admin Access Debug (Dev Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Authentication Status:</strong>
            <div className="flex items-center gap-2 mt-1">
              {debugInfo.isAuthenticated ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              {debugInfo.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </div>
          </div>
          
          <div>
            <strong>User Role:</strong>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="h-4 w-4 text-blue-600" />
              {debugInfo.userRole || 'No Role'}
            </div>
          </div>
          
          <div>
            <strong>Loading State:</strong>
            <div className="flex items-center gap-2 mt-1">
              {debugInfo.loading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              {debugInfo.loading ? 'Loading...' : 'Ready'}
            </div>
          </div>
          
          <div>
            <strong>Admin Access:</strong>
            <div className="flex items-center gap-2 mt-1">
              {debugInfo.hasAdminRole ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              {debugInfo.hasAdminRole ? 'Granted' : 'Denied'}
            </div>
          </div>
        </div>
        
        <div className="text-xs bg-white p-3 rounded border">
          <strong>Debug Info:</strong>
          <pre className="mt-2 text-xs overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleRefreshRole} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Role
          </Button>
          <Button 
            onClick={() => console.log('Current auth state:', debugInfo)} 
            size="sm" 
            variant="outline"
          >
            Log to Console
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}