# Sarah Pitch Engine — Master Specification Package
## All Specs Combined | Fibonacco / Just1Hug

> **What this is:** Complete specification for building the Sarah Pitch Engine — a gate-based, AI-guided sales and enrollment flow for Fibonacco community media platform. Includes the pitch conversation system, CRM enrichment pipeline, and all UI components.
>
> **What is already built:** The backend Laravel/Inertia platform (CC repo) has: Customer, SMB, Conversation, OutboundCampaign, CommunitySlotInventory models, Stripe integration, Postal email, and 200+ existing API endpoints. The pitch engine builds on top of this — it does not replace it.
>
> **What needs to be built:** Everything in this document. No pitch UI exists yet. Start from scratch.

---

# DOCUMENT INDEX

| # | Document | Purpose | Agent |
|---|---|---|---|
| 1 | Pitch Method | The conversation logic, gates, scripting rules | Reference |
| 2 | Pitch Engine Spec | Backend architecture, DB schema, gate system, analytics | Backend Agent |
| 3 | CRM Enrichment Spec | How pitch data flows into existing CRM, re-engagement | Backend Agent |
| 4 | Pitch UI Spec | Screen-by-screen design and content for all screens | All UI Agents |
| 5 | UI Cursor Briefs | Exact Cursor agent prompts for building every component | UI Agents 1–4 |
| 6 | Campaign Builder Spec | Existing Sarah checkout/proposal spec (already written) | Reference |

---

---

# PART 1 — PITCH METHOD (Sales Conversation Logic)

# Fibonacco Sales Pitch Method
## Scripted Conversation Framework with Qualification Gates

> **Design principle:** This is a consistency system, not a freestyle conversation guide. Every gate has a scripted opener, a scripted education block, and a scripted close. Sarah adapts tone — not content. The goal is a repeatable, measurable pitch where every deviation is tracked and every outcome is recorded.

---

## ANALYTICS & MEASUREMENT FRAMEWORK

*Every step is a trackable event. Sarah logs outcomes in real time.*

### What Gets Measured

| Event | What's Logged |
|---|---|
| Pitch started | Business ID, category, community, date/time, channel |
| Discovery completed | Goals stated, current marketing spend, customer source answers |
| Territory offer made | Communities offered, communities accepted, communities declined |
| Gate reached | Gate name, date/time |
| Gate permission granted | Yes / No / "Tell me more first" |
| Gate permission denied | Gate name — queued for future pitch |
| Product presented | Product name, gate it belongs to |
| Product accepted (added to proposal) | Product name, price |
| Product declined | Product name, stated reason if given |
| Product deferred | Product name — queued for follow-up pitch |
| Proposal presented | Full itemized proposal, total MRR |
| Proposal accepted | Package + add-ons, MRR, communities, term |
| Proposal declined | Stated reason, follow-up scheduled Y/N |
| Proposal partially accepted | What was accepted, what was deferred |
| Pitch abandoned | Last step reached, reason if stated |
| Follow-up pitch scheduled | Date, gate(s) queued |

### Abandonment Tracking

Sarah records the exact step where a business disengages. This is the primary optimization signal. High abandonment at a specific gate = that gate's script needs review. High abandonment at proposal = pricing or proposal structure issue.

### Deferred Gate Queue

When a business declines a gate or a product, it is not permanently closed. Sarah logs it as **Deferred** with a recommended retry window:

| Deferral Type | Retry Window |
|---|---|
| "Not right now" on a gate | 30 days |
| "We don't do events yet" | 60 days (check if business launched events) |
| "Budget isn't there" | 45 days |
| "We already have a website" | 90 days (re-qualify on AI-readiness) |
| "I need to think about it" | 7 days |
| Full pitch declined | 60 days |

Deferred gates are surfaced automatically in the next outreach sequence with a modified opener referencing the prior conversation.

---

## PHASE 1 — PRE-CALL INTELLIGENCE

Sarah loads the following before any conversation begins. She does not ask for information she already has.

**Loaded from Overture + website scan:**
- Business name, category, address
- Walk-in vs. appointment vs. service-call model
- Events presence (hosts events? listed anywhere?)
- Website status (exists, quality, last updated)
- Social media presence and activity level
- Current advertising signals (Google, Facebook, Yelp listings detected)

**Org type classification determines pitch track:**

| Classification | Pitch Track |
|---|---|
| SMB — retail, food, personal services | Standard track |
| SMB — professional services | Expert/GoLocalVoices emphasis |
| SMB — home services / trades | Day.News + AlphaSite only, no events |
| Venue | Event Gate + Venue sub-gate |
| Performer / artist / entertainer | Performer track |
| School / educational org | Civic track |
| Non-profit | Civic track |
| Government / municipality | Civic track |

---

## PHASE 2 — DISCOVERY
*Three questions. Then listen.*

### Scripted opener:

> *"[Name], thanks for taking a few minutes. I want to make sure this conversation is actually useful for you, so before I show you anything — let me ask you three quick questions."*

### The three questions (always in this order):

**Q1:** *"What's the main thing you're trying to accomplish for the business right now — is it bringing in new customers, getting existing ones back more often, or something else?"*

**Q2:** *"Where are most of your customers coming from today — word of mouth, online, foot traffic, referrals?"*

**Q3:** *"Are you spending money on any marketing right now, and if so, is it working the way you'd want it to?"*

> **Log:** Goal stated, customer source, current marketing spend and satisfaction level.

*Let them talk. Follow up naturally on anything specific they mention — an event series, a slow season, a competitor, a recent hire. These become anchors for the proposal. Do not ask more than one follow-up per question.*

---

## PHASE 3 — TERRITORY & COMPETITIVE FRAMING
*Sets the stakes before any product is introduced.*

### Scripted territory opener:

> *"Before I walk you through what we've built in [Community] — one quick question. How far does your business actually reach? Are you focused on [City], or do customers come from [Nearby City] or [County] as well?"*

*[Let them answer. Use the answer to set the territory frame.]*

> *"I ask because we're operating in [X] communities across [County] right now. You can lock your position in just [Community], or across multiple communities — we'll figure out what makes sense for you. But I want you to understand the full picture before we decide."*

### Broad-to-narrow anchor:

> *"If you wanted to cover your entire market — every community in [County] where your customers live — that's [X] communities. That's the full picture. Most businesses start with their home community and maybe one or two nearby and grow from there. But here's the thing — the positions we're talking about are limited and permanent. Whoever holds a category position holds it. A competitor who waits loses access to it. So the footprint decision matters."*

> *"Let's figure out the right starting point for you, and you can always expand."*

> **Log:** Communities offered, response, communities included in proposal.

### Competitive position plant — scripted, said once:

> *"One thing I want you to understand about how this works before we go further: on every platform we operate, there are limited positions per category per community. When a business holds one of those positions, no competitor in the same category can hold the same position. It's not like a Google ad where anyone can outbid you. When you have the spot, you have it."*

> *"I'll tell you exactly where your category stands in [Community] as we go."*

---

## PHASE 4 — THE BASELINE (Always Delivered)

### Scripted baseline statement:

> *"Here's where things stand today. Every business in [Community] has a basic listing across our platforms — Day.News, the Downtown Guide, and our business hub. That listing has your name, your category, your phone number, and your address. It exists. It's not nothing, but it's the floor — it's what everyone has."*

> *"What we're talking about today is whether your listing works for you, or whether it just sits there while other businesses in your category show up above you."*

---

## PHASE 5 — GATE SEQUENCE

### How gates work:

1. Sarah identifies which gates are relevant based on discovery answers and org type.
2. Before opening each gate, Sarah asks permission using the scripted gate opener.
3. If permission is granted, she delivers the scripted education block, then the scripted product presentation.
4. If permission is denied, she logs the deferral and moves to the next relevant gate.
5. Gates are presented in priority order for the business type — never all at once.

---

### 🚪 GATE: DAY.NEWS PREMIUM
**Relevant for:** All business types. Always first.

**Permission ask:**
> *"Can I take just a minute to show you what the difference looks like between a basic listing and a premium one — specifically what it means for how often your business gets seen?"*

**Education block (scripted):**
> *"[Community] has a daily news publication — ten articles published every morning, a newsletter that goes to [X] subscribers, social accounts that post throughout the day. Every business with a basic listing is in the directory. But businesses with a Premium Listing are the ones that get featured in articles, show up in the newsletter, and appear at the top of directory searches — not buried."*

> *"There's also one Headliner position per category. That's the top card — the first business someone sees every single time they search or browse [their category] in [Community]. [Check live.] [State result: available or held by whom.]"*

**What they get — Community Influencer ($300/mo):**

| Item | What It Does |
|---|---|
| Premium listing — photos, full description, verified badge | Shows up as a complete, credible business — not a placeholder |
| Priority sort position | Above all non-priority listings in directory search |
| 1 article per month | Published in the news feed, delivered in that day's newsletter, indexed permanently |
| 5 announcements per month | Promotions, news, events — published directly to the community feed |
| 5 classified listings per month | Jobs, services, items — distributed in the daily feed |
| 25% discount on all advertising | Reduced rate on any display, newsletter, or email ads they add |

**Scripted close:**
> *"That's your foundation. One article a month means your business is in the news every month. Priority position means you're above the businesses that don't have it. And if the Headliner in [category] is still available — that's one position, permanently yours while you're enrolled. [Confirm status and make the connection to their stated goal.]*"

> **Log:** Gate reached, permission granted/denied, products accepted/declined/deferred.

---

### 🚪 GATE: DOWNTOWN GUIDE
**Relevant for:** Physical storefronts, restaurants, retail, walk-in services.
**Not for:** Home-based, online-only, tradespeople, professional services.

**Permission ask:**
> *"You have a physical location, which opens up something worth understanding. Can I show you how the Downtown Guide works and what it can do for foot traffic and local discovery?"*

**Education block (scripted):**
> *"The Downtown Guide is where people in [Community] go to find local businesses — places to eat, shop, get services. It's a full business directory with photos, menus, hours, coupons, and reviews. Think of it as the community's local search engine. When someone new to [Community] — or a longtime resident looking for something — searches [their category], the businesses with complete, premium profiles show up at the top. Basic listings show up below them."*

> *"Same structure as the news directory — one Headliner per category. [Check live. State result.]"*

**What they get — included in Community Influencer:**

| Item | What It Does |
|---|---|
| Full photo gallery (up to 20 photos, video) | A complete visual profile — not just a name and number |
| Extended description, menu or service list | Tell the full story of the business |
| Verified badge | Visible trust signal in search results |
| Priority sort position | Above non-premium listings in category browse |
| Coupons (base allotment) | Digital deals with trackable redemptions |
| Achievement badges | Earned through community activity — displayed on profile |
| Analytics | Views, coupon clicks, profile interactions |

**Scripted close:**
> *"When someone searches [their category] in [Community], what you want is to be the listing that looks complete and shows up near the top. That's what this does."*

**Add-ons — introduce only if applicable:**

- **Headliner** ($75–300/mo): *"If the Headliner in [category] is available, that's the top position — first card, every search. [State availability.] This is the one product in this category that's permanent — whoever holds it, holds it."*
- **Poll Participation — Featured ($49) or Premium ($149)**: *"Community's Choice polls run regularly. At the Featured level, you have a photo and an offer in the poll. At Premium, you're highlighted at the top. These get shared heavily — it's community engagement that looks like news, not like an ad."*

> **Log:** Gate reached, permission granted/denied, products accepted/declined/deferred.

---

### 🚪 GATE: EVENT GATE — BUSINESS HOST
**Relevant for:** Restaurants, bars, breweries, retail, fitness, studios, community spaces — any business that hosts or could host events, classes, tastings, workshops.
**Not for:** Tradespeople, accountants, attorneys, insurance, home services.

**Permission ask:**
> *"Here's something that I think can really drive traffic for a business like yours — promoting events properly. Even if you're not running big events right now, this is worth understanding. Can I give you a minute on how it works and how other [business type] businesses are using it?"*

**Education block (scripted):**
> *"GoEventCity is [Community]'s event calendar — it's where residents go to find out what's happening this weekend. On a busy week there might be 30 or 40 events listed. The ones that get attended are the ones that get seen. Every event has a listing, but listings aren't equal — there's a Headliner position per event category, Priority Events that float to the top of the calendar, and then everything else."*

> *"When you post an event with a premium listing, it's also cross-posted into the Day.News morning feed and newsletter automatically — so your event reaches the full subscriber base, not just the people who happen to check the calendar. And registered attendees get an automated reminder before the event."*

**What they get — included in Community Influencer:**

| Item | What It Does |
|---|---|
| 1 premium event per month | Full listing — photos, description, all details — priority placed |
| Priority event position | Floats above non-priority events in calendar browse |
| Cross-post to Day.News (automatic) | Event published in morning news feed and newsletter |
| Automated reminder to registrants | Sent before the event — no manual follow-up needed |
| Social distribution | Event posted to community social accounts |

**Scripted close:**
> *"You said [their goal — e.g., you want more foot traffic, you want to grow awareness]. Running even one promoted event a month and having it in the news, the newsletter, and the calendar means [Community] knows you're active. That's different from a static listing that just sits there."*

**Add-ons — introduce only if applicable:**

- **Event Headliner** ($75–300/mo): *"One Event Headliner per category. First card every time someone browses [event type] in [Community]. [State availability.]"*
- **Ticket Sales** (1–5% commission): *"If you charge admission, this puts ticket sales online — advance purchase, promo codes, known headcount before the door opens. Commission is lower than most ticketing services."*
- **"Since You're Going To..."** ($25–100/event): *"After someone registers for your event, they get a follow-up — other things happening nearby, a dinner suggestion, nearby experiences. It makes the attendee experience better and puts your event in front of them a second time."*
- **Calendar Subscription** ($19–49/mo): *"Customers who love what you do can subscribe to your calendar. Every time you add an event, they're notified automatically — they don't have to follow you on social or remember to check."*

> **Log:** Gate reached, permission granted/denied, products accepted/declined/deferred.

---

### 🚪 GATE: VENUE GATE
**Relevant for:** Event spaces, banquet halls, bars with private rooms, outdoor spaces available for booking — businesses whose physical space IS a product people rent or book.

**Permission ask:**
> *"Your space is something people can rent — private events, parties, corporate functions. There's a specific way we handle venues that's different from a regular business listing. Can I walk you through it?"*

**Education block (scripted):**
> *"GoEventCity has a dedicated venue directory — separate from the event calendar. When someone in [Community] is looking for a place to host a private event, this is where they search. It has its own Headliner — the top venue in each category — and its own search results. You want to show up there with a complete profile, photos, capacity, and availability."*

**What they get:**

| Item | What It Does |
|---|---|
| Premium venue listing | Full profile — photos, capacity, amenities, rental info |
| Venue Headliner (one per venue category) | First result when someone searches for a venue to book |
| Priority venue position | Elevated above non-premium venue listings |

**Add-ons:**

- **Venue Booking System** ($49/mo + commission): *"Inquiries for private events can be handled online — they check your availability, pick a date, put down a deposit. No phone tag, no missed leads after hours."*

> **Log:** Gate reached, permission granted/denied, products accepted/declined/deferred.

---

### 🚪 GATE: PERFORMER GATE
**Relevant for:** Musicians, bands, DJs, comedians, entertainers, speakers, artists available for booking.

**Permission ask:**
> *"GoEventCity has a performer directory that venues use when they're booking talent. If you want venues in [Community] finding you — instead of the other way around — can I show you how that works?"*

**Education block (scripted):**
> *"Venues looking to book entertainment in [Community] search the performer directory. It's organized by category — bands, DJs, comedians, speakers — and each category has a Headliner. The Headliner is the first performer venues see when they search. Below that, Priority Listings. Below that, basic listings."*

> *"Separately, fans can subscribe to your calendar — they get notified every time you add a new date without you having to post everywhere and hope they see it."*

**What they get:**

| Item | What It Does |
|---|---|
| Premium performer listing | Full profile — bio, photos, video, genre, availability info |
| Performer Headliner (one per category) | First result venues see when searching for talent to book |
| Priority performer position | Elevated above non-premium performers in search |
| Cross-post to Day.News | Performances appear in the community news feed and newsletter |

**Add-ons:**

- **Performer Booking System** ($49/mo + commission): *"Venues can book you directly — they see your availability, agree to terms, confirm. No back-and-forth email chains."*
- **Calendar Subscription** ($19–49/mo): *"Fans subscribe once and get notified every time you add a date. Your audience stays connected without relying on social algorithms."*

> **Log:** Gate reached, permission granted/denied, products accepted/declined/deferred.

---

### 🚪 GATE: GOLOCALVOICES — EXPERT COLUMN
**Relevant for:** Attorneys, financial advisors, healthcare professionals, fitness coaches, nutritionists, educators, therapists, chefs, any professional whose credibility drives the client relationship.

**Permission ask:**
> *"What you do is a little different from most businesses — people have to trust you before they hire you. There's a way to build that in [Community] that isn't advertising. Can I take a minute to show you?"*

**Education block (scripted):**
> *"GoLocalVoices is where [Community]'s experts publish. Not ads — columns. Regular content under your name about [their field]. People who are interested in [topic] read it. When they need someone in that space, you're the name they already know. It's presence that converts because it's based on trust, not exposure."*

> *"There's one Headline Spot per expertise category. The [attorney / advisor / coach] who holds that spot is the one whose column runs in the community news. No other [professional type] in [Community] can hold the same position."*

**What they get:**

| Item | What It Does |
|---|---|
| Headline Spot in expertise category | Named column published regularly — visible in GoLocalVoices and Day.News feed |
| Category exclusivity (Expert upgrade) | No other professional in that category can hold a Headline Spot simultaneously |
| Cross-post to Day.News | Their content reaches the full subscriber base, not just GLV readers |

**Add-ons:**
- **Community Expert upgrade** (+$100/mo, $400 total): Adds category exclusivity to the base Influencer package. *"This means while you hold the spot, no other [their profession] in [Community] can."*

> **Log:** Gate reached, permission granted/denied, products accepted/declined/deferred.

---

### 🚪 GATE: CIVIC TRACK — SCHOOLS, NON-PROFITS, GOVERNMENTS
**Relevant for:** Schools, PTAs, churches, non-profits, civic organizations, local government offices, municipalities.

> *Note: This track does not lead to a Community Influencer pitch. The frame is community participation and communication, not advertising. Upsell paths exist but are introduced only after the base relationship is established.*

**Permission ask:**
> *"[Organization name] is a part of [Community] in a way that's different from a business — you're here to serve the community, not to sell to it. We built something specifically for organizations like yours. Can I show you how it works?"*

**Education block (scripted):**
> *"Every community organization — schools, non-profits, government offices — has a place on our platforms at no cost. Your events are in the calendar, your announcements reach residents, and your information is in the directory. We want [Community] residents to know what's happening with the organizations that serve them."*

> *"What we've found is that organizations that use the platform actively — posting events, publishing announcements, keeping their information current — become a natural part of the daily community conversation. Residents follow what you're doing. Attendance goes up. Community awareness goes up."*

**Base participation (no cost or reduced cost for civic orgs):**

| Item | What It Does |
|---|---|
| Directory listing — all platforms | Organization is visible and findable in the community |
| Event listings | Events appear in the GoEventCity calendar |
| Announcements | Published to the community feed — reaching residents directly |
| Cross-post to Day.News | Major events and announcements appear in the news and newsletter |

**Upsell path (introduce only after base relationship is active):**

- **Premium Event Listing / Priority Position**: *"When you have a major fundraiser, a community meeting, a graduation — a premium listing makes sure it doesn't get buried under other events. Priority position means it's near the top of the calendar."*
- **Event Headliner** (for major annual events): *"For your biggest event of the year, the Headliner position in [event category] means it's the first thing anyone sees when they open the calendar."*
- **Newsletter inclusion**: *"Your announcements can go directly in the daily newsletter — reaching every subscriber in [Community]."*
- **GoLocalVoices column**: *"If your superintendent, executive director, or elected official wants a regular community column — a place to speak to residents directly — GoLocalVoices is the right venue for that."*

> **Log:** Org type, gate reached, base participation accepted/declined, upsell items presented/accepted/declined/deferred.

---

### 🚪 GATE: ALPHASITE — DIGITAL PRESENCE
**Relevant for:** Any business where the website is outdated, missing, or not optimized for how customers search today.
**Qualifying question:** Asked before opening the gate.

**Permission ask:**
> *"Quick question before I move on — has your website been updated recently? Specifically: if someone searches for a [their service] in [Community] right now, does your business come up?"*

*[Let them answer. If no, or unsure, or "we have a website but..." — open the gate.]*

> *"That's worth spending thirty seconds on. Can I show you what the gap is and how we close it?"*

**Education block (scripted):**
> *"The way people find local businesses has changed significantly in the last couple of years. Searching for a local service now often produces a direct answer — not just a list of websites. The businesses that show up in those answers are the ones with complete, current, well-structured online profiles. If your site is old or incomplete, you're simply not in those results."*

> *"AlphaSite gives you a complete, current business profile that's connected to every platform we operate — so your information is consistent everywhere and structured the way search systems want to read it. One place to keep everything current."*

**What they get:**

| Item | What It Does |
|---|---|
| Complete business profile | Current, accurate, consistent across all platforms |
| Priority listing in AlphaSite directory | Elevated above basic profiles in AlphaSite search |
| Connected to Day.News, DTG, GEC | One update, reflected everywhere |
| Community Ad placement | Visibility in the AlphaSite community feed |

**Add-ons — introduce if intake volume is significant:**

> *"One more thing worth asking — how much of your day involves answering the same questions from customers? Hours, services, pricing, availability?"*

*[If significant:]*

> *"We have a service that handles inbound customer questions automatically — 24 hours a day, including weekends. It knows your business, your hours, your services. Customers get answers immediately instead of waiting for a callback. It's not replacing your staff — it frees them up for the work that actually needs a person."*

- **Automated Customer Response** (phone, email, or chat — tiered pricing): Handles inbound questions, appointment requests, and basic customer service automatically.

> **Note:** Do not use the word "AI" or describe the technology. Frame it entirely around the outcome — customers get answers faster, staff handles less repetitive work.

> **Log:** Gate reached, qualifying question answer, gate permission granted/denied, products accepted/declined/deferred.

---

## PHASE 6 — THE PROPOSAL

### Mirror back discovery first — always:

> *"Let me make sure I've got this right before I put a number to it."*

> *"You told me [their primary goal]. Your customers mostly come from [their answer]. You're [spending / not spending] on marketing right now and [it's working / it isn't producing what you'd want]. Does that sound right?"*

*[Get confirmation.]*

> *"Here's what I'd put together for you."*

### Walk the package line by line — connect each item to their stated goal:

> *"You get a premium listing across [relevant platforms]. Priority position on all of them — above the businesses that don't have it."*

> *"One article a month. The day it publishes, it goes to every subscriber in the morning newsletter and lives on the site permanently."* [If events:] *"One premium event a month — priority placed in the calendar and cross-posted into the morning news automatically."*

> *"Five announcements a month — anything you want [Community] to know, published directly."*

> *"And a discount on any advertising you want to add later."*

> *"That's everything in one package at $300/month. That's your foundation."*

### Add-ons — maximum 3, each tied to their words:

> *"There are [1/2] things I'd add specifically for your situation."*

For each add-on:
> *"You mentioned [their exact words or stated goal]. [Product name] does that — [one sentence on the mechanism]. That's [price]/month."*

### State the total:

> *"So that's $300 for the package, plus [add-ons]. Total is [X]/month, locked at the founder rate for three years."*

---

## PHASE 7 — CLOSE

### Slot status — live, specific:

> *"Your category — [category] — has [X] total positions in [Community]. [Y] are held. [Z] are open. When those are gone, no other [category] business can hold a Community Influencer position here."*

### Founder rate — the deadline, stated plainly:

> *"The $300/month rate is locked for three years for businesses that enroll within the first 90 days of [Community]'s launch. You have [X] days left in that window."*

### The ask — direct:

> *"Do you want to lock in your position?"*

**If hesitation:**
> *"What question do you have that would help you decide?"*

**If they decline today but aren't opposed:**
> *"That's fine — I'll follow up in a few days. Is there a specific concern I should think about between now and then, or are you just not ready to commit today?"*

> **Log:** Close attempted, outcome (accepted / declined / deferred / follow-up scheduled), reason stated, follow-up date if applicable.

---

## PITCH FLOW — QUICK REFERENCE

```
PHASE 1: Pre-call intelligence loaded
    ↓
PHASE 2: Discovery — 3 questions
    ↓
PHASE 3: Territory & competitive framing
    ↓
PHASE 4: Baseline established
    ↓
PHASE 5: Gates (in order, permission-first)
    │
    ├── Day.News Premium (always first)
    ├── Downtown Guide (physical locations)
    ├── Event Gate — Business Host (event-eligible businesses)
    ├── Venue Gate (if space is rentable)
    ├── Performer Gate (if they perform)
    ├── GoLocalVoices — Expert (professionals, thought leaders)
    ├── Civic Track (schools, non-profits, government)
    └── AlphaSite (website gap — almost always)
    ↓
PHASE 6: Proposal (mirror → package → add-ons → total)
    ↓
PHASE 7: Close
```

---

## GATE MEASUREMENT SUMMARY

| Gate | Key Metric | Secondary Metric |
|---|---|---|
| Day.News Premium | Permission rate | Headliner conversion rate |
| Downtown Guide | Permission rate | Coupon add-on attach rate |
| Event Gate | Permission rate | Ticket Sales attach rate |
| Venue Gate | Permission rate | Booking System attach rate |
| Performer Gate | Permission rate | Booking System attach rate |
| GoLocalVoices | Permission rate | Expert upgrade attach rate |
| Civic Track | Participation rate | Upsell conversion rate |
| AlphaSite | Qualifying question trigger rate | Automated response attach rate |
| Overall | Pitch completion rate | Close rate, MRR per closed pitch |

---

## SCRIPTING STANDARDS

1. **No improvisation on gate openers or education blocks.** Tone adjusts. Words do not.
2. **No AI terminology.** Never say "AI," "machine learning," "algorithm," or "automated." Describe outcomes only: "customers get answers faster," "events appear automatically," "your listing stays current."
3. **Permission before every gate.** No exceptions. Log the answer.
4. **Three discovery questions. Not four.**
5. **Territory goes county or state first. Never anchor to just their community.**
6. **Lockout framing said once in Phase 3. Referenced at gates naturally — never repeated verbatim.**
7. **Maximum 3 add-ons per proposal.** Multi-system businesses (venue + performer) may have 4. Flag it.
8. **Every add-on is tied to something the business said.** If it can't be tied, don't pitch it.
9. **Proposal before pricing.** They understand what they're getting before they see a number.
10. **Close with a question. Follow hesitation with a question. Never with patience.**
11. **Every gate declined is deferred, not closed.** Log it and queue the retry.
12. **Civic track does not use advertising language.** Frame everything as community participation and communication.

---

# PART 2 — PITCH ENGINE SPEC (Backend Architecture)

# Sarah Pitch Engine — Build Specification
## Extending SARAH_CAMPAIGN_BUILDER_SPEC.md with the Full Gate-Based Pitch System

> **Read first:** `SARAH_CAMPAIGN_BUILDER_SPEC.md` covers the proposal/checkout/fulfillment layer. This document covers everything upstream: the pitch conversation, gate system, slot inventory, fast-path navigation, profile save/resume, and re-engagement. Build these two specs together as one system.

---

## WHAT THIS BUILDS

A structured, scripted, gate-based pitch conversation that:

- Knows the business and community before the first word
- Collects a saved business profile before any pitch begins
- Presents gates in a logical sequence, asking permission before each one
- Shows real-time slot inventory ("3 of 5 spots left in Restaurants")
- Detects entry point (GEC, GLV, DTG, Day.News) and skips ahead to the relevant gate
- Lets experienced users fast-path to specific gates
- Saves progress so an incomplete session can be resumed or re-pitched
- Fires re-engagement messages referencing exactly where the session left off
- Logs every event for pitch performance analytics

---

## ARCHITECTURE OVERVIEW

```
Entry Points (any platform page, any CTA)
        ↓
[PitchEngine] — session manager, gate router, analytics emitter
        ↓
[BusinessProfileStep] — identify, claim, create profile
        ↓
[DiscoveryStep] — 3 questions, goal/source/spend captured
        ↓
[TerritoryStep] — community scope, competitive framing
        ↓
[GateSequencer] — determines gate order, manages permissions
        ↓
[Gate Components] — one per gate type, scripted content
        ↓
[SlotInventoryService] — real-time slot data per community
        ↓
[ProposalBuilder] — builds from gate outputs (→ existing Sarah spec)
        ↓
[SessionPersistence] — save/resume/re-engage
        ↓
[PitchAnalytics] — event log at every step
```

---

## DATABASE SCHEMA

### `pitch_sessions`

The master session record. One per conversation attempt.

```php
Schema::create('pitch_sessions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('business_id')->nullable();            // null until profile created
    $table->uuid('user_id')->nullable();               // null until account created
    $table->uuid('community_id');                       // always known (from entry point)
    $table->string('entry_platform');                  // day_news | gec | dtg | glv | alphasite | direct
    $table->string('entry_context')->nullable();        // article_id, event_id, etc.
    $table->string('org_type')->nullable();             // smb | venue | performer | school | nonprofit | government
    $table->string('pitch_track')->nullable();          // standard | professional | trades | venue | performer | civic
    $table->string('status');                          // started | profiled | discovering | pitching | proposed | converted | abandoned | deferred
    $table->string('last_step');                       // last completed step key
    $table->json('discovery_answers')->nullable();      // goal, customer_source, marketing_spend
    $table->json('territory_selection')->nullable();    // community_ids chosen
    $table->json('gates_offered')->nullable();          // array of gate keys in sequence order
    $table->json('gates_completed')->nullable();        // gates where permission was granted and shown
    $table->json('gates_deferred')->nullable();         // gates declined with retry_after date
    $table->json('products_accepted')->nullable();      // product keys + prices
    $table->json('products_declined')->nullable();      // product keys + stated reason
    $table->json('products_deferred')->nullable();      // product keys + retry_after date
    $table->uuid('proposal_id')->nullable();            // FK to campaigns table when proposal built
    $table->timestamp('last_active_at')->nullable();
    $table->timestamp('resume_reminded_at')->nullable();
    $table->timestamp('abandoned_at')->nullable();
    $table->timestamps();
});
```

### `business_pitch_profiles`

The business profile built during the pitch — persists across sessions. This is the "investment before they buy" layer.

```php
Schema::create('business_pitch_profiles', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('business_id');
    $table->uuid('user_id')->nullable();
    $table->string('contact_name');
    $table->string('contact_email');
    $table->string('contact_phone')->nullable();
    $table->string('business_name');
    $table->string('category');                        // from Overture / user confirmed
    $table->string('org_type');                        // smb | venue | performer | school | nonprofit | government
    $table->string('pitch_track');
    $table->json('goals')->nullable();                 // stated goals from discovery
    $table->json('customer_sources')->nullable();      // how they get customers today
    $table->string('marketing_spend_range')->nullable(); // none | under_100 | 100_300 | 300_600 | 600_plus
    $table->json('communities_of_interest')->nullable(); // community_ids they expressed interest in
    $table->boolean('has_events')->default(false);
    $table->boolean('has_venue')->default(false);
    $table->boolean('is_performer')->default(false);
    $table->boolean('website_exists')->default(false);
    $table->boolean('website_ai_ready')->nullable();   // null = not asked yet
    $table->json('preferred_gates')->nullable();        // gates they've shown interest in
    $table->json('rejected_gates')->nullable();         // gates explicitly declined
    $table->timestamps();
    $table->index('business_id');
    $table->index('user_id');
});
```

### `community_slot_inventory`

Real-time slot availability per community per category. This is what powers the "X of Y spots left" display.

```php
Schema::create('community_slot_inventory', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('community_id');
    $table->string('platform');                        // day_news | dtg | gec | glv | alphasite
    $table->string('slot_type');                       // influencer | headliner | section_sponsor | expert_column | event_headliner | venue_headliner | performer_headliner
    $table->string('category');                        // restaurants | retail | bars | attorneys | etc.
    $table->integer('total_slots');
    $table->integer('held_slots')->default(0);
    $table->json('held_by')->nullable();               // array of business_ids holding slots
    $table->timestamps();
    $table->unique(['community_id', 'platform', 'slot_type', 'category']);
    $table->index('community_id');
});
```

### `pitch_events`

Every measurable action in the pitch. The analytics foundation.

```php
Schema::create('pitch_events', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('session_id');
    $table->uuid('business_id')->nullable();
    $table->uuid('community_id');
    $table->string('event_type');                      // see EVENT TYPES below
    $table->string('step')->nullable();                // step key where event occurred
    $table->string('gate')->nullable();                // gate key if event is gate-related
    $table->string('product')->nullable();             // product key if product-related
    $table->json('payload')->nullable();               // event-specific data
    $table->timestamp('occurred_at');
    $table->index(['session_id', 'occurred_at']);
    $table->index(['event_type', 'occurred_at']);
    $table->index(['gate', 'event_type']);
});
```

**Event types:**
```
session_started           business_profiled         discovery_completed
territory_offered         territory_selected         competitive_frame_delivered
gate_offered              gate_permission_granted    gate_permission_denied
gate_permission_deferred  gate_completed             gate_skipped_fast_path
product_presented         product_accepted           product_declined
product_deferred          slot_inventory_shown       slot_claimed
slot_full_shown           fallback_offered           proposal_built
proposal_presented        proposal_accepted          proposal_partially_accepted
proposal_declined         session_abandoned          resume_message_sent
resume_message_opened     session_resumed            pitch_completed
```

### `pitch_reengagement_queue`

Drives the re-engagement outreach system.

```php
Schema::create('pitch_reengagement_queue', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('session_id');
    $table->uuid('business_id')->nullable();
    $table->string('contact_email');
    $table->string('reengagement_type');               // resume_incomplete | deferred_gate | deferred_product | slot_alert | follow_up
    $table->string('message_variant');                 // which template to use
    $table->json('context')->nullable();               // last_step, gates_remaining, products_deferred, etc.
    $table->json('deferred_gates')->nullable();        // gates to pitch in next session
    $table->json('deferred_products')->nullable();     // products to pitch in next session
    $table->timestamp('send_after');                   // when to send
    $table->string('status')->default('queued');       // queued | sent | opened | clicked | converted | suppressed
    $table->timestamp('sent_at')->nullable();
    $table->timestamp('opened_at')->nullable();
    $table->timestamp('clicked_at')->nullable();
    $table->timestamps();
    $table->index(['status', 'send_after']);
});
```

---

## ENTRY POINT DETECTION & FAST-PATH ROUTING

Every CTA on every platform passes context. The PitchEngine reads this context to determine where to start.

### Entry Context Schema (passed via URL params or session)

```typescript
interface PitchEntryContext {
  source_platform: 'day_news' | 'gec' | 'dtg' | 'glv' | 'alphasite' | 'direct' | 'email_resume';
  community_id: string;
  source_entity_type?: 'article' | 'event' | 'venue' | 'performer' | 'listing';
  source_entity_id?: string;
  resume_session_id?: string;     // for email resume links
  fast_path_gate?: GateKey;       // user clicked "Advertise" on a specific feature page
}
```

### Gate Routing by Entry Point

```typescript
const ENTRY_GATE_MAP: Record<string, GateKey[]> = {
  // Entered from GoEventCity — skip to Event gate, still need profile + discovery
  'gec': ['event_host', 'venue', 'performer'],

  // Entered from GoLocalVoices — skip to GLV gate
  'glv': ['golocalvoices'],

  // Entered from Downtown Guide — skip to DTG gate
  'dtg': ['downtown_guide'],

  // Entered from AlphaSite — skip to AlphaSite gate
  'alphasite': ['alphasite'],

  // Standard entry — full sequence
  'day_news': null,
  'direct': null,
};
```

### Fast-Path Logic

```typescript
class GateSequencer {
  determineGateOrder(session: PitchSession, profile: BusinessPitchProfile): GateKey[] {
    const track = profile.pitch_track;
    const entryGates = ENTRY_GATE_MAP[session.entry_platform] ?? null;

    // Build full sequence for this track
    const fullSequence = TRACK_GATE_SEQUENCES[track];

    if (!entryGates) {
      // Standard entry — full sequence in order
      return fullSequence.filter(gate => this.gateIsEligible(gate, profile));
    }

    // Fast-path: entry gates go first, then remaining gates in standard order
    const remaining = fullSequence.filter(
      g => !entryGates.includes(g) && this.gateIsEligible(g, profile)
    );

    return [
      ...entryGates.filter(g => this.gateIsEligible(g, profile)),
      ...remaining
    ];
  }
}
```

### Gate Sequences by Track

```typescript
const TRACK_GATE_SEQUENCES: Record<PitchTrack, GateKey[]> = {
  standard:     ['day_news', 'downtown_guide', 'event_host', 'golocalvoices', 'alphasite'],
  professional: ['day_news', 'golocalvoices', 'alphasite'],
  trades:       ['day_news', 'alphasite'],
  venue:        ['day_news', 'downtown_guide', 'event_host', 'venue', 'alphasite'],
  performer:    ['gec_performer', 'day_news', 'alphasite'],
  civic:        ['civic', 'event_host'],
};
```

---

## STEP-BY-STEP FLOW

### STEP 1 — BUSINESS PROFILE

**Goal:** Get the profile created before a single pitch word is spoken. This is the investment that makes the user feel ownership.

**UI:** Clean, fast form. Not a chat — a structured profile creator.

```
┌─────────────────────────────────────────────────────────┐
│  Let's find your business                               │
│                                                         │
│  [Search: Business name or address in [Community]]      │
│                                                         │
│  ─── or ─────────────────────────────────────────────  │
│                                                         │
│  I'm a new business / not listed yet  →                │
└─────────────────────────────────────────────────────────┘
```

**On business found (from Overture):**
- Show card: name, address, category, photo if available
- "Is this your business?" → Yes (claim it) / Not the right one (search again)
- On claim: verify via SMS or email — do not block, send in background and continue

**On claim confirmed or new business created:**

```
┌─────────────────────────────────────────────────────────┐
│  Great — let's set up your profile.                     │
│                                                         │
│  Your name:        [                    ]               │
│  Email:            [                    ]               │
│  Phone (optional): [                    ]               │
│                                                         │
│  What best describes [Business Name]?                   │
│  ○ Local business / retail / restaurant                 │
│  ○ Event venue or rental space                          │
│  ○ Performer / entertainer / artist                     │
│  ○ School or educational organization                   │
│  ○ Non-profit or civic organization                     │
│  ○ Government office or municipality                    │
│                                                         │
│  Do you host or promote events?  ○ Yes  ○ No           │
│                                                         │
│  [Save my profile and continue →]                       │
└─────────────────────────────────────────────────────────┘
```

**On save:** Profile written to `business_pitch_profiles`. Session updated with `business_id`. Pitch track assigned. Event: `business_profiled`.

**If returning user with existing profile:**
> *"Welcome back, [Name]. Your profile is saved — want to pick up where you left off, or start fresh?"*
- Resume → load last session, jump to `last_step`
- Start fresh → new session, profile pre-filled

---

### STEP 2 — DISCOVERY

**Goal:** Capture goal, customer source, and marketing spend in three questions. Conversational presentation — not a form, but structured responses (not open text).

**UI pattern:** One question at a time. Answer chips + optional free text. Sarah's voice introduces each one.

```
┌─────────────────────────────────────────────────────────┐
│  Before I show you anything, I want to make sure        │
│  this conversation is actually useful for you.          │
│                                                         │
│  What's the main thing [Business Name] is focused on    │
│  right now?                                             │
│                                                         │
│  [ Bringing in new customers        ]                   │
│  [ Getting existing customers back  ]                   │
│  [ Promoting an event or launch     ]                   │
│  [ Building community awareness     ]                   │
│  [ Something else: ____________     ]                   │
└─────────────────────────────────────────────────────────┘
```

Next question appears after each answer — no page reload.

**Q1 maps to:** `goal` — `new_customers | retention | event_promotion | awareness | other`
**Q2 maps to:** `customer_source` — `word_of_mouth | foot_traffic | online_search | social | referrals | mixed`
**Q3 maps to:** `marketing_spend` — `none | under_100 | 100_300 | 300_600 | 600_plus | not_sure`

**Event logged:** `discovery_completed` with all three answers.

---

### STEP 3 — TERRITORY & COMPETITIVE FRAME

**Goal:** Show the full map, anchor to county/region, let them select their footprint.

**UI:** Visual community selector. Map or list — show community names with status indicators.

```
┌─────────────────────────────────────────────────────────┐
│  Here's what we're building across [County].            │
│                                                         │
│  Select the communities you want to reach:              │
│                                                         │
│  ● [Community] — YOUR COMMUNITY · 3 of 5 [category]    │
│    spots remaining                                      │
│                                                         │
│  ● [Nearby City] — 5 of 5 spots remaining              │
│  ● [City 2] — 1 of 5 spots remaining · ALMOST FULL     │
│  ● [City 3] — FULL in [category]                       │
│  ○ [City 4] — Launching Q2 · Reserve your spot now     │
│                                                         │
│  [Continue with selected communities →]                 │
└─────────────────────────────────────────────────────────┘
```

**Scripted framing delivered above the selector (read once, not repeated):**

> *"Category positions on our platform are limited per community — whoever holds a slot, holds it. Competitors in the same category can't claim the same position. I'll show you the current status for each one."*

**Events logged:**
- `territory_offered` — communities shown with slot status
- `territory_selected` — communities selected, slot states at time of selection

---

### STEP 4 — GATE SEQUENCE

Gates are presented one at a time in the order determined by `GateSequencer`. Each gate follows the same structure:

```
1. PERMISSION ASK (scripted line — shown as Sarah message)
2. USER RESPONSE (Yes, continue / No, skip / Tell me more)
3. If YES → EDUCATION BLOCK → PRODUCT PRESENTATION → SLOT STATUS
4. If NO → log gate_permission_denied → move to next gate
5. If DEFERRED → log with retry window → move to next gate
```

#### Gate UI Pattern

```
┌─────────────────────────────────────────────────────────┐
│ Sarah                                                   │
│ ─────────────────────────────────────────────────────  │
│ [PERMISSION ASK TEXT — scripted, specific to gate]      │
│                                                         │
│   [ Yes, show me ]   [ Skip this ]   [ Tell me more ]  │
└─────────────────────────────────────────────────────────┘
```

On "Yes" — gate expands inline with education + products:

```
┌─────────────────────────────────────────────────────────┐
│ [EDUCATION BLOCK — 2–3 sentences, scripted]             │
│                                                         │
│  ┌─ [Product Name] ─────────────────────────── $XXX ─┐ │
│  │ [One sentence on what it does]                     │ │
│  │                                                     │ │
│  │ ● 3 of 5 [category] spots remaining in [Community] │ │
│  │                                                     │ │
│  │  [ Add this ]  [ Not right now ]                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ [Add-On Name] ──────────────────────────── $XXX ─┐ │
│  │ [One sentence — tied to their stated goal]          │ │
│  │  [ Add this ]  [ Skip ]                             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│ [ Done with this section → ]                            │
└─────────────────────────────────────────────────────────┘
```

---

## GATE SPECIFICATIONS

### Gate: `day_news`
**Track:** All tracks (always first unless fast-path entry from another platform)

**Permission ask (scripted):**
> *"[Business Name] already has a basic listing in our network — name, category, address. Can I take two minutes to show you what a Premium presence looks like, and specifically how your position in [Community] compares to other [category] businesses?"*

**Education block (scripted):**
> *"[Community] has a daily news publication — ten articles every morning, a newsletter that goes to [X] subscribers, and active community social accounts. Businesses with Premium Listings appear in editorial content, at the top of directory searches, and in the newsletter. Basic listings sit below them in every result."*

**Products presented:**

| Product | Scripted rationale | Slot type | Price |
|---|---|---|---|
| Community Influencer Package | "This is the complete presence — premium listing across all four platforms, one article a month, five announcements, priority position, and a discount on any advertising you want to add." | `influencer` | $300/mo |
| Headliner — [category] | "The top card in [category] every time someone searches or browses in [Community]. One position. [X] of Y remaining." | `headliner` | $75–300/mo |
| Newsletter Sponsor | "Your name at the very top of the morning newsletter — every subscriber sees it before they read anything else. One slot per community." | `newsletter_sponsor` | $100–300/send |
| Section Sponsor | "Every article published under [section] in [Community] carries your name. Persistent, not rotational." | `section_sponsor` | $300–2,000/mo |

**Slot display (live, per community selected):**

```
┌─────────────────────────────────────────────────────────┐
│  [Category] — [Community]                               │
│                                                         │
│  Community Influencer spots: ■ ■ ■ □ □  3 of 5 held    │
│  Headliner:                  ■ ■ ■ ■ ■  FULL           │
│                                                         │
│  Headliner is held by [Business Name].                  │
│  Would you like to see Section Sponsor options          │
│  that don't have slot limits?   [ Yes ]  [ No ]        │
└─────────────────────────────────────────────────────────┘
```

---

### Gate: `downtown_guide`
**Track:** standard, venue
**Eligible when:** `org_type` is `smb` or `venue` AND has physical location

**Permission ask (scripted):**
> *"Because you have a physical location, there's another layer worth understanding. The Downtown Guide is where [Community] residents search for places to go, shop, and eat. Can I show you what your listing looks like there versus what it could look like?"*

**Education block (scripted):**
> *"The Downtown Guide is a full business directory with photos, menus, hours, coupons, and reviews. When someone searches [category] on a Saturday afternoon, they see the Headliner first, then Priority Listings, then everyone else. Your current listing is in the third group."*

**Products presented:**

| Product | Scripted rationale | Slot type | Price |
|---|---|---|---|
| Premium Listing (included in Influencer) | "Full photo gallery, extended description, verified badge, coupons, analytics — the difference between a placeholder and a real presence." | N/A | In package |
| Headliner — DTG [category] | "Top card in [category] every time someone browses in the Downtown Guide. [X] of Y remaining." | `dtg_headliner` | $75–300/mo |
| Poll Participation — Featured | "Community's Choice polls run regularly. Featured puts your photo and an offer in the poll listing." | N/A | $49/poll |
| Poll Participation — Premium | "Highlighted position at the top of the poll with sponsored badge. Most shared product we offer." | N/A | $149/poll |

---

### Gate: `event_host`
**Track:** standard, venue
**Eligible when:** `has_events` is true OR org_type is `smb` AND category suggests events (restaurant, bar, brewery, fitness, studio, retail)

**Permission ask (scripted):**
> *"Something that can really drive traffic for a business like yours is promoting events properly — even smaller ones like tastings, classes, or pop-ups. I think it can genuinely help you. Can I give you two minutes on how it works?"*

**Education block (scripted):**
> *"GoEventCity is [Community]'s event calendar. On a busy week there can be 30 or 40 events listed. The ones that get attended are the ones that get seen. There's an Event Headliner per category — the top card every time someone browses that event type — and Priority Events that float above the rest. Your events can also cross-post into the Day.News morning feed automatically, so they reach the full subscriber base, not just people who happen to check the calendar."*

**Products presented:**

| Product | Scripted rationale | Slot type | Price |
|---|---|---|---|
| Premium Event (included in Influencer) | "One premium event per month — full photos, details, priority placed, cross-posted to Day.News, reminder sent to registrants." | N/A | In package |
| Event Headliner — [event category] | "First card every time someone browses [event type] in [Community]. [X] of Y remaining." | `gec_event_headliner` | $75–300/mo |
| Ticket Sales | "Advance ticket sales online — promo codes, known headcount, lower commission than most ticketing services." | N/A | 1–5% commission |
| Calendar Subscription | "Customers subscribe once and get notified automatically every time you add a new event — no social algorithm in the way." | N/A | $19–49/mo |
| "Since You're Going To..." | "After someone registers, they get a follow-up with nearby experiences and dining — makes the experience better, puts you in front of them again." | N/A | $25–100/event |

---

### Gate: `venue`
**Track:** venue
**Eligible when:** `has_venue` is true OR org_type is `venue`

**Permission ask (scripted):**
> *"Your space is something people can rent — parties, corporate events, private functions. There's a venue directory separate from the event calendar where people search specifically for a place to host. Can I show you how that works?"*

**Education block (scripted):**
> *"When someone in [Community] is looking for a place to host an event, they search the venue directory. It has its own Headliner — the top venue in each category — and its own search results. A complete venue profile with photos, capacity, and rental information is what converts that search into an inquiry."*

**Products presented:**

| Product | Scripted rationale | Slot type | Price |
|---|---|---|---|
| Premium Venue Listing | "Full profile — photos, capacity, amenities, rental info, verified badge." | N/A | In package |
| Venue Headliner — [venue category] | "First result when someone in [Community] searches for a venue to book. [X] of Y remaining." | `gec_venue_headliner` | $75–300/mo |
| Venue Booking System | "Inquiries handled online — they check availability, pick a date, put down a deposit. No phone tag, no missed leads after hours." | N/A | $49/mo + commission |

---

### Gate: `gec_performer`
**Track:** performer
**Eligible when:** `is_performer` is true OR org_type is `performer`

**Permission ask (scripted):**
> *"GoEventCity has a performer directory that venues use when they're booking talent. If you want venues in [Community] to find you — instead of the other way around — can I show you how it works?"*

**Education block (scripted):**
> *"Venues looking to book entertainment in [Community] search the performer directory by category — bands, DJs, comedians, speakers. The Headliner is the first performer they see. Fans can also subscribe to your calendar — they get notified every time you add a new date without needing to follow you anywhere."*

**Products presented:**

| Product | Scripted rationale | Slot type | Price |
|---|---|---|---|
| Premium Performer Listing | "Full profile — bio, photos, video, genre, booking info." | N/A | In package |
| Performer Headliner — [performer category] | "First result when venues in [Community] search for your type of entertainment. [X] of Y remaining." | `gec_performer_headliner` | $75–300/mo |
| Performer Booking System | "Venues book you directly — they see your availability, agree to terms, confirm. No back-and-forth." | N/A | $49/mo + commission |
| Calendar Subscription | "Fans subscribe once and know every time you add a date — your audience stays connected." | N/A | $19–49/mo |

---

### Gate: `golocalvoices`
**Track:** professional, standard (for expert-eligible categories)
**Eligible when:** `category` is in `['attorney', 'financial_advisor', 'healthcare', 'fitness', 'nutritionist', 'therapist', 'educator', 'chef', 'real_estate']` OR pitch_track is `professional`

**Permission ask (scripted):**
> *"What you do is different from most businesses — people have to trust you before they hire you. There's a way to build that in [Community] that isn't advertising. Can I take a minute to show you?"*

**Education block (scripted):**
> *"GoLocalVoices is where [Community]'s experts publish. Regular columns under your name about [their field]. People interested in [topic] read it. When they need someone, you're the name they already know. There's one Headline Spot per expertise category — the [professional type] whose column runs in the community news."*

**Products presented:**

| Product | Scripted rationale | Slot type | Price |
|---|---|---|---|
| Headline Spot (included in Influencer) | "Your named column, published regularly, visible in GoLocalVoices and cross-posted to the Day.News morning feed." | N/A | In package |
| Community Expert upgrade | "Adds category exclusivity — no other [their profession] in [Community] can hold a Headline Spot while you do. +$100/month." | `glv_expert_column` | +$100/mo |

---

### Gate: `civic`
**Track:** civic
**Eligible when:** `org_type` in `['school', 'nonprofit', 'government']`

**Permission ask (scripted):**
> *"[Organization name] serves the community in a way that's different from a business. We built something specifically for organizations like yours — not advertising, just better community communication. Can I show you how other [schools/non-profits/government offices] in [County] are using it?"*

**Education block (scripted):**
> *"Every community organization has a free presence on our platforms — events on the calendar, announcements in the feed, a listing in the directory. Organizations that keep their presence current become a natural part of the daily community conversation. Residents follow what you're doing. Event attendance goes up. Awareness goes up."*

**Products presented:**

| Product | Scripted rationale | Price |
|---|---|---|
| Base Civic Participation | "Directory listing, event calendar access, announcements — free. We want [Community] residents to know what's happening with the organizations that serve them." | Free / reduced |
| Premium Event Listing | "For major events — a fundraiser, graduation, public meeting — priority positioning makes sure it doesn't get buried." | $29–99/event |
| Event Headliner (major annual events) | "For your biggest event of the year — first card in the calendar for everyone looking at that date." | $75–300 |
| GoLocalVoices Column | "If your superintendent, executive director, or elected official wants to speak to residents directly and regularly, this is the venue for that." | In Influencer / standalone |

---

### Gate: `alphasite`
**Track:** All tracks
**Eligible when:** Always. Qualifying question determines if gate fully opens.

**Qualifying question (before permission ask):**
> *"Quick question — if someone searched for a [their service] in [Community] online right now, does your business come up prominently?"*

If no or unsure — **then** the permission ask:

> *"That's worth understanding. Can I take thirty seconds to show you what the gap is and how we close it?"*

If yes — ask follow-up: *"Has the site been updated in the last year?"* If no → proceed with gate. If yes → log `alphasite_gate_skipped_qualified` and close gate.

**Education block (scripted):**
> *"The way people find local businesses has changed significantly. Searches increasingly produce direct answers — not just a list of websites. The businesses that appear in those answers have complete, current, well-structured profiles. If your site is old or incomplete, you're simply not in those results. AlphaSite gives you a profile that's connected to every platform we operate — one place to keep everything current, structured the way search systems want to read it."*

**Products presented:**

| Product | Scripted rationale | Price |
|---|---|---|
| AlphaSite Profile (in Influencer) | "Complete, current business profile — connected to Day.News, Downtown Guide, and GoEventCity. One update, reflected everywhere." | In package |
| Priority AlphaSite Listing | "Elevated above basic profiles in AlphaSite directory search." | In package |
| Automated Customer Response | [Only if intake volume signal is strong] "Handles inbound customer questions around the clock — hours, services, appointment requests. Customers get answers immediately." | $49–199/mo |

> **Language note:** Never use "AI" or "automated" framing. Always describe the outcome: "customers get answers immediately," "questions are handled around the clock."

---

## SLOT INVENTORY — FULL / FALLBACK LOGIC

When a slot is FULL, Sarah does not end the conversation. She pivots:

```typescript
function handleFullSlot(slotType: SlotType, business: BusinessPitchProfile, community: Community): FallbackOffer {
  switch (slotType) {
    case 'influencer':
      return {
        message: `The [category] Influencer slots in [Community] are full. There's another path that gets you similar visibility without a slot limit — a Section Sponsor. You own a section of the news rather than a category position. Want to see which sections are available?`,
        fallback_products: ['section_sponsor', 'newsletter_sponsor'],
      };

    case 'dtg_headliner':
    case 'gec_event_headliner':
    case 'gec_venue_headliner':
    case 'gec_performer_headliner':
      return {
        message: `The Headliner in [category] in [Community] is currently held by [Business Name]. The next best position is Priority Listing — you're elevated above every business that isn't paying for position. That spot has no limit and is available now.`,
        fallback_products: ['priority_listing'],
      };

    case 'glv_expert_column':
      return {
        message: `The [expertise] column in [Community] is currently held. If [Community] isn't the right fit right now, the same position may be available in [Nearby Community]. Want me to check?`,
        fallback_products: ['nearby_community_glv'],
      };
  }
}
```

**Event logged:** `slot_full_shown`, `fallback_offered`

---

## PROFILE SAVE & SESSION RESUME

### Saving Progress

Every step completion auto-saves. The user does not need to manually save. On step completion:

```typescript
// After each step
await PitchSession.update(sessionId, {
  last_step: completedStep,
  last_active_at: new Date(),
  [stepDataKey]: stepData,
});
await PitchEvent.log('step_completed', { session_id, step: completedStep });
```

### Resume Entry Points

**A) Same browser, returning:**
- Session detected from cookie/localStorage
- Banner shown: *"You have an unfinished profile for [Business Name]. Pick up where you left off?"*
- [ Resume ] → jump to `last_step` + 1
- [ Start over ] → new session, profile pre-filled

**B) Email re-engagement link:**
- Link contains `?resume=SESSION_ID`
- Session loaded, user lands at `last_step` + 1
- No login required if email was captured in profile step

**C) Returning user with profile, no active session:**
- Profile detected from email match
- *"Welcome back, [Name]. Want to continue exploring what's available for [Business Name] in [Community]?"*
- New session created, profile pre-loaded, gates_deferred surfaced first

---

## RE-ENGAGEMENT SYSTEM

### Triggers & Templates

**Trigger: Session abandoned mid-pitch (no proposal built)**
- Fire: 24 hours after `last_active_at` if status is not `converted`
- Template: `resume_incomplete`

> Subject: *We never finished your [Community] profile, [Name]*
>
> *Hey [Name] — we started putting together a presence plan for [Business Name] in [Community] but never got to the good part.*
>
> *[If gate partially completed:] We got through [last gate completed] and were about to look at [next gate]. Takes about 2 minutes to finish.*
>
> *[If no gates completed:] We had your profile saved and were ready to show you what's available in [Community].*
>
> *Want to finish it now?  [Resume →]*  Or — I can put together a proposal based on what I know about [Business Name] and send it to you. Just reply and I'll have it in your inbox.*

**Trigger: Specific gate deferred ("not right now")**
- Fire: per retry window in deferral table (7–90 days)
- Template: `deferred_gate`

> Subject: *[Name], got a minute for [Business Name]?*
>
> *Last time we talked, you weren't ready to look at [gate topic] for [Business Name]. Totally fine.*
>
> *Worth a quick look now? There are [X] spots left in [category] in [Community] — that number has come down since we last spoke.*
>
> *[Open the [gate topic] section →]*

**Trigger: Slot count dropped since last session**
- Fire: when `held_slots` increases for a community/category the business showed interest in
- Template: `slot_alert`

> Subject: *[Community] — [category] spots are filling up*
>
> *[Name] — when we last talked about [Business Name], there were [X] spots available in [category] in [Community]. There are now [Y].*
>
> *[If 1 remaining:] There's one left.*
>
> *Want to claim it before it's gone?  [Reserve your spot →]*

**Trigger: Proposal built but not converted (7 days)**
- Template: `proposal_follow_up`

> Subject: *Your [Community] proposal is still here*
>
> *[Name] — I put together a proposal for [Business Name] that's been sitting here for a week. It's still good.*
>
> *[Proposal summary: package + add-ons + total]*
>
> *[Review and activate →]  or  [Adjust the proposal →]*

---

## PITCH ANALYTICS — REPORTING LAYER

### Key Metrics (queryable from `pitch_events`)

```sql
-- Gate permission rate by gate
SELECT
  gate,
  COUNT(*) FILTER (WHERE event_type = 'gate_offered') as offered,
  COUNT(*) FILTER (WHERE event_type = 'gate_permission_granted') as granted,
  COUNT(*) FILTER (WHERE event_type = 'gate_permission_denied') as denied,
  COUNT(*) FILTER (WHERE event_type = 'gate_permission_deferred') as deferred,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'gate_permission_granted')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'gate_offered'), 0) * 100, 1
  ) as permission_rate_pct
FROM pitch_events
WHERE occurred_at >= NOW() - INTERVAL '30 days'
GROUP BY gate
ORDER BY permission_rate_pct ASC;

-- Abandonment by step
SELECT
  last_step,
  COUNT(*) as sessions_abandoned_here,
  ROUND(AVG(EXTRACT(EPOCH FROM (abandoned_at - created_at))/60), 1) as avg_minutes_in_pitch
FROM pitch_sessions
WHERE status = 'abandoned'
  AND abandoned_at >= NOW() - INTERVAL '30 days'
GROUP BY last_step
ORDER BY sessions_abandoned_here DESC;

-- Product acceptance rate
SELECT
  product,
  COUNT(*) FILTER (WHERE event_type = 'product_presented') as presented,
  COUNT(*) FILTER (WHERE event_type = 'product_accepted') as accepted,
  COUNT(*) FILTER (WHERE event_type = 'product_declined') as declined,
  COUNT(*) FILTER (WHERE event_type = 'product_deferred') as deferred,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'product_accepted')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'product_presented'), 0) * 100, 1
  ) as acceptance_rate_pct
FROM pitch_events
WHERE occurred_at >= NOW() - INTERVAL '30 days'
GROUP BY product
ORDER BY acceptance_rate_pct ASC;

-- Re-engagement conversion
SELECT
  reengagement_type,
  COUNT(*) as sent,
  COUNT(*) FILTER (WHERE status = 'opened') as opened,
  COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
  COUNT(*) FILTER (WHERE status = 'converted') as converted
FROM pitch_reengagement_queue
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY reengagement_type;
```

### Dashboard Metrics (surface in Command Center)

- Pitch starts / day
- Profile completion rate
- Gate permission rate by gate (heatmap)
- Step abandonment funnel (waterfall chart)
- Product acceptance rate by product
- Proposal-to-close rate
- Re-engagement open / click / convert rate
- MRR per closed pitch
- Average gates completed per closed pitch
- Slot fill rate by community / category

---

## FILE STRUCTURE

```
app/Services/Pitch/
    PitchEngineService.php           — session manager, entry point handler
    GateSequencer.php                — determines gate order per track + entry point
    SlotInventoryService.php         — reads/writes community_slot_inventory
    GateFallbackService.php          — handles full slot alternatives
    PitchAnalyticsService.php        — emits and queries pitch_events
    ReengagementService.php          — builds and sends re-engagement queue

app/Models/
    PitchSession.php
    BusinessPitchProfile.php
    CommunitySlotInventory.php
    PitchEvent.php
    PitchReengagementQueue.php

app/Http/Controllers/Pitch/
    PitchSessionController.php
    GateController.php
    SlotInventoryController.php
    ReengagementController.php

database/migrations/
    create_pitch_sessions_table.php
    create_business_pitch_profiles_table.php
    create_community_slot_inventory_table.php
    create_pitch_events_table.php
    create_pitch_reengagement_queue_table.php

resources/js/react/Pitch/
    PitchEngine.tsx                  — wrapper, session manager, router
    steps/
        BusinessProfileStep.tsx      — business claim/create + profile form
        DiscoveryStep.tsx            — 3 questions, chip-based answers
        TerritoryStep.tsx            — community selector with slot status
    gates/
        GateSequencer.tsx            — renders gates in order, manages permission state
        GateWrapper.tsx              — permission ask → education → products pattern
        gates/
            DayNewsGate.tsx
            DowntownGuideGate.tsx
            EventHostGate.tsx
            VenueGate.tsx
            PerformerGate.tsx
            GoLocalVoicesGate.tsx
            CivicGate.tsx
            AlphaSiteGate.tsx
    components/
        SlotStatusBar.tsx            — visual slot counter (■ ■ □ □ □ format)
        ProductCard.tsx              — Add this / Skip / Not right now
        SlotFullFallback.tsx         — full slot pivot message
        FastPathNav.tsx              — "I know what I want" skip-ahead nav
        ResumePrompt.tsx             — returning user prompt
        SarahMessage.tsx             — scripted message display component
    proposal/
        ProposalBuilder.tsx          — builds from gate outputs → hands to CampaignBuilder

routes/pitch.php
```

---

## IMPLEMENTATION ORDER

1. **Migrations** — all 5 tables
2. **Models** — with relationships
3. **`SlotInventoryService`** — seed slot data for active communities, read/write methods
4. **`PitchEngineService`** — session creation, entry detection, track assignment
5. **`GateSequencer`** — gate order logic, fast-path routing
6. **`PitchAnalyticsService`** — event logging (stub all event types, implement log method)
7. **`GateFallbackService`** — full slot handling
8. **`ReengagementService`** — queue builder and template renderer
9. **Controllers + routes**
10. **React: `BusinessProfileStep` → `DiscoveryStep` → `TerritoryStep`**
11. **React: `GateWrapper` + `SlotStatusBar` + `ProductCard`**
12. **React: Individual gates** (DayNews → DTG → EventHost → Venue → Performer → GLV → Civic → AlphaSite)
13. **React: `FastPathNav` + `ResumePrompt`**
14. **React: `ProposalBuilder`** (hands off to existing `CampaignBuilder` from Sarah spec)
15. **Reporting queries + Command Center dashboard widgets**

---

## DEPENDENCIES ON EXISTING SYSTEMS

| This system needs | From |
|---|---|
| `businesses` / `overture` data | Existing Overture import |
| `communities` table | Existing community records |
| `campaigns` + `campaign_line_items` | SARAH_CAMPAIGN_BUILDER_SPEC.md |
| `CampaignBundleValidator` | SARAH_CAMPAIGN_BUILDER_SPEC.md |
| Stripe checkout | SARAH_CAMPAIGN_BUILDER_SPEC.md |
| Postal / email delivery | Existing Postal infrastructure |
| Community subscriber counts | Existing PP newsletter tables |

---

## SCRIPTING RULES FOR IMPLEMENTATION

These rules apply to every string rendered in the pitch UI. They are linting rules, not guidelines.

1. `"AI"` — banned. Find and replace with outcome language before any string ships.
2. `"automated"` — banned in customer-facing context. Use "handles it," "takes care of it," "works around the clock."
3. Gate education blocks are stored as community-interpolated templates — `[Community]`, `[X subscribers]`, `[category]` — never hardcoded.
4. Slot counts are always live from `SlotInventoryService` — never hardcoded or cached for longer than 5 minutes.
5. Scripted lines in `SarahMessage.tsx` are not editable by agents — they come from a locked template store. Only tone adjustments are permitted in the system prompt layer.
6. Every "Add this" / "Skip" / "Not right now" button fires a `pitch_event` before any other action.
7. Re-engagement templates reference the specific last step and specific deferred gates — never generic. A generic re-engagement message is a failed re-engagement message.

---

# PART 3 — CRM ENRICHMENT SPEC (Data Pipeline)

# Sarah Pitch Engine — CRM Enrichment & Command Center Integration
## Backend Architecture, Data Pipeline, and CC Follow-Up Views

> **Read alongside:** `SARAH_PITCH_ENGINE_SPEC.md`  
> **Existing system context:** `CC-LC-CRM-IBOB-CURRENT-STATE-1-20-26`  
> The existing CRM already has `Customer`, `SMB`, `Conversation`, `OutboundCampaign`, and `AnalyticsEvent`. The pitch engine feeds all of them. Nothing lives in a silo.

---

## CORE PRINCIPLE

Every piece of information collected during a pitch session is business intelligence. It belongs to the SMB record permanently — not to the pitch session. The pitch session is the intake vehicle. The CRM is the destination.

**Data flow:**
```
Pitch Event → PitchEnrichmentService → SMB record + Customer record + Conversation record
                    ↓
            AnalyticsEvent (existing)
                    ↓
            OutboundCampaign queue (if deferred/abandoned)
                    ↓
            CC Follow-Up Inbox (human review queue)
```

---

## WHAT EXISTING TABLES RECEIVE

### `smbs` table — enriched fields from pitch

The existing `SMB` model receives these additions. **These are new columns added via migration — not a new table.**

```php
// New columns on existing smbs table
$table->string('org_type')->nullable();              // smb | venue | performer | school | nonprofit | government
$table->string('pitch_track')->nullable();           // standard | professional | trades | venue | performer | civic
$table->boolean('has_events')->default(false);
$table->boolean('has_venue')->default(false);
$table->boolean('is_performer')->default(false);
$table->boolean('website_exists')->nullable();
$table->boolean('website_current')->nullable();      // answered the AlphaSite qualifying question
$table->string('primary_goal')->nullable();          // from discovery Q1
$table->string('customer_source')->nullable();       // from discovery Q2
$table->string('marketing_spend_range')->nullable(); // from discovery Q3
$table->json('communities_of_interest')->nullable(); // community_ids shown interest in
$table->json('gates_completed')->nullable();         // gates where they said yes
$table->json('gates_deferred')->nullable();          // gates declined, retry windows
$table->json('products_accepted')->nullable();       // product keys bought or added to proposal
$table->json('products_declined')->nullable();       // explicitly rejected
$table->json('products_deferred')->nullable();       // not now, follow up
$table->string('pitch_status')->nullable();          // never_pitched | in_progress | proposed | converted | re_engagement
$table->uuid('active_pitch_session_id')->nullable(); // FK to pitch_sessions
$table->uuid('converted_campaign_id')->nullable();   // FK to campaigns when converted
$table->timestamp('pitch_started_at')->nullable();
$table->timestamp('pitch_completed_at')->nullable();
$table->timestamp('last_pitch_activity_at')->nullable();
$table->decimal('proposal_value', 10, 2)->nullable(); // MRR of last proposal
$table->integer('founder_days_remaining')->nullable(); // countdown from community launch
```

### `customers` table — enriched from pitch contact info

When a pitch session captures a contact name + email (ProfileTypeStep), that creates or matches a `Customer` record.

```php
// Existing Customer — no new columns needed, but these fields get populated:
// name, email, phone → from ProfileTypeStep
// business_id (FK to SMB) → linked on business claim
// community_id → from territory selection
// tier → set to 'prospect' on pitch start, upgraded to 'active' on conversion
// source → set to 'pitch_engine' 
// ai_context → enriched JSON (see below)
```

### `ai_context` JSON on Customer — auto-built from pitch

The existing `ai_context` field on Customer feeds the AI Personalities module. The pitch engine populates it automatically as data is collected:

```php
// Written incrementally as pitch progresses — each step adds its section
$ai_context = [
    'business_name'      => 'Sunrise Bakery',
    'category'           => 'restaurant',
    'org_type'           => 'smb',
    'primary_goal'       => 'foot_traffic',
    'customer_source'    => 'word_of_mouth',
    'marketing_spend'    => '100_300',
    'has_events'         => true,
    'communities'        => ['clearwater', 'dunedin'],
    'gates_completed'    => ['day_news', 'downtown_guide', 'event_host'],
    'gates_deferred'     => [
        ['gate' => 'alphasite', 'reason' => 'not_now', 'retry_after' => '2026-04-28']
    ],
    'products_accepted'  => ['community_influencer', 'event_headliner'],
    'products_deferred'  => [
        ['product' => 'ticket_sales', 'reason' => 'not_now', 'retry_after' => '2026-04-01']
    ],
    'pitch_notes'        => 'Budget is $300-600. Runs weekly events. Concerned about website.',
    'last_updated'       => '2026-03-28T10:09:00Z',
];
```

### `conversations` table — pitch creates a conversation thread

Every pitch session creates one `Conversation` record. Each meaningful Sarah message and each user decision becomes a `ConversationMessage`. This gives the CC the full pitch history inline with the customer record.

```php
// Conversation created on pitch_session start
[
    'customer_id'   => $customer->id,
    'type'          => 'pitch',                          // new type added to enum
    'subject'       => 'Pitch — Sunrise Bakery — Clearwater — March 28, 2026',
    'status'        => 'active',                         // active | completed | abandoned
    'source'        => 'pitch_engine',
    'metadata'      => ['session_id' => $session->id, 'community_id' => $community->id],
]

// ConversationMessages appended as pitch progresses:
// Sarah messages → type: 'sarah_message'
// User gate decisions → type: 'user_decision' (gate_name, permission_granted/denied/deferred)
// Products accepted/declined → type: 'product_decision'
// Proposal presented → type: 'proposal_presented' with full proposal JSON
// Abandonment → type: 'session_abandoned' with last_step
```

---

## NEW TABLES

Only three new tables are needed. Everything else flows into existing tables.

### `pitch_sessions` — session manager

```php
Schema::create('pitch_sessions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('smb_id')->nullable();
    $table->uuid('customer_id')->nullable();
    $table->uuid('community_id');
    $table->uuid('conversation_id')->nullable();         // FK to conversations
    $table->string('entry_platform');                   // day_news | gec | dtg | glv | alphasite | direct | email_resume
    $table->string('org_type')->nullable();
    $table->string('pitch_track')->nullable();
    $table->string('status');                           // started | profiled | discovering | pitching | proposed | converted | abandoned | deferred
    $table->string('last_step');                        // last completed step key
    $table->json('discovery_answers')->nullable();
    $table->json('territory_selection')->nullable();
    $table->json('gates_offered')->nullable();
    $table->json('gates_completed')->nullable();
    $table->json('gates_deferred')->nullable();
    $table->json('products_accepted')->nullable();
    $table->json('products_declined')->nullable();
    $table->json('products_deferred')->nullable();
    $table->uuid('proposal_id')->nullable();            // FK to campaigns when proposal built
    $table->decimal('proposal_value', 10, 2)->nullable();
    $table->timestamp('last_active_at')->nullable();
    $table->timestamp('abandoned_at')->nullable();
    $table->timestamps();
    $table->index(['smb_id', 'status']);
    $table->index(['community_id', 'status']);
    $table->index('last_active_at');
});
```

### `community_slot_inventory` — live slot counts

```php
Schema::create('community_slot_inventory', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('community_id');
    $table->string('platform');                         // day_news | dtg | gec | glv | alphasite
    $table->string('slot_type');                        // influencer | headliner | section_sponsor | expert_column | event_headliner | venue_headliner | performer_headliner
    $table->string('category');
    $table->integer('total_slots');
    $table->integer('held_slots')->default(0);
    $table->json('held_by')->nullable();                // array of smb_ids
    $table->timestamps();
    $table->unique(['community_id', 'platform', 'slot_type', 'category']);
    $table->index('community_id');
});
```

### `pitch_reengagement_queue` — drives outbound follow-ups

```php
Schema::create('pitch_reengagement_queue', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('session_id');
    $table->uuid('smb_id')->nullable();
    $table->uuid('customer_id')->nullable();
    $table->string('contact_email');
    $table->string('reengagement_type');               // resume_incomplete | deferred_gate | deferred_product | slot_alert | proposal_followup
    $table->json('context')->nullable();               // last_step, gates_remaining, slot_counts, etc.
    $table->json('deferred_gates')->nullable();
    $table->json('deferred_products')->nullable();
    $table->timestamp('send_after');
    $table->string('status')->default('queued');       // queued | sent | opened | clicked | converted | suppressed
    $table->uuid('outbound_campaign_id')->nullable();  // FK to existing OutboundCampaign when dispatched
    $table->timestamps();
    $table->index(['status', 'send_after']);
    $table->index('smb_id');
});
```

---

## LARAVEL SERVICES

### `PitchEnrichmentService` — the pipeline core

This is the most important service. Every pitch event passes through it. It is responsible for keeping the SMB record, Customer record, and Conversation in sync with what the pitch is collecting.

```php
final class PitchEnrichmentService
{
    /**
     * Called on every pitch event. Determines what to write to which model.
     */
    public function process(PitchSession $session, string $eventType, array $payload): void
    {
        match($eventType) {
            'business_profiled'         => $this->enrichFromProfile($session, $payload),
            'discovery_completed'       => $this->enrichFromDiscovery($session, $payload),
            'territory_selected'        => $this->enrichFromTerritory($session, $payload),
            'gate_permission_granted'   => $this->logGateDecision($session, $payload, 'completed'),
            'gate_permission_denied'    => $this->logGateDecision($session, $payload, 'deferred'),
            'gate_permission_deferred'  => $this->logGateDecision($session, $payload, 'deferred'),
            'product_accepted'          => $this->logProductDecision($session, $payload, 'accepted'),
            'product_declined'          => $this->logProductDecision($session, $payload, 'declined'),
            'product_deferred'          => $this->logProductDecision($session, $payload, 'deferred'),
            'proposal_presented'        => $this->logProposal($session, $payload),
            'session_abandoned'         => $this->handleAbandonment($session, $payload),
            'pitch_completed'           => $this->handleConversion($session, $payload),
            default                     => null,
        };
    }

    private function enrichFromProfile(PitchSession $session, array $payload): void
    {
        // Update or create SMB record
        $smb = SMB::findOrNew($session->smb_id);
        $smb->fill([
            'org_type'    => $payload['org_type'],
            'pitch_track' => $payload['pitch_track'],
            'has_events'  => $payload['has_events'],
            'has_venue'   => $payload['has_venue'] ?? false,
            'is_performer'=> $payload['is_performer'] ?? false,
            'pitch_status'=> 'in_progress',
            'pitch_started_at' => now(),
            'last_pitch_activity_at' => now(),
        ])->save();

        // Create or update Customer
        $customer = Customer::firstOrCreate(
            ['email' => $payload['contact_email']],
            [
                'name'        => $payload['contact_name'],
                'phone'       => $payload['contact_phone'] ?? null,
                'smb_id'      => $smb->id,
                'community_id'=> $session->community_id,
                'source'      => 'pitch_engine',
                'tier'        => 'prospect',
            ]
        );

        // Create conversation thread for this pitch
        $conversation = Conversation::create([
            'customer_id' => $customer->id,
            'type'        => 'pitch',
            'subject'     => "Pitch — {$smb->name} — " . now()->format('M j, Y'),
            'status'      => 'active',
            'source'      => 'pitch_engine',
            'metadata'    => ['session_id' => $session->id, 'community_id' => $session->community_id],
        ]);

        $session->update([
            'smb_id'          => $smb->id,
            'customer_id'     => $customer->id,
            'conversation_id' => $conversation->id,
        ]);

        $this->updateAiContext($customer, $smb);
    }

    private function enrichFromDiscovery(PitchSession $session, array $payload): void
    {
        SMB::find($session->smb_id)?->update([
            'primary_goal'         => $payload['goal'],
            'customer_source'      => $payload['customer_source'],
            'marketing_spend_range'=> $payload['marketing_spend'],
            'last_pitch_activity_at' => now(),
        ]);

        // Append to conversation
        $this->appendConversationMessage($session, 'user_decision', [
            'step'    => 'discovery',
            'goal'    => $payload['goal'],
            'source'  => $payload['customer_source'],
            'spend'   => $payload['marketing_spend'],
        ]);

        $this->updateAiContext(
            Customer::find($session->customer_id),
            SMB::find($session->smb_id)
        );
    }

    private function logGateDecision(PitchSession $session, array $payload, string $outcome): void
    {
        $smb = SMB::find($session->smb_id);
        
        $field = match($outcome) {
            'completed' => 'gates_completed',
            'deferred'  => 'gates_deferred',
            default     => 'gates_deferred',
        };

        $existing = $smb->{$field} ?? [];
        
        if ($outcome === 'completed') {
            $existing[] = $payload['gate'];
        } else {
            $existing[] = [
                'gate'        => $payload['gate'],
                'reason'      => $payload['reason'] ?? 'not_now',
                'retry_after' => $payload['retry_after'],
            ];
        }

        $smb->update([
            $field => $existing,
            'last_pitch_activity_at' => now(),
        ]);

        $this->appendConversationMessage($session, 'user_decision', [
            'step'    => 'gate_' . $payload['gate'],
            'outcome' => $outcome,
            'gate'    => $payload['gate'],
            'reason'  => $payload['reason'] ?? null,
        ]);

        $this->updateAiContext(Customer::find($session->customer_id), $smb);
    }

    private function logProductDecision(PitchSession $session, array $payload, string $outcome): void
    {
        $smb = SMB::find($session->smb_id);
        
        $field = "products_{$outcome}";
        $existing = $smb->{$field} ?? [];

        if ($outcome === 'accepted') {
            $existing[] = ['product' => $payload['product'], 'price' => $payload['price']];
        } elseif ($outcome === 'deferred') {
            $existing[] = [
                'product'     => $payload['product'],
                'retry_after' => $payload['retry_after'],
                'reason'      => $payload['reason'] ?? null,
            ];
        } else {
            $existing[] = ['product' => $payload['product'], 'reason' => $payload['reason'] ?? null];
        }

        $smb->update([$field => $existing, 'last_pitch_activity_at' => now()]);
        $this->updateAiContext(Customer::find($session->customer_id), $smb);
    }

    private function handleAbandonment(PitchSession $session, array $payload): void
    {
        SMB::find($session->smb_id)?->update([
            'pitch_status' => 'in_progress',           // still in progress — not a rejection
            'last_pitch_activity_at' => now(),
        ]);

        $this->appendConversationMessage($session, 'session_abandoned', [
            'last_step' => $payload['last_step'],
            'gates_remaining' => $payload['gates_remaining'] ?? [],
        ]);

        // Queue re-engagement
        app(ReengagementQueueService::class)->queue($session, 'resume_incomplete');
    }

    private function handleConversion(PitchSession $session, array $payload): void
    {
        SMB::find($session->smb_id)?->update([
            'pitch_status'        => 'converted',
            'converted_campaign_id' => $payload['campaign_id'],
            'pitch_completed_at'  => now(),
        ]);

        Customer::find($session->customer_id)?->update(['tier' => 'active']);

        $this->appendConversationMessage($session, 'pitch_completed', [
            'campaign_id'    => $payload['campaign_id'],
            'products'       => $payload['products'],
            'total_mrr'      => $payload['total_mrr'],
        ]);
    }

    private function updateAiContext(Customer $customer, SMB $smb): void
    {
        $customer->update([
            'ai_context' => [
                'business_name'     => $smb->name,
                'category'          => $smb->category,
                'org_type'          => $smb->org_type,
                'primary_goal'      => $smb->primary_goal,
                'customer_source'   => $smb->customer_source,
                'marketing_spend'   => $smb->marketing_spend_range,
                'has_events'        => $smb->has_events,
                'communities'       => $smb->communities_of_interest,
                'gates_completed'   => $smb->gates_completed,
                'gates_deferred'    => $smb->gates_deferred,
                'products_accepted' => $smb->products_accepted,
                'products_deferred' => $smb->products_deferred,
                'pitch_status'      => $smb->pitch_status,
                'last_updated'      => now()->toIso8601String(),
            ]
        ]);
    }

    private function appendConversationMessage(PitchSession $session, string $type, array $data): void
    {
        if (!$session->conversation_id) return;
        
        ConversationMessage::create([
            'conversation_id' => $session->conversation_id,
            'type'            => $type,
            'content'         => json_encode($data),
            'source'          => 'pitch_engine',
            'created_at'      => now(),
        ]);
    }
}
```

### `ReengagementQueueService` — feeds existing OutboundCampaign system

Rather than a separate email system, re-engagement uses the existing `OutboundCampaign` infrastructure.

```php
final class ReengagementQueueService
{
    // Retry windows by deferral type
    const RETRY_WINDOWS = [
        'resume_incomplete'  => 1,   // days
        'deferred_gate'      => 30,
        'deferred_product'   => 30,
        'slot_alert'         => 0,   // immediate when triggered
        'proposal_followup'  => 7,
        'budget_not_now'     => 45,
    ];

    public function queue(PitchSession $session, string $type, array $context = []): void
    {
        $sendAfter = now()->addDays(self::RETRY_WINDOWS[$type]);
        $smb = SMB::find($session->smb_id);
        $customer = Customer::find($session->customer_id);

        if (!$customer?->email) return;

        // Write to re-engagement queue
        PitchReengagementQueue::create([
            'session_id'        => $session->id,
            'smb_id'            => $session->smb_id,
            'customer_id'       => $session->customer_id,
            'contact_email'     => $customer->email,
            'reengagement_type' => $type,
            'context'           => array_merge($context, [
                'business_name'    => $smb?->name,
                'community_name'   => Community::find($session->community_id)?->name,
                'last_step'        => $session->last_step,
                'gates_deferred'   => $smb?->gates_deferred ?? [],
                'products_deferred'=> $smb?->products_deferred ?? [],
                'slot_counts'      => $this->getCurrentSlotCounts($session),
            ]),
            'send_after' => $sendAfter,
            'status'     => 'queued',
        ]);
    }

    /**
     * Dispatched by scheduler — checks queue, creates OutboundCampaign sends
     */
    public function dispatch(): void
    {
        $due = PitchReengagementQueue::where('status', 'queued')
            ->where('send_after', '<=', now())
            ->get();

        foreach ($due as $item) {
            $this->send($item);
        }
    }

    private function send(PitchReengagementQueue $item): void
    {
        $template = $this->resolveTemplate($item->reengagement_type, $item->context);
        
        // Use existing OutboundCampaign system
        $campaign = OutboundCampaign::create([
            'type'       => 'email',
            'name'       => "Re-engagement: {$item->reengagement_type} — {$item->context['business_name']}",
            'subject'    => $template['subject'],
            'body'       => $template['body'],
            'status'     => 'sending',
            'source'     => 'pitch_reengagement',
            'metadata'   => ['pitch_queue_id' => $item->id],
        ]);

        // Add recipient
        CampaignRecipient::create([
            'campaign_id' => $campaign->id,
            'customer_id' => $item->customer_id,
            'email'       => $item->contact_email,
        ]);

        $item->update([
            'status'                => 'sent',
            'outbound_campaign_id'  => $campaign->id,
            'sent_at'               => now(),
        ]);
    }

    private function resolveTemplate(string $type, array $context): array
    {
        return match($type) {
            'resume_incomplete' => [
                'subject' => "We never finished your {$context['community_name']} plan, {$context['contact_name']}",
                'body'    => view('emails.pitch.resume_incomplete', $context)->render(),
            ],
            'deferred_gate' => [
                'subject' => "{$context['business_name']} — got a minute?",
                'body'    => view('emails.pitch.deferred_gate', $context)->render(),
            ],
            'slot_alert' => [
                'subject' => "{$context['community_name']} — {$context['category']} spots are filling up",
                'body'    => view('emails.pitch.slot_alert', $context)->render(),
            ],
            'proposal_followup' => [
                'subject' => "Your {$context['community_name']} proposal is still here",
                'body'    => view('emails.pitch.proposal_followup', $context)->render(),
            ],
            default => throw new \InvalidArgumentException("Unknown reengagement type: {$type}"),
        };
    }
}
```

### `SlotInventoryService`

```php
final class SlotInventoryService
{
    const CACHE_TTL = 300; // 5 minutes

    public function getStatus(string $communityId, string $slotType, string $category): array
    {
        $cacheKey = "slot:{$communityId}:{$slotType}:{$category}";
        
        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($communityId, $slotType, $category) {
            $slot = CommunitySlotInventory::where([
                'community_id' => $communityId,
                'slot_type'    => $slotType,
                'category'     => $category,
            ])->first();

            if (!$slot) return ['status' => 'unknown', 'total' => 0, 'held' => 0, 'available' => 0];

            $available = $slot->total_slots - $slot->held_slots;

            return [
                'total'     => $slot->total_slots,
                'held'      => $slot->held_slots,
                'available' => $available,
                'held_by'   => $slot->held_by,
                'status'    => match(true) {
                    $available === 0      => 'full',
                    $available <= 2       => 'almost_full',
                    default               => 'open',
                },
            ];
        });
    }

    public function claimSlot(string $communityId, string $slotType, string $category, string $smbId): bool
    {
        return DB::transaction(function () use ($communityId, $slotType, $category, $smbId) {
            $slot = CommunitySlotInventory::where([
                'community_id' => $communityId,
                'slot_type'    => $slotType,
                'category'     => $category,
            ])->lockForUpdate()->first();

            if (!$slot || $slot->held_slots >= $slot->total_slots) {
                return false;
            }

            $heldBy = $slot->held_by ?? [];
            $heldBy[] = $smbId;

            $slot->update([
                'held_slots' => $slot->held_slots + 1,
                'held_by'    => $heldBy,
            ]);

            // Bust cache
            Cache::forget("slot:{$communityId}:{$slotType}:{$category}");

            // Check if any queued pitches were watching this slot
            $this->notifySlotWatchers($communityId, $slotType, $category);

            return true;
        });
    }

    /**
     * When a slot fills up, trigger slot_alert re-engagement for any SMB
     * that was shown that slot but deferred
     */
    private function notifySlotWatchers(string $communityId, string $slotType, string $category): void
    {
        $watchers = SMB::whereJsonContains('gates_deferred->gate', $slotType)
            ->whereJsonContains('communities_of_interest', $communityId)
            ->get();

        foreach ($watchers as $smb) {
            $session = PitchSession::where('smb_id', $smb->id)
                ->latest()
                ->first();
            if ($session) {
                app(ReengagementQueueService::class)->queue($session, 'slot_alert', [
                    'slot_type' => $slotType,
                    'category'  => $category,
                    'community_id' => $communityId,
                ]);
            }
        }
    }
}
```

---

## COMMAND CENTER VIEWS

These are the CC pages that surface pitch intelligence for human review and follow-up management.

### CC Route: `/command-center/pitch` — Pitch Intelligence Dashboard

**What it shows:**
- Today's pitch activity (sessions started, completed, abandoned, converted)
- MRR pipeline from active proposals
- Abandonment funnel (where sessions are dropping off)
- Slot fill rates by community/category

```
┌─────────────────────────────────────────────────────────────────────┐
│  Pitch Intelligence                          Today  Week  Month     │
├───────────┬───────────┬───────────┬──────────────────────────────── │
│  Started  │ Completed │ Converted │  Pipeline MRR                   │
│    12     │     8     │     3     │  $4,200/mo                      │
└───────────┴───────────┴───────────┴────────────────────────────────┘

  Abandonment Funnel
  IDENTIFY ████████████████ 100%
  COMMUNITY ██████████████░ 92%
  GOALS ████████████░░░░░░░ 78%
  YOUR PLAN ██████████░░░░░ 64%
  PROPOSAL █████████░░░░░░░ 58%
  CONVERTED ██████░░░░░░░░░ 38%

  Gate Permission Rates
  Day.News     ████████████████ 94%
  Events       ████████████░░░░ 78%
  DTG          ███████████░░░░░ 72%
  AlphaSite    █████████░░░░░░░ 61%
  GLV          ████████░░░░░░░░ 53%
```

---

### CC Route: `/command-center/pitch/follow-ups` — Follow-Up Inbox

**The primary CC view for the pitch system. Surfaces every incomplete pitch, deferred gate, and unconverted proposal that needs a follow-up action.**

**Filters:** All | Incomplete Pitches | Deferred Gates | Unconverted Proposals | Re-engagement Due

**Each row shows:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  Sunrise Bakery — Clearwater               Incomplete Pitch        │
│  Alex Martinez · alex@sunrisebakery.com                            │
│  Last active: 2 hours ago · Left at: AlphaSite gate               │
│                                                                     │
│  Completed: Day.News ✓  Downtown Guide ✓  Events ✓                 │
│  Skipped: AlphaSite (not now)                                      │
│  Proposal value if closed: $300/mo                                 │
│                                                                     │
│  [ Send Resume Email ]  [ Complete for them → ]  [ Mark as Lost ] │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Harbor Grill — Clearwater                 Proposal Not Accepted   │
│  Mike Chen · mike@harborgrill.com                                   │
│  Proposal sent: 8 days ago · Value: $450/mo                        │
│                                                                     │
│  Proposed: Community Influencer + Event Headliner                  │
│  Founder rate expires: 6 days                                      │
│                                                                     │
│  [ Send Reminder ]  [ Adjust Proposal ]  [ Mark as Lost ]         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Dunedin Yoga — Dunedin                    Deferred Gate: Events   │
│  Sarah Kim · sarah@dunedin-yoga.com                                 │
│  Deferred 28 days ago · Retry window: today                        │
│                                                                     │
│  Said "not now" to: Events gate, AlphaSite gate                    │
│  Has: Community Influencer (active)                                 │
│                                                                     │
│  [ Re-pitch Events gate ]  [ Send Email ]  [ Defer again ]        │
└─────────────────────────────────────────────────────────────────────┘
```

**"Complete for them →" action:**
Opens a CC panel showing the remaining gates for that business pre-loaded with their profile data. An operator or re-engagement agent can complete the pitch on their behalf and email them the finished proposal without them needing to re-enter anything.

---

### CC Route: `/command-center/pitch/proposals` — Proposal Pipeline

Kanban or table view of all proposals by status.

**Columns:** Draft → Presented → Followed Up → Won → Lost → Expired

Each card shows: business name, community, proposal value, products, days since presented, founder rate expiry countdown.

**Batch actions:**
- Send reminder to all "Presented > 7 days, no response"
- Flag all "Founder rate expires < 7 days" for priority outreach
- Export proposal pipeline as CSV

---

### CC Route: `/command-center/pitch/slots` — Slot Inventory Manager

**Lets operators seed and manage slot inventory across communities.**

```
  Community Slot Inventory — Clearwater

  ┌──────────────────┬───────┬──────┬──────────┬──────────────────┐
  │ Category         │ Type  │ Total│ Held     │ Status           │
  ├──────────────────┼───────┼──────┼──────────┼──────────────────┤
  │ Restaurants      │ Influ │ 5    │ ■■■□□ 3  │ 2 remaining      │
  │ Restaurants      │ HDL   │ 1    │ ■□□□□ 1  │ FULL             │
  │ Retail           │ Influ │ 5    │ □□□□□ 0  │ Open             │
  │ Bars/Breweries   │ Influ │ 5    │ ■■□□□ 2  │ 3 remaining      │
  └──────────────────┴───────┴──────┴──────────┴──────────────────┘

  [ + Add community ]  [ Seed from template ]  [ Export ]
```

**Slot count changes fire `notifySlotWatchers` automatically.**

---

### CC Route: `/command-center/pitch/smb/:id` — SMB Pitch Detail

Extends the existing `/crm/customers/:id` view with a Pitch tab.

**Pitch tab shows:**
- Pitch status (badge: Never Pitched / In Progress / Proposed / Converted)
- All pitch sessions with timestamps and outcomes
- Gates completed / deferred with reasons
- Products accepted / declined / deferred
- Full pitch conversation thread (from `conversations` table)
- Re-engagement history (what was sent, opened, clicked)
- Founder rate expiry countdown
- Quick actions: Resume pitch / Send email / Complete proposal for them

---

## SCHEDULER ENTRIES

Add to `app/Console/Kernel.php`:

```php
// Dispatch due re-engagement emails
$schedule->call(fn() => app(ReengagementQueueService::class)->dispatch())
         ->everyFifteenMinutes();

// Mark sessions abandoned if inactive > 4 hours
$schedule->call(fn() => PitchSession::where('status', 'pitching')
    ->where('last_active_at', '<', now()->subHours(4))
    ->update(['status' => 'abandoned', 'abandoned_at' => now()])
)->hourly();

// Check for founder rate expirations — queue alerts
$schedule->call(fn() => app(FounderRateAlertService::class)->checkExpirations())
         ->dailyAt('09:00');
```

---

## MIGRATION ORDER

```
1. alter_smbs_table_add_pitch_fields.php
2. create_pitch_sessions_table.php
3. create_community_slot_inventory_table.php
4. create_pitch_reengagement_queue_table.php
5. seed_community_slot_inventory.php    ← seed on per-community launch
```

---

## PLATFORM DECISION

**Both tracks work. Here's the honest tradeoff:**

| Approach | Pro | Con |
|---|---|---|
| Build pitch UI in PP, CC gets read/write via API | Clean separation — public-facing entry in PP, internal ops in CC | Two codebases to maintain, API surface between them |
| Build pitch UI in CC, serve as public route | One codebase, full access to existing CRM/campaign infrastructure without API layer | CC is internal-facing — serving a public sales flow from it is unconventional |
| Build pitch as standalone frontend, both CC and PP point to it | Maximum flexibility, can be embedded anywhere | Third codebase |

**Recommendation:** Build the pitch UI in CC at a public route (`/advertise/:communitySlug`). The backend is already there — `Customer`, `SMB`, `OutboundCampaign`, `Conversation` are all in that system. No API layer needed between the pitch flow and the CRM. PP simply links out to it with entry context params. This is the fastest path to a working system.

When the pitch is embedded on PP pages in the future, it can be served as an iframe or extracted as a shared package. That's a later problem.

---

## CURSOR AGENT BRIEF — BACKEND

```
Build the Sarah Pitch Engine backend for the Fibonacco CC Laravel application.

FILES TO CREATE:

app/Services/Pitch/PitchEnrichmentService.php
app/Services/Pitch/ReengagementQueueService.php  
app/Services/Pitch/SlotInventoryService.php
app/Services/Pitch/FounderRateAlertService.php

app/Models/PitchSession.php
app/Models/CommunitySlotInventory.php
app/Models/PitchReengagementQueue.php

app/Http/Controllers/Pitch/PitchSessionController.php
app/Http/Controllers/Pitch/SlotInventoryController.php
app/Http/Controllers/Pitch/PitchAnalyticsController.php

database/migrations/
  [timestamp]_alter_smbs_table_add_pitch_fields.php
  [timestamp]_create_pitch_sessions_table.php
  [timestamp]_create_community_slot_inventory_table.php
  [timestamp]_create_pitch_reengagement_queue_table.php

database/seeders/CommunitySlotInventorySeeder.php

resources/views/emails/pitch/
  resume_incomplete.blade.php
  deferred_gate.blade.php
  slot_alert.blade.php
  proposal_followup.blade.php

routes/pitch.php

EXISTING MODELS TO MODIFY:
- SMB: add columns per migration, add pitch relationship methods
- Customer: ai_context update method, pitch_sessions relationship
- Conversation: add 'pitch' to type enum

KEY REQUIREMENTS:
1. PitchEnrichmentService.process() is called on every pitch event — it is the single 
   write path to SMB and Customer. Nothing else writes pitch data directly to those models.
2. SlotInventoryService.claimSlot() uses DB transaction with lockForUpdate() — 
   race conditions on slot claims must be impossible.
3. ReengagementQueueService uses existing OutboundCampaign infrastructure — 
   do not build a parallel email system.
4. All scheduler entries added to Kernel.php.
5. No string in any email template uses the words "AI" or "automated".
   Outcome language only: "handles it", "takes care of it", "works around the clock".
```

---

# PART 4 — UI SCREEN SPEC (All Pages and Components)

# Sarah Pitch Engine — UI Screen Specifications
## Complete Screen Inventory with Design System, Content, and Build Instructions

> **Read alongside:** `SARAH_PITCH_ENGINE_SPEC.md` and `SARAH_CAMPAIGN_BUILDER_SPEC.md`
> **Design reference:** 7 existing screens establish the design system. All new screens conform to it exactly.

---

## DESIGN SYSTEM (From Existing Screens)

### Layout
- **Two-panel split:** Left ~62% content area, Right ~38% Sarah chat panel
- **Chat panel:** Always visible, always active. Sarah responds to each step in real time.
- **Step progress bar:** Top center. Steps are numbered circles connected by lines. Completed = filled teal with checkmark. Active = teal ring with number. Upcoming = dark gray with number.
- **Bottom bar (some screens):** Fixed. Back (left) + primary CTA (right, teal pill button).
- **Header:** Dark navy bar. Just1Hug logo left, platform logos (Day.News, GEC, DTG, AlphaSite) next to it. Progress steps center. × close right.

### Colors
```css
--bg-primary: #0d1229        /* deep navy — main background */
--bg-panel: #1a2040          /* slightly lighter — panels, cards */
--bg-card: #1f2645           /* card backgrounds */
--border: #2a3260            /* card borders */
--text-primary: #ffffff
--text-secondary: #8892b0
--accent-teal: #00d4ff       /* Day.News cyan — primary CTAs, active states */
--accent-orange: #ff8c00     /* Sarah avatar, warning states */
--accent-amber: #f59e0b      /* Founder pricing callout */
--accent-green: #00cc6a      /* GoEventCity green — savings, available status */
--accent-purple: #8b5cf6     /* Downtown Guide purple */
--slot-full: #ef4444         /* red — full/unavailable */
--slot-low: #f59e0b          /* amber — 1-2 remaining */
--slot-open: #00cc6a         /* green — available */
```

### Typography
- **Headlines:** Bold, white, large (36–48px on content screens)
- **Subheadlines:** Regular weight, secondary color, 14–16px
- **Body:** 14–15px, secondary color
- **Labels:** 11–12px, uppercase, letter-spaced, secondary color
- **Sarah messages:** 15px, white/near-white, left-bordered with amber/orange

### Components
- **Chip/pill answer buttons:** Outlined dark, rounded. Selected = teal fill.
- **Cards:** Dark panel bg, 1px border, 12–16px border-radius
- **Primary CTA:** Teal background, dark text, pill shape, full-width or 280px
- **Secondary CTA:** Outlined, white text
- **Sarah message block:** Left orange/amber border, slightly lighter bg, timestamp below
- **Slot bar:** Visual fill bar (teal fill on dark track) + fractional text
- **Status badge:** Small pill — "AVAILABLE IN CLEARWATER" (green), "FULL" (red), "ALMOST FULL" (amber)

### Sarah Chat Panel Behavior
- Sarah avatar: Orange circle, "S" initial
- Title: "Sarah" bold, "AI Account Manager" subtitle
- Messages appear with left amber border
- Timestamp below each message
- Input bar at bottom: mic icon left, "Ask Sarah anything..." placeholder, send icon right
- Audio toggle icon top right of panel
- Sarah speaks at each step transition — her message is pre-scripted, not improvised

---

## EXISTING SCREENS (Do Not Rebuild)

| Step | Screen Name | Status |
|---|---|---|
| 1 | IDENTIFY — Business Search | ✅ Built |
| 2 | COMMUNITY — Where do customers live? | ✅ Built |
| 3 | GOALS — Tell me about your goals | ✅ Built |
| 4 | PROPOSAL — Here's what I'd recommend | ✅ Built |
| 5 | UPGRADES — Want to go further? | ✅ Built |
| 6 | YOUR DEAL — Review & Checkout | ✅ Built |
| 7 | DONE — You're in | ✅ Built |

---

## MISSING SCREENS — BUILD THESE

The current flow skips the gate system entirely and jumps from Goals directly to Proposal. The gate screens sit between Goals and Proposal and are the core of the pitch engine.

**New complete flow:**
```
IDENTIFY → [PROFILE TYPE] → COMMUNITY → [TERRITORY] → GOALS → [GATE SEQUENCE] → PROPOSAL → UPGRADES → YOUR DEAL → CHECKOUT → DONE
```

Brackets = new screens to build.

---

## SCREEN: PROFILE TYPE
**Step position:** Between IDENTIFY and COMMUNITY (insert into progress bar as step 1.5 or merge into IDENTIFY step)
**File:** `steps/ProfileTypeStep.tsx`

### Purpose
Captures org type before any pitch begins. Determines pitch track. The user sees this once per business, then it's saved to their profile.

### Layout
Left panel — content. Right panel — Sarah chat.

### Content

**Headline:** `What best describes [Business Name]?`
**Subhead:** `This helps me build the right plan — not just a generic package.`

**Answer cards (large, selectable, icon + label):**

```
┌──────────────────────┐  ┌──────────────────────┐
│  🏪                  │  │  🎪                  │
│  Local Business      │  │  Event Venue         │
│  Retail, restaurant, │  │  Rental space,       │
│  service, or shop    │  │  banquet, event hall │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│  🎵                  │  │  🎓                  │
│  Performer /         │  │  School or           │
│  Entertainer         │  │  Educational Org     │
│  Artist, DJ, band,   │  │  K-12, university,  │
│  comedian, speaker   │  │  tutoring, classes   │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│  🤝                  │  │  🏛️                  │
│  Non-Profit /        │  │  Government /        │
│  Civic Org           │  │  Municipality        │
│  501(c), charity,    │  │  City office, dept,  │
│  community group     │  │  public service      │
└──────────────────────┘  └──────────────────────┘
```

**Secondary question (appears after card selected):**
`Does [Business Name] host or promote events?`
Toggle: `Yes, regularly` / `Occasionally` / `Not at all`

**Bottom bar:** Back | Continue →

### Sarah Message (scripted, fires on step load):
> *"Perfect. Knowing what kind of organization you are helps me skip past everything that doesn't apply and get right to what matters for you."*

### Data captured:
`org_type`, `has_events` → written to `business_pitch_profiles`

---

## SCREEN: TERRITORY EXPANSION
**Step position:** After COMMUNITY, before GOALS (or inline within COMMUNITY step as a second sub-screen)
**File:** `steps/TerritoryStep.tsx`

### Purpose
Shows the full county/region map. Anchors big, lets them narrow. Plants the competitive lockout concept. Shows live slot status per community.

### Layout
Left panel — content with community selector. Right panel — Sarah chat.

### Content

**Headline:** `Where does your business reach?`
**Subhead:** `[Community] is your home base. Do your customers come from nearby areas too?`

**Community list (not a map — a scannable list with status indicators):**

```
┌─────────────────────────────────────────────────────┐
│  YOUR COMMUNITY                                     │
│                                                     │
│  ◉  Clearwater           [Restaurants: ■■■□□ 2 left]│
│     Home community · 3 of 5 Influencer slots held  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  NEARBY COMMUNITIES                                 │
│                                                     │
│  ○  Dunedin              [Restaurants: □□□□□ Open] │
│  ○  Safety Harbor        [Restaurants: ■■■■□ 1 left]│
│     ⚠ Almost full                                  │
│  ○  Largo                [Restaurants: ■■■■■ Full] │
│     ✕ Category full — Section Sponsor available    │
│  ○  Palm Harbor          [Restaurants: □□□□□ Open] │
│  ○  Oldsmar              Launching Q2 · Reserve now│
└─────────────────────────────────────────────────────┘

  + Show more communities in [County]
```

**Framing text above list (static, rendered once):**
> *"Positions in each community are limited per category — whoever holds one, holds it. A competitor who signs up after you can't take the same position."*

**Multi-select:** Checkboxes on each community. Home community pre-checked, cannot be deselected.

**Bottom bar:** Back | Continue with [N] communities →

### Sarah Message (scripted):
> *"I'd at least look at Safety Harbor — there's only one spot left in Restaurants. Once it's gone, no other restaurant can hold that position. You don't have to commit today, but it's worth knowing."*

### Data captured:
`territory_selection` → array of `community_id`s. `territory_offered` event logged with slot states at time of display.

---

## SCREEN: GATE — DAY.NEWS PREMIUM
**Step position:** In the gate sequence, after GOALS
**File:** `gates/DayNewsGate.tsx`
**Step label in progress bar:** Shown as part of "PROPOSAL" step group, or add "YOUR PLAN" step

### Purpose
First gate for every business. Introduces the position vs. participation concept. Shows premium listing benefits and slot status.

### Layout
Full two-panel layout. Left = gate content. Right = Sarah chat.

### Content

**Headline:** `[Community] sees 10 news articles a day. Here's where [Business Name] shows up.`

**Slot status block (live data, top of content):**
```
┌─────────────────────────────────────────────────────┐
│  [Category] — Clearwater                           │
│                                                     │
│  Community Influencer spots                         │
│  ■ ■ ■ □ □    3 of 5 held · 2 remaining            │
│                                                     │
│  Headliner position                                 │
│  ■ ■ ■ ■ ■    FULL · Held by [Business Name]       │
└─────────────────────────────────────────────────────┘
```

**Position ladder visual:**
```
  ① HEADLINER        ← [Competitor name] holds this
  ─────────────────────────────────────────────────
  ② PRIORITY LISTING ← You'd be here with Influencer
  ③ PRIORITY LISTING
  ─────────────────────────────────────────────────
  ④ Basic listing    ← [Business Name] is here now
  ⑤ Basic listing
  ⑥ Basic listing
  ...
```

**What's in the package (shown after permission granted):**

```
┌─────────────────────────────────────────────────────┐
│  Community Influencer — $300/mo                     │
│  Included in [Community]                            │
│                                                     │
│  ✓  Premium listing — photos, description, badge    │
│  ✓  Priority position — above all basic listings   │
│  ✓  1 article per month (published + newsletter)   │
│  ✓  5 announcements per month                      │
│  ✓  5 classified listings per month                │
│  ✓  25% off all display advertising                │
│                                                     │
│  [ Add to my plan — $300/mo ]                       │
└─────────────────────────────────────────────────────┘
```

**Add-on cards (below, only shown if slot available):**

```
┌─────────────────────────────────────────────────────┐
│  Newsletter Sponsor                    $150/send    │
│  Top of the morning newsletter — every subscriber  │
│  sees it before they read anything else.           │
│  One slot per community.                           │
│                                                     │
│  [ Add this ]  [ Skip ]                             │
└─────────────────────────────────────────────────────┘
```

**Headliner full → fallback card:**
```
┌─────────────────────────────────────────────────────┐
│  Headliner is taken in [category].                 │
│  Section Sponsor is the next level — you own a    │
│  topic section of the news. No slot limit.         │
│                                                     │
│  Available sections in Clearwater:                 │
│  Local Business · Real Estate · Health & Wellness  │
│                                                     │
│  [ Browse sections ]  [ Skip for now ]             │
└─────────────────────────────────────────────────────┘
```

**Bottom bar:** Skip this section | Add to plan →

### Sarah Messages:
**On step load (permission ask):**
> *"[Business Name] already has a basic listing — that exists whether you do anything or not. Can I take two minutes to show you what the difference looks like between where you are now and where the top [category] businesses in Clearwater appear?"*

**After permission granted:**
> *"The Headliner in [category] is taken — but Priority Listing still puts you above everyone who isn't paying for position. There are 2 Influencer slots left in your category. Here's what that gets you."*

**After product added:**
> *"Good. That locks your position. Let me show you a couple more things."*

### Events logged:
`gate_offered` (day_news), `gate_permission_granted/denied/deferred`, `product_presented` × N, `product_accepted/declined/deferred` × N, `slot_inventory_shown`, `slot_full_shown` (if headliner full), `fallback_offered` (if applicable)

---

## SCREEN: GATE — DOWNTOWN GUIDE
**File:** `gates/DowntownGuideGate.tsx`
**Shown when:** `org_type` is SMB AND has physical location

### Content

**Permission ask (Sarah message fires first — user sees it before content expands):**
> *"Because you have a physical location, the Downtown Guide is worth a minute. It's where people in Clearwater search for places to go and shop. Can I show you what your listing looks like there?"*

**Response buttons (full width of content panel, large):**
```
[ Yes, show me ]     [ Skip this section ]
```

**On YES — content expands:**

**Headline:** `The Downtown Guide is how [Community] finds local businesses.`

**Comparison block:**
```
┌────────────────────┐     ┌────────────────────┐
│  BASIC LISTING     │     │  PREMIUM LISTING   │
│  (You are here)   │     │  (After upgrade)   │
│                    │     │                    │
│  Name              │     │  20 photos + video │
│  Phone             │     │  Full description  │
│  Address           │     │  Menu / services   │
│  Category          │     │  Verified badge    │
│                    │     │  Coupons           │
│  No position perk  │     │  Priority sort     │
│                    │     │  Analytics         │
└────────────────────┘     └────────────────────┘
```

**Slot status:**
```
  DTG Headliner — [category] — Clearwater
  □ □ □ □ □   Available — 0 of 1 held
  [ Claim Headliner — $150/mo ]
```

**Product cards:**
- Premium Listing (included in Influencer — shown as "included, no extra cost")
- Headliner — if available: claim card. If taken: show fallback.
- Poll Participation — Featured ($49) or Premium ($149) — show both as selectable

**Bottom bar:** Skip | Continue →

### Sarah Message after YES:
> *"Your profile there right now is just a name and address. Here's what a Premium Listing looks like — and the Headliner in [category] is actually open right now."*

---

## SCREEN: GATE — EVENTS
**File:** `gates/EventGate.tsx`
**Shown when:** `has_events` is true OR category suggests events

### Permission section (always rendered first, gate is closed until YES):

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Something that can really drive traffic for a     │
│  business like yours is promoting events properly. │
│                                                     │
│  Even smaller ones — tastings, classes, pop-ups — │
│  can move the needle when they're promoted right.  │
│                                                     │
│  Can I give you two minutes on how it works?       │
│                                                     │
│  [ Yes, show me ]          [ Skip events ]         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**On YES — content expands:**

**Headline:** `GoEventCity is [Community]'s event calendar. Here's how to be seen in it.`

**Event calendar position visual:**
```
  THIS WEEKEND IN CLEARWATER

  ┌─────────────────────────────────────────────────┐
  │ ★ EVENT HEADLINER               [Category]     │  ← 1 slot, $150/mo
  │   [Big photo · Full description · CTA button]  │
  └─────────────────────────────────────────────────┘
  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │ ↑ Priority │  │ ↑ Priority │  │ ↑ Priority │    ← Influencer included
  └────────────┘  └────────────┘  └────────────┘
  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │   Basic    │  │   Basic    │  │   Basic    │    ← Where you are now
  └────────────┘  └────────────┘  └────────────┘
  ... 30 more events ...
```

**Included in Influencer — event package:**
```
  ✓  1 premium event per month — priority placed
  ✓  Cross-posted to Day.News morning feed automatically
  ✓  Automated reminder to everyone who registers
  ✓  Distributed to community social accounts
```

**Add-on cards:**
- Event Headliner (if open) — slot status + price
- Ticket Sales — "Advance tickets online. Lower commission than most services."
- Calendar Subscription — "Customers subscribe to your calendar. Auto-notified for every new event."
- "Since You're Going To..." — shown only if has_events + goal is retention

**Sub-gate expansion (if venue or performer — additional section revealed):**

**Venue sub-section:**
```
  ┌──────────────────────────────────────────────┐
  │  Is [Business Name] a rentable event space?  │
  │                                              │
  │  [ Yes, we book private events ]   [ No ]   │
  └──────────────────────────────────────────────┘
```
→ If YES: expands venue-specific products (Venue Headliner, Booking System)

**Performer sub-section:**
```
  ┌──────────────────────────────────────────────┐
  │  Do you perform or are you available         │
  │  for bookings?                               │
  │                                              │
  │  [ Yes, I perform / we book ]    [ No ]     │
  └──────────────────────────────────────────────┘
```
→ If YES: expands performer-specific products

---

## SCREEN: GATE — GOLOCALVOICES
**File:** `gates/GoLocalVoicesGate.tsx`
**Shown when:** Professional services category OR org explicitly wants content presence

### Permission block:
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  What you do is different from most businesses —  │
│  people have to trust you before they hire you.   │
│                                                     │
│  There's a way to build that in [Community] that  │
│  isn't advertising. Can I take a minute?          │
│                                                     │
│  [ Yes, tell me ]          [ Skip ]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**On YES:**

**Headline:** `Be the [attorney / advisor / coach] [Community] reads every week.`

**Column preview mockup (visual):**
```
  ┌───────────────────────────────────────────────┐
  │  GoLocalVoices                                │
  │                                               │
  │  THE LEGAL GUIDE · By [Name], [Business]     │
  │  ─────────────────────────────────────────── │
  │  "5 things Clearwater homeowners should      │
  │   know before signing a contractor"          │
  │                                               │
  │  [Business Name]  ·  [Category]  ·  Clearwater│
  └───────────────────────────────────────────────┘
```

**Products:**
- Headline Spot (included in Influencer) — "Your named column, published regularly."
- Community Expert upgrade (+$100/mo) — "Category exclusivity. No other [profession] can hold a Headline Spot in [Community] while you do."

**Slot status for Expert upgrade:**
```
  [Profession] Expert column — Clearwater
  □ □ □ □ □   Available
  [ Add Expert Column — +$100/mo ]
```

---

## SCREEN: GATE — ALPHASITE
**File:** `gates/AlphaSiteGate.tsx`
**Shown when:** Almost always — qualifying question determines depth

### Qualifying question (shown before permission, always):

```
┌─────────────────────────────────────────────────────┐
│  Quick question —                                  │
│                                                     │
│  If someone searched for a [their service]         │
│  in [Community] right now, does [Business Name]   │
│  come up prominently?                              │
│                                                     │
│  [ Yes, we show up well ]                          │
│  [ Somewhat — not as well as I'd like ]            │
│  [ Not really / Not sure ]                         │
└─────────────────────────────────────────────────────┘
```

**If "Yes, we show up well":**
→ Follow-up: "Has the site been updated in the last year?" Yes → gate closes, log `alphasite_gate_skipped_qualified`. No → gate opens.

**If "Somewhat" or "Not really":**
→ Permission ask appears:

```
  That's worth fixing. Can I take 30 seconds to show
  you what the gap is and how we close it?

  [ Yes, show me ]     [ Skip ]
```

**On YES:**

**Headline:** `How people find local businesses has changed. Here's where [Business Name] stands.`

**Simple visual — search result illustration:**
```
  When someone searches "[their service] in [Community]"

  ┌───────────────────────────────────────────────┐
  │  🔍  "[service] in [community]"               │
  │                                               │
  │  ✦  [Competitor A] — Complete profile         │
  │  ✦  [Competitor B] — Complete profile         │
  │  ✦  [Competitor C] — Complete profile         │
  │                                               │
  │  [Business Name] — Basic listing              │  ← You, currently
  └───────────────────────────────────────────────┘
```

**What AlphaSite does:**
```
  ✓  Complete, current business profile
  ✓  Connected to Day.News, Downtown Guide, GoEventCity
     — one update, reflected everywhere
  ✓  Priority listing in AlphaSite directory
  ✓  Included in Community Influencer package
```

**Intake volume sub-gate (conditional — shown if category suggests phone intake):**
```
  ┌──────────────────────────────────────────────┐
  │  One more thing —                            │
  │                                              │
  │  How much of your day involves answering     │
  │  the same questions? Hours, services,        │
  │  appointments, directions?                   │
  │                                              │
  │  [ A lot — it takes real time ]              │
  │  [ Some, but it's manageable ]               │
  │  [ Not really an issue ]                     │
  └──────────────────────────────────────────────┘
```

→ "A lot": Expands automated response product card:
```
  ┌──────────────────────────────────────────────────┐
  │  Customer Response Service              $99/mo  │
  │                                                  │
  │  Handles inbound questions around the clock.    │
  │  Customers get answers immediately — no hold,   │
  │  no voicemail, no waiting for you to call back. │
  │                                                  │
  │  ○ Phone answering                               │
  │  ○ Email response                                │
  │  ○ Website chat                                  │
  │                                                  │
  │  [ Add this ]  [ Skip ]                          │
  └──────────────────────────────────────────────────┘
```

**Note for implementation:** Never use "AI" in any string in this component. Outcome language only.

---

## SCREEN: GATE — CIVIC TRACK
**File:** `gates/CivicGate.tsx`
**Shown when:** `org_type` in [school, nonprofit, government]
**Replaces:** Day.News gate, Downtown Guide gate, Event gate for these orgs

### Different framing — not advertising, community participation:

**Headline:** `[Organization Name] is part of the community. Here's how to stay visible in it.`

**What's free:**
```
  ✓  Directory listing — all platforms
  ✓  Event calendar access — events appear in GoEventCity
  ✓  Announcements — published to the community feed
  ✓  Cross-post to Day.News — major events and announcements
     reach the full subscriber base
```

**Paid options (framed as "enhanced reach" not advertising):**
- Premium Event Listing for major events
- Event Headliner for annual flagship events
- Newsletter inclusion
- GoLocalVoices column (for school superintendent, executive director, elected official)

### Sarah Message:
> *"Schools, non-profits, and government offices participate differently than businesses — and that's the right call. Your basic presence is included at no cost. What we're talking about is whether you want the community to see your biggest events more prominently."*

---

## SCREEN: FAST-PATH NAVIGATION
**File:** `components/FastPathNav.tsx`
**Shown when:** User has completed profile step (profile exists) — appears as persistent floating element

### Purpose
Allows experienced users or returning users who know what they want to skip to a specific gate.

### UI
Floating bar below header, above main content — thin, collapsible.

```
┌─────────────────────────────────────────────────────────────────┐
│  I already know what I want →                                   │
│  [ News Presence ]  [ Directory ]  [ Events ]  [ My Website ]  │
│                                                              ↑  │
│                                                         [Close] │
└─────────────────────────────────────────────────────────────────┘
```

Clicking a fast-path option:
1. Logs `gate_skipped_fast_path` for all skipped gates
2. Jumps directly to that gate
3. After that gate completes, resumes normal remaining sequence

**Fast-path labels → gate mapping:**
| Label | Gate |
|---|---|
| News Presence | day_news |
| Directory | downtown_guide |
| Events | event_host → venue → performer (whichever applies) |
| Expert Column | golocalvoices |
| My Website | alphasite |
| Sponsorships | section_sponsor (opens inline) |

---

## SCREEN: RESUME PROMPT
**File:** `components/ResumePrompt.tsx`
**Shown when:** User returns with an incomplete session (cookie/email resume)

### Layout
Replaces the IDENTIFY screen if session is detected. Same two-panel layout.

**Variant A — Same browser, recent session:**

**Headline:** `Welcome back, [Name].`
**Subhead:** `You were in the middle of building a plan for [Business Name] in [Community].`

```
┌─────────────────────────────────────────────────────┐
│  You got through [last completed step].             │
│  [Next step] is next — takes about 2 minutes.      │
│                                                     │
│  [ Pick up where I left off → ]                    │
│                                                     │
│  ─── or ─────────────────────────────────────────  │
│                                                     │
│  [ Start fresh for [Business Name] ]               │
│  [ This is a different business ]                  │
└─────────────────────────────────────────────────────┘
```

**Variant B — Email resume link:**

**Headline:** `Let's finish what we started.`
**Subhead:** `[Business Name] · [Community]`

```
  You were looking at [last gate topic].
  [X] of [Y] [category] spots remain in [Community].

  [ Continue → ]
```

### Sarah Message:
> *"You were about to see [next gate]. It takes about 2 minutes and I'll have a complete plan ready for you right after."*

---

## SCREEN: SLOT FULL — FALLBACK MODAL
**File:** `components/SlotFullFallback.tsx`
**Shown as:** Inline within the gate content (not a modal overlay)

### Triggered when:
- `community_slot_inventory` shows `held_slots >= total_slots` for the requested slot type

### Content pattern (adapts by slot type):

**Influencer slot full:**
```
┌─────────────────────────────────────────────────────┐
│  [Category] Influencer slots in [Community]         │
│  are full.                                          │
│                                                     │
│  There's another option that doesn't have a slot   │
│  limit: Section Sponsor. You own a topic section   │
│  of the news — every article in that section       │
│  carries your name.                                 │
│                                                     │
│  AVAILABLE SECTIONS IN [COMMUNITY]:                 │
│  · Local Business  · Health & Wellness             │
│  · Real Estate     · Food & Dining                 │
│                                                     │
│  [ See Section Sponsor options ]  [ Skip ]         │
└─────────────────────────────────────────────────────┘
```

**Headliner full:**
```
┌─────────────────────────────────────────────────────┐
│  Headliner in [category] is held by [Business].    │
│                                                     │
│  Priority Listing still puts you above every       │
│  [category] business that isn't paying for         │
│  position — and it's available.                    │
│                                                     │
│  [ Add Priority Listing ]  [ Skip ]                │
└─────────────────────────────────────────────────────┘
```

**Expert column full — offer nearby community:**
```
┌─────────────────────────────────────────────────────┐
│  The [expertise] column in [Community] is held.    │
│                                                     │
│  That same position is open in [Nearby Community]. │
│  Want me to check if that's a fit?                 │
│                                                     │
│  [ Check [Nearby Community] ]  [ Skip ]            │
└─────────────────────────────────────────────────────┘
```

---

## UPDATED PROGRESS BAR

The existing progress bar needs one update: the gate steps are folded under a "YOUR PLAN" step group. The user doesn't see 8 individual gate labels — they see the flow stay clean.

**Updated step labels:**
```
IDENTIFY → COMMUNITY → GOALS → YOUR PLAN → PROPOSAL → UPGRADES → YOUR DEAL → CHECKOUT → DONE
```

`YOUR PLAN` is the gate sequence. The active gate is shown as a sub-label below "YOUR PLAN" while active:

```
           ●
        YOUR PLAN
        Events →
```

---

## SARAH MESSAGES — MASTER SCRIPT

These are the locked scripted lines Sarah delivers at each step. They are not generated dynamically — they are template strings with variable interpolation. No improvisation.

| Step | Trigger | Scripted Line |
|---|---|---|
| ProfileType load | Step loads | *"Perfect. Knowing what kind of organization you are helps me skip past everything that doesn't apply and get right to what matters for you."* |
| Territory load | Step loads | *"[Community] is your home base. I want to show you the full picture before we narrow it down — there are [X] communities in [County] where you could hold a position."* |
| Territory slot alert | A nearby community has 1 slot left | *"Worth noting — [Community] has one [category] slot left. Once it's gone, it's gone. You don't have to add it today, but I'd keep it in mind."* |
| Day.News gate permission | Gate offered | *"[Business Name] already has a basic listing — that exists whether you do anything or not. Can I take two minutes to show you what the difference looks like between where you are now and where the top [category] businesses in [Community] appear?"* |
| Day.News — headliner full | Slot full detected | *"The Headliner in [category] is taken — but Priority Listing still puts you above everyone who isn't paying for position. That's the next best thing, and it's available."* |
| Day.News — product added | Product accepted | *"Good. That locks your position. Let me show you a couple more things."* |
| Event gate permission | Gate offered | *"Something that can really drive traffic for a business like yours is promoting events properly — even smaller ones. I think it can help you. Can I give you two minutes on how it works?"* |
| GLV gate permission | Gate offered | *"What you do is different from most businesses — people have to trust you before they hire you. There's a way to build that in [Community] that isn't advertising. Can I take a minute?"* |
| AlphaSite — qualifying | After qualifying question | *"That's the gap most businesses haven't caught up to yet. Searches now often produce direct answers — not just a list of websites. The businesses in those answers have complete, structured profiles. Let me show you what that looks like."* |
| Gate skipped | User clicks Skip | *"Got it — we can always come back to that. Let me show you what else applies to [Business Name]."* |
| All gates complete | Last gate done | *"Good — I have everything I need. Let me put this together."* |
| Proposal presented | Proposal step loads | *"Here's what I'd put together for [Business Name]. Everything you selected is in the package — and it saves you [X] compared to buying each piece separately."* |
| Resume — returning | Resume step loads | *"You were about to look at [next gate topic] for [Business Name]. [X] slots remain in [category] in [Community] — same as when we last talked."* |

---

## IMPLEMENTATION NOTES FOR AGENTS

1. **Gate components share a `GateWrapper` base** — permission ask UI is identical across all gates. Only the headline, education block, and product cards differ. Build `GateWrapper.tsx` first, then compose.

2. **Slot status component (`SlotStatusBar.tsx`) is shared** — takes `total`, `held`, `category`, `community` as props. Renders the ■ bar, the fractional text, and the status color. Used in Territory step AND within every gate.

3. **Sarah message delivery** — Sarah panel fires a new message bubble on each step load. Message content is loaded from a locked template store keyed by `step_id + trigger`. Not generated dynamically per conversation. This is critical for consistency.

4. **Gate sequence is dynamic but renders identically** — `GateSequencer` returns an ordered array of gate keys. The gate sequence renderer maps each key to its component. Order varies by org type and entry point; component output is always consistent.

5. **Fast-path nav** — visible after `ProfileTypeStep` completes. Hidden before. Collapses to a "→ Jump to..." link on mobile.

6. **"AI" word ban applies to all string literals** — run a grep for "AI", "artificial intelligence", "automated", "algorithm" before any PR merges. Replace with outcome language per the scripting rules in the engine spec.

7. **Mobile layout** — Sarah panel collapses to a bottom drawer on screens < 768px. Progress bar collapses to a step indicator (current / total). Gate permission blocks are full-screen on mobile.

8. **Slot data cache** — `SlotInventoryService` caches for 5 minutes maximum. Use cache-busting on territory and gate load events. Stale slot counts undermine the core scarcity mechanic.

---

# PART 5 — CURSOR AGENT BRIEFS (Exact Build Instructions)

# Sarah Pitch Engine — Complete UI Build Specification
## Cursor Agent Briefs: All Pages & Components, Built from Scratch

> **Platform:** CC repo — React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
> **Stack confirmed:** Same as existing CC frontend
> **Do not reference Magic Patterns exports.** Build from scratch against this spec.
> **Design system source of truth:** The color tokens, layout rules, and component patterns
> are defined in Agent 1. Every subsequent agent imports from that system.

---

## GATE MARKETING — EXISTING CUSTOMER UPSELL PATH

Before the build specs, this must be understood by all agents:

Every gate in the pitch system has **two entry modes**:

**Mode A — Prospect pitch:** Business has never bought anything. Sarah walks them through the full pitch sequence. This is the primary flow described in the pitch spec.

**Mode B — Customer upsell:** Business is already enrolled (has an active campaign). They were either never pitched on a specific gate, or they deferred it. Sarah approaches them specifically about that one gate.

The UI components are **identical for both modes.** The difference is:
- Mode B skips the full pitch shell (no progress bar, no multi-step wrapper)
- Mode B uses a different entry framing ("You're already in [Community] — here's something you don't have yet")
- Mode B has a lighter checkout (they already have a payment method on file)
- Mode B is triggered from: CC follow-up inbox, outbound email link, CC dashboard upsell prompt

**Every gate component must accept an `entryMode: 'pitch' | 'upsell'` prop.**

When `entryMode === 'upsell'`:
- No permission ask wrapper — gate content renders immediately
- Header becomes: "[Gate name] — Add to your [Community] plan"
- Checkout is one-click (existing payment method) or opens Stripe update flow
- On completion: returns to CC dashboard, not pitch proposal

This single prop makes every gate component reusable for both prospect and upsell scenarios.

---

## AGENT 1 — DESIGN SYSTEM & SHELL (BLOCKING)
*No other agent starts until this is merged and verified.*

**Repo:** CC frontend (`/src/pitch/`)
**Creates:** Design tokens, shell layout, shared primitives

```
Build the Sarah Pitch Engine design system and shell for the CC React application.
This is a greenfield build — no existing pitch UI exists. Build from scratch.

─── DESIGN TOKENS ─────────────────────────────────────────────────────

Add to src/pitch/tokens.css (imported in pitch entry point, not global):

:root {
  /* Backgrounds */
  --p-bg:           #0d1229;
  --p-panel:        #1a2040;
  --p-card:         #1f2645;
  --p-card-hover:   #253060;
  --p-border:       #2a3260;
  --p-border-light: #3a4280;

  /* Text */
  --p-text:         #ffffff;
  --p-muted:        #8892b0;
  --p-label:        #6272a4;

  /* Accent — platform colors */
  --p-teal:         #00d4ff;   /* Day.News / primary CTA */
  --p-teal-dim:     #0099bb;
  --p-green:        #00cc6a;   /* GEC / available / success */
  --p-purple:       #8b5cf6;   /* Downtown Guide */
  --p-orange:       #ff6b35;   /* GLV */
  --p-amber:        #f59e0b;   /* Sarah / founder pricing / warnings */
  --p-red:          #ef4444;   /* Full / error */

  /* Slot status */
  --p-slot-open:    #00cc6a;
  --p-slot-low:     #f59e0b;
  --p-slot-full:    #ef4444;
  --p-slot-track:   #2a3260;

  /* Spacing scale */
  --p-radius-sm:    8px;
  --p-radius-md:    12px;
  --p-radius-lg:    16px;
  --p-radius-pill:  999px;
}

─── SHELL COMPONENTS ───────────────────────────────────────────────────

All files in src/pitch/shell/

1. PitchShell.tsx
   Props:
     children: ReactNode
     onClose: () => void
     showProgress?: boolean

   Layout:
   - Full viewport, background var(--p-bg)
   - Header (64px fixed): Just1Hug logo left + platform logos, progress bar center,
     × close button right
   - Body: flex row, no overflow on shell itself
   - Left panel: flex 1, overflow-y-auto, min-height 0, padding 48px 64px
   - Right panel: 380px fixed width, overflow-y-auto, background var(--p-panel),
     border-left 1px solid var(--p-border)
   - Mobile (<768px): right panel becomes a bottom drawer (collapsed by default,
     expand button shows "Ask Sarah"), left panel is full width

2. PitchHeader.tsx
   Props:
     currentStep: number
     steps: { key: string; label: string }[]
     completedSteps: number[]
     onClose: () => void

   Renders:
   - Left: Just1Hug logo (src/assets/just1hug-logo.svg) + platform icon row
     (Day.News cyan dot, GEC green dot, DTG purple dot, GLV orange dot, AlphaSite amber dot)
   - Center: PitchProgressBar
   - Right: × button (24px, muted color, hover white)
   - Background: slightly darker than --p-bg, border-bottom 1px solid var(--p-border)

3. PitchProgressBar.tsx
   Props:
     steps: { key: string; label: string }[]
     currentStep: number
     completedSteps: number[]
     subLabel?: string  ← shown below active step (e.g., "Events →")

   Renders:
   - Horizontal step list connected by lines
   - Completed: filled teal circle (20px) with white checkmark, teal line to next
   - Active: teal ring (2px border), dark fill, number inside, bold label below,
     subLabel in smaller muted text below label
   - Upcoming: dark gray filled circle, muted number, muted label
   - Lines: 1px, completed segments teal, upcoming segments var(--p-border)
   - Labels: 11px uppercase letter-spacing 0.05em, below circles
   - Mobile: show only current step label + "Step N of M"

4. SarahPanel.tsx
   Props:
     messages: SarahMessage[]
     onSend?: (text: string) => void
     isTyping?: boolean

   interface SarahMessage {
     id: string
     text: string
     timestamp: string
     type?: 'sarah' | 'system'
   }

   Renders:
   - Full height flex column
   - Header: amber circle avatar (36px) with "S" initial, "Sarah" bold 15px,
     "Account Manager" 12px muted, audio icon button right (muted, hover teal)
   - Messages list (flex 1, overflow-y-auto, padding 16px):
     Each message: left amber border (3px), background slightly lighter than panel,
     border-radius var(--p-radius-md), padding 12px 16px,
     message text 14px white, timestamp 11px muted below
   - Typing indicator: three dots animated when isTyping=true
   - Input bar (fixed bottom, border-top 1px var(--p-border)):
     mic icon (muted) · input field (transparent bg, "Ask Sarah anything..." placeholder,
     14px) · send icon (teal on hover)

   Behavior:
   - Messages scroll to bottom on new message (useEffect on messages.length)
   - If onSend not provided, input is hidden (Sarah-only mode for pitch flow)
   - New messages animate in: opacity 0→1, translateY 8px→0, 200ms ease-out

5. UpsellShell.tsx  ← for Mode B (existing customer gate upsell)
   Props:
     gateName: string
     businessName: string
     communityName: string
     onClose: () => void
     children: ReactNode

   Layout:
   - Simpler shell — no progress bar
   - Header: platform logo + "[gateName] for [businessName]" title + × close
   - Same two-panel layout as PitchShell
   - Background same tokens
   - Used when entryMode === 'upsell'

─── SHARED PRIMITIVE COMPONENTS ────────────────────────────────────────

All in src/pitch/components/

6. SlotStatusBar.tsx
   Props:
     total: number
     held: number
     category: string
     community: string
     showLabel?: boolean   default true
     size?: 'sm' | 'md'   default 'md'

   Renders:
   - Label: "[category] — [community]" (12px uppercase muted) if showLabel
   - Visual bar: row of squares — ■ for held (var(--p-teal)), □ for open (var(--p-slot-track))
     sm: 10px squares, 4px gap
     md: 14px squares, 6px gap
   - Text: "N of M held · Z remaining" (13px)
   - Status badge: pill next to text
     >2 remaining → green "AVAILABLE"
     1-2 remaining → amber "ALMOST FULL"
     0 remaining → red "FULL"
   - If full: different text "Held by [business name if available]"

7. ProductCard.tsx
   Props:
     name: string
     price: string             ← formatted: "$300/mo", "from $150/mo", "1–5% commission"
     description: string       ← one sentence, outcome-focused
     rationale?: string        ← "You said X — this does that because Y"
     slotStatus?: SlotStatus   ← from SlotInventoryService
     included?: boolean        ← "Included in your package" — no price shown
     onAdd: () => void
     onSkip: () => void
     onDefer?: () => void
     isAdded?: boolean
     isSkipped?: boolean

   interface SlotStatus {
     total: number; held: number; available: number;
     status: 'open' | 'almost_full' | 'full'
     heldBy?: string
   }

   Renders:
   - Card: var(--p-card), border 1px var(--p-border), border-radius var(--p-radius-lg)
   - isAdded: border-color var(--p-teal), left accent bar 3px teal
   - Header row: product name (bold 16px) + price right (teal 16px bold) or "Included" badge
   - Description: 14px muted, margin 8px 0
   - Rationale (if provided): italic 13px muted, lighter background inset
   - SlotStatusBar (if slotStatus provided)
   - Action row:
     Not acted on: [Add this →] (teal fill pill) · [Skip] (outline) · [Not right now] (ghost, if onDefer)
     isAdded: [✓ Added] (teal, disabled-ish) · [Remove] (ghost)
     isSkipped: [Skipped] (muted) · [Add instead] (outline)
   - Animate: on add, card gets teal border with spring animation

8. GateWrapper.tsx
   Props:
     permissionAsk: string
     onYes: () => void
     onSkip: () => void
     onDefer?: () => void
     entryMode: 'pitch' | 'upsell'
     children: ReactNode
     isOpen?: boolean        ← controlled externally (for fast-path)

   Behavior:
   - entryMode 'pitch': shows permission block first. On Yes → animate open children.
     On Skip → fire onSkip, do not show children.
   - entryMode 'upsell': skip permission block entirely, render children immediately.
   
   Permission block renders:
   - Sarah message bubble (same style as SarahPanel messages) with permissionAsk text
   - Two buttons: [Yes, show me] (teal fill, full width) · [Skip this] (outline, full width)
   - Optional: [Tell me more ↓] ghost link → expands a secondary explanation block
   
   Children reveal animation:
   - AnimatePresence with height: 0 → auto, opacity 0 → 1, 300ms ease-out

9. PositionLadder.tsx
   Props:
     positions: { label: string; sublabel?: string; highlight?: boolean; isCurrentPosition?: boolean }[]
     title?: string

   Renders:
   - Vertical list of position tiers
   - Each position: numbered circle + label + sublabel
   - highlight=true: teal background, "← You'd be here" indicator
   - isCurrentPosition=true: muted styling, "← You are here" indicator
   - Separator line between groups (premium above line, basic below)
   - Used in Day.News gate and Downtown Guide gate

10. SlotFullFallback.tsx
    Props:
      slotType: string
      heldBy?: string
      nearbyOptions?: { communityName: string; available: number }[]
      fallbackProducts: FallbackProduct[]
      onSelectFallback: (product: FallbackProduct) => void
      onSkip: () => void

    Renders three variants based on slotType:
    - 'influencer': "Influencer slots in [category] are full. Section Sponsor is the
      alternative — no slot limit. Here are the available sections:"
      → list of available sections as selectable chips
    - 'headliner': "Headliner held by [heldBy]. Priority Listing is the next best
      position — available now."
      → single add button
    - 'expert_column': "Column held in [community]. Available in [nearbyOptions]."
      → community chips

11. FastPathNav.tsx
    Props:
      availableGates: { key: string; label: string; icon: string }[]
      onSelect: (gateKey: string) => void
      onCollapse: () => void

    Renders:
    - Thin bar (40px) above gate content
    - "I already know what I want:" label (12px muted)
    - Gate pills: each has icon + label, outlined, hover teal
    - Clicking a gate fires onSelect → GateSequencer jumps
    - Collapse link right side: "↑ Hide"
    - Mobile: wraps to two rows

12. ResumePrompt.tsx
    Props:
      variant: 'same_browser' | 'email_link'
      businessName: string
      communityName: string
      lastStep: string
      nextStepLabel: string
      slotUpdate?: { category: string; wasAvailable: number; nowAvailable: number }
      onResume: () => void
      onStartFresh: () => void
      onDifferentBusiness: () => void

    Renders:
    - same_browser variant: "Welcome back, [name]." + last step summary + two CTAs
    - email_link variant: "Let's finish what we started." + slot update if count changed
      + single Resume CTA
    - slotUpdate rendered as amber callout if provided:
      "When we last spoke, there were [was] spots. There are now [now]."

─── TYPES ───────────────────────────────────────────────────────────────

src/pitch/types.ts

export type EntryMode = 'pitch' | 'upsell'
export type OrgType = 'smb' | 'venue' | 'performer' | 'school' | 'nonprofit' | 'government'
export type PitchTrack = 'standard' | 'professional' | 'trades' | 'venue' | 'performer' | 'civic'
export type GateKey = 'day_news' | 'downtown_guide' | 'event_host' | 'venue' | 'performer' | 'golocalvoices' | 'alphasite' | 'civic'

export interface PitchSession {
  id: string
  smbId?: string
  customerId?: string
  communityId: string
  entryPlatform: string
  orgType?: OrgType
  pitchTrack?: PitchTrack
  status: string
  lastStep: string
  discoveryAnswers?: DiscoveryAnswers
  territorySelection?: string[]
  gatesOffered?: GateKey[]
  gatesCompleted?: GateKey[]
  gatesDeferred?: DeferredGate[]
  productsAccepted?: AcceptedProduct[]
  productsDeclined?: DeclinedProduct[]
  proposalId?: string
}

export interface DiscoveryAnswers {
  goal: string
  customerSource: string
  marketingSpend: string
}

export interface DeferredGate {
  gate: GateKey
  reason: string
  retryAfter: string
}

export interface AcceptedProduct {
  product: string
  price: number
}

export interface DeclinedProduct {
  product: string
  reason?: string
}

export interface SlotStatus {
  total: number
  held: number
  available: number
  status: 'open' | 'almost_full' | 'full'
  heldBy?: string
}

─── EXPORTS ─────────────────────────────────────────────────────────────

src/pitch/index.ts — re-export everything:
export * from './shell/PitchShell'
export * from './shell/SarahPanel'
export * from './shell/UpsellShell'
export * from './components/SlotStatusBar'
export * from './components/ProductCard'
export * from './components/GateWrapper'
export * from './components/PositionLadder'
export * from './components/SlotFullFallback'
export * from './components/FastPathNav'
export * from './components/ResumePrompt'
export * from './types'

─── VERIFICATION ────────────────────────────────────────────────────────

Create src/pitch/DevPreview.tsx that renders each component with mock data.
Route it at /pitch-dev (dev only, not in production build).
This is how Agent 2 and Agent 3 verify the primitives before using them.
```

---

## AGENT 2 — STEPS & GATE SCREENS
*Depends on Agent 1 merged and DevPreview verified.*

```
Build all pitch step screens and gate screens for the Sarah Pitch Engine.
Import everything from src/pitch/ (Agent 1 output).
Build from scratch — no existing pitch UI exists.

─── STEP SCREENS (src/pitch/steps/) ────────────────────────────────────

Each step is a full left-panel content component.
Props always include: session: PitchSession, onNext: (data?) => void, onBack: () => void
Each step fires logEvent() on mount (step_reached) and on completion (step_completed).

1. IdentifyStep.tsx
   Headline: "Let's get your business in front of your community."
   Subhead: "Sarah will build a plan that actually works for your business."
   
   Content:
   - "SEARCH FOR YOUR BUSINESS" label
   - Search input (full width, dark bg, search icon left):
     placeholder "Business name, city, or address..."
     onChange: debounced 300ms → calls GET /api/pitch/businesses/search?q=
   - Search results dropdown (below input):
     Each result: business name bold + address muted + category badge
     "Claim this business →" on hover/tap
   - "Don't see your business? Add it manually" link (opens inline form below):
     Fields: Business Name, Category (select), Address, City, Phone, Email
     "Add my business →" CTA
   - Footer note: "You won't need an account until checkout." (12px muted centered)
   
   Sarah message on load (fires to SarahPanel):
   "Hi! I'm Sarah, your account manager. I'm going to help you build a plan that 
   actually works for your business — not a generic package. Start by finding your 
   business and I'll take it from there."

2. ProfileTypeStep.tsx
   Headline: "What best describes [businessName]?"
   Subhead: "This helps me build the right plan for you."
   
   Content:
   - 6 selectable cards in 2×3 grid, each: icon (40px) + label (bold) + subtitle (muted 13px)
     Cards:
     🏪 Local Business — "Restaurant, retail, salon, shop, or service"
     🎪 Event Venue — "Space available for events, parties, or bookings"
     🎵 Performer / Entertainer — "Artist, DJ, band, comedian, speaker"
     🎓 School or Educational Org — "K-12, university, tutoring, classes"
     🤝 Non-Profit / Civic Org — "501(c), charity, community group"
     🏛️ Government / Municipality — "City office, department, public service"
   
   - Card selected state: teal border 2px, teal background at 10% opacity, checkmark top-right
   
   - After card selected → secondary question animates in below:
     "Does [businessName] host or promote events?"
     Three chips: [Yes, regularly] [Occasionally] [Not at all]
   
   - "Continue →" CTA appears after both questions answered (bottom of content)
   
   Sarah message after card selected:
   "Got it. [org_type_confirmation_message based on type selected]"

3. CommunityStep.tsx
   Headline: "Where do your customers live?"
   Subhead: "Select your primary community for [businessName]."
   
   Content:
   - "YOUR PRIMARY COMMUNITY" label
   - City/zip search input
   - After primary selected → shows:
     Selected community card (teal border, checkmark):
       Community name, state
       SlotStatusBar for their category + community
       "Home community · locked" note
   
   - "NEARBY COMMUNITIES" section (appears after primary selected):
     List of nearby communities from API (GET /api/pitch/communities/nearby?community_id=)
     Each: checkbox + community name + SlotStatusBar for their category
     Status badge: green "Open" / amber "Almost Full" / red "Full in [category]"
     "Full in [category]" → shows "Section Sponsor available" link
     "Launching Q2" → gray badge "Reserve your spot"
   
   - "Show more communities in [County]" expandable link
   
   - Framing text (appears once, static):
     "Positions are limited per category per community — whoever holds one, holds it."
   
   Bottom bar: Back | Continue with [N] communities →
   
   Sarah message on community selected:
   Dynamic based on slot status:
   - Slots open: "Good timing — there are [N] spots available in [category] in [community]."
   - Almost full: "Worth noting — there's only [N] spot left in [category] in [community]. 
     Once it's gone, it's gone."
   - Full: "Your category is full in [community] for the Influencer position. 
     There's still a Section Sponsor option — I'll show you that."

4. GoalsStep.tsx
   Headline: "Tell me about your goals."
   Subhead: "I'll use this to build a plan that actually works for you."
   
   Content (questions appear one at a time, answered questions shown as summary cards):
   
   Q1 — Goal (shows first):
   Label: "GOAL"
   Chips (select one):
   [More foot traffic] [Get customers back more often] [Promote an event or launch]
   [Build community awareness] [Something else]
   
   After Q1 answered → shows as summary card:
   ┌────────────────────────────────────────┐
   │ 1  GOAL                            ✏️ │
   │    More foot traffic                   │
   └────────────────────────────────────────┘
   Then Q2 appears below.
   
   Q2 — Timeline:
   Label: "TIMELINE"
   Chips: [Right now (1–2 weeks)] [Next month] [Ongoing — building presence]
   
   Q3 — Budget:
   Label: "WHAT'S YOUR MONTHLY BUDGET?"
   Sarah note: "Tell me what you're comfortable with. I'll tell you exactly what I can do with it."
   Chips: [Under $100] [$100 – $300] [$300 – $600] [$600+] [Not sure yet]
   
   After all three: "Build My Plan →" CTA (full width, teal, large)
   
   Sarah messages:
   After Q1: "Got it — [goal]. That tells me a lot. A couple more questions and I'll 
   have everything I need."
   After Q2: "Good. [Timeline acknowledgment]."
   After Q3: "Right now works — [slot status for their community]."

5. TerritoryStep.tsx  (optional — can be inline in CommunityStep or separate)
   Headline: "Here's your full market in [County]."
   Subhead: "Select every community where you want to hold a position."
   
   Content:
   - Full community list for the county
   - Home community at top, pre-checked, lock icon
   - Each row: checkbox + community name + slot status bar (compact) + status badge
   - Sort: Almost Full first (urgency), then Open, then Full, then Launching
   - "Full in your category" rows: grayed checkbox, "Section Sponsor available" note
   
   Framing callout (amber border, top of list):
   "When you hold a position in a community, no competitor in your category can 
   take it. The communities below show how many spots remain."
   
   Bottom bar: Back | Continue with [N] communities →
   
   Sarah message:
   If any community is almost full: "I'd take a look at [community] — there's only 
   [N] spot left in [category]. You can always add it today and activate it later."

─── GATE SEQUENCER ──────────────────────────────────────────────────────

6. GateSequencer.tsx  (src/pitch/gates/)
   Props:
     session: PitchSession
     profile: BusinessProfile
     slotData: Record<string, SlotStatus>
     onGateComplete: (gate: GateKey, products: AcceptedProduct[]) => void
     onGateDefer: (gate: GateKey, reason: string) => void
     onAllGatesComplete: () => void
     onLogEvent: (type: string, payload: any) => void

   Logic:
   - Determines gate order from TRACK_GATE_SEQUENCES (in gateConfig.ts)
   - Filters to eligible gates based on profile
   - Fast-path entry (from entryPlatform) reorders gates
   - Renders one gate at a time
   - Shows FastPathNav above current gate (after profile complete)
   - Updates "YOUR PLAN" progress sub-label with current gate name
   - On each gate complete/defer: advance to next, log event
   - On all complete: fire onAllGatesComplete

   src/pitch/gates/gateConfig.ts:
   export const TRACK_GATE_SEQUENCES = {
     standard:     ['day_news', 'downtown_guide', 'event_host', 'golocalvoices', 'alphasite'],
     professional: ['day_news', 'golocalvoices', 'alphasite'],
     trades:       ['day_news', 'alphasite'],
     venue:        ['day_news', 'downtown_guide', 'event_host', 'venue', 'alphasite'],
     performer:    ['performer', 'day_news', 'alphasite'],
     civic:        ['civic', 'event_host'],
   }
   
   export const ENTRY_GATE_PRIORITY = {
     gec:      ['event_host', 'venue', 'performer'],
     glv:      ['golocalvoices'],
     dtg:      ['downtown_guide'],
     alphasite:['alphasite'],
     day_news: null,
     direct:   null,
   }

─── GATE SCREENS (src/pitch/gates/) ─────────────────────────────────────

Each gate: Props include session, slotData, entryMode, onProductAdd, onProductSkip, onProductDefer, onGateComplete, onGateDefer, onLogEvent

7. DayNewsGate.tsx
   permissionAsk: "Your business already has a basic listing in our network. Can I take 
   two minutes to show you what the difference looks like between where you are now and 
   where the top [category] businesses in [community] appear?"
   
   Content (on Yes / upsell mode):
   
   Headline: "Here's where [businessName] stands in [community] right now."
   
   PositionLadder:
     positions=[
       { label: "Headliner", sublabel: "[competitor] holds this", highlight: false },
       { label: "Priority Listing", sublabel: "You'd be here with Influencer", highlight: true },
       { label: "Priority Listing", highlight: true },
       { label: "Basic listing — [businessName]", isCurrentPosition: true },
       { label: "Basic listing" },
       { label: "Basic listing" },
     ]
   
   Slot status block:
   - "Community Influencer slots in [community]" → SlotStatusBar (influencer type)
   - "Headliner in [category]" → SlotStatusBar (headliner type)
   - If headliner full → SlotFullFallback (headliner variant)
   
   ProductCard: Community Influencer ($300/mo)
     description: "Premium listing across all four platforms, one article a month, 
     five announcements, priority position, and 25% off any advertising you add."
     rationale: derived from session.discoveryAnswers.goal
   
   ProductCard: Newsletter Sponsor ($150–300/send)  [only if headliner not added]
     description: "Top of the morning newsletter — every subscriber sees it before 
     they read anything else. One slot per community."
   
   ProductCard: Section Sponsor (from $300/mo) [only show if headliner full]
     description: "Own a section of the news. Every article in that section carries 
     your name — permanently, not rotationally."
     → opens section browser inline

8. DowntownGuideGate.tsx
   permissionAsk: "Because you have a physical location, the Downtown Guide is worth 
   understanding. It's where [community] residents search for places to go and shop. 
   Can I show you what your listing looks like there?"
   
   Content:
   
   Headline: "The Downtown Guide is how [community] finds local businesses."
   
   Comparison block (two columns):
   Left "YOUR LISTING NOW":
     ✗ Name and address only
     ✗ No photos
     ✗ No description
     ✗ No coupons
     ✗ Bottom of search results
   Right "WITH PREMIUM LISTING":
     ✓ 20 photos + video
     ✓ Full description
     ✓ Menu or service list
     ✓ Verified badge
     ✓ Digital coupons
     ✓ Priority sort position
     ✓ Analytics
   
   SlotStatusBar for DTG Headliner in their category
   
   ProductCard: Premium Listing
     included=true (included in Community Influencer)
     description: "Full photo gallery, extended description, verified badge, coupons, 
     and analytics — the difference between a placeholder and a real presence."
   
   ProductCard: Headliner — [category] (if available)
     description: "Top card every time someone browses [category] in [community]."
     slotStatus from slotData
     → If full: SlotFullFallback (headliner variant)
   
   Two ProductCards for Poll Participation:
   Featured ($49): "Photo and offer in the Community's Choice poll listing."
   Premium ($149): "Highlighted position at the top with sponsored badge."

9. EventHostGate.tsx
   permissionAsk: "Something that can really drive traffic for a business like yours is 
   promoting events properly — even smaller ones like tastings, classes, or pop-ups. 
   Can I give you two minutes on how it works?"
   
   Content:
   
   Headline: "GoEventCity is [community]'s event calendar. Here's how to be seen in it."
   
   Event calendar visual (simplified — CSS only, no images):
   - Title "THIS WEEKEND IN [COMMUNITY]"
   - Top card: "EVENT HEADLINER" badge + placeholder content (teal bg, prominent)
   - Row of 3 smaller cards: "Priority" label each (teal outline)
   - Row of 3 smaller cards: "Basic" label each (muted, smaller text)
   - "...30 more events" text (muted)
   
   "Included in your plan:" checklist:
   ✓ 1 premium event per month — priority placed
   ✓ Cross-posted to Day.News morning feed automatically  
   ✓ Reminder sent to everyone who registers
   ✓ Distributed to community social accounts
   
   ProductCard: Event Headliner — [event category] (if eligible)
     slotStatus from slotData for gec_event_headliner
   
   ProductCard: Ticket Sales
     description: "Advance ticket purchase online — promo codes, known headcount, 
     lower commission than most ticketing services."
     price: "1–5% commission"
   
   ProductCard: Calendar Subscription
     description: "Customers subscribe once and get notified every time you add a 
     new event — no social algorithm in the way."
     price: "$19–49/mo"
   
   ProductCard: Since You're Going To...
     [only if session.discoveryAnswers.goal === 'retention']
     description: "After someone registers, they get a curated follow-up with 
     nearby experiences. Puts your event in front of them a second time."
     price: "$25–100/event"
   
   Venue sub-toggle (if orgType is venue or has_venue):
   ┌──────────────────────────────────────────────┐
   │ Is [businessName] a rentable event space?   │
   │ [Yes, we book private events]  [No]         │
   └──────────────────────────────────────────────┘
   → Yes: expands VenueGate content inline
   
   Performer sub-toggle (if is_performer):
   Similar pattern → expands PerformerGate content inline

10. VenueGate.tsx  (standalone and embeddable in EventHostGate)
    permissionAsk: "Your space is something people can rent — parties, corporate events, 
    private functions. There's a venue directory separate from the event calendar where 
    people search specifically for a place to host. Can I show you how that works?"
    
    Content:
    Headline: "When someone in [community] needs a venue, here's where they look."
    
    SlotStatusBar for gec_venue_headliner
    
    ProductCard: Venue Headliner (if available)
      description: "First result when someone in [community] searches for a venue to book."
    
    ProductCard: Venue Booking System
      description: "Inquiries handled online — check availability, pick a date, deposit. 
      No phone tag, no missed leads after hours."
      price: "$49/mo + commission"

11. PerformerGate.tsx  (standalone and embeddable in EventHostGate)
    permissionAsk: "GoEventCity has a performer directory venues use when booking talent. 
    Want to see how to show up in it?"
    
    Content:
    Headline: "Venues in [community] use this to find performers. Here's your position in it."
    
    SlotStatusBar for gec_performer_headliner
    
    ProductCard: Performer Headliner
    ProductCard: Performer Booking System — "$49/mo + commission"
    ProductCard: Calendar Subscription — "Fans subscribe, auto-notified for every date."

12. GoLocalVoicesGate.tsx
    permissionAsk: "What you do is different from most businesses — people have to trust 
    you before they hire you. There's a way to build that in [community] that isn't 
    advertising. Can I take a minute?"
    
    Content:
    Headline: "Be the [expertiseLabel] [community] reads every week."
    
    Column preview card (visual mockup — CSS only):
    ┌──────────────────────────────────────────┐
    │ GoLocalVoices                            │
    │ THE [EXPERTISE] GUIDE · By [Name]       │
    │ ───────────────────────────────────────  │
    │ "[Sample column headline for category]" │
    │ [businessName] · [category] · [community]│
    └──────────────────────────────────────────┘
    
    ProductCard: Headline Spot (included in Influencer)
      included=true
      description: "Named column, published regularly — visible in GoLocalVoices 
      and cross-posted to the Day.News morning feed."
    
    ProductCard: Community Expert upgrade
      price: "+$100/mo"
      description: "Category exclusivity. No other [their profession] in [community] 
      can hold a Headline Spot while you do."
      slotStatus from slotData for glv_expert_column

13. AlphaSiteGate.tsx
    Special — qualifying question before GateWrapper permission ask.
    
    Qualifying question (rendered outside GateWrapper, always shown):
    "If someone searched for a [service] in [community] right now, does 
    [businessName] come up prominently?"
    Chips: [Yes, we show up well] [Somewhat — not as well as I'd like] [Not really / Not sure]
    
    On "Yes" → follow-up chip appears:
    "Has the site been updated in the last year?"
    [Yes, it's current] → gate closes (log alphasite_gate_skipped_qualified)
    [It's been a while] → permission ask appears
    
    On "Somewhat" or "Not really" → permission ask appears immediately
    
    permissionAsk: "That's worth fixing. Can I take 30 seconds to show you what the 
    gap is and how we close it?"
    
    Content:
    Headline: "How [community] residents find local businesses has changed. Here's 
    where [businessName] stands."
    
    Search result visual (CSS only):
    ┌──────────────────────────────────────────────┐
    │ 🔍 "[service] in [community]"               │
    │                                              │
    │ ✦ [Competitor A] ·  Complete profile        │
    │ ✦ [Competitor B] ·  Complete profile        │
    │ ✦ [Competitor C] ·  Complete profile        │
    │                                              │
    │ [businessName] · Basic listing ←            │
    └──────────────────────────────────────────────┘
    
    ProductCard: AlphaSite Profile (included in Influencer)
      included=true
      description: "Complete, current business profile — connected to Day.News, 
      Downtown Guide, and GoEventCity. One update, everywhere."
    
    Intake volume sub-question (conditional — show if category has phone intake):
    "How much of your day involves answering the same questions from customers?"
    Chips: [A lot — it takes real time] [Some, but manageable] [Not really an issue]
    
    On "A lot": ProductCard for Customer Response Service
      price: "$99/mo"
      description: "Handles inbound customer questions around the clock. Customers 
      get answers immediately — no hold, no waiting for a callback."
      ← NEVER use AI, automated, or algorithm in this card. Outcome language only.

14. CivicGate.tsx  (replaces all other gates for civic org_types)
    permissionAsk: "[orgName] serves the community differently than a business. We built 
    something specifically for organizations like yours — not advertising, community 
    communication. Can I show you how other [schools/non-profits] in [county] are using it?"
    
    Content:
    Headline: "Your community presence is included. Here's how to make it work for you."
    
    Free participation checklist (checkmarks, not product cards):
    ✓ Directory listing on all platforms
    ✓ Event calendar access — events appear in GoEventCity
    ✓ Announcements — published to the community feed
    ✓ Cross-post to Day.News — major events reach the full subscriber base
    Note: "Included at no cost for [civic org type]s in [community]."
    
    ProductCard: Premium Event Listing
      description: "For major events — priority positioning ensures it doesn't get 
      buried on a busy calendar."
      price: "$29–99/event"
    
    ProductCard: Event Headliner (annual flagship events only)
      description: "For your biggest event of the year. First card in the calendar 
      for everyone looking at that date."
    
    ProductCard: GoLocalVoices Column
      description: "If your superintendent, director, or elected official wants to 
      speak to residents directly and regularly, this is the right venue."

─── PROPOSAL STEP ────────────────────────────────────────────────────────

15. ProposalStep.tsx
    Built from GateSequencer output. Shows what the user built during gates + package comparison.
    
    Headline: "Here's what I'd recommend for [businessName]."
    Subhead: "You can build your own plan, or take the complete package I put together for you."
    
    Founder pricing callout (amber, full width):
    "Founding member pricing: Lock in $300/month for 3 years. Window closes in [N] days."
    
    Two-column layout:
    Left: À la carte — shows products added during gate sequence with prices
          Running total at bottom
          "Continue with À la carte →" secondary CTA
    Right: Community Influencer package card (RECOMMENDED badge)
           $300/mo (teal large)
           "Saves $[X]/mo vs à la carte" (green badge)
           SlotStatusBar (influencer slots for their community)
           Checklist of what's included
           "Get this package →" primary CTA (teal, large)
    
    Sarah message:
    "Everything you selected during our conversation is covered in the package — 
    and it saves you $[X] compared to buying each piece separately."

─── VERIFICATION ─────────────────────────────────────────────────────────

Add each gate + step to src/pitch/DevPreview.tsx with mock data.
All gates must render correctly in both entryMode='pitch' and entryMode='upsell'.
```

---

## AGENT 3 — CC FOLLOW-UP VIEWS
*Depends on Agent 1. Can run in parallel with Agent 2.*

```
Build the Command Center pitch intelligence and follow-up views.
These are internal CC pages — use existing CC layout (NavigationRail, AppShell, 
shadcn/ui components). These are not part of the pitch shell.
All pages are under /command-center/pitch/

─── PAGES ────────────────────────────────────────────────────────────────

1. PitchDashboardPage.tsx — /command-center/pitch
   
   Metrics row (4 cards):
   - Sessions Today / This Week / This Month (with delta vs prior period)
   - Proposals Sent (pending conversion) + pipeline MRR value
   - Conversion Rate (pitch → paid) with sparkline trend
   - Avg Gates Completed per converted pitch
   
   Abandonment Funnel chart (horizontal bar chart, recharts):
   - Each step in the funnel as a row
   - Bar width = % of sessions that reached this step
   - Color: teal for high completion, amber for drop-off points
   - Label: step name + % + absolute count
   
   Gate Permission Rates (horizontal bar chart):
   - Each gate as a row
   - "Permission Granted" % (teal) + "Deferred" % (amber) + "Declined" % (red/muted)
   - Sort ascending by permission rate (worst gates at top)
   
   Slot Fill Status (table):
   - Community / Category / Slot Type / Total / Held / Available / Status
   - Color-coded status badges
   - Filter by community

2. PitchFollowUpsPage.tsx — /command-center/pitch/follow-ups
   
   THE PRIMARY OPERATOR VIEW. Shows every pitch requiring human follow-up action.
   
   Filter tabs (with counts):
   All | Incomplete Pitches | Deferred Gates | Unconverted Proposals | Re-engagement Due Today
   
   Each item is a FollowUpCard component:
   
   FollowUpCard.tsx:
   Props: type, businessName, community, contactName, contactEmail, lastActive, 
          lastStep, gatesCompleted, gatesDeferred, productsDeferred, proposalValue,
          founderDaysRemaining, slotCounts
   
   Renders:
   - Header: business name (bold) + community + type badge (color-coded)
   - Contact: name + email (mailto link)
   - Timeline: "Last active X hours/days ago" + "Left at: [last step]"
   - Gates row: completed gates as teal chips, deferred gates as amber chips with reason
   - Proposal value if proposal built: "$X/mo" in green
   - Founder rate countdown if applicable: amber "Founder rate: X days left"
   - Slot alert if relevant: "[N] spots remaining in [category]"
   - Action buttons (right side):
     Incomplete pitch: [Send Resume Email] [Complete for Them →] [Mark as Lost]
     Unconverted proposal: [Send Reminder] [Adjust Proposal →] [Mark as Lost]
     Deferred gate: [Re-pitch This Gate →] [Send Email] [Defer 30 Days]
   
   "Complete for Them →" opens CompletePitchPanel (side panel, not modal):
   - Shows remaining gates pre-loaded with business profile data
   - Operator can click through remaining gates on behalf of the business
   - Generates a complete proposal
   - "Send proposal to [email] →" CTA
   
   "Re-pitch This Gate →" opens UpsellShell wrapping the specific gate component
   with entryMode='upsell' — operator previews what the business would see,
   then can email it or mark it as pitched.

3. PitchProposalsPage.tsx — /command-center/pitch/proposals
   
   Kanban board (5 columns) OR toggle to table view:
   Columns: Proposed | Followed Up | Won | Lost | Expired
   
   Each card: business name, community, MRR value, products list (chips), 
   days in stage, founder rate expiry (if applicable)
   
   Drag-and-drop between columns (using @dnd-kit/core, already in CC)
   
   Batch action bar (appears when items selected):
   [Send Reminder to Selected] [Export] [Mark as Lost]
   
   Filter bar: Community / Category / MRR range / Days since proposed

4. SlotInventoryPage.tsx — /command-center/pitch/slots
   
   Community selector (top): dropdown or tab list
   
   For selected community — slot inventory table:
   Columns: Category | Slot Type | Total | Held | Available | Held By | Actions
   
   Held By: comma-separated business names (clickable → SMB detail)
   
   Actions per row: [Edit Total] [Release Slot] [Add Category]
   
   "+ Add community slot configuration" opens form:
   Community (select) / Platform (select) / Slot Type (select) / Category (text) / Total (number)
   
   Bottom: [Seed from Template →] opens community template seeder
   (pre-fills standard slot counts for a new community launch)

5. SMBPitchDetailTab.tsx — Pitch tab added to existing /crm/customers/:id page
   
   This is a new tab added to the existing customer detail page.
   
   Pitch status badge (top): Never Pitched / In Progress / Proposed / Converted
   
   Timeline (vertical, scrollable):
   - Each pitch session as a section header with date + status
   - Within each session: events in chronological order
     Gate decisions (icon: door) → "Day.News gate: Accepted"
     Product decisions (icon: tag) → "Community Influencer: Added"
     Proposal (icon: document) → "Proposal sent: $300/mo"
     Abandonment (icon: pause) → "Left at: AlphaSite gate"
     Re-engagement (icon: mail) → "Resume email sent → Opened"
   
   Deferred items section:
   Gates deferred: each as a row with retry date + [Re-pitch now] button
   Products deferred: each as a row with retry date + [Pitch now] button
   
   Quick actions:
   [Resume Pitch →] [Send Email] [Complete Proposal for Them] [View Proposal]
   
   Founder rate countdown (if applicable):
   Amber callout: "Founder rate expires in [N] days for [community]."
```

---

## AGENT 4 — API WIRING
*Depends on Agents 1, 2, 3 all merged and verified with mock data.*

```
Wire all pitch UI components to the Laravel backend API.
The components are built with mock data props. Replace with real API calls.

src/pitch/api/pitchApi.ts — all API calls:

createSession(entryContext: EntryContext): Promise<PitchSession>
  POST /api/pitch/sessions

updateSession(id: string, data: Partial<PitchSession>): Promise<PitchSession>
  PATCH /api/pitch/sessions/{id}

logEvent(sessionId: string, type: string, payload: any): Promise<void>
  POST /api/pitch/events
  Fire-and-forget — do not block UI on this

searchBusinesses(query: string): Promise<Business[]>
  GET /api/pitch/businesses/search?q={query}

claimBusiness(businessId: string, profileData: any): Promise<Business>
  POST /api/pitch/businesses/{id}/claim

createBusiness(data: any): Promise<Business>
  POST /api/pitch/businesses

getNearbyCommunities(communityId: string, category: string): Promise<CommunityWithSlots[]>
  GET /api/pitch/communities/nearby?community_id={id}&category={category}

getSlotStatus(communityId: string, slotType: string, category: string): Promise<SlotStatus>
  GET /api/pitch/slots/{communityId}/{slotType}/{category}

getSlotStatusBatch(requests: SlotRequest[]): Promise<Record<string, SlotStatus>>
  POST /api/pitch/slots/batch
  ← Use this on territory step to fetch all communities at once

buildProposal(sessionId: string): Promise<Proposal>
  POST /api/pitch/sessions/{id}/proposal

getResumeSession(sessionId: string): Promise<PitchSession | null>
  GET /api/pitch/sessions/{id}/resume

src/pitch/hooks/usePitchSession.ts:
- On mount: check localStorage for session_id
- If found: call getResumeSession → if incomplete, surface ResumePrompt
- If no session: create new session with entry context from URL params
- Persist session_id and current step to localStorage on every step change
- Expose: session, currentStep, updateStep, logEvent, isLoading, error

src/pitch/hooks/useSlotInventory.ts:
- Wraps getSlotStatusBatch
- Cache with SWR, staleTime: 5 * 60 * 1000 (5 minutes max)
- Expose: getSlotStatus(communityId, slotType, category) → SlotStatus

URL routing:
/advertise/:communitySlug → PitchRouter
  → resolves communitySlug to communityId via GET /api/pitch/communities/{slug}
/advertise/:communitySlug?resume=:sessionId → load ResumePrompt
/advertise/:communitySlug?gate=:gateKey → fast-path to gate
/advertise/:communitySlug?source=:platform → set entry platform context

Add to CC router (src/AppRouter.tsx or equivalent):
<Route path="/advertise/:communitySlug" element={<PitchRouter />} />
These routes are public — no auth required until checkout.
```

---

## CRITICAL RULES — ALL AGENTS

1. **No string in any pitch component uses "AI", "artificial intelligence", "automated", or "algorithm".** Grep before PR. Replace with outcome language.

2. **`entryMode` prop is required on every gate component.** `'pitch'` shows permission ask. `'upsell'` skips it and renders content immediately. This is what enables gate marketing to existing customers.

3. **Every button that moves the pitch forward fires `logEvent` before the state change.** Not after. The log must record the intent even if the UI update fails.

4. **Slot counts are always props passed from parent.** No gate component fetches its own slot data. `PitchRouter` fetches, passes down. This ensures consistency and single-cache invalidation.

5. **Mock data in DevPreview.** Every component renders correctly with mock data before Agent 4 wires real APIs. Agent 4 only replaces props — it does not change component structure.

6. **Mobile layout.** Every step and gate must be usable on a 375px screen. Sarah panel collapses to a bottom sheet. Progress bar shows "Step N of M". Gate permission asks are full-screen on mobile.

---

# PART 6 — CAMPAIGN BUILDER SPEC (Checkout and Fulfillment)

# Sarah — AI Account Manager & Campaign Builder
## Full Implementation Spec

> **Scope:** Day.News · GoEventCity · DowntownGuide · GoLocalVoices  
> **Entry point:** Any page on any platform via "Advertise" CTA  
> **No human handoff. Sarah closes the deal.**

---

## Overview

Sarah is the AI account manager for every SMB that wants to advertise on the Fibonacco network. She is not a form, not a chatbot, and not a storefront. She is a persistent AI relationship that:

- Identifies the business and its goals
- Builds a tailored campaign proposal
- Presents it as an interactive checklist the user can adjust
- Enforces bundle logic with plain-English rationale
- Checks out via Stripe in a single transaction
- Manages and reports on the campaign going forward

---

## Entry Points

Every page on every platform carries an "Advertise" CTA. The entry point must pass context to Sarah:

```php
// Passed as session context when Sarah launches
[
    'source_platform' => 'day_news',         // day_news | goeventcity | downtownguide | golocalvoices
    'source_community_id' => $community->id, // community the user was browsing
    'source_url' => $request->url(),
    'source_article_id' => $article->id ?? null,
    'visitor_type' => 'guest' | 'user' | 'business_owner',
]
```

---

## Phase 1 — Business Identification

Before Sarah can make a relevant recommendation she needs to know who she's talking to.

### Flow

1. **If logged in with a claimed business** → skip to Phase 2 with business profile injected
2. **If logged in, no business** → "Let's start by finding your business" → search against existing Overture/business DB
3. **If guest** → inline account creation after Phase 3 (do not block entry with auth)

### Business Claim / Identify UI

- Search field: business name + city
- Results pulled from `businesses` table (Overture import)
- "I don't see my business" → create new record, flag for enrichment
- One-tap claim with verification (phone SMS or email)

### DB: `advertiser_sessions`

```php
Schema::create('advertiser_sessions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('business_id')->nullable();
    $table->uuid('user_id')->nullable();
    $table->uuid('community_id');
    $table->string('source_platform');
    $table->string('source_url');
    $table->json('intake_answers')->nullable();
    $table->json('proposal')->nullable();
    $table->string('status')->default('intake'); // intake | proposed | negotiating | converted | abandoned
    $table->uuid('campaign_id')->nullable();
    $table->timestamps();
});
```

---

## Phase 2 — Conversational Intake (3 Questions)

Sarah collects context conversationally — not as a form. She speaks as a knowledgeable local marketing advisor.

### Questions (in order)

**Q1: Goal**
> "What's the main thing you're trying to accomplish right now — more foot traffic, more calls, more online orders, or something else?"

Maps to: `goal` enum → `foot_traffic | leads | online_sales | brand_awareness | event_promotion | hiring`

**Q2: Timeline**
> "Are you trying to drive results in the next week or two, or is this more of an ongoing thing?"

Maps to: `timeline` → `immediate` (1–2 weeks) | `short` (1 month) | `ongoing`

**Q3: Budget**
> "What kind of budget are you working with? I'll tell you exactly what I can do with it."

Options presented: Under $100 · $100–$300 · $300–$600 · $600+ · Not sure yet

Sarah acknowledges each answer naturally before moving to the next question.

### System Prompt Injected for Sarah

```
You are Sarah, the advertising account manager for Day.News and the Fibonacco local media network.
You are speaking with the owner or representative of {business_name}, a {business_category} located in {community_name}.
Their goal is {goal}. Their timeline is {timeline}. Their budget is {budget_range}.

Your job is to build the most effective campaign for this specific business and present it clearly.
You have access to the following products: {available_products_with_prices}.

Rules:
- Never use jargon. Speak like a trusted local advisor, not an ad platform.
- Back every recommendation with a reason specific to their business type and goal.
- When you present the proposal, explain WHY each item is included.
- If they remove something that will hurt their results, tell them plainly.
- Never recommend more than they need. If $99 gets them what they want, say so.
```

---

## Phase 3 — The Proposal (Checkbox UI)

Sarah presents the campaign as an interactive checklist. Every item is pre-checked based on her recommendation. The user can check/uncheck items freely — but Sarah enforces bundle rules.

### UI Structure

```
┌─────────────────────────────────────────────────────┐
│  Sarah's Recommendation for Clearwater Plumbing Co. │
│  Goal: More service calls · Budget: $100–$300        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ✅  Headliner Ad — Clearwater community            │
│      Top of page, 7 days · $149                    │
│      "This is where people who are already          │
│       reading local news will see you first."       │
│                                                     │
│  ✅  Newsletter Callout — Clearwater weekly         │
│      Next send, 4,200 subscribers · $79            │
│      "Your ad goes out to the people who read       │
│       every issue — the most engaged audience."     │
│                                                     │
│  ☐   Sponsored Article — About your business       │
│      AI-written, published on Day.News · $149      │
│      "Adds credibility. Recommended if you're       │
│       new to the market."                           │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Selected total: $228    [Continue to Checkout →]   │
└─────────────────────────────────────────────────────┘
```

### Key UI Rules
- Each item shows: product name, scope, duration, price, and Sarah's plain-English rationale
- Price updates in real time as items are checked/unchecked
- Sarah's rationale is AI-generated per business — not static copy
- "Why this?" expandable per line item
- "Not sure about this?" opens a Sarah chat inline

---

## Phase 4 — Bundle Logic & Pushback

This is where Sarah protects both the advertiser's results and platform quality.

### Bundle Rules Engine

```php
final class CampaignBundleValidator
{
    /**
     * Rules evaluated when user unchecks or checks an item.
     * Returns array of warnings Sarah speaks aloud.
     */
    public function validate(array $selectedProducts, array $businessContext): array
    {
        $warnings = [];

        // Rule: Newsletter without display ad wastes the callout
        if (
            in_array('newsletter_callout', $selectedProducts) &&
            !in_array('headliner_ad', $selectedProducts) &&
            !in_array('display_campaign', $selectedProducts)
        ) {
            $warnings[] = [
                'type' => 'soft_block',
                'message' => "Newsletter callouts work best when there's somewhere to send people. Without a landing ad, readers have nowhere to go after they see your name.",
                'suggestion' => 'headliner_ad',
            ];
        }

        // Rule: Sponsored article alone is not a campaign
        if (
            $selectedProducts === ['sponsored_article'] ||
            $selectedProducts === ['sponsored_article', 'newsletter_callout']
        ) {
            $warnings[] = [
                'type' => 'soft_block',
                'message' => "An article tells your story but won't drive immediate calls. Pair it with a Headliner Ad to give it reach.",
                'suggestion' => 'headliner_ad',
            ];
        }

        // Rule: Display campaign with no creative = waste
        if (
            in_array('display_campaign', $selectedProducts) &&
            !$businessContext['has_logo'] &&
            !in_array('sponsored_article', $selectedProducts)
        ) {
            $warnings[] = [
                'type' => 'info',
                'message' => "I'll need your logo and a headline to build your ad. I can write the copy — do you have a logo file?",
            ];
        }

        // Rule: Minimum viable campaign check
        if (count($selectedProducts) === 0) {
            $warnings[] = [
                'type' => 'hard_block',
                'message' => "Select at least one item to continue.",
            ];
        }

        return $warnings;
    }
}
```

### Warning Types

| Type | Behavior |
|------|----------|
| `hard_block` | Continue button disabled. Sarah explains why. |
| `soft_block` | Warning shown. Sarah recommends an add. User can override. |
| `info` | Sarah asks a clarifying question. No blocking. |
| `upsell` | Sarah surfaces a relevant add-on with rationale. Never pushy. |

### Sarah's Pushback Voice

Sarah never says "you need to buy X." She says:

> *"You can absolutely just run the newsletter callout — but I want to be honest with you: without a display ad, people who see your name won't have a place to click. For $149 more you'd have a complete package. Want me to add it?"*

The "Yes, add it" / "No, keep it as is" response is tracked. Sarah doesn't repeat herself.

---

## Phase 5 — Campaign Container

Every approved proposal becomes a Campaign record. The Campaign owns all line items.

### DB: `campaigns`

```php
Schema::create('campaigns', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('business_id');
    $table->uuid('user_id');
    $table->uuid('community_id');
    $table->string('name'); // Auto-generated: "Clearwater Plumbing — March 2026"
    $table->string('goal');
    $table->string('timeline');
    $table->string('status')->default('draft'); // draft | pending_payment | active | paused | completed
    $table->decimal('total_amount', 10, 2);
    $table->string('stripe_payment_intent_id')->nullable();
    $table->json('sarah_context')->nullable(); // Full intake + recommendation context
    $table->timestamps();
});
```

### DB: `campaign_line_items`

```php
Schema::create('campaign_line_items', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('campaign_id');
    $table->string('product_type'); // headliner_ad | newsletter_callout | sponsored_article | display_campaign | event_promotion | classified | coupon | announcement
    $table->string('product_id')->nullable(); // FK to respective product table once created
    $table->decimal('price', 10, 2);
    $table->json('configuration'); // product-specific config (dates, targeting, copy, etc.)
    $table->string('status')->default('pending'); // pending | active | completed | cancelled
    $table->timestamps();
});
```

---

## Phase 6 — Checkout

Single Stripe PaymentIntent covering all line items. Account created inline if guest.

### Flow

1. Summary screen: campaign name, line items, total
2. If guest: email + password inline (not redirect) — account created on payment success
3. Stripe Elements embedded — card entry in-page
4. On success:
   - Campaign status → `active`
   - Each line item routed to its fulfillment service
   - Sarah sends confirmation message with timeline
   - Business claimed/created if not already

### Fulfillment Routing

```php
final class CampaignFulfillmentService
{
    public function fulfill(Campaign $campaign): void
    {
        foreach ($campaign->lineItems as $item) {
            match($item->product_type) {
                'headliner_ad'       => app(HeadlinerAdService::class)->create($item),
                'newsletter_callout' => app(NewsletterAdSlotService::class)->reserve($item),
                'sponsored_article'  => app(SponsoredContentService::class)->queue($item),
                'display_campaign'   => app(AdCampaignService::class)->launch($item),
                'event_promotion'    => app(EventPromotionService::class)->activate($item),
                'classified'         => app(ClassifiedService::class)->publish($item),
                'coupon'             => app(CouponService::class)->activate($item),
                'announcement'       => app(AnnouncementService::class)->publish($item),
            };
        }
    }
}
```

---

## Phase 7 — Sarah as Ongoing Account Manager

After checkout, Sarah doesn't disappear. She is the business's permanent point of contact.

### Ongoing Behaviors

- **Weekly performance summary** — Sarah sends a plain-English digest: impressions, clicks, calls attributed, compared to similar businesses
- **Campaign renewal prompts** — 7 days before expiry: *"Your Headliner Ad is about to end. Results were strong — want to run it again?"*
- **Upsell triggers** — If a headliner ad performs above average: *"Your ad is getting 3x the usual clicks. This is a good time to add a sponsored article while people are already noticing you."*
- **Seasonal recommendations** — Sarah knows the community calendar and suggests timing

### DB: `sarah_messages`

```php
Schema::create('sarah_messages', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('business_id');
    $table->uuid('campaign_id')->nullable();
    $table->string('type'); // intake | proposal | pushback | confirmation | performance | renewal | upsell
    $table->text('message');
    $table->json('context')->nullable();
    $table->boolean('actioned')->default(false);
    $table->timestamps();
});
```

---

## Product Catalog Available to Sarah

| Product | Platform | Price Range | Duration |
|---------|----------|-------------|----------|
| Headliner Ad | Day.News | $49–$199 | 7–30 days |
| Display Campaign | Day.News | $99–$499/mo | Ongoing |
| Newsletter Callout | Day.News | $49–$149 | 1 send |
| Sponsored Article | Day.News | $99–$299 | Permanent |
| Event Promotion | GoEventCity | $29–$79 | Until event |
| Featured Listing | DowntownGuide | $29–$99/mo | Monthly |
| Classified | Day.News | $9–$49 | 7–30 days |
| Coupon | Day.News | $19–$49 | 7–30 days |
| Announcement | Day.News | $19–$99 | Permanent |

Prices are configured per community. Sarah always presents the community-specific price.

---

## Key Files to Create

```
app/Services/Sarah/
    SarahCampaignService.php       — orchestrator
    CampaignBundleValidator.php    — bundle/pushback rules
    CampaignFulfillmentService.php — routes line items to product services
    SarahMessageService.php        — ongoing account management messages
    ProductCatalogService.php      — returns available products + community pricing

app/Models/
    AdvertiserSession.php
    Campaign.php
    CampaignLineItem.php
    SarahMessage.php

app/Http/Controllers/Sarah/
    SarahCampaignController.php

database/migrations/
    create_advertiser_sessions_table.php
    create_campaigns_table.php
    create_campaign_line_items_table.php
    create_sarah_messages_table.php

resources/js/react/Sarah/
    CampaignBuilder.tsx     — full builder wrapper
    BusinessSearch.tsx      — identify/claim business
    IntakeChat.tsx          — 3-question conversational intake
    ProposalChecklist.tsx   — interactive checkbox proposal
    BundleWarning.tsx       — Sarah's pushback message component
    CampaignCheckout.tsx    — summary + Stripe Elements
    SarahDashboard.tsx      — ongoing account manager view

routes/sarah.php
```

---

## Implementation Order

1. Migrations (all 4 tables)
2. Models
3. `ProductCatalogService` — foundation for everything
4. `CampaignBundleValidator` — pure logic, no dependencies
5. `SarahCampaignService` — orchestrator
6. `CampaignFulfillmentService` — stubs for each product type, fill in as agents complete
7. Controller + routes
8. React: BusinessSearch → IntakeChat → ProposalChecklist → BundleWarning → CampaignCheckout
9. `SarahMessageService` + ongoing dashboard

---

## What This Is Not

- Not a form disguised as a chatbot
- Not a self-serve ad platform where you pick from a menu
- Not a lead gen tool that hands off to humans
- Not a campaign manager that requires marketing knowledge to use

Sarah is a trusted local advisor who happens to be available 24/7, knows every business in every community, and gets better at this the more campaigns she runs.
