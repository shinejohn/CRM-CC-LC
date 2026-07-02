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
- [ ] Phase 0
- [ ] Phase 1 (A1–A4)
- [ ] Phase 2 (B1–B4)
- [ ] Phase 3
- [ ] Phase 4
