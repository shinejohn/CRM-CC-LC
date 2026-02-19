// ============================================
// PROTECTED ROUTE
// Wrapper that checks auth + feature flags
// Redirects unauthenticated users to login
// ============================================

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import type { FeatureFlagKey } from '../services/featureFlags';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requiredFeature?: FeatureFlagKey;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  requiredFeature,
  fallback,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const featureEnabled = requiredFeature ? useFeatureFlag(requiredFeature) : true;

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user) {
    const isAdmin =
      user.role === 'admin' ||
      user.role === 'owner' ||
      user.permissions?.includes('ops:access');
    if (!isAdmin) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] rounded-lg border border-dashed border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10 p-8 text-center">
          <span className="text-4xl mb-4">🔒</span>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Access Denied
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300">
            This area is restricted to administrators.
          </p>
        </div>
      );
    }
  }

  if (requiredFeature && !featureEnabled && fallback) {
    return <>{fallback}</>;
  }

  if (requiredFeature && !featureEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 p-8 text-center">
        <span className="text-4xl mb-4">🚧</span>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Coming Soon</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">This feature is under development.</p>
      </div>
    );
  }

  return <>{children}</>;
}
