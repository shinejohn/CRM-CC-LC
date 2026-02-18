/**
 * Auth hooks: login, logout, current user, auth state
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequest } from '../types/auth';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => setAuth(data.user, data.token),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
  });

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled: !!token && !user,
  });

  const login = (credentials: LoginRequest) => loginMutation.mutateAsync(credentials);
  const logout = () => logoutMutation.mutateAsync();

  return {
    user: user ?? currentUser ?? null,
    token,
    isAuthenticated,
    login,
    logout,
    isLoading: loginMutation.isPending || isLoadingUser,
    loginError: loginMutation.error,
  };
}
