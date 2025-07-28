import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAdminAccess, hasAdminRole } from '@/utils/adminAccess';

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



  // PERMANENT: Robust admin access check
  if (user && requiredRole) {
    // Check if user has admin role from database
    if (hasAdminRole(userRole)) {
      return <>{children}</>;
    }
    
    // Check if user email is in admin list
    if (checkAdminAccess(user?.email)) {
      return <>{children}</>;
    }
    
    // If user is authenticated but not admin, redirect
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}