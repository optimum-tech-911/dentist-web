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
        await refreshUserRole();
      }
      setRoleChecked(true);
    };
    
    checkRole();
  }, [user, userRole, loading, refreshUserRole]);



  // Show minimal loading only if absolutely necessary
  if (loading) {
    return null; // Show nothing while loading for instant feel
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }



  // Check role-based access
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Check if user has required role
    if (userRole && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
    
    // If no role is set but user is authenticated, deny access
    if (!userRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}