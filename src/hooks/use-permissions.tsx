'use client';

import { useUser } from '@clerk/nextjs';
import { SecurityConfig, getUserRole, hasPermission, UserRole, Permissions } from '@/lib/security-config';

export function usePermissions() {
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const userRole = getUserRole(userEmail);
  
  return {
    userRole,
    isOwner: userRole === UserRole.OWNER,
    isAdmin: userRole === UserRole.ADMIN || userRole === UserRole.OWNER,
    isAuthenticated: !!user,
    
    // Permission checks
    canAccessDevTools: hasPermission(userRole, Permissions.ACCESS_DEV_TOOLS),
    canAccessAdminPanel: hasPermission(userRole, Permissions.ACCESS_ADMIN_PANEL),
    canAccessControlCenter: hasPermission(userRole, Permissions.ACCESS_CONTROL_CENTER),
    canManageDatabase: hasPermission(userRole, Permissions.MANAGE_DATABASE),
    canManageUsers: hasPermission(userRole, Permissions.MANAGE_USERS),
    canViewAnalytics: hasPermission(userRole, Permissions.VIEW_ANALYTICS),
    canUseAdvancedDesign: hasPermission(userRole, Permissions.USE_ADVANCED_DESIGN),
    
    // Helper function for custom permission checks
    hasPermission: (permission: UserRole[]) => hasPermission(userRole, permission),
  };
}

// Component wrapper for permission-based rendering
export function ProtectedComponent({ 
  children, 
  permission,
  fallback = null 
}: { 
  children: React.ReactNode;
  permission: UserRole[];
  fallback?: React.ReactNode;
}) {
  const { userRole } = usePermissions();
  
  if (hasPermission(userRole, permission)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}