import { useAuthStore } from '@/stores/authStore';

export type Resource =
  | 'customers'
  | 'contacts'
  | 'deals'
  | 'invoices'
  | 'campaigns'
  | 'content'
  | 'services'
  | 'team'
  | 'billing'
  | 'ai-employees'
  | 'analytics'
  | 'settings'
  | 'integrations';

export type Action = 'view' | 'create' | 'edit' | 'delete' | 'manage';

export type Role = 'owner' | 'admin' | 'member' | 'viewer';

interface PermissionResult {
  allowed: boolean;
  reason?: 'upgrade_required' | 'role_restricted' | 'owner_only';
}

type PermissionSet = Set<Action>;

export const PERMISSION_MATRIX: Record<Resource, Record<Role, PermissionSet>> = {
  customers: {
    owner:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    admin:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    member:  new Set(['view', 'create']),
    viewer:  new Set(['view']),
  },
  contacts: {
    owner:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    admin:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    member:  new Set(['view', 'create']),
    viewer:  new Set(['view']),
  },
  deals: {
    owner:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    admin:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    member:  new Set(['view']),
    viewer:  new Set(['view']),
  },
  invoices: {
    owner:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    admin:   new Set(['view']),
    member:  new Set([]),
    viewer:  new Set([]),
  },
  campaigns: {
    owner:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    admin:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    member:  new Set(['view']),
    viewer:  new Set(['view']),
  },
  content: {
    owner:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    admin:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    member:  new Set(['view', 'create']),
    viewer:  new Set(['view']),
  },
  services: {
    owner:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    admin:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    member:  new Set(['view']),
    viewer:  new Set(['view']),
  },
  team: {
    owner:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    admin:   new Set(['view']),
    member:  new Set([]),
    viewer:  new Set([]),
  },
  billing: {
    owner:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    admin:   new Set(['view']),
    member:  new Set([]),
    viewer:  new Set([]),
  },
  'ai-employees': {
    owner:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    admin:   new Set(['view']),
    member:  new Set(['view']),
    viewer:  new Set(['view']),
  },
  analytics: {
    owner:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    admin:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    member:  new Set(['view']),
    viewer:  new Set(['view']),
  },
  settings: {
    owner:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    admin:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    member:  new Set(['view']),
    viewer:  new Set(['view']),
  },
  integrations: {
    owner:   new Set(['view', 'create', 'edit', 'delete', 'manage']),
    admin:   new Set(['view']),
    member:  new Set([]),
    viewer:  new Set([]),
  },
};

/** Non-hook utility for batch permission checks (e.g. NavigationRail filtering) */
export function checkPermission(role: Role, action: Action, resource: Resource): boolean {
  const rolePerms = PERMISSION_MATRIX[resource]?.[role];
  return rolePerms?.has(action) ?? false;
}

export function usePermission(action: Action, resource: Resource): PermissionResult {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return { allowed: false, reason: 'role_restricted' };
  }

  const role: Role = user.role;
  const resourcePerms = PERMISSION_MATRIX[resource];
  const rolePerms = resourcePerms[role];

  if (rolePerms.has(action)) {
    return { allowed: true };
  }

  // Determine the reason
  const ownerPerms = resourcePerms.owner;
  if (ownerPerms.has(action) && !rolePerms.has(action)) {
    if (role === 'member' || role === 'viewer') {
      return { allowed: false, reason: 'role_restricted' };
    }
    return { allowed: false, reason: 'owner_only' };
  }

  return { allowed: false, reason: 'role_restricted' };
}
