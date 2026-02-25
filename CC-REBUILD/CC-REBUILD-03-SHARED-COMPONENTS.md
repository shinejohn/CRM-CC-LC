# CC-REBUILD-03: Shared Components & Theme
## Agent C — Foundation (No Dependencies)

---

## Mission
Build the shared component library and theme system that all other agents depend on. Includes metric cards, zone headers, action cards, activity feeds, color picker, and the Nexus theme CSS.

## Magic Patterns Reference Files
- `index.css` → Complete Nexus theme with CSS variables, card depths, glass panels, nav styles
- `UnifiedCommandCenter.tsx` → Card grid with `getCardStyle()` function, color schemes
- `CentralCommandDashboard.tsx` → Activity feed, metric cards, stat cards
- `DashboardWidgets.tsx` → Widget component structure
- `ColorPicker.tsx` → Card color customization

## What to Build

### 1. `resources/js/types/command-center.ts`

Shared types — see MASTER doc for full interface definitions including:
- `Business`, `Subscription`, `ZoneName`, `ZoneConfig`, `ZONES` constant
- `AccountManager`, `Message`, `Task` interfaces
- Color scheme types

### 2. `resources/js/components/command-center/MetricCard.tsx`

Reusable metric display card:
```typescript
interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: LucideIcon;
  color?: string;  // Zone color for accent
}
```
- From `CentralCommandDashboard.tsx` stat-card pattern
- Icon top-right, value large, label small, optional trend indicator
- Subtle gradient top border matching zone color

### 3. `resources/js/components/command-center/ZoneHeader.tsx`

Color-coded zone page header:
```typescript
interface ZoneHeaderProps {
  zone: ZoneName;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  completion?: number;  // 0-100 progress
}
```
- Background gradient from `ZONES[zone].gradient`
- Icon + title + subtitle
- Right side: completion ring (circular progress) + action buttons
- "Guide Don't Gate" messaging: if completion < 100, show "Works better with X" suggestion, NOT a lock

### 4. `resources/js/components/command-center/ActionCard.tsx`

Clickable card for zone actions:
```typescript
interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
  badge?: string;  // "New", "AI Powered", etc.
  stats?: { label: string; value: string }[];
  disabled?: boolean;
  comingSoon?: boolean;
}
```
- From `UnifiedCommandCenter.tsx` card grid pattern with `getCardStyle()`
- Hover: `translateY(-3px)` + shadow increase
- Active: scale down
- Color-coded gradient header matching card type
- Internal content items with dot indicators

### 5. `resources/js/components/command-center/ActivityFeed.tsx`

Real-time activity list:
```typescript
interface ActivityItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  timestamp: string;
  url?: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
  viewAllUrl?: string;
  maxItems?: number;
}
```
- From `CentralCommandDashboard.tsx` activity feed section
- Dot indicator + title + subtitle + relative timestamp
- Hover highlight with arrow-up-right link icon
- "View all →" link at bottom

### 6. `resources/js/components/command-center/ColorPicker.tsx`

Card color customization (from `ColorPicker.tsx` in Magic Patterns):
- Small button that opens a color palette popover
- Color options: mint, lavender, sky, rose, peach, ocean, sunshine, coral, violet
- Saves preference per card per user (localStorage initially)

### 7. `resources/css/command-center.css`

Extract key styles from `index.css` Magic Patterns file:
- CSS custom properties for the Nexus theme (light + dark)
- `.glass-card`, `.glass-panel` styles
- `.nexus-card` with proper depth/shadow system
- `.nav-item` hover/active states
- `.stat-card` and `.action-card` styles
- `.pulse-glow` animation for status indicators
- Card gradient definitions for each color scheme
- Import this in the main CSS build

### 8. Color Scheme Utility

From `UnifiedCommandCenter.tsx` `getCardStyle()` function — port this:
```typescript
// resources/js/lib/command-center-theme.ts
export function getCardStyle(cardId: string, defaultScheme: string) {
  // Returns: className, headerClass, textClass, contentBg, iconBg, iconColor, itemHover
}

export const COLOR_SCHEMES: Record<string, ColorScheme> = {
  mint:     { gradient: 'from-emerald-50 to-green-50', border: 'border-emerald-200', ... },
  lavender: { gradient: 'from-purple-50 to-violet-50', border: 'border-purple-200', ... },
  sky:      { gradient: 'from-blue-50 to-cyan-50',     border: 'border-blue-200',    ... },
  rose:     { gradient: 'from-pink-50 to-rose-50',     border: 'border-pink-200',    ... },
  peach:    { gradient: 'from-orange-50 to-amber-50',  border: 'border-orange-200',  ... },
  ocean:    { gradient: 'from-cyan-50 to-teal-50',     border: 'border-cyan-200',    ... },
  sunshine: { gradient: 'from-yellow-50 to-amber-50',  border: 'border-yellow-200',  ... },
  coral:    { gradient: 'from-red-50 to-orange-50',    border: 'border-red-200',     ... },
  violet:   { gradient: 'from-violet-50 to-indigo-50', border: 'border-violet-200',  ... },
};
```

## Acceptance Criteria
- [ ] All shared types compile with strict TypeScript
- [ ] MetricCard renders with all prop variants
- [ ] ZoneHeader shows correct colors for each zone
- [ ] ActionCard hover/click interactions work
- [ ] ActivityFeed renders with relative timestamps
- [ ] ColorPicker popover opens and saves selection
- [ ] CSS theme variables work in both light and dark mode
- [ ] All components are exported from an index file

## Files to Create
1. `resources/js/types/command-center.ts`
2. `resources/js/components/command-center/MetricCard.tsx`
3. `resources/js/components/command-center/ZoneHeader.tsx`
4. `resources/js/components/command-center/ActionCard.tsx`
5. `resources/js/components/command-center/ActivityFeed.tsx`
6. `resources/js/components/command-center/ColorPicker.tsx`
7. `resources/js/lib/command-center-theme.ts`
8. `resources/css/command-center.css`
9. `resources/js/components/command-center/index.ts` (barrel export)
