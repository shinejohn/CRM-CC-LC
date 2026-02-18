/**
 * Axios API client with Sanctum auth, CSRF, and error handling
 */

import axios, { type AxiosError } from 'axios';
import { env } from '../config/env';
import type { ApiError } from '../types/common';

function normalizeError(error: AxiosError): ApiError {
  const response = error.response;
  if (response?.data && typeof response.data === 'object') {
    const data = response.data as { message?: string; errors?: Record<string, string[]> };
    return {
      message: data.message || error.message || 'Request failed',
      errors: data.errors,
      status: response.status,
    };
  }
  return {
    message: error.message || 'Network request failed',
    status: response?.status,
  };
}

const api = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(normalizeError(error));
  }
);

/** Fetch Sanctum CSRF cookie before login (required for Laravel Sanctum) */
export const getCsrfCookie = () =>
  axios.get(`${env.apiBaseUrl}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });

export default api;
