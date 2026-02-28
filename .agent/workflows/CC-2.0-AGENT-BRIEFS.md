# CC 2.0 — Agent Execution Briefs

**Platform:** Fibonacco Command Center Frontend Rebuild
**Tool:** Antigravity (AI Agent)
**Stack:** React 18 + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
**Fonts:** Inter (body/display), SF Mono/Fira Code (monospace)
**Theme:** Dual-mode (nexus-light / nexus-dark) via CSS custom properties
**Date:** February 28, 2026

---

## MASTER ARCHITECTURE DECISIONS

These decisions are **non-negotiable** across all agents. Every agent must follow these conventions exactly so all work composes into a single coherent application.

### 1. File Structure

```
src/
├── app/
│   ├── App.tsx                    # Root with providers
│   ├── AppRouter.tsx              # React Router v6 routes
│   └── layouts/
│       └── AppShell.tsx           # Sidebar + Header + main content area
├── components/
│   ├── ui/                        # shadcn/ui primitives (Button, Card, Input, Badge, etc.)
│   ├── shared/                    # Reusable composed components (see §SHARED below)
│   ├── navigation/                # NavigationRail, CommandPalette, UniversalHeader
│   ├── dashboard/                 # Dashboard-specific widgets
│   ├── crm/                       # CRM: Contacts, Customers, Deals, Activities
│   ├── billing/                   # Invoices, Collections, Orders, Payments
│   ├── learning/                  # Learning Center, Campaigns, Lessons
│   ├── content/                   # Articles, Events, Content Creation
│   ├── analytics/                 # Reports, Charts, Data Panels
│   ├── ai/                        # AI Assistant, Recommendations, Workflows
│   └── settings/                  # Profile, Business Profile, Integrations
├── hooks/                         # All custom hooks live here
│   ├── useAuth.ts
│   ├── useApi.ts
│   ├── useCrmData.ts
│   ├── useBillingData.ts
│   └── ...
├── services/
│   ├── api.ts                     # Axios instance + interceptors
│   ├── auth.ts                    # Auth service
│   └── types/                     # Shared TypeScript interfaces
│       ├── crm.types.ts
│       ├── billing.types.ts
│       ├── learning.types.ts
│       └── common.types.ts
├── stores/                        # Zustand stores
│   ├── authStore.ts
│   ├── navigationStore.ts
│   └── notificationStore.ts
├── contexts/
│   └── ThemeContext.tsx            # Existing — preserve as-is
├── lib/
│   └── utils.ts                   # cn() helper, formatCurrency, formatDate, etc.
└── data/
    ├── campaigns/                 # 60 campaign JSON files (REAL CONTENT — DO NOT MODIFY)
    ├── platform-config.ts         # Business types, service categories, etc.
    └── learning-content.ts        # Topic definitions, lesson data
```

### 2. Import Aliases

```json
// tsconfig.json paths
{
  "@/*": ["./src/*"],
  "@/components/*": ["./src/components/*"],
  "@/hooks/*": ["./src/hooks/*"],
  "@/services/*": ["./src/services/*"],
  "@/stores/*": ["./src/stores/*"],
  "@/lib/*": ["./src/lib/*"],
  "@/data/*": ["./src/data/*"],
  "@/types/*": ["./src/services/types/*"]
}
```

### 3. Design System Tokens — MANDATORY

All agents MUST use these tokens. No raw hex colors. No one-off Tailwind values.

```
BACKGROUNDS
  Page background:        bg-[var(--nexus-bg-page)]
  Card background:        bg-[var(--nexus-card-bg)]
  Card hover:             hover:bg-[var(--nexus-card-bg-hover)]
  Section background:     bg-[var(--nexus-bg-secondary)]
  Input background:       bg-[var(--nexus-input-bg)]
  Nav background:         bg-[var(--nexus-nav-bg)]

TEXT
  Primary text:           text-[var(--nexus-text-primary)]
  Secondary text:         text-[var(--nexus-text-secondary)]
  Tertiary/muted text:    text-[var(--nexus-text-tertiary)]
  Disabled text:          text-[var(--nexus-text-disabled)]

ACCENT COLORS
  Primary blue:           text-[var(--nexus-accent-primary)]     / bg-blue-500
  Success green:          text-[var(--nexus-accent-success)]     / bg-emerald-500
  Warning amber:          text-[var(--nexus-accent-warning)]     / bg-amber-500
  Danger red:             text-[var(--nexus-accent-danger)]      / bg-red-500
  Purple:                 text-[var(--nexus-accent-purple)]      / bg-purple-500

BORDERS & SHADOWS
  Card border:            border border-[var(--nexus-card-border)]
  Card shadow:            shadow-[var(--nexus-card-shadow)]
  Elevation levels:       shadow-[var(--nexus-elevation-1)] through shadow-[var(--nexus-elevation-5)]
  Divider:                border-[var(--nexus-divider)]

INTERACTIVE
  Button primary:         bg-[var(--nexus-button-bg)] text-[var(--nexus-button-text)]
  Button hover:           hover:bg-[var(--nexus-button-hover)]
  Nav active item:        bg-[var(--nexus-nav-active)] border-l-2 border-[var(--nexus-nav-active-border)]

TRANSITIONS
  Fast (hover, focus):    transition-all duration-150 ease-in-out
  Base (expand/collapse): transition-all duration-250 ease-in-out
  Slow (page transitions):transition-all duration-350 ease-in-out
```

### 4. Shared Component Library

Every agent must use these shared components instead of building one-off versions. Agent 0 creates these; all other agents consume them.

```tsx
// SHARED COMPONENTS — src/components/shared/

// PageHeader — consistent page titles across all views
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;       // Right-aligned action buttons
  breadcrumbs?: { label: string; href?: string }[];
  icon?: LucideIcon;
}

// DataCard — standard card wrapper used EVERYWHERE
interface DataCardProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  headerAction?: React.ReactNode;  // Top-right of card header
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  noPadding?: boolean;
}
// Implementation: shadcn Card + standard padding + loading/empty states
// Card: rounded-xl border border-[var(--nexus-card-border)] bg-[var(--nexus-card-bg)]
//        shadow-[var(--nexus-card-shadow)] hover:shadow-[var(--nexus-card-shadow-hover)]
//        transition-shadow duration-200

// MetricCard — KPI display tile
interface MetricCardProps {
  label: string;
  value: string | number;
  change?: { value: number; direction: 'up' | 'down' | 'flat' };
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  trend?: number[];                // Sparkline data
  isLoading?: boolean;
}

// StatusBadge — consistent status indicators
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'overdue' | 'draft' | 'archived';
  size?: 'sm' | 'md';
}
// Maps: active→green, pending→amber, overdue→red, completed→blue, etc.

// DataTable — reusable sortable/filterable table
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  actions?: (row: T) => React.ReactNode;
}
// Implementation: Tailwind table with sticky header, hover rows, sort indicators
// Header: bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-secondary)] text-xs uppercase tracking-wider
// Rows:   hover:bg-[var(--nexus-card-bg-hover)] cursor-pointer transition-colors
// Borders: divide-y divide-[var(--nexus-divider)]

// EmptyState — consistent empty views
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

// LoadingState — skeleton loading
interface LoadingStateProps {
  variant: 'card' | 'table' | 'list' | 'detail' | 'metric';
  count?: number;
}
// Uses Tailwind animate-pulse with rounded rectangles matching target layout

// ConfirmDialog — modal confirmation
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  isLoading?: boolean;
}

// SearchInput — debounced search field
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;              // Default: 300
  className?: string;
}

// AvatarInitials — user/business avatar
interface AvatarInitialsProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';       // 8/10/12 (32px/40px/48px)
  color?: string;                   // Deterministic from name hash
}

// TabNav — tab navigation within pages
interface TabNavProps {
  tabs: { id: string; label: string; icon?: LucideIcon; count?: number }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
// Style: bottom border tabs, active = blue underline + blue text, inactive = muted text
```

### 5. API Service Pattern — MANDATORY

Every data-fetching hook must use this exact pattern:

```tsx
// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.fibonacco.com/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
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
      window.location.href = '/login';
    }
    return Promise.reject({
      message: error.response?.data?.message || 'An error occurred',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || {},
    });
  }
);
```

### 6. Custom Hook Pattern — MANDATORY

```tsx
// Every data hook follows this shape:
interface UseDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Example:
export function useCustomers(): UseDataReturn<Customer[]> {
  const [data, setData] = useState<Customer[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/customers');
      setData(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
```

### 7. Routing Map

```tsx
// src/app/AppRouter.tsx
const routes = {
  '/':                         Dashboard,
  '/login':                    LoginPage,

  // Six Verbs Navigation
  '/define':                   BusinessProfilePage,
  '/define/profile':           BusinessProfileEdit,
  '/define/survey':            BusinessSurveyPage,
  '/define/faq':               FAQBuilderPage,

  '/attract':                  MarketingDiagnosticWizard,
  '/attract/campaigns':        CampaignBuilderPage,
  '/attract/content':          ContentManagerDashboard,
  '/attract/articles':         ArticlesPage,
  '/attract/events':           EventsPage,

  '/sell':                     PipelinePage,
  '/sell/deals/:id':           DealDetailPage,
  '/sell/proposals':           QuotesListPage,
  '/sell/proposals/:id':       ProposalDetailPage,

  '/deliver':                  ServicesDashboard,
  '/deliver/services':         ServiceManagementPage,
  '/deliver/orders':           OrderHistoryPage,

  '/measure':                  PerformanceDashboard,
  '/measure/reports':          MarketingReportPage,
  '/measure/analytics':        DataReportPanel,

  '/automate':                 AIWorkflowPage,
  '/automate/employees':       AIEmployeeConfigurationPage,
  '/automate/processes':       ProcessBuilderPage,

  // CRM
  '/crm/customers':            CustomersListPage,
  '/crm/customers/:id':        CustomerDetailPage,
  '/crm/contacts':             ContactsListPage,
  '/crm/contacts/:id':         ContactDetailPage,
  '/crm/activities':           ActivitiesPage,

  // Billing
  '/billing':                  BillingDashboard,
  '/billing/invoices':         InvoicesListPage,
  '/billing/invoices/:id':     InvoiceDetailPage,
  '/billing/collections':      CollectionsDashboard,

  // Learning Center
  '/learn':                    LearningCenterHub,
  '/learn/topics':             LearningTopicsPage,
  '/learn/topics/:topicId':    LearningLessonPage,
  '/learn/:campaignSlug':      CampaignLandingPage,     // NEW — renders campaign JSON

  // Platforms
  '/platforms':                PlatformsHub,

  // Settings
  '/settings':                 ProfilePage,
  '/settings/team':            TeamUsersPage,
  '/settings/integrations':    IntegrationsPage,
  '/settings/notifications':   NotificationsPage,
  '/settings/billing':         BillingDashboard,
};
```

---

## AGENT 0: DESIGN SYSTEM FOUNDATION

**Priority:** FIRST — all other agents depend on this
**Estimated effort:** 2–3 days
**Dependencies:** None
**Outputs consumed by:** Every other agent

### Objective

Create the shared component library, utility functions, and design tokens that every other agent imports. Nothing else ships until Agent 0's work is merged.

### Task List

#### 0.1 — Utility Library (`src/lib/utils.ts`)

Create this file with these exact exports:

```tsx
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merge helper — used by every component
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatting — used by billing, CRM, dashboard
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

// Date formatting — used everywhere
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = new Date(date);
  if (format === 'relative') {
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Initials from name — used by AvatarInitials
export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Deterministic color from string — used for avatar backgrounds
export function getColorFromString(str: string): string {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// Percentage formatting
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

// Phone number formatting
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
  return phone;
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
```

#### 0.2 — shadcn/ui Component Installation

Install and configure these shadcn/ui components. Use the `new-york` style variant for all. The theme must respect the CSS custom properties already defined in `index.css`.

**Required components:**
- `button` — Primary, Secondary, Ghost, Outline, Destructive variants
- `card` — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `input` — Standard text input
- `badge` — Default, Secondary, Outline, Destructive variants + custom status colors
- `dialog` — For modals and confirmations
- `dropdown-menu` — For action menus
- `select` — For dropdowns
- `tabs` — For in-page tab navigation
- `tooltip` — For icon-only buttons
- `separator` — For dividers
- `avatar` — For user avatars
- `progress` — For progress bars
- `skeleton` — For loading states
- `sheet` — For slide-over panels
- `command` — For Command Palette (Cmd+K)
- `popover` — For filter dropdowns
- `calendar` — For date picking
- `textarea` — For multi-line input
- `switch` — For toggles
- `table` — For data tables (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)
- `scroll-area` — For scrollable regions

**shadcn theme configuration:**
Map the CSS custom properties to shadcn's expected CSS variables. In `globals.css` or `index.css`, ensure shadcn's color tokens reference the existing `--nexus-*` variables:

```css
@layer base {
  :root {
    --background: var(--nexus-bg-page);
    --foreground: var(--nexus-text-primary);
    --card: var(--nexus-card-bg);
    --card-foreground: var(--nexus-text-primary);
    --popover: var(--nexus-card-bg);
    --popover-foreground: var(--nexus-text-primary);
    --primary: var(--nexus-accent-primary);
    --primary-foreground: #ffffff;
    --secondary: var(--nexus-bg-secondary);
    --secondary-foreground: var(--nexus-text-primary);
    --muted: var(--nexus-bg-tertiary);
    --muted-foreground: var(--nexus-text-tertiary);
    --accent: var(--nexus-nav-active);
    --accent-foreground: var(--nexus-accent-primary);
    --destructive: var(--nexus-accent-danger);
    --destructive-foreground: #ffffff;
    --border: var(--nexus-card-border);
    --input: var(--nexus-input-border);
    --ring: var(--nexus-accent-primary);
    --radius: 0.75rem;
  }
}
```

#### 0.3 — Build Every Shared Component

Create each component listed in §4 above. Exact files:

```
src/components/shared/PageHeader.tsx
src/components/shared/DataCard.tsx
src/components/shared/MetricCard.tsx
src/components/shared/StatusBadge.tsx
src/components/shared/DataTable.tsx
src/components/shared/EmptyState.tsx
src/components/shared/LoadingState.tsx
src/components/shared/ConfirmDialog.tsx
src/components/shared/SearchInput.tsx
src/components/shared/AvatarInitials.tsx
src/components/shared/TabNav.tsx
src/components/shared/index.ts           // barrel export
```

**UI Design Rules for Shared Components:**

**DataCard implementation detail:**
```tsx
export function DataCard({ title, subtitle, icon: Icon, headerAction, children, className, isLoading, isEmpty, emptyMessage, noPadding }: DataCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-[var(--nexus-card-border)] bg-[var(--nexus-card-bg)]",
      "shadow-[var(--nexus-card-shadow)] hover:shadow-[var(--nexus-card-shadow-hover)]",
      "transition-shadow duration-200",
      className
    )}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--nexus-divider)]">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-[var(--nexus-accent-primary)]" />}
            <div>
              <h3 className="text-sm font-semibold text-[var(--nexus-text-primary)]">{title}</h3>
              {subtitle && <p className="text-xs text-[var(--nexus-text-tertiary)] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerAction}
        </div>
      )}
      <div className={cn(!noPadding && "p-6")}>
        {isLoading ? <LoadingState variant="card" /> :
         isEmpty ? <EmptyState title={emptyMessage || 'No data'} /> :
         children}
      </div>
    </div>
  );
}
```

**MetricCard implementation detail:**
```tsx
// MetricCard: 4 sizes of colored accent bar on left edge
// Layout: Icon top-left, label below, large value, change indicator bottom
// Colors map: blue→blue-500, green→emerald-500, amber→amber-500, red→red-500, purple→purple-500
// Change indicator: ▲ green for up, ▼ red for down, — gray for flat
// Sparkline: optional tiny line chart (recharts Sparkline or custom SVG path)
// Loading state: skeleton with same dimensions
```

**DataTable implementation detail:**
```tsx
// Table wrapper: rounded-xl border overflow-hidden
// Header row: bg-[var(--nexus-bg-secondary)] sticky top-0 z-10
// Header cells: text-xs font-medium uppercase tracking-wider text-[var(--nexus-text-tertiary)] px-4 py-3
// Sort indicator: ChevronUp/ChevronDown icons, active = text-[var(--nexus-accent-primary)]
// Body rows: divide-y divide-[var(--nexus-divider)]
// Row hover: hover:bg-[var(--nexus-card-bg-hover)] transition-colors cursor-pointer (if onRowClick)
// Body cells: px-4 py-3 text-sm text-[var(--nexus-text-primary)]
// Pagination: flex justify-between items-center px-4 py-3 border-t
//   "Showing 1-10 of 47" left, Previous/Next buttons right
// Search: SearchInput above table with border-b separator
// Empty: EmptyState centered in table body area
// Loading: 5 skeleton rows matching column widths
```

**StatusBadge color map:**
```
active     → bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400
inactive   → bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400
pending    → bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400
completed  → bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400
cancelled  → bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500
overdue    → bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400
draft      → bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400
archived   → bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600
```

#### 0.4 — Verification Checklist

Before merging Agent 0's work, verify:

- [ ] Every shared component renders correctly in both `nexus-light` and `nexus-dark` themes
- [ ] `cn()` utility correctly merges conflicting Tailwind classes
- [ ] DataTable sorts columns ascending/descending on header click
- [ ] DataTable pagination shows correct page counts
- [ ] LoadingState skeleton dimensions match each variant's real layout
- [ ] MetricCard change indicator shows correct arrow direction and color
- [ ] StatusBadge renders all 8 statuses with correct colors in both themes
- [ ] All shadcn components respect the CSS custom property theme mapping
- [ ] No raw hex colors anywhere — only CSS variables or Tailwind utilities
- [ ] Barrel export in `index.ts` re-exports all shared components

---

## AGENT 1: INFRASTRUCTURE FOUNDATION

**Priority:** FIRST (parallel with Agent 0)
**Estimated effort:** 3–4 days
**Dependencies:** Agent 0 (shared components)
**Outputs consumed by:** Every other agent

### Objective

Wire up routing, authentication, global state, and the API service layer. After Agent 1 is done, every page has a URL, there's an auth context wrapping the app, and every other agent can call `apiClient.get()` to fetch data.

### Task List

#### 1.1 — API Service Layer (`src/services/api.ts`)

Create exactly as specified in §5 of Master Architecture above. Additionally create:

```tsx
// src/services/types/common.types.ts
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    per_page: number;
    last_page: number;
  };
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  search?: string;
}
```

#### 1.2 — Auth Store and Context

```tsx
// src/stores/authStore.ts — Zustand store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  business_id: string;
  business_name: string;
  role: 'owner' | 'admin' | 'member';
  avatar_url?: string;
  subscription_tier: 'free' | 'influencer' | 'expert' | 'sponsor';
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
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false });
          throw new Error('Login failed');
        }
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
    }),
    { name: 'fibonacco-auth' }
  )
);
```

#### 1.3 — Protected Route Wrapper

```tsx
// src/app/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

#### 1.4 — Navigation Store

```tsx
// src/stores/navigationStore.ts
import { create } from 'zustand';

interface NavigationState {
  isSidebarCollapsed: boolean;
  isCommandPaletteOpen: boolean;
  currentSection: string;       // 'define' | 'attract' | 'sell' | 'deliver' | 'measure' | 'automate'
  toggleSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  setCurrentSection: (section: string) => void;
}
```

#### 1.5 — AppRouter Implementation

Convert the current single-route `activeView` state switching to React Router v6 with the full route map from §7 above.

**Current state (REPLACE THIS):**
```tsx
// Dashboard.tsx currently does:
const [activeView, setActiveView] = useState('dashboard');
switch(activeView) {
  case 'platforms': return <PlatformsHub />;
  case 'content': return <LearningTopicsPage />;
  // ... etc
}
```

**Target state:**
```tsx
// src/app/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from './layouts/AppShell';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="define/*" element={/* nested routes */} />
          <Route path="attract/*" element={/* nested routes */} />
          {/* ... all routes from §7 */}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### 1.6 — NavigationRail Refactor

**Current state:** NavigationRail uses `setActiveView(string)` prop.
**Target state:** NavigationRail uses `react-router-dom`'s `useNavigate()` and `useLocation()` to determine active state.

Refactor NavigationRail to:
- Use `<NavLink>` or `useNavigate()` instead of `setActiveView`
- Organize nav items under Six Verbs sections with collapsible groups
- Highlight active section and active page independently

**Navigation structure:**

```
DASHBOARD (home icon)

DEFINE
  ├── Business Profile
  ├── Survey
  └── FAQ

ATTRACT
  ├── Marketing Diagnostic
  ├── Campaigns
  ├── Content
  ├── Articles
  └── Events

SELL
  ├── Pipeline
  ├── Proposals
  └── Deals

DELIVER
  ├── Services
  └── Orders

MEASURE
  ├── Performance
  ├── Reports
  └── Analytics

AUTOMATE
  ├── AI Workflows
  ├── AI Employees
  └── Processes

CRM (section divider)
  ├── Customers
  ├── Contacts
  └── Activities

LEARN (section divider)
  └── Learning Center

SETTINGS (bottom-pinned)
  ├── Profile
  ├── Team
  ├── Integrations
  └── Billing
```

**Visual design for NavigationRail:**
- Width: 256px expanded, 64px collapsed (icons only)
- Background: bg-[var(--nexus-nav-bg)]
- Border right: border-r border-[var(--nexus-nav-border)]
- Shadow: shadow-[var(--nexus-nav-shadow)]
- Section headers: text-[10px] uppercase tracking-widest font-semibold text-[var(--nexus-text-tertiary)] px-4 py-2
- Nav items: flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 text-sm font-medium
- Active: bg-[var(--nexus-nav-active)] text-[var(--nexus-accent-primary)] border-l-2 border-[var(--nexus-nav-active-border)]
- Hover: hover:bg-[var(--nexus-bg-secondary)]
- Icon size: w-5 h-5
- Collapse animation: width transition 300ms ease with Framer Motion
- Collapse button: chevron icon at bottom of rail
- Six Verbs sections: collapsible with smooth height animation

#### 1.7 — AppShell Layout

Refactor `AppShell.tsx` to use `<Outlet />` from React Router:

```tsx
import { Outlet } from 'react-router-dom';
import { NavigationRail } from '@/components/navigation/NavigationRail';
import { UniversalHeader } from '@/components/navigation/UniversalHeader';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAuthStore } from '@/stores/authStore';

export function AppShell() {
  const { isSidebarCollapsed } = useNavigationStore();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[var(--nexus-bg-page)] flex">
      <NavigationRail />
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        isSidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <UniversalHeader user={user} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
```

#### 1.8 — LoginPage Refactor

Current `LoginPage.tsx` is UI-only. Wire it to the auth store:

- Form submission calls `useAuthStore().login(email, password)`
- Error state displays below form
- Success redirects to `/` via `useNavigate()`
- "Remember me" checkbox stores email in localStorage
- Loading state disables submit button with spinner

**Visual design:**
- Centered card on page with bg-[var(--nexus-bg-page)] behind
- Card: max-w-md mx-auto, standard DataCard styling
- Fibonacco logo above card
- Email + Password inputs using shadcn Input
- Blue primary Button full-width for submit
- Subtle gradient accent on card top border (2px blue-to-purple)

#### 1.9 — Verification Checklist

- [ ] Every route in §7 renders its target component
- [ ] 404 redirects to `/`
- [ ] Unauthenticated users redirect to `/login`
- [ ] Login form submits and stores token in Zustand
- [ ] Token persists across page refresh (Zustand persist)
- [ ] API interceptor attaches token to requests
- [ ] 401 response triggers logout and redirect
- [ ] NavigationRail highlights correct section/item based on URL
- [ ] NavigationRail collapse/expand animates smoothly
- [ ] AppShell content area scrolls independently from nav
- [ ] Cmd+K opens CommandPalette from any page
- [ ] Browser back/forward navigation works correctly
- [ ] Deep linking works (e.g., `/crm/customers/123` loads directly)

---

## AGENT 2: CRM DATA INTEGRATION

**Priority:** After Agent 0 + 1
**Estimated effort:** 4–5 days
**Dependencies:** Agent 0 (shared components), Agent 1 (api service, routing, auth)
**Files to modify:** 8 files with placeholder data

### Objective

Replace all fabricated CRM records ("John Doe", "Acme Corp") with live API hooks. These 8 components become data-driven while preserving their existing layout.

### Target Files and Exact Changes

#### 2.1 — Type Definitions (`src/services/types/crm.types.ts`)

```tsx
export interface Customer {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'prospect' | 'churned';
  subscription_tier: 'free' | 'influencer' | 'expert' | 'sponsor';
  community: string;
  created_at: string;
  last_activity_at: string;
  lifetime_value: number;
  health_score: number;
  tags: string[];
  assigned_am: string;             // AI Account Manager name
}

export interface Contact {
  id: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  is_primary: boolean;
  created_at: string;
}

export interface Deal {
  id: string;
  customer_id: string;
  title: string;
  value: number;
  stage: 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close_date: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  notes: string;
  services: string[];              // Service IDs from catalog
}

export interface Activity {
  id: string;
  customer_id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'sms';
  subject: string;
  description: string;
  status: 'completed' | 'pending' | 'overdue' | 'cancelled';
  due_date?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
}
```

#### 2.2 — CRM Hooks (`src/hooks/useCrmData.ts`)

```tsx
// Create these hooks following the pattern from §6:
export function useCustomers(params?: PaginationParams): UseDataReturn<Customer[]> { ... }
export function useCustomer(id: string): UseDataReturn<Customer> { ... }
export function useContacts(params?: PaginationParams): UseDataReturn<Contact[]> { ... }
export function useContact(id: string): UseDataReturn<Contact> { ... }
export function useDeals(params?: PaginationParams): UseDataReturn<Deal[]> { ... }
export function useDeal(id: string): UseDataReturn<Deal> { ... }
export function useActivities(params?: PaginationParams & { customer_id?: string }): UseDataReturn<Activity[]> { ... }

// API endpoints:
// GET /customers              → list with pagination
// GET /customers/:id          → single customer detail
// GET /contacts               → list with pagination
// GET /contacts/:id           → single contact
// GET /deals                  → list with pagination
// GET /deals/:id              → single deal
// GET /activities             → list with pagination, filterable by customer_id
// POST /customers             → create customer
// PUT /customers/:id          → update customer
// POST /activities            → create activity
// PUT /activities/:id         → update activity
```

#### 2.3 — CustomersListPage.tsx (183 lines)

**Current problem:** Contains inline array `const customers = [{ name: 'Acme Corp'... }]`

**Action:**
1. Remove the inline `customers` array entirely
2. Import `useCustomers` hook
3. Import shared components: `DataTable`, `PageHeader`, `StatusBadge`, `SearchInput`, `AvatarInitials`
4. Wire DataTable columns to Customer type

**Column definitions:**
```tsx
const columns: ColumnDef<Customer>[] = [
  {
    header: 'Business',
    accessorKey: 'business_name',
    cell: (row) => (
      <div className="flex items-center gap-3">
        <AvatarInitials name={row.business_name} size="sm" />
        <div>
          <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{row.business_name}</p>
          <p className="text-xs text-[var(--nexus-text-tertiary)]">{row.contact_name}</p>
        </div>
      </div>
    ),
  },
  { header: 'Community', accessorKey: 'community' },
  { header: 'Tier', accessorKey: 'subscription_tier',
    cell: (row) => <Badge variant="outline">{row.subscription_tier}</Badge> },
  { header: 'Health', accessorKey: 'health_score',
    cell: (row) => <HealthScoreBar score={row.health_score} /> },
  { header: 'Status', accessorKey: 'status',
    cell: (row) => <StatusBadge status={row.status} /> },
  { header: 'Last Activity', accessorKey: 'last_activity_at',
    cell: (row) => formatDate(row.last_activity_at, 'relative') },
];
```

**Page layout:**
```
PageHeader: "Customers" + subtitle "Manage your customer relationships"
  actions: [+ New Customer] button (blue primary)

Filter bar: SearchInput + StatusFilter dropdown + TierFilter dropdown

DataTable with columns above
  onRowClick → navigate(`/crm/customers/${row.id}`)
  pagination enabled, pageSize=20
```

#### 2.4 — CustomerDetailPage.tsx (526 lines)

**Current problem:** Contains `John Doe`, `Acme Corp` hardcoded throughout. Has 3 mock data hits.

**Action:**
1. Extract customer ID from URL: `const { id } = useParams()`
2. Use `useCustomer(id)` hook for main data
3. Use `useActivities({ customer_id: id })` for activity feed
4. Use `useDeals({ customer_id: id })` for deals section
5. Remove all inline fake data

**Page layout (keep existing general structure but standardize):**
```
PageHeader: customer.business_name + "Back to Customers" breadcrumb
  actions: [Edit] [Delete] [Add Activity]

Two-column layout (lg:grid-cols-3):

LEFT (col-span-2):
  DataCard "Overview"
    - Contact info grid (name, email, phone, role)
    - Tags
    - Assigned Account Manager

  DataCard "Deals" (deals table with stage pipeline indicator)

  DataCard "Activity Timeline"
    - Vertical timeline of activities
    - Each: icon by type, subject, description, timestamp
    - "Log Activity" button at top

RIGHT (col-span-1):
  DataCard "Health Score" — circular progress indicator + score
  DataCard "Subscription" — tier badge + renewal date
  DataCard "Quick Stats" — MetricCards for lifetime value, open deals, activities
```

#### 2.5 — ContactsListPage.tsx (151 lines)

Same pattern as CustomersListPage. Replace inline contacts array with `useContacts()` hook + DataTable. Columns: Name (avatar+name), Email, Phone, Company (linked to customer), Role, Primary badge.

#### 2.6 — ContactDetailPage.tsx (varies)

Extract ID from URL, use `useContact(id)`, display detail view with associated customer link and activity history.

#### 2.7 — DealDetailPage.tsx (352 lines)

**Current problem:** 2 mock data hits. Fake deal data.

**Action:** Use `useDeal(id)` hook. Display:
- Deal header with value, stage badge, probability
- Stage pipeline visualization (horizontal steps with current highlighted)
- Associated customer link
- Service items from deal
- Activity timeline
- Notes section

#### 2.8 — ActivitiesPage.tsx (416 lines)

**Current problem:** 3 mock data hits. Fake activity records.

**Action:** Use `useActivities()` hook. Display with:
- Filter tabs: All | Calls | Emails | Meetings | Tasks | Overdue
- DataTable with type icon, subject, customer link, status badge, due date
- Quick-add activity button

#### 2.9 — B2BDashboard.tsx (386 lines)

**Current problem:** 3 mock data hits. Fake KPIs.

**Action:** Create `useDashboardMetrics()` hook calling `GET /dashboard/metrics`. Display:
- MetricCard row: Total Customers, Active Deals Value, Monthly Revenue, Health Score Avg
- Pipeline chart (recharts BarChart by stage)
- Recent activities list (last 10)
- Top customers table (top 5 by revenue)

#### 2.10 — UserProfile.tsx (97 lines)

**Current problem:** "John Doe" hardcoded.

**Action:** Use `useAuthStore()` to get current user data. Display user name, email, role, avatar from auth state.

#### 2.11 — Verification Checklist

- [ ] All 8 files compile with zero inline mock data
- [ ] CustomersListPage sorts by any column
- [ ] CustomerDetailPage loads via deep link `/crm/customers/abc123`
- [ ] Activities filter tabs work correctly
- [ ] DataTable pagination works across all list pages
- [ ] Loading states show skeletons matching final layout
- [ ] Empty states show when API returns zero records
- [ ] Error states display with retry button
- [ ] StatusBadge colors are consistent across all CRM views
- [ ] AvatarInitials generate deterministic colors

---

## AGENT 3: BILLING & FINANCIAL INTEGRATION

**Priority:** After Agent 0 + 1
**Estimated effort:** 3–4 days
**Dependencies:** Agent 0 (shared components), Agent 1 (api, routing)
**Files to modify:** 7 files with placeholder data

### Target Files

#### 3.1 — Type Definitions (`src/services/types/billing.types.ts`)

```tsx
export interface Invoice {
  id: string;
  invoice_number: string;          // e.g., "INV-2026-0142"
  customer_id: string;
  customer_name: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_date?: string;
  items: InvoiceItem[];
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  service_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  created_at: string;
}

export interface Collection {
  id: string;
  invoice_id: string;
  customer_name: string;
  amount_due: number;
  days_overdue: number;
  last_contact_date: string;
  next_action: string;
  status: 'active' | 'resolved' | 'escalated' | 'written_off';
}
```

#### 3.2 — Billing Hooks (`src/hooks/useBillingData.ts`)

```tsx
export function useInvoices(params?: PaginationParams): UseDataReturn<Invoice[]> { ... }
export function useInvoice(id: string): UseDataReturn<Invoice> { ... }
export function useOrders(params?: PaginationParams): UseDataReturn<Order[]> { ... }
export function useCollections(params?: PaginationParams): UseDataReturn<Collection[]> { ... }
export function useBillingMetrics(): UseDataReturn<BillingMetrics> { ... }

// API endpoints:
// GET /billing/invoices          → paginated list
// GET /billing/invoices/:id      → single invoice
// GET /billing/orders            → paginated list
// GET /billing/collections       → overdue accounts
// GET /billing/metrics           → summary KPIs
```

#### 3.3 — InvoicesListPage.tsx (370 lines) — HIGHEST MOCK COUNT (15 hits)

**Current problem:** 15 mock data hits. Extensive fake invoice records with INV-0142, INV-0151, etc.

**Action:**
1. Delete ALL inline invoice arrays
2. Use `useInvoices()` hook
3. Rebuild using DataTable + StatusBadge + shared components

**Page layout:**
```
PageHeader: "Invoices" + [+ New Invoice] button
  
Filter bar: SearchInput + StatusFilter (All/Draft/Sent/Paid/Overdue) + DateRange

DataTable columns:
  Invoice #   | customer_name | amount (formatCurrency) | status (StatusBadge) | due_date | actions (⋯ menu)

onRowClick → navigate(`/billing/invoices/${id}`)
```

#### 3.4 — InvoiceDetailPage.tsx

Use `useInvoice(id)`. Display invoice header, line items table, payment status, payment actions.

#### 3.5 — CollectionsDashboard.tsx (256 lines, 4 hits)

Use `useCollections()`. Display:
- MetricCard row: Total Overdue, Average Days, At Risk Amount, Resolved This Month
- DataTable of overdue accounts sorted by days_overdue descending
- Each row: customer name, amount, days overdue (color-coded), last contact, next action, status

#### 3.6 — OrderHistoryPage.tsx (147 lines, 1 hit)

Use `useOrders()`. Standard DataTable with order number, customer, total, status, date.

#### 3.7 — CreateInvoiceModal.tsx (1 hit)

Wire form submission to `POST /billing/invoices`. Keep existing form layout but connect to API.

#### 3.8 — Verification Checklist

- [ ] InvoicesListPage: zero inline data, sorts/filters work, pagination works
- [ ] Invoice amounts display with `formatCurrency()`
- [ ] Overdue invoices show red StatusBadge
- [ ] CollectionsDashboard sorts by days overdue
- [ ] CreateInvoiceModal submits to API and refreshes list
- [ ] All currency values right-aligned in tables

---

## AGENT 4: DASHBOARD & ANALYTICS

**Priority:** After Agent 0 + 1
**Estimated effort:** 3–4 days
**Dependencies:** Agent 0, Agent 1
**Files to modify:** 5 files

### Target Files

#### 4.1 — CentralCommandDashboard.tsx (739 lines, 6 hits — MOCK_GOALS)

**Current problem:** `MOCK_GOALS` array at line 11 with fake goals. Also "John Doe" in profile dropdown and fake email/message/task data in quick access cards.

**Action:**
1. Delete `MOCK_GOALS` constant entirely
2. Create `useGoals()` hook → `GET /dashboard/goals`
3. Replace "John Doe" with `useAuthStore().user.name`
4. Replace quick access card data with hooks to respective endpoints
5. Import shared MetricCard, DataCard, LoadingState

**Goal interface:**
```tsx
interface Goal {
  id: string;
  title: string;
  progress: number;        // 0-100
  target: string;          // Display string like "$500K" or "12/20 Clients"
  color: string;           // Tailwind class like 'bg-emerald-500'
  due_date: string;
}
```

**Quick Access Cards** — each one gets a mini-hook:
```
Tasks    → useRecentTasks()     → GET /tasks?limit=3&status=pending
Email    → useRecentEmails()    → GET /email/inbox?limit=3
Messages → useRecentMessages()  → GET /messages?limit=3
Calendar → useUpcomingEvents()  → GET /calendar/upcoming?limit=3
```

#### 4.2 — DataReportPanel.tsx (306 lines, 10 hits — HIGHEST for analytics)

**Current problem:** `mockData` explicitly named, fake chart datasets, fake metrics.

**Action:**
1. Delete all `mockData` constants
2. Create `useReportData(reportType: string)` hook → `GET /reports/:type`
3. Use recharts for all charts (already in project dependencies)
4. Display loading skeletons matching chart dimensions

**Chart types to support:**
- Line chart (trends over time)
- Bar chart (comparisons)
- Pie/donut chart (distributions)
- Area chart (cumulative metrics)

**Each chart wrapped in DataCard with:**
- Title + time period selector (7d / 30d / 90d / 1y)
- Export button (CSV)
- Full-screen expand button

#### 4.3 — DataReportCall.tsx (1 hit)

Wire to report API. Replace fake data with `useReportData()`.

#### 4.4 — MarketingReportPage.tsx (1 hit)

Wire to `GET /reports/marketing`. Display campaign performance metrics, content engagement, lead generation stats.

#### 4.5 — NotificationsPage.tsx (384 lines, 1 hit)

**Action:**
1. Create `useNotifications()` hook → `GET /notifications`
2. Replace inline data
3. Group by date (Today, Yesterday, This Week, Earlier)
4. Each notification: icon by type, title, description, timestamp, read/unread state
5. Mark as read on click, mark all as read button

#### 4.6 — Verification Checklist

- [ ] CentralCommandDashboard loads with real goals from API
- [ ] User profile shows authenticated user's name and initials
- [ ] DataReportPanel charts render with loading skeletons
- [ ] Time period selector changes chart data
- [ ] Notifications group correctly by date
- [ ] All charts use theme-aware colors (not hardcoded)
- [ ] Charts are responsive (resize with container)

---

## AGENT 5: LEARNING CENTER & CAMPAIGN WIRING

**Priority:** After Agent 0 + 1
**Estimated effort:** 4–5 days
**Dependencies:** Agent 0, Agent 1
**Files to modify:** 3 existing + create new CampaignRenderer

### Objective

Wire the 60 existing campaign JSON files to a new CampaignRenderer component so the Learning Center can display real campaign content at `/learn/:campaignSlug`. This is NOT about replacing mock data — it's about connecting real content that exists but isn't wired to the UI yet.

### Task List

#### 5.1 — Campaign Data Loader (`src/data/campaigns/index.ts`)

```tsx
// Dynamic import all 60 campaign JSON files
// The JSON files are at: /campaign_EDU-001.json through campaign_HOWTO-030.json
// Plus: landing_pages_master.json (registry of all 60)

import landingPages from './landing_pages_master.json';

export interface CampaignRegistry {
  campaigns: CampaignEntry[];
}

export interface CampaignEntry {
  campaign_id: string;
  type: 'EDU' | 'HOOK' | 'HOWTO';
  title: string;
  slug: string;
  week: number;
  day: number;
}

export async function loadCampaign(campaignId: string): Promise<CampaignData> {
  // Dynamic import based on ID
  const module = await import(`./${campaignId}.json`);
  return module.default;
}

export function getCampaignBySlug(slug: string): CampaignEntry | undefined {
  return landingPages.campaigns.find(c => c.slug === slug);
}

export function getCampaignsByType(type: 'EDU' | 'HOOK' | 'HOWTO'): CampaignEntry[] {
  return landingPages.campaigns.filter(c => c.type === type);
}
```

#### 5.2 — Campaign Types (`src/services/types/learning.types.ts`)

Define types matching the actual JSON structure (from campaign_HOWTO-001.json):

```tsx
export interface CampaignData {
  campaign: {
    id: string;
    week: number;
    day: number;
    type: string;
    title: string;
    subject: string;
    landing_page: string;
    template: string;
    description: string;
  };
  landing_page: {
    campaign_id: string;
    landing_page_slug: string;
    url: string;
    template_id: string;
    template_name: string;
    slide_count: number;
    duration_seconds: number;
    primary_cta: string;
    secondary_cta: string;
    ai_persona: string;
    ai_tone: string;
    ai_goal: string;
    data_capture_fields: string;
    audio_base_url: string;
    crm_tracking: boolean;
    conversion_goal: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
  };
  template: {
    template_id: string;
    name: string;
    slides: number;
    duration: number;
    purpose: string;
    audio_required: boolean;
  };
  slides: CampaignSlide[];
}

export interface CampaignSlide {
  template_id: string;
  slide_num: number;
  component: string;           // 'HeroSlide', 'ContentSlide', 'CTASlide', etc.
  content_type: string;
  requires_personalization: boolean;
  audio_file: string;
  headline?: string;
  body_text?: string;
  bullets?: string[];
  cta_text?: string;
  cta_action?: string;
  image_url?: string;
}
```

#### 5.3 — CampaignRenderer Component (`src/components/learning/CampaignRenderer.tsx`)

This is a NEW component that renders a campaign's slide deck.

**Design:**
```
Full-width campaign page layout:

TOP BAR:
  Back arrow + "Learning Center" breadcrumb
  Campaign title centered
  Progress indicator (slide 3 of 8)

SLIDE AREA (center, max-w-4xl):
  Dynamic slide component based on slide.component field:
    'HeroSlide'     → Large headline + subtitle + bg gradient
    'ContentSlide'  → Headline + body text + optional bullets
    'CTASlide'      → Call-to-action with primary + secondary buttons
    'StatsSlide'    → Key metrics/numbers display
    'TestimonialSlide' → Quote + attribution
    'ImageSlide'    → Full-width image + caption
    'ComparisonSlide' → Before/after or option comparison
    'SummarySlide'  → Key takeaways list

  Each slide: card with rounded-2xl, padding-12, centered content
  Slide transitions: Framer Motion AnimatePresence with slide direction

BOTTOM NAV:
  Previous / Next buttons
  Slide dots indicator
  AI Persona indicator (avatar + name like "Emma" + tone)
  Audio play button (if audio_file exists)

SIDE PANEL (optional, toggle):
  Campaign metadata
  AI persona details
  CTA tracking info
```

**Slide component implementations:**

```tsx
// src/components/learning/slides/HeroSlide.tsx
// Full gradient background, large Inter 900 headline, subtitle, animated entrance

// src/components/learning/slides/ContentSlide.tsx  
// Clean white card, headline, body paragraph(s), optional bullet list

// src/components/learning/slides/CTASlide.tsx
// Centered layout, persuasive headline, primary button (blue) + secondary button (outline)

// src/components/learning/slides/StatsSlide.tsx
// Grid of MetricCards with large numbers and labels

// ... etc for each component type referenced in the JSON
```

#### 5.4 — CampaignLandingPage (`src/components/learning/CampaignLandingPage.tsx`)

Route handler for `/learn/:campaignSlug`:

```tsx
export function CampaignLandingPage() {
  const { campaignSlug } = useParams();
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const entry = getCampaignBySlug(campaignSlug);
    if (entry) {
      loadCampaign(entry.campaign_id).then(data => {
        setCampaign(data);
        setIsLoading(false);
      });
    }
  }, [campaignSlug]);

  if (isLoading) return <LoadingState variant="card" />;
  if (!campaign) return <EmptyState title="Campaign not found" />;

  return <CampaignRenderer campaign={campaign} />;
}
```

#### 5.5 — LearningCenterHub Enhancement

Update the existing `LearningCenterHub.tsx` to:
1. Import campaign registry
2. Display campaigns grouped by type (EDU, HOOK, HOWTO)
3. Each campaign card links to `/learn/${slug}`
4. Show completion progress per campaign

**Campaign card design:**
```
Rounded-xl card with left color bar:
  EDU → purple bar
  HOOK → blue bar  
  HOWTO → green bar

Content:
  Type badge (top-left)
  Title (font-semibold)
  Description (text-sm text-muted)
  Duration + slide count (bottom-left)
  Week/Day indicator (bottom-right)
  
Hover: elevation increase + slight scale
Click: navigate to /learn/{slug}
```

#### 5.6 — LearnPage.tsx (1 hit)

Wire to campaign data. Replace any remaining mock references.

#### 5.7 — Verification Checklist

- [ ] All 60 campaigns load from JSON and render in CampaignRenderer
- [ ] Slide navigation (next/prev) works with keyboard arrows
- [ ] Slide transitions animate smoothly
- [ ] Each slide component type renders correctly
- [ ] LearningCenterHub shows all 60 campaigns grouped by type
- [ ] Campaign cards link correctly to `/learn/:slug`
- [ ] Campaign metadata (AI persona, duration, CTA) displays
- [ ] Back navigation returns to Learning Center
- [ ] Deep link to `/learn/command-center-basics` works directly

---

## AGENT 6: REMAINING PLACEHOLDER CLEANUP

**Priority:** After Agents 0–5
**Estimated effort:** 2–3 days
**Dependencies:** All previous agents
**Files to modify:** 5 remaining files

### Target Files

#### 6.1 — ClientProposalPage.tsx (1 hit)

Create `useProposals()` hook → `GET /proposals`. Replace inline data.

#### 6.2 — AIWorkflowPage.tsx (1 hit)

Create `useWorkflows()` hook → `GET /ai/workflows`. Replace inline data.

#### 6.3 — BusinessProfilePage.tsx (1 hit)

Use `useAuthStore()` for current business data + `GET /business/profile` for full profile. Replace inline data.

#### 6.4 — Notification Store Integration

Create `src/stores/notificationStore.ts` with Zustand:
- Unread count in header badge
- Mark as read
- Real-time updates (placeholder for WebSocket)

#### 6.5 — Final Verification

- [ ] `grep -r "MOCK_\|John Doe\|Acme Corp\|INV-0\|ORD-0\|mockData\|mock_" src/` returns ZERO results
- [ ] Every page renders with loading → data → display cycle
- [ ] Every page handles error state gracefully
- [ ] Theme toggle works on every page (light ↔ dark)
- [ ] No raw hex colors in any component
- [ ] All DataTable instances use the shared DataTable component
- [ ] All page headers use the shared PageHeader component
- [ ] All status indicators use StatusBadge
- [ ] All metric tiles use MetricCard
- [ ] Navigation highlights correctly on every route

---

## CROSS-AGENT COORDINATION RULES

1. **Agent 0 merges first.** No other agent starts building until shared components exist.

2. **Agent 1 can work in parallel with Agent 0** on routing/auth/API that doesn't depend on shared components, but must integrate shared components before merging.

3. **Agents 2, 3, 4, 5 can work in parallel** after Agents 0+1 merge. They share no files.

4. **Agent 6 goes last.** It's cleanup that depends on patterns established by earlier agents.

5. **Import paths are absolute.** Every agent uses `@/components/shared/DataTable` not `../../../shared/DataTable`.

6. **No new dependencies without justification.** The stack is React + Tailwind + shadcn + Framer Motion + Zustand + Axios + Recharts. If an agent needs something else, it must document why.

7. **Every component must work in BOTH themes.** Test in `nexus-light` and `nexus-dark` before PR.

8. **No inline styles.** Everything is Tailwind utility classes or CSS custom properties. The only exception is the existing `style` prop on NavigationRail for `top` positioning.

9. **Framer Motion usage:** Use for page transitions, modal animations, and list item animations. Do NOT animate every hover state — use CSS transitions for hovers. Framer Motion is for meaningful state changes.

10. **TypeScript strict mode.** No `any` types. No `// @ts-ignore`. Every prop has an interface. Every hook has typed returns.

---

## APPENDIX A: FILES THAT MUST NOT BE MODIFIED

These files contain real content, not placeholder data. Do not touch them:

**Platform Configuration (21 files):** BusinessConfiguratorPage.tsx, MarketingDiagnosticWizard.tsx, ContentScheduling.tsx, MyServicesPage.tsx, BusinessSurveyPage.tsx, PlanComparisonPage.tsx, SubscriptionEnrollmentWizard.tsx, ServiceConfigurationPage.tsx, ServiceCatalog.tsx, StepBusinessType.tsx, StepBusinessSubtype.tsx, StepBiggestChallenge.tsx, StepCustomerSources.tsx, StepDifferentiator.tsx, StepMarketingActivities.tsx, StepGoals.tsx, StepPackages.tsx, StepPublications.tsx, StepAddOns.tsx, ContentTypeSelection.tsx, StepWelcome.tsx

**Educational Content (8 files + 60 JSON):** LearningLessonPage.tsx, LearningTopicsPage.tsx, LearningCenterHub.tsx, ConversationPage.tsx, AddAIParticipantModal.tsx, CourseDetailPage.tsx, LessonPlayerPage.tsx, AIConsultingPage.tsx — PLUS all 60 campaign_*.json files and landing_pages_master.json

**Clean Prop-Driven Components (65 files):** These accept props and are ready for data injection. Don't restructure them — just pass them data from hooks. Examples: ActiveServiceCard.tsx, ArticleCard.tsx, DealCard.tsx, EventCard.tsx, MetricCard.tsx, BusinessHealthScore.tsx, AIRecommendationsPanel.tsx, etc.

## APPENDIX B: SHADCN/UI COMPONENT STYLE OVERRIDES

All shadcn components must respect the existing CSS custom property theme. Apply these overrides to ensure consistency:

```css
/* Button overrides */
.btn-primary { @apply bg-[var(--nexus-button-bg)] hover:bg-[var(--nexus-button-hover)] text-white; }

/* Card overrides — shadcn Card inherits from --card and --card-foreground */
/* Already handled by §0.2 CSS variable mapping */

/* Input overrides */
/* Input bg and border should come from --nexus-input-bg and --nexus-input-border */

/* Badge status variants — add custom variants beyond shadcn defaults */
/* StatusBadge component handles this; don't modify shadcn Badge directly */
```

## APPENDIX C: RESPONSIVE BREAKPOINTS

Use Tailwind's default breakpoints consistently:

```
sm:  640px   (mobile landscape)
md:  768px   (tablet portrait)
lg:  1024px  (tablet landscape / small laptop)
xl:  1280px  (laptop)
2xl: 1536px  (desktop)
```

**Layout rules:**
- NavigationRail: hidden on < md, collapsed on md, expanded on lg+
- DataTable: horizontal scroll on < lg, full width on lg+
- Dashboard grid: 1 col on < lg, 3 cols on lg+
- Detail pages: stacked on < lg, sidebar on lg+
- Cards: full width on < sm, 2-col on sm-md, 3-col on lg+
