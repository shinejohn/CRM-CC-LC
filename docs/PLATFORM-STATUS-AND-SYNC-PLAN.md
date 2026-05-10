# Fibonacco Platform Status & Synchronization Plan

**Date:** 2026-05-05
**Author:** Claude Opus 4.6 + John Shine
**Purpose:** Complete reference for any human or AI continuing work on this platform

---

## 1. Architecture Overview

Fibonacco operates as **two separate Railway-deployed applications** with distinct databases that must stay synchronized:

### Publishing Platform (PP)
- **Repo:** `github.com/shinejohn/Community-Platform` (Day-News/Multisite)
- **Stack:** Laravel 12 + Inertia/Vue SSR
- **Railway:** Project "Publishing", Service "Day News"
- **URL:** `https://day.news`
- **Database:** PostgreSQL (`Postgres-Publishing.railway.internal`)
- **Role:** Consumer-facing publications — Day.News, GoEventCity, DowntownsGuide, GoLocalVoices, AlphaSite
- **Data:** Businesses, communities, subscribers, content, audience engagement, business subscriptions

### Command Center (CC)
- **Repo:** `github.com/shinejohn/CRM-CC-LC` (Learning-Center)
- **Stack:** Laravel 12 API + React 18 SPA (NOT Inertia)
- **Railway:** Project "CRM-CC-LC-Project", Service "CRM-CC-LC" + "horizon"
- **URL:** `https://crm-cc-lc-production.up.railway.app`
- **Database:** PostgreSQL (separate from PP)
- **Role:** CRM, campaign management, Manifest Destiny orchestration, Pitch Engine, Sarah AI operator, billing

### Key Principle
PP has the **real business/community data** (businesses, geographic data, subscriptions). CC is the **campaign brain** (pipeline stages, engagement scoring, Manifest Destiny timelines, Pitch Engine, checkout). Data flows PP -> CC via the bridge API.

---

## 2. What Is Built (Verified May 2026)

### 2.1 Manifest Destiny Campaign System (CC)

The 90-day community-by-community SMB marketing strategy. All components listed below are **implemented and deployed**.

| Component | Files | Status |
|-----------|-------|--------|
| Campaign Orchestrator | `CampaignOrchestratorService.php` | Built - timeline execution, day advancement |
| Action Executor | `CampaignActionExecutor.php` | Built - email, SMS, calls, engagement checks, stage updates |
| Pipeline Stages | `PipelineStage.php` enum | HOOK -> ENGAGEMENT -> SALES -> RETENTION -> CHURNED |
| Timeline Seeder | `ManifestDestinyTimelineSeeder.php` | 3 timelines (Hook, Engagement, Sales), 90+ actions |
| Email Templates | `ManifestDestinyEmailTemplateSeeder.php` | 67 templates with merge fields |
| Campaign JSONs | `content/campaign_*.json` (60 files) | 15 HOOK, 15 EDU, 30 HOWTO |
| Scheduled Jobs | `Kernel.php` | `manifest-destiny:run` daily at 09:00, timelines hourly, days daily at midnight |

### 2.2 Pitch Engine (CC)

8-gate product recommendation wizard for SMBs.

| Component | Files | Status |
|-----------|-------|--------|
| Gate Sequencer | `src/pitch/gates/GateSequencer.tsx` | Built - dynamic gate ordering |
| Product Gates | `PerformerGate`, `VenueGate`, + 6 more | Built - all 8 gates |
| Checkout | `CheckoutController.php`, `CheckoutStep.tsx` | Built - Stripe PaymentIntent + Elements |
| Provisioning | `PitchProvisioningService.php` | Built - post-payment slot claim, subscription, PP push |
| Bundle Validator | `CampaignBundleValidator.php` | Built - validates product combinations |
| Enrichment | `PitchEnrichmentService.php` | Built - event tracking per step |

### 2.3 Sarah AI Operator (CC)

AI-powered upsell and campaign builder.

| Component | Files | Status |
|-----------|-------|--------|
| Campaign Service | `Sarah/SarahCampaignService.php` | Built |
| Message Service | `Sarah/SarahMessageService.php` | Built |
| Fulfillment | `Sarah/CampaignFulfillmentService.php` | Built - product activation |
| CC Views | `src/command-center/pages/sarah/` | Built - dashboard, follow-ups, proposals Kanban |

### 2.4 Customer Intelligence (CC)

| Component | Files | Status |
|-----------|-------|--------|
| Intelligence Service | `CustomerIntelligenceService.php` | Built - 10-rule recommendation engine |
| Pipeline Transitions | `PipelineTransitionService.php` | Built - stage advancement logic |
| Hook Activation | `HookActivationService.php` | Built - trial activation pipeline |
| Slot Inventory | `SlotInventoryService.php` | Built - 37-slot per-community capacity |

### 2.5 Publishing Platform Bridge

| Component | Location | Status |
|-----------|----------|--------|
| CC -> PP: Content Push | `PublishingPlatformService.php` | Built - articles, listings, events, newsletter, alphasite |
| CC -> PP: Provisioning | `PublishingPlatformService::provisionSubscription()` | Built |
| PP -> CC: Status Queries | `PublishingBridgeController.php` | Built - subscription status, sponsors, influencers, slots |
| CC <- PP: Readership | `ReadershipSyncJob.php` | Built - daily analytics pull |
| **PP -> CC: Data Export** | `DataExportBridgeController.php` | **VERIFIED** - raw DB::select(), schema-safe, try-catch error reporting |
| **CC: Data Sync** | `SyncFromPublishingPlatform.php` | **VERIFIED** - dry-run confirmed 334 businesses for abbeville-la |

### 2.6 Communication Infrastructure (CC)

| Component | Status |
|-----------|--------|
| Email Engine (Postal + ZeroBounce) | Built |
| SMS/RVM Service (Twilio) | Built |
| Phone Service | Built |
| Priority Dispatcher | Built - runs every 10 seconds |
| Suppression Processing | Built |
| Pre-flight Validation | Built (ZeroBounce) |

### 2.7 Product Catalog

| Product | Monthly | Annual | Slot Category |
|---------|---------|--------|---------------|
| Community Influencer | $300 | $3,000 | influencer |
| Community Expert | $400 (+$100 column) | $4,000 | expert |
| Community Sponsor | $300 + section fee | varies | sponsor |
| Community Reporter | $100 (standalone) | $1,000 | reporter |

37-slot ceiling per community with per-category limits enforced at DB level.

---

## 3. Data Synchronization (NEW — May 2026)

### 3.1 The Problem

- CC production database is **empty** (0 customers, 0 SMBs, 0 communities)
- PP has the real business/community data (~500+ communities, thousands of businesses)
- Without sync, Manifest Destiny has no targets, bridge queries return nothing

### 3.1a Production Schema Discovery (May 2026)

The PP `communities` table was created **outside of Laravel migrations** on production. The base migration (`2025_12_22_143022_create_communities_table.php`) has `if (Schema::hasTable('communities')) { return; }` and is skipped. Key findings:
- The `city` column does **NOT** exist on production (despite being in the migration)
- Columns like `county`, `timezone`, `population` were added via later `ALTER TABLE` migrations that DID run
- The `DataExportBridgeController` uses raw `DB::select('SELECT * ...')` to avoid column mismatches
- Eloquent `SELECT *` with model `$appends` caused memory/timeout issues — raw queries are required
- PP wraps all JSON responses in `{"success":true,"data":<payload>}` — CC must unwrap this envelope

### 3.2 The Solution

A bi-directional bridge API with nightly scheduled sync:

```
PP Postgres --> PP Bridge API --> CC PublishingPlatformService --> CC Postgres
                (Bearer token auth via PUBLISHING_BRIDGE_API_KEY)
```

### 3.3 New PP Endpoints (DataExportBridgeController)

All behind `publishing.bridge` middleware (Bearer token):

```
GET /api/v1/bridge/export/communities
GET /api/v1/bridge/export/businesses?community_id=X&page=N
GET /api/v1/bridge/export/business-subscriptions?community_id=X
```

### 3.4 CC Sync Command

```bash
# Preview what would sync
php artisan sync:from-publishing-platform --dry-run

# Sync everything
php artisan sync:from-publishing-platform

# Sync single community
php artisan sync:from-publishing-platform --community=springfield-il

# Skip subscription sync
php artisan sync:from-publishing-platform --skip-subscriptions
```

**3-phase sync:**
1. **Communities:** PP `communities` -> CC `communities` (matched by `slug`)
2. **Businesses:** PP `businesses` -> CC `customers` + `smbs` (matched by `external_id` = PP `business.id`)
3. **Subscriptions:** PP `business_subscriptions` -> CC `community_subscriptions`

**Pipeline stage mapping:**
- New synced businesses: `HOOK` (ready for Manifest Destiny targeting)
- Businesses with active PP subscriptions: `RETENTION`

**Scheduled:** Nightly at 01:30 (after readership sync at 01:00)

### 3.5 Field Mapping

| PP Field | CC Customer Field | CC SMB Field |
|----------|-------------------|--------------|
| `business.id` | `external_id` | `metadata.pp_business_id` |
| `business.name` | `business_name` | `business_name` |
| `business.email` | `email` | `primary_email` |
| `business.phone` | `phone` | `primary_phone` |
| `business.website` | `website` | — |
| `business.address` | `address` | `address` |
| `business.city` | `city` | `city` |
| `business.state` | `state` | `state` |
| `business.postal_code` | `zip` | `zip` |
| `business.latitude/longitude` | `coordinates` (JSON) | `coordinates` (JSON) |
| `business.rating` | `google_rating` | — |
| `business.reviews_count` | `google_review_count` | — |
| `business.categories[0]` | `category` | `category` |
| `business.community_id` | `community_id` (mapped) | `community_id` (mapped) |

### 3.6 Railway Environment Variables

Both projects share the same `PUBLISHING_BRIDGE_API_KEY` for mutual authentication.

**CC (CRM-CC-LC service + horizon service):**
```
PUBLISHING_BRIDGE_API_KEY=<shared_secret>
PUBLISHING_BRIDGE_BASE_URL=https://day.news
PUBLISHING_PLATFORM_URL=https://day.news
PUBLISHING_PLATFORM_SECRET=<shared_secret>
```

**PP (Day News service):**
```
PUBLISHING_BRIDGE_API_KEY=<shared_secret>
```

**Status:** All set on Railway as of 2026-05-05.

---

## 4. Database Schemas

### 4.1 PP Key Tables

| Table | PK Type | Key Columns |
|-------|---------|-------------|
| `businesses` | UUID | name, slug, email, phone, website, address, city, state, postal_code, latitude, longitude, categories (JSON), rating, reviews_count, community_id, google_place_id, organization_type, status |
| `smb_businesses` | UUID | tenant_id, google_place_id, display_name, formatted_address, phone_national, website_url, fibonacco_status, google_rating |
| `communities` | UUID | name, slug, city, state, county, population, timezone, is_active, launched_at, total_businesses |
| `business_subscriptions` | UUID | business_id, tier, status, trial_started_at, trial_expires_at, subscription_started_at, monthly_amount, stripe_subscription_id |
| `cities` | UUID | name, state, slug, county, latitude, longitude, population |
| `counties` | UUID | name, state, slug, population |
| `business_service_areas` | UUID | business_id, area_type, city_id, plan_tier, monthly_price |

### 4.2 CC Key Tables

| Table | PK Type | Key Columns |
|-------|---------|-------------|
| `customers` | UUID | external_id, business_name, email, phone, community_id, smb_id, pipeline_stage, engagement_score, subscription_tier |
| `smbs` | UUID | business_name, community_id, category, pitch_status, products_accepted |
| `communities` | UUID | name, slug, state, county, population, timezone, launched_at |
| `community_subscriptions` | UUID | customer_id, community_id, tier, status, monthly_rate, stripe_subscription_id |
| `campaign_timelines` | auto-inc* | name, stage, is_active, description |
| `campaign_timeline_actions` | auto-inc* | timeline_id, day, action_type, template_type, delay_hours |
| `customer_timeline_progress` | auto-inc* | customer_id, campaign_timeline_id, current_day, status |
| `pitch_sessions` | UUID | smb_id, customer_id, community_id, status, last_step, products_accepted |
| `advertiser_sessions` | UUID | business_id, community_id, status, proposal |
| `campaign_line_items` | UUID | campaign_id, product_type, price, status |

*Note: `campaign_timelines`, `campaign_timeline_actions`, `customer_timeline_progress` use `$table->id()` (auto-increment) instead of UUID — a convention violation that should be fixed in a future migration.

---

## 5. Pending Work

### 5.1 Immediate (Pre-Launch)

1. **Run First Data Sync (bridge verified working):**
   ```bash
   # Single community test:
   railway run --service "CRM-CC-LC" "php artisan sync:from-publishing-platform --community=abbeville-la"
   # Full sync (all ~500+ communities, will take time):
   railway run --service "CRM-CC-LC" "php artisan sync:from-publishing-platform"
   ```

2. **Run CC Migrations on Production:**
   ```bash
   railway run --service "CRM-CC-LC" "php artisan migrate --force"
   ```
   Missing tables: `advertiser_sessions`, `campaign_line_items`, `sarah_messages`

2. **Run CC Seeders on Production:**
   ```bash
   railway run --service "CRM-CC-LC" "php artisan db:seed --class=ManifestDestinyTimelineSeeder --force"
   railway run --service "CRM-CC-LC" "php artisan db:seed --class=ManifestDestinyEmailTemplateSeeder --force"
   ```
   Currently: 1 timeline / 12 actions / 7 templates. After seeding: 3 timelines / 90+ actions / 67 templates.

3. **Run First Data Sync:**
   ```bash
   railway run --service "CRM-CC-LC" "php artisan sync:from-publishing-platform --dry-run"
   # Review output, then:
   railway run --service "CRM-CC-LC" "php artisan sync:from-publishing-platform"
   ```

4. **Seed Slot Capacity Per Community** — once communities are synced.

### 5.2 Near-Term

- **CC UI: Email Dashboard** — Monitor email deliverability, bounce rates, ZeroBounce validation
- **CC UI: Contact Health Panel** — Show per-customer email/phone status
- **CC UI: Inbound Inbox** — Display inbound emails processed by `InboundEmailService`
- **Fix timeline table PKs** — Migrate from auto-increment to UUID (`campaign_timelines`, `campaign_timeline_actions`, `customer_timeline_progress`)
- **Audit PP AWS usage** — `AWS_SECRET_ACCESS_KEY` is set on PP Railway. Determine if still needed (S3 uploads?) or can be removed.

### 5.3 Future

- **Manifest Destiny Simulation Harness** — End-to-end test of the 90-day lifecycle (community launch -> hook email sequence -> pitch -> checkout -> provisioning -> Sarah upsells -> onboarding)
- **Readership Detail Sync** — Currently only per-community monthly aggregate; add per-article breakdown
- **Bi-directional Sync** — Currently one-way (PP -> CC). Consider CC -> PP sync for campaign status, engagement scores back to PP for display on business profiles.

---

## 6. ship.sh Deploy Script

Both repos have `ship.sh` for pre-deploy validation:

### LC (v4, just upgraded)
```bash
./ship.sh "commit message"           # check + commit + push
./ship.sh --check                    # check only
./ship.sh --check --deep             # include Larastan/Pint if installed
./ship.sh --review-logs              # AI analysis of Railway logs
./ship.sh --review-logs --fix        # AI analysis + patch proposals
./ship.sh --use-manifest             # use pre-built commit message
```

### Multisite (v5)
```bash
./ship.sh "commit message"           # check + commit + push
./ship.sh --check --deep             # Docker/Trivy/Postgres/tests
./ship.sh --review-logs --fix        # AI log review + patches
./ship.sh --use-manifest             # pre-built batch message
```

### Pre-Deploy Checklist (both repos)
```bash
cd backend/  # or repo root for Multisite
php artisan route:cache && php artisan route:clear
php artisan config:cache && php artisan config:clear
php artisan event:cache && php artisan event:clear
composer dump-autoload --optimize
```

---

## 7. Key Configuration Files

| File | Purpose |
|------|---------|
| `backend/config/services.php` | All third-party service keys (Stripe, Postal, Twilio, Publishing Bridge) |
| `backend/.env.example` | Canonical list of all env vars |
| `backend/nixpacks.toml` | Railway build config (--no-scripts in install, cache in build) |
| `backend/app/Console/Kernel.php` | All scheduled jobs and commands |
| `backend/routes/api.php` | API routes including bridge endpoints |

---

## 8. Authentication Patterns

| Pattern | Used By | Mechanism |
|---------|---------|-----------|
| Sanctum Bearer Token | CC API (React SPA -> Laravel) | `auth:sanctum` middleware |
| Bridge API Key | PP <-> CC bridge | `Authorization: Bearer <PUBLISHING_BRIDGE_API_KEY>` header, timing-safe comparison |
| X-Provisioning-Secret | CC -> PP provisioning (legacy) | Custom header, checked by PP provisioning controller |
| Stripe Webhooks | Payment confirmation | Webhook signature verification |

---

## 9. Contact & Access

- **GitHub (CC):** `github.com/shinejohn/CRM-CC-LC`
- **GitHub (PP):** `github.com/shinejohn/Community-Platform`
- **Railway Dashboard:** railway.app (two projects: "CRM-CC-LC-Project" and "Publishing")
- **PP Public URLs:** day.news, goeventcity.com, downtownsguide.com, golocalvoices.com, alphasite.ai
