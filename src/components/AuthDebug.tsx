import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function AuthDebug() {
  const { user, userRole, loading, session, error, refreshUserRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [supabaseTest, setSupabaseTest] = useState<string>('Testing...');

  useEffect(() => {
    const testSupabase = async () => {
      try {
        // Test basic connection
        const { data, error } = await supabase.from('posts').select('id').limit(1);
        if (error) {
          setSupabaseTest(`❌ Connection Error: ${error.message}`);
        } else {
          setSupabaseTest('✅ Connected to Supabase');
        }

        // Test current session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('🔍 Raw Supabase session:', sessionData);
        
        // Test auth state
        const { data: authData } = await supabase.auth.getUser();
        console.log('🔍 Raw Supabase user:', authData);
        
      } catch (err) {
        setSupabaseTest(`💥 Test Failed: ${err}`);
      }
    };
    
    testSupabase();
  }, []);

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>🔍 Authentication Debug Info</CardTitle>
        <CardDescription>Current authentication state</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Loading:</strong> {loading ? '🔄 Yes' : '✅ No'}
          </div>
          <div>
            <strong>User:</strong> {user ? `✅ ${user.email}` : '❌ None'}
          </div>
          <div>
            <strong>User ID:</strong> {user?.id || '❌ None'}
          </div>
          <div>
            <strong>Role:</strong> {userRole ? `✅ ${userRole}` : '❌ None'}
          </div>
          <div>
            <strong>Session:</strong> {session ? '✅ Exists' : '❌ None'}
          </div>
          <div>
            <strong>Error:</strong> {error ? `❌ ${error}` : '✅ None'}
          </div>
          <div className="col-span-2">
            <strong>Supabase:</strong> {supabaseTest}
          </div>
        </div>
        
        {user && (
          <div className="mt-4">
            <strong>User Details:</strong>
            <pre className="bg-gray-100 p-2 rounded text-sm mt-1 overflow-auto">
              {JSON.stringify({
                id: user.id,
                email: user.email,
                email_confirmed_at: user.email_confirmed_at,
                created_at: user.created_at
              }, null, 2)}
            </pre>
          </div>
        )}
        
        {session && (
          <div className="mt-4">
            <strong>Session Info:</strong>
            <pre className="bg-gray-100 p-2 rounded text-sm mt-1 overflow-auto">
              {JSON.stringify({
                access_token: session.access_token ? 'EXISTS' : 'MISSING',
                expires_at: session.expires_at,
                expires_in: session.expires_in,
                token_type: session.token_type
              }, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <strong>🎯 Quick Actions:</strong>
          <div className="flex gap-2 mt-2">
            <Button 
              onClick={async () => {
                setRefreshing(true);
                await refreshUserRole();
                setRefreshing(false);
              }}
              disabled={refreshing || !user}
              size="sm"
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Role'}
            </Button>
                         <Button 
               onClick={() => window.location.href = '/admin'}
               variant="outline"
               size="sm"
             >
               🚪 Try Admin Dashboard
             </Button>
             <Button 
               onClick={() => window.location.href = '/auth'}
               variant="secondary"
               size="sm"
             >
               🔐 Go to Sign In
             </Button>
             {user && (
               <Button 
                 onClick={async () => {
                   // Force set admin role in database
                   const { error } = await supabase
                     .from('users')
                     .upsert({ 
                       id: user.id, 
                       email: user.email, 
                       role: 'admin' 
                     });
                   
                   if (error) {
                     alert(`Error: ${error.message}`);
                   } else {
                     alert('Admin role set! Refreshing...');
                     await refreshUserRole();
                   }
                 }}
                 variant="destructive"
                 size="sm"
               >
                 👑 Force Admin Role
               </Button>
             )}
          </div>
          <p className="text-sm mt-2">
            If you see "User: ✅" but "Role: ❌ None", click "Refresh Role".
            <br />
            If you see "User: ❌ None", you need to sign in first.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}