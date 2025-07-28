import { useAuth } from '@/hooks/useAuth';
import { checkAdminAccess, hasAdminRole } from '@/utils/adminAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Shield } from 'lucide-react';

export default function AdminDebug() {
  const { user, userRole, loading } = useAuth();
  
  const isAdminByRole = hasAdminRole(userRole);
  const isAdminByEmail = checkAdminAccess(user?.email);
  const hasAccess = isAdminByRole || isAdminByEmail;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-white/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admin Access Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span>User:</span>
            <Badge variant={user ? "default" : "secondary"}>
              {user ? user.email : "Not logged in"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Role:</span>
            <Badge variant={userRole ? "default" : "secondary"}>
              {userRole || "None"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Admin by Role:</span>
            <Badge variant={isAdminByRole ? "default" : "destructive"}>
              {isAdminByRole ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Admin by Email:</span>
            <Badge variant={isAdminByEmail ? "default" : "destructive"}>
              {isAdminByEmail ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Has Access:</span>
            <Badge variant={hasAccess ? "default" : "destructive"}>
              {hasAccess ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            </Badge>
          </div>
          
          {!hasAccess && user && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              Add your email to admin list at /admin-access
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}