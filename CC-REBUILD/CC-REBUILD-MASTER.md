# COMMAND CENTER REBUILD — MASTER ORCHESTRATION
## Parallel Agent Build Instructions

**Date:** February 24, 2026  
**Scope:** Complete rebuild of Alphasite CRM → Command Center  
**Location:** `resources/js/pages/alphasite/crm/`  
**Layout:** `resources/js/layouts/alphasite-crm-layout.tsx`

---

## CRITICAL CONTEXT FOR ALL AGENTS

### What Exists (Keep)
- Laravel backend controllers & routes are functional
- `AlphasiteCrmLayout` provides sidebar + main content shell
- Existing pages: dashboard, profile, customers, interactions, faqs, surveys, coupon-claims, ai-services, ai-team, command-center, customer/show, revenue, community
- Backend API endpoints work — the problem is 100% frontend

### What's Wrong
- Navigation is a flat 9-item sidebar instead of 6-verb action zones
- Every page is read-only data display — no creation/editing tools
- No Account Manager AI component anywhere
- No color-coded zones, no progress tracking, no "Guide Don't Gate" philosophy
- No campaign builder, content creator, event manager, or sales pipeline

### The Vision (Magic Patterns Reference)
The UI specifications live in the project files as `.tsx` components. These are your visual and functional blueprints:

**Core Layout:**
- `UnifiedCommandCenter.tsx` — Main dashboard with color-coded card grid, AI sidebar, right sidebar quick access
- `CentralCommandDashboard.tsx` — Alternative dashboard with activity feeds, AI control panel
- `NavigationRail.tsx` — 140px fixed left nav rail with icon+label items
- `index.css` — Complete Nexus theme system with CSS variables, card styles, glass panels

**Account Manager AI:**
- `AccountManagerAI.tsx` — Full chat interface with voice, TTS, task sidebar, command center toggle
- `AccountManagerBar.tsx` — Wrapper that slides down from header
- `AIModeHub.tsx` — Sarah the AI Account Manager with team introductions
- `ChatPanel.tsx` — Reusable chat panel component
- `ExpandableChat.tsx` — Collapsible chat component

**Wizards & Builders:**
- `SubscriptionEnrollmentWizard.tsx` — Multi-step service purchase (business type → goals → publications → packages → add-ons → billing → payment → review)
- `MarketingDiagnosticWizard.tsx` — Step-by-step marketing assessment
- `MarketingCampaignWizard.tsx` — Campaign creation wizard with goal selection, package matching
- `MyBusinessProfilePage.tsx` — Rich business profile with configuration cards

**AI & Upsell:**
- `ServiceUpsellPrompt.tsx` — Contextual AI-driven service recommendations
- `ServiceUpsellChatMessage.tsx` — In-chat upsell with expand/collapse benefits
- `AIInterfacePage.tsx` — Full AI chat page with quick actions
- `AIInsightsPanel.tsx` — AI insights widget

**Content & Learning:**
- `LearningLessonPage.tsx` — Interactive lesson player with sections, chat assistant
- `LearningCenterHub.tsx` — Learning center hub page
- `ArticleCreator.tsx` — Article creation interface
- `EventCreator.tsx` — Event creation interface
- `ContentCreationFlow.tsx` — Content creation workflow

### Tech Stack
- React + TypeScript + Inertia.js (Laravel adapter)
- Tailwind CSS + shadcn/ui components
- Framer Motion for animations (add as dependency)
- Lucide React icons
- Ziggy for Laravel route generation

---

## AGENT DEPENDENCY MAP

```
PHASE 1 (Foundation) — No dependencies, start immediately
├── Agent A: CC-REBUILD-01 Layout & Navigation  
├── Agent B: CC-REBUILD-02 Account Manager AI Component
└── Agent C: CC-REBUILD-03 Shared Components & Theme

PHASE 2 (Core Pages) — Depends on Phase 1
├── Agent D: CC-REBUILD-04 Home Dashboard (needs Layout + Theme)
├── Agent E: CC-REBUILD-05 DEFINE Zone (needs Layout + AM-AI)
├── Agent F: CC-REBUILD-06 ATTRACT Zone (needs Layout + AM-AI)
└── Agent G: CC-REBUILD-07 SELL Zone (needs Layout + AM-AI)

PHASE 3 (Extended Pages) — Depends on Phase 1
├── Agent H: CC-REBUILD-08 DELIVER Zone (needs Layout + AM-AI)
├── Agent I: CC-REBUILD-09 MEASURE Zone (needs Layout + Theme)
└── Agent J: CC-REBUILD-10 AUTOMATE Zone (needs Layout + AM-AI)

PHASE 4 (Integration) — Depends on ALL above
└── Agent K: CC-REBUILD-11 Integration, Testing & Polish
```

**Parallel execution:** Phase 1 agents A/B/C run simultaneously. Phase 2 agents D/E/F/G run simultaneously once Phase 1 completes. Phase 3 agents H/I/J run simultaneously alongside Phase 2. Phase 4 runs last.

---

## FILE STRUCTURE TARGET

```
resources/js/
├── layouts/
│   └── command-center-layout.tsx          ← NEW (replaces alphasite-crm-layout for CC)
├── components/
│   └── command-center/
│       ├── AccountManagerAI.tsx           ← Slide-down AI chat
│       ├── AccountManagerBar.tsx          ← Header trigger wrapper
│       ├── NavigationRail.tsx             ← 6-verb left nav
│       ├── RightSidebar.tsx               ← Quick access cards
│       ├── MetricCard.tsx                 ← Reusable metric display
│       ├── ZoneHeader.tsx                 ← Color-coded zone header
│       ├── ActionCard.tsx                 ← Clickable action card
│       ├── ActivityFeed.tsx               ← Real-time activity list
│       ├── ProfileStrengthIndicator.tsx   ← Keep existing, enhance
│       ├── ServiceUpsellPrompt.tsx        ← AI upsell component
│       ├── ExpandableChat.tsx             ← Collapsible chat
│       └── ColorPicker.tsx                ← Card color customization
├── pages/
│   └── alphasite/
│       └── crm/
│           ├── index.tsx                  ← Home dashboard (UnifiedCommandCenter)
│           ├── define/
│           │   ├── index.tsx              ← DEFINE hub
│           │   ├── profile.tsx            ← Business profile editor
│           │   ├── survey.tsx             ← Inline survey
│           │   └── faqs.tsx               ← FAQ builder
│           ├── attract/
│           │   ├── index.tsx              ← ATTRACT hub
│           │   ├── campaigns.tsx          ← Campaign builder
│           │   ├── articles.tsx           ← Article creator
│           │   ├── events.tsx             ← Event manager
│           │   └── social.tsx             ← Social media manager
│           ├── sell/
│           │   ├── index.tsx              ← SELL hub
│           │   ├── pipeline.tsx           ← Sales pipeline
│           │   ├── quotes.tsx             ← Quote/proposal generator
│           │   ├── coupons.tsx            ← Coupon manager
│           │   └── services.tsx           ← Service purchase wizard
│           ├── deliver/
│           │   ├── index.tsx              ← DELIVER hub
│           │   ├── customers.tsx          ← Customer management
│           │   ├── interactions.tsx        ← Communication hub
│           │   └── tasks.tsx              ← Task manager
│           ├── measure/
│           │   ├── index.tsx              ← MEASURE hub
│           │   ├── analytics.tsx          ← Campaign analytics
│           │   └── reports.tsx            ← Custom reports
│           └── automate/
│               ├── index.tsx              ← AUTOMATE hub
│               ├── ai-team.tsx            ← AI employee manager
│               ├── workflows.tsx          ← Automation rules
│               └── ai-services.tsx        ← AI service catalog
```

---

## SHARED INTERFACES

All agents must use these TypeScript interfaces:

```typescript
// types/command-center.ts

export interface Business {
  id: string;
  name: string;
  slug: string;
  alphasite_subdomain: string | null;
  subscription_tier: string;
  city: string | null;
  state: string | null;
  smb_business_id?: string | null;
}

export interface Subscription {
  tier: string;  // 'trial' | 'basic' | 'standard' | 'premium' | 'enterprise'
  status: string;
  trial_expires_at: string | null;
  ai_services_enabled: string[];
}

export type ZoneName = 'home' | 'define' | 'attract' | 'sell' | 'deliver' | 'measure' | 'automate';

export interface ZoneConfig {
  name: ZoneName;
  label: string;
  verb: string;
  color: string;        // Tailwind color name
  gradient: string;     // Tailwind gradient classes
  icon: string;         // Lucide icon name
  description: string;
  completion: number;   // 0-100
}

export const ZONES: Record<ZoneName, ZoneConfig> = {
  home:     { name: 'home',     label: 'Command Center', verb: 'Overview',  color: 'slate',   gradient: 'from-slate-50 to-slate-100',     icon: 'Command',      description: 'Your business at a glance', completion: 0 },
  define:   { name: 'define',   label: 'Define',         verb: 'Define',    color: 'purple',  gradient: 'from-purple-50 to-violet-50',    icon: 'UserCircle',   description: 'Who you are',               completion: 0 },
  attract:  { name: 'attract',  label: 'Attract',        verb: 'Attract',   color: 'pink',    gradient: 'from-pink-50 to-rose-50',        icon: 'Target',       description: 'Get found by customers',    completion: 0 },
  sell:     { name: 'sell',     label: 'Sell',           verb: 'Sell',      color: 'green',   gradient: 'from-green-50 to-emerald-50',    icon: 'ShoppingCart', description: 'Close deals & get paid',    completion: 0 },
  deliver:  { name: 'deliver',  label: 'Deliver',        verb: 'Deliver',   color: 'blue',    gradient: 'from-blue-50 to-cyan-50',        icon: 'Truck',        description: 'Run operations smoothly',   completion: 0 },
  measure:  { name: 'measure',  label: 'Measure',        verb: 'Measure',   color: 'teal',    gradient: 'from-teal-50 to-cyan-50',        icon: 'BarChart3',    description: 'See what\'s working',       completion: 0 },
  automate: { name: 'automate', label: 'Automate',       verb: 'Automate',  color: 'amber',   gradient: 'from-amber-50 to-yellow-50',     icon: 'Zap',          description: 'Let AI handle it',          completion: 0 },
};

export interface AccountManager {
  name: string;
  avatar: string;
  specialty: string;
  phone: string;
  email: string;
}
```

---

## BACKEND API ENDPOINTS (Already Exist)

Agents should use Inertia.js page props from controllers. Key existing endpoints:

```
GET  /alphasite/crm/command-center     → CommandCenterController@index
GET  /alphasite/crm/dashboard          → SMBCrmController@dashboard
GET  /alphasite/crm/profile            → SMBCrmController@profile
GET  /alphasite/crm/customers          → SMBCrmController@customers
GET  /alphasite/crm/customers/{id}     → SMBCrmController@customerShow
GET  /alphasite/crm/interactions       → SMBCrmController@interactions
GET  /alphasite/crm/faqs              → SMBCrmController@faqs
GET  /alphasite/crm/surveys           → SMBCrmController@surveys
GET  /alphasite/crm/coupon-claims     → CouponClaimsController@index
GET  /alphasite/crm/ai-services       → SMBCrmController@aiServices
GET  /alphasite/crm/ai-team           → SMBCrmController@aiTeam
GET  /alphasite/crm/revenue           → RevenueProductPurchaseController@index
GET  /alphasite/crm/community         → SMBCrmController@community
```

**For new routes:** Add to `routes/alphasite.php` inside the CRM middleware group. Use the same controller pattern.

---

## QUALITY STANDARDS (ALL AGENTS)

1. **TypeScript Strict** — No `any` types. Define all interfaces.
2. **shadcn/ui** — Use existing components from `@/components/ui/`
3. **Inertia.js** — Use `Head`, `Link`, `router`, `useForm` from `@inertiajs/react`
4. **Ziggy** — Use `route()` from `ziggy-js` for all URLs
5. **Responsive** — Mobile-first, test at 375px, 768px, 1024px, 1440px
6. **Dark Mode** — Use Tailwind `dark:` variants throughout
7. **Loading States** — Skeleton loaders for all async content
8. **Error States** — Graceful error handling with retry
9. **Animations** — Use Framer Motion sparingly for meaningful transitions
10. **Guide Don't Gate** — Show everything, use visual hierarchy to guide, never lock content behind tiers

---

## HANDOFF FORMAT

Each agent reports completion with:
```
MODULE: CC-REBUILD-XX
STATUS: COMPLETE
FILES CREATED: [list]
FILES MODIFIED: [list]
NEW ROUTES NEEDED: [list, if any]
NEW CONTROLLER METHODS NEEDED: [list, if any]
DEPENDENCIES MET: [yes/no + details]
INTEGRATION NOTES: [any notes for Phase 4 agent]
```
