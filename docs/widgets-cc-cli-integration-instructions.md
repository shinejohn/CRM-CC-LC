# Marketing Kit & Syndication — CC CLI Integration Instructions

**Repo:** `/Users/johnshine/Dropbox/Fibonacco/Learning-Center`  
**Stack:** Laravel 12 API (`/backend`) + React 18 SPA (`/src`) + TypeScript  
**Command Center:** `/src/command-center/` — own router, Six Verbs nav (`NavigationRail`), lazy-loaded pages  
**Layout:** `CommandCenterLayout.tsx` wraps all pages (NavigationRail + Header + AccountManagerBar + animated main content)  
**Routing pattern:** lazy import with `.then(m => ...)`, `<Suspense fallback={<LoadingScreen />}>`, routes in `AppRouter.tsx`  
**Nav pattern:** `useNavSections()` in `NavigationRail.tsx` returns `VerbSection[]` with `{ label, href, icon, resource }` children  
**Data fetching:** TanStack Query + Axios, services in `src/services/` or module-local hooks  
**UI:** Tailwind + CSS vars (`--nexus-*`), Lucide icons, Framer Motion, Radix/shadcn patterns  
**Backend:** Laravel 12, Sanctum auth, UUID PKs, PostgreSQL, services in `app/Services/`  
**Existing infrastructure:**  
- `SMB` model (`app/Models/SMB.php`) — has `manifest_destiny_day`, `manifest_destiny_start_date`, full business profile fields  
- `PublishingPlatformService` — already has `publishArticle()`, `createListing()`, `createEvent()`, `featureInNewsletter()`, `activateAlphaSite()`, `reportReadership()`, bridge export endpoints for communities/businesses  
- `ContentGenerationService` — AI content generation via OpenRouter  
- `AccountManagerService` — Sarah AI drip engine  
- `SocialStudioController` + `social_studio_*` tables — credits, subscriptions, connected accounts, content, scheduled posts  
- `SyndicatedPostCard.tsx` — already in `src/command-center/components/`, handles announcement/classified/coupon/event share post types  
- `PublishingBridgeController` — subscription status, slot inventory bridge to multisite  

---

## Step 1: Database — Marketing Kit + Syndication tables

```bash
cc "Create a migration at backend/database/migrations/2026_05_07_100001_create_marketing_kit_tables.php

Tables to create (all UUID PKs via \$table->uuid('id')->primary(), all with timestamps):

1. marketing_kit_assets — stores generated/saved marketing assets per SMB
   - smb_id (foreignUuid, references smbs)
   - asset_type (text: 'website_widget', 'menu_bar', 'email_signature', 'social_header', 'social_post', 'branded_image', 'content_card')
   - platform (text, nullable: 'facebook', 'twitter', 'instagram', 'tiktok', 'email', 'website')
   - title (text)
   - config (jsonb: customization overrides — theme, promo text, individual contact, etc.)
   - generated_html (text, nullable: for email signature HTML output)
   - generated_svg (text, nullable: for image assets)
   - embed_code (text, nullable: for website widget/menu bar)
   - is_active (boolean, default true)
   - published_at (timestampTz, nullable)

2. content_cards — daily content cards generated for SMBs and syndication
   - smb_id (foreignUuid, references smbs, nullable — null for community-only cards)
   - community_id (foreignUuid, references communities)
   - content_type (text: 'news', 'events', 'weather', 'downtown', 'spotlight')
   - card_mode (text: 'smb_self_post', 'syndication_sponsored')
   - content_data (jsonb: news items, events, weather data, etc.)
   - sponsor_data (jsonb, nullable: sponsor SMB info for syndication cards)
   - caption_text (text)
   - tracking_url (text, nullable)
   - posted_at (timestampTz, nullable)
   - clicks (integer, default 0)
   - date_for (date: the day this card is for)

3. syndication_partners — FBC admins who distribute content
   - user_id (foreignUuid, references users)
   - name (text)
   - email (text)
   - tier (text, default 'bronze': 'bronze', 'silver', 'gold', 'platinum')
   - revenue_share_pct (integer, default 20)
   - total_earned (integer, default 0 — cents)
   - status (text, default 'pending': 'pending', 'active', 'suspended')

4. partner_communities — communities a syndication partner distributes to
   - partner_id (foreignUuid, references syndication_partners)
   - community_id (foreignUuid, references communities, nullable)
   - platform (text: 'facebook_group', 'facebook_page', 'instagram', 'twitter', 'tiktok', 'nextdoor', 'newsletter', 'whatsapp', 'telegram', 'reddit', 'other')
   - group_name (text)
   - group_url (text, nullable)
   - member_count (integer, default 0)
   - status (text, default 'pending': 'pending', 'active', 'removed')
   - posts_this_month (integer, default 0)
   - clicks_this_month (integer, default 0)

5. sponsor_placements — links paying SMBs to syndication partner distribution
   - smb_id (foreignUuid, references smbs)
   - partner_id (foreignUuid, references syndication_partners)
   - monthly_budget_cents (integer)
   - partner_cut_cents (integer)
   - status (text, default 'active': 'active', 'paused', 'cancelled')
   - posts_delivered (integer, default 0)
   - clicks_delivered (integer, default 0)

6. click_tracking — tracks all UTM clicks for syndication and content cards
   - content_card_id (foreignUuid, references content_cards, nullable)
   - asset_id (foreignUuid, references marketing_kit_assets, nullable)
   - partner_id (foreignUuid, references syndication_partners, nullable)
   - smb_id (foreignUuid, references smbs, nullable)
   - community_id (foreignUuid, references communities, nullable)
   - source (text)
   - utm_params (jsonb)
   - ip_address (text, nullable)
   - user_agent (text, nullable)
   - clicked_at (timestampTz)

Include proper down() methods for all tables. Follow existing migration patterns in the repo."
```

## Step 2: Models

```bash
cc "Create Laravel models for the 6 new tables. Place in backend/app/Models/:

MarketingKitAsset.php — belongs to SMB, casts config as array, generated_at timestamps
ContentCard.php — belongs to SMB (nullable) and Community, casts content_data and sponsor_data as array
SyndicationPartner.php — belongs to User, has many PartnerCommunity and SponsorPlacement
PartnerCommunity.php — belongs to SyndicationPartner and Community (nullable)
SponsorPlacement.php — belongs to SMB and SyndicationPartner
ClickTracking.php — belongs to ContentCard, MarketingKitAsset, SyndicationPartner, SMB, Community (all nullable)

All use HasUuids trait. All define \$fillable. All define \$casts for jsonb/boolean/datetime fields.
Add relationships to the existing SMB model: hasMany MarketingKitAsset, hasMany ContentCard, hasMany SponsorPlacement.
Add relationships to the existing Community model: hasMany ContentCard, hasMany PartnerCommunity.
Follow the exact patterns used in existing models like SMB.php, Campaign.php."
```

## Step 3: Backend Services

```bash
cc "Create backend/app/Services/MarketingKitService.php:

This service handles:

1. getMarketingProfile(SMB \$smb) — returns all SMB data needed by the frontend Marketing Kit, including:
   - SMB profile fields (name, dba, category, contact, phone, email, address, city, state, zip, hours from metadata)
   - Alphasite URL from PublishingPlatformService (call activateAlphaSite or pull from existing provisioning)
   - Current promo from active campaign data
   - Events from PublishingPlatformService::createEvent or bridge export
   - News/articles from PublishingPlatformService bridge
   - Weather from community location data
   - DowntownsGuide listing status

2. saveAsset(SMB \$smb, string \$type, array \$config, ?string \$html, ?string \$svg) — persists a generated asset to marketing_kit_assets

3. generateEmbedCode(MarketingKitAsset \$asset) — generates the JS embed snippet for website widget/menu bar, hosted at CDN_URL

4. generateEmailSignatureHTML(array \$businessData) — produces the email-client-compatible table-based HTML for the email signature (inline styles, no divs for layout)

Inject PublishingPlatformService to pull live data from the publishing platform bridge."
```

```bash
cc "Create backend/app/Services/ContentCardService.php:

This service handles:

1. generateDailyCards(Community \$community) — generates content cards for a community for today
   - Pulls real content from PublishingPlatformService: articles (Day.News), events (GoEventCity), readership data
   - Determines content type by day of week (Mon=news, Tue=events, Wed=weather, Thu=downtown, Fri=spotlight)
   - Creates ContentCard records for each active SMB in the community (smb_self_post mode)
   - Creates ContentCard records for syndication (syndication_sponsored mode) with sponsor_data from paying SMBs

2. getCardForSmb(SMB \$smb, ?string \$contentType) — returns today's card for an SMB, generates if not exists

3. generateCaption(ContentCard \$card) — AI-generated caption via ContentGenerationService with hashtags and Alphasite URL

4. trackClick(string \$trackingUrl, Request \$request) — records click in click_tracking table, returns redirect URL

Schedule generateDailyCards to run via Laravel scheduler (daily at 5am) as a queued job."
```

```bash
cc "Create backend/app/Services/SyndicationService.php:

This service handles:

1. registerPartner(User \$user, array \$data) — creates SyndicationPartner record
2. addCommunity(SyndicationPartner \$partner, array \$communityData) — creates PartnerCommunity record
3. matchSponsors(SyndicationPartner \$partner) — finds paying SMBs in the partner's community areas, creates SponsorPlacement records
4. getDailyQueue(SyndicationPartner \$partner) — returns today's content cards for all partner communities (both free community content and sponsored posts)
5. calculateEarnings(SyndicationPartner \$partner, string \$period) — calculates earnings from click_tracking data × sponsor placement rates
6. updateTier(SyndicationPartner \$partner) — recalculates tier based on active sponsor count (bronze 0-2, silver 3-7, gold 8-14, platinum 15+) and updates revenue_share_pct
7. processPayouts(string \$period) — aggregates earnings for all partners, creates payout records"
```

## Step 4: Backend Controllers + API Routes

```bash
cc "Create backend/app/Http/Controllers/Api/MarketingKitController.php:

Endpoints:
- GET /marketing-kit/profile — returns full marketing profile for authenticated SMB (calls MarketingKitService::getMarketingProfile)
- POST /marketing-kit/assets — saves a generated asset (type, config, html, svg)
- GET /marketing-kit/assets — lists saved assets for the authenticated SMB
- GET /marketing-kit/assets/{id} — get specific asset
- DELETE /marketing-kit/assets/{id} — soft-delete an asset
- GET /marketing-kit/embed/{id} — returns embed code for a widget asset
- POST /marketing-kit/email-signature — generates and returns email signature HTML

Create backend/app/Http/Controllers/Api/ContentCardController.php:

Endpoints:
- GET /content-cards/today — returns today's card for the authenticated SMB (calls ContentCardService::getCardForSmb)
- GET /content-cards/preview/{type} — preview a specific content type regardless of day
- GET /content-cards/history — list past content cards for the SMB
- GET /t/{trackingCode} — click tracking redirect (public, no auth)

Create backend/app/Http/Controllers/Api/SyndicationController.php:

Endpoints:
- POST /syndication/register — register as syndication partner
- GET /syndication/dashboard — dashboard stats for authenticated partner
- GET /syndication/queue — today's content queue for partner
- POST /syndication/communities — add a community
- GET /syndication/communities — list partner's communities
- DELETE /syndication/communities/{id} — remove community
- GET /syndication/sponsors — list sponsors matched to this partner
- GET /syndication/earnings — earnings history
- GET /syndication/earnings/current — real-time current month earnings
- POST /syndication/posted/{cardId} — mark a card as posted (optional, for tracking)

Add all routes to backend/routes/api.php:
- Marketing Kit routes inside the existing auth:sanctum middleware group under a 'marketing-kit' prefix
- Content Card routes: /today and /preview under auth, /t/{code} as public route
- Syndication routes inside auth:sanctum under a 'syndication' prefix

Follow the existing route patterns in api.php. Use route names with 'api.' prefix per CLAUDE.md rules."
```

## Step 5: Daily Content Card Job

```bash
cc "Create backend/app/Jobs/GenerateDailyContentCards.php:

A queued job that runs daily at 5am via the Laravel scheduler.

For each active community:
1. Call ContentCardService::generateDailyCards(\$community)
2. This pulls real content from PublishingPlatformService (articles, events, readership)
3. Creates SMB self-post cards for every active SMB in the community
4. Creates syndication cards for any SMBs with active sponsor_placements
5. Generates captions via ContentGenerationService
6. Generates tracking URLs with UTM params

Register in backend/routes/console.php:
Schedule::job(new GenerateDailyContentCards)->dailyAt('05:00');

Also create backend/app/Jobs/RecalculateSyndicationEarnings.php that runs weekly to update partner tiers and earnings. Schedule weekly on Mondays at 6am."
```

## Step 6: Embed Code Hosting

```bash
cc "Create backend/app/Http/Controllers/Api/WidgetEmbedController.php:

Public endpoint (no auth):
- GET /embed/widget/{assetId}.js — returns a JavaScript file that:
  1. Fetches the asset's config and business data from GET /api/v1/marketing-kit/public/{assetId}
  2. Creates a shadow DOM container on the host page
  3. Renders the widget (website widget or menu bar) inside the shadow DOM
  4. Styles are self-contained within the shadow DOM

- GET /embed/data/{assetId} — returns the public-safe business data for a published widget (business name, promo, events, alphasite URL — no private data)

Add the public routes OUTSIDE the auth middleware in api.php.

The embed snippet the SMB copies looks like:
<script src='https://api.fibonacco.com/api/v1/embed/widget/{assetId}.js' async></script>

When the SMB 'publishes' a widget from the Marketing Kit, call POST /marketing-kit/assets with the config, then the embed code references that asset ID."
```

## Step 7: Click Tracking Redirect Service

```bash
cc "Create backend/app/Http/Controllers/Api/TrackingController.php:

Public endpoint (no auth):
- GET /t/{code} — decodes the tracking code, records the click in click_tracking table, 301 redirects to destination URL

The tracking code encodes: destination URL, partner_id, community_id, smb_id, content_type, card_id.
Use a signed URL or base64-encoded JSON with HMAC to prevent tampering.
Must be fast — sub-50ms response. Insert click record async via a queued job (dispatch after redirect).

Create backend/app/Jobs/RecordClick.php — queued job that writes to click_tracking table.

Add public route to api.php OUTSIDE auth middleware:
Route::get('/t/{code}', [TrackingController::class, 'redirect'])->name('api.tracking.redirect');

The ContentCardService and MarketingKitService both use this to generate tracking URLs for all links in content cards and widgets."
```

## Step 8: Frontend — Marketing Kit Module

```bash
cc "Create the frontend module at src/command-center/modules/marketing-kit/:

index.ts — barrel export for MarketingKitPage, ContentCardsPage

MarketingKitPage.tsx — Shell page with left sidebar nav (6 tools in 2 groups: Widgets + Images) and main content area. Uses useParams() to read :tool from the URL for deep-linking. Fetches SMB profile via useMarketingProfile hook. Passes business data as props to child tool components. Each tool has an editor panel (customization fields above) and a live preview (below). 'Save' button persists to backend via POST /marketing-kit/assets. Follow the layout pattern of other module pages — this is a full-width page inside CommandCenterLayout, not a nested sidebar within the CC sidebar.

useMarketingProfile.ts — TanStack Query hook, GET /api/v1/marketing-kit/profile, staleTime 5min

useMarketingAssets.ts — TanStack Query hook for CRUD on saved assets, GET/POST/DELETE /api/v1/marketing-kit/assets

WebsiteWidget.tsx — Embeddable community widget with tabs (Community, Promos, Reviews). Shows weather, news (from PublishingPlatformService data), events, downtown guide, testimonials. 'Publish & Get Embed Code' button calls the backend and returns the script tag.

MenuBarWidget.tsx — Horizontal dark nav bar with dropdown panels. Toggle switches to show/hide tabs. Same publish flow for embed code.

EmailSignature.tsx — Wide (600px) email signature with optional individual contact toggle. 'Copy HTML' button calls POST /marketing-kit/email-signature and copies the returned HTML to clipboard. The HTML is table-based for email client compatibility.

SocialHeaders.tsx — SVG generator with platform tabs (Facebook 820×312, X 1500×500, Instagram 1080×1080, TikTok 1080×1920). Download as SVG and PNG buttons. Strategy tips per platform below preview.

SocialPosts.tsx — 1080×1080 SVG generator with post type selector (promo/event/news/brand). Ready-to-copy caption below with hashtags. Download buttons.

BrandedImage.tsx — 1200×630 SVG with 6 color themes. Theme selector buttons. Alphasite URL prominent. Download buttons.

ContentCardsPage.tsx — Shows today's SMB self-post card with content type selector to preview all 5 types. Side-by-side toggle to compare SMB self-post vs syndication sponsored version. Caption with copy button. Uses GET /api/v1/content-cards/today and /preview/{type}. Extends or works alongside the existing SyndicatedPostCard.tsx component patterns.

All components: Tailwind CSS with existing --nexus-* CSS vars, Lucide icons, Framer Motion for transitions. NO localStorage. Follow existing module patterns (dashboard, campaigns, etc.)."
```

## Step 9: Frontend — Syndication Partner Dashboard

```bash
cc "Create src/command-center/modules/syndication/:

index.ts — barrel export
SyndicationDashboardPage.tsx — Full partner dashboard with 5 sections via internal tab nav:

1. Overview — StatCards (total earned, this month, communities, active sponsors), tier progress bar (bronze/silver/gold/platinum with revenue share %), earnings history table
2. Today's Content — daily queue from GET /syndication/queue. Each item shows content preview, 'Sponsored' badge with earnings amount if sponsored, 'Copy Post' button. Free community content has no earnings tag.
3. My Communities — connected groups from GET /syndication/communities. Each shows platform icon, group name, member count, posts/clicks/earned this month. '+ Add Community' button.
4. My Sponsors — SMBs from GET /syndication/sponsors. Shows SMB name, monthly budget, partner's cut, posts delivered, clicks. Referral link at bottom for recruiting more sponsors.
5. Performance — bar charts for monthly earnings and clicks (use recharts, already available). Content type engagement breakdown.

useSyndicationDashboard.ts — TanStack Query hooks for all syndication API endpoints

This page has its own route and is NOT visible in the NavigationRail for regular SMB users — it's a separate role. It uses CommandCenterLayout but could also be a standalone layout if needed for non-SMB users."
```

## Step 10: Routes + Navigation

```bash
cc "Edit src/command-center/AppRouter.tsx:

Add lazy imports with the ATTRACT section imports:
const MarketingKitPage = lazy(() => import('./modules/marketing-kit/MarketingKitPage').then(m => ({ default: m.MarketingKitPage })));
const ContentCardsPage = lazy(() => import('./modules/marketing-kit').then(m => ({ default: m.ContentCardsPage })));
const SyndicationDashboardPage = lazy(() => import('./modules/syndication/SyndicationDashboardPage').then(m => ({ default: m.SyndicationDashboardPage })));

Add routes inside the ATTRACT section after existing attract routes:
<Route path='attract/marketing-kit' element={<Suspense fallback={<LoadingScreen />}><MarketingKitPage /></Suspense>} />
<Route path='attract/marketing-kit/:tool' element={<Suspense fallback={<LoadingScreen />}><MarketingKitPage /></Suspense>} />
<Route path='attract/content-cards' element={<Suspense fallback={<LoadingScreen />}><ContentCardsPage /></Suspense>} />

Add syndication route (separate section, after SARAH routes):
<Route path='syndication' element={<Suspense fallback={<LoadingScreen />}><SyndicationDashboardPage /></Suspense>} />
<Route path='syndication/:section' element={<Suspense fallback={<LoadingScreen />}><SyndicationDashboardPage /></Suspense>} />"
```

```bash
cc "Edit src/command-center/components/layout/NavigationRail.tsx:

Add to the lucide-react import: Gift, LayoutTemplate
Add two children to the 'attract' VerbSection in useNavSections(), after the existing Events child:
{ label: 'Marketing Kit', href: '/command-center/attract/marketing-kit', icon: Gift, resource: 'content' },
{ label: 'Content Cards', href: '/command-center/attract/content-cards', icon: LayoutTemplate, resource: 'content' },"
```

## Step 11: Dashboard — Today's Post Widget

```bash
cc "Edit src/command-center/modules/dashboard/DashboardGrid.tsx:

Add a 'Today's Post' grid card. The card:
- Fetches from GET /api/v1/content-cards/today
- Shows compact preview of today's content type with icon and label (📰 Mon, 🎪 Tue, ⛅ Wed, 🏙 Thu, 🎤 Fri)
- Shows headline or summary text from the card content_data
- 'View & Post' button links to /command-center/attract/content-cards
- Only renders if SMB profile exists (guard with the auth user's smb relationship)
- Matches existing card styling in the grid (use the same card wrapper component the other dashboard cards use)"
```

## Step 12: Wire Sarah Drip Emails

```bash
cc "Edit backend/app/Services/AccountManagerService.php to add marketing kit touchpoints to the Manifest Destiny drip sequence.

Add new task types to the AI task suggestion engine:
- 'marketing_kit_branded_image' — Day 3 of Manifest Destiny: 'I created a professional branded image for {business_name}'
- 'marketing_kit_email_signature' — Day 5: 'Here is a professional email signature for your team'
- 'marketing_kit_social_headers' — Day 8: 'I made social media headers for all your platforms'  
- 'marketing_kit_social_posts' — Day 12: 'Here are ready-to-post social graphics for this week'
- 'marketing_kit_content_cards' — Day 15: 'Here is today's community content — share it with your followers'
- 'marketing_kit_website_widget' — Day 20: 'Add this community widget to your website'

Each task generates an email (via the existing CampaignOrchestratorService / EmailService) with:
- Sarah's persona (warm, professional, action-oriented per MODULE-7 spec)
- A direct link to the specific tool: /command-center/attract/marketing-kit/{tool-slug}
- A preview description of what was 'created' for them

The tools render on-demand when clicked — the email just drives them to the page. But the backend should pre-generate the daily content card (via GenerateDailyContentCards job) so it's ready when they arrive.

Also add 'marketing_kit_syndication_invite' — Day 25: sent to SMBs who run Facebook community groups, inviting them to become syndication partners with link to /command-center/syndication"
```

---

## File Summary

| New Backend Files | Purpose |
|----------|---------|
| `database/migrations/2026_05_07_100001_create_marketing_kit_tables.php` | 6 tables: assets, content_cards, syndication_partners, partner_communities, sponsor_placements, click_tracking |
| `app/Models/MarketingKitAsset.php` | Asset model |
| `app/Models/ContentCard.php` | Content card model |
| `app/Models/SyndicationPartner.php` | Partner model |
| `app/Models/PartnerCommunity.php` | Partner community model |
| `app/Models/SponsorPlacement.php` | Sponsor placement model |
| `app/Models/ClickTracking.php` | Click tracking model |
| `app/Services/MarketingKitService.php` | Profile aggregation, asset save, embed code gen, email sig HTML gen |
| `app/Services/ContentCardService.php` | Daily card generation, caption gen, click tracking |
| `app/Services/SyndicationService.php` | Partner registration, sponsor matching, earnings calc, tier management, payouts |
| `app/Http/Controllers/Api/MarketingKitController.php` | Marketing kit CRUD endpoints |
| `app/Http/Controllers/Api/ContentCardController.php` | Content card endpoints + preview |
| `app/Http/Controllers/Api/SyndicationController.php` | Full syndication partner dashboard API |
| `app/Http/Controllers/Api/WidgetEmbedController.php` | Public embed JS + data endpoints |
| `app/Http/Controllers/Api/TrackingController.php` | Click redirect service |
| `app/Jobs/GenerateDailyContentCards.php` | Daily scheduled job |
| `app/Jobs/RecalculateSyndicationEarnings.php` | Weekly earnings/tier recalc |
| `app/Jobs/RecordClick.php` | Async click recording |

| New Frontend Files | Purpose |
|----------|---------|
| `src/command-center/modules/marketing-kit/index.ts` | Barrel exports |
| `src/command-center/modules/marketing-kit/MarketingKitPage.tsx` | Shell with sidebar, shared state, tool routing |
| `src/command-center/modules/marketing-kit/useMarketingProfile.ts` | TanStack Query — SMB profile |
| `src/command-center/modules/marketing-kit/useMarketingAssets.ts` | TanStack Query — asset CRUD |
| `src/command-center/modules/marketing-kit/WebsiteWidget.tsx` | Widget preview + publish/embed |
| `src/command-center/modules/marketing-kit/MenuBarWidget.tsx` | Menu bar preview + publish/embed |
| `src/command-center/modules/marketing-kit/EmailSignature.tsx` | Sig preview + copy HTML |
| `src/command-center/modules/marketing-kit/SocialHeaders.tsx` | Multi-platform SVG header gen |
| `src/command-center/modules/marketing-kit/SocialPosts.tsx` | 1080×1080 SVG post gen |
| `src/command-center/modules/marketing-kit/BrandedImage.tsx` | Themed SVG image gen |
| `src/command-center/modules/marketing-kit/ContentCardsPage.tsx` | SMB self-post + syndication card view |
| `src/command-center/modules/syndication/index.ts` | Barrel exports |
| `src/command-center/modules/syndication/SyndicationDashboardPage.tsx` | Full partner dashboard (5 sections) |
| `src/command-center/modules/syndication/useSyndicationDashboard.ts` | TanStack Query hooks for all syndication endpoints |

| Modified Files | Change |
|---------------|--------|
| `src/command-center/AppRouter.tsx` | Add marketing-kit, content-cards, syndication routes |
| `src/command-center/components/layout/NavigationRail.tsx` | Add Marketing Kit + Content Cards under Attract |
| `src/command-center/modules/dashboard/DashboardGrid.tsx` | Add Today's Post card |
| `backend/routes/api.php` | Add all marketing-kit, content-card, syndication, embed, tracking routes |
| `backend/routes/console.php` | Schedule daily content card gen + weekly earnings recalc |
| `backend/app/Models/SMB.php` | Add hasMany relationships to new models |
| `backend/app/Models/Community.php` | Add hasMany relationships to new models |
| `backend/app/Services/AccountManagerService.php` | Add marketing kit drip touchpoints to Manifest Destiny sequence |
