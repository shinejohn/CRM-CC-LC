# Remediation Project Plan — Full Assessment Fixes

**Branch:** `fix/assessment-remediation-2026-07`
**Source of findings:** `docs/FULL-CODE-ASSESSMENT-2026-07-01.md`
**Execution model:** Phased. Agents own **disjoint file sets** so parallel edits never collide. The orchestrator (main loop) runs `npm run verify` + `composer test` and commits **between** phases — agents only edit and report. Every phase ends green or is rolled back.

---

## Ownership rule
No two agents in the same phase may edit the same file. Shared files (`routes/api.php`, `SendEmailCampaign.php`, `StripeWebhookController.php`, `ManifestDestinyTimelineSeeder.php`) are assigned to exactly one agent per phase; dependents are sequenced into a later phase.

---

## Phase 0 — Trivial self-contained fixes (orchestrator, direct)
- `Email/BounceHandlerService.php:16` — delete the `$this->suppressor = $offset;` typo line.
- `CrmDashboardController.php:42-50` — double-quoted SQL string literals → single quotes (PostgreSQL).
- `database/factories/SMBFactory.php:27` — drop the `uuid` column write (unblocks 2 failing tests).

## Phase 1 — Disjoint, self-contained CRITICALs (parallel agents)
- **A1 · Security routes & webhooks** — `routes/sarah.php`, `routes/api.php`, `routes/web.php`, `Api/WebhookController.php`, `Api/StripeWebhookController.php`, `Api/V1/WebhookController.php`, `Api/V1/CommunicationWebhookController.php`, `Api/V1/PostalWebhookController.php`, + new `stripe_webhook_events` idempotency migration/model. Fixes: fail-closed webhooks, Stripe event idempotency, audio path-traversal, Sarah-notebook auth, municipal-admin role gate, literal-before-`{id}` route ordering.
- **A2 · int→UUID job constructors** — `Jobs/Alert/SendAlert.php`, `Jobs/Emergency/SendEmergency{Email,Sms,Voice,Push}.php`, `Jobs/Communication/ProcessMessage.php`, `Services/Newsletter/NewsletterService.php`, `Services/EmergencyBroadcastService.php` (+ dispatch sites). Fixes: TypeError on dispatch for alerts/newsletters/emergency/P0; remove false "simulate success" increments.
- **A3 · DB schema & models** — original create-migrations for the bigint→uuid FK columns (fresh/test DBs) + new pgsql-guarded ALTER migration (prod); models `Sponsorship`, `RevenueRecord`, `TicketStatusHistory` (`$table`), `NewsletterSchedule` (+ add-column migration). **Does NOT touch factories.**
- **A4 · Campaign content corruption** — `content/campaign_*.json`, `public/campaigns/*.json`, `landing_pages_master.json`. Revert the "ai"→"modern tools" corruption (slugs/urls/audio_base_url → `ai`, prose → `AI`); resync master registry. Restoring slugs re-resolves 12 of the 17 dead email links.

## Phase 2 — Interdependent CRITICALs (parallel agents, disjoint files)
- **B1 · Tenant isolation & authz** — `CustomerController`, `DealController`, `QuoteController`, `InvoiceController`, `OutboundCampaignController`, `SMBBulkController`, `TenantScope`, `AIActionController` (derive tenant from `$request->user()`, never a client header; whitelist bulk-update columns; soft-delete guard).
- **B2 · Billing money path** — `Pitch/CheckoutController.php` (server-side pricing + `confirmPayment` session/amount/one-shot guard), `CommunitySubscriptionService.php`, `PitchProvisioningService.php`, `RenewExpiredSubscriptions.php` (Stripe idempotency key), Basil-API field access in Stripe handlers.
- **B3 · Campaign engine + send path** — `bootstrap/app.php`/`Console/Kernel.php`/`routes/console.php` (bind scheduler, de-dup, `onOneServer`/`withoutOverlapping`), `config/horizon.php` (add supervisors for orphaned queues), `CampaignOrchestratorService.php` (catch `\Throwable`, chunk/cursor), `CampaignActionExecutor.php`, `ManifestDestinyTimelineSeeder.php` (day-60 enum, seeder slug realignment to restored slugs), `SendEmailCampaign.php` (suppression + status-on-confirmed-send + idempotency).
- **B4 · Inbound email & suppression** — `Email/BounceHandlerService.php` (payload path + soft/hard), `ProcessInboundEmailJob.php` (FROM lookup), `InboundEmailService.php` (opt-out scope), `InboundEmailRoutingService.php` (dispatch signature, DNC overwrite), `UnsubscribeController.php` (POST-to-confirm), `ReScrubStaleContactsJob.php`/`CampaignPreFlightJob.php` (`chunkById`, timeout/tries/backoff).

## Phase 3 — Frontend contract unification (agent + orchestrator review)
- Single `VITE_API_URL` convention; one token store; set `tenant_id` on login; correct every service path prefix; fix login/ops/email-engine/dashboard endpoints; guard standalone internal routes; fix CC customer drill-down route; kill the two infinite-refetch patterns; `.env.example` + deploy scripts aligned.

## Phase 4 — Deploy/infra + remaining HIGH/MEDIUM
- `nixpacks.toml` APP_URL, `start.sh` scheduler/onOneServer/process supervision, `php artisan serve`→production server, `QUEUE_CONNECTION`/`BROADCAST_CONNECTION` defaults, `failed()` handlers, big-table pagination caps, remaining MEDIUM/LOW clusters.

---

## Acceptance gate per phase
`npm run verify` green **and** `composer test` green (target: 356 passing, 0 failing) before the phase is committed. Each phase = one focused commit.

## Status
- [x] Phase 0 — trivial fixes (in commit a1cdaa2c)
- [x] Phase 1 (A1–A4 + A2b + test reconcile) — commit `a1cdaa2c`
- [x] Phase 2 (B1–B4 + test migration) — commit `ef136661`
- [x] Phase 3 (C1–C2 frontend contract) — commit `f29f1462`
- [x] Phase 4 (D1/D2/D4 infra+jobs+paths) — commit `f8a90c8e`

Each phase committed only after `composer test` (356 passed / 0 failed) **and**
`npm run verify` (all 8 checks) were green.

## Follow-ups — DONE (Waves 1–3, commits 98faaf4d / d59b246a / b7d4db28)
- [x] Ops dashboard: 30+ endpoints wired over existing Operations models (+ real Incident index, FOA chat via PrismAiService)
- [x] Email Health / Contact Health / Inbound Inbox endpoints; inbound pipeline now writes EmailConversation so the inbox populates; email_conversations.status added
- [x] CRM Kanban customer pipeline-stage (guarded transition); dashboard widgets + real recent-activity feed
- [x] AI generate-faq / process-actions; presentations index; nested CRM sub-resources
- [x] Training data layer (datasets/examples/validation/approve/reject/merge, agent knowledge-config, real test-query) — model TRAINING itself is an honest placeholder (no ML backend in repo)
- [x] Education email subjects realigned to campaigns
- [x] Frontend wired to all the above (useDashboard + services de-stubbed); presentation-api unwrap fix; training route-shadow fixed (whereUuid)
- [x] 17 smoke tests over the new endpoints — suite now 373 passed / 0 failed

## Still remaining (genuinely out of code scope / deliberate backlog)

**Feature-builds (frontend calls a page that needs a NEW backend route):**
- Email Health / Contact Health / Inbound Inbox pages (`email-engine-api` health/contacts/inbound endpoints)
- Ops dashboard sub-resources (ai-sessions, infrastructure-components, metric snapshots, cost-tracking, incident create/update, FOA chat) — backend exposes only 9 aggregate GETs
- CRM Kanban customer pipeline-stage endpoint; dashboard widgets/activity-feed + widget-position persistence
- AI generate-faq / process-actions; presentations index; the entire `training-*` surface (datasets/train/validation)
- Nested CRM sub-resources (`/customers/{id}/{contacts,deals,activities}`) — use the flat filtered routes or add nested ones
These are marked `// TODO: no backend route` in the code and degrade to empty/placeholder via existing `.catch` fallbacks.

**Content copyedit:** after the Education campaign slug realignment, a few EDU email
subject lines no longer match their campaign topic (e.g. EDU-009 subject "Local SEO"
now maps to `voice-ai-guide`). Needs a human copy pass over the seeder subjects.

**Operational (set in Railway dashboard, code-ready):**
- `RUN_SCHEDULER=1` on exactly ONE service (the horizon service)
- Real `APP_URL`, `QUEUE_CONNECTION=redis`, a real broadcaster (`reverb`/`pusher` — none installed yet), `REDIS_QUEUE_RETRY_AFTER` inherits the safe 7800 default
- Run the new migrations: `stripe_webhook_events`, the bigint→uuid ALTER, `revenue_records`, the users tenant backfill
- Prod HTTP still uses `php artisan serve` (no prod server in the Nixpacks image) — consider FrankenPHP/php-fpm later

**Long-tail MEDIUM/LOW** from the assessment not in scope of the CRITICAL/HIGH passes
(fabricated-data-as-live placeholder pages, remaining accessibility/`type="button"`
gaps, duplicate parallel service layers, remaining `failed()` handlers on lower-risk
jobs) — enumerated in `docs/FULL-CODE-ASSESSMENT-2026-07-01.md` §5.
