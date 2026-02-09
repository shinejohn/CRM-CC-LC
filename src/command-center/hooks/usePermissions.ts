import { useCallback, useMemo } from 'react';
import { useAuth } from '../core/AuthContext';

type Permission = 
  | 'customers:read' | 'customers:write' | 'customers:delete'
  | 'content:read' | 'content:write' | 'content:publish'
  | 'campaigns:read' | 'campaigns:write' | 'campaigns:send'
  | 'services:read' | 'services:write'
  | 'billing:read' | 'billing:manage'
  | 'team:read' | 'team:manage'
  | 'settings:read' | 'settings:write';

export function usePermissions() {
  const { user, hasPermission, hasFeature } = useAuth();

  const can = useCallback((permission: Permission): boolean => {
    return hasPermission(permission);
  }, [hasPermission]);

  const canAny = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  }, [hasPermission]);

  const canAll = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  }, [hasPermission]);

  const permissions = useMemo(() => ({
    // Customer permissions
    canViewCustomers: can('customers:read'),
    canEditCustomers: can('customers:write'),
    canDeleteCustomers: can('customers:delete'),
    
    // Content permissions
    canViewContent: can('content:read'),
    canEditContent: can('content:write'),
    canPublishContent: can('content:publish'),
    
    // Campaign permissions
    canViewCampaigns: can('campaigns:read'),
    canEditCampaigns: can('campaigns:write'),
    canSendCampaigns: can('campaigns:send'),
    
    // Service permissions
    canViewServices: can('services:read'),
    canEditServices: can('services:write'),
    
    // Billing permissions
    canViewBilling: can('billing:read'),
    canManageBilling: can('billing:manage'),
    
    // Team permissions
    canViewTeam: can('team:read'),
    canManageTeam: can('team:manage'),
    
    // Settings permissions
    canViewSettings: can('settings:read'),
    canEditSettings: can('settings:write'),
  }), [can]);

  return {
    can,
    canAny,
    canAll,
    hasFeature,
    ...permissions,
  };
}

