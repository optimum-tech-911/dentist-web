import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Home } from 'lucide-react';

export default function TestAccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Admin Access Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-green-600 font-semibold mb-4">
              ✅ Admin Dashboard is Accessible!
            </p>
            <p className="text-muted-foreground mb-6">
              If you can see this page, the admin dashboard is working correctly.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/admin">
                Go to Admin Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> All admin protection has been temporarily removed for testing.
              You should now be able to access all admin features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}