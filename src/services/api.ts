import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

// THE CONVENTION: VITE_API_URL is the API origin INCLUDING `/api` but NOT `/v1`.
// Every request PATH in code starts with `/v1/...` (never include `/api` — it's in the base).
// Dev default: http://localhost:8000/api
const API_BASE = import.meta.env.VITE_API_URL || "https://api.fibonacco.com/api";

/**
 * Single source of truth for the auth token: the Zustand auth store
 * (persisted under `fibonacco-auth`). Other clients import this helper
 * instead of reading localStorage directly.
 */
export const getAuthToken = (): string | null => useAuthStore.getState().token;

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — injects auth token from the store
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handles 401 redirect, error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      const path = window.location.pathname;
      const isPublicRoute = path.startsWith("/learn/") || path.startsWith("/advertise/") || path === "/login";
      if (!isPublicRoute) {
        window.location.href = "/login";
      }
    }
    const data = error.response?.data as Record<string, unknown> | undefined;
    const messageFromBody =
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.error === "string" && data.error) ||
      "An error occurred";
    return Promise.reject({
      message: messageFromBody,
      status: error.response?.status || 500,
      errors: (data?.errors as Record<string, unknown>) || {},
    });
  }
);
