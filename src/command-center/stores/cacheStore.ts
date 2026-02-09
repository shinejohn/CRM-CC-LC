import { create } from 'zustand';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheState {
  cache: Map<string, CacheEntry<any>>;
  
  // Actions
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, ttlMs?: number) => void;
  invalidate: (key: string) => void;
  invalidatePattern: (pattern: string) => void;
  clear: () => void;
  isValid: (key: string) => boolean;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const useCacheStore = create<CacheState>((set, get) => ({
  cache: new Map(),

  get: <T>(key: string): T | null => {
    const entry = get().cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      get().invalidate(key);
      return null;
    }
    
    return entry.data as T;
  },

  set: <T>(key: string, data: T, ttlMs = DEFAULT_TTL) => {
    set(state => {
      const newCache = new Map(state.cache);
      newCache.set(key, {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttlMs,
      });
      return { cache: newCache };
    });
  },

  invalidate: (key) => {
    set(state => {
      const newCache = new Map(state.cache);
      newCache.delete(key);
      return { cache: newCache };
    });
  },

  invalidatePattern: (pattern) => {
    set(state => {
      const newCache = new Map(state.cache);
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      
      for (const key of newCache.keys()) {
        if (regex.test(key)) {
          newCache.delete(key);
        }
      }
      
      return { cache: newCache };
    });
  },

  clear: () => set({ cache: new Map() }),

  isValid: (key) => {
    const entry = get().cache.get(key);
    return entry !== undefined && Date.now() < entry.expiresAt;
  },
}));

// Cache key generators
export const cacheKeys = {
  customer: (id: string) => `customer:${id}`,
  customers: (filters: string) => `customers:${filters}`,
  content: (id: string) => `content:${id}`,
  campaigns: () => 'campaigns:list',
  dashboard: () => 'dashboard:data',
  activities: (filters: string) => `activities:${filters}`,
};

