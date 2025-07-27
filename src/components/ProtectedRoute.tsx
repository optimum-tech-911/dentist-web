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
    roleChecked,
    userId: user?.id,
    isAuthenticated: !!user
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

  // Check role-based access
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    console.log('🔍 Checking role access:', { userRole, allowedRoles, userEmail: user?.email });
    
    // If user has no role but is authenticated, try to refresh role
    if (!userRole && user) {
      console.log('⚠️ No role found but user exists - trying refresh...');
      // Don't allow access without proper role verification
      return <Navigate to="/" replace />;
    }
    
    // Check if user has required role
    if (userRole && !allowedRoles.includes(userRole)) {
      console.log('❌ Role not allowed - redirecting to home');
      return <Navigate to="/" replace />;
    }
    
    // If no role is set but user is authenticated, deny access
    if (!userRole) {
      console.log('❌ No role assigned - redirecting to home');
      return <Navigate to="/" replace />;
    }
  }

  console.log('✅ Access granted');
  return <>{children}</>;
}