// Simple admin access check that works without database dependencies
export const checkAdminAccess = (userEmail: string | undefined): boolean => {
  if (!userEmail) return false;
  
  // Get admin emails from localStorage
  try {
    const stored = localStorage.getItem('ufsbd_admin_emails');
    const adminEmails = stored ? JSON.parse(stored) : [
      'admin@ufsbd34.fr',
      'doctor@ufsbd34.fr',
      'amelie.cherbonneau@example.com',
      'abdessamed.abdessadok@example.com',
      'helene.sabatier@example.com',
      'alexandre.yeche@example.com',
      'pascal.rouzeyre@example.com',
      'vincent.tiers@example.com',
    ];
    
    // Check if email is in admin list
    return adminEmails.includes(userEmail.toLowerCase());
  } catch {
    return false;
  }
};

// Check if user has any admin-like role
export const hasAdminRole = (userRole: string | null): boolean => {
  if (!userRole) return false;
  
  const adminRoles = ['admin', 'doctor', 'president', 'secretaire', 'tresorier'];
  return adminRoles.includes(userRole.toLowerCase());
};