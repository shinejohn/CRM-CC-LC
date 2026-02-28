# CC 3.0 — Goal-Based UI Execution Briefs

**Platform:** Fibonacco Command Center  
**Stack:** React 18 + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion  
**Theme:** Dual-mode (nexus-light / nexus-dark) via CSS custom properties  
**Date:** February 28, 2026  
**Prerequisite:** CC 2.0 Agent Briefs (complete), Magic Archive (complete)

---

## HOW TO USE THIS DOCUMENT

This document contains **8 execution projects + 1 review project**. Each project is a self-contained work package that can be assigned to a separate AI/IDE instance.

**Execution order matters.** Projects have explicit dependencies. Do not start a project until its dependencies are marked complete.

```
PROJECT 1: Route Restructuring          ← START HERE (no dependencies)
PROJECT 2: Permission & BusinessMode    ← START HERE (no dependencies, parallel with P1)
    ↓                ↓
PROJECT 3: NavigationRail Rebuild       ← depends on P1 + P2
PROJECT 4: Dashboard                    ← depends on P1 + P2
    ↓
PROJECTS 5-7: Verb Pages               ← depend on P3 (parallel with each other)
PROJECT 8: Learn + Campaign Verify      ← depends on P1
    ↓
PROJECT R: Review & Integration         ← runs AFTER all others complete
```

**For each project, the AI/IDE receives:**
- TASK: What to build
- CONTEXT: Why it matters and what exists
- FILES TO MODIFY: Exact file paths
- FILES TO CREATE: New files with specs
- ACCEPTANCE CRITERIA: Concrete checklist — if every box isn't checked, the project isn't done
- DO NOT MODIFY: Hands-off files

---

## MASTER RULES (ALL PROJECTS)

These rules override any per-project instruction if there's a conflict.

1. **Design tokens only.** No raw Tailwind color classes. Use `bg-[var(--nexus-card-bg)]` not `bg-white`. Use `text-[var(--nexus-text-primary)]` not `text-slate-900`. Layout classes (flex, grid, gap, p, m, w, h, rounded) are fine raw.

2. **Shared components first.** Use `DataCard`, `DataTable`, `MetricCard`, `StatusBadge`, `PageHeader`, `EmptyState`, `LoadingState`, `SearchInput`, `TabNav`, `AvatarInitials`, `ConfirmDialog` from `@/components/shared/`. Do not recreate.

3. **UseDataReturn<T> pattern.** Every hook: `{ data: T | null; isLoading: boolean; error: string | null; refetch: () => void; }`.

4. **React Router only.** No `onNavigate` callbacks, no `setActiveView`, no `switch/case` view rendering. Use `useNavigate()`, `NavLink`, `useLocation()`, `useParams()`, `<Outlet />`.

5. **TypeScript strict.** No `any`. No `// @ts-ignore`. Interfaces in `src/services/types/`.

6. **Both themes.** Every component must render correctly in nexus-light AND nexus-dark.

7. **DO NOT MODIFY:** 60 campaign JSONs, `index.css` theme variables, `ThemeContext.tsx`, `_archive/` directory, `data.ts` / `types.ts` / `utils.ts` in enrollment wizard.

---

## PROJECT 1: ROUTE RESTRUCTURING

**Priority:** FIRST (parallel with P2)  
**Estimated effort:** 1 day  
**Dependencies:** None  
**Output consumed by:** Every other project

### TASK

Reorganize the unified routing from system-category URLs (`/command-center/crm`) to goal-based verb URLs (`/command-center/sell/customers`). No new pages — same production components, new URL paths.

### CONTEXT

Claude Code unified routing into `getCommandCenterRoutes()` which embeds in the main `AppRouter.tsx`. All 15 nav items currently resolve to `/command-center/*` production pages. This project moves those pages under verb-based paths.

### FILES TO MODIFY

**`src/command-center/AppRouter.tsx`** (the `getCommandCenterRoutes()` function)

Remap every route:

```
CURRENT PATH                        → NEW PATH                                    → SAME COMPONENT
/command-center/                    → /command-center/                             → Dashboard (unchanged)
/command-center/business            → /command-center/define                       → MyBusinessProfilePage
/command-center/define/profile      → /command-center/define/profile               → BusinessProfileEdit
/command-center/define/survey       → /command-center/define/survey                → BusinessSurveyPage
/command-center/define/faq          → /command-center/define/faq                   → FAQBuilderPage

/command-center/content             → /command-center/attract                      → ContentLibrary
/command-center/attract/campaigns   → /command-center/attract/campaigns            → CampaignBuilderPage
/command-center/attract/articles    → /command-center/attract/articles             → ArticlesPage
/command-center/attract/events      → /command-center/attract/events               → EventsPage
/command-center/attract/diagnostic  → /command-center/attract/diagnostic           → MarketingDiagnosticWizard

/command-center/crm                 → /command-center/sell                         → CRM Dashboard
/command-center/sell/pipeline       → /command-center/sell/pipeline                → PipelinePage
/command-center/sell/customers      → /command-center/sell/customers               → CustomersListPage
/command-center/sell/customers/:id  → /command-center/sell/customers/:id           → CustomerDetailPage
/command-center/sell/contacts       → /command-center/sell/contacts                → ContactsListPage
/command-center/sell/activities     → /command-center/sell/activities               → ActivitiesPage
/command-center/sell/proposals      → /command-center/sell/proposals               → QuotesListPage

/command-center/services            → /command-center/deliver                      → ServicesPage
/command-center/deliver/orders      → /command-center/deliver/orders               → OrderHistoryPage
/command-center/billing             → /command-center/deliver/billing              → BillingDashboard
/command-center/deliver/invoices    → /command-center/deliver/invoices             → InvoicesListPage
/command-center/deliver/invoices/:id→ /command-center/deliver/invoices/:id         → InvoiceDetailPage
/command-center/deliver/collections → /command-center/deliver/collections          → CollectionsDashboard
/command-center/deliver/platforms   → /command-center/deliver/platforms             → PlatformsHub

/command-center/measure             → /command-center/measure                      → PerformanceDashboard
/command-center/measure/reports     → /command-center/measure/reports              → MarketingReportPage
/command-center/measure/analytics   → /command-center/measure/analytics            → DataReportPanel

/command-center/ai-team             → /command-center/automate                     → AITeamPage
/command-center/automate/workflows  → /command-center/automate/workflows           → AIWorkflowPage
/command-center/automate/employees  → /command-center/automate/employees           → AIEmployeeConfigurationPage
/command-center/automate/processes  → /command-center/automate/processes           → ProcessBuilderPage

/command-center/learn               → /command-center/learn                        → LearningCenterHub
/command-center/learn/:campaignSlug → /command-center/learn/:campaignSlug          → CampaignRenderer

/command-center/settings            → /command-center/settings                     → SettingsPage
/command-center/settings/profile    → /command-center/settings/profile             → ProfilePage
/command-center/settings/team       → /command-center/settings/team                → TeamUsersPage
/command-center/settings/integrations→/command-center/settings/integrations        → IntegrationsPage
/command-center/settings/mode       → /command-center/settings/mode                → BusinessModeSettingsPage
```

Add redirects from old paths to new paths so existing bookmarks don't break:
```tsx
<Route path="/command-center/crm" element={<Navigate to="/command-center/sell" replace />} />
<Route path="/command-center/billing" element={<Navigate to="/command-center/deliver/billing" replace />} />
<Route path="/command-center/content" element={<Navigate to="/command-center/attract" replace />} />
<Route path="/command-center/ai-team" element={<Navigate to="/command-center/automate" replace />} />
<Route path="/command-center/business" element={<Navigate to="/command-center/define" replace />} />
<Route path="/command-center/services" element={<Navigate to="/command-center/deliver" replace />} />
```

### ACCEPTANCE CRITERIA

- [ ] Every route in the table above resolves to its target component
- [ ] All 6 redirect routes work (old URL → new URL, no 404)
- [ ] `npm run build` compiles with zero errors
- [ ] No imports of components changed — only route `path` strings changed
- [ ] Lazy loading with `Suspense` preserved on all routes
- [ ] `CommandCenterLayout` still wraps all `/command-center/*` routes

### DO NOT MODIFY
- Any page component's internal code
- The main `src/AppRouter.tsx` structure (only the CC routes embed)
- Campaign JSON files

---

## PROJECT 2: PERMISSION & BUSINESSMODE INFRASTRUCTURE

**Priority:** FIRST (parallel with P1)  
**Estimated effort:** 2 days  
**Dependencies:** None  
**Output consumed by:** P3, P4, P5, P6, P7

### TASK

Build the permission hooks, feature-access system, and promote `BusinessModeContext` from the archived Sidebar component into the production command center infrastructure.

### CONTEXT

The `authStore` has `role: 'owner' | 'admin' | 'member'` and `subscription_tier: 'free' | 'influencer' | 'expert' | 'sponsor'`. The `ProtectedRoute` only checks `isAuthenticated`. There is no role-based or tier-based gating anywhere.

`BusinessModeContext` exists in `src/contexts/BusinessModeContext.tsx` with three modes (b2b-pipeline, b2c-services, b2c-retail) and a terminology map. It needs to be wired into the command center layout as a provider.

### FILES TO CREATE

**`src/hooks/usePermission.ts`**
```typescript
type Resource = 'customers' | 'contacts' | 'deals' | 'invoices' | 'campaigns' |
  'content' | 'services' | 'team' | 'billing' | 'ai-employees' | 'analytics' |
  'settings' | 'integrations';

type Action = 'view' | 'create' | 'edit' | 'delete' | 'manage';

interface PermissionResult {
  allowed: boolean;
  reason?: string;  // "upgrade_required" | "role_restricted" | "owner_only"
}

export function usePermission(action: Action, resource: Resource): PermissionResult;
```

Logic: Read `role` and `subscription_tier` from `authStore`. Return `{ allowed: true }` or `{ allowed: false, reason }`. Permission matrix:

| Resource | owner | admin/manager | member/staff | viewer |
|----------|-------|---------------|--------------|--------|
| customers | all | all | view, create | view |
| deals | all | all | view | view |
| invoices | all | view | none | none |
| campaigns | all | all | view | view |
| content | all | all | view, create | view |
| team | manage | view | none | none |
| billing | manage | view | none | none |
| ai-employees | all | view | view | view |
| settings | all | all | view | view |

**`src/hooks/useFeatureAccess.ts`**
```typescript
type Feature = 'article_creation' | 'event_creation' | 'campaign_builder' |
  'ai_employees' | 'advanced_analytics' | 'social_posting' | 'email_campaigns' |
  'sms_campaigns' | 'voice_campaigns' | 'competitor_reports' | 'priority_listing' |
  'newsletter_placement' | 'weekly_article';

interface FeatureAccess {
  visible: boolean;      // Always true (guide don't gate)
  enabled: boolean;      // true if user's tier includes this
  requiredTier: string;  // 'free' | 'influencer' | 'expert' | 'sponsor'
  upgradeLabel?: string; // "Upgrade to Community Influencer" etc.
}

export function useFeatureAccess(feature: Feature): FeatureAccess;
```

Logic: All features `visible: true` always. Tier requirements:
- free: basic profile, view dashboards, learning center
- influencer: article_creation, event_creation, campaign_builder, priority_listing, newsletter_placement, ai_employees (trial)
- expert: weekly_article, advanced_analytics, competitor_reports + all influencer
- sponsor: social_posting, email_campaigns + all expert

**`src/hooks/useBusinessMode.ts`** (NEW — wraps context for CC usage)
```typescript
interface BusinessModeReturn {
  mode: 'b2b-pipeline' | 'b2c-services' | 'b2c-retail';
  setMode: (mode: BusinessMode) => void;
  t: (key: string) => string;  // terminology lookup
  sellComponents: {
    pipeline: React.ComponentType;
    detail: React.ComponentType;
    list: React.ComponentType;
  };
}
```

The `t()` function is a terminology translator:
```typescript
const terminology = {
  'b2b-pipeline': {
    customers: 'Accounts', customer: 'Account',
    deals: 'Deals', deal: 'Deal',
    proposals: 'Proposals', proposal: 'Proposal',
    activities: 'Activities', pipeline: 'Deal Pipeline',
    quote: 'Proposal', quotes: 'Proposals',
  },
  'b2c-services': {
    customers: 'Clients', customer: 'Client',
    deals: 'Jobs', deal: 'Job',
    proposals: 'Quotes', proposal: 'Quote',
    activities: 'Schedule', pipeline: 'Job Board',
    quote: 'Quote', quotes: 'Quotes',
  },
  'b2c-retail': {
    customers: 'Guests', customer: 'Guest',
    deals: 'Visits', deal: 'Visit',
    proposals: 'Promotions', proposal: 'Promotion',
    activities: 'Reservations', pipeline: 'Activity',
    quote: 'Promotion', quotes: 'Promotions',
  },
};
```

**`src/stores/businessModeStore.ts`** (Zustand — replaces React context for persistence)
```typescript
interface BusinessModeState {
  mode: 'b2b-pipeline' | 'b2c-services' | 'b2c-retail';
  setMode: (mode: BusinessMode) => void;
}
// Use zustand/persist so mode survives page refresh
```

### FILES TO MODIFY

**`src/command-center/CommandCenterLayout.tsx`** — Wrap children with `BusinessModeProvider` (or ensure Zustand store is accessible).

**`src/stores/authStore.ts`** — Verify the `User` interface includes `role` and `subscription_tier`. If `role` is currently just `string`, type it as the union: `'owner' | 'admin' | 'member' | 'viewer'`.

### ACCEPTANCE CRITERIA

- [ ] `usePermission('edit', 'invoices')` returns `{ allowed: false, reason: 'role_restricted' }` for a `member` role user
- [ ] `usePermission('manage', 'team')` returns `{ allowed: true }` for `owner` role
- [ ] `useFeatureAccess('weekly_article')` returns `{ visible: true, enabled: false, requiredTier: 'expert', upgradeLabel: 'Upgrade to Community Expert' }` for a `free` tier user
- [ ] `useFeatureAccess('weekly_article')` returns `{ visible: true, enabled: true, requiredTier: 'expert' }` for an `expert` tier user
- [ ] `useBusinessMode().t('customers')` returns `'Clients'` when mode is `b2c-services`
- [ ] `useBusinessMode().t('customers')` returns `'Accounts'` when mode is `b2b-pipeline`
- [ ] Business mode persists across page refresh (Zustand persist)
- [ ] `npm run build` compiles with zero errors
- [ ] No `any` types used in any new file

### DO NOT MODIFY
- `ThemeContext.tsx`
- Existing shared components
- Campaign JSON files

---

## PROJECT 3: NAVIGATIONRAIL REBUILD

**Priority:** After P1 + P2  
**Estimated effort:** 2 days  
**Dependencies:** P1 (routes exist), P2 (useBusinessMode, usePermission exist)

### TASK

Rebuild the NavigationRail as a Six Verbs navigation that uses React Router, adapts terminology via `useBusinessMode`, and shows/hides items based on `usePermission`.

### CONTEXT

Four different navigation components exist in the codebase (see MAGIC-CLEANUP-ANALYSIS doc). The production NavigationRail in the `src/command-center/` tree needs to be the canonical one. It should use the verb-based routes from P1 and the hooks from P2.

### FILE TO MODIFY

**`src/command-center/components/NavigationRail.tsx`** (or create new if current is too tangled)

### NAVIGATION STRUCTURE

```
MY BUSINESS (home icon)                → /command-center/

DEFINE                                 → /command-center/define
  ├── Business Profile                 → /command-center/define/profile
  ├── Survey                           → /command-center/define/survey
  └── FAQ                              → /command-center/define/faq

ATTRACT                                → /command-center/attract
  ├── Marketing Diagnostic             → /command-center/attract/diagnostic
  ├── Campaigns                        → /command-center/attract/campaigns
  ├── Content                          → /command-center/attract (index)
  ├── Articles                         → /command-center/attract/articles
  └── Events                           → /command-center/attract/events

SELL                                   → /command-center/sell
  ├── {t('pipeline')}                  → /command-center/sell/pipeline
  ├── {t('proposals')}                 → /command-center/sell/proposals
  ├── {t('customers')}                 → /command-center/sell/customers
  └── {t('activities')}                → /command-center/sell/activities

DELIVER                                → /command-center/deliver
  ├── Services                         → /command-center/deliver (index)
  ├── Orders                           → /command-center/deliver/orders
  ├── Invoices                         → /command-center/deliver/billing
  └── Platforms                        → /command-center/deliver/platforms

MEASURE                                → /command-center/measure
  ├── Performance                      → /command-center/measure (index)
  ├── Reports                          → /command-center/measure/reports
  └── Analytics                        → /command-center/measure/analytics

AUTOMATE                               → /command-center/automate
  ├── AI Employees                     → /command-center/automate (index)
  ├── Workflows                        → /command-center/automate/workflows
  └── Processes                        → /command-center/automate/processes

─── divider ───

LEARN                                  → /command-center/learn

─── bottom-pinned ───

SETTINGS                               → /command-center/settings
```

Note: SELL section labels use `useBusinessMode().t()` — the nav item text adapts to business type.

### VISUAL SPEC

- Width: 256px expanded, 64px collapsed (icons only)
- Background: `bg-[var(--nexus-nav-bg)]`
- Border right: `border-r border-[var(--nexus-nav-border)]`
- Verb section headers: `text-[10px] uppercase tracking-widest font-semibold text-[var(--nexus-text-tertiary)]`
- Nav items: `flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 text-sm font-medium`
- Active item: `bg-[var(--nexus-nav-active)] text-[var(--nexus-accent-primary)]` with left border accent
- Hover: `hover:bg-[var(--nexus-bg-secondary)]`
- Icons: Lucide, `w-5 h-5`
- Collapse: Framer Motion width transition 300ms
- Verb sections: collapsible with smooth height animation
- Each verb section header has an icon: Define=Building2, Attract=Megaphone, Sell=TrendingUp, Deliver=Package, Measure=BarChart3, Automate=Bot

### ACCEPTANCE CRITERIA

- [ ] Every nav item uses `<NavLink to={...}>` — no `onClick` view switching
- [ ] Active item highlights based on `useLocation().pathname`
- [ ] SELL section labels adapt when `useBusinessMode().mode` changes
- [ ] Verb sections collapse/expand with smooth animation
- [ ] Collapsed state shows icons only with tooltip on hover
- [ ] LEARN section appears below a divider, not under a verb
- [ ] SETTINGS is bottom-pinned
- [ ] All design token colors — no raw Tailwind colors
- [ ] Both nexus-light and nexus-dark render correctly
- [ ] `npm run build` compiles with zero errors

### DO NOT MODIFY
- Route definitions (those are P1's output)
- Page components
- Campaign JSON files

---

## PROJECT 4: DASHBOARD — "MY BUSINESS AT A GLANCE"

**Priority:** After P1 + P2  
**Estimated effort:** 2 days  
**Dependencies:** P1 (routes), P2 (usePermission, useFeatureAccess, useBusinessMode)

### TASK

Replace the current dashboard with a goal-oriented "morning briefing" organized by the six verbs. The SMB owner opens this page and immediately knows: what happened, what needs attention, and what's next.

### FILE TO CREATE/MODIFY

**`src/command-center/pages/Dashboard.tsx`** (replace current content)

### DASHBOARD STRUCTURE

Six verb-based summary cards in a responsive grid (1 col mobile, 2 col tablet, 3 col desktop), followed by an activity timeline.

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ DEFINE           │ │ ATTRACT          │ │ SELL             │
│ Profile: 78%     │ │ 3 articles live  │ │ 12 {customers}   │
│ 2 FAQ gaps       │ │ 1 event upcoming │ │ 4 {deals} active │
│ → Complete FAQ   │ │ → Create event   │ │ → View {pipeline}│
└──────────────────┘ └──────────────────┘ └──────────────────┘
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ DELIVER          │ │ MEASURE          │ │ AUTOMATE         │
│ 5 services active│ │ 847 total views  │ │ 2 AI employees   │
│ 1 invoice pending│ │ +12% this week   │ │ Sarah: 14 posts  │
│ → View invoices  │ │ → Full report    │ │ → Configure team │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

Each card:
- Uses `DataCard` from shared components
- Shows 2-3 key metrics relevant to that verb
- Shows 1 recommended next action as a link (`useNavigate()`) to the verb page
- Metrics use `useBusinessMode().t()` for adaptive labels
- Metrics come from hooks (use existing hooks or create stubs that return mock data with `// TODO: wire to API` comments)

Below the grid: **Activity Timeline** showing last 10 actions across all systems (article published, invoice sent, customer added, AI employee action, etc.). Each entry links to its detail page.

At the top: **Welcome bar** with user name from `authStore`, trial countdown if `subscription_tier === 'free'` (days remaining badge), and value delivered tracker ($X,XXX this month).

### ACCEPTANCE CRITERIA

- [ ] Six verb cards render in responsive grid
- [ ] SELL card uses `useBusinessMode().t()` for labels (shows "Accounts" for B2B, "Clients" for B2C services, "Guests" for retail)
- [ ] Each card has a clickable action that navigates to the verb page via `useNavigate()`
- [ ] Activity timeline shows 10 entries with relative timestamps
- [ ] Trial countdown badge appears when `subscription_tier === 'free'`
- [ ] Welcome bar shows user name from `authStore`
- [ ] All design token colors — no raw Tailwind colors
- [ ] Both themes render correctly
- [ ] `npm run build` compiles with zero errors

---

## PROJECT 5: SELL VERB — ADAPTIVE CUSTOMER MANAGEMENT

**Priority:** After P3  
**Estimated effort:** 3 days  
**Dependencies:** P1, P2, P3  
**Can run parallel with:** P6, P7

### TASK

Make the SELL verb render different components based on `useBusinessMode().mode`. This is where "CRM" disappears as a separate system and becomes the SMB's natural sales workflow, adapted to their business type.

### CONTEXT

The CRM Dashboard at `/command-center/sell` (334 lines, API-integrated) is the current index page. The AI Team page (Kanban job board) was built for `/command-center/ai-team` but is actually a perfect B2C-services SELL view — it's a job pipeline.

### APPROACH

Create a wrapper component for `/command-center/sell` that reads `useBusinessMode().mode` and renders the appropriate index component:

```tsx
// src/command-center/pages/SellIndex.tsx
export function SellIndex() {
  const { mode } = useBusinessMode();
  
  switch (mode) {
    case 'b2b-pipeline':
      return <PipelineDashboard />;      // Deal pipeline with stages
    case 'b2c-services':
      return <JobBoardDashboard />;      // Kanban job board (adapted from AITeamPage)
    case 'b2c-retail':
      return <RetailDashboard />;        // Loyalty + promotions + visits
  }
}
```

### FILES TO CREATE

**`src/command-center/pages/SellIndex.tsx`** — Mode-switching wrapper (above)

**`src/command-center/modules/sell/PipelineDashboard.tsx`** — B2B view. Adapt existing PipelinePage if it exists, or build: Kanban columns for deal stages (Lead → Qualified → Proposal → Negotiation → Won/Lost), deal cards with value and contact, summary metrics at top (Pipeline Value, Win Rate, Avg Deal Size, Deals This Month).

**`src/command-center/modules/sell/JobBoardDashboard.tsx`** — B2C services view. Adapt the AITeamPage Kanban that was just built: columns are Quote Sent → Scheduled → In Progress → Complete. Job cards with client name, service type, price, urgency. Summary metrics (Total Jobs, Pipeline Value, In Progress, Completed This Month).

**`src/command-center/modules/sell/RetailDashboard.tsx`** — B2C retail view. Grid of: Today's Reservations, Active Promotions, Loyalty Member Count, Recent Visits. Simpler than the other two — retail SMBs think in terms of foot traffic and repeat visits.

### ACCEPTANCE CRITERIA

- [ ] `/command-center/sell` renders PipelineDashboard when mode is `b2b-pipeline`
- [ ] `/command-center/sell` renders JobBoardDashboard when mode is `b2c-services`
- [ ] `/command-center/sell` renders RetailDashboard when mode is `b2c-retail`
- [ ] Changing mode in Settings → Mode page immediately changes what `/command-center/sell` shows (no reload)
- [ ] NavigationRail SELL section labels update when mode changes
- [ ] Sub-routes (`/sell/customers`, `/sell/pipeline`, `/sell/proposals`) still resolve to their dedicated pages regardless of mode
- [ ] All three dashboards use shared components (MetricCard, DataCard, StatusBadge)
- [ ] All three dashboards use design tokens — no raw Tailwind colors
- [ ] `npm run build` compiles with zero errors

---

## PROJECT 6: ATTRACT + DELIVER VERB PAGES

**Priority:** After P3  
**Estimated effort:** 2 days  
**Dependencies:** P1, P2, P3  
**Can run parallel with:** P5, P7

### TASK

Build index pages for the ATTRACT and DELIVER verbs that serve as launch pads into their sub-pages. These are the entry points when the SMB clicks the verb in the NavigationRail.

### FILES TO CREATE

**`src/command-center/pages/AttractIndex.tsx`**

A content hub showing the SMB's marketing activity at a glance:
- **Content Summary**: Articles published (count + recent list), Events listed (count + upcoming), Social posts (count if available)
- **Campaign Status**: Active campaigns with progress indicators
- **Quick Actions**: "Write Article", "Create Event", "Run Campaign" — each navigates to the appropriate sub-page
- **Marketing Health Score**: Simple gauge or score showing marketing activity level (derived from content frequency, engagement, etc.)

Uses existing hooks (`useArticles`, `useCampaigns` etc.) or creates stubs with `// TODO: wire to API`.

**`src/command-center/pages/DeliverIndex.tsx`**

An operations hub showing what the SMB is delivering and getting paid for:
- **Active Services**: List from ServicesPage data showing status (active/issue/pending)
- **Billing Summary**: Outstanding invoices total, this month's revenue, overdue amount
- **Platform Status**: Status indicators for Day.News, Downtown Guide, GoEventCity, Alphasite — showing where the business is listed and if profiles are complete
- **Quick Actions**: "View Invoices", "Check Platforms", "Manage Services"

Platform status should use a simple card per platform with green/amber/red indicator.

### ACCEPTANCE CRITERIA

- [ ] `/command-center/attract` renders AttractIndex with content summary, campaigns, quick actions
- [ ] `/command-center/deliver` renders DeliverIndex with services, billing, platforms, quick actions
- [ ] Quick action buttons use `useNavigate()` to route to sub-pages
- [ ] Platform status shows 4 platforms (Day.News, Downtown Guide, GoEventCity, Alphasite) with status indicators
- [ ] Both pages use shared components (MetricCard, DataCard, StatusBadge)
- [ ] Design tokens only, both themes work
- [ ] `npm run build` compiles with zero errors

---

## PROJECT 7: DEFINE + MEASURE + AUTOMATE VERB PAGES

**Priority:** After P3  
**Estimated effort:** 2 days  
**Dependencies:** P1, P2, P3  
**Can run parallel with:** P5, P6

### TASK

Build index pages for DEFINE, MEASURE, and AUTOMATE verbs. These are smaller in scope than SELL and ATTRACT but equally important to the SMB experience.

### FILES TO CREATE

**`src/command-center/pages/DefineIndex.tsx`**

The business identity hub:
- **Profile Completion**: Progress bar showing % of business profile completed (name, description, hours, photos, menu/services, contact info, social links)
- **Survey Status**: Whether the business survey has been completed, with CTA if not
- **FAQ Coverage**: Count of FAQs created, with suggestions for gaps based on industry
- **AI Context Status**: Indicator showing whether the AI Context File has been generated from the profile data. This is the bridge between DEFINE and AUTOMATE — "define your business so AI can represent you."
- Links to profile edit, survey, FAQ builder

**`src/command-center/pages/MeasureIndex.tsx`**

The performance hub:
- **Top-Line Metrics**: Total views, total engagement, revenue this month (using MetricCard grid)
- **Trend Indicators**: Up/down arrows with percentage change from previous period
- **Engagement Score**: The calculated score from the CRM engagement scoring system
- **Value Delivered**: Dollar amount of advertising value received (particularly important during Hook trial)
- Links to full reports, analytics

**`src/command-center/pages/AutomateIndex.tsx`**

The AI workforce hub:
- **AI Employee Roster**: Cards showing each AI employee assigned to this business (name, title, avatar, status: active/available/not hired)
- **Recent AI Actions**: Last 5 things AI employees did (posted an article, responded to inquiry, sent follow-up email)
- **Automation Rules**: Count of active automation rules/workflows
- For `free` tier users: Show the AI employee cards with `useFeatureAccess('ai_employees')` — visible but with "Available with Community Influencer" overlay
- Links to employee config, workflow builder

### ACCEPTANCE CRITERIA

- [ ] `/command-center/define` renders DefineIndex with profile completion, survey status, FAQ coverage, AI context status
- [ ] `/command-center/measure` renders MeasureIndex with top-line metrics, trends, engagement score, value delivered
- [ ] `/command-center/automate` renders AutomateIndex with AI employee roster, recent actions, automation rules
- [ ] AutomateIndex uses `useFeatureAccess('ai_employees')` to show upgrade overlay for free tier
- [ ] DefineIndex profile completion calculates from actual profile data fields
- [ ] All use shared components and design tokens
- [ ] Both themes work
- [ ] `npm run build` compiles with zero errors

---

## PROJECT 8: LEARN + CAMPAIGN VERIFICATION

**Priority:** After P1  
**Estimated effort:** 1-2 days  
**Dependencies:** P1 (routes)  
**Can run parallel with:** P3-P7

### TASK

Verify the Learning Center and Campaign system works end-to-end. This is Fibonacco's educational and conversion tool — the 60 campaign JSONs that run the Hook strategy, the educational content, the how-to guides. Every campaign must render correctly.

### VERIFICATION STEPS

1. **Campaign Data Loader**: Verify `toCampaign()` correctly unwraps all 60 JSONs. Run `getCampaignsByType('Educational')` — should return 15. `getCampaignsByType('Hook')` — should return 15. `getCampaignsByType('HowTo')` — should return 30.

2. **CampaignRenderer**: Navigate to `/command-center/learn/[slug]` for at least one campaign from each type (EDU, HOOK, HOWTO). Verify:
   - All slide types render (HeroSlide, ConceptSlide, DataSlide, ComparisonSlide, ActionSlide, ResourceSlide, CTASlide)
   - Audio playback works where `audio_file` URLs are defined
   - Keyboard navigation (arrow keys) advances slides
   - Data capture fields (name, email, business) appear on CTA slides

3. **Learning Center Hub**: `/command-center/learn` shows browsable list of campaigns organized by type. Each links to its campaign page.

4. **Schema Consistency**: Write a verification script that loads all 60 JSONs and checks:
   - Every JSON has `campaign.id`, `campaign.title`, `campaign.type`
   - Every JSON has `landing_page.landing_page_slug`
   - Every slide has `component` that matches a valid slide type
   - No undefined or null in required fields

### FILES TO CREATE

**`scripts/verify-campaigns.ts`** — Node script that imports all 60 JSONs, runs schema checks, reports any issues.

### ACCEPTANCE CRITERIA

- [ ] All 60 campaigns load without error via `toCampaign()`
- [ ] At least 3 campaigns render fully (1 EDU, 1 HOOK, 1 HOWTO)
- [ ] Every `component` value in every slide has a matching React component
- [ ] `getCampaignsByType()` returns correct counts: 15 EDU, 15 HOOK, 30 HOWTO
- [ ] Verification script runs and reports zero schema issues
- [ ] `/command-center/learn` lists all campaigns by type
- [ ] `npm run build` compiles with zero errors

---

## PROJECT R: REVIEW & INTEGRATION

**Priority:** LAST — runs after all other projects complete  
**Estimated effort:** 1-2 days  
**Dependencies:** ALL projects (P1-P8)

### TASK

This agent reviews every other project's work, verifies integration between projects, runs the full acceptance test suite, and identifies any gaps or regressions.

### REVIEW CHECKLIST

**Cross-Project Integration:**
- [ ] NavigationRail (P3) routes match Route definitions (P1) — every nav link resolves
- [ ] Dashboard (P4) verb cards link to verb index pages (P5, P6, P7)
- [ ] SELL verb (P5) reads `useBusinessMode()` from P2 and renders correctly in all 3 modes
- [ ] NavigationRail SELL labels update when business mode changes
- [ ] `usePermission` (P2) correctly restricts actions across all verb pages
- [ ] `useFeatureAccess` (P2) shows upgrade overlays on AUTOMATE page (P7) for free tier
- [ ] Campaign links from LEARN (P8) render correctly under the new route structure (P1)

**Full Navigation Test:**
- [ ] Click every NavigationRail item → correct page loads
- [ ] Browser back/forward works across all pages
- [ ] Deep link test: paste `/command-center/sell/customers` directly → loads correctly
- [ ] Deep link test: paste `/command-center/attract/articles` directly → loads correctly
- [ ] Redirect test: navigate to `/command-center/crm` → redirects to `/command-center/sell`
- [ ] Redirect test: navigate to `/command-center/billing` → redirects to `/command-center/deliver/billing`
- [ ] Cmd+K CommandPalette can search and navigate to pages under new routes

**Theme Compliance:**
- [ ] Switch to nexus-dark → navigate through all 6 verb index pages → no broken colors
- [ ] Switch to nexus-light → navigate through all 6 verb index pages → no broken colors
- [ ] NavigationRail renders correctly in both themes
- [ ] Dashboard renders correctly in both themes

**Business Mode Test:**
- [ ] Set mode to `b2b-pipeline` → check SELL page, NavigationRail labels, Dashboard SELL card
- [ ] Set mode to `b2c-services` → check same three locations
- [ ] Set mode to `b2c-retail` → check same three locations
- [ ] Mode persists across page refresh

**Build Health:**
- [ ] `npm run build` — zero errors, zero warnings about missing imports
- [ ] `grep -r "onNavigate\|setActiveView\|simulateApiDelay" src/` — zero results
- [ ] `grep -r "bg-white\|bg-slate-\|text-slate-900\|bg-blue-600" src/command-center/pages/` — zero results (only design tokens in new pages)
- [ ] No files in `src/` import from `magic/` or `_archive/`

**Regression Check:**
- [ ] Login page still works
- [ ] Campaign JSONs unmodified (diff check)
- [ ] Enrollment wizard unmodified (diff check)
- [ ] Theme toggle works from any page

### OUTPUT

Create a markdown report: `CC-3.0-REVIEW-REPORT.md` with:
- Pass/fail for every checkbox above
- List of any issues found with file paths and line numbers
- Recommended fixes for any failures
- Screenshot descriptions of any visual issues (describe what's wrong)

### ACCEPTANCE CRITERIA

- [ ] Every checkbox above is evaluated (not skipped)
- [ ] Any failures have specific remediation instructions
- [ ] Report is committed to project root
- [ ] `npm run build` passes as the final verification

---

## QUICK REFERENCE: PROJECT → FILE MAP

| Project | Creates | Modifies |
|---------|---------|----------|
| P1: Routes | Redirect routes | `src/command-center/AppRouter.tsx` |
| P2: Permissions | `usePermission.ts`, `useFeatureAccess.ts`, `useBusinessMode.ts`, `businessModeStore.ts` | `authStore.ts`, `CommandCenterLayout.tsx` |
| P3: NavRail | — | `NavigationRail.tsx` |
| P4: Dashboard | — | `Dashboard.tsx` |
| P5: SELL | `SellIndex.tsx`, `PipelineDashboard.tsx`, `JobBoardDashboard.tsx`, `RetailDashboard.tsx` | Route for `/command-center/sell` |
| P6: ATTRACT+DELIVER | `AttractIndex.tsx`, `DeliverIndex.tsx` | Routes for index pages |
| P7: DEFINE+MEASURE+AUTOMATE | `DefineIndex.tsx`, `MeasureIndex.tsx`, `AutomateIndex.tsx` | Routes for index pages |
| P8: Learn | `scripts/verify-campaigns.ts` | Campaign data loader if issues found |
| PR: Review | `CC-3.0-REVIEW-REPORT.md` | Fixes for any failures found |

---

## ASSIGNMENT STRATEGY

**Simultaneous start (Day 1):** P1 + P2 + P8 (no dependencies on each other)

**After P1+P2 complete (Day 2-3):** P3 + P4 (depend on routes + permissions)

**After P3 complete (Day 3-5):** P5 + P6 + P7 (parallel, all depend on NavRail being done)

**After all complete (Day 5-6):** PR (review everything)

**Fastest path to "working demo":** P1 → P3 → P4. After those three, an SMB can log in, see a verb-based nav, and land on a goal-oriented dashboard. That's the proof of concept. Everything else adds depth.
