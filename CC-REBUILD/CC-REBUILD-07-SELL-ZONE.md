# CC-REBUILD-07: SELL Zone
## Agent G — Phase 2 (Depends on: CC-REBUILD-01 Layout, CC-REBUILD-02 AM-AI, CC-REBUILD-03 Theme)

---

## Mission
Build the SELL zone — "Close Deals & Get Paid." Sales pipeline, service purchase wizard, coupon manager, quotes/proposals.

## Magic Patterns Reference Files
- `SubscriptionEnrollmentWizard.tsx` → PRIMARY: 9-step purchase wizard (business type → goals → publications → packages → add-ons → billing → payment → review)
- `data.ts` → Business types, goals, publications, packages data
- `types.ts` → TypeScript interfaces for wizard
- `StepBusinessType.tsx`, `StepGoals.tsx`, `StepPublications.tsx`, `StepPackages.tsx`, `StepAddOns.tsx`, `StepBillingCycle.tsx`, `StepPayment.tsx`, `StepReview.tsx` → Individual wizard steps
- `ProgressIndicator.tsx`, `StepNavigation.tsx`, `ProgressHeader.tsx` → Wizard navigation
- `PipelinePage.tsx` → Sales pipeline view
- `DealDetailPage.tsx` → Deal detail
- `DealCard.tsx` → Pipeline deal card
- `RevenueStreams.tsx` → Revenue display
- `InvoiceCard.tsx`, `InvoiceDetailPage.tsx`, `InvoicesListPage.tsx` → Invoice management

## What to Build

### 1. `resources/js/pages/alphasite/crm/sell/index.tsx` — SELL Hub

Green-themed zone page:
- **ZoneHeader**: "Close Deals & Get Paid" with green gradient, ShoppingCart icon
- **Revenue Summary**: Total revenue, MRR, outstanding invoices
- **Sales Pipeline Mini**: Visual pipeline showing deal counts per stage
- **Recent Activity**: Latest quotes sent, coupons redeemed, payments received
- **Quick Actions**: "Create Quote" / "New Coupon" / "View Pipeline" / "Order Services"

### 2. `resources/js/pages/alphasite/crm/sell/pipeline.tsx` — Sales Pipeline

Kanban-style pipeline from `PipelinePage.tsx`:
- Columns: Lead → Qualified → Proposal → Negotiation → Won / Lost
- Deal cards with: customer name, deal value, days in stage, probability
- Drag-and-drop between stages (or click to move)
- Quick-add deal button per column
- Pipeline metrics bar: total value, weighted value, avg deal size, win rate

### 3. `resources/js/pages/alphasite/crm/sell/services.tsx` — Service Purchase Wizard

Port `SubscriptionEnrollmentWizard.tsx` with all 9 steps:

**Step 1: Business Type** — Select from: Restaurant, Retail, Professional, Home Services, Venue, Performer, Creator, Other (from `data.ts`)

**Step 2: Goals** — Multi-select: Get More Customers, Promote Events, Build Online Presence, Run Advertising, Sell Online, Establish Thought Leadership

**Step 3: Publications** — Select which Fibonacco publications: Day.News, Downtown Guide, GoEventCity, Alphasite

**Step 4: Packages** — Community Influencer / Community Expert / Sponsor tiers with pricing, features, scarcity counts ("Only X spots left in [category]!")

**Step 5: Add-Ons** — Optional additions with pricing

**Step 6: Billing Cycle** — Monthly vs annual (with discount)

**Step 7: Payment** — Payment form (Stripe elements placeholder)

**Step 8: Review** — Complete order summary

**Step 9: Confirmation** — Success page with next steps

Progress indicator at top showing all steps. Back/Next navigation. Account Manager AI available throughout.

### 4. `resources/js/pages/alphasite/crm/sell/coupons.tsx` — Coupon Manager

Enhanced from existing `coupon-claims.tsx`:
- **Create Coupon** form: title, discount type (%, $, BOGO), expiration, usage limit, targeting
- **Active Coupons** list with redemption counts
- **Coupon Analytics**: redemptions, revenue impact, popular coupons
- **QR Code generation** for in-store use

## Acceptance Criteria
- [ ] SELL hub shows revenue summary and pipeline mini
- [ ] Pipeline has visual kanban with deal cards
- [ ] Service purchase wizard has all 9 steps
- [ ] Scarcity messaging shows correct spot counts
- [ ] Coupon creator allows full customization
- [ ] Green zone theming throughout

## Files to Create
1. `resources/js/pages/alphasite/crm/sell/index.tsx`
2. `resources/js/pages/alphasite/crm/sell/pipeline.tsx`
3. `resources/js/pages/alphasite/crm/sell/services.tsx`
4. `resources/js/pages/alphasite/crm/sell/coupons.tsx`
