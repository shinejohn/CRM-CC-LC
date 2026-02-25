# CC-REBUILD-01: Layout & Navigation
## Agent A — Foundation (No Dependencies)

---

## Mission
Replace the flat sidebar CRM layout with a 6-verb navigation system using a left navigation rail + main content + optional right sidebar.

## Magic Patterns Reference Files
- `UnifiedCommandCenter.tsx` → Overall layout structure (Header + MainContent + RightSidebar)
- `NavigationRail.tsx` → 140px left nav with icon+label items
- `CentralCommandDashboard.tsx` → Alternative layout with aside sidebar
- `index.css` → Complete Nexus theme CSS variables, nav-rail styles, card styles, glass panels

## What to Build

### 1. `resources/js/layouts/command-center-layout.tsx`

Replace `alphasite-crm-layout.tsx` for all CC pages. Structure:

```
┌─────────────────────────────────────────────────────┐
│                    HEADER BAR                        │
│  [Logo] [Business Name] [Search] [Notif] [AM-AI] [Profile] │
├──────┬──────────────────────────────┬───────────────┤
│      │                              │               │
│ NAV  │       MAIN CONTENT           │   RIGHT       │
│ RAIL │       (children)             │   SIDEBAR     │
│      │                              │  (optional)   │
│ 140px│       flex-1                 │    280px      │
│      │                              │               │
│ DEFINE│                              │  Quick Access │
│ ATTRACT│                             │  Tasks        │
│ SELL  │                              │  Email        │
│ DELIVER│                             │  Calendar     │
│ MEASURE│                             │  AI Chat      │
│ AUTOMATE│                            │               │
│      │                              │               │
└──────┴──────────────────────────────┴───────────────┘
```

**Props Interface:**
```typescript
interface CommandCenterLayoutProps {
  business: Business;
  subscription: Subscription | null;
  children: ReactNode;
  title?: string;
  activeZone?: ZoneName;
  showRightSidebar?: boolean;
  rightSidebarContent?: ReactNode;
}
```

**Navigation Rail Items:**
```typescript
const navItems = [
  { zone: 'home',     href: 'alphasite.crm.command-center', label: 'Home',     icon: Command,      color: 'text-slate-600' },
  { zone: 'define',   href: 'alphasite.crm.define',          label: 'Define',   icon: UserCircle,   color: 'text-purple-600' },
  { zone: 'attract',  href: 'alphasite.crm.attract',         label: 'Attract',  icon: Target,       color: 'text-pink-600' },
  { zone: 'sell',     href: 'alphasite.crm.sell',            label: 'Sell',     icon: ShoppingCart,  color: 'text-green-600' },
  { zone: 'deliver',  href: 'alphasite.crm.deliver',         label: 'Deliver',  icon: Truck,        color: 'text-blue-600' },
  { zone: 'measure',  href: 'alphasite.crm.measure',         label: 'Measure',  icon: BarChart3,    color: 'text-teal-600' },
  { zone: 'automate', href: 'alphasite.crm.automate',        label: 'Automate', icon: Zap,          color: 'text-amber-600' },
];
```

**Key behaviors from Magic Patterns:**
- Nav rail is 140px wide, fixed left, full height
- Each nav item shows icon + label vertically stacked
- Active item gets colored background + left border accent matching zone color
- Hover: `translateX(5px)` shift, background highlight
- Bottom of nav rail: "View Public Page" link + theme toggle
- Trial banner appears above main content if trial ≤ 14 days

### 2. `resources/js/components/command-center/NavigationRail.tsx`

Extract the nav rail as a standalone component. Follow `NavigationRail.tsx` from Magic Patterns:
- 140px fixed width
- Icon + label per item (vertical stack)
- Active state with zone color
- Smooth transitions
- Mobile: collapsible hamburger → slide-out drawer

### 3. `resources/js/components/command-center/RightSidebar.tsx`

Follow `UnifiedCommandCenter.tsx` right sidebar section:
- 280px wide panel
- Expandable card system (Tasks, Email, Messages, Calendar, Files, Articles, Content Creator, Events, Ads)
- Each card has color scheme from `getColorScheme()` function
- Cards expand/collapse with chevron toggle
- AI Assistant section at top with voice button + chat input

### 4. `resources/js/components/command-center/CommandCenterHeader.tsx`

Follow `Header` component imported in `UnifiedCommandCenter.tsx`:
- Business name + logo
- Global search bar
- Notification bell with badge count
- Account Manager AI trigger button (Sparkles icon)
- User profile dropdown
- "Order Services" CTA button (gradient blue, prominent)

### 5. Update `routes/alphasite.php`

Add new route groups for verb-based navigation:
```php
// Command Center verb zones
Route::prefix('crm')->middleware(['auth'])->group(function () {
    Route::get('/define',           [CommandCenterController::class, 'define'])->name('alphasite.crm.define');
    Route::get('/define/profile',   [CommandCenterController::class, 'defineProfile'])->name('alphasite.crm.define.profile');
    Route::get('/define/survey',    [CommandCenterController::class, 'defineSurvey'])->name('alphasite.crm.define.survey');
    Route::get('/define/faqs',      [CommandCenterController::class, 'defineFaqs'])->name('alphasite.crm.define.faqs');
    
    Route::get('/attract',          [CommandCenterController::class, 'attract'])->name('alphasite.crm.attract');
    Route::get('/attract/campaigns',[CommandCenterController::class, 'attractCampaigns'])->name('alphasite.crm.attract.campaigns');
    Route::get('/attract/articles', [CommandCenterController::class, 'attractArticles'])->name('alphasite.crm.attract.articles');
    Route::get('/attract/events',   [CommandCenterController::class, 'attractEvents'])->name('alphasite.crm.attract.events');
    
    Route::get('/sell',             [CommandCenterController::class, 'sell'])->name('alphasite.crm.sell');
    Route::get('/sell/pipeline',    [CommandCenterController::class, 'sellPipeline'])->name('alphasite.crm.sell.pipeline');
    Route::get('/sell/services',    [CommandCenterController::class, 'sellServices'])->name('alphasite.crm.sell.services');
    
    Route::get('/deliver',          [CommandCenterController::class, 'deliver'])->name('alphasite.crm.deliver');
    Route::get('/measure',          [CommandCenterController::class, 'measure'])->name('alphasite.crm.measure');
    Route::get('/automate',         [CommandCenterController::class, 'automate'])->name('alphasite.crm.automate');
});
```

## Acceptance Criteria
- [ ] Navigation rail renders with 7 items (Home + 6 verbs)
- [ ] Active zone is highlighted with correct color
- [ ] Layout wraps all CC pages with consistent header + nav + content
- [ ] Right sidebar is toggleable
- [ ] Trial banner shows when applicable
- [ ] Mobile responsive — nav collapses to hamburger at < 768px
- [ ] Dark mode works throughout
- [ ] Existing pages still work (backward compatible routing)
- [ ] All new routes registered and accessible

## Files to Create
1. `resources/js/layouts/command-center-layout.tsx`
2. `resources/js/components/command-center/NavigationRail.tsx`
3. `resources/js/components/command-center/RightSidebar.tsx`
4. `resources/js/components/command-center/CommandCenterHeader.tsx`
5. `resources/js/types/command-center.ts` (shared types + ZONES config)

## Files to Modify
1. `routes/alphasite.php` — Add verb-based routes
2. `app/Http/Controllers/AlphaSite/CommandCenterController.php` — Add new methods (can return empty Inertia pages initially)
