import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  business_id?: string;
  business_name?: string;
  role?: "owner" | "admin" | "member" | "viewer" | string;
  avatar_url?: string;
  subscription_tier?: "free" | "influencer" | "expert" | "sponsor" | string;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

// VITE_API_URL = API origin INCLUDING `/api` but NOT `/v1`. Paths start with `/v1/...`.
const API_BASE = import.meta.env.VITE_API_URL || "https://api.fibonacco.com/api";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();
          if (!response.ok) {
            set({ isLoading: false });
            throw new Error(data.message ?? data.error ?? "Login failed");
          }
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err instanceof Error ? err : new Error("Login failed");
        }
      },
      logout: () => {
        // Defensive cleanup of any legacy token location so stale tokens don't linger.
        try {
          localStorage.removeItem("auth_token");
        } catch {
          // ignore (e.g. SSR / restricted storage)
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "fibonacco-auth",
      // Persist only durable auth state — never transient flags like `isLoading`
      // (a tab closed mid-login must not rehydrate a permanent loading state).
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
