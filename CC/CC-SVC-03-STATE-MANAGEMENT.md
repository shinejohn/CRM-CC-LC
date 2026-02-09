# CC-SVC-03: State Management

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-SVC-03 |
| Name | State Management |
| Phase | 2 - Core Services |
| Dependencies | CC-CORE-01 (App Shell) |
| Estimated Time | 2.5 hours |
| Agent Assignment | Agent 6 |

---

## Purpose

Create centralized state management using Zustand for global application state. This includes stores for UI state, user preferences, cached data, and cross-module communication.

---

## Deliverables

### 1. Root Store

```typescript
// src/command-center/stores/rootStore.ts

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';

// Root UI State
interface UIState {
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  aiMode: boolean;
  activeNavItem: string;
  commandPaletteOpen: boolean;
  modalStack: string[];
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setRightPanelOpen: (open: boolean) => void;
  toggleRightPanel: () => void;
  setAiMode: (mode: boolean) => void;
  toggleAiMode: () => void;
  setActiveNavItem: (item: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  pushModal: (modalId: string) => void;
  popModal: () => void;
  clearModals: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // Initial state
        sidebarCollapsed: false,
        rightPanelOpen: true,
        aiMode: false,
        activeNavItem: 'dashboard',
        commandPaletteOpen: false,
        modalStack: [],

        // Actions
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        
        setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
        toggleRightPanel: () => set(state => ({ rightPanelOpen: !state.rightPanelOpen })),
        
        setAiMode: (mode) => set({ aiMode: mode }),
        toggleAiMode: () => set(state => ({ aiMode: !state.aiMode })),
        
        setActiveNavItem: (item) => set({ activeNavItem: item }),
        
        setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
        
        pushModal: (modalId) => set(state => ({ 
          modalStack: [...state.modalStack, modalId] 
        })),
        popModal: () => set(state => ({ 
          modalStack: state.modalStack.slice(0, -1) 
        })),
        clearModals: () => set({ modalStack: [] }),
      })),
      {
        name: 'cc-ui-store',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          aiMode: state.aiMode,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);
```

### 2. User Preferences Store

```typescript
// src/command-center/stores/preferencesStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
  };
  dashboard: {
    defaultView: 'cards' | 'list' | 'timeline';
    cardColors: Record<string, string>;
    hiddenCards: string[];
    cardOrder: string[];
  };
  ai: {
    autoSuggest: boolean;
    showToolCalls: boolean;
    streamResponses: boolean;
    defaultPersonality: string | null;
  };
}

interface PreferencesState extends UserPreferences {
  setTheme: (theme: UserPreferences['theme']) => void;
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
  setDateFormat: (format: string) => void;
  updateNotifications: (updates: Partial<UserPreferences['notifications']>) => void;
  updateDashboard: (updates: Partial<UserPreferences['dashboard']>) => void;
  updateAI: (updates: Partial<UserPreferences['ai']>) => void;
  setCardColor: (cardId: string, color: string) => void;
  hideCard: (cardId: string) => void;
  showCard: (cardId: string) => void;
  reorderCards: (cardOrder: string[]) => void;
  resetToDefaults: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/DD/YYYY',
  notifications: {
    email: true,
    push: true,
    desktop: true,
    sound: false,
  },
  dashboard: {
    defaultView: 'cards',
    cardColors: {},
    hiddenCards: [],
    cardOrder: [],
  },
  ai: {
    autoSuggest: true,
    showToolCalls: true,
    streamResponses: true,
    defaultPersonality: null,
  },
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setTimezone: (timezone) => set({ timezone }),
      setDateFormat: (dateFormat) => set({ dateFormat }),

      updateNotifications: (updates) =>
        set(state => ({
          notifications: { ...state.notifications, ...updates },
        })),

      updateDashboard: (updates) =>
        set(state => ({
          dashboard: { ...state.dashboard, ...updates },
        })),

      updateAI: (updates) =>
        set(state => ({
          ai: { ...state.ai, ...updates },
        })),

      setCardColor: (cardId, color) =>
        set(state => ({
          dashboard: {
            ...state.dashboard,
            cardColors: { ...state.dashboard.cardColors, [cardId]: color },
          },
        })),

      hideCard: (cardId) =>
        set(state => ({
          dashboard: {
            ...state.dashboard,
            hiddenCards: [...state.dashboard.hiddenCards, cardId],
          },
        })),

      showCard: (cardId) =>
        set(state => ({
          dashboard: {
            ...state.dashboard,
            hiddenCards: state.dashboard.hiddenCards.filter(id => id !== cardId),
          },
        })),

      reorderCards: (cardOrder) =>
        set(state => ({
          dashboard: { ...state.dashboard, cardOrder },
        })),

      resetToDefaults: () => set(defaultPreferences),
    }),
    {
      name: 'cc-preferences',
    }
  )
);
```

### 3. Cache Store

```typescript
// src/command-center/stores/cacheStore.ts

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
```

### 4. Selection Store (for multi-select features)

```typescript
// src/command-center/stores/selectionStore.ts

import { create } from 'zustand';

interface SelectionState {
  // Selection by context (e.g., 'customers', 'content', 'activities')
  selections: Record<string, Set<string>>;
  
  // Actions
  select: (context: string, id: string) => void;
  deselect: (context: string, id: string) => void;
  toggle: (context: string, id: string) => void;
  selectAll: (context: string, ids: string[]) => void;
  deselectAll: (context: string) => void;
  isSelected: (context: string, id: string) => boolean;
  getSelected: (context: string) => string[];
  getCount: (context: string) => number;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selections: {},

  select: (context, id) =>
    set(state => {
      const current = state.selections[context] || new Set();
      return {
        selections: {
          ...state.selections,
          [context]: new Set([...current, id]),
        },
      };
    }),

  deselect: (context, id) =>
    set(state => {
      const current = state.selections[context];
      if (!current) return state;
      
      const next = new Set(current);
      next.delete(id);
      
      return {
        selections: {
          ...state.selections,
          [context]: next,
        },
      };
    }),

  toggle: (context, id) => {
    const isSelected = get().isSelected(context, id);
    if (isSelected) {
      get().deselect(context, id);
    } else {
      get().select(context, id);
    }
  },

  selectAll: (context, ids) =>
    set(state => ({
      selections: {
        ...state.selections,
        [context]: new Set(ids),
      },
    })),

  deselectAll: (context) =>
    set(state => ({
      selections: {
        ...state.selections,
        [context]: new Set(),
      },
    })),

  isSelected: (context, id) => {
    const selection = get().selections[context];
    return selection ? selection.has(id) : false;
  },

  getSelected: (context) => {
    const selection = get().selections[context];
    return selection ? Array.from(selection) : [];
  },

  getCount: (context) => {
    const selection = get().selections[context];
    return selection ? selection.size : 0;
  },
}));
```

### 5. Combined Store Hooks

```typescript
// src/command-center/stores/index.ts

export { useUIStore } from './rootStore';
export { usePreferencesStore } from './preferencesStore';
export { useCacheStore, cacheKeys } from './cacheStore';
export { useSelectionStore } from './selectionStore';

// Re-export types
export type { UserPreferences } from './preferencesStore';

// Combined selector hooks
import { useUIStore } from './rootStore';
import { usePreferencesStore } from './preferencesStore';

export function useLayout() {
  return useUIStore(state => ({
    sidebarCollapsed: state.sidebarCollapsed,
    rightPanelOpen: state.rightPanelOpen,
    aiMode: state.aiMode,
    activeNavItem: state.activeNavItem,
    toggleSidebar: state.toggleSidebar,
    toggleRightPanel: state.toggleRightPanel,
    toggleAiMode: state.toggleAiMode,
    setActiveNavItem: state.setActiveNavItem,
  }));
}

export function useThemePreference() {
  return usePreferencesStore(state => ({
    theme: state.theme,
    setTheme: state.setTheme,
  }));
}

export function useDashboardPreferences() {
  return usePreferencesStore(state => ({
    ...state.dashboard,
    setCardColor: state.setCardColor,
    hideCard: state.hideCard,
    showCard: state.showCard,
    reorderCards: state.reorderCards,
  }));
}
```

---

## Testing Requirements

```typescript
// src/command-center/stores/__tests__/rootStore.test.ts

import { useUIStore } from '../rootStore';
import { act, renderHook } from '@testing-library/react';

describe('UIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarCollapsed: false,
      rightPanelOpen: true,
      aiMode: false,
    });
  });

  it('toggles sidebar', () => {
    const { result } = renderHook(() => useUIStore());
    
    expect(result.current.sidebarCollapsed).toBe(false);
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.sidebarCollapsed).toBe(true);
  });

  it('manages modal stack', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.pushModal('modal-1');
      result.current.pushModal('modal-2');
    });
    
    expect(result.current.modalStack).toEqual(['modal-1', 'modal-2']);
    
    act(() => {
      result.current.popModal();
    });
    
    expect(result.current.modalStack).toEqual(['modal-1']);
  });
});
```

---

## Acceptance Criteria

- [ ] UI store manages layout state
- [ ] Preferences store persists user settings
- [ ] Cache store with TTL works correctly
- [ ] Selection store handles multi-select
- [ ] State persists across page reloads
- [ ] DevTools integration works
- [ ] Combined hooks provide convenient access
- [ ] All stores are typed correctly

---

## Handoff

When complete, this module provides:

1. `useUIStore` - UI state management
2. `usePreferencesStore` - User preferences
3. `useCacheStore` - Data caching
4. `useSelectionStore` - Multi-select state
5. Combined hooks: `useLayout`, `useThemePreference`, `useDashboardPreferences`

Other agents import:
```typescript
import { useUIStore, usePreferencesStore, useLayout } from '@/command-center/stores';
```
