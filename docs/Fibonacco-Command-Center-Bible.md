# The Fibonacco Command Center Bible
## The Complete Reference for the SMB-Facing Platform — Business, Architecture, Data, Campaigns, Billing, Auth, and Operations
### v1.0 — June 2026

> Governed by `CLAUDE.md`; this is the source of truth it points to.

---

## About This Document

This is the single source of truth for the **Command Center / Learning Center** repo (referred to throughout as **"CC"**), which lives at `/Users/johnshine/Dropbox/Fibonacco/Learning-Center/`. It is the sibling of the **Publishing Platform** ("PP" / Day.News) at `/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/`, whose equivalent reference is `docs/Fibonacco-Content-Bible.md`.

It is written for both humans and AI coding sessions. Every section explains not just *what* exists and *how* it works, but *why* it was built that way — because the why is what stops the next developer or AI session from breaking something that took a week to get right.

**How to use this document:**

- **For humans:** read the section relevant to your task. The Table of Contents is your map. If you are new, read Part 1 and Part 2 before touching anything.
- **For AI sessions (Claude Code, Cursor):** load the Table of Contents first, then load the specific Part(s) relevant to the task. Read the business intent before touching code. Never modify anything that touches **customers vs. users** (Part 3), the **Manifest Destiny engine** (Part 4), **billing/Stripe** (Part 5), or **auth/the bridge** (Part 6) without reading that Part in full first.
- **A hard rule, repeated from `CLAUDE.md`:** when asked what currently exists (code review, gap analysis, audit, status), read the **live repo** under `/Users/johnshine/Dropbox/Fibonacco/Learning-Center/` — never `/mnt/project/` snapshots, which are stale after every build sprint. This document is accurate as of the date above, but the code is always the final authority. When this doc and the code disagree, the code wins — and you should fix this doc.

---

## Table of Contents

- **Part 1 — The Business: What CC Is**
  - 1.1 The one-sentence definition
  - 1.2 Where CC sits in the Fibonacco ecosystem
  - 1.3 What CC actually does
  - 1.4 How CC makes money
- **Part 2 — Architecture**
  - 2.1 The two-process, decoupled shape
  - 2.2 Backend (Laravel 12 JSON API)
  - 2.3 Frontend (React 18 SPA)
  - 2.4 Why decoupled and not Inertia
- **Part 3 — The Data Model: Customers vs. Users**
  - 3.1 The single most important distinction in the codebase
  - 3.2 The `customers` table (~12.9M businesses)
  - 3.3 `org_type` / `org_subtype` and the PP origin
  - 3.4 The `users` table (operators)
  - 3.5 Why the split exists
- **Part 4 — The Manifest Destiny Campaign Engine**
  - 4.1 What it is
  - 4.2 The three timelines
  - 4.3 Actions, channels, and the executor
  - 4.4 The schedulers that drive it
  - 4.5 Compliance: suppression and unsubscribe
  - 4.6 Email deliverability: ZeroBounce + Postal pools
  - 4.7 Landing pages: Room with Sarah
- **Part 5 — CRM, Billing, and Sales**
  - 5.1 The pipeline
  - 5.2 Deals, Quotes, Invoices
  - 5.3 Subscriptions, Stripe, dunning, proration
  - 5.4 Coupons and onboarding
  - 5.5 The AI copilot
- **Part 6 — Auth and the Cross-Platform Bridge**
  - 6.1 User auth (Sanctum)
  - 6.2 The frontend auth store
  - 6.3 The planned common-auth / OIDC direction
  - 6.4 The PP↔CC bridge
- **Part 7 — Conventions / Doctrine (the non-negotiables)**
- **Part 8 — Deploy and Operations**
  - 8.1 Railway services
  - 8.2 The Nixpacks build pipeline
  - 8.3 `ship.sh` — the pre-deploy gate
  - 8.4 Running artisan against production
  - 8.5 The lessons baked into the pipeline
- **How to Keep This Current**

---

# PART 1 — THE BUSINESS: WHAT CC IS

*Read this before touching anything. Code that ignores business intent is code that breaks the platform.*

---

## 1.1 The one-sentence definition

The Command Center / Learning Center is the **SMB-facing side of the Fibonacco ecosystem**: it runs CRM, campaign marketing automation, billing and subscriptions, a knowledge base / learning center, and AI workflows for the **~12.9 million businesses** synced from the Publishing Platform. It is the **campaign brain** and the **sales surface**; the Publishing Platform is the **consumer-facing publication** and the system of record for real business and community data.

## 1.2 Where CC sits in the Fibonacco ecosystem

Fibonacco runs as **two separate Railway-deployed applications** with distinct PostgreSQL databases that must stay synchronized:

- **Publishing Platform (PP) — "Day.News".** Repo `github.com/shinejohn/Community-Platform` (`../Day-News/Multisite`). Laravel 12 + Inertia/Vue SSR. URL `https://day.news`. Owns the **real** data: businesses, communities, subscribers, published content, audience engagement, and the consumer-facing publications (Day.News, GoEventCity, DowntownGuide, GoLocalVoices, AlphaSite).
- **Command Center (CC) — this repo.** Repo `github.com/shinejohn/CRM-CC-LC` (`Learning-Center`). Laravel 12 API + React 18 SPA (**not** Inertia). Owns the **campaign and sales logic**: pipeline stages, engagement scoring, Manifest Destiny timelines, the Pitch Engine, the Sarah AI operator, the product catalog, orders, quotes, invoices, and subscriptions.

The dividing principle: **PP owns entities; CC owns the sales motion against those entities.** Data flows PP → CC nightly through a bridge API. CC references PP records by external id — it does not become a competing source of truth for businesses, communities, or end-user identities.

A third platform, the **AI platform (TaskJuggler)**, completes after CC and exposes a mirror provisioning contract. CC sells AI-app products and provisions them via that contract; it does not host those AI accounts itself.

## 1.3 What CC actually does

The mission, stated plainly: **contact every SMB, nonprofit, and government entity in a community over ~90 days via email (and, when activated, SMS/voicemail), educate them about the Day.News publishing platform, and convert them to one of the bundled packages** — while giving a human operator a CRM, a Learning Center, an inbound/outbound campaign engine, and an AI-assisted selling surface to manage it all.

Concretely, the platform provides:

- A **CRM** (customers, deals, quotes, invoices, contacts, activities, notes) over the synced business universe.
- The **Manifest Destiny campaign engine** — three sequential, multi-touch timelines that nurture a business from first contact to sale (Part 4).
- A **Learning Center** of ~65 narrated slide presentations (`/learn/:slug`) hosted by the **Sarah** AI persona.
- **Billing**: a product catalog, Stripe-backed subscriptions with auto-renewal, dunning, and proration; quotes with public tokenized acceptance; invoices with PDF output; coupons; and post-purchase onboarding.
- **AI workflows**: an account-manager copilot (PrismAiService over the Anthropic SDK), AI actions, content generation, and per-customer intelligence.

## 1.4 How CC makes money

Revenue is **SMB subscriptions, services, and quotes/invoices**. The headline subscription tiers (priced per community, no multi-community volume discount) are:

| Product | Monthly | Annual | Slot category |
|---|---|---|---|
| Community Influencer | $300 | $3,000 | influencer |
| Community Expert | $400 (+$100 column) | $4,000 | expert |
| Community Sponsor | $300 + section fee | varies | sponsor |
| Community Reporter | $100 (standalone) | $1,000 | reporter |

Each community has a finite slot ceiling (a ~37-slot per-community capacity model with per-category limits) so the offer stays scarce and the inventory is real. On top of subscriptions, CC sells one-off services, bundles, and ad products, all flowing through the same Order / Quote / Invoice / Stripe machinery (Part 5).

**WHY it's built this way.** The economics only work because PP generates community presence at near-zero marginal cost (AI-generated hyperlocal news), which manufactures the authority that makes the SMB sale credible. CC is the monetization layer that converts that authority into recurring revenue. Every CC feature exists to move a business from "exists in the directory" to "paying subscriber."

**Key files / docs:** `docs/PLATFORM-STATUS-AND-SYNC-PLAN.md`, `docs/PROJECT-ASSESSMENT-2026-06-11.md`, `CC_PROJECT_PLAN_CROSS_PLATFORM.md`, `docs/manifest-destiny-campaign-content.md`.

---

# PART 2 — ARCHITECTURE

---

## 2.1 The two-process, decoupled shape

CC is **two independently deployed things** that talk over HTTP/JSON:

- **`backend/`** — a Laravel 12 JSON API (Sanctum auth, Horizon queues, Spatie permissions, Stripe SDK, Anthropic SDK).
- **`src/`** — a standalone React 18 SPA (Vite, React Router, Zustand, TanStack Query) that calls the API via Axios.

PostgreSQL is the database (with the **pgvector** extension enabled for AI embeddings). Redis/Valkey backs queues and Horizon. **This is explicitly not Inertia** — the frontend and backend are decoupled; controllers return JSON, never Inertia responses.

On Railway, CC runs as **two services**:

- **`horizon`** — the backend. Its start command is `bash start.sh`, which runs three processes: the **scheduler** (`schedule:work`), **Horizon** (queue workers), and the **HTTP API server** (`artisan serve` in the foreground as the Railway healthcheck target). See `backend/start.sh`.
- **`CRM-CC-LC`** — the React SPA, built with `npm run build` and served by `serve` (`railway.json` at the repo root).

## 2.2 Backend (Laravel 12 JSON API)

- **Routes:** `backend/routes/api.php` is the dominant surface — well over a hundred endpoints grouped under a `/v1` prefix: `auth`, `crm`, `campaigns`, `content`, `ai`, `services`/`orders`/`subscriptions`/`billing`/`payment-methods`, `onboarding`, `outbound`, `presentations`/`tts`, `coupons`, `bridge`, plus webhooks. `backend/routes/web.php` carries non-JSON concerns: `/health`, the signed `/unsubscribe/{customer}` pages, audio serving at `/storage/audio/{path}`, and approval pages. `backend/routes/channels.php` defines the private broadcast channel `cc.user.{userId}.ai-tasks`. Two route files are `require`d into `api.php`: `pitch.php` and `sarah.php`.
- **Config:** `backend/config/` holds `services.php` (all third-party keys — Postal, ZeroBounce, Stripe, Twilio, OpenAI, Anthropic, the publishing bridge, TTS), `command-center-ai.php` (AI model ids and timeouts), plus the standard Laravel configs (`horizon.php`, `queue.php`, `database.php`, etc.).
- **Packages:** `laravel/sanctum`, `laravel/horizon`, `spatie/laravel-permission`, `spatie/laravel-data`, `spatie/laravel-query-builder`, `anthropic-ai/sdk`, `stripe/stripe-php`, `predis/predis`.

## 2.3 Frontend (React 18 SPA)

- **Top-level router:** `src/AppRouter.tsx` — a `BrowserRouter` with all top-level routes: marketing pages, the standalone CRM/outbound pages, the Learning Center (`/learning/*`), the **campaign landing pages at `/learn/:slug`** (a catch-all that must come after the specific `/learn/*` routes), the **`/command-center` mount** (guarded by `AuthGuard`), and the admin **`/ops`** dashboard.
- **Command Center router:** `src/command-center/AppRouter.tsx` exports `getCommandCenterRoutes()` for embedding into the top-level router. The CC is organized around an **action-verb model** — the primary sections are **Define, Attract, Sell, Deliver, Measure, Automate**, plus **Pitch, Sarah, Syndication, Simulation, Learn, Settings, Support**. Legacy paths (`/command-center/crm`, `/billing`, `/content`, `/ai-team`, `/business`, `/services`) are kept as **redirects** to their new verb paths (e.g. `crm` → `sell`, `billing` → `deliver/billing`, `content` → `attract`, `ai-team` → `automate`, `business` → `define`). Every CC page is lazy-loaded with a `Suspense` fallback and wrapped in `CommandCenterLayout`.
- **State and data:** Zustand stores in `src/stores/`; TanStack Query + Axios services in `src/services/`. UI is Tailwind + Radix + shadcn/ui patterns + Framer Motion, Lucide icons.

> **Note for future sessions:** the old project memory describes CC nav using literal `crm`/`billing`/`content`/`business` paths. The live router has moved to the **verb model** with those old paths kept only as redirects. Trust the router file.

## 2.4 Why decoupled and not Inertia

PP *is* Inertia; CC deliberately is not. The SPA needs deep-linkable URLs for a sales tool (an operator shares a customer or deal link), independent deploy/scale of the static frontend vs. the API, and the freedom to embed campaign landing pages and AI chat widgets without server round-trips per interaction. The cost of this choice is that the frontend and backend can drift — historically the SPA shipped with mock data disconnected from the API. The fix discipline: wire real endpoints and **delete mock objects entirely** (silent mock fallbacks are how the disconnect went unnoticed).

**WHY it's built this way.** Two processes, one repo: the API is production-grade and stable; the SPA evolves fast. Keeping them decoupled lets each move at its own pace and deploy independently on Railway, at the price of an explicit API-wiring discipline.

**Key files:** `backend/routes/api.php`, `backend/routes/web.php`, `backend/routes/channels.php`, `backend/start.sh`, `railway.json`, `src/AppRouter.tsx`, `src/command-center/AppRouter.tsx`.

---

# PART 3 — THE DATA MODEL: CUSTOMERS VS. USERS

---

## 3.1 The single most important distinction in the codebase

There are **two completely different "person/business" concepts**, and conflating them is the most expensive mistake an AI session can make here:

- **`customers`** — the **~12.9 million businesses** synced from PP. They are **marketing/CRM data**. They do **not log in**. They are the *targets* of campaigns and the *subjects* of CRM records.
- **`users`** — the **operators / accounts** that actually log into the Command Center. They authenticate (Sanctum), they have roles/permissions, they run the campaigns and work the pipeline.

If you find yourself wiring login, password, or session logic to `Customer`, stop — that belongs to `User`. If you find yourself enrolling a `User` in a timeline or sending it campaign email, stop — that belongs to `Customer`.

## 3.2 The `customers` table (~12.9M businesses)

`backend/app/Models/Customer.php` — a `final` model using `HasUuids`, `HasFactory`, `SoftDeletes`, and **`HasTenantScope`** (so reads are scoped by `tenant_id`, driven by the `X-Tenant-ID` request header). It has 140+ fillable fields. The ones that matter most:

- **Identity / linkage:** `tenant_id`, `external_id` (the linking key — `Customer.external_id` = PP `business.id`, or a prefixed id like `np:...` / `civic:...` for nonprofits and civic entities), `business_name`, `email`, `phone`, `community_id`, `smb_id`.
- **Classification:** `org_type`, `org_subtype` (see 3.3).
- **Pipeline:** `pipeline_stage` (cast to the `PipelineStage` enum), `stage_entered_at`, `days_in_stage`, `stage_history`, trial fields.
- **Contact gating (opt-in/compliance):** `email_opted_in`, `sms_opted_in`, `rvm_opted_in`, `phone_opted_in`, `do_not_contact`.
- **Email health (ZeroBounce):** `zb_status`, `zb_sub_status`, `zb_checked_at`.
- **Suppression:** `email_suppressed` (bool), `email_suppressed_reason`.

The gate methods are the chokepoints the whole campaign engine relies on:

- `canContactViaEmail()` returns true only when `email_opted_in && !do_not_contact && !email_suppressed && !empty(email)`.
- Parallel `canContactViaSMS()` / `canContactViaPhone()` / `canContactViaRVM()` methods, plus matching `scopeCanReceiveEmail()` / `scopeCanReceiveSMS()` / etc. for bulk filtering.

Relationships include `community`, `smb`, `deals`, `quotes`, `invoices`, `crmActivities`, `customerNotes`, `conversations`, `interactions`, `pitchSessions`, and `files`.

## 3.3 `org_type` / `org_subtype` and the PP origin

`org_type` and `org_subtype` were **added recently** (migration `backend/database/migrations/2026_06_22_000005_add_org_type_to_customers_table.php`): both nullable strings, `org_type` indexed. They classify a customer's organization kind: **`smb` (default), `nonprofit`, `civic`/`government`, `education`, `religious`** (the backfill also recognizes `healthcare`).

These exist because PP exposes **three structured streams** that get flattened on sync, and the kind of organization changes how it should be marketed to:

1. **Businesses** — the SMB universe.
2. **Nonprofits** — exported via `PublishingPlatformService::exportNonprofits()`, carried into CC with `external_id` prefixed `np:` and `org_subtype` derived from the NTEE code.
3. **Civic entities** — exported via `PublishingPlatformService::exportCivicEntities()`, prefixed `civic:`, with `entity_type` mapped to `org_type` (school / school_district → `education`, church → `religious`, nonprofit → `nonprofit`, otherwise `government`).

Two paths set these fields:

- **On sync (forward):** `SyncFromPublishingPlatform` sets `org_type`/`org_subtype` as it ingests each stream, using helpers `normalizeBusinessOrgType()`, `civicEntityOrgType()`, and the nonprofit mapping.
- **As a one-time backfill (historical):** `php artisan customers:backfill-org-type` (`backend/app/Console/Commands/BackfillCustomerOrgType.php`) classified the already-synced rows by `external_id` prefix and entity type. The backfill produced roughly **1.34M nonprofit, ~360K civic, and ~11.3M smb** rows out of the ~12.9M total.

## 3.4 The `users` table (operators)

`backend/app/Models/User.php` — a `final` model using `HasUuids`, **`HasApiTokens`** (Sanctum personal access tokens, UUID-keyed), `HasFactory`, and `Notifiable`. Fillable: `name`, `email`, `password` (cast `hashed`), plus `signup_campaign` and `lead_source`. Roles/permissions come from `spatie/laravel-permission`. This is the model behind every authenticated request.

## 3.5 Why the split exists

PP is the system of record for businesses and identities; CC mirrors a *projection* of those businesses as `customers` purely to run campaigns and CRM against them at scale. Operators are a tiny set of internal accounts; businesses are millions of marketing targets. Merging the two would either (a) force 12.9M directory rows into the auth system, or (b) entangle operator login with marketing suppression logic. Keeping them separate keeps auth small and safe and lets `customers` be a denormalized, tenant-scoped, sync-driven projection.

**Key files:** `backend/app/Models/Customer.php`, `backend/app/Models/User.php`, `backend/app/Enums/PipelineStage.php`, `backend/database/migrations/2026_06_22_000005_add_org_type_to_customers_table.php`, `backend/app/Console/Commands/BackfillCustomerOrgType.php`, `backend/app/Console/Commands/SyncFromPublishingPlatform.php`.

---

# PART 4 — THE MANIFEST DESTINY CAMPAIGN ENGINE

*The 90-day, community-by-community SMB marketing machine. Do not rewire any piece of this without reading the whole Part — the chokepoints here are legal as well as functional.*

---

## 4.1 What it is

Manifest Destiny is the orchestrated, multi-touch outreach that walks a business from "we just launched Day.News in your town" to "you're a paying subscriber." It is driven entirely from the backend: timelines define the sequence, a scheduler advances days, and an executor performs each day's actions per customer — gated by the contact rules from Part 3.

Roughly **385K customers** are enrolled in the Hook stage — the email-capable subset of the ~12.9M (PP has ~12.5M businesses but only ~386K carry an email address; the rest are no-email Google Maps scrapes).

## 4.2 The three timelines

Seeded by `backend/database/seeders/ManifestDestinyTimelineSeeder.php` (with content in `ManifestDestinyEmailTemplateSeeder.php`):

| Timeline | Pipeline stage | Duration | Slug | Touchpoints |
|---|---|---|---|---|
| **Manifest Destiny — Hook Stage** | `HOOK` | 90 days | `manifest-destiny-hook` | 15 emails + 1 SMS (day 10) + 3 phone calls (day 2/8/26) + internal/system checks (HOOK-001…015) |
| **Manifest Destiny — Education Stage** | `ENGAGEMENT` | 60 days | `manifest-destiny-education` | 15 emails (EDU-001…015) |
| **Manifest Destiny — How-To Stage** | `SALES` | 90 days | `manifest-destiny-howto` | 30 emails (HOWTO-001…030) |

Channel mix as seeded (`docs/manifest-destiny-campaign-content.md`): Hook = ~15 emails + one day-10 SMS + **three phone calls** (day 2 `md_welcome_call`, day 8 `md_claim_followup_call`, day 26 `md_founder_call`, added June 2026 as early follow-ups); Education = 15 emails; How-To = 30 emails. The calls are **opt-in gated** (`canContactViaPhone()` requires `phone_opted_in`), so on the PP-synced base — where almost all `phone_opted_in = false` — very few actually dial until phone consent is captured. **Voicemail/RVM is supported by the engine but not yet scheduled.** Every email links to a **landing page** at `/learn/<slug>`.

A `CampaignTimeline` (`backend/app/Models/CampaignTimeline.php`, `HasUuids`) has `name`, `slug`, `pipeline_stage` (enum), `duration_days`, `is_active`, and `metadata`; it `hasMany` `CampaignTimelineAction` rows (ordered by `day_number`, `priority`) and `hasMany` `CustomerTimelineProgress` rows. `CustomerTimelineProgress` tracks `current_day`, completed/skipped actions, and pause/resume per customer.

## 4.3 Actions, channels, and the executor

`backend/app/Services/CampaignActionExecutor.php` dispatches each action by `action_type`:

- `send_email` → `sendEmail()` — **first checks `customer->canContactViaEmail()`**, then creates an `OutboundCampaign` + `CampaignRecipient` and dispatches the `SendEmailCampaign` job.
- `send_sms` → `sendSMS()` — checks `canContactViaSMS()`, sends via `SmsService`, records an interaction.
- `make_call` → `makeCall()` — checks `canContactViaPhone()`, sends via `PhoneService`.
- `schedule_followup`, `update_stage`, `check_engagement`, `send_notification` — internal/system actions (stage advancement, engagement thresholds, ops notifications).

Templates resolve per-tenant with a system fallback, and merge vars are built from the customer (`business_name`, `community_name`, `customer_name`, `city`, `listing_url`, `founder_days_remaining`, `unsubscribe_url`, …). The enrollment side has a fast bulk path: `php artisan campaign:bulk-enroll` (`BulkEnrollCustomers.php`) inserts eligible-and-not-already-enrolled customers into `customer_timeline_progress` with a single `INSERT…SELECT`, optionally scoped by state/county — it completes a ~384K-row enrollment in minutes.

## 4.4 The schedulers that drive it

Scheduling lives in **both** `backend/app/Console/Kernel.php` and `backend/routes/console.php` (Laravel 11/12 supports either; CC uses both — check both when auditing cadence):

| Task | Cadence | Defined in |
|---|---|---|
| `ProcessCampaignTimelines` (job) | hourly | Kernel.php |
| `AdvanceCampaignDays` (job) | daily 00:00 | Kernel.php |
| `AdvanceManifestDestinyDay` (job) | daily 00:01 | console.php |
| `manifest-destiny:run` (`RunManifestDestiny`) | daily 09:00 | Kernel.php |
| `CheckUnopenedEmails` (job) | daily 08:00 | console.php |
| `ProcessBounces` (job) | every 10 minutes | console.php |
| `ReScrubStaleContactsJob` | weekly Sun 02:00 | console.php |
| `sync:from-publishing-platform` | daily 01:30 | Kernel.php |
| Priority dispatcher | every 10 seconds | Kernel.php |

> **Operational caveat:** the whole 90-day machine only advances if the scheduler is actually running. On Railway that is guaranteed by `start.sh` launching `schedule:work` alongside Horizon. If days are not advancing in production, confirm the scheduler process is alive first.

## 4.5 Compliance: suppression and unsubscribe

This is the legally load-bearing part of the engine. There is **defense in depth** so a suppressed or opted-out business can never be emailed:

1. **At enrollment / action time:** `canContactViaEmail()` gates every `send_email` (and the `scopeCanReceiveEmail` query gates bulk enrollment).
2. **At send time (the chokepoint):** `backend/app/Services/EmailService.php` checks both the `EmailSuppression` table (by address) and the customer's `email_suppressed` flag before any send, and stops with a reason if suppressed. This chokepoint also covers the pool-based path.
3. **Every email carries working unsubscribe:** `EmailService` injects a signed unsubscribe footer (HTML *and* text) pointing at the signed `public.unsubscribe` route, and sets the one-click headers `List-Unsubscribe: <url>, <mailto:...>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058). The signed `/unsubscribe/{customer}` pages live in `backend/routes/web.php`; the `POST` handler performs the one-click opt-out.

ZeroBounce pre-flight (4.6) runs *before* a campaign and the weekly re-scrub keeps the list clean over time.

## 4.6 Email deliverability: ZeroBounce + Postal pools

- **Postal** is the primary MTA. `EmailService::sendViaPostal()` posts to `{apiUrl}/api/v1/send/message` with the `X-Server-API-Key` header, supporting tags and named IP pools. Delivery events return via the Postal webhook.
- **ZeroBounce** (`ZeroBounceService`) validates addresses (`validate`, `bulkValidate`, `getBulkResults`, `getCredits`, `isSendable`, `shouldSuppress`). `CampaignPreFlightJob` runs ZB validation before a campaign and blocks if risk exceeds threshold. The weekly `ReScrubStaleContactsJob` re-validates contacts older than ~90 days. Results land on the customer's `zb_*` fields and can drive `email_suppressed`.
- **Pools:** Postal is configured with multiple IP pools (transactional / broadcast / smb_campaign) so bulk campaign sends don't poison transactional deliverability.

## 4.7 Landing pages: Room with Sarah

Every campaign email links to a narrated slide presentation at `/learn/:slug`. There are **65 source campaign JSONs** in `/content/` (`campaign_*_complete.json`, eager-imported at build) and **65 runtime JSONs** in `/public/campaigns/` (fetch-loaded), plus the master registry `public/campaigns/landing_pages_master.json`. The campaign-id families are HOOK, EDU, HOWTO, CONV, and INTRO.

The presentation is rendered by `src/components/learning/CampaignLandingPage.tsx` → `RoomWithSarah.tsx` → `FibonaccoPlayer` + `SarahPanel`, with the `useSarahNarration` hook driving greet/complete/slide-change narration. The campaign docs refer to the host persona as **"Sarah/Emma"**; in the live frontend the implemented component is **Sarah** (`RoomWithSarah`). There are 34 read-only slide components — none collect input or trigger backend actions yet, which is the known conversion gap (interactive checkout/quote/form slides are planned, not built).

**WHY it's built this way.** The campaign is the product's growth engine, and the compliance chokepoints are non-negotiable: a single un-gated send to a suppressed address is a legal and reputational liability. So the design layers the gate at enrollment, at action dispatch, and at the send chokepoint, and puts a real one-click unsubscribe on every message. The timelines are data (seeders + DB rows), so the *content* of the campaign can change without touching engine code.

**Key files:** `backend/database/seeders/ManifestDestinyTimelineSeeder.php`, `backend/database/seeders/ManifestDestinyEmailTemplateSeeder.php`, `backend/app/Services/CampaignActionExecutor.php`, `backend/app/Services/EmailService.php`, `backend/app/Models/CampaignTimeline.php`, `backend/app/Console/Commands/BulkEnrollCustomers.php`, `backend/app/Console/Kernel.php`, `backend/routes/console.php`, `src/components/learning/RoomWithSarah.tsx`, `docs/manifest-destiny-campaign-content.md`.

---

# PART 5 — CRM, BILLING, AND SALES

---

## 5.1 The pipeline

`backend/app/Enums/PipelineStage.php` defines exactly five stages and a strict order:

```
HOOK → ENGAGEMENT → SALES → RETENTION → CHURNED
```

(`HOOK` = trial/outreach, `ENGAGEMENT` = nurture, `SALES` = active conversion, `RETENTION` = paying, `CHURNED` = lost.) Each case carries a `label()` and a UI `color()`, and `nextStage()` encodes the progression. **There is no `PROSPECT` and no `CONVERTED` stage — do not reference them.** New synced businesses enter at `HOOK`; businesses with an active PP subscription are synced straight to `RETENTION`.

## 5.2 Deals, Quotes, Invoices

- **Deals** track an opportunity through the pipeline with won/lost outcomes.
- **Quotes** (`backend/app/Models/Quote.php`, `HasUuids` + `HasTenantScope` + `SoftDeletes`): `quote_number`, line `items`, `subtotal`/`tax`/`discount`/`total`, `valid_until`, `status`, and a **`public_token`** (a 48-char random token, generated uniquely via `ensurePublicToken()`). That token powers **public, unauthenticated quote acceptance**: `GET /v1/public/quotes/{token}`, `POST /v1/public/quotes/{token}/accept`, `POST /v1/public/quotes/{token}/decline`. Accepting a quote can spawn an invoice (`Quote hasOne Invoice`).
- **Invoices** (`backend/app/Models/Invoice.php`, same trait set): `invoice_number`, `status`, money fields plus `amount_paid`/`balance_due`, `due_date`/`paid_at`, `items`, and `payments` (`InvoicePayment`). Invoice **PDF** output is generated for download and email attachment.

## 5.3 Subscriptions, Stripe, dunning, proration

`backend/app/Models/ServiceSubscription.php` (`HasUuids` + `HasTenantScope` + `SoftDeletes`) is the recurring-revenue record: `tier` (`trial`/`basic`/`standard`/`premium`/`enterprise`), `status` (`active`/`cancelled`/`expired`/`suspended`), trial and subscription window timestamps, `auto_renew`, `stripe_subscription_id`, `stripe_customer_id`, `monthly_amount`, `billing_cycle`, `ai_services_enabled`, and dunning fields `renewal_attempts` / `last_renewal_attempt_at` / `renewal_failure_reason`.

`backend/app/Services/StripeService.php` is the Stripe boundary:

- **Subscriptions:** `createSubscription()` (uses `payment_behavior: default_incomplete`, saves the default payment method), `cancelSubscription()`.
- **Proration (upgrade/downgrade):** `updateSubscriptionPrice()` with `proration_behavior: create_prorations`, and `previewProration()` for a pre-change preview.
- **Payment methods:** `createSetupIntent()`, `listPaymentMethods()`, `retrievePaymentMethod()`, `detachPaymentMethod()`, `setDefaultPaymentMethod()`.
- **Charges/checkout:** `createPaymentIntent()`, `createCheckoutSession()` (accepts a Stripe coupon id for discounts).

**Auto-renewal and dunning** are Stripe-driven: renewal, proration, and period tracking are delegated to Stripe Subscription objects, with webhook handlers (`POST /stripe/webhook`) reconciling `invoice.payment_succeeded` / `customer.subscription.deleted` / `invoice.payment_failed` against `ServiceSubscription`. The dunning retry ladder (failure → retries → suspension → cancellation) and post-purchase emails were built out in the recent subscription sprint (see commit history and `docs/CC-EXECUTION-PLAN.md` Phase 1).

## 5.4 Coupons and onboarding

- **Coupons** (`backend/app/Models/Coupon.php`, `HasUuids`): `code`, `type` (`percent`/`fixed`), `amount`, `max_uses`/`uses_count`, `expires_at`, `applicable_service_ids` (empty = applies to all). `isRedeemable()` enforces active + not-expired + under-cap; `appliesToService()` and `discountFor()` compute the clamped discount. Applied to Stripe checkout via the coupon/discount param.
- **Onboarding** (`backend/app/Models/OnboardingProgress.php`, `HasUuids`): per-customer `step` / `completed_at` / `metadata`, surfaced as the `/command-center/onboarding` checklist after purchase and tracked via `POST /v1/onboarding/{step}/complete`.

## 5.5 The AI copilot

`PrismAiService` (in `backend/app/Services/AI/`) wraps the `anthropic-ai/sdk` (`\Anthropic\Client`) for the account-manager copilot: streaming SSE + sync JSON, personalities, content generation, and an action layer (`AIActionController`) with ~10 tool actions (lookup customer, draft email, update deal stage, pipeline summary, generate pitch, etc.). Models are configured in `backend/config/command-center-ai.php` (chat/actions on Claude Sonnet, lightweight analysis on Claude Haiku, embeddings via OpenAI `text-embedding-3-small`). AI task progress is broadcast on the private channel `cc.user.{userId}.ai-tasks`. The frontend surfaces this as a floating chat widget with inline action-confirmation cards.

**WHY it's built this way.** The five-stage pipeline mirrors the real sales motion (outreach → nurture → close → retain → churn) with no aspirational extra stages, so reporting and automation can rely on it. Money flows through one consistent spine — Order/Quote/Invoice/ServiceSubscription — with Stripe owning the hard parts (renewal, proration, dunning) so CC doesn't reimplement billing math. Public tokenized quote acceptance lets a buyer say yes without an account, which is essential when the buyer is a `customer`, not a logging-in `user`.

**Key files:** `backend/app/Enums/PipelineStage.php`, `backend/app/Models/{Quote,Invoice,ServiceSubscription,Coupon,OnboardingProgress}.php`, `backend/app/Services/StripeService.php`, `backend/app/Services/AI/PrismAiService.php`, `backend/config/command-center-ai.php`, `docs/CC-EXECUTION-PLAN.md`.

---

# PART 6 — AUTH AND THE CROSS-PLATFORM BRIDGE

---

## 6.1 User auth (Sanctum)

Operator auth is **Laravel Sanctum personal access tokens** (UUID-keyed; `User` uses `HasApiTokens`). The endpoints live under `/v1/auth` in `backend/routes/api.php`:

- `POST /v1/auth/register` — public, behind `throttle:auth`.
- `POST /v1/auth/login` — public, behind `throttle:auth`.
- `GET /v1/auth/me` — `auth:sanctum`.
- `POST /v1/auth/logout` — `auth:sanctum`.

(Aliases `GET /v1/user` and `POST /v1/logout` exist too.) Tokens do not expire by default. The `AuthController` was built in the recent auth sprint; everything behind `auth:sanctum` expects a `Authorization: Bearer <token>` header.

## 6.2 The frontend auth store

`src/stores/authStore.ts` is a Zustand store with `persist`, holding `user`, `token`, `isAuthenticated`, and `isLoading`. **It persists to localStorage under the key `fibonacco-auth`.** `login()` POSTs to `${VITE_API_URL}/auth/login` and stores user + token. `src/services/api.ts` is the single Axios instance (base URL `VITE_API_URL` or `https://api.fibonacco.com`): a request interceptor attaches `Authorization: Bearer ${token}` from the auth store, and a response interceptor logs out and redirects to `/login` on `401` — except for public routes (`/learn/...`, `/advertise/...`, `/login`), which are left alone so campaign landing pages render without a session.

> **Note for future sessions:** older notes mention a raw localStorage key `auth_token`. The live store persists under **`fibonacco-auth`** (the Zustand persist key) and reads the token from store state, not a bare `auth_token` key. Trust the store file.

## 6.3 The planned common-auth / OIDC direction

Across the Fibonacco app fleet (PP, CC, and the AI platform) the agreed direction is a **central identity provider** — PP holds the richest identity data, and a common-auth / OIDC IdP is the intended end state so a single operator identity works across all apps. **This is not built yet** and must not be built ad hoc now: CC uses local Sanctum today. Do not invent auth federation; when the central IdP arrives it will be a coordinated, cross-platform change.

## 6.4 The PP↔CC bridge

Two distinct service-to-service mechanisms connect the platforms:

- **Bridge reads/writes (Bearer):** `backend/app/Services/PublishingPlatformService.php::bridgeRequest()` calls PP with `Http::withToken($apiKey)` where the key is `config('services.publishing_bridge.api_key')` (the **`PUBLISHING_BRIDGE_API_KEY`**, the *same shared secret set on both Railway projects*). Export endpoints include `GET /api/v1/bridge/export/{communities,businesses,business-subscriptions,civic-entities,nonprofits}`; write endpoints push articles, listings, events, newsletter features, and AlphaSite activation back to PP.
- **Provisioning (X-Provisioning-Secret):** the money path — when CC closes a publishing-product sale it calls PP's `POST /api/v1/provision/subscription` with the `X-Provisioning-Secret` header, passing the CRM order id and Stripe ids so PP creates/updates the Business + BusinessSubscription. (The AI platform exposes a mirror contract for AI-app sales.)

The sync itself is `php artisan sync:from-publishing-platform` (`SyncFromPublishingPlatform`), a 3-phase pull (communities by slug, businesses/nonprofits/civic by `external_id`, then subscriptions), scheduled nightly at 01:30. Two hard-won facts from building it: PP uses **raw `DB::select()`** (not Eloquent — model hydration/`$appends` caused timeouts), and PP wraps every response as `{"success":true,"data":<payload>}`, so CC must unwrap `['data']['data']`.

**WHY it's built this way.** Operators are few and authenticate locally; businesses are millions and never log in — so Sanctum is enough today, and a central IdP is deferred to a coordinated future change rather than half-built now. The bridge keeps PP as the source of truth (CC references by `external_id`, doesn't copy ownership) and separates *reads* (Bearer bridge) from *the money path* (provisioning secret) so a compromised read token can't provision subscriptions.

**Key files:** `backend/app/Http/Controllers/Api/V1/AuthController.php` (auth), `backend/routes/api.php` (`/v1/auth`, `/v1/bridge`), `backend/app/Services/PublishingPlatformService.php`, `backend/app/Console/Commands/SyncFromPublishingPlatform.php`, `src/stores/authStore.ts`, `src/services/api.ts`, `docs/PLATFORM-STATUS-AND-SYNC-PLAN.md`.

---

# PART 7 — CONVENTIONS / DOCTRINE (THE NON-NEGOTIABLES)

These are reproduced from `CLAUDE.md` (project + global). They are not style preferences; most of them are deploy-failure prevention. **Violating them breaks production.**

**The three rules that prevent 90% of deploy failures:**

1. **Never use `env()` outside `config/` files.** Production caches config (`config:cache`); `env()` returns `null` afterward. Read config values via `config('services.foo.key')`.
2. **Never run composer scripts during the Nixpacks install phase.** Use `--no-scripts` in install; run artisan commands explicitly in the build phase.
3. **Check for duplicate route names before deploying.** Run `php artisan route:cache` locally — it catches collisions. Use unique route-name prefixes (`api.` for API routes) to avoid web/API collisions.

**PHP:**
- Every PHP file starts with `<?php` then `declare(strict_types=1);`.
- Every class in `app/Models`, `app/Services`, `app/Jobs`, `app/Http/Controllers` is a **`final class`**.
- Every Model uses the **`HasUuids`** trait and defines **`$fillable`**.
- Never commit `dd()`, `dump()`, `ray()`, `var_dump()`.
- Controllers return **JSON** — never Inertia responses.

**Database (PostgreSQL, NOT MySQL):**
- Primary keys: `$table->uuid('id')->primary()` — never `$table->id()`.
- Foreign keys: `$table->foreignUuid('user_id')` — never `$table->foreignId()`.
- Forbidden: `unsigned`, `tinyint`, `mediumint`, `ENUM`, `AUTO_INCREMENT`, `DATETIME`.
- Use `integer`, `smallInteger`, `text`, `uuid`, `timestamp`, `timestampTz`.
- Every migration has a `down()` method.
- pgvector is enabled for AI embeddings.
- **PostgreSQL-safe queries:** never `->having()` on a column alias (e.g. a `withCount` alias or `selectRaw(... AS x)`) — PostgreSQL rejects it. After `->withCount('foo')`, filter with `->get()->filter(...)` or `whereHas()`. Haversine distance goes in `whereRaw()` with the full formula, never `having('distance_miles', ...)`. Write standard SQL that works across PostgreSQL/MySQL/SQLite.

**TypeScript / React:**
- Never use `any` — define interfaces for all data.
- Use `import type { X }` for type-only imports; remove unused imports.
- No `console.log`/`console.debug`/`debugger` in committed code.
- Routing is React Router (`<Link to="...">`), not Inertia. State in Zustand (`src/stores/`). Data via TanStack Query + Axios (`src/services/`).
- Buttons specify `type="button"` unless they are a form submit.
- When wiring an API, **delete the mock data** — no silent fallbacks.

**Accessibility:** every interactive element needs an accessible name — icon-only buttons `aria-label`, toggles `role="switch"` + `aria-checked` + `aria-label`, inputs an associated `<label>`/`aria-label`, images `alt` (empty `alt=""` only when decorative).

**Adding a feature:** add new env vars to `config/*.php` **and** `.env.example` (never `env()` directly); use UUID PKs + PostgreSQL syntax in migrations; use unique route-name prefixes; run the pre-deploy checklist before pushing.

---

# PART 8 — DEPLOY AND OPERATIONS

---

## 8.1 Railway services

CC deploys on **Railway** (Nixpacks). Project: **CRM-CC-LC-Project**, with two services:

- **`horizon`** — the Laravel backend. Start command `bash start.sh`, which launches the **scheduler** (`schedule:work`), **Horizon** (queue workers), and the **HTTP server** (`artisan serve --host=0.0.0.0 --port=$PORT`, foreground = healthcheck target). Config in `backend/nixpacks.toml` and `backend/railway.json`.
- **`CRM-CC-LC`** — the React SPA. Build `npm run build`; serve the `dist/` with `serve`. Config in the repo-root `railway.json`.

`.env` is **not** committed (Railway sets env vars via the dashboard); `composer.lock` **is** committed for version pinning. Migrations run **separately** from deploy.

## 8.2 The Nixpacks build pipeline

`backend/nixpacks.toml`:

- **setup:** PHP 8.4 + composer + `pdo_pgsql` + `redis` extensions.
- **install:** `composer install --no-dev --optimize-autoloader --no-scripts` (the `--no-scripts` is rule #2 — avoids premature `package:discover`).
- **build:** explicit artisan caching, each prefixed `APP_URL=http://localhost` to avoid Invalid-URI errors during cache compilation: `package:discover`, `config:cache`, `route:cache`, `event:cache`.
- **start:** `bash start.sh`.

## 8.3 `ship.sh` — the pre-deploy gate

`ship.sh` (repo root) is the pre-deploy validation script (LC runs v4). Typical use: `./ship.sh --check` (run all checks), `./ship.sh "message"` (check + commit + push), `--deep` (add Larastan/Pint/tests), `--dry`, `--force` (skip checks; emergencies only), `--review-logs [--fix] [--since 24h]` (AI analysis of Railway logs via Claude, optionally proposing patch diffs).

Its phases enforce the doctrine in Part 7 mechanically:

- **PHP checks:** syntax, no `env()` in `app/`, no debug functions, `HasUuids` on models.
- **Migration checks:** `down()` present, reject MySQL keywords (`unsigned`/`enum()`/`AUTO_INCREMENT`), reject `$table->id()` / `foreignId()`, and a SQLite in-memory dry-run of new migrations.
- **Boot checks:** `config:cache` / `route:cache` (catches **duplicate route names**) / `event:cache` compile clean; `composer.lock` in sync; PHP version consistency across CI / `composer.json` / `nixpacks.toml`.
- **Deploy-config checks:** `nixpacks.toml` has `--no-scripts` in install and the cache commands in build; **`.env.example` is in sync with config env vars; no hardcoded `.railway.internal` or localhost URLs**.
- **The unpinned-npx guard:** `ship.sh` **blocks an unpinned `npx <package>` at boot** (e.g. `npx serve`). These re-fetch from the npm registry on every cold start, which causes flaky healthchecks and crashed deploys. The fix is to pin the package in `package.json` (`npm i --save-exact <package>`). This guard exists because a deploy crashed exactly this way.
- **Frontend checks:** no `console.log`/`debugger`, no `any`, TypeScript compiles.

## 8.4 Running artisan against production

`.env` isn't committed and production runs against the private Railway network, so to run an artisan command against the **production CC database** from a laptop, override `DATABASE_URL` (and `DB_HOST`/`DB_PORT`) with the **public proxy** host:

```bash
railway run -- env \
  DATABASE_URL=postgresql://postgres:PASS@trolley.proxy.rlwy.net:53826/railway \
  DB_HOST=trolley.proxy.rlwy.net DB_PORT=53826 \
  php artisan <command>
```

The CC DB is at `trolley.proxy.rlwy.net:53826`; the PP DB (used via `PP_DB_URL` for the sync) is at `trolley.proxy.rlwy.net:12043`. Migrations are run this way (`php artisan migrate --force`), separately from the deploy.

## 8.5 The lessons baked into the pipeline

Several deploy failures are now permanently prevented:

- **Phantom multi-brand services and an SSR service** were deleted — CC is one unified API + one SPA; it is not Inertia, so an SSR service can never start.
- **Horizon requires Redis/Valkey** — the database queue driver does not work with Horizon and won't survive 9,000+-customer campaign scale; `QUEUE_CONNECTION=redis` is required.
- **`APP_URL=http://localhost` prefix** on build-phase artisan commands prevents Invalid-URI crashes during cache compilation.
- **Serve must be pinned** — never `npx serve` at boot (8.3).

**WHY it's built this way.** Railway caches config and rebuilds from a clean Nixpacks image every deploy, so anything that depends on runtime `env()`, network access at boot, or composer scripts during install will fail unpredictably. `ship.sh` turns every past outage into an automated gate, so the same mistake can't ship twice. Migrations and the data sync are deliberately *out of band* (run via `railway run`) so a deploy never blocks on a long-running data operation.

**Key files:** `backend/nixpacks.toml`, `backend/railway.json`, `railway.json`, `ship.sh`, `backend/start.sh`, `backend/.env.example`.

---

## How to Keep This Current

This document is a **living reference**, but it is only useful if it stays true. The discipline:

- **Append, don't overwrite.** When you change a subsystem, update the relevant Part in place (and its "WHY" + key-files footer). Don't silently delete history — if a fact changes, state the new truth.
- **Update the section you touched.** Changed the auth flow? Update Part 6. Added a timeline action type? Update Part 4. Added a Stripe webhook? Update Part 5.
- **Bump the version line** at the top with a one-line note of what changed (mirror the Content Bible's `vX.Y` convention).
- **The code always wins.** If this doc and the live code disagree, the code is right and the doc is stale — fix the doc. When verifying "what exists," read the live repo under `/Users/johnshine/Dropbox/Fibonacco/Learning-Center/`, never `/mnt/project/` snapshots.

*v1.0 — June 2026. Initial authorship verified against the live repo (models, services, routes, config, `ship.sh`, the two routers, and the auth store).*
