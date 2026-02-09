# Command Center - Cursor Agent Build Instructions

## Master Orchestration Document

**Project:** Fibonacco Command Center  
**Created:** January 20, 2026  
**Architecture:** Modular, Parallel-Ready  
**UI Reference:** `/magic/patterns/` (TSX component library)

---

## Overview

The Command Center is the unified dashboard for SMB (Small/Medium Business) users to manage all aspects of their business operations through Fibonacco. It serves as the primary interface between business owners and all platform capabilities.

### Core Principles
1. **AI-First Design** - Every view has an AI assistant mode
2. **Unified Experience** - Single entry point to all platform features
3. **Real-Time Data** - Live updates via WebSocket connections
4. **Mobile-Responsive** - Full functionality on all devices
5. **Accessibility** - WCAG 2.1 AA compliant

---

## Module Dependency Graph

```
                    ┌─────────────────────────────────────┐
                    │     FOUNDATION LAYER (Phase 1)      │
                    │  Must complete before all others    │
                    └─────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│   CC-CORE-01    │        │   CC-CORE-02    │        │   CC-CORE-03    │
│   Shell/Layout  │        │   Theme System  │        │   Auth Context  │
│   (Agent 1)     │        │   (Agent 2)     │        │   (Agent 3)     │
└────────┬────────┘        └────────┬────────┘        └────────┬────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │      CORE SERVICES (Phase 2)  │
                    │      Parallel after Phase 1   │
                    └───────────────────────────────┘
                                    │
    ┌───────────┬───────────┬───────┼───────┬───────────┬───────────┐
    │           │           │       │       │           │           │
    ▼           ▼           ▼       ▼       ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│CC-SVC  │ │CC-SVC  │ │CC-SVC  │ │CC-SVC  │ │CC-SVC  │ │CC-SVC  │ │CC-SVC  │
│  -01   │ │  -02   │ │  -03   │ │  -04   │ │  -05   │ │  -06   │ │  -07   │
│WebSock │ │API     │ │State   │ │Events  │ │Search  │ │AI Svc  │ │Notif   │
│(Agt 4) │ │(Agt 5) │ │(Agt 6) │ │(Agt 7) │ │(Agt 8) │ │(Agt 9) │ │(Agt 10)│
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
    │           │           │       │       │           │           │
    └───────────┴───────────┴───────┼───────┴───────────┴───────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │    FEATURE MODULES (Phase 3)  │
                    │    Fully Parallel Execution   │
                    └───────────────────────────────┘
                                    │
    ┌──────────┬──────────┬─────────┼─────────┬──────────┬──────────┐
    │          │          │         │         │          │          │
    ▼          ▼          ▼         ▼         ▼          ▼          ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│CC-FT  │ │CC-FT  │ │CC-FT  │ │CC-FT  │ │CC-FT  │ │CC-FT  │ │CC-FT  │
│ -01   │ │ -02   │ │ -03   │ │ -04   │ │ -05   │ │ -06   │ │ -07   │
│Dashbd │ │Activ  │ │Cust   │ │Content│ │Campgn │ │Servcs │ │AI Hub │
└───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘

```

---

## Phase 1: Foundation Layer (Sequential - All Agents Wait)

### Estimated Time: 2-4 hours
### Agents Required: 3 (can run in parallel within phase)

| Module ID | Name | Dependencies | Agent | Est. Time |
|-----------|------|--------------|-------|-----------|
| CC-CORE-01 | App Shell & Layout | None | Agent 1 | 2 hrs |
| CC-CORE-02 | Theme System | None | Agent 2 | 1.5 hrs |
| CC-CORE-03 | Auth Context | None | Agent 3 | 1.5 hrs |

---

## Phase 2: Core Services (Parallel After Phase 1)

### Estimated Time: 3-5 hours
### Agents Required: 7 (all parallel)

| Module ID | Name | Dependencies | Agent | Est. Time |
|-----------|------|--------------|-------|-----------|
| CC-SVC-01 | WebSocket Service | CC-CORE-01, CC-CORE-03 | Agent 4 | 3 hrs |
| CC-SVC-02 | API Client Service | CC-CORE-03 | Agent 5 | 2 hrs |
| CC-SVC-03 | State Management | CC-CORE-01 | Agent 6 | 2.5 hrs |
| CC-SVC-04 | Event Bus | CC-CORE-01 | Agent 7 | 1.5 hrs |
| CC-SVC-05 | Search Service | CC-CORE-01, CC-CORE-03 | Agent 8 | 2 hrs |
| CC-SVC-06 | AI Assistant Service | CC-CORE-03 | Agent 9 | 3 hrs |
| CC-SVC-07 | Notification Service | CC-CORE-01, CC-SVC-04 | Agent 10 | 2 hrs |

---

## Phase 3: Feature Modules (Fully Parallel)

### Estimated Time: 4-8 hours
### Agents Required: 7+ (all parallel)

| Module ID | Name | Dependencies | Agent | Est. Time |
|-----------|------|--------------|-------|-----------|
| CC-FT-01 | Dashboard Module | All Phase 2 | Agent 11 | 6 hrs |
| CC-FT-02 | Activities Module | CC-SVC-01, CC-SVC-04 | Agent 12 | 5 hrs |
| CC-FT-03 | Customers Module | CC-SVC-02, CC-SVC-03 | Agent 13 | 6 hrs |
| CC-FT-04 | Content Module | CC-SVC-02, CC-SVC-06 | Agent 14 | 6 hrs |
| CC-FT-05 | Campaigns Module | CC-SVC-02, CC-SVC-06 | Agent 15 | 5 hrs |
| CC-FT-06 | Services Module | CC-SVC-02, CC-SVC-03 | Agent 16 | 4 hrs |
| CC-FT-07 | AI Hub Module | CC-SVC-06, CC-SVC-01 | Agent 17 | 8 hrs |

---

## Phase 4: Integration & Polish (Sequential)

### Estimated Time: 3-4 hours
### Agents Required: 2

| Module ID | Name | Dependencies | Agent | Est. Time |
|-----------|------|--------------|-------|-----------|
| CC-INT-01 | Cross-Module Integration | All Phase 3 | Agent 18 | 2 hrs |
| CC-INT-02 | Testing & Polish | CC-INT-01 | Agent 19 | 2 hrs |

---

## Shared Contracts (All Agents Must Implement)

### TypeScript Interfaces

All agents MUST use these shared interfaces. Create file: `src/types/command-center.ts`

```typescript
// ============================================
// SHARED COMMAND CENTER TYPE DEFINITIONS
// All agents import from this file
// ============================================

// User Context
export interface User {
  id: string;
  email: string;
  businessId: string;
  businessName: string;
  role: 'owner' | 'admin' | 'member';
  tier: 'free' | 'starter' | 'growth' | 'enterprise';
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  defaultView: 'dashboard' | 'activities' | 'ai';
  notificationsEnabled: boolean;
}

// Navigation
export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  path: string;
  badge?: number | string;
  children?: NavItem[];
}

// Cards & Widgets
export interface DashboardCard {
  id: string;
  type: CardType;
  title: string;
  defaultColor: string;
  position: { row: number; col: number };
  size: { rows: number; cols: number };
  data?: any;
}

export type CardType = 
  | 'tasks' | 'email' | 'messages' | 'calendar' 
  | 'files' | 'articles' | 'content' | 'events'
  | 'social' | 'voicemail' | 'advertisements' | 'metrics';

// Activities & Interactions
export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  customerId?: string;
  metadata: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export type ActivityType = 
  | 'phone_call' | 'email' | 'sms' | 'meeting' 
  | 'task' | 'note' | 'deal_update' | 'campaign';

// Customer
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: CustomerStage;
  engagementScore: number;
  predictiveScore: number;
  lastInteraction?: string;
  tags: string[];
}

export type CustomerStage = 
  | 'lead' | 'prospect' | 'customer' | 'advocate' | 'churned';

// AI Assistant
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    toolCalls?: ToolCall[];
    citations?: Citation[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

export interface Citation {
  source: string;
  url?: string;
  excerpt: string;
}

// Events
export interface CommandCenterEvent {
  type: EventType;
  payload: any;
  timestamp: string;
  source: string;
}

export type EventType = 
  | 'ACTIVITY_CREATED' | 'ACTIVITY_UPDATED' | 'ACTIVITY_COMPLETED'
  | 'CUSTOMER_UPDATED' | 'DEAL_STAGE_CHANGED'
  | 'NOTIFICATION_RECEIVED' | 'AI_RESPONSE_RECEIVED'
  | 'WEBSOCKET_CONNECTED' | 'WEBSOCKET_DISCONNECTED';

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
  };
}

// Search
export interface SearchResult {
  type: 'customer' | 'content' | 'campaign' | 'activity' | 'service';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  score: number;
}

// Notifications
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
```

---

## Directory Structure

All agents must follow this directory structure:

```
src/
├── command-center/
│   ├── index.ts                    # Main exports
│   ├── CommandCenter.tsx           # Root component
│   │
│   ├── core/                       # Phase 1: Foundation
│   │   ├── AppShell.tsx
│   │   ├── Layout.tsx
│   │   ├── Navigation.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── ThemeProvider.tsx
│   │
│   ├── services/                   # Phase 2: Services
│   │   ├── websocket.service.ts
│   │   ├── api.service.ts
│   │   ├── state.service.ts
│   │   ├── events.service.ts
│   │   ├── search.service.ts
│   │   ├── ai.service.ts
│   │   └── notification.service.ts
│   │
│   ├── modules/                    # Phase 3: Features
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DashboardWidgets.tsx
│   │   │   ├── MetricsCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── activities/
│   │   │   ├── ActivitiesPage.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── ActivityCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── customers/
│   │   │   ├── CustomersPage.tsx
│   │   │   ├── CustomerDetail.tsx
│   │   │   ├── CustomerCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── content/
│   │   │   ├── ContentManager.tsx
│   │   │   ├── ContentLibrary.tsx
│   │   │   ├── ContentCreator.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── campaigns/
│   │   │   ├── CampaignsPage.tsx
│   │   │   ├── CampaignBuilder.tsx
│   │   │   ├── CampaignCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── services/
│   │   │   ├── ServicesPage.tsx
│   │   │   ├── ServiceCatalog.tsx
│   │   │   ├── ServiceCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── ai-hub/
│   │       ├── AIHub.tsx
│   │       ├── AIChat.tsx
│   │       ├── AIWorkflow.tsx
│   │       └── index.ts
│   │
│   ├── components/                 # Shared components
│   │   ├── ui/                     # Base UI components
│   │   ├── cards/                  # Card variants
│   │   ├── forms/                  # Form components
│   │   ├── modals/                 # Modal components
│   │   └── charts/                 # Chart components
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── useWebSocket.ts
│   │   ├── useApi.ts
│   │   ├── useSearch.ts
│   │   ├── useAI.ts
│   │   └── useNotifications.ts
│   │
│   ├── stores/                     # State stores (Zustand)
│   │   ├── userStore.ts
│   │   ├── dashboardStore.ts
│   │   ├── activityStore.ts
│   │   └── aiStore.ts
│   │
│   └── utils/                      # Utilities
│       ├── api.ts
│       ├── formatters.ts
│       └── validators.ts
│
├── types/
│   └── command-center.ts           # Shared types (above)
│
└── styles/
    └── command-center/
        ├── variables.css
        ├── components.css
        └── animations.css
```

---

## UI Pattern References

Each agent should reference these TSX patterns from `/magic/patterns/`:

| Component Type | Reference File | Description |
|---------------|----------------|-------------|
| Main Dashboard | `UnifiedCommandCenter.tsx` | Full command center layout |
| Dashboard Alt | `CentralCommandDashboard.tsx` | Alternative dashboard style |
| Header | `CommandCenterHeader.tsx` | Header with mode toggle |
| Command Palette | `CommandPalette.tsx` | Quick command interface |
| AI Interface | `AIInterfacePage.tsx` | AI chat interface |
| AI Hub | `AIModeHub.tsx` | AI mode navigation |
| AI Workflow | `AIWorkflowPanel.tsx` | AI workflow orchestration |
| Customer Detail | `CustomerDetailPage.tsx` | Customer profile view |
| Content Manager | `ContentManagerDashboard.tsx` | Content management |
| Activities | `ActivitiesPage.tsx` | Activity timeline |
| Services | `ServicesDashboard.tsx` | Service catalog |
| Campaigns | `CampaignBuilderPage.tsx` | Campaign builder |

---

## API Endpoints Required

Each agent should assume these backend endpoints exist:

### Authentication
```
POST   /v1/auth/login
POST   /v1/auth/logout
GET    /v1/auth/me
POST   /v1/auth/refresh
```

### Dashboard
```
GET    /v1/dashboard/metrics
GET    /v1/dashboard/widgets
PUT    /v1/dashboard/widgets/{id}
GET    /v1/dashboard/recent-activity
```

### Activities
```
GET    /v1/interactions
POST   /v1/interactions
GET    /v1/interactions/{id}
PUT    /v1/interactions/{id}
POST   /v1/interactions/{id}/complete
GET    /v1/interactions/customers/{customerId}/next
```

### Customers
```
GET    /v1/customers
POST   /v1/customers
GET    /v1/customers/{id}
PUT    /v1/customers/{id}
GET    /v1/customers/{id}/engagement-score
GET    /v1/customers/{id}/timeline
```

### Content
```
GET    /v1/content
POST   /v1/content/generate
GET    /v1/content/{id}
PUT    /v1/content/{id}/status
GET    /v1/content/templates
```

### Campaigns
```
GET    /v1/campaigns
POST   /v1/campaigns
GET    /v1/campaigns/{id}
PUT    /v1/campaigns/{id}
POST   /v1/campaigns/{id}/send
```

### AI
```
POST   /v1/ai/chat
POST   /v1/ai/generate
GET    /v1/ai/personalities
POST   /v1/ai/personalities/{id}/generate-response
```

### Search
```
GET    /v1/search?q={query}&type={type}
GET    /v1/search/semantic?q={query}
```

### WebSocket
```
WS     /ws/command-center
       Events: activity.*, customer.*, notification.*, ai.*
```

---

## Agent Assignment Instructions

When assigning work to Cursor agents, use this format:

```
@agent [CC-MODULE-ID] Build [Module Name]

Reference: COMMAND-CENTER-MASTER.md
Module Doc: cursor-instructions/[MODULE-ID].md
UI Patterns: /magic/patterns/[PatternFile].tsx

Dependencies: [List completed modules]
Outputs: [List expected deliverables]

Start immediately. Report completion to integration coordinator.
```

---

## Quality Gates

Each module must pass these checks before integration:

1. **TypeScript Strict** - No `any` types, all interfaces defined
2. **Component Tests** - Unit tests for all components
3. **Hook Tests** - Tests for custom hooks
4. **Accessibility** - ARIA labels, keyboard navigation
5. **Responsive** - Mobile, tablet, desktop breakpoints
6. **Dark Mode** - Full dark mode support
7. **Loading States** - Skeleton loaders for all async data
8. **Error Boundaries** - Error handling for all modules

---

## Next Steps

1. **Read this document completely**
2. **Review your assigned module document** (CC-CORE-XX.md, CC-SVC-XX.md, or CC-FT-XX.md)
3. **Check dependencies** - Ensure required modules are complete
4. **Implement module** - Follow patterns and contracts
5. **Test module** - Run quality gates
6. **Report completion** - Notify integration coordinator

---

## Module Documentation Index

- [CC-CORE-01: App Shell & Layout](./CC-CORE-01-APP-SHELL.md)
- [CC-CORE-02: Theme System](./CC-CORE-02-THEME-SYSTEM.md)
- [CC-CORE-03: Auth Context](./CC-CORE-03-AUTH-CONTEXT.md)
- [CC-SVC-01: WebSocket Service](./CC-SVC-01-WEBSOCKET.md)
- [CC-SVC-02: API Client Service](./CC-SVC-02-API-CLIENT.md)
- [CC-SVC-03: State Management](./CC-SVC-03-STATE-MANAGEMENT.md)
- [CC-SVC-04: Event Bus](./CC-SVC-04-EVENT-BUS.md)
- [CC-SVC-05: Search Service](./CC-SVC-05-SEARCH.md)
- [CC-SVC-06: AI Assistant Service](./CC-SVC-06-AI-SERVICE.md)
- [CC-SVC-07: Notification Service](./CC-SVC-07-NOTIFICATIONS.md)
- [CC-FT-01: Dashboard Module](./CC-FT-01-DASHBOARD.md)
- [CC-FT-02: Activities Module](./CC-FT-02-ACTIVITIES.md)
- [CC-FT-03: Customers Module](./CC-FT-03-CUSTOMERS.md)
- [CC-FT-04: Content Module](./CC-FT-04-CONTENT.md)
- [CC-FT-05: Campaigns Module](./CC-FT-05-CAMPAIGNS.md)
- [CC-FT-06: Services Module](./CC-FT-06-SERVICES.md)
- [CC-FT-07: AI Hub Module](./CC-FT-07-AI-HUB.md)
