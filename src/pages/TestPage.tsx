import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { testEmailFunction, testPasswordReset } from '@/lib/test-email';
import { testResendEmail, checkSupabaseConnection } from '@/lib/simple-email-test';

export default function TestPage() {
  const { user, signOut } = useAuth();
  const [testResult, setTestResult] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const runEmailTest = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const result = await testEmailFunction();
      setTestResult(result ? '✅ Email service is working!' : '❌ Email service failed');
    } catch (error) {
      setTestResult(`❌ Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testPasswordResetEmail = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const result = await testPasswordReset('test@example.com');
      setTestResult(result.success ? '✅ Password reset email sent!' : `❌ Failed: ${result.error}`);
    } catch (error) {
      setTestResult(`❌ Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testResendEmailFunction = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      // First check Supabase connection
      const connection = await checkSupabaseConnection();
      if (!connection.connected) {
        setTestResult(`❌ Supabase connection failed: ${connection.error}`);
        return;
      }
      
      // Test Resend email
      const result = await testResendEmail('ufsbd912@gmail.com');
      setTestResult(result.success ? `✅ ${result.details}` : `❌ ${result.details}: ${result.error}`);
    } catch (error) {
      setTestResult(`❌ Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Test Page</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Authentication Test</CardTitle>
              <CardDescription>Test if Resend email service is working</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={runEmailTest} 
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Testing...' : 'Test Email Service'}
                </Button>
                
                <Button 
                  onClick={testPasswordResetEmail} 
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Testing...' : 'Test Password Reset'}
                </Button>
                
                <Button 
                  onClick={testResendEmailFunction} 
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Testing...' : 'Test Resend Email'}
                </Button>
              </div>
              
              {testResult && (
                <div className={`p-4 rounded-md ${
                  testResult.includes('✅') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {testResult}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current User</CardTitle>
              <CardDescription>Authentication status</CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-2">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
                  <Button onClick={signOut} variant="destructive">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <p>No user signed in</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Info</CardTitle>
              <CardDescription>Current app configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Node Environment:</strong> {import.meta.env.MODE}</p>
                <p><strong>Base URL:</strong> {import.meta.env.BASE_URL}</p>
                <p><strong>Dev Mode:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}</p>
                <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                <p><strong>Language:</strong> {navigator.language}</p>
                <p><strong>Online:</strong> {navigator.onLine ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 