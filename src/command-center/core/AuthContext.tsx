/**
 * AuthContext shim — delegates all auth state to useAuthStore.
 * AuthProvider is now a no-op pass-through; useAuth() reads from the
 * canonical Zustand store so the two systems are unified.
 */
import React from 'react';
import { useAuthStore } from '@/stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, login: storeLogin, logout } = useAuthStore();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'owner') return true;
    return (user.permissions ?? []).includes(permission);
  };

  return {
    // user shape from authStore (name, email, role, etc.)
    user,
    // no separate business object in authStore — callers that need
    // business data should read user.business_name / user.business_id
    business: null as null,
    tokens: token ? { accessToken: token, refreshToken: '', expiresAt: 0 } : null,
    isAuthenticated,
    isLoading,
    error: null as string | null,
    login: (credentials: { email: string; password: string }) =>
      storeLogin(credentials.email, credentials.password),
    logout: () => logout(),
    refreshSession: async () => {},
    updateUser: () => {},
    hasPermission,
    hasFeature: (_feature: string) => false,
  };
}
