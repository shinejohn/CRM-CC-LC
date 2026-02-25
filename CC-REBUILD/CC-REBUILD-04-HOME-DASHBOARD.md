# CC-REBUILD-04: Home Dashboard
## Agent D — Phase 2 (Depends on: CC-REBUILD-01 Layout, CC-REBUILD-03 Theme)

---

## Mission
Build the main Command Center home dashboard — the first screen SMBs see when they log in. This is the "wow" page with color-coded zone cards, AI assistant, activity feeds, and the "Order Services" CTA.

## Magic Patterns Reference Files
- `UnifiedCommandCenter.tsx` → PRIMARY: The complete dashboard with Header, MainContent (card grid), RightSidebar
- `CentralCommandDashboard.tsx` → SECONDARY: Alternative layout with activity section and AI control panel
- `MyBusinessProfilePage.tsx` → Configuration cards pattern, gradient cards with navigation

## What to Build

### `resources/js/pages/alphasite/crm/index.tsx`

**The main home dashboard.** Follow `UnifiedCommandCenter.tsx` MainContent:

**Top Section:**
- "Order Services" CTA button — full-width gradient card (from-[#1E3A5F] to-blue-700), Sparkles icon, "Explore packages & add-ons", ChevronRight — links to subscription enrollment
- Search bar below

**Card Grid (3 columns × 2 rows):**

| Card 1: MY SERVICES (mint) | Card 2: CRM & CUSTOMERS (sky) | Card 3: JOBS & INVOICES (lavender) |
| Card 4: BUSINESS OPS (cyan) | Card 5: SALES & BILLING (peach) | Card 6: MARKETING (rose) |

Each card from `UnifiedCommandCenter.tsx`:
- Colored gradient header with icon + title + ColorPicker + expand button
- 3 activity items inside with dot indicators, titles, timestamps
- Click navigates to the relevant verb zone
- Cards use `getCardStyle()` from shared theme

**Card → Zone Mapping:**
- MY SERVICES → `/crm/automate` (AI services)
- CRM & CUSTOMERS → `/crm/deliver` (customer management)
- JOBS & INVOICES → `/crm/sell` (sales pipeline)
- BUSINESS OPS → `/crm/define` (business profile)
- SALES & BILLING → `/crm/sell/services` (service purchase)
- MARKETING → `/crm/attract` (campaigns)

**Zone Completion Cards Row (below grid):**
6 small horizontal cards showing each zone's completion percentage:
```
[DEFINE 40%] [ATTRACT 10%] [SELL 0%] [DELIVER 25%] [MEASURE 15%] [AUTOMATE 30%]
```
Each with zone color, progress bar, click to navigate

**Data from Backend (Inertia props):**
```typescript
interface Props {
  business: Business;
  subscription: Subscription | null;
  commandCenter: {
    metrics: Record<string, number>;
    alerts: AlertType[];
    activity: ActivityItem[];
    quick_actions: QuickAction[];
  };
  zoneCompletion: Record<ZoneName, number>;
}
```

## Acceptance Criteria
- [ ] Dashboard renders with 6 color-coded cards in 3×2 grid
- [ ] Cards are clickable and navigate to correct zone
- [ ] "Order Services" CTA is prominent at top
- [ ] Zone completion row shows progress for all 6 zones
- [ ] Activity items display within cards
- [ ] ColorPicker works on each card
- [ ] Uses `CommandCenterLayout` with `activeZone='home'`
- [ ] Responsive: 3 cols → 2 cols → 1 col
- [ ] Dark mode works

## Files to Create
1. `resources/js/pages/alphasite/crm/index.tsx`
