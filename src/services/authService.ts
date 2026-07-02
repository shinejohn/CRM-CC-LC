/**
 * Auth service: login, logout, getCurrentUser, refreshToken
 *
 * THE CONVENTION:
 * - All requests go through `apiClient` (base = VITE_API_URL = origin incl. `/api`).
 * - Every path starts with `/v1/...` (never include `/api` — it's in the base).
 * - The auth token's single source of truth is the Zustand auth store
 *   (`useAuthStore`), the same store `api.ts` reads from. No `localStorage['auth_token']`.
 */

import { apiClient } from './api';
import { useAuthStore } from '@/stores/authStore';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types/auth';

/** Persist the issued token (and user, when known) to the single auth store. */
const persistSession = (token: string | undefined, user: User | undefined): void => {
  const store = useAuthStore.getState();
  if (user && token) {
    store.setAuth(user, token);
  } else if (token) {
    store.setToken(token);
  }
};

/** Login with email/password (Sanctum personal access token). */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await apiClient.post<{ data?: LoginResponse } & LoginResponse>(
    '/v1/auth/login',
    credentials,
  );
  const response = (data.data ?? data) as LoginResponse;
  const token = response.token;
  let user = response.user;
  if (token && !user) user = await getCurrentUser();
  persistSession(token, user);
  return { token, user };
};

/**
 * Register a new account. Mirrors login(): hits the API, persists the issued
 * Sanctum token to the auth store, and returns the same { token, user } shape.
 */
export const register = async (payload: RegisterRequest): Promise<RegisterResponse> => {
  const { data } = await apiClient.post<{ data?: RegisterResponse } & RegisterResponse>(
    '/v1/auth/register',
    payload,
  );
  const response = (data.data ?? data) as RegisterResponse;
  const token = response.token;
  let user = response.user;
  if (token && !user) user = await getCurrentUser();
  persistSession(token, user);
  return { token, user };
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/v1/auth/logout');
  } finally {
    // Clears the store token and defensively removes any legacy localStorage token.
    useAuthStore.getState().logout();
  }
};

/** Get current authenticated user (SPA alias route: /v1/user). */
export const getCurrentUser = async (): Promise<User> => {
  const { data } = await apiClient.get<{ data: User }>('/v1/user');
  return data.data ?? (data as unknown as User);
};

/**
 * Refresh token.
 * TODO: The backend does not currently expose `POST /v1/auth/refresh`
 * (see backend/routes/api.php — only login/register/logout/me exist under
 * the `v1/auth` group). Do NOT call a nonexistent route. Wire this up once
 * the backend adds the endpoint.
 */
export const refreshToken = async (): Promise<string> => {
  throw new Error(
    'refreshToken is not supported: backend has no POST /v1/auth/refresh route yet.',
  );
};

export const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  refreshToken,
};
