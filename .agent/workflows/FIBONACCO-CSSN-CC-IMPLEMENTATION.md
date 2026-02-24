# CSSN & Social Studio — Command Center Implementation Guide
### Fibonacco Engineering Specification
**Version 1.0 | February 2026**

---

## Overview

This document specifies how to build the CSSN Distribution Add-On and the Fibonacco Social Studio inside the Command Center. It covers module architecture, database schema additions, UI components, API endpoints, billing integration, and the OAuth self-posting connection system.

This implementation sits on top of the CSSN core infrastructure (adapters, queue, AI pipeline) already specified in `FIBONACCO-CSSN-SYNDICATION-ARCHITECTURE.md`. This document covers only the client-facing product layer — the subscription management, credit system, self-posting tools, and client-facing UI — not the underlying syndication engine.

---

## Module Architecture

Two new CC modules are added:

**CSSN Subscription Manager** — handles add-on subscription tiers, campaign mode purchases, distribution preferences, and CSSN performance reporting for SMB clients.

**Social Studio** — the self-service AI content creation and scheduling tool. Coin-operated credit system. Direct posting to client's own social accounts.

Both modules share the existing CC authentication context, SMB profile data, and component library. Both are accessible from the SMB's Command Center sidebar alongside the existing CRM, Campaign Builder, and Content Library.

---

## Part 1: CSSN Subscription Manager

### 1.1 Database Schema

```sql
-- CSSN subscription records per SMB
cssn_subscriptions (
  id UUID PRIMARY KEY,
  smb_id UUID NOT NULL REFERENCES smb_profiles(id),
  community_id UUID NOT NULL REFERENCES communities(id),
  tier ENUM('local', 'reach', 'network', 'enterprise') NOT NULL,
  mode ENUM('subscription', 'campaign') NOT NULL DEFAULT 'subscription',
  status ENUM('active', 'paused', 'cancelled', 'expired') NOT NULL,
  campaign_start_date DATE,           -- campaign mode only
  campaign_end_date DATE,             -- campaign mode only
  cross_community_ids UUID[],         -- network tier: additional communities
  billing_amount_cents INTEGER NOT NULL,
  billing_interval ENUM('monthly', 'one_time') NOT NULL,
  stripe_subscription_id VARCHAR,
  activated_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Per-SMB content distribution settings
cssn_smb_preferences (
  id UUID PRIMARY KEY,
  smb_id UUID NOT NULL REFERENCES smb_profiles(id),
  auto_distribute_coupons BOOLEAN DEFAULT TRUE,
  auto_distribute_events BOOLEAN DEFAULT TRUE,
  auto_distribute_articles BOOLEAN DEFAULT TRUE,
  auto_distribute_announcements BOOLEAN DEFAULT FALSE,
  require_approval_before_post BOOLEAN DEFAULT FALSE,
  preferred_post_time TIME,           -- null = use Time Optimizer
  excluded_platforms VARCHAR[],       -- platforms SMB opts out of
  brand_voice_override TEXT,          -- custom voice instructions for Copy Generator
  updated_at TIMESTAMP
)

-- CSSN performance reports per SMB
cssn_smb_reports (
  id UUID PRIMARY KEY,
  smb_id UUID NOT NULL,
  community_id UUID NOT NULL,
  report_period_start DATE,
  report_period_end DATE,
  total_posts INTEGER,
  total_impressions BIGINT,
  total_reach BIGINT,
  total_engagements INTEGER,
  total_link_clicks INTEGER,
  top_performing_post_id UUID,
  platform_breakdown JSONB,           -- per-platform stats
  syndication_dividend INTEGER,       -- posts generated per content created
  generated_at TIMESTAMP
)
```

### 1.2 API Endpoints

```
POST   /api/cssn/subscribe              — Create new CSSN subscription
GET    /api/cssn/subscription/:smb_id   — Get current subscription status
PATCH  /api/cssn/subscription/:id       — Update tier or pause/cancel
POST   /api/cssn/campaign               — Purchase one-time campaign burst
GET    /api/cssn/preferences/:smb_id    — Get distribution preferences
PUT    /api/cssn/preferences/:smb_id    — Update distribution preferences
GET    /api/cssn/reports/:smb_id        — Get performance reports
GET    /api/cssn/queue/:smb_id          — View pending content in syndication queue
DELETE /api/cssn/queue/:item_id         — Pull specific content from queue
```

### 1.3 UI Components

**CSSN Dashboard Widget (Command Center Home)**

Visible to all SMB clients with an active CSSN subscription. Shows: current tier badge, total posts this month, total impressions this month, syndication dividend (e.g., "42 posts from 6 content items"), and a quick link to the full report. A "Boost" button allows the SMB to manually trigger distribution of their latest content outside the scheduled posting window, consuming 1 credit from their Social Studio balance if active.

**CSSN Subscription Page (`/social/syndication`)**

Accessible from the CC sidebar. Displays the current tier, tier feature comparison table, and upgrade/downgrade controls. A campaign mode toggle lets the SMB switch to one-time campaign mode and set a date range. Below the tier selector, the SMB's content distribution preferences are editable: which content types auto-distribute, whether posts require approval before going live, preferred posting time override, and platform opt-outs. A live preview shows what their current content looks like across platform formats before committing to any distribution.

**CSSN Performance Report (`/social/syndication/report`)**

Monthly and all-time views. Key metrics at the top: total posts, total impressions, total reach, total engagements, link clicks, syndication dividend. A platform breakdown table shows performance per platform. A content performance list ranks the SMB's content by engagement. The syndication dividend is visualized as "X posts generated from Y content items" with a simple bar comparing this month to last month. The entire report is exportable as PDF for the SMB to share internally.

**Content Queue View (`/social/syndication/queue`)**

Shows all upcoming scheduled posts attributed to this SMB across all platforms and communities. Each item shows: content title, platforms it will post to, scheduled datetime, approval status. If `require_approval_before_post` is enabled, items sit here for SMB review before going live. Approve, reschedule, or remove any item. Emergency pull removes an item from all platforms simultaneously.

---

## Part 2: Social Studio

### 2.1 Database Schema

```sql
-- Credit balance per SMB
social_studio_credits (
  id UUID PRIMARY KEY,
  smb_id UUID NOT NULL REFERENCES smb_profiles(id),
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_purchased INTEGER DEFAULT 0,
  lifetime_consumed INTEGER DEFAULT 0,
  auto_replenish BOOLEAN DEFAULT FALSE,
  auto_replenish_threshold INTEGER DEFAULT 10,
  auto_replenish_package ENUM('starter','standard','pro','studio'),
  updated_at TIMESTAMP
)

-- Credit transaction log
social_studio_credit_transactions (
  id UUID PRIMARY KEY,
  smb_id UUID NOT NULL,
  type ENUM('purchase', 'consume', 'refund', 'bonus', 'expiry') NOT NULL,
  amount INTEGER NOT NULL,            -- positive = credits added
  balance_after INTEGER NOT NULL,
  action_type VARCHAR,                -- 'post_copy', 'event_card', etc.
  content_id UUID,                    -- reference to generated content
  stripe_payment_intent_id VARCHAR,   -- purchase transactions only
  created_at TIMESTAMP DEFAULT NOW()
)

-- Social Studio subscription (monthly credit plan)
social_studio_subscriptions (
  id UUID PRIMARY KEY,
  smb_id UUID NOT NULL REFERENCES smb_profiles(id),
  status ENUM('active', 'cancelled') NOT NULL,
  monthly_credits INTEGER DEFAULT 200,
  discount_pct INTEGER DEFAULT 20,    -- discount on additional credit purchases
  billing_amount_cents INTEGER DEFAULT 7900,
  stripe_subscription_id VARCHAR,
  next_credit_refresh_at TIMESTAMP,
  created_at TIMESTAMP
)

-- Generated content pieces
social_studio_content (
  id UUID PRIMARY KEY,
  smb_id UUID NOT NULL,
  session_id UUID,                    -- groups content from one brief
  content_type ENUM(
    'post_copy','event_card','coupon_card',
    'google_post','medium_article','content_calendar',
    'hashtag_pack','competitor_analysis'
  ) NOT NULL,
  source_brief TEXT,                  -- the brief the SMB entered
  platform VARCHAR,
  generated_output JSONB,             -- copy, asset URLs, hashtags, etc.
  credits_consumed INTEGER NOT NULL,
  status ENUM('draft','approved','scheduled','posted','archived'),
  scheduled_at TIMESTAMP,
  posted_at TIMESTAMP,
  platform_post_id VARCHAR,           -- returned by platform API after posting
  created_at TIMESTAMP DEFAULT NOW()
)

-- SMB's own connected social accounts (OAuth)
social_studio_connected_accounts (
  id UUID PRIMARY KEY,
  smb_id UUID NOT NULL REFERENCES smb_profiles(id),
  platform ENUM('facebook','instagram','x','google_biz','linkedin','pinterest') NOT NULL,
  platform_account_id VARCHAR NOT NULL,
  display_name VARCHAR,
  profile_image_url VARCHAR,
  oauth_access_token TEXT NOT NULL,   -- encrypted
  oauth_refresh_token TEXT,           -- encrypted
  token_expires_at TIMESTAMP,
  scopes VARCHAR[],
  status ENUM('active','expired','revoked'),
  connected_at TIMESTAMP,
  last_verified_at TIMESTAMP,
  UNIQUE(smb_id, platform, platform_account_id)
)

-- Scheduled posts to SMB's own accounts
social_studio_scheduled_posts (
  id UUID PRIMARY KEY,
  smb_id UUID NOT NULL,
  content_id UUID REFERENCES social_studio_content(id),
  connected_account_id UUID REFERENCES social_studio_connected_accounts(id),
  platform VARCHAR NOT NULL,
  status ENUM('pending','posted','failed','cancelled') NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  posted_at TIMESTAMP,
  platform_post_id VARCHAR,
  error_log TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### 2.2 API Endpoints

```
-- Credits
GET    /api/studio/credits/:smb_id           — Get credit balance and history
POST   /api/studio/credits/purchase          — Purchase credit package (Stripe)
POST   /api/studio/credits/subscribe         — Start Studio subscription
DELETE /api/studio/credits/subscribe/:id     — Cancel Studio subscription

-- Content Generation
POST   /api/studio/generate/post-copy        — Generate social post copy
POST   /api/studio/generate/event-card       — Generate event card assets
POST   /api/studio/generate/coupon-card      — Generate coupon card assets
POST   /api/studio/generate/google-post      — Generate Google Business post
POST   /api/studio/generate/content-calendar — Generate content calendar
POST   /api/studio/generate/hashtags         — Generate hashtag pack
POST   /api/studio/generate/medium-article   — Generate Medium-ready article

-- Content Management
GET    /api/studio/content/:smb_id           — List all generated content
GET    /api/studio/content/:id               — Get specific content item
DELETE /api/studio/content/:id               — Delete draft content
PATCH  /api/studio/content/:id               — Update/approve content

-- Connected Accounts (SMB's own accounts)
GET    /api/studio/accounts/:smb_id          — List connected accounts
POST   /api/studio/accounts/connect          — Initiate OAuth flow
DELETE /api/studio/accounts/:id              — Disconnect account
POST   /api/studio/accounts/:id/verify       — Verify token still valid

-- Scheduling
POST   /api/studio/schedule                  — Schedule content to connected account
GET    /api/studio/schedule/:smb_id          — Get scheduled posts
DELETE /api/studio/schedule/:id              — Cancel scheduled post
GET    /api/studio/calendar/:smb_id          — Get posting calendar view
```

### 2.3 Core Generation Flows

**Post Copy Generation**

Request body includes: `platform` (facebook|instagram|x|linkedin|pinterest), `content_brief` (what the SMB wants to say), `content_type` (promotion|event|announcement|general), `tone_override` (optional), `include_hashtags` (boolean), `include_cta` (boolean).

The handler deducts 1 credit, calls the Copy Generator with the SMB's full business profile context from the CC (industry, voice settings, past content samples stored in pgvector), formats the prompt for the specified platform's conventions, and returns the generated copy with a confidence score and 2 alternative variants the SMB can choose from.

**Event Card Generation**

Request body includes: `event_id` (pulls event data from Go Event City or manual entry if not from PP), `platforms` (array: instagram_feed|instagram_story|snapchat), `layout_variant` (auto|bold|minimal|colorblock), `background_image_source` (auto|upload URL).

The handler deducts credits based on platform count (2 for single, 3 for full set), calls the Asset Processor with event data and brand profile, composites the card using the community brand template, and returns signed CDN URLs for each generated asset plus a preview thumbnail. Assets are retained for 30 days before cleanup.

**Content Calendar Generation**

Request body includes: `period` (7|30 days), `focus_topics` (array of themes the SMB wants to emphasize), `platforms` (which platforms to plan for), `posting_frequency` (posts per week per platform).

The handler deducts 8 credits (7-day) or 20 credits (30-day), calls the AI Editorial Engine with the SMB's business profile, recent Command Center activity, community seasonal data, and the specified parameters. Returns a structured calendar object with one content brief per planned post, organized by date and platform. Each brief in the calendar is a clickable item — clicking it opens the generation interface pre-filled with that brief, ready to generate in one action.

### 2.4 Connected Accounts OAuth Flow

The self-posting system connects the SMB's own social accounts using platform OAuth2. This is separate from Fibonacco's CSSN account connections — these are the SMB's personal/business pages, not Fibonacco's community accounts.

**Connection Flow:**

1. SMB clicks "Connect [Platform]" in the Connected Accounts panel
2. CC backend generates the platform's OAuth authorization URL with the appropriate scopes
3. SMB is redirected to the platform's authorization page and grants permission
4. Platform redirects back to the CC OAuth callback endpoint with an authorization code
5. CC backend exchanges the code for access + refresh tokens
6. Tokens are encrypted with AES-256 and stored in `social_studio_connected_accounts`
7. SMB's account appears as "Connected" in the panel with profile name and avatar

**Required OAuth Scopes per Platform:**

| Platform | Scopes Required |
|---|---|
| Facebook | `pages_manage_posts`, `pages_read_engagement`, `pages_show_list` |
| Instagram | `instagram_content_publish`, `instagram_basic`, `pages_manage_posts` |
| X | `tweet.write`, `tweet.read`, `users.read`, `offline.access` |
| Google Business | `https://www.googleapis.com/auth/business.manage` |
| LinkedIn | `w_member_social`, `r_organization_social`, `w_organization_social` |
| Pinterest | `boards:read`, `pins:write` |

**Token Refresh:** Background job runs every 6 hours. Tokens expiring within 48 hours are proactively refreshed. Expired tokens surface as "Reconnect Required" alerts in the Connected Accounts panel and in the AI Account Manager's morning briefing to the SMB.

### 2.5 Scheduling Engine

When an SMB schedules content to their connected account:

1. A `social_studio_scheduled_posts` record is created with status `pending`
2. The scheduling service adds a job to a dedicated Studio posting queue (separate from the CSSN community queue)
3. At the scheduled time, the job is picked up, the connected account's token is validated and refreshed if needed, and the appropriate platform adapter is called to post the content
4. On success: `posted_at` is set, `platform_post_id` is stored, status → `posted`
5. On failure: retry with exponential backoff up to 3 attempts, then status → `failed` with error log; SMB is notified via CC notification and email

The Studio posting queue uses the same Redis infrastructure as the CSSN queue but is isolated to prevent Studio posting jobs from competing with community distribution jobs for rate limit capacity.

### 2.6 UI: Social Studio Module

**Studio Home (`/studio`)**

Credit balance prominently displayed with a "Buy More" button and a progress bar showing credits consumed this month vs. purchased. Quick action cards for the most common creation types: "Create a Post," "Design an Event Card," "Build a Content Calendar." A recent content list shows the last 10 generated items with status (draft/scheduled/posted). Connected accounts displayed as platform icons with green/yellow/red status indicators.

**Content Brief Interface (`/studio/create`)**

A single-page brief form. Platform selector (multi-select checkboxes for which platforms to generate for). Content type selector. A natural language brief field — the SMB types what they want to say in plain language, no templates required. Optional: tone selector, CTA type, attach event or coupon from the CC database. Credit cost preview updates in real time as selections change. "Generate" button triggers the generation flow. Credit deduction happens immediately on click.

**Generation Results (`/studio/create/results`)**

After generation, all platform variants are shown in a tabbed preview interface. Each tab shows: the generated copy, hashtags, asset preview (for visual content), and a character count indicator. Inline editing is available — the SMB can modify any text directly in the result view without regenerating (no credit cost for manual edits). Platform-specific formatting warnings appear if edited copy exceeds character limits. Each variant has a "Use This" button. The "Schedule All" button opens a scheduling panel where the SMB sets the date/time for each platform and maps each variant to their connected account.

**Content Calendar View (`/studio/calendar`)**

A month view calendar showing: scheduled posts to the SMB's own accounts (blue), queued CSSN distribution posts (green), and empty slots where the AI suggests posting based on the generated content calendar plan. Clicking an empty slot opens the brief interface pre-filled with the calendar's planned content brief for that slot. Clicking a scheduled post opens the post preview with edit and reschedule options.

**Connected Accounts Panel (`/studio/accounts`)**

Lists all connected accounts with platform icon, account name, connection status, and last successful post time. "Connect Account" button triggers the OAuth flow per platform. "Disconnect" and "Reconnect" controls. Token expiry warnings shown proactively with a one-click reconnect action.

---

## Part 3: Billing Integration

Both products use Stripe for payment processing, extending the existing Fibonacco billing infrastructure.

**CSSN Subscriptions:** Created as Stripe Subscriptions with the appropriate price ID per tier. Monthly billing. Cancellation ends distribution at the end of the current billing period. Tier upgrades are prorated.

**Credit Purchases:** Created as Stripe Payment Intents (one-time). On payment success webhook, the credit balance in `social_studio_credits` is incremented and a `purchase` transaction is logged. The credit balance is displayed in real time in the CC — no delay between payment and credit availability.

**Auto-Replenishment:** When the SMB's credit balance drops below their configured threshold, the system automatically creates a Stripe Payment Intent using their saved payment method. The SMB receives an email notification of the auto-replenishment. This can be disabled at any time from the Connected Accounts panel or via the CC notification preferences.

**Studio Subscription:** Monthly Stripe Subscription. On each billing cycle, 200 credits are added to the SMB's balance via a `bonus` credit transaction and the subscription discount rate is maintained in the SMB's profile for future credit purchases.

---

## Part 4: Notifications and AI Account Manager Integration

The AI Account Manager receives new awareness of CSSN and Social Studio activity:

**CSSN Alerts to Account Manager:**
- Content scheduled for distribution in the next 24 hours (morning briefing)
- Unusual engagement spikes on distributed content (trigger upsell conversation)
- Subscription renewal approaching (trigger retention or upgrade conversation)
- Distribution queue unusually empty (prompt SMB to create content)

**Social Studio Alerts to Account Manager:**
- Credit balance below 20 credits (prompt purchase)
- Connected account token expired (prompt reconnection)
- No Studio activity in 14 days (prompt re-engagement)
- Content calendar not used in 30 days (prompt to use calendar feature)

The Account Manager uses these signals to initiate proactive conversations with the SMB through the CC chat interface, framing CSSN and Studio usage in terms of the SMB's goals and suggesting specific actions rather than generic nudges.

---

## Rollout Sequence

**Sprint 1 (Weeks 1–2):** Database migrations for CSSN subscriptions, preferences, and reports. CSSN Subscription Manager API endpoints. Basic CSSN Dashboard Widget. Stripe integration for subscription billing.

**Sprint 2 (Weeks 3–4):** Credit system database and API. Credit purchase flow with Stripe. Basic Social Studio creation interface (post copy only). Connected account OAuth flow for Facebook and Instagram.

**Sprint 3 (Weeks 5–6):** Event card and coupon card generation in Studio. Google Business Profile post generation. Scheduling engine and calendar UI. Connected account OAuth for X and Google Business.

**Sprint 4 (Weeks 7–8):** Content calendar generation. CSSN Performance Report UI. Account Manager integration for CSSN and Studio signals. LinkedIn and Pinterest OAuth. Studio Subscription billing.

**Sprint 5 (Weeks 9–10):** Auto-replenishment. CSSN approval workflow (require_approval_before_post). Content queue management UI. Medium article generation. Campaign mode for CSSN. Full QA and Florida pilot launch.

---

*For product packaging and pricing, see: FIBONACCO-CSSN-ADDON-PRODUCT.md*
*For market context, see: FIBONACCO-SOCIAL-STUDIO-MARKET-VIABILITY.md*
