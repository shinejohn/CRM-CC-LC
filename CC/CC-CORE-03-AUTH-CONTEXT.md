# CC-CORE-03: Auth Context

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-CORE-03 |
| Name | Auth Context |
| Phase | 1 - Foundation |
| Dependencies | None |
| Estimated Time | 1.5 hours |
| Agent Assignment | Agent 3 |

---

## Purpose

Create the authentication context that manages user sessions, business context, JWT tokens, and provides user/business data to all components. This is the security backbone of the Command Center.

---

## API Endpoints Used

```
POST   /v1/auth/login              # Login with credentials
POST   /v1/auth/logout             # Logout and invalidate token
GET    /v1/auth/me                 # Get current user profile
POST   /v1/auth/refresh            # Refresh JWT token
GET    /v1/businesses/{id}         # Get business details
```

---

## Deliverables

### 1. Auth Types

```typescript
// src/command-center/core/auth.types.ts

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  businessId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  industry?: string;
  tier: 'free' | 'starter' | 'growth' | 'enterprise';
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'cancelled';
  settings: BusinessSettings;
  createdAt: string;
}

export interface BusinessSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
  locale: string;
  features: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthState {
  user: User | null;
  business: Business | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### 2. Auth Context Provider

```typescript
// src/command-center/core/AuthContext.tsx

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
const API_URL = import.meta.env.VITE_API_URL || '/api';

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
    } catch {
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
        const error = await response.json();
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
```

### 3. Auth Guard Component

```typescript
// src/command-center/core/AuthGuard.tsx

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LoadingScreen } from '../components/ui/LoadingScreen';

interface AuthGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredFeature?: string;
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  requiredPermission,
  requiredFeature,
  fallback,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, hasPermission, hasFeature } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  if (requiredFeature && !hasFeature(requiredFeature)) {
    return fallback ? <>{fallback}</> : <Navigate to="/upgrade" replace />;
  }

  return <>{children}</>;
}
```

### 4. useCurrentUser Hook

```typescript
// src/command-center/hooks/useCurrentUser.ts

import { useMemo } from 'react';
import { useAuth } from '../core/AuthContext';

export function useCurrentUser() {
  const { user, business, isAuthenticated } = useAuth();

  return useMemo(() => ({
    user,
    business,
    isAuthenticated,
    
    // Computed properties
    fullName: user ? `${user.firstName} ${user.lastName}` : null,
    initials: user 
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() 
      : null,
    isOwner: user?.role === 'owner',
    isAdmin: user?.role === 'owner' || user?.role === 'admin',
    tierLevel: business?.tier || 'free',
    
    // Helper for displaying business context
    businessContext: business ? {
      id: business.id,
      name: business.name,
      tier: business.tier,
      timezone: business.settings.timezone,
    } : null,
  }), [user, business, isAuthenticated]);
}
```

### 5. Permission Hook

```typescript
// src/command-center/hooks/usePermissions.ts

import { useCallback, useMemo } from 'react';
import { useAuth } from '../core/AuthContext';

type Permission = 
  | 'customers:read' | 'customers:write' | 'customers:delete'
  | 'content:read' | 'content:write' | 'content:publish'
  | 'campaigns:read' | 'campaigns:write' | 'campaigns:send'
  | 'services:read' | 'services:write'
  | 'billing:read' | 'billing:manage'
  | 'team:read' | 'team:manage'
  | 'settings:read' | 'settings:write';

export function usePermissions() {
  const { user, hasPermission, hasFeature } = useAuth();

  const can = useCallback((permission: Permission): boolean => {
    return hasPermission(permission);
  }, [hasPermission]);

  const canAny = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  }, [hasPermission]);

  const canAll = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  }, [hasPermission]);

  const permissions = useMemo(() => ({
    // Customer permissions
    canViewCustomers: can('customers:read'),
    canEditCustomers: can('customers:write'),
    canDeleteCustomers: can('customers:delete'),
    
    // Content permissions
    canViewContent: can('content:read'),
    canEditContent: can('content:write'),
    canPublishContent: can('content:publish'),
    
    // Campaign permissions
    canViewCampaigns: can('campaigns:read'),
    canEditCampaigns: can('campaigns:write'),
    canSendCampaigns: can('campaigns:send'),
    
    // Service permissions
    canViewServices: can('services:read'),
    canEditServices: can('services:write'),
    
    // Billing permissions
    canViewBilling: can('billing:read'),
    canManageBilling: can('billing:manage'),
    
    // Team permissions
    canViewTeam: can('team:read'),
    canManageTeam: can('team:manage'),
    
    // Settings permissions
    canViewSettings: can('settings:read'),
    canEditSettings: can('settings:write'),
  }), [can]);

  return {
    can,
    canAny,
    canAll,
    hasFeature,
    ...permissions,
  };
}
```

### 6. Login Page Component

```typescript
// src/command-center/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '../core/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/command-center';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password, remember });
      navigate(from, { replace: true });
    } catch {
      // Error is handled by context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <span className="text-3xl font-bold text-white">F</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-500 dark:text-slate-400 mb-8">
          Sign in to your Command Center
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked as boolean)}
              />
              <span className="text-sm text-gray-600 dark:text-slate-400">
                Remember me
              </span>
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
          Don't have an account?{' '}
          <a href="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
            Get started
          </a>
        </p>
      </motion.div>
    </div>
  );
}
```

---

## Testing Requirements

```typescript
// src/command-center/core/__tests__/AuthContext.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

function TestComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
      <span data-testid="user-email">{user?.email || 'no-user'}</span>
      <button onClick={() => login({ email: 'test@test.com', password: 'pass' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('provides auth state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
  });

  it('handles login', async () => {
    // Mock fetch and test login flow
  });

  it('handles logout', async () => {
    // Test logout flow
  });

  it('refreshes tokens', async () => {
    // Test token refresh
  });
});
```

---

## Acceptance Criteria

- [ ] AuthProvider initializes from stored tokens
- [ ] Login stores tokens and loads user data
- [ ] Logout clears all auth state
- [ ] Token refresh happens before expiry
- [ ] AuthGuard protects routes
- [ ] Permission checking works correctly
- [ ] Feature checking works correctly
- [ ] Loading state shown during init
- [ ] Error state handled properly
- [ ] LoginPage validates and submits

---

## Handoff

When complete, this module provides:

1. `AuthProvider` - Context provider component
2. `useAuth` - Main auth hook
3. `AuthGuard` - Route protection component
4. `useCurrentUser` - Current user data hook
5. `usePermissions` - Permission checking hook
6. `LoginPage` - Login page component

Other agents import:
```typescript
import { AuthProvider, useAuth, AuthGuard } from '@/command-center/core';
import { useCurrentUser, usePermissions } from '@/command-center/hooks';
```
