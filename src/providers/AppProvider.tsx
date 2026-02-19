/**
 * AppProvider: QueryClientProvider + auth check + error boundary
 */

import React, { useEffect, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { GlobalErrorHandler } from '../components/GlobalErrorHandler';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { token, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    authService
      .getCurrentUser()
      .then((user) => setAuth(user, token))
      .catch(() => clearAuth());
  }, [token, setAuth, clearAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <GlobalErrorHandler />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
