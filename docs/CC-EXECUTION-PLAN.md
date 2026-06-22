# Command Center — Full Execution Plan

Based on live code assessment. All frontend pages are confirmed static mocks with hardcoded data. Backend is production-grade. Execution is entirely API wiring + missing backend jobs.

---

## PHASE 1 — Revenue Blockers
**Goal:** Make recurring subscriptions actually collect money.
**Target: ~8 days**

---

### AGENT 1A — Subscription Auto-Renewal (Backend)
**File scope:** `app/Services/StripeService.php`, `app/Jobs/RenewSubscriptions.php` (new), `app/Console/Kernel.php`

**Task:**
Audit whether `createSubscription` delegates renewal to Stripe's own subscription scheduler or creates a one-time `PaymentIntent`. If it's manual PaymentIntent, migrate to Stripe `Subscription` objects so Stripe handles renewal, proration, and period tracking automatically.

- Create `RenewSubscriptions` job as a fallback cron if Stripe Subscriptions are already in use but the `customer.subscription.renewed` webhook handler is missing
- Verify webhook handler for `invoice.payment_succeeded` updates `ServiceSubscription.current_period_end` and sets `status = active`
- Verify webhook handler for `customer.subscription.deleted` sets `status = cancelled`
- Add scheduler entry: daily at 08:00, process any `ServiceSubscription` records where `current_period_end < now()` and `stripe_subscription_id` is null (manual fallback only)

**Acceptance:** A subscription created today will automatically charge at period end without manual intervention.

---

### AGENT 1B — Dunning System (Backend)
**File scope:** `app/Services/DunningService.php` (new), `app/Jobs/ProcessFailedPayments.php` (new), webhook handler in `StripeWebhookController.php`

**Task:**
Build a retry + notification pipeline triggered by `invoice.payment_failed` webhook:

Retry schedule:
- Day 0: Initial failure → send "payment failed" email via `EmailService`
- Day 3: Auto-retry charge
- Day 7: Auto-retry + email warning ("subscription pauses in 3 days")
- Day 10: Suspend subscription (`status = past_due`), send suspension email with update-card link
- Day 14: Cancel subscription, send cancellation email

Create `DunningAttempt` model/migration: `subscription_id`, `attempt_number`, `attempted_at`, `result`, `next_attempt_at`.

Wire `invoice.payment_failed` and `invoice.payment_action_required` webhooks to `DunningService::handleFailure()`.

**Acceptance:** A failed charge triggers the retry sequence automatically; subscription suspends then cancels on schedule.

---

### AGENT 1C — Payment Method Management (Backend + Frontend)
**Backend files:** `app/Http/Controllers/PaymentMethodController.php` (new), routes
**Frontend files:** `BillingDashboard.tsx` — wire the "Change Plan" and payment method section

**Backend task:**
- `POST /billing/payment-methods/setup` → create Stripe `SetupIntent`, return `client_secret`
- `POST /billing/payment-methods` → attach PaymentMethod to customer, set as default
- `GET /billing/payment-methods` → list saved cards (last4, brand, expiry)
- `DELETE /billing/payment-methods/{id}` → detach

**Frontend task:**
`BillingDashboard.tsx` currently shows a hardcoded "Visa ending in 4242". Replace with:
- `GET /billing/payment-methods` on mount → render real saved cards
- "Update Payment Method" button → open Stripe Elements `CardElement` using `SetupIntent` client_secret from backend
- On save → `POST /billing/payment-methods` → refresh list

**Acceptance:** Customer can view, add, and replace payment methods from the billing page.

---

### AGENT 1D — Post-Purchase Email Sequence (Backend)
**File scope:** `app/Listeners/OrderConfirmedListener.php` (new or wire existing), email templates

**Task:**
Wire `checkout.session.completed` webhook (already handled) to fire:
1. Order confirmation email (if not already sending) — order items, amount, next billing date
2. Welcome email 1 hour later via queued job — what they bought, how to access it, account manager intro (Marcus Webb)
3. Day 3 check-in email — "Getting started?" with link to Learning Center campaign for their package

Use existing `EmailService` and `CampaignActionExecutor` patterns. Create 3 email templates following the existing seeder format.

**Acceptance:** A completed checkout triggers confirmation + welcome + day-3 emails automatically.

---

## PHASE 2 — Sales Enablement (CRM Wiring)
**Goal:** Account managers can manage deals, quotes, and invoices from the browser.
**Target: ~7 days**

All CRM pages exist as static mocks. Backend CRUD is confirmed built. This phase is pure API wiring.

---

### AGENT 2A — Customer Detail Page (API Wire)
**File:** `CustomerDetailPage.tsx`

**Task:**
- Accept `customerId` prop (currently renders hardcoded "John Smith")
- On mount: `GET /customers/{id}` → populate profile header, contact info, stats
- Tabs: wire each tab to its API endpoint:
  - Overview: recent activity from `GET /customers/{id}/activities`
  - Deals/Jobs: `GET /customers/{id}/deals`
  - Quotes/Proposals: `GET /customers/{id}/quotes`
  - Invoices: `GET /customers/{id}/invoices`
  - Communications: `GET /customers/{id}/emails`
- "Edit" button → navigate to `AddEditCustomerForm` with customer data pre-filled
- "Schedule Activity" modal → wire `ScheduleActivityModal` to `POST /activities`
- "Create Quote" modal → wire `QuickCreateModal` to `POST /quotes`

**Acceptance:** Clicking any customer in the list opens their real data.

---

### AGENT 2B — Pipeline + Deal CRUD (API Wire)
**Files:** `PipelinePage.tsx`, `DealDetailPage.tsx`, `MarkDealWonModal.tsx`, `MarkDealLostModal.tsx`

**Task:**
`PipelinePage.tsx`:
- Replace hardcoded columns/deals with `GET /deals?group_by=stage`
- Drag-drop between columns → `PATCH /deals/{id}` with new `stage`
- "New Deal" button → open create form → `POST /deals`
- Deal cards → navigate to `DealDetailPage` passing real `dealId`

`DealDetailPage.tsx`:
- Accept `dealId` prop → `GET /deals/{id}` on mount
- "Edit" → inline form → `PUT /deals/{id}`
- "Mark Won" button → open `MarkDealWonModal` → wire `onMarkWon` to `POST /deals/{id}/won`
- "Mark Lost" → `MarkDealLostModal` → `POST /deals/{id}/lost`
- "Create Proposal" → navigate to quote builder with `deal_id` pre-set

`MarkDealWonModal` and `MarkDealLostModal` both have full form UI. Wire their submit handlers to the API calls above.

**Acceptance:** Full deal lifecycle manageable from browser.

---

### AGENT 2C — Quotes Builder + Customer Acceptance (API Wire)
**Files:** `QuotesListPage.tsx`, `ProposalDetailPage.tsx`, `ProposalForm.tsx`, `ClientProposalPage.tsx`

**Task:**
`QuotesListPage.tsx`:
- Replace hardcoded kanban with `GET /quotes?group_by=status`
- "New Quote" → route to `ProposalForm`
- Card click → `ProposalDetailPage` with real `quoteId`

`ProposalForm.tsx`:
- Wire to `POST /quotes` on submit (line items, customer, expiry, notes)
- "Send to Customer" → `POST /quotes/{id}/send` → emails customer a link

`ProposalDetailPage.tsx`:
- `GET /quotes/{id}` on mount → render real data
- "Convert to Invoice" → `POST /quotes/{id}/convert`
- Status badge reflects real status

`ClientProposalPage.tsx` (customer-facing, public route):
- `GET /quotes/{token}` → render quote for customer
- "Accept" button → `POST /quotes/{token}/accept` → triggers invoice creation
- "Decline" button → `POST /quotes/{token}/decline`

**Acceptance:** Account manager creates quote, sends link, customer accepts online, invoice auto-creates.

---

### AGENT 2D — Invoice Workflow (API Wire)
**Files:** `InvoicesListPage.tsx`, `InvoiceDetailPage.tsx`, `CreateInvoiceModal.tsx`, `RecordPaymentModal.tsx`, `SendPaymentReminderModal.tsx`

**Task:**
`InvoicesListPage.tsx`:
- `GET /invoices` on mount → replace hardcoded list
- Status filter tabs → pass `?status=` param
- "New Invoice" → open `CreateInvoiceModal`

`CreateInvoiceModal.tsx`:
- Wire to `POST /invoices` — customer selector (typeahead from `GET /customers?q=`), line items, due date

`InvoiceDetailPage.tsx`:
- `GET /invoices/{id}` → render real data
- "Record Payment" → `RecordPaymentModal` → `POST /invoices/{id}/payments`
- "Send Reminder" → `SendPaymentReminderModal` → `POST /invoices/{id}/remind`
- "Send Invoice" button → `POST /invoices/{id}/send`

**Acceptance:** Full invoice lifecycle from creation through payment recordable from browser.

---

### AGENT 2E — Task / Activity Creation (API Wire)
**Files:** `ScheduleActivityModal.tsx`, `ActivitiesPage.tsx`, `ActivityLogFullView.tsx`

**Task:**
`ScheduleActivityModal.tsx` — already has full form UI (type, date, notes, assignee). Wire submit to `POST /activities`.

`ActivitiesPage.tsx`:
- `GET /activities?due=today` and `GET /activities?status=overdue` on mount
- Complete button → `PATCH /activities/{id}` `{status: 'completed'}`
- Filter tabs → pass status param

`ActivityLogFullView.tsx`:
- `GET /activities` with pagination → replace hardcoded list

**Acceptance:** Follow-ups schedulable from any customer/deal context; activity list shows real data.

---

## PHASE 3 — Growth Features
**Goal:** Campaign management from UI; subscription self-service.
**Target: ~7 days**

---

### AGENT 3A — Campaign Management UI
**File:** `CampaignBuilderPage.tsx` + `ContentManagerDashboard.tsx`

**Task:**
`CampaignBuilderPage.tsx` has a 4-step shell (Audience → Design → Schedule → Review) with no API calls. Wire it:
- Step 1 Audience: `GET /segments` for audience selection; manual filter builder
- Step 2 Design: subject line + body editor (use existing rich text pattern from ArticleCreator); variable picker (`{{business_name}}` etc.)
- Step 3 Schedule: date/time picker; send now vs scheduled toggle
- Step 4 Review: summary → `POST /campaigns` on confirm

`ContentManagerDashboard.tsx`:
- `GET /campaigns` on mount → list with status, sent count, open rate
- Campaign row click → detail view with per-email metrics from `GET /campaigns/{id}/metrics`
- Pause/Resume/Delete actions wired to API

**Acceptance:** Account manager can build, schedule, and monitor campaigns without CLI.

---

### AGENT 3B — Campaign Performance Dashboard
**File:** `MarketingReportPage.tsx`, `PerformanceDashboard.tsx`

**Task:**
Both pages render static charts. Wire to real metrics API:
- `GET /campaigns/metrics/summary` → total sent, avg open rate, avg click rate, unsubscribe rate
- `GET /campaigns/{id}/metrics` → per-campaign open/click/reply timeseries
- Use existing `recharts` (already in project) to render line charts for open rate over time, bar chart for per-campaign comparison
- `GET /customers/engagement-scores/distribution` → histogram of engagement scores

**Acceptance:** Marketing performance reflects real campaign data.

---

### AGENT 3C — Subscription Upgrade/Downgrade UI
**Files:** `PlanUpgradeFlow.tsx`, `PlanComparisonPage.tsx`, `BillingDashboard.tsx`

**Task:**
`PlanComparisonPage.tsx`:
- `GET /services?type=subscription` → render real tiers with features and pricing
- "Select Plan" → route to `PlanUpgradeFlow` with target tier

`PlanUpgradeFlow.tsx`:
- Current plan vs target plan shown
- Proration calculated via `GET /billing/prorate?target_tier={id}` 
- Confirm → `POST /subscriptions/{id}/upgrade` or `/downgrade`
- Stripe handles proration via `ProrationService` (backend already built)

`BillingDashboard.tsx`:
- "Change Plan" button → route to `PlanComparisonPage`
- Active subscription pulled from `GET /subscriptions/active`

**Acceptance:** Customer can self-serve plan changes with proration preview.

---

### AGENT 3D — Coupon / Discount System (Backend + UI)
**Backend files:** `app/Models/Coupon.php`, `app/Http/Controllers/CouponController.php`, migration
**Frontend files:** `StepPayment.tsx` (pitch wizard), order checkout

**Backend task:**
- `Coupon` model: `code`, `type` (percent/fixed), `amount`, `max_uses`, `uses_count`, `expires_at`, `applicable_service_ids`
- `POST /coupons` (admin) — create coupon
- `POST /coupons/validate` — check code, return discount amount
- Apply coupon to Stripe checkout via `coupon` or `discounts` param on `createCheckoutSession`

**Frontend task:**
- `StepPayment.tsx` — add coupon code field; on blur call `/coupons/validate`; show discount applied; pass `coupon_code` to checkout endpoint
- Same pattern for direct order checkout

**Acceptance:** Promo codes work in both checkout paths.

---

## PHASE 4 — Experience Polish
**Goal:** Close the post-purchase loop; make campaigns interactive; professional document output.
**Target: ~5 days**

---

### AGENT 4A — Interactive Campaign Slides
**Context:** FibonaccoPlayer has 34 slide types, all read-only. Three new types needed.

**Task:**
Add 3 slide type handlers to `FibonaccoPlayer` / `PresentationPanel.tsx`:

`CheckoutSlide`:
- Renders selected service with price
- "Buy Now" button → calls order checkout endpoint directly from slide
- Shows Stripe Elements inline if `embedded: true` in slide config

`QuoteSlide`:
- Renders a simplified quote summary
- "Request Proposal" button → `POST /quotes/quick` with customer context from campaign token
- Confirmation state shown inline

`FormSlide`:
- Renders configurable fields (name, phone, message)
- Submit → `POST /leads` or `POST /activities` depending on config
- Thank-you state shown inline

**Acceptance:** Campaign presentations can capture leads, quote requests, and purchases without leaving the slide.

---

### AGENT 4B — Post-Purchase Onboarding
**Files:** New `OnboardingChecklist.tsx`, route `/onboarding`, backend onboarding state

**Task:**
After `checkout.session.completed` (Phase 1 already fires welcome email), also create an `OnboardingProgress` record for the customer.

`OnboardingChecklist.tsx`:
- `GET /onboarding` → list of steps with completion status
- Steps vary by package (Community Influencer vs Expert vs Sponsor)
- Typical steps: Complete business profile → Upload logo → Review your Day.News listing → Watch intro video → Schedule your kickoff call
- Each step has a CTA that routes to the relevant page/action
- Completion tracked via `POST /onboarding/{step}/complete`

Surface checklist in `Dashboard.tsx` as a banner until 100% complete.

**Acceptance:** New customers have a clear guided path from purchase to active use.

---

### AGENT 4C — Invoice PDF Export
**Backend files:** `app/Services/InvoicePdfService.php` (new), route `GET /invoices/{id}/pdf`

**Task:**
Use `barryvdh/laravel-dompdf` (add to composer if not present) to generate a professional invoice PDF:
- Fibonacco branding, logo
- Bill To / Bill From blocks
- Line items table with qty, unit price, subtotal
- Tax line if applicable, total
- Payment status badge
- Route returns PDF download response

Wire `InvoiceDetailPage.tsx` "Download" button to `GET /invoices/{id}/pdf`.
Wire `SendPaymentReminderModal` to optionally attach PDF when sending.

**Acceptance:** Professional PDF invoice downloadable and email-attachable.

---

### AGENT 4D — Customer Detail Page Completion
**File:** `CustomerDetailPage.tsx`

**Task (builds on 2A which wires the API — this adds missing functional elements):**
- Inline edit for customer fields (click field → edit in place → `PATCH /customers/{id}`)
- Deal creation from customer context (pre-fills customer on deal form)
- Quote creation from customer context (pre-fills customer on quote form)
- Invoice creation from customer context
- File attachments tab: `GET /customers/{id}/files`, `POST /customers/{id}/files` (upload)
- Notes tab: freeform notes with `POST /customers/{id}/notes`, rendered chronologically
- Communication history tab: real email thread from `GET /customers/{id}/emails`

**Acceptance:** Customer detail page is a complete operational record — no dead buttons, no hardcoded data.

---

## Execution Order & Parallelism

```
Day 1-2:   1A + 1B + 1D (parallel — all backend, no dependencies)
Day 2-3:   1C (backend) → 1C (frontend, needs backend)
Day 3-5:   2A + 2B + 2C (parallel — independent pages)
Day 5-6:   2D + 2E (parallel)
Day 6-8:   3A + 3B (parallel)
Day 8-9:   3C + 3D (parallel)
Day 9-11:  4A + 4C (parallel)
Day 11-12: 4B + 4D (parallel)
```

Total: ~12 working days with parallel agents across phases.

---

## Pre-Flight Checks Before Handing to Agents

1. Confirm `StripeService::createSubscription` — Stripe Subscription object or manual PaymentIntent? This determines scope of Agent 1A.
2. Confirm Postal is configured for transactional email (single sends) vs campaign sends — Phase 1 emails use this path.
3. Confirm `/customers`, `/deals`, `/quotes`, `/invoices` REST endpoints exist and return expected shapes — run `php artisan route:list | grep -E 'customer|deal|quote|invoice'` before briefing Phase 2 agents.
4. Confirm `barryvdh/laravel-dompdf` not already in `composer.json` before Agent 4C installs it.
