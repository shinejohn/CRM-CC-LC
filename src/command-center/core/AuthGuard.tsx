import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from './AuthContext';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface AuthGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredFeature?: string;
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  requiredPermission,
  requiredFeature,
  fallback,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, hasPermission, hasFeature } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  if (requiredFeature && !hasFeature(requiredFeature)) {
    return fallback ? <>{fallback}</> : <Navigate to="/upgrade" replace />;
  }

  return <>{children}</>;
}

