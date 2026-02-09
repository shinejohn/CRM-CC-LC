import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback,
  ReactNode 
} from 'react';
import { 
  User, 
  Business, 
  AuthTokens, 
  LoginCredentials, 
  AuthState 
} from './auth.types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
  hasFeature: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'cc_auth_tokens';
const API_URL = import.meta.env.VITE_API_ENDPOINT || '/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    business: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize from stored tokens
  useEffect(() => {
    const initAuth = async () => {
      const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedTokens) {
        try {
          const tokens: AuthTokens = JSON.parse(storedTokens);
          if (tokens.expiresAt > Date.now()) {
            await loadUserData(tokens);
          } else {
            await refreshTokens(tokens.refreshToken);
          }
        } catch (error) {
          console.error('Failed to initialize auth from stored tokens:', error);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
      setState(prev => ({ ...prev, isLoading: false }));
    };

    initAuth();
  }, []);

  // Token refresh interval
  useEffect(() => {
    if (!state.tokens) return;

    const refreshInterval = setInterval(() => {
      const timeUntilExpiry = state.tokens!.expiresAt - Date.now();
      if (timeUntilExpiry < 5 * 60 * 1000) { // 5 minutes before expiry
        refreshTokens(state.tokens!.refreshToken);
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, [state.tokens]);

  const loadUserData = async (tokens: AuthTokens) => {
    try {
      const response = await fetch(`${API_URL}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to load user');

      const { user, business } = await response.json();
      
      setState(prev => ({
        ...prev,
        user,
        business,
        tokens,
        isAuthenticated: true,
        error: null,
      }));

      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to load user data:', error);
      throw error;
    }
  };

  const refreshTokens = async (refreshToken: string) => {
    try {
      const response = await fetch(`${API_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) throw new Error('Refresh failed');

      const tokens: AuthTokens = await response.json();
      await loadUserData(tokens);
    } catch (error) {
      console.error('Token refresh failed:', error);
      setState(prev => ({
        ...prev,
        user: null,
        business: null,
        tokens: null,
        isAuthenticated: false,
      }));
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(error.message || 'Login failed');
      }

      const { tokens, user, business } = await response.json();
      
      setState(prev => ({
        ...prev,
        user,
        business,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (state.tokens) {
        await fetch(`${API_URL}/v1/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${state.tokens.accessToken}` },
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setState({
        user: null,
        business: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [state.tokens]);

  const refreshSession = useCallback(async () => {
    if (state.tokens?.refreshToken) {
      await refreshTokens(state.tokens.refreshToken);
    }
  }, [state.tokens]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.user) return false;
    if (state.user.role === 'owner') return true;
    return state.user.permissions.includes(permission);
  }, [state.user]);

  const hasFeature = useCallback((feature: string): boolean => {
    if (!state.business) return false;
    return state.business.settings.features.includes(feature);
  }, [state.business]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshSession,
        updateUser,
        hasPermission,
        hasFeature,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

