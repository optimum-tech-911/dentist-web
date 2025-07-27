import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function RoleTest() {
  const { user, userRole, loading, refreshUserRole } = useAuth();

  const testAdminAccess = () => {
    const allowedRoles = ['admin', 'doctor'];
    const hasAccess = userRole && allowedRoles.includes(userRole);
    
    return {
      hasAccess,
      allowedRoles,
      currentRole: userRole,
      isAuthenticated: !!user
    };
  };

  const result = testAdminAccess();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Role Access Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Authentication Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Authentication</h3>
              <div className="flex items-center gap-2">
                {result.isAuthenticated ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>{result.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</span>
              </div>
              {user && (
                <div className="text-sm text-muted-foreground">
                  Email: {user.email}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Role Status</h3>
              <div className="flex items-center gap-2">
                {userRole ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>{userRole || 'No Role'}</span>
              </div>
              {loading && (
                <div className="text-sm text-muted-foreground">
                  Loading role...
                </div>
              )}
            </div>
          </div>

          {/* Admin Access Test */}
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">Admin Access Test</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {result.hasAccess ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>Can access admin dashboard: {result.hasAccess ? 'YES' : 'NO'}</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Allowed roles: {result.allowedRoles.join(', ')}
              </div>
              
              <div className="text-sm text-muted-foreground">
                Your role: {result.currentRole || 'None'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={refreshUserRole}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Role
            </Button>
            
            <Button variant="outline" asChild>
              <a href="/admin" target="_blank">
                Test Admin Access
              </a>
            </Button>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-50 p-4 rounded text-sm">
            <h4 className="font-semibold mb-2">Debug Information</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({
                user: user?.email,
                userId: user?.id,
                userRole,
                loading,
                hasAccess: result.hasAccess,
                allowedRoles: result.allowedRoles
              }, null, 2)}
            </pre>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}