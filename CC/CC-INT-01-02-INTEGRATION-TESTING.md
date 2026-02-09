# CC-INT-01: Cross-Module Integration

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-INT-01 |
| Name | Cross-Module Integration |
| Phase | 4 - Integration |
| Dependencies | All Phase 1-3 modules |
| Estimated Time | 3 hours |
| Agent Assignment | Integration Lead |

---

## Purpose

Wire together all modules, configure routing, establish cross-module communication, and ensure the entire Command Center functions as a cohesive application.

---

## Deliverables

### 1. Main App Router

```typescript
// src/command-center/AppRouter.tsx

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './core/AuthGuard';
import { AppShell } from './core/AppShell';
import { LoadingScreen } from './components/ui/LoadingScreen';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./modules/dashboard/DashboardPage'));
const Activities = lazy(() => import('./modules/activities/ActivitiesPage'));
const Customers = lazy(() => import('./modules/customers/CustomersListPage'));
const CustomerDetail = lazy(() => import('./modules/customers/CustomerDetailPage'));
const Content = lazy(() => import('./modules/content/ContentManagerDashboard'));
const Campaigns = lazy(() => import('./modules/campaigns/CampaignsPage'));
const Services = lazy(() => import('./modules/services/ServicesDashboard'));
const AIHub = lazy(() => import('./modules/ai-hub/AIHubPage'));
const Settings = lazy(() => import('./pages/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <Suspense fallback={<LoadingScreen />}>
          <LoginPage />
        </Suspense>
      } />

      {/* Protected routes */}
      <Route path="/command-center" element={
        <AuthGuard>
          <AppShell />
        </AuthGuard>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        
        <Route path="dashboard" element={
          <Suspense fallback={<LoadingScreen />}>
            <Dashboard />
          </Suspense>
        } />
        
        <Route path="activities" element={
          <Suspense fallback={<LoadingScreen />}>
            <Activities />
          </Suspense>
        } />
        
        <Route path="customers" element={
          <Suspense fallback={<LoadingScreen />}>
            <Customers />
          </Suspense>
        } />
        
        <Route path="customers/:id" element={
          <Suspense fallback={<LoadingScreen />}>
            <CustomerDetail />
          </Suspense>
        } />
        
        <Route path="content" element={
          <Suspense fallback={<LoadingScreen />}>
            <Content />
          </Suspense>
        } />
        
        <Route path="campaigns" element={
          <Suspense fallback={<LoadingScreen />}>
            <Campaigns />
          </Suspense>
        } />
        
        <Route path="campaigns/:id" element={
          <Suspense fallback={<LoadingScreen />}>
            <CampaignDetail />
          </Suspense>
        } />
        
        <Route path="services" element={
          <Suspense fallback={<LoadingScreen />}>
            <Services />
          </Suspense>
        } />
        
        <Route path="ai" element={
          <Suspense fallback={<LoadingScreen />}>
            <AIHub />
          </Suspense>
        } />
        
        <Route path="settings/*" element={
          <Suspense fallback={<LoadingScreen />}>
            <Settings />
          </Suspense>
        } />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/command-center" replace />} />
    </Routes>
  );
}
```

### 2. App Providers

```typescript
// src/command-center/AppProviders.tsx

import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './core/AuthContext';
import { ThemeProvider } from './core/ThemeProvider';
import { LayoutProvider } from './core/LayoutContext';
import { websocketService } from './services/websocket.service';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="system">
            <LayoutProvider>
              {children}
              <Toaster />
            </LayoutProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
```

### 3. Main Entry Point

```typescript
// src/command-center/index.tsx

import React from 'react';
import { AppProviders } from './AppProviders';
import { AppRouter } from './AppRouter';
import './styles/globals.css';

export function CommandCenter() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default CommandCenter;
```

### 4. Navigation Configuration

```typescript
// src/command-center/config/navigation.ts

import {
  LayoutDashboard, Users, FileText, Megaphone,
  Package, Brain, Calendar, Settings, Activity
} from 'lucide-react';
import { NavItem } from '@/types/command-center';

export const mainNavigation: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/command-center/dashboard',
  },
  {
    id: 'activities',
    label: 'Activities',
    icon: Activity,
    href: '/command-center/activities',
    badge: 'dynamic', // Will show pending count
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    href: '/command-center/customers',
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileText,
    href: '/command-center/content',
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: Megaphone,
    href: '/command-center/campaigns',
  },
  {
    id: 'services',
    label: 'Services',
    icon: Package,
    href: '/command-center/services',
  },
  {
    id: 'ai',
    label: 'AI Hub',
    icon: Brain,
    href: '/command-center/ai',
    highlight: true,
  },
];

export const secondaryNavigation: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/command-center/settings',
  },
];
```

### 5. Global Event Bus Integration

```typescript
// src/command-center/config/events.ts

import { eventBus } from '../services/eventBus.service';
import { websocketService } from '../services/websocket.service';
import { notificationService } from '../services/notification.service';

// Connect WebSocket events to EventBus
export function initializeEventBridge() {
  // Activity events
  websocketService.subscribe('activity.*', (event) => {
    eventBus.emit(event.type, event.payload);
    
    // Show notification for new activities
    if (event.type === 'activity.created') {
      notificationService.show({
        title: 'New Activity',
        message: event.payload.description,
        type: 'info',
      });
    }
  });

  // Customer events
  websocketService.subscribe('customer.*', (event) => {
    eventBus.emit(event.type, event.payload);
  });

  // Notification events
  websocketService.subscribe('notification.*', (event) => {
    eventBus.emit(event.type, event.payload);
    
    if (event.type === 'notification.new') {
      notificationService.show(event.payload);
    }
  });

  // AI events
  websocketService.subscribe('ai.*', (event) => {
    eventBus.emit(event.type, event.payload);
  });
}
```

### 6. Cross-Module Communication Hooks

```typescript
// src/command-center/hooks/useCrossModule.ts

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventBus } from '../services/eventBus.service';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook for cross-module navigation and actions
 */
export function useCrossModule() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Navigate to customer and optionally open action
  const goToCustomer = useCallback((customerId: string, action?: 'call' | 'email' | 'activity') => {
    navigate(`/command-center/customers/${customerId}`);
    if (action) {
      // Emit event for customer page to handle
      setTimeout(() => {
        eventBus.emit('customer.action', { customerId, action });
      }, 100);
    }
  }, [navigate]);

  // Navigate to AI with a prompt
  const askAI = useCallback((prompt: string, context?: Record<string, any>) => {
    navigate('/command-center/ai');
    setTimeout(() => {
      eventBus.emit('ai.prefill', { prompt, context });
    }, 100);
  }, [navigate]);

  // Create content from any module
  const createContent = useCallback((type: string, initialData?: Record<string, any>) => {
    navigate('/command-center/content');
    setTimeout(() => {
      eventBus.emit('content.create', { type, data: initialData });
    }, 100);
  }, [navigate]);

  // Start campaign for customer segment
  const startCampaign = useCallback((audienceFilter?: Record<string, any>) => {
    navigate('/command-center/campaigns');
    setTimeout(() => {
      eventBus.emit('campaign.create', { audience: audienceFilter });
    }, 100);
  }, [navigate]);

  // Log activity for customer
  const logActivity = useCallback((customerId: string, type: string) => {
    eventBus.emit('activity.create', { customerId, type });
    toast({
      title: 'Activity Logged',
      description: 'The activity has been recorded.',
    });
  }, [toast]);

  return {
    goToCustomer,
    askAI,
    createContent,
    startCampaign,
    logActivity,
  };
}
```

---

## Acceptance Criteria

- [ ] All routes configured and working
- [ ] Lazy loading for all pages
- [ ] Auth guard protecting routes
- [ ] Providers properly nested
- [ ] Navigation config drives sidebar
- [ ] WebSocket events bridge to EventBus
- [ ] Cross-module hooks functional
- [ ] Deep linking works
- [ ] 404 handling

---

---

# CC-INT-02: Testing & Polish

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-INT-02 |
| Name | Testing & Polish |
| Phase | 4 - Integration |
| Dependencies | CC-INT-01 |
| Estimated Time | 4 hours |
| Agent Assignment | QA Lead |

---

## Purpose

Ensure quality across the entire Command Center through comprehensive testing, accessibility compliance, performance optimization, and final polish.

---

## Deliverables

### 1. Test Setup

```typescript
// src/command-center/test/setup.ts

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock fetch
global.fetch = vi.fn();
```

### 2. Integration Tests

```typescript
// src/command-center/test/integration/app.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandCenter } from '../index';
import { server } from '../test/mocks/server';
import { rest } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Command Center Integration', () => {
  it('redirects to login when not authenticated', async () => {
    render(<CommandCenter />);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('shows dashboard after login', async () => {
    const user = userEvent.setup();
    render(<CommandCenter />);

    // Fill login form
    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for dashboard
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  it('navigates between modules', async () => {
    const user = userEvent.setup();
    // Setup authenticated state
    render(<CommandCenter />);

    // Click on Customers
    await user.click(screen.getByText(/customers/i));
    await waitFor(() => {
      expect(screen.getByText(/manage your customer/i)).toBeInTheDocument();
    });

    // Click on AI Hub
    await user.click(screen.getByText(/ai hub/i));
    await waitFor(() => {
      expect(screen.getByText(/how can i help/i)).toBeInTheDocument();
    });
  });

  it('handles real-time updates', async () => {
    render(<CommandCenter />);
    
    // Simulate WebSocket message
    // Verify UI updates
  });
});
```

### 3. Accessibility Testing

```typescript
// src/command-center/test/a11y/accessibility.test.tsx

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CommandCenter } from '../index';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('Dashboard has no accessibility violations', async () => {
    const { container } = render(<CommandCenter />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Activities page has no accessibility violations', async () => {
    // Navigate to activities and test
  });

  it('AI Hub has no accessibility violations', async () => {
    // Navigate to AI hub and test
  });

  it('supports keyboard navigation', async () => {
    const { container } = render(<CommandCenter />);
    
    // Test tab navigation
    // Test arrow key navigation in menus
    // Test escape to close modals
  });

  it('has proper focus management', async () => {
    // Test focus trapping in modals
    // Test focus restoration after modal close
  });
});
```

### 4. Performance Testing

```typescript
// src/command-center/test/performance/perf.test.ts

import { measureRender, measureNavigation } from './utils';

describe('Performance', () => {
  it('initial load under 2 seconds', async () => {
    const metrics = await measureNavigation('/command-center');
    expect(metrics.domContentLoaded).toBeLessThan(2000);
  });

  it('dashboard renders under 500ms', async () => {
    const renderTime = await measureRender('Dashboard');
    expect(renderTime).toBeLessThan(500);
  });

  it('route transitions under 300ms', async () => {
    const transitionTime = await measureNavigation('/command-center/customers');
    expect(transitionTime).toBeLessThan(300);
  });

  it('handles 1000 activities without lag', async () => {
    // Load page with 1000 activities
    // Measure scroll performance
    // Measure filter performance
  });
});
```

### 5. E2E Test Scenarios

```typescript
// e2e/command-center.spec.ts (Playwright)

import { test, expect } from '@playwright/test';

test.describe('Command Center E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command-center/**');
  });

  test('complete customer interaction workflow', async ({ page }) => {
    // Navigate to customers
    await page.click('text=Customers');
    
    // Create new customer
    await page.click('text=Add Customer');
    await page.fill('[name="name"]', 'Test Customer');
    await page.fill('[name="email"]', 'customer@test.com');
    await page.click('text=Save');
    
    // Verify customer created
    await expect(page.locator('text=Test Customer')).toBeVisible();
    
    // Log activity
    await page.click('text=Test Customer');
    await page.click('text=Log Activity');
    await page.selectOption('[name="type"]', 'phone_call');
    await page.fill('[name="notes"]', 'Initial call');
    await page.click('text=Save Activity');
    
    // Verify activity in timeline
    await expect(page.locator('text=Initial call')).toBeVisible();
  });

  test('AI chat workflow', async ({ page }) => {
    await page.click('text=AI Hub');
    
    // Send message
    await page.fill('textarea', 'Help me write an email');
    await page.click('button[type="submit"]');
    
    // Wait for response
    await expect(page.locator('.ai-message')).toBeVisible({ timeout: 30000 });
  });

  test('campaign creation workflow', async ({ page }) => {
    await page.click('text=Campaigns');
    await page.click('text=New Campaign');
    
    // Complete wizard
    await page.click('text=Email');
    await page.click('text=Next');
    
    await page.click('text=EDU-001');
    await page.click('text=Next');
    
    // ... complete remaining steps
  });
});
```

### 6. Quality Checklist

```markdown
## Pre-Release Checklist

### Functionality
- [ ] All routes accessible
- [ ] Authentication flow complete
- [ ] CRUD operations for all entities
- [ ] Real-time updates working
- [ ] AI chat streaming
- [ ] File uploads
- [ ] Search functionality
- [ ] Filtering and sorting
- [ ] Pagination

### UI/UX
- [ ] Consistent styling across modules
- [ ] Dark mode complete
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Animations smooth
- [ ] No layout shift

### Accessibility
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] Form labels present
- [ ] Error messages announced

### Performance
- [ ] Initial load < 3s
- [ ] Route transitions < 500ms
- [ ] No memory leaks
- [ ] Images optimized
- [ ] Code split properly
- [ ] Bundle size reasonable

### Browser Support
- [ ] Chrome (latest 2)
- [ ] Firefox (latest 2)
- [ ] Safari (latest 2)
- [ ] Edge (latest 2)
- [ ] Mobile Safari
- [ ] Mobile Chrome
```

---

## Acceptance Criteria

- [ ] All unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] No accessibility violations
- [ ] Performance benchmarks met
- [ ] Browser compatibility verified
- [ ] Quality checklist complete
- [ ] Documentation updated

---

## Final Deliverables

When Phase 4 is complete:

1. Fully integrated Command Center application
2. Comprehensive test suite
3. Performance benchmarks documented
4. Accessibility audit report
5. Browser compatibility matrix
6. Deployment-ready bundle
