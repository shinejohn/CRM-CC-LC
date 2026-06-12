# Command Center Project Plan — From the Cross-Platform Assessment
### Prepared June 11, 2026, by the AI session responsible for the AI/TaskJuggler platform
### Audience: the AI/developer focused on the Command Center (Learning-Center)

## Why this document exists

This plan was produced by the only session to date that has explored all three platforms:
the publishing platform (`../Day-News/Multisite`), the AI platform (`../taskjuggler`), and
this one. It contains cross-platform facts you cannot discover from this repo alone —
especially the integration contracts that ALREADY EXIST in the publishing platform and are
waiting for the Command Center to consume them. Do not rebuild anything listed in Section 2.

Founder-confirmed context: Command Center work was paused mid-build when all hands moved to
publishing. The frontend/backend disconnect documented in `CC-2.0-GAP-ANALYSIS-POST-PROJECT.md`
is known and anticipated. Publishing is nearly complete; Command Center is the current focus;
the AI platform (taskjuggler) completes after, with common tools and integration.

---

## 1. Current state (verified against code, June 11 2026)

### Backend (`backend/`) — ~90% built, do not rewrite
- Laravel 11, PHP 8.3, PostgreSQL, Valkey/Redis, Sanctum, Horizon, Stripe SDK, Anthropic SDK.
- 35 models, 29 API controllers, 166 routes, 21 migrations.
- Complete model coverage for sales: `Customer`, `Invoice`/`InvoiceItem`/`InvoicePayment`,
  `Order`/`OrderItem`, `Service`/`ServiceBundle`/`ServiceCategory`, `ServiceSubscription`,
  `CommunitySubscription`, `Campaign`/`CampaignRecipient`/`CampaignLineItem`.
- AI schema ready but dormant: `ai_agents`, `ai_agent_messages`, `ai_decision_rules`,
  `ai_content_feedback`, `content_templates`/`content_examples` (embeddings), dashboard views.

### Frontend (`src/`) — builds clean, disconnected from data
- React 18.3 + TS 5.5 + Vite, 149 TSX components, Zustand, TanStack Query installed.
- Per `CC-2.0-GAP-ANALYSIS-POST-PROJECT.md` (zero of 7 agent briefs executed):
  - 1 route using switch/case navigation instead of React Router routes
  - ~0 backend endpoints consumed; **61 mock-data occurrences across 22 CRM/billing pages**
    (worst: InvoicesListPage with 13)
  - No shared DataTable/DataCard/MetricCard/StatusBadge component library
  - No TypeScript type definition files; few data hooks
- 60 campaign JSON files of real learning content exist but are not loaded by the frontend.

### Deployment (Railway) — misconfigured, partially crashing
- Infrastructure services healthy: PostgreSQL 16, Valkey, Listmonk + Listmonk DB.
- App services reference an OBSOLETE multi-brand architecture: GoEventCity / Day News /
  Downtown Guide / GoLocalVoices / AlphaSite services point at route files
  (`routes/daynews.php`, etc.) that do not exist in this codebase.
- Horizon queue worker crashes (Redis connection config), SSR service crashes (this app is
  NOT Inertia — SSR service should not exist), nginx health checks 404.

---

## 2. Cross-platform contracts that ALREADY EXIST — consume, don't build

These live in the publishing platform (`../Day-News/Multisite`) and are production-ready:

1. **Subscription provisioning (the money path).**
   `POST /api/v1/provision/subscription` — `app/Http/Controllers/Api/V1/ProvisioningController.php`
   - Auth: `X-Provisioning-Secret` header (config `provisioning_secret` on the Multisite side).
   - Payload: `email`, `business_name`, `crm_order_id`, `plan_tier`, `subscription_id`,
     `stripe_subscription_id`, start/end dates.
   - Behavior: creates/finds the user by email, creates/updates the Business and
     BusinessSubscription, stores your CRM order id for reconciliation.
   - This is HOW the Command Center fulfills a publishing-product sale. One HTTP call.

2. **Data bridge (read access for dashboards/ROI).**
   `routes/api/v1/bridge-inbound.php`, Bearer token via `PUBLISHING_BRIDGE_API_KEY`
   (middleware `PublishingBridgeAuth`):
   - `GET /bridge/subscriber-roi/{externalId}/{communityId}`
   - `GET /bridge/business-audience/{businessId}/{communityId}`
   - `GET /bridge/community-audience/{communityId}`
   - `GET /bridge/export/{communities|businesses|civic-entities|nonprofits|business-subscriptions}`

3. **Command Center CRM API on the publishing side** (68 endpoints,
   `routes/api/v1/command-center.php`): deals, quotes→invoice conversion, invoices/payments,
   contacts, activities, notifications, and SMB intelligence including
   `GET /smb/{business}/ai-context` and `GET /smb/{business}/health-score`.

4. **The integration template.** Multisite's 4Calls integration
   (`config/fourcalls.php`, `FourCallsIntegrationService`, `FourCallsBillingService`,
   `FourCallsWebhookController`) is the proven pattern for selling/provisioning an external
   AI service with tiers, webhooks, and billing. Copy this pattern for every AI app product.

5. **AI platform provisioning — NOW BUILT (June 11, 2026).**
   `POST {TASKJUGGLER_API_URL}/api/provision/subscription`, auth via `X-Provisioning-Secret`
   header (mirror of the Multisite contract). Full contract:
   `../taskjuggler/Code/taskjuggler-api/PROVISIONING_CONTRACT.md`.
   - Payload mirrors Multisite plus optional `app` (which AI app was sold) and
     `plan_tier` constrained to `free|starter|pro|business|enterprise` (tier gates the
     platform's modules).
   - Response returns `team_id` (store it on the CRM order — analog of Multisite's
     `business_id`).
   - Keep the per-product `provisioning_target` (publishing | ai-platform) design; both
     targets are now config, not refactor. Coordinate the `PROVISIONING_SECRET` value with
     the AI-platform side (set in both Railway environments).

---

## 3. Phased plan

### Phase 0 — Stabilize deployment (1–3 days) [BLOCKING]
1. Delete/disable the 5 phantom multi-brand Railway services (GoEventCity, Day News,
   Downtown Guide, GoLocalVoices, AlphaSite). This codebase is a unified API; they can never
   start.
2. Delete the SSR service. This frontend is a standalone React SPA, not Inertia.
3. Fix Horizon: point at the Valkey service vars (`REDIS_HOST`/`REDIS_PASSWORD`), verify
   `config/horizon.php` connection name, redeploy, confirm worker stays up.
4. Fix health checks (document root / `/up` route), confirm `php artisan migrate` runs all
   21 migrations on the Railway Postgres.
5. Set env completely: DB, Redis, Stripe keys, AWS (S3/SES), Anthropic/OpenRouter keys,
   `SANCTUM_STATEFUL_DOMAINS`/CORS for the frontend origin.
   Exit criteria: API reachable over HTTPS, Horizon green, scheduler running.

### Phase 1 — Frontend foundation (week 1) [the 7 unexecuted agent briefs, sequenced]
1. API layer: one Axios client with auth interceptor + error normalization.
2. React Router: replace the switch/case shell with real routes (target the 35+ routes the
   briefs specified). Deep-linkable URLs are required for a sales tool.
3. Types: generate/write TS interfaces for the core API resources (Customer, Invoice, Order,
   Service, ServiceBundle, ServiceSubscription, Campaign). No `any`.
4. Stores: auth (Sanctum token lifecycle), navigation, notifications.
5. Data hooks on TanStack Query: `useCustomers`, `useCustomer`, `useInvoices`, `useOrders`,
   `useServices`, `useServiceBundles`, `useSubscriptions`, `useCampaigns`.
6. Shared components: DataTable, DataCard, MetricCard, StatusBadge, PageHeader (the gap
   analysis lists these as the top reuse wins across the 22 mock-data pages).
   Exit criteria: login works end-to-end against the deployed API.

### Phase 2 — Replace mock data, module by module (weeks 2–3)
Order by sales value; delete mock objects as each page is wired:
1. CRM: CustomersListPage, CustomerDetailPage, ContactsListPage, ContactDetailPage.
2. Billing: InvoicesListPage (13 mock instances — largest), invoice detail, payments,
   OrderHistoryPage.
3. Catalog: ServicesPage, service bundles, categories.
4. Subscriptions: list/detail/lifecycle (status: trialing/active/expired already modeled).
5. Campaigns: CampaignsPage, CampaignDetailPage; wire dispatch actions to backend jobs
   (currently log-only).
   Exit criteria: zero mock-data occurrences (grep for the 61 known instances).

### Phase 3 — Sales readiness (week 4)
1. Seed the product catalog: publishing products (per the Bible Part 8 price points:
   headliner, premium listing, sponsorships, Influencer $300 / Expert $400 / Sponsorships
   $500) AND AI app products (Task Juggler, 4Projects, 4Calls tiers mirroring
   `config/fourcalls.php` $49–$399, URPA, SiteHealth) with `provisioning_target` per product.
2. Stripe checkout flow: backend has the SDK; build checkout session creation + webhook
   handling + payment recording against existing Invoice/Order models.
3. Fulfillment hook: on paid order for a publishing product → call Multisite
   `POST /api/v1/provision/subscription` with the order's `crm_order_id` and Stripe ids.
   Store the response; surface provisioning status on the order page.
4. Configure secrets with the publishing side: `X-Provisioning-Secret` value and a
   `PUBLISHING_BRIDGE_API_KEY` Bearer token for the bridge reads.
   Exit criteria: one real end-to-end sale — catalog → checkout → Stripe → provisioned
   subscription visible in Multisite.

### Phase 4 — Dashboards and learning content (weeks 5–6)
1. Wire the bridge endpoints into customer dashboards (ROI, audience composition) — this is
   the retention story for managed SMB clients.
2. Load the 60 campaign JSON files through CampaignRenderer; connect `/learn/:campaignSlug`.
3. Dashboard widgets: replace the 4 hardcoded card types with API-backed metrics.

### Phase 5 — Defer (post-launch)
- AI-first CRM (quality evaluation, feedback loops, decision rules engine — currently 35/100
  readiness per `AI_FIRST_CRM_IMPLEMENTATION_PLAN.md`).
- AI Gateway and the `AI/4_DAYNEWS_INTEGRATION.md` / `5_TASKJUGGLER_INTEGRATION.md` /
  `6_OPSCENTER_INTEGRATION.md` specs (read-only multi-DB tools). Real integration for launch
  is the provisioning + bridge contracts in Section 2, which are far cheaper.
- File-upload UI (backend S3 support is ready).

---

## 4. Coordination points with the other platforms

| Topic | Owner | What CC needs |
|---|---|---|
| `X-Provisioning-Secret` value + endpoint URL | Publishing | Set in Railway env both sides |
| `PUBLISHING_BRIDGE_API_KEY` Bearer token | Publishing | Issue + set |
| taskjuggler-api provisioning endpoint contract | AI platform session | Will be published; mirror of Multisite contract |
| AI app product tiers/pricing for catalog seed | Founder + AI platform session | Confirm before Phase 3 step 1 |
| SSO (OAuth2 server, likely hosted by publishing) | Cross-platform, post-launch | Do not build auth federation now; Sanctum locally |

## 5. Hard rules (from cross-platform conventions)
- PostgreSQL only; UUID PKs; never `env()` outside config files (Railway caches config).
- Do not duplicate sources of truth: publishing owns users/businesses/communities; Command
  Center owns orders, the product catalog, and the CRM sales pipeline; the AI platform owns
  AI app accounts. Reference by external id (`crm_order_id`, business UUID), don't copy.
- No `any` in TS; remove the mock data files entirely once wired (don't leave fallbacks —
  silent mock fallbacks were how the current disconnect went unnoticed).
