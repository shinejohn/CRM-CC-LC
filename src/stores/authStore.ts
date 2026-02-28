import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  business_id: string;
  business_name: string;
  role: "owner" | "admin" | "member" | "viewer";
  avatar_url?: string;
  subscription_tier: "free" | "influencer" | "expert" | "sponsor";
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
}

const API_BASE = import.meta.env.VITE_API_URL || "https://api.fibonacco.com/v1";

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
          const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
          throw new Error("Login failed");
        }
      },
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
    }),
    { name: "fibonacco-auth" }
  )
);
