# CC 2.0 — Complete UX Flow Audit & Issue Map

**Date:** February 28, 2026  
**Method:** Page-by-page code trace of every onClick, onNavigate, modal trigger, back button, and cross-page link  
**Scope:** All 149 TSX components on disk + 26 phantom files referenced but missing

---

## THE BIG PICTURE: What a User Actually Experiences

The entire application loads as a single URL (`/`). The user sees a Dashboard with a left NavigationRail offering 10 items. Clicking any nav item swaps the center content via a `useState` switch/case — there are no URLs, no browser back button support, no deep links. Of the 149 components that exist, only **67 are reachable** through any import chain. The other **82 are orphaned** — fully built pages that no user can ever reach.

Within the 10 reachable pages, buttons exist that try to navigate to 32 different destinations. The Dashboard only handles 10 of them. That means **22 navigation targets go nowhere** — a user clicks a button and nothing happens. Meanwhile, every "Save" button on every form writes to `console.log` and stops. Every "Create" action simulates with `setTimeout`. Nothing persists.

The visual experience is split between two incompatible design systems: 52 files use a cyberpunk/glass aesthetic (neon gradients, `glass-card`, Orbitron font), while 106 files use a clean professional look (white backgrounds, slate colors, system fonts). Seven files mix both. There are 92 unique button style patterns, 45 unique raw hex colors, and 4 different header components (only 1 is used).

---

## SECTION 1: NAVIGATION ARCHITECTURE ISSUES

### Issue NAV-001: Single-URL Application (Critical)

**Current state:** The entire app runs on one URL: `/`. All "navigation" is `useState('dashboard')` → `switch(activeView)` inside Dashboard.tsx.

**What breaks:**
- Browser back/forward buttons don't work — pressing Back leaves the app entirely
- Users can't bookmark or share a specific page
- Browser history is empty (every view is the same URL)
- Cmd+K CommandPalette finds items but can't navigate to them (buttons have no onClick)
- Page refresh always returns to the default Dashboard view
- Analytics tools can't track which pages users visit

**Affected components:** All 149  
**Fix:** React Router v6 with 35+ named routes (per Agent Briefs spec)

---

### Issue NAV-002: 82 Orphaned Components — 55% of Codebase Unreachable (Critical)

**Evidence:** Of 149 TSX files on disk, only 67 are imported by at least one other component. The remaining 82 have zero import references — no user can ever see them.

**Key orphaned pages that represent major features:**

| Orphaned Page | What It Is | Lines of Code |
|--------------|------------|---------------|
| CentralCommandDashboard | The flagship CC dashboard | 739 |
| B2BDashboard | Full CRM overview with pipeline | ~400 |
| CustomersListPage | Customer directory with search/filter | ~180 |
| CustomerDetailPage | Full customer profile with deals/activities | 526 |
| ContactsListPage | Contact directory | ~130 |
| ContactDetailPage | Contact profile with communication history | ~200 |
| InvoicesListPage | Invoice management with board/list views | ~380 |
| CollectionsDashboard | Accounts receivable tracking | ~200 |
| PipelinePage | Deal pipeline with kanban board | ~240 |
| NotificationsPage | Notification center | orphaned |
| LoginPage | Authentication screen | orphaned |
| LearningCenterHub | Enhanced learning with 10 navigation targets | orphaned |
| ContentScheduling | Content calendar with scheduling | 446 |
| ContentManagerDashboard | Full content management suite | orphaned |
| PerformanceDashboard | AI employee performance metrics | orphaned |
| OverviewDashboard | Business overview with 7 navigation targets | orphaned |
| MyBusinessProfilePage | Detailed profile with 14 navigation targets | orphaned |
| CalendarView | Calendar interface | orphaned |
| MarketingCampaignWizard | Campaign builder wizard | orphaned |
| MarketingDiagnosticWizard | Diagnostic flow with results | orphaned |
| BillingDashboard | Billing overview | orphaned |
| ProcessBuilderPage | Process automation builder | orphaned |
| JobBoardPage | AI employee job board | orphaned |
| AutomationRuleBuilder | Automation workflow builder | orphaned |

**Impact:** Thousands of lines of functional UI code that users cannot reach. Many of these are the "real" CC 2.0 pages — CentralCommandDashboard (739 lines) is literally the centerpiece component and it's unreachable.

---

### Issue NAV-003: 22 Dead-End Navigation Targets (Critical)

**Evidence:** Pages call `onNavigate('target-string')` to navigate. The Dashboard `switch(activeView)` only handles 10 views. 22 unique target strings go to views the Dashboard doesn't render.

**Dashboard handles (10 views):**
```
dashboard, platforms, content, articles, events,
business-profile, business-survey, faq-builder,
market-consultant, ai-hub
```

**Pages try to navigate to (32 targets, 22 unhandled):**

| Target String | Called By | Clicks That Go Nowhere |
|--------------|-----------|----------------------|
| `customer-detail` | CustomersListPage | Every customer row click |
| `customer-add` | CustomersListPage | "Add Customer" button |
| `customer-bulk-import` | CustomersListPage | "Import" button |
| `contact-detail` | ContactsListPage | Every contact row click |
| `contact-add` | ContactsListPage | "Add Contact" button |
| `deal-detail` | PipelinePage | Every deal card click |
| `invoice-detail` | InvoicesListPage (×4) | Every invoice row/card click |
| `invoice-new` | InvoicesListPage | "Create Invoice" button |
| `pipeline` | B2BDashboard (×2) | "View Pipeline" button + stage clicks |
| `health-score-detail` | OverviewDashboard | Health score card click |
| `revenue-detail` | OverviewDashboard (×2) | Revenue metric clicks |
| `activity-full` | OverviewDashboard | Activity feed click |
| `recommendations-full` | OverviewDashboard | AI recommendations click |
| `business-configurator` | MyBusinessProfilePage (×2) | Configuration cards |
| `business-info-edit` | MyBusinessProfilePage (×2) | "Edit Info" buttons |
| `marketing-diagnostic` | MyBusinessProfilePage | Diagnostic card click |
| `process-builder` | MyBusinessProfilePage (×2) | "Build Process" buttons |
| `faq-management` | MyBusinessProfilePage | FAQ section button |
| `survey-management` | MyBusinessProfilePage (×2) | Survey section buttons |
| `alphasite-components` | MyBusinessProfilePage | AlphaSite card click |
| `business` | CentralCommandDashboard | Quick access card |
| `settings` | CentralCommandDashboard | Quick access card |
| `learning` | MyBusinessProfilePage | Learning button |
| `content-create` | ContentManagerDashboard (×2) | "Create Content" buttons |
| `content-type-selection` | ContentLibrary | Content type selector |
| `session-detail` | AIConsultingPage | Session card click |
| `proposal-detail` | AIConsultingPage | Proposal link |
| `implementation-detail` | AIConsultingPage | Implementation link |
| `course-detail` | LearningCenterHub | Course card click |
| `root` | AIConsultingPage | Back/home navigation |
| `quote-new` | CustomerDetailPage | "Create Quote" action |
| `job-detail` | JobBoardPage | Job card click |

**User experience:** User clicks a button → nothing visually happens → user clicks again → still nothing → user thinks the app is broken. This affects every list→detail flow in the entire CRM, billing, and learning systems.

---

### Issue NAV-004: NavigationRail Missing the Command Center Pages (High)

**Current nav items (10):**
Dashboard, Platforms, Learn, Articles, AI Consultant, Events, Business Profile, Survey, FAQ, Event Planner

**Missing from nav (pages that exist but have no nav entry):**
- CRM section (Customers, Contacts, Deals, Pipeline, Activities)
- Billing section (Invoices, Collections, Orders, Billing Dashboard)
- Analytics section (Performance, Reports, Marketing Reports)
- Content section (Content Manager, Content Library, Content Scheduling)
- AI Employees section (Job Board, Configuration, Performance)
- Learning Center (Hub, Lessons, Courses)
- Services section (My Services, Service Configuration)
- Settings section (Integrations, Team Users, Notifications, Profile)
- Business section (Configurator, Health Score, Mode Settings)

**Impact:** The nav shows only the Publishing Platform pages. The entire Command Center 2.0 feature set has no navigation entry.

---

### Issue NAV-005: Command Palette Is Decorative (Medium)

**Evidence:** CommandPalette.tsx renders a search input and 4 "quick action" buttons. The buttons have no `onClick` handlers — they're styled `<button>` elements that do nothing. The search input filters visually but selecting a result does nothing.

**Quick actions displayed but not wired:**
- Create Article → no onClick
- Post Event → no onClick
- AI Bot → no onClick  
- Analytics → no onClick

---

## SECTION 2: PAGE-BY-PAGE FLOW ANALYSIS

### Flow 2A: Dashboard (Default View)

**Components rendered:** AISuggestionBar, UnifiedContentCard, LiveActivityFeed, RevenueStreams, AIInsightsWidget, AIAssistantOrb, QuickActionDock

**Issues found:**

| ID | Component | Issue | Severity |
|----|-----------|-------|----------|
| DASH-001 | QuickActionDock | 4 buttons ("Create Article", "Post Event", "Launch Campaign", "Analytics") — none have onClick handlers. Buttons render but clicking does nothing. | High |
| DASH-002 | AIInsightsWidget | 3 insight cards with action buttons ("Create Campaign", "Analyze", "Schedule") — none wired. Buttons show arrow icons but do nothing on click. | High |
| DASH-003 | AISuggestionBar | Renders a suggestion banner. No dismiss button handler. No "act on suggestion" handler. Static display only. | Medium |
| DASH-004 | LiveActivityFeed | Renders activity items but none are clickable. No "View All" link. No link to the full ActivitiesPage (which is orphaned anyway). | Medium |
| DASH-005 | RevenueStreams | Revenue cards display but have no onClick to drill into RevenueDetailReport (orphaned). | Medium |
| DASH-006 | UnifiedContentCard | Tab switching works (Articles/Events/Social). Content within each tab is static — no link to actual ArticlesPage or EventsPage from individual items. | Low |

**User journey dead ends:** User lands on Dashboard → sees "Create Article" dock button → clicks → nothing → sees "Your lunch special could increase traffic by 34% — Create Campaign" → clicks → nothing → sees revenue numbers → wants to drill in → can't click.

---

### Flow 2B: Articles Page

**Access:** NavigationRail → "Articles"  
**Internal views:** list → ArticleCreator (via "New Article" button) → ArticlePreview (via article click)

**Issues found:**

| ID | Issue | Severity |
|----|-------|----------|
| ART-001 | ArticleCreator "Save" button calls `console.log('Saving article as:', action, formData)` then stops. Article is lost on next view change. | Critical |
| ART-002 | ArticlePreview "Share to Social" buttons have comment: `// Handle social media posting` — empty handler. | High |
| ART-003 | ArticlePreview "Add to Newsletter" button has comment: `// Handle newsletter inclusion` — empty handler. | High |
| ART-004 | Article list data is hardcoded in component state. Filtering works against the mock data but no real articles load. | High |
| ART-005 | Back navigation from ArticleCreator/ArticlePreview works correctly (internal `setView('list')` state). | ✅ OK |

---

### Flow 2C: Events Page

**Access:** NavigationRail → "Events"  
**Internal views:** list with tabs (upcoming/live/past) → EventCreator (via "Create Event" button)

**Issues found:**

| ID | Issue | Severity |
|----|-------|----------|
| EVT-001 | EventCreator "Create Event" button calls `console.log('Creating event:', formData)` then stops. Event is lost. | Critical |
| EVT-002 | Event cards have no detail view — clicking an event card does nothing. No EventDetailPage exists. | High |
| EVT-003 | EventFilters.tsx exists but is orphaned — never imported by EventsPage. Filter UI is missing. | Medium |
| EVT-004 | Tab switching between upcoming/live/past works correctly. | ✅ OK |

---

### Flow 2D: Business Profile Edit

**Access:** NavigationRail → "Business Profile"  
**Internal views:** Tabbed form (Basic Info, Contact, Hours, Features, Menu/Services, Photos, Social, SEO)

**Issues found:**

| ID | Issue | Severity |
|----|-------|----------|
| BPE-001 | "Save Profile" button: `console.log('Saving profile:', formData)` — no API call. Data lost on navigation. | Critical |
| BPE-002 | "Cancel" button: `// Handle cancel logic` — completely empty function. No navigation, no reset. | High |
| BPE-003 | Tab navigation between 8 sections works correctly. | ✅ OK |
| BPE-004 | Each section component (BasicInformationSection, ContactInformationSection, etc.) properly manages its own form state and passes data up. | ✅ OK |
| BPE-005 | No validation on any field — user can "save" empty profile. No required field indicators. | Medium |

---

### Flow 2E: Business Survey Page

**Access:** NavigationRail → "Survey"  

**Issues found:**

| ID | Issue | Severity |
|----|-------|----------|
| SRV-001 | "Save Survey" button: `console.log('Saving survey data:', surveyData)` — no persistence. | Critical |
| SRV-002 | Multi-step survey progress works (forward/back within survey). | ✅ OK |

---

### Flow 2F: FAQ Builder Page

**Access:** NavigationRail → "FAQ"  
**Internal views:** Three input modes (Chat, URL Analysis, Text), FAQ list, AI-generated questions

**Issues found:**

| ID | Issue | Severity |
|----|-------|----------|
| FAQ-001 | Chat input "simulates AI processing" with local state — `setTimeout` creates a fake FAQ. No API call. | High |
| FAQ-002 | URL Analysis: `setTimeout` with hardcoded results. Doesn't actually fetch or analyze any URL. | High |
| FAQ-003 | Text Analysis: same `setTimeout` pattern with fake results. | High |
| FAQ-004 | AI Question Generation: hardcoded questions ("What payment methods do you accept?") with no AI call. | High |
| FAQ-005 | Answer Question: uses browser `prompt()` dialog — native browser popup, not styled. Jarring UX. | Medium |
| FAQ-006 | Delete FAQ works (local state removal). But nothing persists across sessions. | Medium |
| FAQ-007 | Tab switching between input modes works correctly. | ✅ OK |

---

### Flow 2G: Platforms Hub

**Access:** NavigationRail → "Platforms"  
**Displays:** Grid of Fibonacco platforms (Day.News, Downtown Guide, Go Event City, Alphasite, Local Voices)

**Issues found:**

| ID | Issue | Severity |
|----|-------|----------|
| PLT-001 | Platform cards display but have no onClick handlers. Clicking any platform card does nothing. | High |
| PLT-002 | No links to platform-specific management pages (ContentManagerDashboard exists but is orphaned). | High |
| PLT-003 | Expected "Manage" or "Configure" buttons are missing from each platform card. | Medium |

---

### Flow 2H: Learning Topics → Learn Page

**Access:** NavigationRail → "Learn"  
**Flow:** LearningTopicsPage (topic grid) → `onTopicSelect(topicId)` → Dashboard sets `selectedTopic` → LearnPage renders

**Issues found:**

| ID | Issue | Severity |
|----|-------|----------|
| LRN-001 | Topics load from hardcoded data in LearningTopicsPage. No connection to the 60 campaign JSON files. | Critical |
| LRN-002 | LearnPage renders a video-call-style AI session interface. Audio/video/chat toggles work (local state) but no actual media stream or AI interaction. | High |
| LRN-003 | LearningCenterHub (enhanced version with card layouts and 10 navigation targets) exists but is orphaned. LearningTopicsPage (simpler grid) is used instead. | High |
| LRN-004 | 60 campaign JSON files (EDU-001 through EDU-015, HOOK-001 through HOOK-015, HOWTO-001 through HOWTO-030) contain complete curricula with slides, AI personas, and UTM tracking. None are imported by any component. | Critical |
| LRN-005 | No CampaignRenderer exists to display campaign slide content. | Critical |
| LRN-006 | Back navigation from LearnPage is broken — there's no "back to topics" button. User must click "Learn" in nav again. `selectedTopic` state persists so they'd see LearnPage again, not topics. | High |
| LRN-007 | CourseDetailPage, LearningLessonPage, LessonPlayerPage all exist but are orphaned. Full lesson player infrastructure is built but disconnected. | High |

---

### Flow 2I: Market Consultant Page

**Access:** NavigationRail → "AI Consultant"  
**Internal views:** Tabs switch between CompetitorReport and MarketAnalysisForm

**Issues found:**

| ID | Issue | Severity |
|----|-------|----------|
| MKT-001 | MarketAnalysisForm collects data but submit handler only manipulates local state. No API call. | High |
| MKT-002 | CompetitorReport displays hardcoded competitor data. Not connected to any analysis engine. | High |
| MKT-003 | Tab switching works correctly. | ✅ OK |

---

### Flow 2J: Event Planner Page (AI Hub)

**Access:** NavigationRail → "Event Planner"  

**Issues found:**

| ID | Issue | Severity |
|----|-------|----------|
| EVP-001 | Renders full event planning interface but all interactions are local state only. No persistence. | High |

---

### Flow 2K: User Profile → Edit Profile

**Access:** Header avatar click → UserProfile drawer → "Edit Profile" button → UserProfileEdit

**Issues found:**

| ID | Issue | Severity |
|----|-------|----------|
| USR-001 | UserProfile is a right-side drawer. Opens/closes correctly via Dashboard state. | ✅ OK |
| USR-002 | "Edit Profile" button correctly triggers `onEdit` → Dashboard swaps to UserProfileEdit full-screen. | ✅ OK |
| USR-003 | UserProfileEdit "Save" button: `console.log('Saving profile:', formData)` → then calls `onBack()`. Appears to work but nothing saves. | Critical |
| USR-004 | UserProfileEdit "Cancel" button correctly calls `onBack()`. | ✅ OK |
| USR-005 | All user data (name, email, etc.) is hardcoded in the component. No auth store provides real user data. | High |

---

### Flow 2L: Login Page (Orphaned)

**Issues found:**

| ID | Issue | Severity |
|----|-------|----------|
| LGN-001 | LoginPage exists but is orphaned — no component imports it. Users never see a login screen. | Critical |
| LGN-002 | `handleSubmit` calls `setTimeout` → `console.log('Login:', {email, password})` → stops. No auth, no redirect. | Critical |
| LGN-003 | LoginPage imports Dashboard directly: `import { Dashboard } from './components/Dashboard'` — but never navigates to it after "login". | High |

---

## SECTION 3: PHANTOM FILES — Referenced But Missing

26 files appear in the project manifest but don't exist on disk. These represent entire planned features that were never built:

**Subscription/Enrollment Flow (completely missing):**
- SubscriptionEnrollmentWizard.tsx
- PlanComparisonPage.tsx
- PlanUpgradeFlow.tsx
- StepGoals.tsx, StepPackages.tsx, StepPublications.tsx, StepAddOns.tsx
- StepBillingCycle.tsx, StepBusinessInfo.tsx, StepPayment.tsx, StepReview.tsx

**Marketing Diagnostic Flow (step files missing):**
- StepWelcome.tsx, StepBusinessType.tsx, StepBusinessSubtype.tsx
- StepConfirmBusiness.tsx, StepBiggestChallenge.tsx
- StepCustomerSources.tsx, StepDifferentiator.tsx, StepLostPath.tsx
- StepMarketingActivities.tsx, StepQuickNumbers.tsx

**Note:** MarketingDiagnosticWizard.tsx contains inline implementations of all its step UIs plus `ResultsSummary` and `FullResultsDashboard` as internal functions. The Step*.tsx files appear to be planned extractions that never happened, or an alternative modular version that was never built.

**Diagnostic flow sub-components (missing as standalone files):**
- FullResultsDashboard.tsx (exists as function inside MarketingDiagnosticWizard)
- ResultsSummary.tsx (exists as function inside MarketingDiagnosticWizard)
- ProcessingScreen.tsx
- ProgressHeader.tsx
- ProgressIndicator.tsx

---

## SECTION 4: DUPLICATE & COMPETING IMPLEMENTATIONS

Multiple components serve the same purpose, creating confusion about which is the "real" one:

### Business Profile (6 competing implementations)

| Component | Lines | Used? | Purpose |
|-----------|-------|-------|---------|
| BusinessProfileEdit.tsx | ~350 | ✅ Yes (nav) | Tabbed form with 8 sections |
| BusinessProfilePage.tsx | ~50 | ❌ Orphan | AI session wrapper for profile |
| BusinessProfileForm.tsx | ~200 | ❌ Orphan | Chat-based profile builder |
| MyBusinessProfilePage.tsx | ~400 | ❌ Orphan | Dashboard-style profile with 14 nav targets |
| BusinessInfoEditPage.tsx | ~300 | ❌ Orphan | Simplified info editor |
| BusinessConfiguratorPage.tsx | 575 | ❌ Orphan | Full configurator with save |

**Problem:** A user editing their business profile uses BusinessProfileEdit (the nav-accessible one) which is a basic form. Meanwhile, MyBusinessProfilePage is a much richer implementation with profile strength indicators, quick actions, and 14 navigation targets to related tools — but nobody can reach it.

### Dashboard (7 competing implementations)

| Component | Lines | Used? | Purpose |
|-----------|-------|-------|---------|
| Dashboard.tsx | ~130 | ✅ Yes (root) | Shell with nav + switch/case |
| CentralCommandDashboard.tsx | 739 | ❌ Orphan | Full CC with goals, metrics, quick access |
| OverviewDashboard.tsx | ~400 | ❌ Orphan | Business overview with health score |
| B2BDashboard.tsx | ~400 | ❌ Orphan | CRM dashboard with pipeline summary |
| PerformanceDashboard.tsx | ~350 | ❌ Orphan | AI employee performance |
| BillingDashboard.tsx | ~300 | ❌ Orphan | Financial overview |
| ContentManagerDashboard.tsx | ~300 | ❌ Orphan | Content management hub |

**Problem:** The active Dashboard.tsx is a thin shell that shows a suggestions banner, content card, activity feed, and revenue chart. CentralCommandDashboard (739 lines) is the real Command Center experience with goal tracking, quick access to all features, and metrics — but it's orphaned.

### Headers (4 competing implementations)

| Component | Lines | Used? |
|-----------|-------|-------|
| UniversalHeader.tsx | 40 | ✅ Yes (Dashboard) |
| Header.tsx | 36 | Imported by AppShell (orphaned) |
| CommandCenterHeader.tsx | 61 | ❌ Orphan |
| HolographicHeader.tsx | 65 | ❌ Orphan |

### FAQ (2 competing implementations)

| Component | Used? |
|-----------|-------|
| FAQBuilderPage.tsx | ✅ Yes (nav) |
| FAQManagementPage.tsx | ❌ Orphan |

### Learning (3 competing implementations)

| Component | Used? |
|-----------|-------|
| LearningTopicsPage.tsx | ✅ Yes (nav, simple grid) |
| LearningCenterHub.tsx | ❌ Orphan (richer with 10 nav targets) |
| LearningLessonPage.tsx / LessonPlayerPage.tsx | ❌ Both orphaned |

---

## SECTION 5: VISUAL DESIGN SYSTEM CONFLICT

### Issue VIS-001: Two Incompatible Design Languages (Critical)

The codebase contains two distinct visual systems used inconsistently:

**System A — "Cyberpunk/Glass" (52 files):**
- `glass-card` wrapper class (226 total uses)
- Neon gradients: `from-[#00D4FF] to-[#8B5CF6]` (49 uses)
- Accent colors: #00FF88 (128 uses), #FFB800 (99 uses), #FF0080 (62 uses)
- Dark backgrounds: `bg-[var(--nexus-void)]`
- Font: Orbitron display font
- Glowing effects: `pulse-glow`, `hover:shadow-[#00D4FF]/50`

**System B — "Professional/Clean" (106 files):**
- `bg-white` with `border-slate-200` cards (216 uses of `bg-white rounded`)
- Primary: `bg-blue-600` buttons (97 uses)
- Neutral palette: slate-50 through slate-900
- Standard shadows: `shadow-sm`, `shadow-md`
- System fonts

**7 files actively mix both systems:** ArticleCreator, DashboardWidgets, EventCard, EventPlannerPage, LearnPage, MarketAnalysisForm, PresentationPanel

**Impact:** The nav-accessible pages (Dashboard, Articles, Events, FAQ Builder, Market Consultant) primarily use the Cyberpunk system. The orphaned CC 2.0 pages (CRM, Billing, Services, etc.) primarily use the Professional system. If these pages are ever connected, the user experience will jar violently between two completely different visual identities.

### Issue VIS-002: 45 Unique Raw Hex Colors (High)

Instead of using CSS custom properties, components hardcode hex colors directly:

| Color | Count | Meaning |
|-------|-------|---------|
| #00D4FF | 314 | Primary cyan/blue |
| #8B5CF6 | 129 | Secondary purple |
| #00FF88 | 128 | Success/green |
| #FFB800 | 99 | Warning/gold |
| #1E3A5F | 90 | Dark blue |
| #FF0080 | 62 | Danger/pink |
| #1a1a1a | 30 | Dark background |
| #E5E5E5 | 28 | Light border |
| #666666 | 27 | Muted text |

**Problem:** CSS custom properties exist in index.css (`--nexus-accent-primary`, `--nexus-text-secondary`, etc.) but exactly **zero** components reference `var(--nexus-card-bg)`. The theme system exists but nothing uses it, making theming/dark mode changes require touching all 149 files.

### Issue VIS-003: 92 Unique Button Style Patterns (High)

No shared Button component. Each file creates its own button styling:
- 97 instances of `bg-blue-600` (Professional system)
- 49 instances of `bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6]` (Cyberpunk system)
- Various sizes, border radii, padding, and hover states mixed randomly
- shadcn Button component is installed but used by only 1 file

### Issue VIS-004: Card Wrapper Inconsistency (Medium)

Three competing card patterns with zero standardization:
- `glass-card` custom class: 226 uses
- `bg-white rounded-*` with borders: 216 uses
- shadcn `<Card>` component: 1 use

---

## SECTION 6: HANDLER & INTERACTION DEAD ENDS

### Every "Save" Button Logs to Console

| Component | Handler | Actual Behavior |
|-----------|---------|----------------|
| BusinessProfileEdit | `handleSave()` | `console.log('Saving profile:', formData)` |
| BusinessSurveyPage | save handler | `console.log('Saving survey data:', surveyData)` |
| UserProfileEdit | `handleSave()` | `console.log('Saving profile:', formData)` → `onBack()` |
| ArticleCreator | save handler | `console.log('Saving article as:', action, formData)` |
| EventCreator | create handler | `console.log('Creating event:', formData)` |
| BusinessConfiguratorPage | save handler | `console.log('Profile saved:', profile)` |
| CustomerDetailPage | quote handler | `console.log('Create quote:', data)` |

**Count:** 11 components with `console.log` "save" handlers. Zero API calls anywhere.

### Every AI Feature Uses setTimeout Simulation

| Component | What It Fakes | Method |
|-----------|--------------|--------|
| FAQBuilderPage | AI FAQ generation | `setTimeout` + hardcoded FAQ |
| FAQBuilderPage | URL analysis | `setTimeout` + hardcoded results |
| FAQBuilderPage | Text analysis | `setTimeout` + hardcoded FAQ |
| FAQManagementPage | AI answer refinement | `setTimeout` simulation |
| ChatPanel | AI chat responses | `setTimeout` + hardcoded response |
| ExpandableChat | AI responses | `setTimeout` + hardcoded response |
| ConversationPage | AI conversation | `setTimeout` simulation |
| BusinessProfileForm | AI typing effect | `setTimeout` for character display |
| AIHandoffDecisionPanel | AI decision-making | `setTimeout` (×2) |
| BulkCustomerImportPage | File processing + AI | `setTimeout` (×2) |
| AlphaSiteComponentsPage | AI generation | `setTimeout` |
| VoiceControls | Voice input | `setTimeout` |
| AccountManagerAI | AI responses | `setTimeout` |
| AIWorkflowPanel | Workflow processing | `setTimeout` (×6!) |
| DataAnalyticsPanel | Data loading | `setTimeout` (×3) |
| MyBusinessProfilePage | AI profile gen | `setTimeout` |
| MarketingDiagnosticWizard | Processing screen | `setTimeout` |
| LoginPage | Auth simulation | `setTimeout` → `console.log` |

**Count:** 18 components using `setTimeout` to simulate backend operations. Users see "processing" animations that produce hardcoded results.

### Empty Comment Handlers ("// Handle" and "// TODO")

25 instances of `// Handle`, `// TODO`, `// Simulate`, or `// Placeholder` comments inside handler functions that do nothing. These represent buttons and actions that a user can trigger but that silently fail.

---

## SECTION 7: CROSS-PAGE FLOW BREAKDOWNS

### Flow Break: CRM List → Detail (Complete failure)

**Expected:** CustomersListPage → click row → CustomerDetailPage  
**Actual:** CustomersListPage is orphaned. Even if reached, row click calls `onNavigate('customer-detail')` → Dashboard doesn't handle it → nothing happens. CustomerDetailPage is also orphaned with its own internal modals (QuickCreateModal, ScheduleActivityModal) that can never trigger.

Same pattern for: Contacts list→detail, Invoices list→detail, Deals pipeline→detail, Activities list→detail.

### Flow Break: Dashboard → Feature Deep Dives (Complete failure)

**Expected:** CentralCommandDashboard quick access cards → CRM, Settings, Business Profile  
**Actual:** CentralCommandDashboard is orphaned. Its `onNavigate?.('business')` and `onNavigate?.('settings')` targets don't exist in Dashboard switch.

### Flow Break: Business Profile → Related Tools (Complete failure)

**Expected:** MyBusinessProfilePage → click "Business Configurator" → BusinessConfiguratorPage  
**Actual:** MyBusinessProfilePage is orphaned. Even if reached, 14 `onNavigate` targets (business-configurator, marketing-diagnostic, process-builder, faq-management, survey-management, alphasite-components, business-info-edit, learning) are not handled by any parent.

### Flow Break: Learning → Campaigns (Complete failure)

**Expected:** LearningCenterHub → course cards → CampaignRenderer displaying campaign JSON content  
**Actual:** LearningCenterHub is orphaned. 60 campaign JSONs are not imported by anything. No CampaignRenderer exists. The simpler LearningTopicsPage is used instead, linking to LearnPage (a video-call UI with no content from the JSONs).

### Flow Break: Login → Authenticated App (Complete failure)

**Expected:** LoginPage → authenticate → Dashboard with user context  
**Actual:** LoginPage is orphaned. Its `handleSubmit` logs credentials and stops. No auth store, no token management, no redirect.

---

## SECTION 8: PRIORITY ISSUE SUMMARY

### Critical (Must fix — app is non-functional without these)

| # | Issue | Affected Area |
|---|-------|---------------|
| 1 | No routing — single URL, no deep links, no back button | Entire app |
| 2 | 82 orphaned components (55% of codebase unreachable) | Entire app |
| 3 | 22 navigation targets that go nowhere | All list→detail flows |
| 4 | Zero API calls — every save is console.log | All data operations |
| 5 | No auth system — no login, no user identity | Security, personalization |
| 6 | 60 campaign JSONs disconnected from UI | Learning Center |
| 7 | Two incompatible design systems | Visual coherence |

### High (Major UX degradation)

| # | Issue | Affected Area |
|---|-------|---------------|
| 8 | QuickActionDock 4 buttons do nothing | Dashboard first impression |
| 9 | AIInsightsWidget 3 action buttons do nothing | Dashboard engagement |
| 10 | CommandPalette search/actions not wired | Power user navigation |
| 11 | 18 components fake AI with setTimeout | All AI features |
| 12 | CentralCommandDashboard (739L flagship) is orphaned | Core product value |
| 13 | 6 competing Business Profile implementations | Business profile UX |
| 14 | 92 unique button style patterns | Visual consistency |
| 15 | No validation on any form | Data integrity |
| 16 | 26 phantom files (referenced but don't exist) | Subscription flow |
| 17 | LearnPage has no back button to topic selection | Learning flow |

### Medium (Noticeable but not blocking)

| # | Issue | Affected Area |
|---|-------|---------------|
| 18 | 45 raw hex colors instead of CSS variables | Theming |
| 19 | 4 header components (3 orphaned) | Layout consistency |
| 20 | FAQ answer uses browser prompt() | FAQ UX polish |
| 21 | No loading states on data-dependent views | Perceived performance |
| 22 | No error states anywhere | Error recovery |
| 23 | Dark mode partially implemented (ThemeContext exists, 11 files use it) | Theme support |
| 24 | Back buttons on orphan pages say "Back to X" but X is unreachable | Misleading copy |

---

## SECTION 9: RECOMMENDED FIX SEQUENCE

This maps directly to the CC 2.0 Agent Briefs but is now informed by specific UX flow breaks:

**Phase 1 — Make What Exists Reachable (Week 1)**
1. Implement React Router with all 35+ routes
2. Rebuild NavigationRail with Six Verbs sections that include CRM, Billing, Analytics, Content, AI, Learning, Settings
3. Connect all 82 orphaned components to routes
4. Wire all 22 dead-end onNavigate targets to their corresponding routes
5. Add ProtectedRoute + login flow

**Phase 2 — Make What's Clickable Functional (Week 2)**
1. Replace all console.log save handlers with API calls
2. Replace all setTimeout AI simulations with actual API calls (or proper mock service)
3. Wire CommandPalette and QuickActionDock to route navigation
4. Connect 60 campaign JSONs via CampaignRenderer
5. Build shared components (DataTable, DataCard, etc.) to unify UX patterns

**Phase 3 — Make It Look Like One Product (Week 3)**
1. Choose one design system (Professional recommended for B2B SaaS) or create formal theme that works for both
2. Replace 45 raw hex colors with CSS custom properties
3. Consolidate to 1 Button, 1 Card, 1 Header pattern
4. Resolve the 6 Business Profile duplicates — pick one, deprecate others
5. Resolve the 7 Dashboard duplicates — compose into one unified experience
6. Add loading states, error states, form validation
