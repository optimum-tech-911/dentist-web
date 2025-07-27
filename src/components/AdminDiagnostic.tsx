import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, RefreshCw, Database, Shield, User } from 'lucide-react';

export function AdminDiagnostic() {
  const { user, userRole, loading, refreshUserRole } = useAuth();
  const [diagnosticResults, setDiagnosticResults] = useState<any>({});
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);

  const runDiagnostic = async () => {
    setRunningDiagnostic(true);
    const results: any = {};

    try {
      // Test 1: Authentication Status
      results.auth = {
        isAuthenticated: !!user,
        userEmail: user?.email,
        userId: user?.id,
        loading
      };

      // Test 2: Role Status
      results.role = {
        userRole,
        hasAdminRole: userRole === 'admin',
        roleFetched: !!userRole
      };

      // Test 3: Database Connection
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, role')
          .eq('id', user?.id || '')
          .single();

        results.database = {
          connected: !error,
          userExists: !!data,
          dbRole: data?.role,
          error: error?.message
        };
      } catch (dbError) {
        results.database = {
          connected: false,
          error: dbError
        };
      }

      // Test 4: Protected Route Logic
      const allowedRoles = ['admin'];
      results.protectedRoute = {
        hasRequiredRole: userRole && allowedRoles.includes(userRole),
        wouldAllowAccess: userRole === 'admin',
        roleCheck: {
          userRole,
          allowedRoles,
          isAllowed: userRole === 'admin'
        }
      };

      // Test 5: Network Connectivity
      try {
        const response = await fetch('https://cmcfeiskfdbsefzqywbk.supabase.co/rest/v1/', {
          method: 'HEAD'
        });
        results.network = {
          supabaseReachable: response.ok,
          status: response.status
        };
      } catch (networkError) {
        results.network = {
          supabaseReachable: false,
          error: networkError
        };
      }

    } catch (error) {
      results.error = error;
    }

    setDiagnosticResults(results);
    setRunningDiagnostic(false);
  };

  useEffect(() => {
    runDiagnostic();
  }, [user, userRole, loading]);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusColor = (condition: boolean) => {
    return condition ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Shield className="h-5 w-5" />
          Admin Access Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Button onClick={runDiagnostic} disabled={runningDiagnostic} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${runningDiagnostic ? 'animate-spin' : ''}`} />
            Run Diagnostic
          </Button>
          <Button onClick={refreshUserRole} size="sm" variant="outline">
            <User className="h-4 w-4 mr-2" />
            Refresh Role
          </Button>
        </div>

        {Object.keys(diagnosticResults).length > 0 && (
          <div className="space-y-4">
            {/* Authentication Status */}
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Authentication Status
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnosticResults.auth?.isAuthenticated)}
                  <span className={getStatusColor(diagnosticResults.auth?.isAuthenticated)}>
                    Authenticated: {diagnosticResults.auth?.isAuthenticated ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(!diagnosticResults.auth?.loading)}
                  <span className={getStatusColor(!diagnosticResults.auth?.loading)}>
                    Loading: {diagnosticResults.auth?.loading ? 'Yes' : 'No'}
                  </span>
                </div>
                {diagnosticResults.auth?.userEmail && (
                  <div className="col-span-2 text-xs text-gray-600">
                    Email: {diagnosticResults.auth.userEmail}
                  </div>
                )}
              </div>
            </div>

            {/* Role Status */}
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role Status
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnosticResults.role?.hasAdminRole)}
                  <span className={getStatusColor(diagnosticResults.role?.hasAdminRole)}>
                    Admin Role: {diagnosticResults.role?.hasAdminRole ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnosticResults.role?.roleFetched)}
                  <span className={getStatusColor(diagnosticResults.role?.roleFetched)}>
                    Role Fetched: {diagnosticResults.role?.roleFetched ? 'Yes' : 'No'}
                  </span>
                </div>
                {diagnosticResults.role?.userRole && (
                  <div className="col-span-2 text-xs text-gray-600">
                    Current Role: {diagnosticResults.role.userRole}
                  </div>
                )}
              </div>
            </div>

            {/* Database Status */}
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database Status
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnosticResults.database?.connected)}
                  <span className={getStatusColor(diagnosticResults.database?.connected)}>
                    Connected: {diagnosticResults.database?.connected ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnosticResults.database?.userExists)}
                  <span className={getStatusColor(diagnosticResults.database?.userExists)}>
                    User in DB: {diagnosticResults.database?.userExists ? 'Yes' : 'No'}
                  </span>
                </div>
                {diagnosticResults.database?.dbRole && (
                  <div className="col-span-2 text-xs text-gray-600">
                    DB Role: {diagnosticResults.database.dbRole}
                  </div>
                )}
                {diagnosticResults.database?.error && (
                  <div className="col-span-2 text-xs text-red-600">
                    Error: {diagnosticResults.database.error}
                  </div>
                )}
              </div>
            </div>

            {/* Access Prediction */}
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold mb-2">Access Prediction</h4>
              <div className="flex items-center gap-2">
                {getStatusIcon(diagnosticResults.protectedRoute?.wouldAllowAccess)}
                <span className={getStatusColor(diagnosticResults.protectedRoute?.wouldAllowAccess)}>
                  Would Allow Access: {diagnosticResults.protectedRoute?.wouldAllowAccess ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <div className="text-sm space-y-1">
                {!diagnosticResults.auth?.isAuthenticated && (
                  <div className="text-red-600">• You need to log in first</div>
                )}
                {diagnosticResults.auth?.isAuthenticated && !diagnosticResults.role?.hasAdminRole && (
                  <div className="text-red-600">• Your role needs to be set to 'admin' in the database</div>
                )}
                {diagnosticResults.auth?.isAuthenticated && diagnosticResults.role?.hasAdminRole && !diagnosticResults.protectedRoute?.wouldAllowAccess && (
                  <div className="text-red-600">• There's a logic error in the ProtectedRoute component</div>
                )}
                {diagnosticResults.protectedRoute?.wouldAllowAccess && (
                  <div className="text-green-600">• All checks passed - you should have access</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Raw Debug Data */}
        {Object.keys(diagnosticResults).length > 0 && (
          <details className="bg-white p-3 rounded border">
            <summary className="font-semibold cursor-pointer">Raw Debug Data</summary>
            <pre className="text-xs mt-2 overflow-x-auto">
              {JSON.stringify(diagnosticResults, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}