/**
 * Auth service: login, logout, getCurrentUser, refreshToken
 */

import axios from 'axios';
import { apiClient as api } from './api';
import { env } from '../config/env';
import type { User, LoginRequest, LoginResponse } from '../types/auth';

/** Auth client for login (uses base URL; Sanctum login at /login) */
const authClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
});

/** Fetch CSRF cookie then login (Sanctum requirement) */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  // await getCsrfCookie();
  const { data } = await authClient.post<{ data?: LoginResponse } & LoginResponse>('/login', credentials);
  const response = (data.data ?? data) as LoginResponse;
  const token = response.token;
  let user = response.user;
  if (token) localStorage.setItem('auth_token', token);
  if (!user && token) user = await getCurrentUser();
  return { token, user };
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/logout');
  } finally {
    localStorage.removeItem('auth_token');
  }
};

/** Get current authenticated user (Laravel returns at /api/user or /user) */
export const getCurrentUser = async (): Promise<User> => {
  const { data } = await api.get<{ data: User }>('/user');
  return data.data ?? (data as unknown as User);
};

/** Refresh token (if backend supports) */
export const refreshToken = async (): Promise<string> => {
  const { data } = await api.post<{ token: string }>('/auth/refresh');
  return data.token;
};

export const authService = {
  login,
  logout,
  getCurrentUser,
  refreshToken,
};
