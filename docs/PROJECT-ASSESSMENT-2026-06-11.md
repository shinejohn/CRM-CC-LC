# Project Assessment — Fibonacco Learning Center / Command Center
**Date:** 2026-06-11
**Scope:** Full platform review against the 90-day SMB/Nonprofit/Government outreach-to-sale mission

---

## What This Platform Is Supposed to Do

Contact every SMB, nonprofit, and government entity in a community over 90 days via email and voicemail. Educate them on the Day.News publishing platform. Convert them to one of three bundled packages. Provide the operator with a CRM, Learning Center, inbound/outbound campaign engine, and a Command Center to manage services, context, and AI-assisted selling.

---

## Executive Summary

The platform is **architecturally complete and production-capable in most areas**, but has **five hard blockers** that prevent actual campaign execution, and **several conversion path gaps** that mean even a delivered email can't close a sale end-to-end without a human stepping in. The foundation is strong. The gaps are specific and fixable in a focused sprint.

**Score by layer:**

| Layer | Status | Readiness |
|---|---|---|
| Backend campaign orchestration | Complete | 90% |
| Email delivery infrastructure | Built, not configured | 20% |
| Voicemail/phone delivery | Built, Twilio not activated | 30% |
| Queue/scheduler infrastructure | Underprovisioned for scale | 40% |
| Inbound response handling | Partially wired | 50% |
| Conversion / package checkout | Major gap | 15% |
| Operator campaign dashboard | Missing | 5% |
| Frontend CC modules | Mostly built | 75% |
| Data in production | Empty | 10% |
| AI Copilot (Sarah) | Phase 1 complete | 80% |

---

## What Is Fully Built and Working

### Backend Campaign Engine
- **CampaignOrchestratorService** — enrolls customers on timelines, executes day's actions, checks conditions, advances days, handles pause/resume
- **CampaignActionExecutor** — handles `send_email`, `send_sms`, `make_call`, `schedule_followup`, `update_stage`, `check_engagement`, `send_notification`; resolves templates by tenant, falls back to system templates; builds merge vars (`business_name`, `community_name`, `founder_days_remaining`, `unsubscribe_url`, etc.)
- **ManifestDestinyTimelineSeeder** — 3 timelines (Hook 90-day with 27 actions, Education, Howto), covering weeks 1-13 of the Hook stage with HOOK-001 through HOOK-015 campaigns
- **HookActivationService** — 8-step pipeline: generate article → publish to Day.News → create listings (DTG, GEC, AlphaSite) → create event → schedule newsletter feature → activate AlphaSite trial → start hook timeline → update customer status
- **PipelineTransitionService** — HOOK→ENGAGEMENT→SALES→RETENTION→CHURNED with event-driven stage changes and full history
- **StartCustomersOnTimeline command** — batch-enroll by stage, state filter, community filter, dry-run support
- **RunManifestDestiny command** — daily processor for all active timelines, with dry-run
- **Scheduled jobs** — `AdvanceManifestDestinyDay` daily at 00:01, `ProcessCampaignTimelines` hourly, `AdvanceCampaignDays` daily at 00:05, `CheckUnopenedEmails` daily at 08:00

### Email Infrastructure (built, not live)
- **EmailService** — top-level dispatcher, supports SendGrid/SES/Postal per config
- **EmailDispatchService** — 8-step pool-based pipeline (suppression → sender validate → class/pool → record → queue → dispatch)
- **PostalGateway** — Postal API client wired, 3 IP pools configured (transactional, broadcast, smb_campaign)
- **ZeroBounceService** — validate, bulk validate, credits check, `isSendable()`, `shouldSuppress()`
- **CampaignPreFlightJob** — ZB validation before sending, blocks if >3% risk
- **SuppressionService** — checks both platform suppression and ZeroBounce status
- **SendEmailCampaign job** — renders template, sends via EmailService, updates recipient status
- **EmailTemplate model** — `render()` method with variable substitution, tenant-scoped with system fallback

### Phone/SMS (built, Twilio not activated)
- **PhoneService** — Twilio REST API, TwiML generation, TTS via `<Say>`, pre-recorded audio via `<Play>`, voicemail recording with transcription
- **SMSService** — Twilio SMS send with status callbacks
- **TwilioSMSWebhookController** — inbound SMS parsing, routes to `SMSIntentClassifier` and `SMSResponseHandler`
- **TwilioVoicemailWebhookController** — voicemail transcription handling, `ProcessVoicemail` job

### Customer & CRM
- **Customer model** — 140+ fillable fields: full contact info, pipeline stage, campaign tracking, opt-in flags (email/sms/rvm/phone), ZeroBounce fields, engagement scoring, AI context, intelligence fields
- **`canContactViaEmail/SMS/Phone/RVM()`** — proper gate methods used by CampaignActionExecutor
- **CrmActivityService**, **DealService**, **QuoteService**, **InvoiceService** — all present
- **CustomerTimelineProgress** — tracks current day, completed/skipped actions, pause/resume

### Content & Learning Center
- **66 campaign landing pages** — HOOK-001→015, EDU-001→015, HOWTO-001→030, CONV-001→004, INTRO-001
- **80 source content JSONs** in `/content/`
- **34 slide components** — all crash-guarded, field-mismatch-fixed (Path A complete)
- **Room with Sarah** — landing page player with narration, FibonaccoPlayer with slide progression
- **ContentGenerationService** — AI article generation via Anthropic

### AI Copilot (Phase 1)
- **PrismAiService** — Anthropic SDK streaming SSE + sync JSON
- **AIController** — personalities, streaming, context injection
- **AIActionController** — 10 actions (lookup_customer, draft_email, update_deal_stage, pipeline_summary, etc.)
- **AccountManagerProvider** — unmount-guarded streaming, message cap, tool call confirmation
- **Sarah overlay** — floating chat widget, inline confirmation cards

### Data Pipeline
- **SyncFromPublishingPlatform** — pulls communities/businesses/subscriptions from PP, creates customers at HOOK stage
- **FL simulation verified** — 13 communities, 9,198 total customers, 976 emailable, 27 timeline actions, 66 templates, enrollment working

---

## The Five Hard Blockers

### BLOCKER 1: Email delivery not configured in production

The FL simulation explicitly reports `postal_configured: NO` and `zerobounce_configured: NO`. The Postal API keys, ZeroBounce key, and email pool credentials are all blank in `.env.example`. Without these:

- Every `send_email` action in the timeline will call `EmailService.send()` → hit `PostalGateway` → get a null/error response → mark the recipient `failed`
- The `CampaignPreFlightJob` will skip ZB validation and either allow bad emails through or block everything depending on config
- 976 emailable customers will receive nothing

**Resolution:** Configure Postal API keys for all 3 pools (transactional, broadcast, smb_campaign) in Railway env vars. Set up ZeroBounce key. Set `QUEUE_CONNECTION=redis` (see Blocker 2).

---

### BLOCKER 2: Queue driver is `database`, not Redis — wrong for 9,000+ customer scale

The `.env.example` shows `QUEUE_CONNECTION=database`. For the Florida campaign alone:

- 976 customers × ~27 actions over 90 days = ~26,000 queued jobs
- Each `SendEmailCampaign` job also creates an `OutboundCampaign` + `CampaignRecipient` record first
- At database queue speed, bulk dispatches will lock the `jobs` table and cause cascading timeouts
- Laravel Horizon (already a project dependency) **requires Redis** — it will not work with the database queue

**Resolution:** Set `QUEUE_CONNECTION=redis` in Railway. Configure Redis service (Railway has it as a plugin). Confirm `REDIS_URL` is set. Then `php artisan horizon` starts working and gives real-time queue visibility.

---

### BLOCKER 3: `QueueNextCampaign` job has an unfulfilled TODO — it only advances the day, never sends

`QueueNextCampaign.handle()` contains:
```php
// TODO: Queue actual campaign send job from Module 2
// For now, just advance the day
$service->advanceDay($customer);
```

This job is dispatched by `SMBCampaignService.startCampaign()`, which is the legacy campaign path (not the orchestrator path). If any code path hits `SMBCampaignService.startCampaign()` instead of `CampaignOrchestratorService.startTimeline()`, customers will silently have their day counter advance with no emails sent.

The orchestrator path (`CampaignActionExecutor.sendEmail()` → `SendEmailCampaign` dispatch) IS correct and does send. The risk is that `HookActivationService` calls `$this->orchestrator->startTimeline()` (correct) but `SMBCampaignService.startCampaign()` is also callable and broken.

**Resolution:** Either complete `QueueNextCampaign` to delegate to the orchestrator, or add a guard that throws if called in a context where the orchestrator should be used instead. Eliminate the dual-path ambiguity.

---

### BLOCKER 4: No checkout/package selection in the presentation flow

The entire value proposition is: SMB receives email → clicks landing page CTA → watches presentation with Sarah → understands the offer → selects a package → pays. The system currently handles steps 1-4 but **step 5 and 6 do not exist**.

- The 4 CONV campaigns ("Your Community Position", "Membership Proposal", "Status Update", "Category Update") are display presentations only
- There is no `CheckoutSlide` or `QuoteSlide` — all 34 slides are read-only
- `StripeService`, `QuoteService`, and `InvoiceService` all exist on the backend but are not reachable from the presentation flow
- The 3 bundled packages exist in `ServiceCatalogSeeder` as individual services, but no bundled pricing tier is presented anywhere in the customer-facing flow

Without this, the platform is a sophisticated lead nurturing system with no close mechanism.

---

### BLOCKER 5: Production database is empty

Per prior session notes, the Railway production database has:
- No communities or customers (needs `sync:from-publishing-platform`)
- Missing table migrations not yet run: `advertiser_sessions`, `campaign_line_items`, `sarah_messages`
- Timeline seeders not run: 0 timelines, 0 actions, 0 templates in prod
- No service catalog seeded

No data means no campaign can start, no emails can be sent, no landing pages can personalize, and Sarah has no context.

---

## Additional Gaps (High Priority)

### GAP 1: No Manifest Destiny operator dashboard

Operators currently have no view of the macro campaign health. The Campaigns page shows individual `OutboundCampaign` records, but there's no screen showing:
- How many customers are enrolled per timeline
- What day distribution looks like (how many are on day 1, day 30, day 60, day 90)
- Open rates, click rates, and reply rates per email in the sequence
- Which customers have advanced to ENGAGEMENT or SALES stage as a result
- Which customers are suppressed, failed, or opted out

This is the operator's primary tool for managing a community launch. It doesn't exist.

### GAP 2: Engagement signals don't trigger timeline branching

The timeline seeder defines conditional actions like:
```php
'conditions' => ['if' => 'email_opened', 'within_hours' => 48, 'then' => 'proceed']
```

But `CampaignActionExecutor` and `CampaignOrchestratorService` call `action->shouldExecute($customer)` — and `CampaignTimelineAction.shouldExecute()` needs to actually evaluate these conditions against real tracking data. Email opens come in via `PostalWebhookController`, but there's no path from "Postal fired an open event" → "update customer engagement" → "timeline condition evaluates true."

The `CheckUnopenedEmails` job runs daily, but it's not clear it feeds back into timeline progression.

### GAP 3: Inbound response-to-pipeline path is incomplete

When an SMB replies to a campaign email or responds to a Twilio call:
- `InboundEmailRoutingService` routes by intent (question → AI, complaint → escalate)
- `SMSIntentClassifier` classifies inbound SMS
- But: there is no path from "inbound intent classified as INTERESTED" → "advance customer to ENGAGEMENT stage" → "assign sales rep" → "schedule follow-up call"

The plumbing exists but isn't connected end-to-end. A human has to manually check inbound and act.

### GAP 4: Duplicate email architecture creates confusion and risk

Three separate email sending paths exist:
1. `EmailService` (top-level) — used by `SendEmailCampaign` job, the active campaign path
2. `EmailDispatchService` (pool-based 8-step) — more sophisticated, uses Postal pools
3. `MessageService` (bulk-capable, channel-routing) — most complete, handles batches of 1,000

Only path 1 is actively used by the campaign engine. Paths 2 and 3 are built but not wired into the campaign flow. This means the pool-based IP management and bulk batching capabilities aren't being used for the 90-day campaign, which is exactly the use case they were designed for.

### GAP 5: Pre-recorded voicemail audio not automated

The OpenAI TTS system was built (`GenerateCampaignAudio` command, `OpenAITTSService`, audio serving via `/storage/audio/{path}`). But `CampaignActionExecutor.makeCall()` uses `use_tts: true` which calls Twilio's `<Say>` (live TTS at call time, not pre-recorded). The pre-recorded audio isn't integrated into the call flow. This means:

- Call quality depends on Twilio's TTS at runtime
- Pre-recorded audio (better quality, consistent tone, can be previewed) sits unused
- Cost: ~$4.95 for 462 slides of audio was estimated but never spent/generated

### GAP 6: The 3 bundled packages are not defined as packages

Services are seeded individually (day.news article publishing, events, business directory, AI automation, marketing/advertising). There is no `ServiceBundle` or `Package` model grouping them into the three purchasable tiers. The frontend `ServiceCatalog` shows individual services. A customer can't pick "I want the Starter Bundle."

### GAP 7: Room with Sarah "sell" path ends at narration

The Room with Sarah has:
- Beautiful slide presentations (HOOK, EDU, HOWTO, CONV series)
- Sarah narration per slide
- "End conversation" button

It does not have:
- A slide that presents the 3 packages with pricing
- A "select this package" button that creates a quote
- A checkout flow (Stripe Elements embed)
- A post-purchase onboarding sequence trigger

The most expensive real estate in the funnel — a captive audience watching a 15-slide presentation — has no close.

### GAP 8: Laravel Scheduler not confirmed running in Railway

`console.php` registers `ProcessCampaignTimelines` hourly and `AdvanceManifestDestinyDay` daily, but Railway's Nixpacks deploy doesn't run `php artisan schedule:work` by default. If the scheduler isn't running, the entire 90-day campaign is static — no days advance, no actions execute.

### GAP 9: Clearwater landing pages CSV has uncommitted changes

`git status` shows `docs/clearwater-landing-pages.csv` as modified. This file likely tracks which landing pages are deployed and their URLs. If it's not committed and up to date, the relationship between campaign emails and their CTAs may be out of sync.

---

## The Plan

### Phase 1 — Unblock Production (1-2 days)

**Goal:** Make it possible to actually send emails to real customers.

1. **Configure Postal in Railway** — Set `POSTAL_TRANSACTIONAL_API_KEY`, `POSTAL_BROADCAST_API_KEY`, `POSTAL_SMB_CAMPAIGN_API_KEY`, all SMTP credentials. Verify by sending a test email via `php artisan campaign:test-email`.

2. **Configure ZeroBounce** — Set `ZEROBOUNCE_API_KEY`. Run `php artisan campaign:preflight` on a sample of FL customers to check list health.

3. **Switch queue to Redis** — Add Railway Redis plugin. Set `QUEUE_CONNECTION=redis`, `REDIS_URL`. Verify Horizon starts and shows queued jobs.

4. **Run missing migrations** — `php artisan migrate --force` for `advertiser_sessions`, `campaign_line_items`, `sarah_messages` tables.

5. **Run seeders** — `ManifestDestinyTimelineSeeder` (3 timelines, 90+ actions), `ManifestDestinyEmailTemplateSeeder` (67 templates), `ServiceCatalogSeeder`. Verify via `php artisan manifest-destiny:run --dry-run`.

6. **Run data sync** — `php artisan sync:from-publishing-platform` to pull FL communities and businesses. Verify customer count.

7. **Confirm scheduler running** — Add `php artisan schedule:work` to Railway's start command or as a separate process. Verify `AdvanceManifestDestinyDay` fires at 00:01.

8. **Commit clearwater-landing-pages.csv**.

### Phase 2 — Fix the Campaign Engine (2-3 days)

**Goal:** Have the 90-day sequence actually deliver emails and advance correctly.

1. **Fix `QueueNextCampaign`** — Complete the TODO. Wire it to `CampaignOrchestratorService.executeActionsForCustomer()` so it delegates to the real action executor.

2. **Wire engagement signals to timeline branching** — `PostalWebhookController` should update `last_email_open`, `engagement_score` when opens/clicks arrive. `CampaignTimelineAction.shouldExecute()` should evaluate `email_opened` conditions against real Customer fields.

3. **Connect inbound interest to pipeline** — In `InboundEmailRoutingService` and `SMSResponseHandler`, when intent is `INTERESTED` or `WANTS_INFO`, auto-advance customer to ENGAGEMENT stage and create a `CrmActivity` for the assigned rep.

4. **Consolidate email send paths** — Route `SendEmailCampaign` through `EmailDispatchService` (pool-based) instead of `EmailService` directly. This activates IP pool management and proper suppression for bulk campaign sends.

5. **Integrate pre-recorded audio** — In `CampaignActionExecutor.makeCall()`, look up whether a pre-recorded audio file exists for the `template_type`, and if so pass `audio_url` to `PhoneService` instead of using live TTS. Generate missing audio with `php artisan campaign:generate-audio`.

### Phase 3 — Build the Conversion Path (3-5 days)

**Goal:** An SMB who watches the presentation can select and pay for a package without human intervention.

1. **Define the 3 bundled packages** — Create a `ServiceBundle` or extend the existing `Service` model to support bundles. Define Starter (listing + events + basic analytics), Professional (+ newsletter + featured + AI content), Enterprise (+ white-glove onboarding + custom reporting). Price each. Add to `ServiceCatalogSeeder`.

2. **Build `PackageSelectionSlide`** — A new slide component that displays the 3 bundles side-by-side, highlights the recommended one, and has a "Select This Plan" button. Wired to the CC backend to create a `Quote`.

3. **Build `CheckoutSlide`** — Stripe Elements embed inside a slide. When a customer selects a package, the next slide is the checkout. On successful payment, triggers `HookActivationService` (or equivalent for higher tiers).

4. **Wire quote-to-checkout** — When "Select This Plan" is clicked, `POST /api/v1/quotes` creates a quote, returns a Stripe Payment Intent. `CheckoutSlide` mounts Stripe Elements with that intent. Payment confirmation triggers provisioning.

5. **Post-purchase flow** — On Stripe webhook `payment_intent.succeeded`, advance customer to SALES/RETENTION stage, trigger the appropriate service provisioning jobs, send a welcome email.

### Phase 4 — Operator Visibility (2 days)

**Goal:** Give the operator a dashboard to manage a community launch in real time.

1. **Manifest Destiny Campaign Dashboard** — New CC page at `/command-center/campaigns/manifest-destiny`. Shows:
   - Total enrolled by stage (HOOK/ENGAGEMENT/SALES/RETENTION)
   - Day distribution bar chart (how many customers are on each day 1-90)
   - Per-email stats: sent, opened, clicked, replied, suppressed
   - Customers who advanced to ENGAGEMENT this week
   - Failed/bounced counts with drilldown
   - "Pause all" / "Resume" controls for a community

2. **Backend API** — `ManifestDestinyCampaignController` with aggregate queries for all above metrics. Cached at 15-minute intervals.

3. **Community Health Score** — Single number per community: (opens + clicks + replies + stage advances) / enrolled. Shows which communities are responding well vs. cold.

### Phase 5 — Polish and Scale (ongoing)

1. **Gap 9: Voicemail quality** — Fully integrate pre-recorded audio pipeline. Run `campaign:generate-audio` for all 15 HOOK campaign scripts. A/B test against live TTS.

2. **Gap 6: CONV campaign close rate tracking** — Tag every CONV campaign click with customer ID. Track whether the session ends in a package selection or not. Feed that data back to Sarah for personalized follow-up.

3. **Multi-community launch tooling** — `campaign:start-customers --state=TX --dry-run` should show readiness report before launch. Add a pre-launch checklist command that verifies: Postal configured, ZB configured, timelines seeded, templates seeded, queue on Redis, scheduler running.

4. **Sarah AI improvements (Phase 2)** — Move Sarah from pre-canned responses to full Anthropic API streaming for the Room with Sarah, using the customer's intelligence profile as context. This makes every presentation unique to the business.

---

## Priority Matrix

| Item | Impact | Effort | Priority |
|---|---|---|---|
| Configure Postal + ZeroBounce in Railway | Unblocks all email | 2 hrs | P0 |
| Switch queue to Redis, start Horizon | Scale + reliability | 2 hrs | P0 |
| Run migrations + seeders in prod | Everything needs data | 1 hr | P0 |
| Run sync:from-publishing-platform | Populates customers | 30 min | P0 |
| Confirm scheduler running in Railway | Timelines advance | 1 hr | P0 |
| Fix QueueNextCampaign TODO | Campaign engine integrity | 2 hrs | P1 |
| Wire engagement signals to branching | Smarter sequences | 1 day | P1 |
| Inbound interest → pipeline advance | Close the loop | 1 day | P1 |
| Manifest Destiny dashboard | Operator visibility | 2 days | P1 |
| Define 3 bundled packages | Conversion path | 4 hrs | P1 |
| PackageSelectionSlide | Close mechanism | 2 days | P2 |
| CheckoutSlide + Stripe inline | Frictionless close | 1 day | P2 |
| Consolidate email paths to pool-based | Deliverability | 4 hrs | P2 |
| Pre-recorded voicemail integration | Call quality | 1 day | P2 |
| Multi-community launch checklist | Operations | 1 day | P3 |
| Sarah Phase 2 (full AI) | Personalization | 3 days | P3 |

---

## What "Ready to Launch FL" Looks Like

When the following are true, you can run `campaign:start-customers --state=FL` and the 90-day campaign will execute autonomously:

- [ ] Postal API keys set and verified (test email delivered)
- [ ] ZeroBounce key set, pre-flight run on FL list shows <3% risk
- [ ] Redis queue active, Horizon running and visible
- [ ] All migrations run in prod
- [ ] `ManifestDestinyTimelineSeeder` run (3 timelines, 27 HOOK actions)
- [ ] `ManifestDestinyEmailTemplateSeeder` run (67 templates)
- [ ] `sync:from-publishing-platform` run, 9,198 FL customers in DB, 976 emailable
- [ ] Scheduler confirmed running (`AdvanceManifestDestinyDay` at 00:01, `ProcessCampaignTimelines` hourly)
- [ ] `QueueNextCampaign` TODO resolved
- [ ] Clearwater landing pages deployed and tracked
- [ ] At least a basic conversion path (humans can close even without CheckoutSlide, but must have a next step)
