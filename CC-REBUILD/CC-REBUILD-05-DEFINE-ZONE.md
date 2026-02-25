# CC-REBUILD-05: DEFINE Zone
## Agent E — Phase 2 (Depends on: CC-REBUILD-01 Layout, CC-REBUILD-02 AM-AI, CC-REBUILD-03 Theme)

---

## Mission
Build the DEFINE zone — "Who You Are." Business profile editing, survey integration, FAQ builder, and AI context generation. This is where the intelligence hub starts accumulating data.

## Magic Patterns Reference Files
- `MyBusinessProfilePage.tsx` → Business profile with gradient configuration cards, operations enabled counter, profile strength
- `BusinessSurveyPage.tsx` → 375-question survey (project file)
- `FAQBuilderPage.tsx` → FAQ management (project file)
- `BusinessProfileEdit.tsx` → Profile editing form
- `BasicInformationSection.tsx`, `ContactInformationSection.tsx`, `HoursAvailabilitySection.tsx`, `FeaturesAmenitiesSection.tsx`, `MenuServicesSection.tsx`, `PhotosMediaSection.tsx`, `SocialMediaSection.tsx`, `SEOSettingsSection.tsx` → All profile sections
- `ProfileStrengthIndicator.tsx` → Completion indicator (exists, enhance)
- `MarketingDiagnosticWizard.tsx` → Marketing assessment wizard

## What to Build

### 1. `resources/js/pages/alphasite/crm/define/index.tsx` — DEFINE Hub

Purple-themed zone page with:
- **ZoneHeader**: "Define Your Business" with purple gradient, completion ring
- **3 Action Cards in a row:**
  - "Business Profile" → `/crm/define/profile` — icon: Building2, badge: "60% complete"
  - "Business Survey" → `/crm/define/survey` — icon: ClipboardList, badge: "375 questions"  
  - "FAQ Builder" → `/crm/define/faqs` — icon: HelpCircle, badge: "AI Powered"
- **AI Context Preview Card**: Shows current tone/voice, story angles, approved quotes (from profile.tsx data)
- **Profile Strength Indicator**: Large, prominent, with actionable recommendations
- **"Guide Don't Gate" messaging**: "Complete your profile to make AI features more accurate" — not "Complete profile to unlock features"
- **Inline ExpandableChat** for DEFINE-specific AI help

### 2. `resources/js/pages/alphasite/crm/define/profile.tsx` — Business Profile Editor

**NOT read-only.** This is an editing interface. Follow `MyBusinessProfilePage.tsx` for card layout:

- **Configuration Card** (blue gradient): Business types, operations enabled counter, "Configure your business" CTA
- **Marketing Diagnostic Card** (green gradient): "Run your 5-minute checkup" CTA, links to diagnostic wizard
- **Profile Sections** (inline editable):
  - Basic Information (name, description, category, subcategory)
  - Contact Information (phone, email, website, address)
  - Hours & Availability
  - Features & Amenities
  - Menu / Services
  - Photos & Media
  - Social Media Links
  - SEO Settings
- Each section: collapsible card, edit button to switch to form mode, save/cancel buttons
- **AI Context Section**: Tone & voice tags, story angles, approved quotes — editable
- **Data Sources Display**: Which sources contributed data (Google, website, Facebook, survey)

Uses existing `smbService.getFullProfile()` and adds update methods.

### 3. `resources/js/pages/alphasite/crm/define/survey.tsx` — Inline Survey

Port the survey from `BusinessSurveyPage.tsx` but embedded within the DEFINE zone:
- Section-by-section progressive flow
- Progress bar showing sections completed
- Save progress between sections
- AI suggestions for answers based on known data
- Completion updates the profile strength indicator

### 4. `resources/js/pages/alphasite/crm/define/faqs.tsx` — FAQ Builder

Enhanced FAQ management:
- Category-based organization (56 industry subcategories)
- AI-generated FAQ suggestions based on business type
- Inline editing of Q&A pairs
- Bulk import capability
- Preview of how FAQs appear on Alphasite
- Search within FAQs
- "AI Powered" badge — one-click generate FAQs from profile data

## Data from Backend
```typescript
interface DefineProps {
  business: Business;
  subscription: Subscription | null;
  fullProfile: SmbFullProfile | null;
  profileCompletion: number;
  surveyCompletion: number;
  faqCount: number;
  recommendations: string[];
}
```

## Acceptance Criteria
- [ ] DEFINE hub shows 3 action cards with completion badges
- [ ] Profile page allows INLINE EDITING of all sections
- [ ] Survey is embedded (not a separate disconnected page)
- [ ] FAQ builder supports AI-generated suggestions
- [ ] Profile strength indicator updates in real-time
- [ ] Purple zone theming throughout
- [ ] Account Manager AI is accessible from every DEFINE page
- [ ] "Guide Don't Gate" — no locked features, only encouragement

## Files to Create
1. `resources/js/pages/alphasite/crm/define/index.tsx`
2. `resources/js/pages/alphasite/crm/define/profile.tsx`
3. `resources/js/pages/alphasite/crm/define/survey.tsx`
4. `resources/js/pages/alphasite/crm/define/faqs.tsx`
