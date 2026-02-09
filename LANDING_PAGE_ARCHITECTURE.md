# Landing Page Architecture & Component Locations

## 🎯 Master Template for Landing Pages

### Primary Template/Wrapper Component

**Location:** `src/pages/LearningCenter/Campaign/LandingPage.tsx`

**What it does:**
- Master wrapper for ALL campaign landing pages
- Handles routing, data loading, and presentation
- Provides consistent layout structure:
  - Header with back navigation
  - Full-screen presentation area
  - CTA section at bottom
  - AI presenter panel integration
  - Accessibility features

**Key Features:**
- Loads campaign data by slug
- Converts to Presentation format
- Renders FibonaccoPlayer
- Handles CTAs (primary & secondary)
- Tracks conversions
- Manages loading/error states

---

## 🎨 Visual Slide Components

### Location: `src/components/LearningCenter/Presentation/slides/`

**Available Slide Components:**

1. **HeroSlide.tsx** - Hero/Title slide
   - Displays headline and subheadline
   - Used for first slide of presentations

2. **ProblemSlide.tsx** - Problem/Challenge slide
   - Shows problem statement
   - Lists pain points
   - Used in Hook campaigns

3. **SolutionSlide.tsx** - Solution/Benefits slide
   - Presents solution
   - Lists benefits
   - Most versatile component

4. **StatsSlide.tsx** - Statistics/Numbers slide
   - Displays key metrics
   - Shows data points with labels
   - Used for educational content

5. **ComparisonSlide.tsx** - Before/After comparison
   - Side-by-side comparison
   - Shows old vs new approach
   - Used in educational campaigns

6. **ProcessSlide.tsx** - Step-by-step process
   - Shows numbered steps
   - Used in How-To tutorials
   - Guides users through process

7. **TestimonialSlide.tsx** - Customer testimonials
   - Displays customer quotes
   - Builds social proof

8. **PricingSlide.tsx** - Pricing information
   - Shows pricing tiers
   - Used for conversion campaigns

9. **CTASlide.tsx** - Call-to-action slide
   - Final slide with CTAs
   - Primary and secondary buttons
   - Used on all campaigns

**Export File:** `src/components/LearningCenter/Presentation/slides/index.ts`

---

## 📋 Template Types (Defined in JSON)

### Location: `public/campaigns/landing_pages_master.json`

**Template IDs:**
- `educational` - Educational Content (7 slides, 75s)
- `tutorial` - How-To Tutorial (8 slides, 60s)
- `claim-listing` - Claim Your Listing (6 slides, 45s)
- `event-posting` - Event Posting Guide (5 slides, 40s)
- `coupon-creator` - Coupon Creator (5 slides, 35s)
- `feature-application` - Feature Application (6 slides, 50s)
- `classified-posting` - Classified Ad Posting (5 slides, 35s)
- `integration` - Integration Setup (6 slides, 45s)
- `upgrade-offer` - Upgrade Offer (7 slides, 55s)
- `advertising-offer` - Advertising Offer (6 slides, 50s)
- `sponsor-application` - Sponsor Application (7 slides, 60s)
- `expert-application` - Expert Application (6 slides, 50s)
- `influencer-application` - Influencer Application (6 slides, 50s)
- `trial-offer` - Free Trial Offer (5 slides, 40s)
- `seasonal-promotion` - Seasonal Promotion (5 slides, 40s)
- `nomination` - Business Nomination (5 slides, 35s)
- `ai-intro` - AI Employee Introduction (9 slides, 90s)

**Template Logic:** `src/utils/campaign-content-generator.ts`
- Maps template_id to slide generation function
- Creates appropriate slides based on template type

---

## 📝 Data Gathering Components for SMBs

### 1. Contact Sales Modal

**Location:** `src/components/LearningCenter/Campaign/ContactSalesModal.tsx`

**Purpose:** Gather contact information when user clicks "Contact Sales"

**Fields:**
- Name
- Email
- Company
- Phone (optional)
- Message

**Usage:** Triggered by secondary CTA `contact_sales`

---

### 2. Business Profile Form

**Location:** `src/components/BusinessProfileForm.tsx`

**Purpose:** Comprehensive business information collection

**Sections:**
- Company Info
- Leadership
- Financials
- Products
- Market Position
- Growth Opportunities
- Risk Assessment

**Status:** Full form component exists but may need integration with landing pages

---

### 3. Survey Builder Components

**Location:** `src/components/LearningCenter/BusinessProfile/`

**Components:**
- `ProfileSurveyBuilder.tsx` - Main survey builder
- `QuestionEditor.tsx` - Individual question editor
- `SectionEditor.tsx` - Section management

**Purpose:** Build and manage 375-question business profile survey

**Status:** Available but may need integration with campaign landing pages

---

### 4. Sign Up Form

**Location:** `src/pages/SignUpPage.tsx`

**Purpose:** User registration

**Fields:**
- First Name
- Last Name
- Email
- Password
- Company (optional)

**Usage:** Triggered by primary CTA `signup_free` or `start_trial`

---

## 🔄 How Templates Work

### Flow:

1. **Campaign JSON** (`public/campaigns/campaign_EDU-001.json`)
   - Defines `template_id` (e.g., "educational")
   - Specifies slide count, duration, CTAs
   - Lists slide components needed

2. **Template Logic** (`src/utils/campaign-content-generator.ts`)
   - Reads `template_id`
   - Calls appropriate generator function:
     - `generateHookCampaignSlides()` for Hook campaigns
     - `generateEducationalCampaignSlides()` for Educational
     - `generateHowToCampaignSlides()` for Tutorials

3. **Slide Generation**
   - Creates slides with appropriate components
   - Adds content based on campaign metadata
   - Maps to visual slide components

4. **Rendering** (`src/components/LearningCenter/Presentation/FibonaccoPlayer.tsx`)
   - Looks up component by name in `slideComponents` mapping
   - Renders appropriate visual component
   - Passes content as props

---

## 📍 File Structure Summary

```
Learning-Center/
├── src/
│   ├── pages/
│   │   └── LearningCenter/
│   │       └── Campaign/
│   │           ├── LandingPage.tsx          ← MASTER TEMPLATE
│   │           ├── List.tsx
│   │           └── ReviewDashboard.tsx
│   │
│   ├── components/
│   │   └── LearningCenter/
│   │       ├── Presentation/
│   │       │   ├── FibonaccoPlayer.tsx      ← PRESENTATION PLAYER
│   │       │   └── slides/                  ← SLIDE COMPONENTS
│   │       │       ├── HeroSlide.tsx
│   │       │       ├── ProblemSlide.tsx
│   │       │       ├── SolutionSlide.tsx
│   │       │       ├── StatsSlide.tsx
│   │       │       ├── ComparisonSlide.tsx
│   │       │       ├── ProcessSlide.tsx
│   │       │       ├── TestimonialSlide.tsx
│   │       │       ├── PricingSlide.tsx
│   │       │       ├── CTASlide.tsx
│   │       │       └── index.ts
│   │       │
│   │       └── Campaign/
│   │           └── ContactSalesModal.tsx    ← DATA GATHERING
│   │
│   ├── components/
│   │   ├── BusinessProfileForm.tsx          ← DATA GATHERING
│   │   └── LearningCenter/
│   │       └── BusinessProfile/             ← SURVEY BUILDER
│   │           ├── ProfileSurveyBuilder.tsx
│   │           ├── QuestionEditor.tsx
│   │           └── SectionEditor.tsx
│   │
│   └── utils/
│       └── campaign-content-generator.ts   ← TEMPLATE LOGIC
│
└── public/
    └── campaigns/
        ├── landing_pages_master.json        ← TEMPLATE DEFINITIONS
        ├── campaign_EDU-001.json            ← CAMPAIGN DATA
        ├── campaign_HOOK-001.json
        └── ... (60 total campaign files)
```

---

## 🎯 Template-to-Component Mapping

### Educational Template (`educational`)
- Slide 1: HeroSlide
- Slide 2: SolutionSlide (Introduction)
- Slide 3: StatsSlide (Key Insights)
- Slide 4: ComparisonSlide (Before/After)
- Slide 5: ProcessSlide (Action Steps)
- Slide 6: SolutionSlide (Resources)
- Slide 7: CTASlide

### Tutorial Template (`tutorial`)
- Slide 1: HeroSlide
- Slides 2-7: ProcessSlide (Step-by-step)
- Slide 8: CTASlide

### Hook Template (`claim-listing`, `event-posting`, etc.)
- Slide 1: HeroSlide
- Slide 2: ProblemSlide
- Slide 3: SolutionSlide
- Slide 4: StatsSlide
- Slide 5: ProcessSlide
- Slide 6: CTASlide

---

## 🔧 Data Capture Fields

Each campaign defines `data_capture_fields` in JSON:

**Example from EDU-001:**
```json
"data_capture_fields": "name, email, business_name, industry, current_challenges"
```

**Current Implementation:**
- Fields are defined but not automatically rendered
- CTAs trigger navigation to signup/contact forms
- Forms may need to be customized per campaign

**Needed:** Form components that dynamically render based on `data_capture_fields`

---

## ✅ What Exists

1. ✅ Master template wrapper (`LandingPage.tsx`)
2. ✅ All 9 slide visual components
3. ✅ Template definitions in JSON
4. ✅ Template logic for generating slides
5. ✅ Presentation player
6. ✅ Basic data gathering forms (ContactSalesModal, SignUpPage)

## ⚠️ What May Be Missing

1. ⚠️ Template-specific layouts (all use same wrapper)
2. ⚠️ Dynamic form generation based on `data_capture_fields`
3. ⚠️ Inline data capture during presentation
4. ⚠️ Template-specific visual themes
5. ⚠️ Custom layouts per template type

---

## 🎨 Visual Component Props

Each slide component expects:

```typescript
interface SlideProps {
  content: {
    // Component-specific content structure
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}
```

**Content structures vary by component** - see individual component files for details.

---

## 📝 Next Steps

To fully implement template system:

1. **Create Template-Specific Layouts**
   - `EducationalLandingPage.tsx`
   - `TutorialLandingPage.tsx`
   - `HookLandingPage.tsx`
   - Or use conditional rendering in master template

2. **Add Dynamic Form Generation**
   - Component that reads `data_capture_fields`
   - Generates form fields dynamically
   - Integrates with CRM tracking

3. **Template Themes**
   - Visual themes per template type
   - Color schemes, fonts, layouts
   - Defined in template JSON

4. **Inline Data Capture**
   - Forms embedded in slides
   - Progressive data collection
   - Real-time validation

---

**All the pieces exist - they may need better integration and template-specific customization!**






