// ============================================
// AUTH TYPES - Command Center
// CC-CORE-03: Auth Context Module
// ============================================

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

