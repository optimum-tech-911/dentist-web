import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { runWebsiteTests } from '@/lib/website-test';
import { SupabaseStatus } from '@/components/SupabaseStatus';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      const testResults = await runWebsiteTests();
      setResults(testResults);
      setLastRun(new Date());
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'bg-green-100 text-green-800';
      case 'FAIL': return 'bg-red-100 text-red-800';
      case 'SKIP': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'SKIP': return '⏭️';
      default: return '❓';
    }
  };

  const passedCount = results.filter(r => r.status === 'PASS').length;
  const failedCount = results.filter(r => r.status === 'FAIL').length;
  const totalCount = results.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">🧪 Website Functionality Tests</h1>
          <p className="text-muted-foreground mb-6">
            Comprehensive testing tool to verify all website functions are working properly
          </p>
          
          <div className="flex justify-center gap-4 mb-6">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? '🔄 Running Tests...' : '🚀 Run All Tests'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.open('http://localhost:8080', '_blank')}
            >
              🌐 Open Website
            </Button>
          </div>

          {lastRun && (
            <p className="text-sm text-muted-foreground">
              Last run: {lastRun.toLocaleString()}
            </p>
          )}
        </div>

        {/* Live Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Live Status
            </CardTitle>
            <CardDescription>
              Real-time connection status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SupabaseStatus showDetails={true} />
          </CardContent>
        </Card>

        {/* Test Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                📋 Test Results
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    ✅ {passedCount} Passed
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    ❌ {failedCount} Failed
                  </Badge>
                  <Badge variant="outline">
                    📊 {totalCount} Total
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>
                Detailed results of all functionality tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        {getStatusIcon(result.status)} {result.name}
                      </h3>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.message}
                    </p>
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📖 How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>1. Browser Console Testing:</strong>
                <p className="text-muted-foreground ml-4">
                  Open browser console (F12) and run: <code>runWebsiteTests()</code>
                </p>
              </div>
              <div>
                <strong>2. Manual Testing:</strong>
                <p className="text-muted-foreground ml-4">
                  Click "Run All Tests" button above to execute tests in the UI
                </p>
              </div>
              <div>
                <strong>3. Individual Tests:</strong>
                <p className="text-muted-foreground ml-4">
                  Use <code>testSupabaseConnection()</code> for specific tests
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 