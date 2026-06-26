# Manifest Destiny — Complete Campaign Content & Experience Guide

> Source of truth: `database/seeders/ManifestDestinyTimelineSeeder.php` (sequence) +
> `database/seeders/ManifestDestinyEmailTemplateSeeder.php` (content) +
> `public/campaigns/landing_pages_master.json` (60 presentations).
> Variables `{{customer_name}} {{business_name}} {{community_name}} {{city}} {{listing_url}} {{founder_days_remaining}}` are filled per recipient at send time.

## Overview — what's actually in the campaign

Three sequential timelines by pipeline stage:

| Timeline | Stage | Length | Touchpoints |
|---|---|---|---|
| **Hook** | HOOK | 90 days | 15 emails · **1 SMS** (day 10) · internal/system checks |
| **Education** | ENGAGEMENT | 60 days | 15 emails |
| **How-To** | SALES | 90 days | 30 emails |

**Channels used: email (60 templates) + SMS (1).**
**Phone calls: 0. Voicemails (RVM): 0.** — The engine *supports* phone/SMS/RVM, but the seeded Manifest Destiny sequence schedules **no phone or voicemail steps**. Nothing is hidden; there is no phone/voicemail content to show because none is defined. (If you want phone/voicemail in the sequence, that's a content + timeline addition — flagged at the end.)

Every email links to a **landing page** (`/learn/<slug>`) which is a narrated slide presentation hosted by the **Sarah/Emma AI** (Part 2).

---

# PART 1 — Every message

## HOOK timeline (90 days) — the sequence 385K businesses are in

| Day | Channel | Subject | → Landing page |
|---|---|---|---|
| 1 | email | Your community just got its own Day.News platform | claim-your-listing |
| 1 | internal | *(ops) new-lead batch notification* | — |
| 3 | email | We already wrote about {{business_name}} on Day.News | (claim) |
| 5 | email | Got an event coming up? Post it free to 10,000+ locals | post-your-event |
| 7 | email | Claim your free business listing on Day.News | — |
| 10 | email | We drafted a coupon for {{business_name}} - publish it? | create-coupon |
| 10 | **SMS** | *(listing reminder — see below)* | — |
| 14 | email | How neighbors are using Day.News in {{community_name}} | — |
| 17 | email | Apply to be featured in this week's spotlight | get-featured |
| 18 | email | Post a free coupon on Day.News for {{community_name}} | — |
| 19 | email | Hiring? Selling? Your classified is ready | post-classified |
| 21 | system | *engagement check (threshold 20)* | — |
| 24 | email | Founder pricing: {{founder_days_remaining}} days left | — |
| 25 | email | Connect your CRM and never lose a lead again | crm-integration |
| 28 | email | Final notice: founder pricing for Day.News | — |
| 32 | email | Your listing could be getting 5x more views | featured-listing |
| 44 | email | Get in front of 10,000+ local subscribers this week | newsletter-advertising |
| 47 | email | Sponsor our community events | become-sponsor |
| 51 | email | Get a feature article written about {{business_name}} | article-advertising |
| 54 | email | You're an expert. Let's make sure people know it. | expert-registration |
| 58 | email | Local influencer opportunity | influencer-program |
| 65 | email | We'll post to your social media for free this week | social-posting-trial |
| 68 | email | Holiday event season is here | holiday-events |
| 72 | email | Someone nominated {{business_name}} for recognition | business-nomination |
| 80 | system | *engagement check (threshold 40)* | — |
| 90 | system | *advance to Engagement stage* | — |

### HOOK — full email bodies

**Day 1 · Welcome — Community Launch**
Subject: *Your community just got its own Day.News platform*
> Hi {{customer_name}}, {{community_name}} now has a daily local news platform powered by **Day.News**, and your business—**{{business_name}}**—is already part of the story neighbors will read. You do not need to sign up again; we built the first wave of listings from public information so the site feels complete on day one. Review your free listing here: {{listing_url}}. We are excited to help {{city}} businesses reach the community without shouting into the void of social feeds. — The Day.News team

**Day 3 · Your business featured**
Subject: *We already wrote about {{business_name}} on Day.News*
> Hi {{customer_name}}, Editors at **Day.News** included **{{business_name}}** in early coverage for {{community_name}}. It is a light-touch mention today—and a chance to claim your profile, add hours, and show up correctly when locals search. [Review your listing]({{listing_url}})

**Day 5 · Hook — Post your event**
Subject: *Got an event coming up? Post it free to 10,000+ locals*
> Hi {{customer_name}}, Got something happening at **{{business_name}}**? Thousands of neighbors in {{community_name}} are reading Day.News daily. Post your event for free and get it in front of people who actually live nearby. [Post your event]({{listing_url}})

**Day 7 · Free listing claim**
Subject: *Claim your free business listing on Day.News*
> Hi {{customer_name}}, Your free listing for **{{business_name}}** is waiting. Claiming takes a minute and helps neighbors find you on {{community_name}}'s Day.News site. [Claim my listing]({{listing_url}})

**Day 10 · Hook — Create a coupon**
Subject: *We drafted a coupon for {{business_name}} - publish it?*
> Hi {{customer_name}}, We created a draft coupon for **{{business_name}}** based on what works for similar businesses in {{community_name}}. You can edit and publish it in under a minute. [Review your coupon]({{listing_url}})

**Day 14 · Community influencer intro**
Subject: *How neighbors are using Day.News in {{community_name}}*
> Hi {{customer_name}}, Local businesses near you are using **Day.News** to stay visible without expensive ad buys. Here is a quick snapshot of what an influencer-style package can look like—and why it matters in {{community_name}}. Questions? Hit reply; we read every message.

**Day 17 · Hook — Get featured**
Subject: *Apply to be featured in this week's spotlight*
> Hi {{customer_name}}, Each week, Day.News spotlights one business in {{community_name}}. It is free, and the coverage reaches everyone on the platform. Apply for **{{business_name}}** now. [Apply for spotlight]({{listing_url}})

**Day 18 · Coupon feature offer**
Subject: *Post a free coupon on Day.News for {{community_name}}*
> Hi {{customer_name}}, You can publish a limited-time coupon on **Day.News** so nearby readers can redeem it in store or online. It is a simple way to turn attention into visits for {{business_name}}. [Open your listing hub]({{listing_url}})

**Day 19 · Hook — Post classified**
Subject: *Hiring? Selling? Your classified is ready*
> Hi {{customer_name}}, Classifieds on Day.News reach verified locals in {{community_name}}. Whether **{{business_name}}** is hiring, selling equipment, or posting a special offer—it is free to list. [Post a classified]({{listing_url}})

**Day 24 · Founder pricing urgency**
Subject: *Founder pricing: {{founder_days_remaining}} days left for {{community_name}}*
> Hi {{customer_name}}, The founder window for **Day.News** in {{community_name}} is closing. Lock in founder rates while they are still available—after that, standard community pricing applies. [Review options]({{listing_url}})

**Day 25 · Hook — CRM integration**
Subject: *Connect your CRM and never lose a lead again*
> Hi {{customer_name}}, When someone claims a coupon or responds to your listing on Day.News, the lead goes directly to your CRM. No copy-paste, no missed opportunities for **{{business_name}}**. [Set up integration]({{listing_url}})

**Day 28 · Last chance founder**
Subject: *Final notice: founder pricing for Day.News in {{community_name}}*
> Hi {{customer_name}}, This is a short final note: founder pricing for **Day.News** in {{community_name}} is almost gone. If you want to secure the rate for {{business_name}}, act this week. [Secure founder pricing]({{listing_url}})

**Day 32 · Hook — Featured listing**
Subject: *Your listing could be getting 5x more views*
> Hi {{customer_name}}, Featured listings in {{community_name}} get 5x more views than standard listings. **{{business_name}}** qualifies for a featured upgrade. [See featured options]({{listing_url}})

**Day 44 · Hook — Newsletter advertising**
Subject: *Get in front of 10,000+ local subscribers this week*
> Hi {{customer_name}}, The Day.News newsletter goes out to 10,000+ subscribers in {{community_name}} every day. Place **{{business_name}}** in front of engaged local readers. [See newsletter options]({{listing_url}})

**Day 47 · Hook — Become a sponsor**
Subject: *Sponsor our community events—your brand everywhere locals gather*
> Hi {{customer_name}}, Community sponsors in {{community_name}} get their brand on every event page, newsletter, and social post. Premium visibility for **{{business_name}}** with zero content creation required. [Explore sponsorship]({{listing_url}})

**Day 51 · Hook — Article advertising**
Subject: *Get a feature article written about {{business_name}}*
> Hi {{customer_name}}, Our editorial team can write a feature article about **{{business_name}}** for Day.News. Published articles reach thousands and rank in local search results. [Learn more]({{listing_url}})

**Day 54 · Hook — Expert registration**
Subject: *You're an expert. Let's make sure people know it.*
> Hi {{customer_name}}, Day.News is building a directory of trusted local experts in {{community_name}}. Register **{{business_name}}** as an expert in your field and get featured in relevant stories. [Register as expert]({{listing_url}})

**Day 58 · Hook — Influencer program**
Subject: *Local influencer opportunity—get paid to share what you love*
> Hi {{customer_name}}, Community influencers on Day.News get premium placement, story mentions, and dedicated support. **{{business_name}}** is a great fit for the {{community_name}} influencer program. [Apply now]({{listing_url}})

**Day 65 · Hook — Social posting trial**
Subject: *We'll post to your social media for free this week*
> Hi {{customer_name}}, For one week, we will create and post social media content for **{{business_name}}** based on what is happening in {{community_name}}. No cost, no commitment—just see if it works. [Start free trial]({{listing_url}})

**Day 68 · Hook — Holiday events**
Subject: *Holiday event season is here—don't miss your chance to participate*
> Hi {{customer_name}}, {{community_name}} has holiday events coming up and local businesses are signing up for booths, sponsorships, and promotions. Make sure **{{business_name}}** is part of the festivities. [See holiday events]({{listing_url}})

**Day 72 · Hook — Business nomination**
Subject: *Someone nominated {{business_name}} for recognition*
> Hi {{customer_name}}, A member of the {{community_name}} community nominated **{{business_name}}** for local business recognition on Day.News. Accept the nomination to be featured. [Accept nomination]({{listing_url}})

### The one SMS — Day 10 (`listing_reminder_sms`)
> Day.News: Your free listing for {{business_name}} in {{community_name}} is ready. Open {{listing_url}} to claim.
*(Conditional: skipped if the recipient opened email within 72h.)*

---

## EDUCATION timeline (60 days) — thought-leadership nurture
*All emails wrap: "Hi {{customer_name}}, <body> [Learn more]({{listing_url}}) — The Day.News team"*

| Day | Subject | Body | Landing page |
|---|---|---|---|
| 2 | Something is happening in local marketing | A quiet revolution is underway in how local businesses get found. Community-powered platforms are replacing the pay-to-play model. See what it means for {{business_name}}. | the-new-day |
| 6 | Google is dying. Here's how people find businesses now. | The way customers discover local businesses is changing fast. AI assistants, community platforms, and voice search are replacing traditional search. | ai-discovery |
| 12 | One listing. Found everywhere. Here's how. | When {{business_name}} is on Day.News, your listing appears across multiple community apps — not just one. | publishing-network |
| 16 | Why 'community marketing' beats 'digital marketing' | Digital marketing is noisy. Community marketing reaches the people who actually live near {{business_name}}. | community-marketing |
| 20 | Your reputation is now your algorithm | AI systems are now deciding which businesses to recommend. Your reputation is the new algorithm. | reputation-ai-age |
| 24 | The employee you couldn't afford just became free | AI can now handle customer inquiries, social media, and content creation for {{business_name}}. | ai-employee |
| 28 | AI writes. You approve. Content happens. | Consistent content keeps {{business_name}} visible. AI drafts it; you just approve. | ai-content |
| 32 | Your phone can answer itself now | Voice AI can answer calls, take messages, and book appointments — 24/7. | voice-ai |
| 36 | Local SEO isn't dead—it evolved | Search is changing, but local visibility still matters. Here's what works now. | local-seo-guide |
| 40 | AI can write your marketing. Here's how to make it actually good. | AI content works when you guide it. Quick tips for marketing copy that sounds human. | ai-content-guide |
| 44 | The businesses that survive the next 5 years will have this in common | What thriving 2031 businesses share — and what to start today. | future-proof-guide |
| 48 | Your customers care about privacy | Privacy-conscious businesses earn more trust. | data-privacy-guide |
| 52 | What your competitors know about you | Competitive intelligence is smart business, not spying. | competitive-intelligence |
| 55 | Your customers expect instant responses | Response time is the new differentiator; AI helps you respond instantly. | ai-customer-service |
| 58 | Meet your new AI employees | AI employees handle service, content, and scheduling for {{business_name}}. | ai-employees-explained |

---

## HOW-TO timeline (90 days) — feature adoption for subscribers
*Same wrapper. 30 emails, every 3 days.*

| Day | Subject | Landing page |
|---|---|---|
| 1 | Your Command Center is ready | command-center-basics |
| 3 | How to get featured in local news | create-article |
| 6 | Post events that actually get attendance | event-creation-guide |
| 8 | Turn your location into a destination | premium-venue-setup |
| 10 | Get booked: Set up your performer profile | performer-registration |
| 13 | Make news: How to post announcements | post-announcement |
| 17 | Expand your reach to multiple communities | multi-community-guide |
| 20 | Let AI handle your initial customer conversations | ai-sales-setup |
| 24 | Your dashboard explained: find everything in 5 minutes | dashboard-tour |
| 27 | Connect your social accounts in 5 minutes | social-connection-guide |
| 30 | Set up email marketing in 10 minutes | email-marketing-setup |
| 33 | How to respond to reviews (good and bad) | review-response-guide |
| 36 | Set up auto-posting and never miss a day | automated-posting-guide |
| 39 | Create customer surveys that get responses | customer-survey-setup |
| 42 | Understand your analytics in 10 minutes | analytics-guide |
| 48 | Capture leads from your website (finally) | lead-capture-guide |
| 51 | Let customers book appointments 24/7 | appointment-booking-setup |
| 54 | Automate invoicing and get paid faster | invoice-automation-guide |
| 57 | Text your customers (the right way) | sms-marketing-guide |
| 60 | Build an FAQ that answers questions first | faq-builder-guide |
| 63 | Connect Google Business Profile | google-integration-guide |
| 66 | Save 10+ hours weekly with automation | workflow-automation-guide |
| 69 | Generate business reports automatically | report-generation-guide |
| 72 | Segment customers for targeted marketing | customer-segmentation-guide |
| 75 | Train AI to sound like your business | ai-training-guide |
| 78 | Connect your favorite tools in minutes | integration-marketplace |
| 81 | Set up your team for collaboration | team-collaboration-guide |
| 84 | Plan your content like a pro | content-calendar-guide |
| 87 | Know exactly what's working | roi-tracking-guide |
| 90 | Your complete playbook for sustainable growth | success-playbook |

*(How-To bodies are one-line tutorials; e.g. Day 1: "Everything you need to manage {{business_name}} on Day.News is in one place. Here is a quick tour of your Command Center in {{community_name}}." Full bodies in `ManifestDestinyEmailTemplateSeeder.php`.)*

---

# PART 2 — Every landing page + the Sarah/Emma AI presentation

Each email's landing page is a **narrated slide presentation** (FibonaccoPlayer + a "Room with Sarah" AI panel). There are **60** of them. Two AI personas: **Sarah** (offers — "excited, helpful, get user to act") on 30 pages, **Emma** (how-to — "step-by-step, guide user through process") on 30 pages.

**Experience them locally:** dev server is running → open `http://localhost:5173/learn/<slug>` for any row below.

| # | URL (/learn/...) | Experience | Slides | Sarah persona · goal | CTA |
|---|---|---|---|---|---|
| 1 | `/learn/claim-your-listing` | Claim Your Listing (Hook/Offer) | 6 | Sarah — Get user to take immediate action | signup_free |
| 2 | `/learn/seo-reality-check` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 3 | `/learn/post-your-event` | Event Posting Guide (Hook/Offer) | 5 | Sarah — Get user to take immediate action | signup_free |
| 4 | `/learn/command-center-basics` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 5 | `/learn/ai-marketing-101` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 6 | `/learn/create-coupon` | Coupon Creator (Hook/Offer) | 5 | Sarah — Get user to take immediate action | signup_free |
| 7 | `/learn/ai-marketing-assistant` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 8 | `/learn/create-article` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 9 | `/learn/event-creation-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 10 | `/learn/ai-operations-guide` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 11 | `/learn/get-featured` | Feature Application (Hook/Offer) | 6 | Sarah — Get user to take immediate action | signup_free |
| 12 | `/learn/premium-venue-setup` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 13 | `/learn/ai-search-visibility` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 14 | `/learn/performer-registration` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 15 | `/learn/post-announcement` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 16 | `/learn/post-classified` | Classified Ad Posting (Hook/Offer) | 5 | Sarah — Get user to take immediate action | signup_free |
| 17 | `/learn/community-marketing` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 18 | `/learn/multi-community-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 19 | `/learn/ai-sales-setup` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 20 | `/learn/reputation-ai-age` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 21 | `/learn/crm-integration` | Integration Setup (Hook/Offer) | 6 | Sarah — Get user to take immediate action | signup_free |
| 22 | `/learn/dashboard-tour` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 23 | `/learn/ai-customer-service` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 24 | `/learn/social-connection-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 25 | `/learn/email-marketing-setup` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 26 | `/learn/featured-listing` | Upgrade Offer (Hook/Offer) | 7 | Sarah — Get user to take immediate action | signup_free |
| 27 | `/learn/voice-ai-guide` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 28 | `/learn/review-response-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 29 | `/learn/automated-posting-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 30 | `/learn/local-seo-guide` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 31 | `/learn/newsletter-advertising` | Advertising Offer (Hook/Offer) | 6 | Sarah — Get user to take immediate action | signup_free |
| 32 | `/learn/customer-survey-setup` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 33 | `/learn/become-sponsor` | Sponsor Application (Hook/Offer) | 7 | Sarah — Get user to take immediate action | signup_free |
| 34 | `/learn/analytics-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 35 | `/learn/ai-content-guide` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 36 | `/learn/article-advertising` | Advertising Offer (Hook/Offer) | 6 | Sarah — Get user to take immediate action | signup_free |
| 37 | `/learn/expert-registration` | Expert Application (Hook/Offer) | 6 | Sarah — Get user to take immediate action | signup_free |
| 38 | `/learn/lead-capture-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 39 | `/learn/future-proof-guide` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 40 | `/learn/appointment-booking-setup` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 41 | `/learn/influencer-program` | Influencer Application (Hook/Offer) | 6 | Sarah — Get user to take immediate action | signup_free |
| 42 | `/learn/invoice-automation-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 43 | `/learn/data-privacy-guide` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 44 | `/learn/sms-marketing-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 45 | `/learn/faq-builder-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 46 | `/learn/social-posting-trial` | Free Trial Offer (Hook/Offer) | 5 | Sarah — Get user to take immediate action | signup_free |
| 47 | `/learn/competitive-intelligence` | Educational Content (Education) | 7 | Sarah — Build trust through education | download_guide |
| 48 | `/learn/google-integration-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 49 | `/learn/holiday-events` | Seasonal Promotion (Hook/Offer) | 5 | Sarah — Get user to take immediate action | signup_free |
| 50 | `/learn/workflow-automation-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 51 | `/learn/ai-employees-explained` | AI Employee Introduction (Hook/Offer) | 9 | Sarah — Build trust through education | download_guide |
| 52 | `/learn/business-nomination` | Business Nomination (Hook/Offer) | 5 | Sarah — Get user to take immediate action | signup_free |
| 53 | `/learn/report-generation-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 54 | `/learn/customer-segmentation-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 55 | `/learn/ai-training-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 56 | `/learn/integration-marketplace` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 57 | `/learn/team-collaboration-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 58 | `/learn/content-calendar-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 59 | `/learn/roi-tracking-guide` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |
| 60 | `/learn/success-playbook` | How-To Tutorial (How-To/Onboarding) | 8 | Emma — Guide user through process | start_trial |

---

## How to experience the presentations + AI

1. **Dev server is already running:** `http://localhost:5173/` (started via `npx vite`).
2. **Open any presentation:** `http://localhost:5173/learn/<slug>` — e.g.
   - `http://localhost:5173/learn/claim-your-listing` (Day-1 Hook offer, Sarah)
   - `http://localhost:5173/learn/the-new-day` (Education opener, Sarah)
   - `http://localhost:5173/learn/command-center-basics` (How-To, Emma)
3. **What you'll see:** the slide deck (FibonaccoPlayer) on the left, the **Sarah/Emma AI panel** ("Room with Sarah") on the right — narration, chat, and the CTA.
4. **AI note:** slide content + pre-recorded narration load from the static campaign JSONs (frontend only). The **live AI chat/narration** (Sarah answering typed questions) calls the backend AI endpoints — start the API (`horizon` service / local `php artisan serve` + `VITE_API_URL`) for full conversational AI; the deck + scripted narration play without it.

## Gaps / honest notes
- **No phone or voicemail** is defined in the Manifest Destiny sequence (email + 1 SMS only). The platform engine supports `send_sms` / `make_call` / RVM, but the timeline schedules none — so there is no phone/voicemail content to provide. Adding them = new `SmsTemplate`/phone-script content + timeline actions.
- Email **landing-page slugs** in a few timeline steps (e.g. `influencer-program`, `holiday-events`, `business-nomination`, `social-posting-trial`) don't all have an exact entry in the 60-page registry — those CTAs may 404 until a matching presentation is added. The 60 in the table below are the built experiences.
