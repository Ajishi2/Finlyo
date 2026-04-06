import { useAuth } from '../context/AuthContext';

export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface RolePermissions {
  canViewDashboard: boolean;
  canViewAnalytics: boolean;
  canViewRecords: boolean;
  canCreateRecords: boolean;
  canEditOwnRecords: boolean;
  canEditAnyRecords: boolean;
  canDeleteRecords: boolean;
  canViewUsers: boolean;
  canManageUsers: boolean;
}

export function useRolePermissions(): RolePermissions {
  const { user } = useAuth();
  const role = user?.role as UserRole;

  const permissions = {
    VIEWER: {
      canViewDashboard: true,
      canViewAnalytics: true,
      canViewRecords: true,
      canCreateRecords: false,
      canEditOwnRecords: false,
      canEditAnyRecords: false,
      canDeleteRecords: false,
      canViewUsers: false,
      canManageUsers: false,
    },
    ANALYST: {
      canViewDashboard: true,
      canViewAnalytics: true,
      canViewRecords: true,
      canCreateRecords: true,
      canEditOwnRecords: true,
      canEditAnyRecords: false,
      canDeleteRecords: false,
      canViewUsers: false,
      canManageUsers: false,
    },
    ADMIN: {
      canViewDashboard: true,
      canViewAnalytics: true,
      canViewRecords: true,
      canCreateRecords: true,
      canEditOwnRecords: true,
      canEditAnyRecords: true,
      canDeleteRecords: true,
      canViewUsers: true,
      canManageUsers: true,
    },
  };

  return permissions[role] || permissions.VIEWER;
}

export function useCanCreateRecord(): boolean {
  return useRolePermissions().canCreateRecords;
}

export function useCanEditRecord(recordUserId?: number): boolean {
  const { user } = useAuth();
  const permissions = useRolePermissions();
  
  if (permissions.canEditAnyRecords) return true;
  if (permissions.canEditOwnRecords && user?.id === recordUserId) return true;
  return false;
}

export function useCanDeleteRecord(): boolean {
  return useRolePermissions().canDeleteRecords;
}

export function useCanManageUsers(): boolean {
  return useRolePermissions().canManageUsers;
}

export function useCanViewUsers(): boolean {
  return useRolePermissions().canViewUsers;
}
