import { useMemo } from 'react';
import { useAuth } from '../core/AuthContext';

export function useCurrentUser() {
  const { user, business, isAuthenticated } = useAuth();

  return useMemo(() => ({
    user,
    business,
    isAuthenticated,
    
    // Computed properties
    fullName: user ? `${user.firstName} ${user.lastName}` : null,
    initials: user 
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() 
      : null,
    isOwner: user?.role === 'owner',
    isAdmin: user?.role === 'owner' || user?.role === 'admin',
    tierLevel: business?.tier || 'free',
    
    // Helper for displaying business context
    businessContext: business ? {
      id: business.id,
      name: business.name,
      tier: business.tier,
      timezone: business.settings.timezone,
    } : null,
  }), [user, business, isAuthenticated]);
}

