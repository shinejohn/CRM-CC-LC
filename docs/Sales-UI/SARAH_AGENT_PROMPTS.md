# Sarah Pitch Engine — Agent Prompts
## Copy-Paste Ready Prompts for Each Cursor/Claude Code Agent

> **How to use this file:**
> 1. Open the CC repo in Cursor
> 2. Upload SARAH_MASTER_SPEC.md to the Cursor context (drag into chat or use @ mention)
> 3. Paste the relevant agent prompt below
> 4. Run agents IN ORDER — each one depends on the previous
> 5. Do not run Agent 2 until Agent 1 is merged and verified
> 6. Do not run Agent 4 until Agents 2 and 3 are merged and Antigravity has reviewed

---

## WHICH AGENT BUILDS WHAT

| Agent | Builds | Depends On | Estimated Scope |
|---|---|---|---|
| **Backend** | Laravel migrations, models, services, API routes | Nothing — run first | ~15 files |
| **UI Agent 1** | Design tokens, shell layout, shared components | Backend (for API types) | ~12 files |
| **UI Agent 2** | All step screens and gate screens | UI Agent 1 | ~20 files |
| **UI Agent 3** | CC internal follow-up and analytics views | UI Agent 1 | ~8 files |
| **UI Agent 4** | API wiring, hooks, real data replacing mocks | Agents 1, 2, 3 all merged | ~6 files |

**Run order:** Backend → UI Agent 1 → UI Agents 2 & 3 (parallel) → Antigravity review → UI Agent 4

---

---

# BACKEND AGENT PROMPT

> Paste this into Cursor with SARAH_MASTER_SPEC.md in context.
> Run against the CC Laravel repo.

```
You are building the backend for the Sarah Pitch Engine on the Fibonacco Command Center 
Laravel application.

Read SARAH_MASTER_SPEC.md before writing any code. Specifically study:
- PART 2 (Pitch Engine Spec) for the full architecture
- PART 3 (CRM Enrichment Spec) for the data pipeline and service logic
- PART 6 (Campaign Builder Spec) for how campaigns and line items work

The existing system already has: Customer, SMB, Conversation, ConversationMessage, 
OutboundCampaign, CampaignRecipient models and their migrations. Do NOT recreate these. 
Add to them.

BUILD THESE FILES IN THIS ORDER:

─── MIGRATIONS ─────────────────────────────────────────────────────────
Run migrations in this exact order:

1. database/migrations/[timestamp]_alter_smbs_table_add_pitch_fields.php
   Add these nullable columns to the existing smbs table:
   org_type (string), pitch_track (string), has_events (boolean default false),
   has_venue (boolean default false), is_performer (boolean default false),
   website_exists (boolean nullable), website_current (boolean nullable),
   primary_goal (string nullable), customer_source (string nullable),
   marketing_spend_range (string nullable), communities_of_interest (json nullable),
   gates_completed (json nullable), gates_deferred (json nullable),
   products_accepted (json nullable), products_declined (json nullable),
   products_deferred (json nullable), pitch_status (string nullable),
   active_pitch_session_id (uuid nullable), converted_campaign_id (uuid nullable),
   proposal_value (decimal 10,2 nullable), founder_days_remaining (int nullable),
   pitch_started_at (timestamp nullable), pitch_completed_at (timestamp nullable),
   last_pitch_activity_at (timestamp nullable)

2. database/migrations/[timestamp]_create_pitch_sessions_table.php
   See PART 2 of the spec for exact schema.

3. database/migrations/[timestamp]_create_community_slot_inventory_table.php
   See PART 2 of the spec for exact schema.
   Add unique index on [community_id, platform, slot_type, category].

4. database/migrations/[timestamp]_create_pitch_reengagement_queue_table.php
   See PART 3 of the spec for exact schema.

5. database/migrations/[timestamp]_create_pitch_events_table.php
   See PART 2 of the spec for exact schema.
   Add indexes on [session_id, occurred_at], [event_type, occurred_at], [gate, event_type].

─── MODELS ──────────────────────────────────────────────────────────────

6. app/Models/PitchSession.php
   - Relationships: belongsTo SMB, Customer, Community, Conversation, Campaign
   - Casts: json fields as arrays
   - Scopes: active(), abandoned(), converted(), forCommunity($id)

7. app/Models/CommunitySlotInventory.php
   - Unique constraint validation on create
   - Computed attribute: available_slots (total - held)
   - Computed attribute: status ('open'|'almost_full'|'full')

8. app/Models/PitchReengagementQueue.php
   - Relationships: belongsTo PitchSession, SMB, Customer, OutboundCampaign
   - Scopes: dueNow(), queued(), byType($type)

9. app/Models/PitchEvent.php
   - Relationships: belongsTo PitchSession, SMB
   - No soft deletes — events are immutable

─── SERVICES ────────────────────────────────────────────────────────────

10. app/Services/Pitch/PitchEnrichmentService.php
    This is the most critical service. Read PART 3 carefully before writing.
    The process() method is called on every pitch event and routes to private methods.
    EVERY write to SMB or Customer goes through this service. Nothing else writes 
    pitch data directly to those models.
    
    Key rules:
    - enrichFromProfile(): creates/finds SMB, creates/finds Customer, creates Conversation
    - updateAiContext(): always called after any SMB update — keeps ai_context in sync
    - appendConversationMessage(): appends to existing conversation, never creates new one
    - All methods must handle null session->smb_id and session->customer_id gracefully

11. app/Services/Pitch/SlotInventoryService.php
    - getStatus(): reads from cache first (5 min TTL), falls back to DB
    - claimSlot(): DB transaction with lockForUpdate() — REQUIRED, not optional
    - releaseSlot(): inverse of claim, also uses lockForUpdate()
    - notifySlotWatchers(): checks SMB records for anyone who deferred this slot type
    - Cache key format: "slot:{communityId}:{slotType}:{category}"

12. app/Services/Pitch/ReengagementQueueService.php
    - queue(): writes to pitch_reengagement_queue with correct send_after window
    - dispatch(): called by scheduler, finds due items, calls send() on each
    - send(): creates OutboundCampaign + CampaignRecipient using EXISTING models
    - resolveTemplate(): returns subject + rendered blade view for each type
    - RETRY_WINDOWS constant: resume_incomplete=1day, deferred_gate=30days, 
      deferred_product=30days, slot_alert=0days, proposal_followup=7days

13. app/Services/Pitch/PitchAnalyticsService.php
    - log(sessionId, eventType, payload, gate?, product?): writes to pitch_events
    - getGatePermissionRates(days): query for dashboard
    - getAbandonmentFunnel(days): query for dashboard
    - getProductAcceptanceRates(days): query for dashboard

─── CONTROLLERS & ROUTES ────────────────────────────────────────────────

14. app/Http/Controllers/Pitch/PitchSessionController.php
    POST   /api/pitch/sessions              → create session
    GET    /api/pitch/sessions/{id}         → get session
    PATCH  /api/pitch/sessions/{id}         → update session + trigger enrichment
    POST   /api/pitch/sessions/{id}/event   → log event via PitchAnalyticsService
    POST   /api/pitch/sessions/{id}/proposal → build proposal, call CampaignBundleValidator
    GET    /api/pitch/sessions/{id}/resume  → get session for resume flow

15. app/Http/Controllers/Pitch/SlotInventoryController.php
    GET    /api/pitch/slots/{communityId}/{slotType}/{category} → getStatus
    POST   /api/pitch/slots/batch           → getStatus for multiple slots at once
    POST   /api/pitch/slots/{id}/claim      → claimSlot (authenticated, on conversion)

16. app/Http/Controllers/Pitch/BusinessSearchController.php
    GET    /api/pitch/businesses/search?q=  → search Overture/businesses table
    POST   /api/pitch/businesses/{id}/claim → claim a business record
    POST   /api/pitch/businesses            → create new business

17. app/Http/Controllers/Pitch/CommunityController.php
    GET    /api/pitch/communities/{slug}           → resolve slug to community
    GET    /api/pitch/communities/nearby?community_id=&category= → nearby with slot data

18. routes/pitch.php (included from routes/api.php)
    Public routes (no auth): sessions, events, businesses, communities, slots GET
    Authenticated routes: slot claims, proposal building

─── SCHEDULER ───────────────────────────────────────────────────────────

19. Add to app/Console/Kernel.php:
    - ReengagementQueueService::dispatch() → every 15 minutes
    - Abandon inactive sessions (last_active_at > 4 hours, status=pitching) → hourly
    - Founder rate expiry alerts → daily at 9am

─── EMAIL TEMPLATES ─────────────────────────────────────────────────────

20. Create blade templates in resources/views/emails/pitch/:
    resume_incomplete.blade.php
    deferred_gate.blade.php  
    slot_alert.blade.php
    proposal_followup.blade.php
    
    Each template receives the $context array from ReengagementQueueService.
    See PART 3 for the scripted message text for each template.
    RULE: No template may use the words "AI", "automated", or "algorithm".
    Use outcome language only.

─── SEEDER ──────────────────────────────────────────────────────────────

21. database/seeders/CommunitySlotInventorySeeder.php
    Seeds standard slot configuration for a new community.
    Standard slots per community:
    - influencer: 5 slots per category (restaurant, retail, bar, professional_services, 
      home_services, healthcare, fitness, entertainment, real_estate, other)
    - headliner: 1 slot per category (same categories)
    - event_headliner: 1 slot per event_category (music, food_drink, sports, arts, 
      community, fitness, business, education, family, other)
    - venue_headliner: 1 slot per venue_category (restaurant, bar, event_space, 
      outdoor, hotel, other)
    - performer_headliner: 1 slot per performer_category (band, dj, comedian, 
      speaker, solo_artist, other)
    - section_sponsor: unlimited (no slot limit — handled by available sections list)
    - expert_column: 1 slot per expertise category (legal, financial, health, fitness,
      nutrition, real_estate, education, culinary, other)

─── VERIFICATION CHECKLIST ──────────────────────────────────────────────

After building, verify:
[ ] All 5 migrations run without errors: php artisan migrate
[ ] PitchEnrichmentService.process() writes correctly to SMB and Customer
[ ] SlotInventoryService.claimSlot() uses DB transaction — verify with a race condition test
[ ] ReengagementQueueService.send() creates OutboundCampaign records (check existing model)
[ ] All routes registered: php artisan route:list | grep pitch
[ ] Seeder runs: php artisan db:seed --class=CommunitySlotInventorySeeder
[ ] No use of "AI", "automated", "algorithm" in any blade template
```

---

---

# UI AGENT 1 PROMPT — Design System & Shell

> Paste this into Cursor with SARAH_MASTER_SPEC.md in context.
> Run against the CC React/TypeScript frontend.
> This agent runs FIRST. Nothing else starts until this is verified.

```
You are building the design system and shell components for the Sarah Pitch Engine
in the Fibonacco Command Center React/TypeScript application.

Read SARAH_MASTER_SPEC.md before writing any code. Specifically study:
- PART 4 (UI Screen Spec) — Design System section at the top
- PART 5 (UI Cursor Briefs) — Agent 1 section

This is a GREENFIELD build. No pitch UI exists. Build from scratch.
Do not reference or import any Magic Patterns exports.

─── WHAT TO BUILD ───────────────────────────────────────────────────────

Create directory: src/pitch/

Files to create:

src/pitch/tokens.css
  CSS custom properties for all colors, spacing, and border-radius values.
  Scoped to .pitch-root class to avoid polluting global CC styles.
  See PART 4 Design System section for exact token names and values.

src/pitch/types.ts
  All TypeScript interfaces and types.
  See Agent 1 section of PART 5 for complete type definitions.
  Key types: EntryMode, OrgType, PitchTrack, GateKey, PitchSession,
  DiscoveryAnswers, DeferredGate, AcceptedProduct, DeclinedProduct, SlotStatus

src/pitch/shell/PitchShell.tsx
  Full-viewport two-panel layout.
  Left panel: 62% width, overflow-y-auto, 48px 64px padding.
  Right panel: 380px fixed, overflow-y-auto, var(--p-panel) background.
  Mobile (<768px): right panel becomes bottom drawer.
  Wraps with .pitch-root class so tokens.css scopes correctly.

src/pitch/shell/PitchHeader.tsx
  64px fixed header.
  Left: logo + 5 platform color dots (teal, green, purple, orange, amber).
  Center: PitchProgressBar component.
  Right: × close button.

src/pitch/shell/PitchProgressBar.tsx
  Props: steps, currentStep, completedSteps, subLabel?
  Steps: IDENTIFY, COMMUNITY, GOALS, YOUR PLAN, PROPOSAL, UPGRADES, YOUR DEAL, 
  CHECKOUT, DONE
  Completed: filled teal circle + checkmark + teal connecting line.
  Active: teal ring, dark fill, number + bold label + subLabel.
  Upcoming: dark gray circle, muted label.
  Mobile: show "Step N of M" only.

src/pitch/shell/SarahPanel.tsx
  Props: messages (SarahMessage[]), onSend?, isTyping?
  Amber circle avatar with "S" initial.
  Messages with left amber border, white text, muted timestamp.
  Typing indicator (3 dots animated) when isTyping=true.
  Input bar at bottom (hidden if no onSend).
  New messages animate in: opacity + translateY, 200ms ease-out.
  Auto-scroll to bottom on new message.

src/pitch/shell/UpsellShell.tsx
  Simpler shell for existing-customer gate upsell.
  No progress bar. Just header with gate name + × close.
  Same two-panel layout and tokens.

src/pitch/components/SlotStatusBar.tsx
  Props: total, held, category, community, showLabel?, size? ('sm'|'md')
  Visual squares: ■ held (teal), □ open (track color).
  Text: "N of M held · Z remaining"
  Status badge: green AVAILABLE / amber ALMOST FULL / red FULL.
  FULL state: show "Held by [name]" if heldBy prop provided.

src/pitch/components/ProductCard.tsx
  Props: name, price, description, rationale?, slotStatus?, included?,
         onAdd, onSkip, onDefer?, isAdded?, isSkipped?
  Card with teal left border when isAdded.
  Three action states: default (Add/Skip/Not right now), added, skipped.
  Spring animation on add (border color change).
  "Included" badge instead of price when included=true.

src/pitch/components/GateWrapper.tsx
  Props: permissionAsk, onYes, onSkip, onDefer?, entryMode, children, isOpen?
  entryMode='pitch': shows permission block first, AnimatePresence reveal on Yes.
  entryMode='upsell': renders children immediately, no permission block.
  Permission block: Sarah message bubble style + Yes/Skip buttons full-width.
  "Tell me more" expands secondary explanation block.
  Children reveal: height 0→auto, opacity 0→1, 300ms ease-out.

src/pitch/components/PositionLadder.tsx
  Props: positions (array of {label, sublabel?, highlight?, isCurrentPosition?}), title?
  Numbered list with visual tier separator between premium and basic.
  highlight=true: teal background, "← You'd be here" label.
  isCurrentPosition=true: muted, "← You are here" label.

src/pitch/components/SlotFullFallback.tsx
  Props: slotType, heldBy?, nearbyOptions?, fallbackProducts, onSelectFallback, onSkip
  Three variants: influencer (section options), headliner (priority upgrade), 
  expert_column (nearby communities).
  Scripted messages per variant — see PART 4 and PART 1 for exact text.

src/pitch/components/FastPathNav.tsx
  Props: availableGates, onSelect, onCollapse
  Thin bar (40px): "I already know what I want:" + gate pills.
  Each pill: icon + label, outlined, hover teal fill.
  Collapse link right: "↑ Hide".
  Mobile: wrap to 2 rows.

src/pitch/components/ResumePrompt.tsx
  Props: variant ('same_browser'|'email_link'), businessName, communityName,
         lastStep, nextStepLabel, slotUpdate?, onResume, onStartFresh, onDifferentBusiness
  Slot update renders as amber callout if counts changed since last session.

src/pitch/index.ts
  Re-export everything from all files above.

src/pitch/DevPreview.tsx
  Renders every component with realistic mock data.
  Accessible at /pitch-dev route (dev only — guard with process.env.NODE_ENV).
  This is the verification tool for all subsequent agents.

─── RULES ───────────────────────────────────────────────────────────────

1. All components use CSS variables from tokens.css — NO hardcoded hex values.
2. Framer Motion for all animations (already in project).
3. Every component accepts className prop for extension.
4. No AI/automated/algorithm language in any string.
5. Every interactive element has proper aria labels.
6. Mobile-first responsive — all components work at 375px width.

─── VERIFICATION ────────────────────────────────────────────────────────

After building:
[ ] /pitch-dev route renders DevPreview with all components visible
[ ] SlotStatusBar shows all three status states correctly
[ ] GateWrapper: pitch mode shows permission ask, upsell mode shows children immediately
[ ] ProductCard shows all three states: default, added, skipped
[ ] SarahPanel auto-scrolls on new message
[ ] PitchShell right panel collapses on mobile
[ ] No hardcoded hex colors — all use CSS variables
[ ] TypeScript: zero type errors (tsc --noEmit)
```

---

---

# UI AGENT 2 PROMPT — Steps & Gate Screens

> Paste this into Cursor with SARAH_MASTER_SPEC.md in context.
> Run AFTER UI Agent 1 is merged and DevPreview verified.

```
You are building all pitch step screens and gate screens for the Sarah Pitch Engine.

Read SARAH_MASTER_SPEC.md before writing any code. Specifically study:
- PART 4 (UI Screen Spec) — all gate and screen descriptions
- PART 5 (UI Cursor Briefs) — Agent 2 section (Steps & Gate Screens)
- PART 1 (Pitch Method) — for the exact scripted text Sarah says at each step
- PART 3 (CRM Enrichment) — to understand what data each step must collect

PREREQUISITE: src/pitch/ directory exists with all Agent 1 output.
Import everything from 'src/pitch' — do not rebuild primitives.

This is a GREENFIELD build. No pitch UI exists. Build from scratch.

─── GATE MARKETING RULE — READ THIS FIRST ──────────────────────────────

Every gate component accepts `entryMode: 'pitch' | 'upsell'`.

'pitch' mode: the business is a prospect going through the full pitch flow.
  GateWrapper shows permission ask. User must say Yes to see gate content.

'upsell' mode: the business is an EXISTING CUSTOMER being pitched on a specific
  gate they haven't purchased yet. GateWrapper skips permission ask entirely.
  Gate content renders immediately. Checkout is one-click (saved payment method).

This is critical. An existing Clearwater restaurant with Community Influencer can
receive an email: "You don't have GoEventCity yet — 1 Event Headliner spot left."
They click the link → EventHostGate renders in UpsellShell with entryMode='upsell'.
The same component works for both paths.

─── WHAT TO BUILD ───────────────────────────────────────────────────────

All step files in src/pitch/steps/
All gate files in src/pitch/gates/

─── STEP SCREENS ────────────────────────────────────────────────────────

Each step receives: session: PitchSession, onNext: (data?) => void, onBack: () => void
Each step fires onLogEvent('step_reached') on mount, onLogEvent('step_completed') on next.

src/pitch/steps/IdentifyStep.tsx
  Headline: "Let's get your business in front of your community."
  Subhead: "Sarah will build a plan that actually works for your business."
  Business name + city search input with debounced API call (300ms).
  Results dropdown: business name + address + category badge per result.
  On result click: show claim confirmation card.
  "Don't see your business? Add it manually" → inline form below.
  Add manually form fields: Business Name, Category (select), Address, City, Phone, Email.
  Footer: "You won't need an account until checkout." (centered, 12px muted)
  Sarah message on mount: "Hi! I'm Sarah, your account manager. I'm going to help 
  you build a plan that actually works for your business — not a generic package. 
  Start by finding your business and I'll take it from there."

src/pitch/steps/ProfileTypeStep.tsx
  Headline: "What best describes [businessName]?"
  6 selectable cards (2-column grid, 3 rows):
    Local Business (🏪), Event Venue (🎪), Performer/Entertainer (🎵),
    School/Educational Org (🎓), Non-Profit/Civic Org (🤝), Government/Municipality (🏛️)
  Selected state: teal border 2px, 10% teal background, checkmark badge top-right.
  After selection: secondary question animates in below cards.
  Secondary question: "Does [businessName] host or promote events?"
  Chips: Yes regularly / Occasionally / Not at all
  Continue button appears only after both questions answered.
  Sarah message after card selected: varies by org_type (see PART 1 for scripted lines).

src/pitch/steps/CommunityStep.tsx
  Headline: "Where do your customers live?"
  Subhead: "Select your primary community for [businessName]."
  City/zip search input for primary community.
  After primary selected: show selected community card (teal border, lock icon) 
  with SlotStatusBar for their category.
  Below: "NEARBY COMMUNITIES" section with list.
  Each nearby community: checkbox + name + compact SlotStatusBar + status badge.
  "Full in [category]" rows: show "Section Sponsor available" note.
  "Launching Q2" rows: gray "Reserve your spot" badge.
  Static framing text (show once): "Positions are limited per category per community
  — whoever holds one, holds it."
  Sarah messages vary based on slot availability — see PART 5 for exact text.

src/pitch/steps/GoalsStep.tsx
  Headline: "Tell me about your goals."
  Subhead: "I'll use this to build a plan that actually works for you."
  Questions appear one at a time. Answered questions shown as summary cards with edit icon.
  Q1: Goal — chips: More foot traffic / Get customers back / Promote an event or launch /
      Build community awareness / Something else
  Q2 (after Q1): Timeline — chips: Right now (1-2 weeks) / Next month / Ongoing
  Q3 (after Q2): Budget — chips: Under $100 / $100–$300 / $300–$600 / $600+ / Not sure yet
  "Build My Plan →" CTA appears after all 3 answered (full width, teal, large).
  Sarah messages after each question — see PART 5 for exact scripted text.

─── GATE INFRASTRUCTURE ─────────────────────────────────────────────────

src/pitch/gates/gateConfig.ts
  Export TRACK_GATE_SEQUENCES and ENTRY_GATE_PRIORITY constants.
  See Agent 2 section of PART 5 for exact values.

src/pitch/gates/GateSequencer.tsx
  Determines gate order from profile + entry platform.
  Fast-path: entry platform gates rendered first, then remaining in track order.
  Renders one gate at a time.
  FastPathNav rendered above current gate (after profile complete).
  Updates "YOUR PLAN" sub-label in progress bar with current gate name.
  On gate complete/defer: advance to next, log event.
  On all complete: fire onAllGatesComplete.

─── GATE SCREENS ────────────────────────────────────────────────────────

Each gate receives: session, slotData (pre-fetched from parent), entryMode,
onProductAdd, onProductSkip, onProductDefer, onGateComplete, onGateDefer, onLogEvent.

Gates use GateWrapper (handles permission ask / upsell skip logic).

src/pitch/gates/DayNewsGate.tsx
  permissionAsk: "Your business already has a basic listing in our network. Can I 
  take two minutes to show you what the difference looks like between where you 
  are now and where the top [category] businesses in [community] appear?"
  Content:
  - Headline: "Here's where [businessName] stands in [community] right now."
  - PositionLadder showing 3 tiers: Headliner / Priority Listing / Basic (current)
  - SlotStatusBar for influencer slots + headliner slot
  - If headliner taken: SlotFullFallback (headliner variant)
  - ProductCard: Community Influencer $300/mo (rationale from session.goal)
  - ProductCard: Newsletter Sponsor $150-300/send (if headliner not added)
  - ProductCard: Section Sponsor from $300/mo (if headliner full)

src/pitch/gates/DowntownGuideGate.tsx
  permissionAsk: "Because you have a physical location, the Downtown Guide is 
  worth understanding. It's where [community] residents search for places to go 
  and shop. Can I show you what your listing looks like there?"
  Content:
  - Headline: "The Downtown Guide is how [community] finds local businesses."
  - Two-column comparison: "YOUR LISTING NOW" vs "WITH PREMIUM LISTING"
    (see PART 5 for exact bullet points in each column)
  - SlotStatusBar for DTG headliner
  - ProductCard: Premium Listing (included=true)
  - ProductCard: Headliner if available, or SlotFullFallback if full
  - Two ProductCards: Poll Featured $49 / Poll Premium $149

src/pitch/gates/EventHostGate.tsx
  permissionAsk: "Something that can really drive traffic for a business like 
  yours is promoting events properly — even smaller ones like tastings, classes, 
  or pop-ups. Can I give you two minutes on how it works?"
  Content:
  - Headline: "GoEventCity is [community]'s event calendar. Here's how to be seen in it."
  - CSS event calendar visual (no images): Headliner card top, Priority row, Basic row, 
    "...30 more events" text
  - "Included in your plan:" checklist (4 items)
  - ProductCard: Event Headliner with slotStatus
  - ProductCard: Ticket Sales (commission)
  - ProductCard: Calendar Subscription $19-49/mo
  - ProductCard: "Since You're Going To..." $25-100/event (only if goal=retention)
  - Venue toggle (if applicable) → expands VenueGate content inline
  - Performer toggle (if applicable) → expands PerformerGate content inline

src/pitch/gates/VenueGate.tsx
  Can render standalone or as expansion inside EventHostGate.
  permissionAsk: "Your space is something people can rent — parties, corporate 
  events, private functions. There's a venue directory where people search 
  specifically for a place to host. Can I show you how that works?"
  Content:
  - Headline + SlotStatusBar for venue headliner
  - ProductCard: Venue Headliner
  - ProductCard: Venue Booking System $49/mo + commission

src/pitch/gates/PerformerGate.tsx
  Standalone or embedded.
  permissionAsk: "GoEventCity has a performer directory venues use when booking 
  talent. Want to see how to show up in it?"
  Content:
  - Headline + SlotStatusBar for performer headliner
  - ProductCard: Performer Headliner
  - ProductCard: Performer Booking System $49/mo + commission
  - ProductCard: Calendar Subscription

src/pitch/gates/GoLocalVoicesGate.tsx
  permissionAsk: "What you do is different from most businesses — people have to 
  trust you before they hire you. There's a way to build that in [community] 
  that isn't advertising. Can I take a minute?"
  Content:
  - Headline: "Be the [expertiseLabel] [community] reads every week."
  - Column preview mockup (pure CSS card — no images):
    "GoLocalVoices / THE [EXPERTISE] GUIDE · By [Name] / [businessName] · [community]"
  - ProductCard: Headline Spot (included=true)
  - ProductCard: Community Expert +$100/mo with slotStatus for expert_column

src/pitch/gates/AlphaSiteGate.tsx
  Special flow — qualifying question renders OUTSIDE GateWrapper (before permission ask).
  Qualifying question: "If someone searched for a [service] in [community] right 
  now, does [businessName] come up prominently?"
  Chips: Yes, we show up well / Somewhat / Not really
  On "Yes": follow-up "Has site been updated in the last year?"
    Current → gate closes (logEvent alphasite_gate_skipped_qualified)
    Not current → show permission ask
  On Somewhat/Not really → show permission ask immediately
  permissionAsk: "That's worth fixing. Can I take 30 seconds to show you what 
  the gap is and how we close it?"
  Content:
  - Headline: "How [community] residents find local businesses has changed."
  - CSS search result visual (no images): shows 3 competitors with complete profiles,
    then businessName with "Basic listing ←" marker
  - ProductCard: AlphaSite Profile (included=true)
  - Conditional intake question: "How much of your day involves answering the 
    same questions from customers?" (show if category suggests phone intake)
  - Chips: A lot / Some / Not really
  - On "A lot": ProductCard: Customer Response Service $99/mo
  !! CRITICAL: NO use of "AI", "automated", or "algorithm" in this gate. Ever. !!
  !! Outcome language only: "handles it", "works around the clock", "takes care of it" !!

src/pitch/gates/CivicGate.tsx
  Used for school, nonprofit, government org types. Replaces all other gates.
  permissionAsk: "[orgName] serves the community differently than a business. 
  We built something specifically for organizations like yours — not advertising, 
  community communication. Can I show you how other [type]s in [county] are using it?"
  Content:
  - Headline: "Your community presence is included. Here's how to make it work."
  - Free participation checklist (not ProductCards — just checkmarks):
    4 items with note "Included at no cost for [civic type]s in [community]"
  - ProductCard: Premium Event Listing $29-99/event
  - ProductCard: Event Headliner (annual events framing)
  - ProductCard: GoLocalVoices Column

─── PROPOSAL STEP ────────────────────────────────────────────────────────

src/pitch/steps/ProposalStep.tsx
  Headline: "Here's what I'd recommend for [businessName]."
  Subhead: "You can build your own plan, or take the complete package I put together."
  Amber founder pricing callout: "Founding member pricing: Lock in $300/month for 
  3 years. Window closes in [N] days."
  Two-column layout:
  Left: à la carte (products added during gates, with prices, running total,
        secondary "Continue with à la carte →" CTA)
  Right: Community Influencer package card (RECOMMENDED badge, teal border,
         $300/mo, savings badge, SlotStatusBar, included items checklist,
         "Get this package →" primary CTA)
  Sarah message: "Everything you selected is covered in the package — and it 
  saves you $[X] compared to buying each piece separately."

─── VERIFICATION ────────────────────────────────────────────────────────

Add all new screens to DevPreview.tsx with mock data.
Every gate must render correctly in BOTH entryMode values.
[ ] All steps render with mock session prop
[ ] All gates render in 'pitch' mode (shows permission ask)
[ ] All gates render in 'upsell' mode (no permission ask, content immediate)
[ ] AlphaSiteGate: qualifying question flow works (yes → close, no → open)
[ ] GateSequencer advances to next gate on complete/defer
[ ] ProposalStep shows à la carte and package side by side
[ ] No "AI", "automated", "algorithm" anywhere in AlphaSiteGate
[ ] TypeScript: zero errors (tsc --noEmit)
```

---

---

# UI AGENT 3 PROMPT — CC Internal Views

> Paste this into Cursor with SARAH_MASTER_SPEC.md in context.
> Can run in parallel with UI Agent 2.
> Uses existing CC layout (NavigationRail, AppShell) — NOT the pitch shell.

```
You are building the Command Center internal views for the Sarah Pitch Engine.
These are pages inside the existing CC admin interface, not the public pitch flow.

Read SARAH_MASTER_SPEC.md before writing any code. Specifically study:
- PART 3 (CRM Enrichment Spec) — CC Views section
- PART 5 (UI Cursor Briefs) — Agent 3 section

Use EXISTING CC layout components (NavigationRail, AppShell, shadcn/ui).
Use existing CC color tokens and design system — NOT the pitch tokens.css.
Use recharts for all charts (already in project).

─── WHAT TO BUILD ───────────────────────────────────────────────────────

All files in src/pages/command-center/pitch/ 
(or wherever CC pages live — check existing page structure first)

─── PAGES ───────────────────────────────────────────────────────────────

PitchDashboardPage.tsx → /command-center/pitch

  Top: 4 metric cards in a row
    Sessions Started (today / this week / this month tabs + delta)
    Proposals Sent + pipeline MRR value
    Conversion Rate + sparkline trend (recharts LineChart)
    Avg Gates Completed per converted pitch

  Abandonment Funnel (recharts BarChart, horizontal):
    Y-axis: step names
    X-axis: % of sessions reaching that step
    Color: green if >70%, amber if 50-70%, red if <50%
    Show absolute count as label on each bar

  Gate Permission Rates (recharts BarChart, horizontal, stacked):
    Y-axis: gate names, sorted ascending by permission rate (worst first)
    X-axis: percentage
    Stacks: Granted (teal) / Deferred (amber) / Declined (red)

  Slot Fill Status table:
    Columns: Community / Category / Slot Type / Total / Held / Available / Status
    Status: colored pill (green/amber/red)
    Filter dropdown by community

PitchFollowUpsPage.tsx → /command-center/pitch/follow-ups

  Filter tabs with counts:
  All | Incomplete Pitches | Deferred Gates | Unconverted Proposals | Due Today

  FollowUpCard component (create in src/components/pitch/):
    Props: type, businessName, community, contactName, contactEmail, lastActive,
           lastStep, gatesCompleted, gatesDeferred, proposalValue,
           founderDaysRemaining?, slotCounts?
    
    Layout:
    - Header row: business name (bold) + community (muted) + type badge (color by type)
    - Contact line: name · email (mailto link)
    - "Last active X ago · Left at: [lastStep]"
    - Gate chips row: completed=teal, deferred=amber with reason tooltip
    - Proposal value (green) if built
    - Founder rate countdown (amber callout) if applicable
    - Slot alert (red/amber) if slot count changed
    - Action buttons right-aligned (3 buttons max, vary by type):
      Incomplete: [Send Resume Email] [Complete for Them →] [Mark as Lost]
      Proposal: [Send Reminder] [Adjust Proposal →] [Mark as Lost]
      Deferred gate: [Re-pitch This Gate →] [Send Email] [Defer 30 Days]

  "Complete for Them →" action:
    Opens a right side-panel (not a modal — use Sheet from shadcn/ui)
    Shows remaining gates for the business with profile pre-loaded
    Uses gate components from src/pitch/gates/ with entryMode='upsell' and mock user
    "Send proposal to [email] →" CTA at bottom

  "Re-pitch This Gate →" action:
    Opens Sheet with the specific gate component, entryMode='upsell'
    Shows operator what the email/experience will look like
    [Send to Business] button generates and queues the re-engagement email

PitchProposalsPage.tsx → /command-center/pitch/proposals

  Toggle: [Kanban] [Table]
  
  Kanban: 5 columns (Proposed / Followed Up / Won / Lost / Expired)
  Each card: business name + community + MRR + product chips + days in stage + founder expiry
  @dnd-kit/core for drag between columns (check if already in CC, add if not)
  
  Table: sortable by MRR, days since proposed, community, status
  
  Bulk actions (appear when items selected via checkbox):
  [Send Reminder to Selected] [Export CSV] [Mark as Lost]
  
  Filter bar: Community / Category / MRR range / Days since proposed

SlotInventoryPage.tsx → /command-center/pitch/slots

  Community selector (shadcn Select or tab list at top)
  
  Slot inventory table for selected community:
  Columns: Category / Slot Type / Total / Held / Available / Held By / Actions
  Held By: business names, clickable → opens customer detail
  Actions: [Edit Total] [Release Slot] [Add Category Row]
  
  "+ Add community slot configuration" button → opens Dialog:
  Fields: Community (select), Platform (select), Slot Type (select), 
          Category (text input), Total Slots (number)
  
  "[Seed Community from Template]" button → Dialog with community selector,
  clicking "Seed" creates all standard slot rows for that community.

SMBPitchTab.tsx → tab added to existing customer/SMB detail page

  Find the existing customer detail page (likely /crm/customers/:id).
  Add a "Pitch" tab alongside existing tabs.
  
  Pitch status badge at top: Never Pitched / In Progress / Proposed / Converted
  
  Vertical timeline (scroll): each pitch session as a section.
  Within each session: events in order with icons.
  Icons: door=gate decision, tag=product, document=proposal, pause=abandoned, mail=email
  
  Deferred items section:
  Two sub-sections: Gates Deferred / Products Deferred
  Each item: name + retry date + [Re-pitch Now] or [Pitch Now] button
  
  Quick action buttons: [Resume Pitch →] [Send Email] [Complete Proposal for Them] [View Proposal]
  
  Founder rate callout if applicable (amber card):
  "Founder rate expires in [N] days for [community]."

─── VERIFICATION ────────────────────────────────────────────────────────

[ ] All 4 pages accessible via CC navigation
[ ] FollowUpCard renders for all 3 types with correct action buttons
[ ] "Complete for Them" side panel opens and renders a gate in upsell mode
[ ] Kanban drag-and-drop works between columns
[ ] Slot inventory table shows edit/release actions
[ ] SMB pitch tab renders timeline correctly
[ ] All charts render with mock data (no empty chart errors)
[ ] TypeScript: zero errors
```

---

---

# UI AGENT 4 PROMPT — API Wiring

> Paste this into Cursor with SARAH_MASTER_SPEC.md in context.
> Run AFTER Agents 1, 2, and 3 are all merged.
> Run Antigravity review on Agents 1-3 output BEFORE starting this agent.

```
You are wiring the Sarah Pitch Engine React components to the Laravel backend API.
All UI components are built and verified with mock data. Your job is to replace 
mock data with real API calls and hook up session persistence.

Read SARAH_MASTER_SPEC.md before writing any code. Specifically study:
- PART 5 (UI Cursor Briefs) — Agent 4 section
- PART 2 (Pitch Engine Spec) — API endpoints list

DO NOT change component structure. Only replace props and add hooks.
If a component needs structural change to accept real data, flag it — do not 
change it yourself.

─── WHAT TO BUILD ───────────────────────────────────────────────────────

src/pitch/api/pitchApi.ts

Create typed API functions for every backend endpoint:

createSession(entryContext: EntryContext): Promise<PitchSession>
  POST /api/pitch/sessions
  Called on first mount if no session in localStorage.

getSession(id: string): Promise<PitchSession>
  GET /api/pitch/sessions/{id}

updateSession(id: string, data: Partial<PitchSession>): Promise<PitchSession>
  PATCH /api/pitch/sessions/{id}
  Called after each step completes.

logEvent(sessionId: string, type: string, payload: any): Promise<void>
  POST /api/pitch/sessions/{id}/event
  FIRE AND FORGET — never await this in UI code. Use: logEvent(...).catch(console.error)
  Blocking the UI on analytics is a bug.

searchBusinesses(query: string): Promise<Business[]>
  GET /api/pitch/businesses/search?q={query}

claimBusiness(id: string, data: any): Promise<Business>
  POST /api/pitch/businesses/{id}/claim

createBusiness(data: any): Promise<Business>
  POST /api/pitch/businesses

getNearbyCommunities(communityId: string, category: string): Promise<CommunityWithSlots[]>
  GET /api/pitch/communities/nearby?community_id={id}&category={category}

getSlotStatus(communityId: string, slotType: string, category: string): Promise<SlotStatus>
  GET /api/pitch/slots/{communityId}/{slotType}/{category}

getSlotStatusBatch(requests: SlotRequest[]): Promise<Record<string, SlotStatus>>
  POST /api/pitch/slots/batch
  Use this on TerritoryStep and CommunityStep to fetch all slots at once.
  DO NOT loop individual getSlotStatus calls — use batch.

buildProposal(sessionId: string): Promise<Proposal>
  POST /api/pitch/sessions/{id}/proposal

resolveCommunitySlug(slug: string): Promise<Community>
  GET /api/pitch/communities/{slug}

─── HOOKS ───────────────────────────────────────────────────────────────

src/pitch/hooks/usePitchSession.ts

On mount:
1. Read sessionId from localStorage key 'pitch_session_id'
2. If found: call getSession(sessionId)
   - If incomplete (status !== 'converted'): surface ResumePrompt
   - If not found/expired: create new session
3. If no sessionId: check URL for ?resume= param
   - If present: load that session, surface ResumePrompt
4. Parse URL for: communitySlug, gate (fast-path), source (entry platform)
5. On community slug: call resolveCommunitySlug to get communityId

Expose:
  session: PitchSession | null
  isLoading: boolean
  error: string | null
  currentStep: string
  updateStep: (step: string, data?: any) => Promise<void>
  logEvent: (type: string, payload: any) => void  ← fire and forget wrapper
  resumeSession: () => void
  startFresh: () => void

Persist to localStorage on every step change:
  pitch_session_id (session UUID)
  pitch_current_step (step key)

src/pitch/hooks/useSlotInventory.ts

Uses SWR or React Query for caching.
staleTime: 5 * 60 * 1000  ← 5 minutes MAX. This is a hard requirement.
revalidateOnFocus: false

Exposes:
  getSlotStatus(communityId: string, slotType: string, category: string): SlotStatus | null
  batchFetch(requests: SlotRequest[]): void  ← call this on territory/community step load
  isLoading: boolean

─── ROUTING ─────────────────────────────────────────────────────────────

Add to CC router (find existing routing config):

/advertise/:communitySlug           → PitchRouter (public, no auth)
/advertise/:communitySlug           with ?resume=:sessionId → ResumePrompt auto-show
/advertise/:communitySlug           with ?gate=:gateKey → FastPath to gate
/advertise/:communitySlug           with ?source=:platform → Set entry platform

src/pitch/PitchRouter.tsx
  Top-level component for the pitch flow.
  Uses usePitchSession hook.
  Wraps PitchShell.
  Renders correct step based on session.lastStep.
  Fetches slot data batch for all selected communities via useSlotInventory.
  Passes session, slotData down to all children as props.
  Handles fast-path gate routing from URL params.

─── WIRE THESE COMPONENTS ───────────────────────────────────────────────

IdentifyStep: wire searchBusinesses (debounced), claimBusiness, createBusiness
CommunityStep: wire getNearbyCommunities + getSlotStatusBatch
GoalsStep: wire updateSession on completion
GateSequencer: wire logEvent on gate_offered, gate_permission_granted, gate_permission_denied
Each gate: wire logEvent on product_presented, product_accepted, product_declined, product_deferred
ProposalStep: wire buildProposal

─── VERIFICATION ────────────────────────────────────────────────────────

[ ] Business search returns real results (test with a real business name)
[ ] Session created on first load, ID persisted to localStorage
[ ] Returning to /pitch-dev-?resume= loads existing session and shows ResumePrompt
[ ] Slot data fetches correctly and updates UI (test with a full slot)
[ ] logEvent never throws an unhandled error — all failures are caught
[ ] Proposal builds successfully and returns line items
[ ] Fast-path URL (?gate=events) jumps to EventHostGate
[ ] No API call is awaited in a UI event handler without proper loading state
[ ] TypeScript: zero errors
[ ] No console errors in production build
```

---

---

# ANTIGRAVITY REVIEW PROMPT

> Run this after Agents 1, 2, and 3 merge — BEFORE Agent 4 starts.
> This catches structural issues before API wiring locks them in.

```
Perform an independent code review of the Sarah Pitch Engine UI components
built in the CC React application. Do not use any previous agent's work as 
reference — read the actual files in the repository.

Review scope: src/pitch/ directory and src/pages/command-center/pitch/ directory.

Check each of the following and report findings:

1. DESIGN SYSTEM COMPLIANCE
   - Do all components use CSS variables from tokens.css? (grep for hardcoded hex)
   - Are there any colors that bypass the token system?

2. ENTRYMODE PROP
   - Does every gate component accept entryMode: 'pitch' | 'upsell'?
   - Does GateWrapper correctly skip permission ask in upsell mode?
   - Does UpsellShell exist and work as a standalone wrapper?

3. BANNED LANGUAGE
   - Search ALL pitch files for: "AI", "artificial intelligence", "automated", "algorithm"
   - Report every instance with file name and line number
   - AlphaSiteGate.tsx is the highest risk file

4. SLOT INVENTORY
   - Is slot data always passed as props from a parent, never fetched inside a gate?
   - Does SlotStatusBar handle all three states: open, almost_full, full?
   - Does SlotFullFallback have all three variants: influencer, headliner, expert_column?

5. TYPESCRIPT
   - Run tsc --noEmit and report all errors

6. MOBILE
   - Does PitchShell right panel collapse on mobile (<768px)?
   - Do gate components have usable layouts at 375px?

7. ANALYTICS
   - Does every Yes/Skip/Add/Defer button call logEvent before state change?
   - Report any buttons that do not fire events

8. DEVPREVIEW
   - Does /pitch-dev render without errors?
   - Does every component appear in DevPreview with mock data?

9. GATE SEQUENCER
   - Does GateSequencer correctly order gates by track + entry platform?
   - Does fast-path correctly reorder gates without skipping required ones?

10. CIVIC GATE
    - Is CivicGate used for org_types: school, nonprofit, government?
    - Does it replace all other gates for those types?

Provide a numbered list of findings. Flag BLOCKING issues (must fix before Agent 4) 
separately from ADVISORY issues (should fix but not blocking).
```

