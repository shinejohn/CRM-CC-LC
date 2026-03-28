import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.fibonacco.com/v1";

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — injects auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handles 401 redirect, error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
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
