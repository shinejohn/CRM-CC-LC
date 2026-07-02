# Fibonacco Command Center — Full Code Assessment

**Date:** 2026-07-01
**Scope:** All 5 apps (Learning Center, Command Center SPA, Pitch, Ops, Laravel backend API), the campaign data, and the background workflows.
**Method:** 11 parallel deep-review agents over the **live** repo at `/Users/johnshine/Dropbox/Fibonacco/Learning-Center/` (never `/mnt/project/`), plus mechanical sweeps. Every CRITICAL below was **re-verified by hand against live source** before inclusion — findings are code-evidenced, not speculative.

---

## 1. Executive Summary

The individual subsystems are largely *built*, but **the wiring between them is broken at nearly every joint.** The recurring failure mode across all 5 apps is not "feature missing" — it is "feature exists but is not connected to the thing that invokes it." This produces a system that passes `npm run verify` and builds clean, yet cannot execute its core money and campaign paths in production.

Five headline facts:

1. **The Manifest Destiny campaign engine has no working execution path.** Its scheduler entries live in an unbound `App\Console\Kernel` (dead code), and its jobs target a `campaigns` queue that no Horizon supervisor consumes. The 385K-contact campaign is not sending. If it *were* wired up, it would double-send (no idempotency locks, duplicate scheduling) and crash permanently at day 60 (invalid enum value uncaught).
2. **The money path trusts the client.** Pitch checkout builds the Stripe charge from a client-supplied `total_amount` (pay $1 for a $300/mo package). Stripe and Postal webhooks **fail open** when their secrets are unset. Payment confirmation is replayable.
3. **Tenant isolation is a client-supplied header.** Any self-registered user can send `X-Tenant-ID: 00000000-…-0001` (the fixed system tenant every synced row uses) and read/update/**force-delete** all ~12.9M customer records. Several endpoints (Sarah notebooks, municipal-admin management) sit entirely outside auth.
4. **The emergency broadcast pipeline (fire/tornado/shooter) is dead.** All four emergency jobs type their ID param as `int` while the model uses UUIDs — TypeError on dispatch, under `strict_types`, before a single message queues. Same bug kills alerts and newsletters.
5. **The frontend and backend disagree on their own contract.** No single value of `VITE_API_URL` satisfies all callers; the auth token is written to one store and read from another; `tenant_id` is required by controllers but never set by any client. Large fractions of both SPAs 401/404/400 on load.

Additionally, a global **"ai" → "modern tools" find/replace corrupted machine-read fields** (slugs, URLs, audio paths — 558 occurrences), and **17 of 60 campaign emails link to landing pages that don't resolve** — for 385K enrolled contacts.

### Severity counts (verified, deduplicated)

| Severity | Count |
|---|---|
| CRITICAL | 34 |
| HIGH | 61 |
| MEDIUM | ~85 |
| LOW | ~60 |

### Build / test status
- `npm run verify` — **passes** (all 8 checks); main JS bundle is 1.9 MB minified (code-split warning only).
- `composer test` — **4 failing** (352 passing): `SMBFactory` writes the dropped `smbs.uuid` column (breaks `MultiTenancySecurityTest` — so the multi-tenancy security test has not actually been running — and `PitchEnrichmentWritesSmbAndCustomerTest`); `AIControllerTest` expects `message` while the controller validates `messages`.
- `php artisan route:cache` — clean, no duplicate route names.
- No `dd()`/`dump()`/`console.log`/`debugger` in committed code.

---

## 2. Cross-Cutting Root Causes

These themes each generate many of the individual findings. Fix the theme, not just the symptom.

- **A. Dead scheduler + orphaned queues.** `App\Console\Kernel` is never bound (Laravel-12 `bootstrap/app.php` uses `->withRouting(commands: routes/console.php)`). Everything scheduled *only* there never runs: Manifest Destiny 09:00 run, billing renewals, invoice/quote expiry, re-engagement, the Communication module sweeps, Pitch abandonment. Separately, Horizon supervisors cover only `emails`, `email-high`, `rvm`, `ai`, `ai-high`, `default` — leaving `campaigns`, `sms`, `calls`, `voicemail`, `alerts`, `emergency`, and `messages-p0..p4` with **no consumer**. Jobs on those queues sit in Redis forever.
- **B. bigint-vs-uuid FK drift.** The May-2026 bigint→uuid conversion fixed only an enumerated FK list. Left as bigint against uuid parents: `analytics_events.{smb_id,community_id}`, `chat_messages.smb_id`, `email_conversations.smb_id`, `unsubscribe_tokens.scope_id`, `suppression_list.community_id`, `alert_sends.*_message_id`, `sessions.user_id`. Each throws `invalid input syntax for type bigint` on the first real write. Same class as the previously-patched `smbs.community_id` incident.
- **C. Compliance layer disconnected from send paths.** Suppression checks, unsubscribe flags, ZeroBounce pre-flight, and bounce handling all *exist*, but the primary pool send path (`SendEmailCampaign::sendViaPool`) reads none of them, the pre-flight gate is bypassed, inbound opt-outs match on the wrong address, and `BounceHandlerService` cannot even instantiate. The Bible's claim that the EmailService chokepoint "covers the pool-based path" is false in code.
- **D. `int` params on UUID models under `strict_types`.** `SendAlert`, `NewsletterService::send`, all 4 `Emergency\*` jobs, `Communication\ProcessMessage` — every one TypeErrors on dispatch. Because `TypeError`/`ValueError` extend `\Error`, surrounding `catch (\Exception)` blocks don't catch them, so the every-minute processors crash-loop.
- **E. Frontend↔backend contract fragmentation.** Three incompatible API-base conventions (`/api`, `/api/v1`, bare domain), two token stores (`fibonacco-auth` zustand vs `localStorage['auth_token']`), a required `X-Tenant-ID`/`tenant_id` that no client sets, and dozens of service files whose paths omit `/v1` or double-prefix. This is the single highest-impact systemic defect on the client side.
- **F. Webhooks fail open.** Postal inbound, Postal V1, and Stripe webhooks all "allow if secret/signature absent." `CommunicationWebhookController` has no verification at all and matches messages with `LIKE %id%`.
- **G. Trust the client for money & identity.** Pitch checkout amount, coupon math, `lead_score`, and tenant id all originate client-side and are used server-side without re-derivation.
- **H. Fabricated data rendered as live.** Across both SPAs, many routed pages show hardcoded financials, fake metrics, and mock queues with dead buttons — an operator cannot tell real state from placeholder (dangerous on the Ops/emergency/escalation pages).

---

## 3. CRITICAL Findings (34)

### Security & Authorization

1. **Sarah notebook endpoints are public and write customer PII.** `routes/sarah.php:37-41` — `show`/`update`/`approve` sit outside `auth:sanctum` (group starts line 44). `SarahNotebookService::approve()` (:214) does `Customer::where('id',$customer_id)->update($updates)` with caller-supplied `business_name`/`email`/`phone`/`address`/`metadata`. Unauthenticated attacker overwrites any of 12.9M customers' contact PII by UUID.
2. **Tenant isolation is a client header.** `CustomerController.php:23,100,171,192` (+ `DealController`, `QuoteController`, `InvoiceController`) — `$tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id')`. `TenantScope` is a no-op when the user's `tenant_id` is null (registration never sets it), and every synced row uses the fixed `config('fibonacco.system_tenant_id')` default `00000000-0000-0000-0000-000000000001`. Any registered user reads/updates/`forceDelete()`s the entire customer/deal/quote/invoice base.
3. **Municipal-admin self-escalation.** `routes/api.php:870-877` — `municipal-admins` group is `auth:sanctum` only despite the "super admin only" comment. Any user `POST`s themselves in, `verify`s the row (`is_active=true`), then reaches the emergency broadcast routes gated by `MunicipalAdminMiddleware`.
4. **Path traversal / arbitrary file read.** `routes/web.php:43` — `Route::get('/storage/audio/{path}')->where('path','.*')` builds `storage_path("app/public/audio/{$path}")` with no `..`/realpath containment. URL-encoded traversal reads arbitrary files, unauthenticated.
5. **Mass-write of any column across the tenant.** `SMBBulkController.php:78-99` — validates only `updates=array`; `$tenantId` comes from the request body; runs `$query->update($validated['updates'])` (query-builder update bypasses `$fillable`). Any caller sets `email_suppressed`, `pipeline_stage`, `tenant_id`, etc. across up to 12.9M rows.
6. **Stripe webhook fails open.** `StripeWebhookController.php:59-66` — when `services.stripe.webhook_secret` is unset, it `json_decode`s and acts on the unsigned payload (mark orders paid, provision, move pipeline). Forgeable `checkout.session.completed`.
7. **Postal inbound webhook fails open.** `WebhookController.php:95-98` — `if (!$secret || !$signature) return true;`. Omit the header → forged inbound mail drives opt-out mutation, AI auto-replies, CRM writes on the unauthenticated `/webhooks/postal/inbound`.
8. **Communication webhook: no verification + substring match.** `V1/CommunicationWebhookController.php:22-45` — `postal`/`ses`/`twilio`/`firebase` have zero signature checks and match with `orWhere('external_id','like',"%{$messageId}%")`. `message_id:"%"` matches an arbitrary message and lets an attacker mark it bounced/complained.

### Money path

9. **Pitch checkout trusts client amount.** `Pitch/CheckoutController.php:36-46` — `total_amount` comes from the request; `$amountCents=(int)round($data['total_amount']*100)`; never re-priced server-side. Prices live only in frontend gate files. Pay $1 for the $300/mo package.
10. **`confirmPayment` is replayable and unbound to the session.** `Pitch/CheckoutController.php:104-182` — only checks `$intent->status==='succeeded'`; no `$session->status` guard, no `metadata.session_id` match, no amount check. Any succeeded PaymentIntent id (even $0.50 from another session) converts the session and re-runs full provisioning (duplicate `CommunitySubscription`, duplicate PP `createListing`/`activateAlphaSite`, extra slot).
11. **No Stripe event idempotency.** `StripeWebhookController.php:37-94` — no processed-event store anywhere. Redelivered `invoice.payment_failed` (:558) climbs the dunning ladder and suspends a paying customer; redelivered `charge.refunded` (:248) re-increments inventory. Stripe delivers at-least-once.
12. **Local subscription marked active without payment.** `CommunitySubscriptionService::subscribe():88-112` — sets `status=>'active'` while `StripeService::createSubscription` uses `payment_behavior: default_incomplete` and never attaches the passed `$paymentMethodId`. Stripe can never collect; local says active; provisioning gates on this.

### Campaign engine & email

13. **Primary send path has zero suppression checks.** `SendEmailCampaign::sendViaPool` (:116-172) → `PostalService::send()` — no `email_suppressed`, `zb_status`, `do_not_contact`, suppression-table lookup, or unsubscribe footer (grep confirms none). Unsubscribed customers get mass-mailed whenever an `EmailPool` row exists.
14. **`BounceHandlerService` cannot instantiate.** `Email/BounceHandlerService.php:16` — literally committed: `$this->suppressor = $offset; // wait typo, let's fix it later. Ah I am writing it now.` Undefined `$offset` → TypeError on every construction → the V1 Postal webhook 500s and **no bounce/complaint ever suppresses anything** through that endpoint.
15. **Pre-flight gate is decorative.** `OutboundCampaignController.php:398-414` + `SendEmailCampaign.php:46` — `CampaignPreFlightJob` is queued, then all `SendEmailCampaign` jobs are queued in the same transaction; the send job never checks `campaign->status` (ignores `'held'`) and its skip-list omits `'failed'`. A 50%-invalid list sends in full.
16. **Bulk recipient list = whole table.** `OutboundCampaignController.php:249-334` — `buildRecipientList()` applies no email-health filter and ends with `$query->get()` on customers (12.9M). Empty `recipient_segments` (allowed) skips all filters → segment-less campaign targets the entire table; `start` then row-by-row creates + dispatches one job per recipient in one transaction (OOM/timeout).
17. **Inbound replies matched by TO not FROM.** `ProcessInboundEmailJob.php:48-50` — `Customer::where('email',$toEmail)->orWhere('primary_email',$toEmail)`. The To is Fibonacco's own inbox, so real replies never match → every reply-based unsubscribe/opt-out silently dropped for the 385K enrolled; if a customer row *does* hold the To address, the wrong customer is opted out.
18. **Opt-out regex over-matches quoted footer.** `InboundEmailService::detectOptOut:26-41` — scans the entire body incl. the quoted original (which always contains the injected "Unsubscribe" footer) and matches bare `stop`. Once #17 is fixed, every genuine reply auto-sets `do_not_contact=true` and writes a suppression row.
19. **`campaigns` queue has no Horizon consumer.** `config/horizon.php:150-186` vs `ProcessCampaignTimelines.php:24`/`AdvanceCampaignDays.php:24` (`->onQueue('campaigns')`). Hourly processor and midnight day-advancer never execute; a stale backlog accumulates in Redis and detonates (concurrent unlocked runs) the day `campaigns` is added to a supervisor.
20. **No idempotency lock → double-send.** `CampaignOrchestratorService.php:102-148` + `Console/Kernel.php:71` + `routes/console.php:38` — `ProcessCampaignTimelines` scheduled hourly in *both* files; `AdvanceCampaignDays` at 00:00 *and* 00:05; `manifest-destiny:run` has no `withoutOverlapping()`; jobs aren't `ShouldBeUnique`. Completion tracking is a non-atomic JSON read-modify-write done *after* the send. Overlapping passes double-send.
21. **Day-60 kills the engine permanently.** `ManifestDestinyTimelineSeeder.php:142` sets `new_stage=>'active'`; `CampaignActionExecutor.php:379` calls `PipelineStage::from('active')`; the enum has no `active` case → `ValueError`. `CampaignOrchestratorService.php:137` only `catch (\Exception)` — `ValueError extends \Error` — so the first Education customer at day 60 aborts the whole run, at the same point, every day.
22. **385K rows loaded into memory.** `CampaignOrchestratorService.php:202-204` and `AdvanceCampaignDays.php:39` — `CustomerTimelineProgress::where('status','active')->with(['customer','timeline'])->get()`. OOM/timeout; `getActionsForDay()` called twice per record adds ~770K queries per run.

### Workflows / scheduler

23. **`App\Console\Kernel` is never bound.** `bootstrap/app.php` (verified) registers only `routes/console.php`. Every task scheduled *only* in `Console/Kernel.php` never runs: `manifest-destiny:run` (09:00), `RenewExpiredSubscriptions` (billing), invoice `markOverdue`, quote expiry, `SendReengagementCampaign`, `embeddings:process`, `CompileAllEmailLists`, `UpdateEngagementScores`, the entire Communication module dispatcher, all Pitch sweeps.
24. **Orphaned queues.** `config/horizon.php:150-186` — no worker for `campaigns`, `sms` (`SendSMS.php:25`), `calls` (`MakePhoneCall.php:25`), `voicemail`, `alerts` (`Alert/SendAlert.php:21`), `emergency` (all 4 jobs), `messages-p0..p4`. SMS/calls/voicemail/alerts/emergency broadcasts never deliver.
25. **Emergency broadcast pipeline is dead.** `Emergency/SendEmergencyEmail.php:25` (+ Sms/Voice/Push) — `private int $broadcastId` but `EmergencyBroadcast` uses `HasUuids`; `EmergencyBroadcastService.php:145` dispatches with a UUID under strict types → TypeError before anything queues. Fire/tornado/shooter broadcasts crash on dispatch.
26. **Scheduled alerts crash-loop.** `Alert/SendAlert.php:19` — `public int $alertId` vs UUID `Alert`; `ProcessScheduledAlerts.php:25` dispatches with a UUID → TypeError every minute; the alert stays `approved` and re-crashes.
27. **Scheduled newsletters can never send.** `Newsletter/NewsletterService.php:97` — `send(int $newsletterId)` vs UUID `Newsletter`; `ProcessScheduledNewsletters.php:36` passes a UUID → TypeError (an `Error`, uncaught by `catch (\Exception)`).
28. **P0 messages TypeError.** `Communication/ProcessMessage.php:26` — `public int $messageId` vs UUID `MessageQueue`; `MessageService.php:66` dispatches with a UUID → highest-priority messages fail.

### Data layer

29. **`analytics_events` FK type mismatch.** `2026_01_01_000016_create_analytics_events_table.php:17-18` — `smb_id`/`community_id` are `unsignedBigInteger` while parents are uuid. `ReadershipSyncJob.php:94-98` and `CustomerIntelligenceService.php:125` write uuids → `invalid input syntax for type bigint`, killing PP readership sync.

### Campaign content data

30. **"ai"→"modern tools" corrupted machine-read fields.** 11 campaigns × both trees (22 files), 558 occurrences. e.g. `content/campaign_EDU-002_complete.json`: `landing_page_slug:"modern tools-marketing-101"` (space in slug), `audio_base_url:"…/modern tools-discovery/audio/"` (space in URL). Breaks routing, the master registry (still old `ai-*` slugs), and audio directory resolution; also visible in narration copy.
31. **17/60 timeline emails link to dead/wrong landing pages.** `ManifestDestinyTimelineSeeder.php` `landing_page` params vs actual slugs — 12 resolve to "Campaign not found", 5 open a *different* campaign than the email sells. 385K enrolled; every such email → 404-equivalent or wrong pitch.

### Learning Center frontend

32. **Every `/learn/:slug` primary CTA is dead.** `pages/LearningCenter/Campaign/LandingPage.tsx:230-259` — the switch handles only `signup_free|start_trial|download_guide|download_article|schedule_demo`, but **all 65 campaigns** use `start_setup`(22)/`get_started`(8)/`explore_more`(7)/… (verified by full count). Primary conversion button does nothing; label renders raw snake_case (incl. `activate_modern tools`).
33. **`StepSlide` renders none of the keys its slides use.** `slides/StepSlide.tsx` — renders `headline/steps/key_metrics/…`, but of 128 instances the dominant keys are `action`(77)/`tip`(14)/`checklist`(8)/… and `headline` exists in only 39. Most StepSlides show an empty gradient; instructional content discarded.
34. **Contradictory API base breaks Sarah + audio (Learning tree).** `useSarahNarration.ts:195` / `ProfileBuilderSlide.tsx:119` / `api.ts:4` / `RoomWithSarah.tsx:49` — with documented `VITE_API_URL=…/api`, Sarah chat/notebook resolve to `/api/sarah/*` (404, canned "connection issue"); audio base becomes `…/api/storage/audio/*` (404, served at web `/storage/audio/{path}`). No single env value satisfies both conventions.

### Command Center / shell frontend (systemic — counted once)

- **API base + token + tenant fragmentation** (spans CC, Pitch, shell): no single `VITE_API_URL` value works (`api.ts:4` vs `learning/api-client.ts:5`); token written to zustand `fibonacco-auth` but fetch clients read `localStorage['auth_token']` (never written by `authStore.login`); `X-Tenant-ID`/`tenant_id` required by controllers but **never set anywhere in `src/`** (verified). Result: login 404s (`authStore.ts:41` posts `/auth/login`, backend only has `/api/v1/auth/login`), CRM/learning/personality fetch calls 401, tenant-gated pages 400. This is one root defect with dozens of surface symptoms.
- **Ops dashboard is dead at runtime.** `services/operations/operations-api.ts:32` `BASE_PATH='/api/v1/operations'` — no such prefix; real surface is GET-only `/v1/ops/*`. All 21 endpoints + incident create/update 404. During a real outage the dashboard renders "No incidents".
- **Live $300/mo subscribe submits a placeholder PM.** `pages/Marketing/CommunityInfluencerPage.tsx:98` — `payment_method_id:'pm_placeholder'`.
- **Escalation queue is mock with dead buttons.** `pages/AIPersonalities/PendingQuestionsPage.tsx:14` — hardcoded "Sarah Jenkins / Jenkins Bakery"; Send Response/Save Note/Mark Resolved have no `onClick`. Operators believe they answered real customers.

---

## 4. HIGH Findings (61)

Grouped; each verified against live code.

### Auth / security
- Postal V1 webhook signature wrapped in `if ($signingKey)` → fails open when unset (`V1/WebhookController.php:31`). Three Postal endpoints use three incompatible signature schemes (HMAC-SHA256 / HMAC-SHA1 / none) — at most one matches what Postal sends.
- `AIActionController.updateDealStage` (:228) accepts a raw `stage` string, no validation, bypassing `DealService::transitionStage` guards; the LLM or a crafted payload sets any stage.
- `AIActionController` (:113) tenant fallback `?? $user?->id ?? ''` — empty-string tenant defeats isolation for any record wrongly persisted with empty tenant_id.
- Unpaginated big-table endpoints: `OutboundCampaignController:44`, `OrderController:54`, `CustomerController:81`, `CommunityController:26` pass `per_page` straight to `paginate()` uncapped (`?per_page=100000000` on the 12.9M table). Only `DealController` caps it.
- Mass assignment: `KnowledgeController:238,280`, `SurveyController:77,108,185` write `$request->all()` (validated value discarded).
- Public PII leaks: `GET /v1/content/{slug}/personalized/{customerId}` (api.php:174) and Sarah `GET /sessions/{id}`/`/messages` return per-customer data with no auth; the `api` rate limiter is defined but applied to no route; `POST /pitch/businesses/{id}/claim` is public.

### Billing
- `handleChargeRefunded` reconciles only via `Order.stripe_charge_id`, but pitch and bundle checkout create bare PaymentIntents with no Order/charge id → refunds never reflected locally.
- `stripe-php v19.2.0` (Basil) removed/moved the fields the handlers read: `paymentIntent->charges` (:192, → null charge id), `invoice->subscription` (:513, dunning no-ops), `subscription->current_period_end` (:494, null → 1970 expiry on any `subscription.updated`).
- Double-fulfillment race: both `checkout.session.completed` and `payment_intent.succeeded` call `fulfillOrder()` with no `lockForUpdate` → two `ServiceSubscription` rows, double inventory decrement.
- `fulfillOrder` creates subscriptions with `auto_renew=true` but no `stripe_subscription_id`; `RenewExpiredSubscriptions` then suspends the paid customer after 3 ticks. `RenewExpiredSubscriptions:117` has no Stripe idempotency key and records success in a separate transaction → double billing on mid-run death.
- Negative totals: `InvoiceService:127`/`QuoteService:37` `subtotal - discount + tax` with `discount` only `min:0`.

### Email / jobs
- `InboundEmailRoutingService:65` dispatches `SendEmailCampaign::dispatch($customer,null,'ai_response',…)` against a `(CampaignRecipient,OutboundCampaign)` constructor → TypeError; `handleInterest` (:217) has no try/catch, so every "interested/pricing" reply crashes and the follow-up never sends.
- `InboundEmailRoutingService:236` sets `do_not_contact=>false` unconditionally — an email opt-out can un-suppress a prior global DNC.
- `BounceHandlerService:36` reads `$payload['payload']['bounce']['type']` on already-unwrapped input → always null → `?? 'hard'` makes every bounce a hard bounce (soft bounces permanently suppressed).
- `UnsubscribeController::show` suppresses on **GET** — Outlook SafeLinks / corporate scanners prefetching the signed link silently mass-unsubscribe. (Also flagged by the campaign-engine agent.)
- `chunk()`-while-mutating-the-predicate skips ~half the rows every run: `ReScrubStaleContactsJob:53` (mutates `zb_checked_at`), `AdvanceManifestDestinyDay:21` (mutates `campaign_status`). Must be `chunkById`.
- `CampaignPreFlightJob:35` / `CheckUnopenedEmails:41` / `ReadershipSyncJob:46` — unbounded `->get()` + one blocking HTTP call per row in a single timeout-bounded job; retries re-burn paid ZeroBounce/PP calls from row zero.
- `RecalculateEngagementScores/EvaluateTierTransitions/RecalculateDataQuality` — `Customer::chunk(100)` per-row update over 12.9M rows on the 60s `default` queue → killed, retried from zero, permanently failing (O(n²) offset pagination).
- `SendEmailCampaign` not idempotent under its own `$tries=3`: die after send, before status write → duplicate send; catch increments `failed_count` 3× per real failure.
- Emergency Voice/Push jobs are TODO stubs that "simulate success" then increment `voice_answered`/`push_sent` — dashboards report deliveries that never happened.
- `.env.example` ships `QUEUE_CONNECTION=database` and `BROADCAST_CONNECTION=log` while production runs Redis/Horizon and the AI-task UI needs a real broadcaster.

### Deploy / infra
- `nixpacks.toml:9` bakes `APP_URL=http://localhost` into cached config → `url()` in `SendSMS`/`MakePhoneCall` status callbacks points Twilio at `http://localhost` (delivery/call status webhooks never arrive).
- `start.sh:6` runs `schedule:work &` in **both** Railway services with zero `->onOneServer()` → every scheduled job runs twice (double newsletters/alerts, two concurrent 01:30 syncs). Backgrounded `schedule:work`/`horizon` are unsupervised — if either dies the container stays "healthy" and queues/scheduler die silently.
- Production HTTP is `php artisan serve` (`start.sh:15`) — single-threaded dev server; one slow AI stream blocks all requests.

### Data layer
- `sessions.user_id` is `foreignId` (bigint) vs uuid `users.id` with `SESSION_DRIVER=database` default → first authenticated web session write fails.
- `newsletter_schedules` table has none of the `daily_enabled`/`weekly_enabled`/`*_template_id` columns the model + jobs query → newsletter scheduling throws "column does not exist".
- `Sponsorship` model `$fillable` lists 9 columns the migration never creates → `SponsorService`/`SponsorController`/`CheckSponsorshipInventory` all error.
- `TicketStatusHistory` has no `$table` override → resolves `ticket_status_histories`, migration creates `ticket_status_history` → every status change errors.
- `RevenueRecord` model has no backing table anywhere → `MetricsTool`/`Community::revenue` error.
- `knowledge_base.embedding` is `text` (never `vector`); ivfflat index and every `<=>` semantic-search path error on PostgreSQL (swallowed at migrate time, fatal at query time). `chat_messages.smb_id`/`email_conversations.smb_id` bigint vs uuid.

### Frontend (CC / Pitch / shell / Learning)
- CC customer drill-down 404: `CustomerCard.tsx:53` navigates `/command-center/customers/:id`; the CC router only has `sell/customers/:id` and an exact-match `customers` redirect → catch-all 404.
- CC infinite refetch: `CreateActivityModal` (`useActivities` keyed on an inline `[filters]` object) mounted unconditionally on the routed Activities page → hammers `GET /v1/interactions` forever. Same latent pattern in `useCampaigns`/`useCustomers`/`OpsCostTracker` (`new Date()` in the query key).
- CC dead endpoints on routed pages: `useDashboard` (`/v1/dashboard/*` — none exist), `email-engine-api` (9 endpoints — none exist; EmailHealth/ContactHealth/InboundInbox non-functional), marketing-kit/content-cards/syndication/sarah/simulation hooks all missing the `/v1` prefix.
- `serviceService.ts` prepends `/api/v1` on a client whose baseURL already ends in `/api` → `/api/api/v1/...` (used by in-scope `useServices`/`ServicesPage`).
- `PitchProvisioningService::confirmPayment` captures payment then `provision()` early-returns (no refund, only `Log::error`) if `session->customer`/`community` is missing — money captured, zero fulfillment.
- Standalone internal routes with no auth wrapper: `AppRouter.tsx:142-166,250-257` (`/crm*`, `/outbound*`, `/ai-personalities*`, `/learning/services/*`, `/command-center/services/buy`). Only `/ops` is guarded.
- `authStore` persists `token` (XSS-exfiltratable) and `isLoading` with no `partialize`/`version`/`migrate`; a persisted-expired token renders protected UI until first 401; a tab closed mid-login rehydrates `isLoading:true` → permanent LoadingScreen.
- `useWebSocket` unmount calls `websocketService.disconnect()` on the module-global singleton → first consumer to unmount kills real-time for all.
- CC zustand v5 selectors returning fresh objects without `useShallow` (`stores/index.ts:14-42`) → "getSnapshot should be cached"/infinite re-render for any consumer.
- Guest services purchase (`/learning/services/*`) calls `auth:sanctum` routes → anonymous buyer always 401.
- Backend `{id}` routes registered before literal siblings: `/alerts/{id}` before `/alerts/categories`, `/emergency/{id}` before `/emergency/categories`, `/interactions/{id}` before `/interactions/templates` → services calling the literal path hit `show('categories')`.
- `ProtectedRoute` admin gate checks `user.role`/`permissions` the login response doesn't return → `/ops` permanently "Access Denied"; and `if (requireAdmin && user)` renders admin children with no check when `user:null,isAuthenticated:true`; gate is pure client-side localStorage (editable).
- CC login `/auth/login` 404 (backend only `/api/v1/auth/login`); `<a href="/forgot-password">` and `href="/login"`/`href="#"` recovery links route nowhere — no password-reset path exists.
- Kanban drag-and-drop dead/`corrupts state (`KanbanBoard.tsx:106`); `AIPersonalities/Assign` loads page 1 of 12.9M and filters client-side; `BillingDashboard` "Pay Now" no disabled guard (multi-session).
- FibonaccoPlayer: `hideOverlayUI` mode never plays audio (no play button, no `autoPlay`); `isPlaying` in the audio-effect deps tears down/recreates `Audio` on resume (restarts from 0:00); audio points at dead `cdn.fibonacco.com` host with no error listener/fallback (deck never auto-advances); unknown `component` silently falls back to `HeroSlide` (5 `SummarySlide` slides drop their contact fields); `HeroSlide` drops `subhead` on 48/53 heroes; `ConceptSlide` renders headline-only for most of 93 instances.
- `useSarahNarration.appendSarah` clears the shared timer → completion/leads-to messages destroy each other.
- Fabricated-as-live (HIGH set): `AIWorkflowPage`/`DataAnalyticsPage`/`PresentationCall` (the `/` home) show fake financials + dead call controls; `AdsPage`/`NewsletterComposerPage`/`AlertManagementPage`/FAQ counts show hardcoded metrics; `SubscriptionsPage` `catch{setSubscriptions([])}` tells paying customers their subscription is gone during an outage.

---

## 5. Selected MEDIUM / LOW themes

Full lists are in the per-agent findings; the highest-value clusters:

- **Fabricated data on routed pages (MEDIUM, ~25 pages):** CC verb-index pages (`$4,250`, `$2,800`), `CommerceHubPage`, all `pitch/*` dashboards, `personalization-service` injected stats (`local_business_count='150+'`), pitch `ProposalStep`/`CommunityStep` fake slot scarcity ("only 3 left"). Operator can't distinguish real from mock — dangerous on Ops/emergency pages.
- **Errors masked as empty success (MEDIUM):** `campaign-api` returns `[]`/`null` on 500/auth failure; many CC mutation handlers reject without surfacing (the axios interceptor strips `err.response.data.message`); Sarah pages `.catch()` into "No campaigns found".
- **Duplicate parallel service layers (MEDIUM):** faqService↔knowledge-api, searchService↔search-api, serviceService↔service-api, orderService↔order-api, personalityService↔personality-api, customerService↔crm-api, campaignService↔outbound-campaign-api (triple) — drifting prefixes/behavior for the same resource.
- **Non-idempotent jobs / no `failed()` (MEDIUM):** 0 of 66 jobs define `failed()`; retries re-send emails / re-create interactions / re-charge Stripe; `ImportSMBs`/`SendProactiveEmail`/`ProcessInboundEmailJob` duplicate on retry.
- **Migration hygiene (MEDIUM/LOW):** `add_pipeline_stage` `down()` omits `trial_active` (re-`up()` fails); `pp_external_id` dedupe keeps both rows on equal `created_at` (unique index can fail); `json` GIN indexes silently never created; `fix-uuid-defaults.php` is a self-executing script in the migrations dir; uuid conversions use `TYPE uuid USING NULL` (destructive if replayed on populated data); `InteractionTemplateSeeder` non-idempotent.
- **Convention (LOW, aggregate):** ~35 `any` in frontend services; ~130+ buttons missing `type="button"`; icon-only buttons/toggles missing `aria-label`/`role="switch"` across both SPAs; `env()` in `EmailPlatformSeeder`/`CommunitySlotInventorySeeder` (null Postal keys after `config:cache`); `CampaignActionExecutor` not `final`; several files missing `declare(strict_types=1)`; `react-dom.render()` instead of `createRoot` (React-17 legacy mode); `navigation-tracker.ts` POSTs every click to hardcoded `http://127.0.0.1:7242`.

---

## 6. Prioritized Remediation

**P0 — stop loss / security (do first):**
1. Derive tenant from the authenticated user (`$request->user()->tenant_id`), never a client header; move Sarah notebook + municipal-admin routes behind auth + role checks; add realpath containment to the audio route. (#1-5)
2. Make all webhooks fail **closed**; add a processed-`event.id` idempotency table for Stripe. (#6-8, #11)
3. Re-price pitch checkout server-side from a trusted catalog; bind `confirmPayment` to the session + amount + a one-shot guard. (#9, #10)
4. Fix `SMBBulkController` (validate columns, tenant from auth, whitelist updatable fields). (#5)

**P1 — make the core paths actually run:**
5. Bind `App\Console\Kernel` (or migrate its schedule into `routes/console.php`) and de-duplicate the double-scheduled jobs; add `->onOneServer()` + `->withoutOverlapping()`; make only one Railway service run the scheduler. (#23, #20, HIGH deploy)
6. Add Horizon supervisors for `campaigns`, `sms`, `calls`, `voicemail`, `alerts`, `emergency`, `messages-p*`. (#19, #24)
7. Fix the five `int`→UUID job constructors (Alert, Newsletter, 4× Emergency, ProcessMessage). (#25-28)
8. Route every send through one suppression chokepoint (fix `sendViaPool`, fix `BounceHandlerService`, gate on `campaign->status`, fix inbound FROM lookup + opt-out regex). (#13-18, #14)
9. Fix the day-60 enum value; catch `\Throwable` in the orchestrator; chunk/cursor the 385K queries; `chunkById` the mutate-in-place jobs. (#21, #22, HIGH jobs)

**P2 — data + contract integrity:**
10. Fix the bigint-vs-uuid FKs as one migration sweep (`analytics_events`, `chat_messages`, `email_conversations`, `unsubscribe_tokens.scope_id`, `suppression_list.community_id`, `alert_sends.*`, `sessions.user_id`). (#29, HIGH data)
11. Reconcile model `$fillable`/`$table` with actual schema (Sponsorship, RevenueRecord, TicketStatusHistory, newsletter_schedules, knowledge_base vector). (HIGH data)
12. Fix the front↔back contract once: a single `VITE_API_URL` convention, one token store, set `tenant_id` on login, correct every service path prefix, fix login/ops/email-engine endpoints. (systemic frontend)
13. Revert the "ai"→"modern tools" corruption from a clean source; realign the seeder `landing_page` slugs to actual campaign slugs; add a placeholder-substitution layer; register the missing slide components (`SummarySlide`) and CTA types. (#30-34)

**P3 — correctness/UX cleanups:** the MEDIUM/LOW clusters in §5, plus fixing the 4 failing backend tests (they are masking regressions — the multi-tenancy security test currently doesn't run).

---

## 7. Bible corrections needed (keep the map honest)

- §4.5 "the EmailService chokepoint also covers the pool-based path" — **false**; the pool path bypasses suppression (#13).
- §4.4 scheduler section implies the 09:00 run and the every-10-minute bounce/newsletter jobs execute — they don't (unbound Kernel, orphaned queues, stub `ProcessBounces`).
- §4.6 "pre-flight runs before a campaign" — the timeline engine has no pre-flight, and the outbound pre-flight gate is bypassed (#15).

---

*Generated by an 11-agent parallel review of the live repo. Every CRITICAL was re-verified by hand against live source; no `/mnt/project/` snapshots were used.*
