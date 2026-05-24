import { useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function useCurrentUser() {
  const { user, isAuthenticated } = useAuthStore();

  return useMemo(() => {
    const nameParts = user?.name?.trim().split(/\s+/) ?? [];
    const initials = nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : (user?.name?.[0]?.toUpperCase() ?? null);

    return {
      user,
      business: null as null,
      isAuthenticated,
      fullName: user?.name ?? null,
      initials,
      isOwner: user?.role === 'owner',
      isAdmin: user?.role === 'owner' || user?.role === 'admin',
      tierLevel: user?.subscription_tier ?? 'free',
      businessContext: user?.business_name
        ? {
            id: user.business_id ?? '',
            name: user.business_name,
            tier: user.subscription_tier ?? 'free',
            timezone: 'UTC',
          }
        : null,
    };
  }, [user, isAuthenticated]);
}
