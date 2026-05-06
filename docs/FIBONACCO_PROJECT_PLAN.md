# Fibonacco / Day.News — Company Project Plan
*April 2026*

---

## Strategic Premise

All communities, businesses, governments, schools, law enforcement, and organizations are already in the database. Discovery cost is already paid. The remaining cost to produce content nationally is AI processing of HTML — no SerpAPI, no ScrapingBee. This changes the economics entirely and accelerates the national launch timeline from months to weeks.

Revenue is available before we have a single paying SMB subscriber: programmatic ads on Day.News content + NewsBreak syndication. Both require volume. Volume is now achievable immediately.

---

## Phase 1 — National Soft Launch
**Goal:** Every community in America has a live Day.News page with real content.
**Timeline:** 1–2 weeks after BNDE P0 fixes are confirmed.

### What goes live immediately
- National and regional news filtered to each community
- Columnist content
- Business directory listings already in the database
- Local podcasts where they exist
- Government and law enforcement entities already linked

### What does not go live yet
- Locally sourced news articles (per community)
- Classifieds, notices, photos (built out over time)
- SMB paid features
- DTG rich business listings (requires business wave — Phase 2)
- GEC full business event inventory (requires business wave — Phase 2)

### GEC at Phase 1 launch
GoEventCity goes live with base event inventory sourced from entities already in the database: government (public meetings, civic events), schools (sports, performances, board meetings), churches and nonprofits (community events, fundraisers). This is enough to populate GEC with real events in every community before a single business is scanned. Supplement with third-party event data providers (Eventbrite API, Ticketmaster Discovery API, PredictHQ) as bridge inventory — configurable per community, easy to turn off as local data grows.

### DTG at Phase 1 launch
DowntownGuide launches with directory listings from businesses already in the database. No rich enrichment yet (no hours, photos, menus) — that comes in Phase 2. Basic name, category, address, and website is enough for a functional directory and enough for Google to index the listings.

### Actions required
- Audit community activation flags — confirm all 9,000+ communities can be set active without triggering the discovery pipeline
- Confirm national/regional content is routing correctly to all communities
- Ensure article titles and meta descriptions are SEO-optimized at generation time (civic content specifically)
- Implement Google AdSense or Google Ad Manager placement across article pages
- Enable UGC: user-submitted articles, classifieds, notices (AI moderation gate, no human review required at launch)

---

## Phase 2 — Entity-Type Source Rollout (National, Sequential)
**Goal:** Produce locally sourced content for every community in America as fast as possible, lowest cost first.
**Timeline:** Begins immediately after Phase 1. Runs in parallel with it.

### Rollout sequence

**Wave 1 — Government & Law Enforcement**
- Highest content frequency, most predictable URL patterns, lowest AI processing cost
- Many already integrate with Nixle, CivicPlus, Granicus, Legistar — LEPSIS vendor integrations accelerate this
- Pattern-match .gov and police department URLs before spending AI tokens
- This wave produces immediately indexable, search-captured civic content in every community

**Wave 2 — Schools & Nonprofits**
- Board minutes, events, sports, community announcements
- High engagement content, strong local identity signal

**Wave 3 — Businesses**
- Noisiest category, most variable source quality
- By this wave, Day.News already has content authority and traffic — SMB outreach becomes easier
- Business scan unlocks DTG rich listings: hours, photos, menus, editorial summaries
- Business scan unlocks GEC full event inventory: venue records, business-hosted events, promotions
- Third-party event provider data (Eventbrite, Ticketmaster, PredictHQ) deprioritized per community as local business events come online

### Cost model
- Cost per entity = AI tokens to process HTML dump for source identification + ongoing article generation
- Pull per-entity cost from Florida data (available Monday/Tuesday) and multiply by national entity count per wave
- This becomes the budget for each wave before it starts

---

## Phase 3 — Breaking News Activation (BNDE)
**Goal:** Day.News is first to index on local breaking stories nationally.
**Timeline:** P0 code fixes are the critical path. Target: complete before or concurrent with Phase 1 launch.

### P0 blockers (code — addressed in code plan)
- `DispatchMonitorService::pollAllSources()` reads from config instead of querying `DispatchSource::dueForPoll()`
- `CompetitiveIntelligenceService` has the same gap

### Why this matters at national scale
- Breaking police and public safety stories generate the highest search traffic spikes
- Local TV and print cannot match AI-speed indexing at this volume
- First-indexed = owns the search result for that story, often permanently

---

## Phase 4 — Revenue Activation
**Goal:** Generate measurable revenue before SMB subscription sales begin.

### Stream 1 — Programmatic Advertising
- Implement Google Ad Manager (preferred over AdSense — more control, supports direct-sold inventory later)
- Maximum 3 ads per page, no auto-play, no sticky bars — existing anti-intrusive rules hold
- CPM on civic content will be modest ($1–3 RPM initially) but volume compensates
- Revenue scales directly with traffic, which scales with content volume and SEO

### Stream 2 — NewsBreak Syndication
- Publish to Day.News first
- 24-hour delay, then syndicate to NewsBreak
- Day.News is canonical source — protects SEO equity
- NewsBreak pays CPM on local civic content — hyperlocal police/government is exactly their inventory gap
- Make syndication delay configurable per partner in the publishing pipeline

### Stream 3 — SMB Subscriptions (Phase 5)
- Begins after content authority is established in a community
- Warm leads: businesses already in the directory who are getting editorial mentions
- Sales motion: show them their profile views and article appearances, offer paid upgrade

---

## Phase 5 — SMB Activation & AlphaSite
**Goal:** Convert directory listings to paying subscribers.
**Timeline:** Begins community by community as content volume establishes credibility.

- Sarah AI begins outreach to businesses already receiving editorial mentions
- Founder pricing offered during initial activation window
- Loyalty, coupons, memberships, tickets activated per community as SMBs convert
- Command Center CRM tracks pipeline per community

---

## Phase 6 — Gen 3 White Label
**Goal:** License the platform to universities, associations, corporations.
**Timeline:** After national content pipeline is stable and SMB model is proven in at least 3 markets.

- Platform is already built — this is a sales and packaging exercise
- Starter tier ($299/mo) as the entry point for smaller organizations
- Revenue share on network ads; organizations keep nearly all ticket and membership revenue

---

## Key Dependencies & Risks

| Item | Risk | Mitigation |
|---|---|---|
| BNDE P0 fixes | Breaking news doesn't work until resolved | Top of code queue |
| Per-entity AI cost (Florida data) | Unknown until Monday/Tuesday | Don't commit wave budgets until confirmed |
| NewsBreak publisher terms | AI content policy unclear | Review terms before producing at scale |
| Thin community pages and SEO | Google may deprioritize low-content pages | Ensure national + business content is surfacing correctly before indexing opens |
| UGC moderation at scale | Classifieds/notices without review | AI moderation gate required before enabling |

---

## Immediate Next Actions (This Week)

1. Fix BNDE P0 blockers — code plan to follow
2. Pull per-entity AI cost from Florida pipeline runs
3. Audit community activation flags for safe national flip
4. Confirm Google Ad Manager implementation path
5. Review NewsBreak publisher terms
6. Define SEO prompt requirements for civic content article generation
