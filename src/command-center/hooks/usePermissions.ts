import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';

type Permission =
  | 'customers:read' | 'customers:write' | 'customers:delete'
  | 'content:read' | 'content:write' | 'content:publish'
  | 'campaigns:read' | 'campaigns:write' | 'campaigns:send'
  | 'services:read' | 'services:write'
  | 'billing:read' | 'billing:manage'
  | 'team:read' | 'team:manage'
  | 'settings:read' | 'settings:write';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const can = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'owner') return true;
    return (user.permissions ?? []).includes(permission);
  }, [user]);

  const canAny = useCallback((permissions: Permission[]): boolean => {
    return permissions.some((p) => can(p));
  }, [can]);

  const canAll = useCallback((permissions: Permission[]): boolean => {
    return permissions.every((p) => can(p));
  }, [can]);

  const permissions = useMemo(() => ({
    canViewCustomers: can('customers:read'),
    canEditCustomers: can('customers:write'),
    canDeleteCustomers: can('customers:delete'),
    canViewContent: can('content:read'),
    canEditContent: can('content:write'),
    canPublishContent: can('content:publish'),
    canViewCampaigns: can('campaigns:read'),
    canEditCampaigns: can('campaigns:write'),
    canSendCampaigns: can('campaigns:send'),
    canViewServices: can('services:read'),
    canEditServices: can('services:write'),
    canViewBilling: can('billing:read'),
    canManageBilling: can('billing:manage'),
    canViewTeam: can('team:read'),
    canManageTeam: can('team:manage'),
    canViewSettings: can('settings:read'),
    canEditSettings: can('settings:write'),
  }), [can]);

  return {
    can,
    canAny,
    canAll,
    hasFeature: (_feature: string) => false,
    ...permissions,
  };
}
