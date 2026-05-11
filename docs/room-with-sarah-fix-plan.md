# Room with Sarah — Fix Plan & Handoff

## What This Is

A complete handoff document for the "Room with Sarah" experience across 60 campaign landing pages.

**STATUS**: All crash-risk slide components have been fixed (defensive guards added). Build compiles clean. Still needs visual verification on production after deploy.

## Current State (What's Deployed)

The Room with Sarah experience is accessed at:
- Public: `/learn/:slug` (no auth, no layout wrapper)
- Command Center: `/command-center/learn/:slug` (inside CommandCenterLayout)

Both routes render `CampaignLandingPage.tsx` which shows a course-style landing page, then on "Start Lesson" toggles to a `RoomWithSarah` component embedded in a full-viewport flex container.

### Architecture (Component Tree)

```
CampaignLandingPage.tsx (presentation mode)
  └─ <div className="h-screen flex flex-col bg-[#0d1229]">
       ├─ <header> — Back button, title, All Lessons, Command Center links
       └─ <div className="flex-1 min-h-0 flex flex-col">
            └─ RoomWithSarah.tsx
                 └─ <div className="pitch-root flex flex-1 min-h-0">
                      ├─ Left: <div className="flex-1 flex flex-col min-w-0 bg-gray-900">
                      │    ├─ Share/Invite toolbar (shrink-0)
                      │    └─ FibonaccoPlayer (flex-1 min-h-0 when hideOverlayUI=true)
                      │         ├─ Slide Area (flex-1 relative overflow-hidden)
                      │         └─ Controls bar (shrink-0 bg-gray-800)
                      ├─ Right (desktop): SarahPanel (380px aside)
                      └─ Mobile: Floating button + drawer
```

### Key Files

| File | Purpose | Status |
|------|---------|--------|
| `src/components/learning/CampaignLandingPage.tsx` | Landing page + presentation mode toggle | Written, deployed |
| `src/components/learning/RoomWithSarah.tsx` | Two-column room container | Written, deployed |
| `src/components/learning/useSarahNarration.ts` | Sarah message state management | Working |
| `src/pitch/shell/SarahPanel.tsx` | Chat panel with mic/speaker/add/end controls | Written, deployed |
| `src/components/LearningCenter/Presentation/FibonaccoPlayer.tsx` | Slide engine with 34 component types | Modified with `hideOverlayUI` |
| `src/components/LearningCenter/Presentation/slides/` | 34 slide component files | MOST HAVE CRASH RISKS |
| `content/campaign_*_complete.json` | 60 campaign data files | Template vars cleaned |
| `src/data/campaigns/index.ts` | Eager-imports content/*.json, exports `getCampaignBySlug` | Working |
| `src/pitch/tokens.css` | CSS custom properties for Sarah UI theming | Working |

---

## THE PROBLEMS TO FIX

### Problem 1: Slide Components Crash on Missing Data

**Root cause**: Components define TypeScript interfaces with required fields, then `.map()` over arrays that might be undefined/null in the actual JSON data. TypeScript doesn't protect at runtime.

**CRITICAL CRASH RISKS** (these will throw `Cannot read properties of undefined`):

#### `ComparisonSlide.tsx` — HIGHEST RISK
- Line 54: `content.comparison.left.title` — no optional chaining
- Line 57: `content.comparison.left.features.map(...)` — crashes if features undefined
- Line 75: `content.comparison.right.title` — same
- Line 79: `content.comparison.right.features.map(...)` — same
- **Fix**: Add guards: `if (!content.comparison?.left?.features || !content.comparison?.right?.features) return fallback`

#### `StatsSlide.tsx` / `DataSlide.tsx`
- Line 56: `content.stats.map(...)` — crashes if stats is undefined
- **Fix**: `{(content.stats ?? []).map(...)}`

#### `ProcessSlide.tsx`
- Line 51: `content.steps.map(...)` — crashes if steps is undefined
- **Fix**: `{(content.steps ?? []).map(...)}`

#### `PricingSlide.tsx`
- Line 53: `content.plans.map(...)` — crashes if plans undefined
- Line 78: `plan.features.map(...)` — crashes if features undefined
- Line 93: `plan.cta.url` and `plan.cta.text` — crashes if cta undefined
- **Fix**: Guard all three levels

#### `ResultsSlide.tsx`
- Line 47: `content.results.map(...)` — crashes if results undefined
- **Fix**: `{(content.results ?? []).map(...)}`

#### `TipsSlide.tsx`
- Line 50: `content.tips.map(...)` — crashes if tips undefined
- **Fix**: `{(content.tips ?? []).map(...)}`

#### `BenefitsSlide.tsx`
- Line 67: `content.benefits.map(...)` — crashes if benefits undefined
- **Fix**: `{(content.benefits ?? []).map(...)}`

**SAFE Components** (already use optional chaining or conditional rendering):
- `StepSlide` — all fields optional, uses `{content.X && (...)}`
- `ConceptSlide` — all fields optional, uses `{content.X && (...)}`
- `OverviewSlide` — all fields optional
- `HeroSlide` — all fields optional
- `SolutionSlide` — uses `content.benefits && content.benefits.length > 0`
- `ComparisonHeroSlide` — uses `content.comparison && (...)`
- `ActionSlide` — uses `content.steps && (...)`
- `FlowSlide` — uses `content.steps && (...)`
- `DistributionSlide` — uses `content.channels && (...)`
- `CTASlide` — minimal required fields

#### `PreviewSlide.tsx` — OVERFLOW RISK (not crash)
- Line 42: `<pre>{JSON.stringify(content.preview, null, 2)}</pre>` — can overflow its container if the preview object is large
- **Fix**: Add `overflow-auto max-h-64 text-sm` to the pre element

### Problem 2: FibonaccoPlayer Controls Visibility

The player has two modes:
1. **Standalone** (`hideOverlayUI=false`): absolute-positioned bottom bar with play/pause, volume, fullscreen
2. **Embedded** (`hideOverlayUI=true`): normal-flow bottom bar with Prev/Next buttons, dots, slide counter

The embedded mode was rewritten to use:
```tsx
<div className="shrink-0 bg-gray-800 border-t border-white/10 px-4 py-3">
```

**Verify**: The controls should be visible as a gray bar at the bottom of the slide area with:
- Left: "Prev" button (white on white/10 bg)
- Center: Dot indicators + "1/9" counter
- Right: "Next" button (white on indigo-600 bg)

If controls are still not visible, the issue is the flex chain. Every ancestor must participate in flex sizing:
- `h-screen` → `flex-1 min-h-0` → `flex-1 min-h-0` → `flex-1 flex flex-col min-w-0` → FibonaccoPlayer root div

**The FibonaccoPlayer root div** when `hideOverlayUI=true` should be:
```tsx
className={`w-full bg-gray-900 flex flex-col relative flex-1 min-h-0`}
```

### Problem 3: SarahPanel Action Toolbar

The panel header has:
1. Identity row: avatar circle "S" + "Sarah" + "Account Manager"
2. Action toolbar: Mic toggle | Speaker toggle | Add Person | End button

**Status**: Code is written and deployed. Verify it renders on desktop (380px right sidebar) and mobile (drawer).

### Problem 4: Share/Invite Overlay

A ShareOverlay modal is included in RoomWithSarah, triggered by buttons in the toolbar above the slides.

**Status**: Code is written. The overlay uses `fixed inset-0 z-[70]` with copy-to-clipboard and email share.

---

## THE FIX STRATEGY

### Step 1: Fix All Crash-Risk Slide Components

Apply defensive guards to every component that maps over potentially-undefined arrays. The pattern:

```tsx
// BEFORE (crashes)
{content.stats.map((stat, index) => (...))}

// AFTER (safe)
{(content.stats ?? []).map((stat, index) => (...))}
```

For deeply nested access:
```tsx
// BEFORE (crashes)
{content.comparison.left.features.map(...)}

// AFTER (safe)
const left = content.comparison?.left;
const right = content.comparison?.right;
if (!left?.features || !right?.features) {
  return <FallbackSlide headline={content.title ?? "Comparison"} />;
}
```

Files to fix (with specific line numbers):
1. `slides/ComparisonSlide.tsx` — lines 54, 57, 75, 79
2. `slides/StatsSlide.tsx` — line 56
3. `slides/ProcessSlide.tsx` — line 51
4. `slides/PricingSlide.tsx` — lines 53, 78, 93
5. `slides/ResultsSlide.tsx` — line 47
6. `slides/TipsSlide.tsx` — line 50
7. `slides/BenefitsSlide.tsx` — line 67
8. `slides/PreviewSlide.tsx` — line 42 (overflow fix)

### Step 2: Verify the Flex Chain

Run the app locally and verify that:
1. The slide fills the available space (not tiny, not overflowing)
2. The controls bar is visible at the bottom with Prev/Next/dots
3. The Sarah panel is visible on desktop at 380px width
4. The mobile drawer opens/closes

If the slide area is tiny or controls are invisible, trace the flex chain from `h-screen` down. Every `div` in the chain must use `flex-1 min-h-0` or `flex flex-col` — never `h-full` (CSS percentage heights don't resolve from flex-computed parents).

### Step 3: Test All 60 Pages

Every page should:
1. Load without JS errors in console
2. Show slides that fill the content area
3. Have working Prev/Next navigation
4. Show Sarah's greeting message in the sidebar
5. Not display `{{template_variables}}`

---

## ALL 60 CAMPAIGN URLS

Test these at `https://commandcenter.day.news/learn/SLUG`:

### HOOK (15)
```
claim-your-listing
neighborhood-newsletter-signup
free-business-health-check
community-event-spotlight
post-a-local-coupon
ai-employees-explained
24-7-online-presence
social-media-auto-pilot
voice-search-ready
refer-and-earn
seasonal-promo-boost
reputation-shield
loyalty-program-starter
local-seo-quick-win
business-networking-night
```

### EDU (15)
```
why-local-digital-presence
community-marketing-101
review-management-mastery
content-marketing-for-smb
customer-journey-mapping
email-marketing-fundamentals
social-media-strategy
local-advertising-decoded
video-marketing-essentials
data-driven-decisions
google-business-mastery
loyalty-retention-science
competitive-analysis-workshop
brand-building-fundamentals
digital-transformation-guide
```

### HOWTO (30)
```
setup-automated-review-requests
create-social-media-calendar
build-email-nurture-sequence
configure-appointment-booking
design-loyalty-program
setup-referral-tracking
create-google-business-profile
build-landing-pages
configure-sms-marketing
setup-analytics-dashboard
create-event-promotion
build-customer-survey
configure-chatbot-assistant
design-promotional-campaign
setup-inventory-alerts
create-seasonal-campaign
build-community-page
configure-payment-processing
design-service-packages
setup-automated-followup
create-content-calendar
build-review-showcase
configure-lead-scoring
design-welcome-sequence
setup-competitive-monitoring
create-partnership-program
build-training-library
configure-multi-location
design-customer-portal
setup-crisis-communication
```

---

## DATA FLOW

```
content/campaign_HOOK-001_complete.json
  ↓ (import.meta.glob at build time)
src/data/campaigns/index.ts → toCampaign() flattens nested JSON
  ↓ (getCampaignBySlug(slug))
CampaignLandingPage.tsx → campaign object
  ↓ (passes to RoomWithSarah)
RoomWithSarah.tsx → campaignToPresentation() → Presentation object
  ↓ (passes to FibonaccoPlayer)
FibonaccoPlayer.tsx → slides[currentSlide].component → SlideComponent
  ↓ (renders)
slides/[Component].tsx ← receives content={slide.content} isActive={true} theme="blue"
```

**The content prop** passed to each slide component is whatever is in `slides[n].content` in the JSON — an arbitrary object whose shape varies per component type. The TypeScript interface on each component defines what it EXPECTS, but the data may not match.

---

## JSON DATA SHAPE

Each campaign JSON file structure:
```json
{
  "campaign": { "id", "title", "description", "type", "landing_page" },
  "landing_page": { "ai_persona", "ai_tone", "ai_goal", "duration_seconds", "audio_base_url", ... },
  "template": { ... },
  "slides": [
    {
      "slide_num": 1,
      "component": "PersonalizedHeroSlide",
      "title": "...",
      "content": { /* varies per component type */ },
      "narration": "...",
      "duration_seconds": 15,
      "audio_file": "slide-01-hero.mp3"
    }
  ],
  "connections": { "leads_to": [...], "related": [...] }
}
```

After `toCampaign()`, the flat Campaign object has `slides`, `landing_page`, `connections` etc. as top-level properties (spread from raw).

---

## COMPONENT USAGE (from 60 campaigns, ~433 total slides)

| Component | Usage Count | Risk Level |
|-----------|-------------|------------|
| StepSlide | ~128 | SAFE (all optional) |
| ConceptSlide | ~86 | SAFE (all optional) |
| CTASlide | ~60 | SAFE (minimal) |
| HeroSlide | ~30 | SAFE |
| PersonalizedHeroSlide | ~18 | SAFE |
| BenefitsSlide | ~25 | HIGH (needs fix) |
| OverviewSlide | ~23 | SAFE |
| ComparisonSlide | ~8 | CRITICAL (will crash) |
| StatsSlide/DataSlide | ~15 | HIGH (needs fix) |
| ProcessSlide | ~12 | HIGH (needs fix) |
| PricingSlide | ~5 | HIGH (needs fix) |
| ResultsSlide | ~8 | HIGH (needs fix) |
| TipsSlide | ~10 | HIGH (needs fix) |
| FlowSlide | ~6 | SAFE (optional) |
| SolutionSlide | ~8 | SAFE |
| ProofSlide | ~5 | Check |
| PreviewSlide | ~3 | OVERFLOW risk |
| TutorialIntroSlide | ~5 | SAFE |
| ListingPreviewSlide | ~2 | Check |
| SocialProofSlide | ~3 | Check |
| CouponPreviewSlide | ~2 | Check |
| EventPreviewSlide | ~2 | Check |
| Others | ~10 | Check |

---

## EXACT FIXES NEEDED

### Fix 1: ComparisonSlide.tsx (CRITICAL)

Replace entire render body with:
```tsx
export const ComparisonSlide: React.FC<ComparisonSlideProps> = ({ content, isActive, theme = 'blue' }) => {
  const left = content?.comparison?.left;
  const right = content?.comparison?.right;

  // Guard against missing data
  if (!left?.features || !right?.features) {
    return (
      <div className={`w-full h-full flex items-center justify-center p-12 ${themeColors[theme]} ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900">{content?.title ?? 'Comparison'}</h2>
        </div>
      </div>
    );
  }

  // ... rest of render with left/right guaranteed
};
```

### Fix 2: All Array-Mapping Components

Pattern for StatsSlide, ProcessSlide, ResultsSlide, TipsSlide, BenefitsSlide:
```tsx
// Replace direct .map() with guarded version
{(content.stats ?? []).map((stat, index) => (...))}
{(content.steps ?? []).map((step, index) => (...))}
{(content.results ?? []).map((result, index) => (...))}
{(content.tips ?? []).map((tip, index) => (...))}
{(content.benefits ?? []).map((benefit, index) => (...))}
```

### Fix 3: PricingSlide.tsx (Multiple levels)
```tsx
{(content.plans ?? []).map((plan, index) => (
  // ...
  <ul className="space-y-3 mb-8">
    {(plan.features ?? []).map((feature, featureIndex) => (...))}
  </ul>
  <a href={plan.cta?.url ?? '#'}>
    {plan.cta?.text ?? 'Learn More'}
  </a>
))}
```

### Fix 4: PreviewSlide.tsx (Overflow)
```tsx
<pre className="text-gray-800 whitespace-pre-wrap overflow-auto max-h-64 text-sm">
  {JSON.stringify(content.preview, null, 2)}
</pre>
```

---

## CSS FLEX CHAIN (DO NOT BREAK)

The slide must fill available vertical space. This requires an unbroken flex chain:

```
<div class="h-screen flex flex-col">           ← CampaignLandingPage wrapper
  <header class="shrink-0">                    ← nav header (fixed height)
  <div class="flex-1 min-h-0 flex flex-col">   ← remaining space
    <div class="pitch-root flex flex-1 min-h-0"> ← RoomWithSarah root
      <div class="flex-1 flex flex-col min-w-0 bg-gray-900"> ← left panel
        <div class="shrink-0">                 ← share/invite toolbar
        <div class="w-full bg-gray-900 flex flex-col relative flex-1 min-h-0"> ← FibonaccoPlayer
          <div class="flex-1 relative overflow-hidden"> ← slide content
          <div class="shrink-0 bg-gray-800 ...">        ← controls bar
```

**Rules**:
- NEVER use `h-full` or `height: 100%` in this chain — it doesn't resolve from flex-computed parents
- Every flex container in the chain needs `min-h-0` to allow shrinking
- The slide area uses `flex-1` to fill remaining space
- Controls use `shrink-0` to stay at natural height

---

## WHAT WAS ALREADY DONE

1. Template variables: All 370 `{{variable}}` instances replaced in 60 JSON files
2. RoomWithSarah: Complete rewrite, no longer uses PitchShell
3. SarahPanel: Complete rewrite with mic/speaker/add/end toolbar
4. FibonaccoPlayer: `hideOverlayUI` prop added, dual control modes
5. CampaignLandingPage: Navigation header added in presentation mode
6. useSarahNarration: Hook written with greet/complete/slideChange/userMessage

## WHAT STILL NEEDS TO BE DONE

1. ~~Fix crash-risk slide components~~ DONE — all 12 components with missing-data guards
2. ~~Fix data shape mismatches~~ DONE — 5 components rewritten with normalizers:
   - ComparisonSlide: handles `left/right` AND `disconnected/connected` key shapes
   - BenefitsSlide: handles `{title,desc}`, `{benefit,detail}`, `{stat,label}`, `{pain,solution}`
   - ProcessSlide: handles `{number,title,description}`, `{num,action,time}`, `{num,step,time}`
   - DataSlide: handles stats as array OR object (converts object keys to labels)
   - PricingSlide: handles `plans[]` OR `options[]`, missing `features[]`/`cta`
3. ~~Fix PreviewSlide overflow~~ DONE
4. **Verify controls are visible** after deploy — check Prev/Next buttons, dots, slide counter
5. **Test all 60 URLs** for JS errors in browser console
6. **Visual QA pass** — verify slides fill content area, no blank slides, controls usable
7. **Phase 3 (later)**: Wire Sarah chat to backend AI

---

## QUICK VERIFY COMMAND

After fixing, run locally:
```bash
npm run dev
# Visit http://localhost:5173/learn/claim-your-listing
# Click "Start Lesson"
# Verify: slides fill area, controls visible, Sarah panel on right, no console errors
# Click Next a few times — verify slide components don't crash
```

Test a few from each category:
- HOOK: `claim-your-listing`, `ai-employees-explained`
- EDU: `why-local-digital-presence`, `community-marketing-101`
- HOWTO: `setup-automated-review-requests`, `create-social-media-calendar`
