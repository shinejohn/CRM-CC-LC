# CC-SVC-04: Event Bus

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-SVC-04 |
| Name | Event Bus |
| Phase | 2 - Core Services |
| Dependencies | CC-CORE-01 |
| Estimated Time | 1.5 hours |
| Agent Assignment | Agent 7 |

---

## Purpose

Create an internal event bus for cross-component communication, enabling loose coupling between modules while maintaining reactive updates.

---

## Deliverables

### 1. Event Bus Service

```typescript
// src/command-center/services/events.service.ts

type EventHandler<T = any> = (payload: T) => void;

interface EventSubscription {
  unsubscribe: () => void;
}

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private history: Array<{ event: string; payload: any; timestamp: Date }> = [];
  private historyLimit = 100;

  /**
   * Subscribe to an event
   */
  on<T>(event: string, handler: EventHandler<T>): EventSubscription {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return {
      unsubscribe: () => this.off(event, handler),
    };
  }

  /**
   * Subscribe to an event once
   */
  once<T>(event: string, handler: EventHandler<T>): EventSubscription {
    const wrappedHandler: EventHandler<T> = (payload) => {
      this.off(event, wrappedHandler);
      handler(payload);
    };
    return this.on(event, wrappedHandler);
  }

  /**
   * Unsubscribe from an event
   */
  off<T>(event: string, handler: EventHandler<T>): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.delete(handler);
      if (eventHandlers.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  /**
   * Emit an event
   */
  emit<T>(event: string, payload: T): void {
    // Add to history
    this.history.push({ event, payload, timestamp: new Date() });
    if (this.history.length > this.historyLimit) {
      this.history.shift();
    }

    // Notify handlers
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Event handler error for ${event}:`, error);
        }
      });
    }

    // Notify wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler({ event, payload });
        } catch (error) {
          console.error(`Wildcard handler error:`, error);
        }
      });
    }
  }

  /**
   * Get event history
   */
  getHistory(event?: string): typeof this.history {
    if (event) {
      return this.history.filter(h => h.event === event);
    }
    return [...this.history];
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.history = [];
  }
}

export const eventBus = new EventBus();

// Pre-defined event types
export const Events = {
  // Activity events
  ACTIVITY_CREATED: 'activity:created',
  ACTIVITY_UPDATED: 'activity:updated',
  ACTIVITY_COMPLETED: 'activity:completed',
  
  // Customer events
  CUSTOMER_CREATED: 'customer:created',
  CUSTOMER_UPDATED: 'customer:updated',
  CUSTOMER_SELECTED: 'customer:selected',
  
  // Content events
  CONTENT_CREATED: 'content:created',
  CONTENT_PUBLISHED: 'content:published',
  
  // Navigation events
  NAVIGATE: 'nav:navigate',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',
  
  // AI events
  AI_RESPONSE: 'ai:response',
  AI_SUGGESTION: 'ai:suggestion',
  
  // System events
  TOAST: 'system:toast',
  ERROR: 'system:error',
  REFRESH: 'system:refresh',
} as const;
```

### 2. useEvent Hook

```typescript
// src/command-center/hooks/useEvent.ts

import { useEffect, useRef, useCallback } from 'react';
import { eventBus, Events } from '../services/events.service';

export function useEvent<T>(event: string, handler: (payload: T) => void): void {
  const handlerRef = useRef(handler);
  
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const subscription = eventBus.on<T>(event, (payload) => {
      handlerRef.current(payload);
    });
    
    return () => subscription.unsubscribe();
  }, [event]);
}

export function useEmit() {
  return useCallback(<T>(event: string, payload: T) => {
    eventBus.emit(event, payload);
  }, []);
}

export { Events };
```

---

# CC-SVC-05: Search Service

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-SVC-05 |
| Name | Search Service |
| Phase | 2 - Core Services |
| Dependencies | CC-CORE-01, CC-CORE-03 |
| Estimated Time | 2 hours |
| Agent Assignment | Agent 8 |

---

## Purpose

Create a unified search service that searches across customers, content, campaigns, and activities with support for semantic search and filtering.

---

## API Endpoints

```
GET /v1/search?q={query}&type={type}         # Keyword search
GET /v1/search/semantic?q={query}            # Semantic/AI search
GET /v1/search/suggestions?q={query}         # Autocomplete
```

---

## Deliverables

### 1. Search Service

```typescript
// src/command-center/services/search.service.ts

import { apiService } from './api.service';

export interface SearchResult {
  type: 'customer' | 'content' | 'campaign' | 'activity' | 'service';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  score: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

export interface SearchFilters {
  types?: string[];
  dateRange?: { start: string; end: string };
  status?: string[];
}

class SearchService {
  async search(
    query: string,
    filters?: SearchFilters
  ): Promise<SearchResult[]> {
    const params: Record<string, any> = { q: query };
    if (filters?.types) params.types = filters.types.join(',');
    
    const response = await apiService.get<SearchResult[]>('/v1/search', { params });
    return response.data || [];
  }

  async semanticSearch(query: string): Promise<SearchResult[]> {
    const response = await apiService.get<SearchResult[]>('/v1/search/semantic', {
      params: { q: query },
    });
    return response.data || [];
  }

  async getSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return [];
    
    const response = await apiService.get<string[]>('/v1/search/suggestions', {
      params: { q: query },
    });
    return response.data || [];
  }
}

export const searchService = new SearchService();
```

### 2. useSearch Hook

```typescript
// src/command-center/hooks/useSearch.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { searchService, SearchResult, SearchFilters } from '../services/search.service';

interface UseSearchOptions {
  debounceMs?: number;
  minChars?: number;
  filters?: SearchFilters;
}

export function useSearch(options: UseSearchOptions = {}) {
  const { debounceMs = 300, minChars = 2, filters } = options;
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const debounceRef = useRef<NodeJS.Timeout>();

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minChars) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const [searchResults, searchSuggestions] = await Promise.all([
        searchService.search(searchQuery, filters),
        searchService.getSuggestions(searchQuery),
      ]);
      setResults(searchResults);
      setSuggestions(searchSuggestions);
    } finally {
      setIsLoading(false);
    }
  }, [minChars, filters]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      search(query);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debounceMs, search]);

  return {
    query,
    setQuery,
    results,
    suggestions,
    isLoading,
    search,
  };
}
```

---

# CC-SVC-07: Notification Service

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-SVC-07 |
| Name | Notification Service |
| Phase | 2 - Core Services |
| Dependencies | CC-CORE-01, CC-SVC-04 |
| Estimated Time | 2 hours |
| Agent Assignment | Agent 10 |

---

## Purpose

Create a notification system for in-app notifications, toasts, and integration with browser notifications.

---

## Deliverables

### 1. Notification Types

```typescript
// src/command-center/services/notification.types.ts

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface ToastOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### 2. Notification Service

```typescript
// src/command-center/services/notification.service.ts

import { create } from 'zustand';
import { Notification, ToastOptions } from './notification.types';

interface NotificationState {
  notifications: Notification[];
  toasts: Array<ToastOptions & { id: string }>;
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  
  // Toast actions
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  toasts: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    set(state => ({
      notifications: [newNotification, ...state.notifications].slice(0, 100),
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
    set(state => {
      const notification = state.notifications.find(n => n.id === id);
      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: notification && !notification.read
          ? state.unreadCount - 1
          : state.unreadCount,
      };
    });
  },

  clearAll: () => set({ notifications: [], unreadCount: 0 }),

  showToast: (options) => {
    const id = crypto.randomUUID();
    const duration = options.duration ?? 5000;
    
    set(state => ({
      toasts: [...state.toasts, { ...options, id }],
    }));

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        get().dismissToast(id);
      }, duration);
    }

    return id;
  },

  dismissToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },
}));

// Convenience functions
export const toast = {
  info: (title: string, message?: string) =>
    useNotificationStore.getState().showToast({ type: 'info', title, message }),
  success: (title: string, message?: string) =>
    useNotificationStore.getState().showToast({ type: 'success', title, message }),
  warning: (title: string, message?: string) =>
    useNotificationStore.getState().showToast({ type: 'warning', title, message }),
  error: (title: string, message?: string) =>
    useNotificationStore.getState().showToast({ type: 'error', title, message }),
};
```

### 3. Toast Component

```typescript
// src/command-center/components/ui/Toast.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { useNotificationStore } from '../../services/notification.service';

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
};

const colors = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type || 'info'];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`
                flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[320px] max-w-[400px]
                ${colors[toast.type || 'info']}
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{toast.title}</p>
                {toast.message && (
                  <p className="text-sm opacity-80 mt-1">{toast.message}</p>
                )}
                {toast.action && (
                  <button
                    onClick={toast.action.onClick}
                    className="text-sm font-medium underline mt-2"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="opacity-50 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
```

---

## Testing Requirements

Each service should have unit tests covering:
- Basic functionality
- Edge cases
- Error handling
- Integration with other services

---

## Acceptance Criteria

### CC-SVC-04 (Event Bus)
- [ ] Subscribe/unsubscribe works
- [ ] Wildcard subscriptions work
- [ ] Event history maintained
- [ ] useEvent hook works in components

### CC-SVC-05 (Search)
- [ ] Search returns typed results
- [ ] Debouncing works
- [ ] Suggestions load
- [ ] Filters apply correctly

### CC-SVC-07 (Notifications)
- [ ] Notifications persist
- [ ] Toasts auto-dismiss
- [ ] Read/unread tracking works
- [ ] Toast animations smooth

---

## Handoff

When complete, these modules provide:

**CC-SVC-04:**
- `eventBus` - Event bus singleton
- `useEvent`, `useEmit` - React hooks
- `Events` - Event type constants

**CC-SVC-05:**
- `searchService` - Search singleton
- `useSearch` - Search hook

**CC-SVC-07:**
- `useNotificationStore` - Notification state
- `toast` - Toast helper functions
- `ToastContainer` - Toast UI component
