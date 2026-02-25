# CC-REBUILD-11: Integration, Testing & Polish
## Agent K — Phase 4 (Depends on: ALL previous agents)

---

## Mission
Wire everything together, verify all routes work, ensure cross-zone navigation is seamless, polish animations, and validate the complete experience.

## Verification Checklist

### Route Verification
```bash
# Verify all new routes are registered
php artisan route:list --path=crm

# Expected routes (minimum):
# GET /alphasite/crm/command-center  → Home dashboard
# GET /alphasite/crm/define          → DEFINE hub
# GET /alphasite/crm/define/profile  → Profile editor
# GET /alphasite/crm/define/survey   → Survey
# GET /alphasite/crm/define/faqs     → FAQ builder
# GET /alphasite/crm/attract         → ATTRACT hub
# GET /alphasite/crm/attract/campaigns → Campaign builder
# GET /alphasite/crm/attract/articles  → Article creator
# GET /alphasite/crm/attract/events    → Event manager
# GET /alphasite/crm/sell            → SELL hub
# GET /alphasite/crm/sell/pipeline   → Pipeline
# GET /alphasite/crm/sell/services   → Service wizard
# GET /alphasite/crm/sell/coupons    → Coupon manager
# GET /alphasite/crm/deliver         → DELIVER hub
# GET /alphasite/crm/deliver/customers    → Customers
# GET /alphasite/crm/deliver/interactions → Communication
# GET /alphasite/crm/deliver/tasks        → Tasks
# GET /alphasite/crm/measure         → MEASURE hub
# GET /alphasite/crm/measure/analytics → Analytics
# GET /alphasite/crm/measure/reports   → Reports
# GET /alphasite/crm/automate        → AUTOMATE hub
# GET /alphasite/crm/automate/ai-team    → AI employees
# GET /alphasite/crm/automate/workflows  → Automation rules
# GET /alphasite/crm/automate/ai-services → AI catalog
```

### Navigation Flow Testing
1. Home → Click each zone card → Verify correct zone hub loads
2. Zone hub → Click each action card → Verify correct sub-page loads  
3. Nav rail → Click each item → Verify active state updates + page loads
4. Account Manager AI → Open from header → Works on every page
5. Account Manager AI → Zone context changes when navigating
6. Back button → Browser history works correctly
7. Direct URL → Each route loads independently (not just through navigation)

### Component Integration
- [ ] All pages use `CommandCenterLayout` (not old `AlphasiteCrmLayout`)
- [ ] All pages pass correct `activeZone` prop to layout
- [ ] `ZoneHeader` renders with correct colors on every zone page
- [ ] `MetricCard` displays real data (not just zeros)
- [ ] `ActionCard` click handlers navigate to correct pages
- [ ] `ActivityFeed` shows recent data
- [ ] `AccountManagerBar` opens/closes from every page
- [ ] `ExpandableChat` works on zone hub pages
- [ ] `ServiceUpsellPrompt` can be triggered from AI chat

### Backward Compatibility
- [ ] Old URLs (/crm/dashboard, /crm/profile, /crm/customers, etc.) redirect to new zone equivalents
- [ ] No broken links in existing email templates or notifications
- [ ] Ziggy route names still resolve for old controllers

### Add Redirects for Old Routes
```php
// In routes/alphasite.php — redirect old routes to new structure
Route::redirect('/crm/dashboard', '/crm/command-center');
Route::redirect('/crm/profile', '/crm/define/profile');
Route::redirect('/crm/customers', '/crm/deliver/customers');
Route::redirect('/crm/interactions', '/crm/deliver/interactions');
Route::redirect('/crm/faqs', '/crm/define/faqs');
Route::redirect('/crm/surveys', '/crm/define/survey');
Route::redirect('/crm/ai-services', '/crm/automate/ai-services');
Route::redirect('/crm/ai-team', '/crm/automate/ai-team');
Route::redirect('/crm/coupon-claims', '/crm/sell/coupons');
Route::redirect('/crm/revenue', '/crm/sell');
```

### Responsive Testing
Test at these breakpoints:
- **375px** (iPhone SE) — Single column, hamburger nav, no right sidebar
- **768px** (iPad) — Two columns, collapsible nav rail, no right sidebar
- **1024px** (Laptop) — Full layout, nav rail visible, right sidebar optional
- **1440px** (Desktop) — Full layout with right sidebar

### Dark Mode Verification
- [ ] Every page looks correct in dark mode
- [ ] No white flashes on navigation
- [ ] Charts/graphs adapt to dark backgrounds
- [ ] Zone colors work in both modes

### Performance
- [ ] No page takes > 2s to load
- [ ] Animations are 60fps (no jank)
- [ ] No unnecessary re-renders
- [ ] Images/assets are lazy-loaded

### Polish
- [ ] Add Framer Motion page transitions between zones
- [ ] Add loading skeletons for all async data areas
- [ ] Add empty states with helpful messaging for new accounts
- [ ] Add keyboard shortcuts: Cmd+K for search, Cmd+1-6 for zone navigation
- [ ] Add breadcrumb trail: Home > Define > Profile
- [ ] Ensure all buttons have hover states
- [ ] Ensure all interactive elements have focus states for accessibility

## Final Deliverable
A working Command Center that:
1. Opens to a beautiful dashboard with 6 color-coded zone cards
2. Navigates between zones via the left nav rail
3. Has the Account Manager AI accessible from every page
4. Allows SMBs to CREATE content, BUILD campaigns, MANAGE customers (not just view data)
5. Follows "Guide Don't Gate" — everything visible, nothing locked
6. Works on mobile, tablet, and desktop
7. Looks great in both light and dark mode
