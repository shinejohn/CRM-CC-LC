# Manifest Destiny — Gap Closure Execution Plan
**Date:** April 1, 2026  
**Purpose:** Close every gap between what's built and what the Manifest Destiny strategy requires  
**Method:** Ordered workstreams with Cursor agent briefs, dependencies marked

---

## REVISED ASSESSMENT

After deep code review, the picture is better than first appeared in two areas:

**Campaign orchestration is more complete than initially scored.** `CampaignOrchestratorService` handles timeline-based day-by-day action progression. `CampaignActionExecutor` dispatches real email (via `SendEmailCampaign` job), SMS (via `SMSService`), phone calls (via `PhoneService`), stage updates, engagement checks, and follow-up scheduling. It resolves email templates, builds merge variables from customer data, creates OutboundCampaign + CampaignRecipient records, and dispatches jobs. This is a working sequencer — the gap is seed data (mapping the 60 campaign JSONs into CampaignTimeline + CampaignTimelineAction records) and the scheduled command to run it daily.

**Slot enforcement is production-grade.** Both `SlotEnforcementService` and `SlotInventoryService` use `lockForUpdate()` for race-condition safety. The 37-slot ceiling is hardcoded. The watcher system in `SlotInventoryService` proactively re-engages SMBs when slots open. These need reconciliation (one canonical model) but the logic is sound.

---

## WORKSTREAM MAP

```
WS-1  Campaign Renderer → FibonaccoPlayer (no dependencies)
WS-2  Publishing Bridge Write Endpoints (no dependencies)  
WS-3  Pitch Post-Purchase Provisioning (depends on WS-2)
WS-4  The Hook Activation Pipeline (depends on WS-2)
WS-5  Campaign Timeline Seeding + Scheduler (no dependencies)
WS-6  Readership Analytics Bridge (depends on WS-2)
WS-7  Slot System Reconciliation (no dependencies)
WS-8  Multisite CTA Fixes (no dependencies — Multisite repo)
WS-9  Sarah Campaign Builder (depends on WS-3, WS-6)
```

**Parallel execution:** WS-1, WS-2, WS-5, WS-7, WS-8 can all run simultaneously. WS-3 and WS-4 start once WS-2 lands. WS-6 starts once WS-2 lands. WS-9 starts once WS-3 and WS-6 are stable.

---

## WS-1: Campaign Renderer → FibonaccoPlayer Connection

**Problem:** CampaignRenderer renders basic text divs for all 60 campaign landing pages. FibonaccoPlayer renders all 34 slide component types with audio, narration, AI chat, fullscreen — but is only routed at `/learning/presentation/:id` and is disconnected from the campaign landing pages.

**What exists:**
- `src/components/LearningCenter/Presentation/FibonaccoPlayer.tsx` — full player with `slideComponents` map of all 34 types
- `src/components/LearningCenter/Presentation/slides/index.ts` — exports all 34 slide components
- `src/components/learning/CampaignRenderer.tsx` — basic 4-type renderer (hero, video, interactive, cta) that ignores the `component` field in campaign JSON
- `src/components/learning/CampaignLandingPage.tsx` — uses CampaignRenderer
- 60 campaign JSON files in `/content/` — each slide has a `"component": "PersonalizedHeroSlide"` field that maps to the FibonaccoPlayer's slideComponents registry

**Fix — Cursor Agent Brief:**

Replace CampaignRenderer's slide rendering with FibonaccoPlayer's component resolution. Two approaches:

**Option A (simpler):** Refactor CampaignRenderer to import `slideComponents` from FibonaccoPlayer and use it to resolve slide components by the `component` field in each slide's JSON. Keep the CampaignRenderer's simpler navigation chrome (no fullscreen/volume controls needed for marketing pages).

**Option B (cleaner):** Replace CampaignRenderer usage entirely. Refactor CampaignLandingPage to transform the campaign JSON into the `Presentation` interface that FibonaccoPlayer expects, then render `<FibonaccoPlayer presentation={...} />`. This gives full audio, narration, AI chat, and fullscreen for free.

**Recommended: Option B.** The FibonaccoPlayer already handles everything. The work is a data transform from campaign JSON → Presentation type.

**Files to modify:**
- `src/components/learning/CampaignLandingPage.tsx` — transform campaign data into Presentation format, replace CampaignRenderer with FibonaccoPlayer
- `src/data/campaigns/index.ts` — may need to expose the raw slide data with `component` fields preserved (verify it already does)

**Files to NOT modify:** FibonaccoPlayer.tsx, any slide component

**Acceptance criteria:**
- Visiting `/learn/claim-your-listing` renders PersonalizedHeroSlide, ListingPreviewSlide, BenefitsSlide etc. — not generic text divs
- Audio playback works if audio URLs are configured
- Sarah AI chat panel available during presentation
- All 60 campaign slugs render their correct slide components

**Estimated scope:** ~100 lines changed, 1 file primary, 1 file minor. Half-day agent task.

---

## WS-2: Publishing Bridge Write Endpoints

**Problem:** The Publishing Bridge is read-only. The CC can query the PP for subscription status, sponsors, influencers, and slot availability, but cannot push content, listings, or events TO the PP. This blocks The Hook, post-purchase provisioning, and automated content publishing.

**What exists:**
- `backend/app/Http/Controllers/Api/PublishingBridgeController.php` — 5 read endpoints
- `backend/app/Http/Controllers/Api/BusinessIngestController.php` — PP→CC direction (ingest, batchIngest, enrichmentUpdate)
- Bridge auth middleware (`bridge.auth`) — already configured for authenticated cross-service calls
- `backend/app/Services/PublishingPlatformService.php` — has `provisionSubscription()` that makes HTTP POST to PP, proving the outbound pattern works

**New endpoints needed (CC-side API for the CC to call against the PP):**

These are **service classes** in the CC backend that make HTTP calls to the PP, similar to how `PublishingPlatformService::provisionSubscription()` already works:

| Service Method | Purpose | PP Endpoint Target |
|---------------|---------|-------------------|
| `publishArticle($data)` | Push AI-generated article to Day.News | `POST /api/v1/bridge/articles` |
| `createListing($data)` | Create/update business listing on DTG | `POST /api/v1/bridge/listings` |
| `createEvent($data)` | Create event listing on GEC | `POST /api/v1/bridge/events` |
| `featureInNewsletter($data)` | Schedule business feature in next newsletter | `POST /api/v1/bridge/newsletter-features` |
| `activateAlphaSite($data)` | Set up AlphaSite profile for business | `POST /api/v1/bridge/alphasite` |
| `reportReadership($communityId)` | Pull readership/impression data FROM PP | `GET /api/v1/bridge/readership/{communityId}` |

**Cursor Agent Brief — CC Backend:**

1. Expand `PublishingPlatformService.php` (or create `PublishingBridgeClient.php`) with the 6 methods above. Each method:
   - Builds payload from CC model data
   - Makes authenticated HTTP request to the PP using the existing bridge auth pattern (`X-Provisioning-Secret` header)
   - Handles success/failure with logging
   - Returns structured response or throws for retry

2. No new routes needed in the CC — these are outbound HTTP client calls, not inbound API endpoints.

**Cursor Agent Brief — PP (Multisite) Backend:**

1. Create `routes/api/bridge-inbound.php` with the 6 endpoints above, protected by the bridge auth middleware
2. Create controllers that receive the CC's pushed data and create the appropriate models in the PP database (Articles, BusinessListings, Events, NewsletterFeatures, AlphaSiteProfiles)
3. The `reportReadership` endpoint aggregates impression/click data from the PP's analytics tables and returns it

**This is the most critical workstream.** Everything downstream (WS-3, WS-4, WS-6) depends on it.

**Estimated scope:** CC side: ~200 lines in one service class. PP side: ~400 lines across route file + 1-2 controllers. 1-2 day agent task.

---

## WS-3: Pitch Post-Purchase Provisioning

**Problem:** When `CheckoutController::confirmPayment()` succeeds, it creates a Campaign record and enriches the SMB/Customer, but doesn't claim the slot, create a CommunitySubscription, or push anything to the publishing platform.

**What exists:**
- `CheckoutController::confirmPayment()` — creates Campaign, calls PitchEnrichmentService, logs analytics
- `SlotEnforcementService::reserveSlot()` — row-level locking, dual constraint check, ready to call
- `CommunitySubscriptionService` — exists (manages CommunitySubscription CRUD)
- `PublishingPlatformService::provisionSubscription()` — makes HTTP call to PP
- `ProvisioningTask` model — exists for tracking provisioning status
- The Service Catalog path already has a complete `fulfillOrder()` pattern in `StripeWebhookController`

**Fix — Cursor Agent Brief:**

Create `PitchProvisioningService.php` in `app/Services/Pitch/` with a single `provision(PitchSession $session, string $paymentIntentId)` method that:

1. **Claims the slot** — calls `SlotEnforcementService::reserveSlot()` for the business's category/community. If slot unavailable (race condition), log error and flag for manual review rather than failing the purchase.

2. **Creates CommunitySubscription** — with tier (influencer/expert/sponsor), community_id, customer_id, monthly_rate, founder pricing flag, started_at, expires_at.

3. **Provisions on publishing platform** — calls the expanded `PublishingPlatformService` (from WS-2) to: create DTG listing, activate AlphaSite profile, push initial content quotas.

4. **Triggers onboarding workflow** — creates initial CampaignTimeline assignment via `CampaignOrchestratorService::startTimeline()` for the "new subscriber onboarding" timeline.

5. **Creates ProvisioningTask records** — one per platform provisioning step, with status tracking for retry on failure.

Then add a single call to `PitchProvisioningService::provision()` at the end of `CheckoutController::confirmPayment()`, after the Campaign is created.

**Depends on:** WS-2 (bridge write endpoints)

**Files to create:** `app/Services/Pitch/PitchProvisioningService.php`
**Files to modify:** `app/Http/Controllers/Pitch/CheckoutController.php` (add ~5 lines at end of `confirmPayment`)

**Estimated scope:** ~150 lines new service, ~5 lines controller change. Half-day agent task.

---

## WS-4: The Hook Activation Pipeline

**Problem:** When a business enters The Hook (free trial), the system must automatically create an intro article, premium listings on all 4 platforms, a premium event listing, a newsletter feature, and an AlphaSite trial — without manual intervention.

**What exists:**
- `ContentGenerationService` — generates articles via OpenRouter
- `PublishingPlatformService` — can push subscription data to PP (and after WS-2, can push articles/listings/events)
- `CampaignOrchestratorService` — can manage timeline-based action sequences
- `PitchEnrichmentService` — already enriches SMB/Customer data from pitch flow

**Fix — Cursor Agent Brief:**

Create `HookActivationService.php` in `app/Services/` with `activate(Customer $customer, SMB $smb, Community $community)`:

1. **Generate intro article** — call `ContentGenerationService::generate()` with business profile data (name, category, location, description from SMB model). Use a "business_intro" template.

2. **Publish article to Day.News** — call `PublishingPlatformService::publishArticle()` (from WS-2).

3. **Create listings on all platforms** — call `PublishingPlatformService::createListing()` for DTG, GEC, AlphaSite.

4. **Create event listing** — if SMB has events (check `smb.has_events`), call `PublishingPlatformService::createEvent()` with a "Grand Opening" or "Community Welcome" event.

5. **Schedule newsletter feature** — call `PublishingPlatformService::featureInNewsletter()` to include the business in the next community newsletter.

6. **Activate AlphaSite trial** — call `PublishingPlatformService::activateAlphaSite()` with 90-day trial parameters.

7. **Set up re-engagement** — create timeline assignment via `CampaignOrchestratorService` for "hook_trial" timeline (touchpoints at day 7, 14, 30, 60, 75, 90).

8. **Update customer status** — set `subscription_tier = 'trial'`, `hook_started_at = now()`, `hook_expires_at = now()->addDays(90)`.

**Entry points:**
- Called from pitch engine when a business completes the free-trial path (not the paid checkout path)
- Called from CampaignActionExecutor when a timeline action triggers Hook activation
- Can be called manually from CC dashboard for individual businesses

**Depends on:** WS-2

**Estimated scope:** ~200 lines. 1-day agent task.

---

## WS-5: Campaign Timeline Seeding + Scheduler

**Problem:** The 60 campaign JSON files define the content and sequence, but they're stored as static frontend assets. The CampaignOrchestratorService needs CampaignTimeline + CampaignTimelineAction database records to execute the 90-day sequence.

**What exists:**
- 60 campaign JSON files: HOOK-001 through HOOK-015 (weeks 1-3), EDU-001 through EDU-015 (education), HOWTO-001 through HOWTO-030 (how-to guides)
- `CampaignTimeline` model with `getActiveForStage()` method
- `CampaignTimelineAction` model with `shouldExecute()`, `parameters`, `template_type`, `action_type` fields
- `CampaignOrchestratorService::executeActionsForCustomer()` — iterates active timelines, executes day's actions
- `CampaignActionExecutor` — handles send_email, send_sms, make_call, schedule_followup, update_stage, check_engagement

**Fix — Cursor Agent Brief:**

**Step 1: Create a seeder** (`database/seeders/ManifestDestinyTimelineSeeder.php`):

Map the 60 campaign JSONs to 3 CampaignTimeline records + ~120 CampaignTimelineAction records:

| Timeline | Duration | Source JSONs | Pipeline Stage |
|----------|----------|-------------|---------------|
| `manifest_destiny_hook` | 90 days | HOOK-001 to HOOK-015 | `hook_trial` |
| `manifest_destiny_education` | 60 days | EDU-001 to EDU-015 | `nurture` |
| `manifest_destiny_howto` | 90 days | HOWTO-001 to HOWTO-030 | `active` |

Each CampaignTimelineAction record maps a campaign JSON to a day + action:
```php
CampaignTimelineAction::create([
    'campaign_timeline_id' => $hookTimeline->id,
    'day' => 1,
    'action_type' => 'send_email',
    'template_type' => 'HOOK-001',
    'parameters' => [
        'subject' => 'Your business is already in our directory - claim it now',
        'landing_page' => 'claim-your-listing',
        'campaign_json_id' => 'HOOK-001',
    ],
    'conditions' => ['has_email' => true],
    'sort_order' => 1,
]);
```

**Step 2: Create email templates** for each campaign type:

Create `EmailTemplate` seeder records that map `template_type` slugs (HOOK-001, EDU-001, etc.) to rendered email HTML. These use merge variables (`{{business_name}}`, `{{owner_name}}`, `{{community_name}}`, `{{landing_page_url}}`) and link to the Learning Center campaign landing pages.

**Step 3: Create the scheduled command:**

```php
// app/Console/Commands/RunManifestDestiny.php
// Runs daily via Laravel scheduler
// Calls CampaignOrchestratorService::executeActionsForCustomer() for all active customers
```

Register in `app/Console/Kernel.php`:
```php
$schedule->command('manifest-destiny:run')->dailyAt('09:00');
```

**Step 4: Create the community launch command:**

```php
// app/Console/Commands/LaunchCommunity.php  
// Given a community_id:
// 1. Load all SMBs in the community (from BusinessDirectory or via Google Places API import)
// 2. Create Customer records for each
// 3. Assign them to the manifest_destiny_hook timeline
// 4. Day 1 actions execute on next scheduler run
```

**Estimated scope:** Seeder: ~300 lines. Email templates: ~200 lines. Commands: ~100 lines each. 1-2 day agent task.

---

## WS-6: Readership Analytics Bridge

**Problem:** The CC has no way to show SMBs the value they're getting. The SubscriberROIService exists but has no data source from the publishing platform about impressions, clicks, or readership for the business's content.

**What exists:**
- `SubscriberROIService` — has `summary()`, `monthReport()`, `currentMonth()` methods
- `RevenueRecord` model
- `AnalyticsEvent` model
- Publishing Bridge (currently read-only)

**Fix — Cursor Agent Brief:**

**CC side:**
1. Add `reportReadership()` method to `PublishingPlatformService` (from WS-2) — pulls aggregated data from PP
2. Create `ReadershipSyncJob` that runs nightly:
   - For each active community, calls `reportReadership($communityId)`
   - Receives impression/click/view counts per business
   - Creates/updates `AnalyticsEvent` records keyed by business + date
   - Updates `SubscriberROIService` data sources

**PP side:**
1. Create the `GET /api/v1/bridge/readership/{communityId}` endpoint that aggregates:
   - Article views per business
   - Listing views per business
   - Event page views per business
   - Newsletter click-throughs per business
   - Social media impressions per business (if CSSN is active)

**Depends on:** WS-2

**Estimated scope:** CC: ~100 lines job + service method. PP: ~150 lines controller + query. 1-day agent task.

---

## WS-7: Slot System Reconciliation

**Problem:** Two separate services track slot state through different models: `SlotEnforcementService` (uses `CommunitySlotLimit`) and `SlotInventoryService` (uses `CommunitySlotInventory`). Both use row-level locking and enforce the 37-slot ceiling. If both are used, slot counts can desync.

**What exists:**
- `SlotEnforcementService` — used by PublishingBridgeController (for `slotAvailability` endpoint)
- `SlotInventoryService` — used by pitch engine (`SlotInventoryController`, slot watcher notifications, re-engagement triggers)
- Both have `claimSlot`/`reserveSlot` and `releaseSlot` methods

**Fix — Cursor Agent Brief:**

1. **Make `SlotInventoryService` canonical** — it's more feature-complete (caching, batch queries, watcher notifications, held_by tracking).

2. **Merge `SlotEnforcementService` logic into `SlotInventoryService`:**
   - Add the 37-slot community ceiling check (currently only in `SlotEnforcementService`)
   - Add the `getAvailabilityOverview()` method
   - Add expert-slot-as-subset logic

3. **Update all references:**
   - `PublishingBridgeController::slotAvailability()` → use `SlotInventoryService`
   - `CheckoutController` / `PitchProvisioningService` (WS-3) → use `SlotInventoryService`
   - Delete `SlotEnforcementService.php`

4. **Migration to unify tables** (if needed) — compare `CommunitySlotLimit` and `CommunitySlotInventory` schemas and consolidate. If schemas are compatible enough, migrate data from `CommunitySlotLimit` into `CommunitySlotInventory` and drop the table.

**Estimated scope:** ~100 lines of merge work, ~20 lines of reference updates. Half-day agent task.

---

## WS-8: Multisite CTA Fixes

**Problem:** 7 known gaps in the Multisite publishing platform that block traffic to the pitch engine.

**Items (from prior audit — all in Multisite repo):**
1. Missing AdvertiseCTA on GEC event detail page
2. All five app header CTAs hidden on mobile
3. Generic "Advertise" labels → contextual copy (e.g., "Promote Your Restaurant")
4. No banner CTA on GLV creator profiles
5. CommandCenterBanner not updated to use gate-aware URLs (`/advertise/{community-slug}`)
6. Legacy GEC advertise page with hardcoded pricing — disconnect or redirect to pitch engine
7. Two unreconciled advertising paths on Day.News — consolidate to pitch engine

**Cursor Agent Brief:** Previously documented. Operates entirely in the Multisite repo at `/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/`. Independent of all other workstreams.

**Estimated scope:** 1-day agent task.

---

## WS-9: Sarah Campaign Builder

**Problem:** The ongoing revenue engine for upsells, renewals, and new ad product purchases doesn't exist. The pitch engine handles initial enrollment only.

**What exists:**
- `SARAH_CAMPAIGN_BUILDER_SPEC.md` — full implementation spec
- `FIBONACCO-MASTER-PRODUCT-CATALOG.md` — canonical pricing (headliner ads $49-$199, display campaigns $99-$499/mo, newsletter callouts $49-$149, sponsored articles $99-$299, etc.)
- `SARAH_CAMPAIGN_BUILDER_MAGICPATTERNS.md` — UX spec for all 9 screens
- Pitch engine architecture (steps, gates, shell, Sarah panel) — can be partially reused

**Depends on:** WS-3 (provisioning must work so purchased products actually activate) and WS-6 (readership analytics so Sarah can show ROI to drive upsells)

**This is the largest remaining build.** The spec documents are complete and ready for Cursor agents. Estimated: 3-5 day build across frontend (9 screens) and backend (product catalog API, bundle validation, fulfillment routing).

---

## EXECUTION SEQUENCE

```
Week 1 (parallel):
├── WS-1: Campaign Renderer → FibonaccoPlayer         [Agent A, 0.5 day]
├── WS-2: Publishing Bridge Write Endpoints            [Agent B, 1-2 days]
├── WS-5: Campaign Timeline Seeding + Scheduler        [Agent C, 1-2 days]
├── WS-7: Slot System Reconciliation                   [Agent D, 0.5 day]
└── WS-8: Multisite CTA Fixes                          [Agent E, 1 day]

Week 2 (after WS-2 lands):
├── WS-3: Pitch Post-Purchase Provisioning             [Agent A, 0.5 day]
├── WS-4: The Hook Activation Pipeline                 [Agent B, 1 day]
└── WS-6: Readership Analytics Bridge                  [Agent C, 1 day]

Week 2-3:
└── Antigravity review of WS-1 through WS-8

Week 3-4:
└── WS-9: Sarah Campaign Builder                       [Agent A+B, 3-5 days]

Week 4:
└── Antigravity review of WS-9
└── Integration testing: full Manifest Destiny flow end-to-end
```

---

## WHAT THIS UNLOCKS

When all 9 workstreams are complete:

1. **Community Launch becomes a single command:** `php artisan community:launch {id}` — loads SMBs, creates customers, starts 90-day campaign sequence.

2. **Marketing emails land on compelling pages:** SMB clicks email → sees personalized FibonaccoPlayer presentation with their business name, listing preview, narration — not a generic text slider.

3. **The Hook creates real value automatically:** Business enters trial → AI generates intro article → article publishes on Day.News → DTG listing goes live → GEC event created → newsletter features them → AlphaSite trial activates. All without human intervention.

4. **Paid enrollment actually activates everything:** Business pays through pitch engine → slot claimed → CommunitySubscription created → all platform listings activated → onboarding timeline starts.

5. **SMBs can see their ROI:** Readership data flows from PP → CC → SubscriberROI dashboard. Sarah can say "Your listing got 847 views this month, 3x your category average."

6. **Sarah sells ongoing products:** Campaign builder lets subscribers discover and purchase headliner ads, sponsored articles, event promotions — the recurring revenue engine beyond the initial $300/month enrollment.

7. **CTAs everywhere drive traffic:** Every page on every publishing app has contextual, mobile-visible CTAs pointing to the pitch engine.

**The flywheel turns:** Content → Readership → Value demonstration → SMB enrollment → More content → More readership → Upsells → Revenue.
