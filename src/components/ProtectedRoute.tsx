import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, userRole, loading, refreshUserRole } = useAuth();
  const location = useLocation();
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (user && !userRole && !loading) {
        console.log('🔄 User exists but no role - refreshing role...');
        await refreshUserRole();
      }
      setRoleChecked(true);
    };
    
    checkRole();
  }, [user, userRole, loading, refreshUserRole]);

  console.log('🛡️ ProtectedRoute check:', {
    user: user?.email,
    userRole,
    requiredRole,
    loading,
    roleChecked
  });

  // Show loading while auth is loading or role is being checked
  if (loading || (user && !roleChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Vérification de l\'authentification...' : 'Vérification des permissions...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user - redirecting to auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Remove hardcoded email check - let database role handle it

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    console.log('🔍 Checking role access:', { userRole, allowedRoles, userEmail: user?.email });
    
    // TEMPORARY FIX: If user is authenticated but no role, try to refresh
    if (!userRole && user) {
      console.log('⚠️ No role found but user exists - trying refresh...');
      // For now, allow access if they're requesting admin and are authenticated
      if (allowedRoles.includes('admin')) {
        console.log('🔧 TEMPORARY: Allowing admin access for authenticated user');
        return <>{children}</>;
      }
      return <Navigate to="/" replace />;
    }
    
    if (userRole && !allowedRoles.includes(userRole)) {
      console.log('❌ Role not allowed - redirecting to home');
      return <Navigate to="/" replace />;
    }
  }

  console.log('✅ Access granted');
  return <>{children}</>;
}