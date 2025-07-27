import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export function AuthTest() {
  const { signIn, loading, error, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestSignIn = async () => {
    setTestResult(null);
    console.log('🧪 Testing sign in with:', email);
    
    try {
      const result = await signIn(email, password);
      setTestResult({
        success: !result.error,
        error: result.error?.message,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setTestResult({
        success: false,
        error: err?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  };

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      return { success: !error, error: error?.message };
    } catch (err) {
      return { success: false, error: err?.message };
    }
  };

  const handleTestConnection = async () => {
    const result = await testSupabaseConnection();
    setTestResult({
      type: 'connection',
      ...result,
      timestamp: new Date().toISOString()
    });
  };

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <Card className="mb-6 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="h-5 w-5" />
          Authentication Test (Dev Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleTestSignIn} 
            disabled={loading || !email || !password}
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Test Sign In
          </Button>
          <Button 
            onClick={handleTestConnection} 
            size="sm" 
            variant="outline"
          >
            Test Connection
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <strong>Auth Error:</strong> {error}
            </div>
          </div>
        )}

        {user && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <strong>Authenticated:</strong> {user.email}
            </div>
          </div>
        )}

        {testResult && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <strong>Test Result:</strong>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="text-sm space-y-1">
              <div><strong>Success:</strong> {testResult.success ? 'Yes' : 'No'}</div>
              {testResult.error && <div><strong>Error:</strong> {testResult.error}</div>}
              <div><strong>Timestamp:</strong> {testResult.timestamp}</div>
            </div>
          </div>
        )}

        <details className="bg-white p-3 rounded border">
          <summary className="font-semibold cursor-pointer">Debug Info</summary>
          <pre className="text-xs mt-2 overflow-x-auto">
            {JSON.stringify({
              loading,
              error,
              user: user ? { email: user.email, id: user.id } : null,
              testResult
            }, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}