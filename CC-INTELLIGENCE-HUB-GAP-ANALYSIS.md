# CC Intelligence Hub — Gap Analysis & Project Plan

**Date:** 2026-02-19  
**Assessed Against:** `CC-INTELLIGENCE-HUB-UPDATE.md`  
**Codebase:** `/Users/johnshine/Dropbox/Fibonacco/Learning-Center`

---

## Executive Summary

The Intelligence Hub spec defines **8 major workstreams** across the backend (PP) and frontend (CC). The backend API scaffolding is in good shape — endpoints exist, the service layer compiles, and the migration is written. However, **not a single frontend consumer actually calls the Intelligence Hub data yet**, meaning the entire feature is invisible to users. Several critical AI components referenced in the spec don't exist at all, and the profile page still shows a legacy video-call layout instead of the aggregated Intelligence Hub profile.

| Area | Status | Completion |
|------|--------|------------|
| PP: Backend API Endpoints | ✅ Scaffolded | ~80% |
| PP: Database Migration | ✅ Written | ~90% |
| CC: `smbService` methods | ✅ Implemented | ~95% |
| CC: `communityService` | ✅ Implemented | ~95% |
| CC: SMB TypeScript types | ✅ Fully typed | ~100% |
| CC: `MyBusinessProfilePage.tsx` | ❌ NOT IMPLEMENTED | 0% |
| CC: `ProfileStrengthIndicator.tsx` | ❌ NOT IMPLEMENTED | 0% |
| CC: AI Component Updates (6 components) | ❌ NOT IMPLEMENTED | 0% |
| CC: `MarketingCampaignWizard.tsx` | ❌ NOT IMPLEMENTED | 0% |
| CC: `MarketingDiagnosticWizard.tsx` | ❌ NOT IMPLEMENTED | 0% |
| Backend: Enrichment Job | ⚠️ Placeholder only | ~15% |
| End-to-End Validation | ❌ None | 0% |

**Overall Intelligence Hub Completion: ~25%** — The plumbing exists but nothing is wired to UI.

---

## Detailed Findings

### 1. PP Backend API Endpoints (Spec Items §PP)

#### ✅ What's Done
- **Endpoints exist and are registered in `routes/api.php`** (lines 291-298):
  - `GET /api/v1/smb/{id}/full-profile` → `SmbProfileController@fullProfile`
  - `GET /api/v1/smb/{id}/ai-context` → `SmbProfileController@aiContext`
  - `GET /api/v1/smb/{id}/intelligence-summary` → `SmbProfileController@intelligenceSummary`
  - `PATCH /api/v1/smb/{id}/profile/{section}` → `SmbProfileController@updateSection`
  - `POST /api/v1/smb/{id}/enrich` → `SmbProfileController@enrich`
- **`SmbProfileService.php`** fully implements `buildFullProfile()`, `getAIContext()`, `buildIntelligenceSummary()`, and `computeProfileCompleteness()`.
- **Community endpoints** exist: `GET /communities`, `GET /communities/{id}`, `GET /communities/{id}/businesses`.

#### ⚠️ Issues & Gaps

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| 1 | **Enrichment endpoint is a placeholder** | HIGH | `SmbProfileController@enrich` (line 115) has a comment: `// Placeholder: dispatch enrichment job when implemented.` — No actual enrichment job (`EnrichSMBJob`) exists in `app/Jobs/`. It just stamps `last_enriched_at` and returns "queued". No Google Places, website scan, or SerpAPI integration. |
| 2 | **Intelligence summary is simplistic** | MEDIUM | `buildIntelligenceSummary()` does basic string concatenation. The spec calls for a ~500-1000 word summary. Current implementation just dumps JSON for arrays — not AI-generated prose. |
| 3 | **`getCampaignHistory()` returns mostly nulls** | MEDIUM | `total_campaigns` is hardcoded to `0`. `avg_open_rate` and `avg_click_rate` are always `null`. No aggregation from campaign analytics tables. |
| 4 | **Controller uses `Customer` model, spec says `smbs` table** | LOW | The spec says to add columns to the `smbs` table, but the migration (`2026_02_18_...`) adds them to the `customers` table. The controller also queries `Customer`. This is likely intentional (customers ≈ SMBs in this codebase), but the naming mismatch could cause confusion. |
| 5 | **No request validation classes** | LOW | Endpoints use inline validation or none at all — no Form Request classes per code review recommendations. |

---

### 2. PP Database Migration (Spec Item §PP: Migration)

#### ✅ What's Done
- Migration `2026_02_18_000001_add_intelligence_hub_columns_to_customers.php` exists.
- Adds all required columns: `ai_context`, `customer_intelligence`, `competitor_analysis`, `survey_responses`, `profile_completeness`, `data_sources`, `last_enriched_at`.
- Properly guards with `Schema::hasColumn()` checks and supports both PostgreSQL (`jsonb`) and MySQL (`json`).

#### ⚠️ Issues

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| 1 | **Migration targets `customers` table, not `smbs`** | LOW | See note above — the spec says `smbs` but migration targets `customers`. Verify this is the correct table for your data model. |
| 2 | **Migration has NOT been verified as run** | MEDIUM | Cannot confirm from codebase alone whether this migration has been executed on production/staging. Needs verification. |

---

### 3. CC Frontend: `smbService` Methods (Spec Item §CC #1)

#### ✅ Fully Implemented
All 5 methods specified exist in `src/services/smbService.ts`:
- `getFullProfile(id)` → `GET /smb/{id}/full-profile`
- `getAIContext(id)` → `GET /smb/{id}/ai-context`
- `getIntelligenceSummary(id)` → `GET /smb/{id}/intelligence-summary`
- `updateSection(id, section, data)` → `PATCH /smb/{id}/profile/{section}`
- `requestEnrichment(id)` → `POST /smb/{id}/enrich`

**No issues found.** Types are clean with `SMBFullProfile`, `SMBProfileSectionKey`.

---

### 4. CC Frontend: `communityService` (Spec Item §CC #2)

#### ✅ Fully Implemented
All 3 methods exist in `src/services/communityService.ts`:
- `list(filters?)` → `GET /communities`
- `get(id)` → `GET /communities/{id}`
- `getBusinesses(communityId, filters?)` → `GET /communities/{id}/businesses`

Types for `Community`, `CommunityBusiness`, filter interfaces — all present.

---

### 5. CC Frontend: SMB TypeScript Types (Spec Item §CC #3)

#### ✅ Fully Implemented
`src/types/smb.ts` contains the full `SMBFullProfile` interface with all fields from the spec:
- `google_data`, `enriched_data`, `survey_responses`, `ai_context`, `campaign_history`, `customer_intelligence`, `competitor_analysis`, `subscription`, `profile_completeness`, `data_sources`, `last_enriched_at`

---

### 6. CC Frontend: `MyBusinessProfilePage.tsx` (Spec Item §CC #4) — ❌ NOT IMPLEMENTED

**This is the #1 gap.** The spec calls for updating the business profile page to:
- Load from `getFullProfile()` instead of basic SMB data
- Show AI Profile (tone, story angles, approved quotes)
- Show Customer Intelligence (perception gaps, NPS, feedback themes)
- Show Competitive Intel
- Show data source indicators

**What exists instead:**
- `BusinessProfilePage.tsx` — A **video call layout** with a `BusinessProfileForm`, `Facilitator`, `VoiceControls`, and hardcoded chat messages about "TechSolutions". This has **nothing to do with the Intelligence Hub**. It doesn't call `smbService` at all.
- `useFullSMBProfile` hook exists but is **not used anywhere in any component**.
- There is no `MyBusinessProfilePage.tsx` file anywhere in the codebase.

---

### 7. CC Frontend: `ProfileStrengthIndicator.tsx` (Spec Item §CC #5) — ❌ NOT IMPLEMENTED

**No file exists.** The spec calls for a per-source completeness display (Google, Website, Survey, Customer Survey, AI Context) instead of a single bar. No component with this name or similar purpose was found.

---

### 8. CC Frontend: AI Component Updates (Spec Item §CC #6) — ❌ NOT IMPLEMENTED

The spec requires these **6 components** to pass full profile context to the personality API:

| Component | Exists? | Passes Intelligence Hub Context? |
|-----------|---------|----------------------------------|
| `AccountManagerAI` | ❌ No (only `AccountManagerButton.tsx` exists as a header button) | N/A |
| `ConsultingChat` | ❌ No | N/A |
| `AIServiceAdvisor` | ❌ No | N/A |
| `AIRecommendationsPanel` | ❌ No | N/A |
| `AIInsightsPanel` | ❌ No | N/A |
| `AIHandoffDecisionPanel` | ❌ No | N/A |

**None of these 6 components exist.** Not a single AI component in the codebase passes `business_profile`, `ai_context`, or `intelligence_summary` to the personality API.

The `command-center/modules/ai-hub/` directory contains `AIChat.tsx`, `AIAnalysisPanel.tsx`, `AIWorkflowPanel.tsx` — but these are general-purpose AI chat components, not the business-context-aware components the spec requires.

---

### 9. CC Frontend: `MarketingCampaignWizard.tsx` (Spec Item §CC #7) — ❌ NOT IMPLEMENTED

**No file exists with this name.** The spec calls for:
- Community selection in the audience step
- Select community → load its businesses → filter by category/stage/completeness → target

What exists: `command-center/modules/campaigns/CampaignWizard.tsx` — This has a generic audience step with radio buttons ("All Customers", "Active Leads", "Recent Interactions", "Custom Segment"). **No community selection, no business filtering, no integration with `communityService`.**

---

### 10. CC Frontend: `MarketingDiagnosticWizard.tsx` (Spec Item §CC #8) — ❌ NOT IMPLEMENTED

**No file exists.** The spec calls for a wizard that pulls from full profile data instead of asking questions the system already knows. Nothing matching this exists.

---

### 11. Additional Systemic Issues Found

| # | Issue | Category | Detail |
|---|-------|----------|--------|
| 1 | **30+ PlaceholderPages in routes** | UI/Completeness | Lines 206-252 of `AppRouter.tsx` route to a generic `PlaceholderPage` ("This content is coming soon") for ~30 routes across Video Tutorials, Documentation, Webinars, Community, Certifications, Advanced Topics, and Resources. |
| 2 | **ProfilePage has no API connection** | UI/Data | `ProfilePage.tsx` initializes all user data as empty strings with `TODO: Connect to real API endpoint`. No API calls. |
| 3 | **BusinessProfilePage has hardcoded mock data** | UI/Data | Contains hardcoded TechSolutions financial data in chat messages and static participant images from Unsplash. |
| 4 | **Account Settings / Security tabs are empty** | UI/Completeness | `ProfilePage.tsx` lines 330-343: "Account settings content will go here" and "Security settings content will go here". |
| 5 | **No enrichment worker infrastructure** | Backend | No queued job, no Google Places client, no SerpAPI client, no website scanner. The `enrich` endpoint is a no-op. |

---

## Project Plan

### Phase 1: Critical Path — Wire Intelligence Hub UI (Priority: HIGHEST)

These items complete the core promise of the spec — making the intelligence data visible and actionable.

#### 1.1 Create `MyBusinessProfilePage.tsx` [Est: 4-6 hours]
**What:** Build the full evolving profile page per spec §CC #4.  
**Steps:**
1. Create `src/pages/CommandCenter/MyBusinessProfilePage.tsx`
2. Use `useFullSMBProfile` hook to fetch aggregated data
3. Build sections: Google Data, Enrichment Data, Survey Responses, AI Profile, Customer Intelligence, Competitive Intel, Subscription status
4. Show data source badges for each section
5. Add edit capability using `smbService.updateSection()` for editable sections (ai_context, survey_responses, customer_intelligence, competitor_analysis)
6. Add "Re-Enrich" button calling `smbService.requestEnrichment()`
7. Register route in `AppRouter.tsx`

#### 1.2 Create `ProfileStrengthIndicator.tsx` [Est: 2-3 hours]
**What:** Per-source completeness display per spec §CC #5.  
**Steps:**
1. Create `src/components/ProfileStrengthIndicator.tsx`
2. Accept `SMBFullProfile` as prop
3. Compute per-source scores: Google (place_id, rating, hours, photos, address, phone, website), Website (website_description, website_services), Survey (survey_responses completion_pct), Customer Survey (customer_intelligence fields), AI Context (tone_and_voice, story_angles, approved_quotes)
4. Render multi-bar visualization with labels
5. Integrate into `MyBusinessProfilePage`

#### 1.3 Upgrade `CampaignWizard` Audience Step [Est: 3-4 hours]
**What:** Add community selection per spec §CC #7.  
**Steps:**
1. In `src/command-center/modules/campaigns/CampaignWizard.tsx`, add a "Community" audience option
2. When selected, fetch communities via `communityService.list()`
3. On community selection, fetch businesses via `communityService.getBusinesses()`
4. Add filter controls: category, engagement stage, profile_completeness
5. Show count of matching businesses dynamically

---

### Phase 2: AI Component Integration (Priority: HIGH)

#### 2.1 Create AI Business-Context Components [Est: 8-12 hours]
**What:** Build the 6 missing AI components per spec §CC #6.  
**Steps:**
1. **`AccountManagerAI.tsx`** — Full AI account manager chat panel that loads `fullProfile`, `aiContext`, and `intelligenceSummary` for the current business, then passes them as context to the personality API
2. **`ConsultingChat.tsx`** — AI consulting chat with business context injection
3. **`AIServiceAdvisor.tsx`** — Service recommendation panel powered by profile data
4. **`AIRecommendationsPanel.tsx`** — Data-driven recommendations using campaign_history, customer_intelligence
5. **`AIInsightsPanel.tsx`** — Insights derived from the full profile
6. **`AIHandoffDecisionPanel.tsx`** — Decision panel for escalating from AI to human

For each component:
- Fetch business context using `smbService.getFullProfile()` + `smbService.getAIContext()` + `smbService.getIntelligenceSummary()`
- Pass full context payload: `{ context: { business_profile: fullProfile, ai_context: aiContext, intelligence_summary: summary } }` to the personality API
- Reference existing `command-center/modules/ai-hub/AIChat.tsx` for patterns

#### 2.2 Create `MarketingDiagnosticWizard.tsx` [Est: 4-5 hours]
**What:** Diagnostic wizard per spec §CC #8.  
**Steps:**
1. Create `src/command-center/modules/campaigns/MarketingDiagnosticWizard.tsx`
2. Load full profile first
3. Pre-fill known data (Google rating, website info, social presence, survey responses)
4. Only ask questions where data is missing
5. Provide AI-powered diagnostic recommendations based on full profile

---

### Phase 3: Backend Completions (Priority: HIGH)

#### 3.1 Implement Enrichment Job [Est: 6-8 hours]
**What:** Replace the placeholder in `SmbProfileController@enrich` with a real queued job.  
**Steps:**
1. Create `app/Jobs/EnrichSMBJob.php`
2. Implement Google Places API client (use `places_details` with the `place_id` from customer metadata)
3. Implement website scanner (HTTP fetch + meta tag extraction)
4. Implement SerpAPI client for business search enrichment
5. Update customer record with enriched data, update `data_sources`, set `last_enriched_at`
6. Update `SmbProfileController@enrich` to dispatch `EnrichSMBJob`

#### 3.2 Improve Intelligence Summary Generation [Est: 3-4 hours]
**What:** Upgrade `buildIntelligenceSummary()` from string concatenation to AI-generated prose.  
**Steps:**
1. Call OpenRouter/AI service with full profile data
2. Generate a 500-1000 word natural language summary
3. Cache the result with a TTL (regenerate when profile changes)
4. Add a `regenerate` parameter to force refresh

#### 3.3 Complete Campaign History Aggregation [Est: 2-3 hours]
**What:** Fix `getCampaignHistory()` to return real data.  
**Steps:**
1. Query `campaigns` table for `total_campaigns` count
2. Calculate `avg_open_rate` from `campaign_sends` and tracking tables
3. Calculate `avg_click_rate` from click tracking
4. Remove hardcoded `0` for `total_campaigns`

#### 3.4 Add Form Request Validation [Est: 1-2 hours]
**What:** Create proper request validation for Intelligence Hub endpoints.  
**Steps:**
1. Create `app/Http/Requests/UpdateProfileSectionRequest.php`
2. Create `app/Http/Requests/EnrichRequest.php`
3. Add tenant validation, section whitelist validation, data shape validation

---

### Phase 4: Cleanup & Polish (Priority: MEDIUM)

#### 4.1 Fix `BusinessProfilePage.tsx` [Est: 2-3 hours]
**What:** Replace the legacy video-call layout with the Intelligence Hub profile or redirect.  
**Steps:**
1. Either remove/redirect `/business-profile` to the new `MyBusinessProfilePage` route
2. Or repurpose it as a live session page and remove the hardcoded TechSolutions mock data

#### 4.2 Wire `ProfilePage.tsx` to API [Est: 2-3 hours]
**What:** Connect user profile page to real API.  
**Steps:**
1. Fetch user data from `authService` on mount
2. Implement save functionality via API
3. Implement Account Settings tab content
4. Implement Security tab content (password change, 2FA)

#### 4.3 Replace Placeholder Pages [Est: 8-12 hours]
**What:** Build real content for the ~30 routes using `PlaceholderPage`.  
**Steps:** Prioritize by user traffic:
1. **Video Tutorials** (4 routes) — Embed Vimeo/video players
2. **Documentation** (6 routes) — Render from content API or markdown
3. **Community** (4 routes) — Forums, user stories, expert network
4. **Certifications** (4 routes) — Assessment flows
5. **Webinars** (4 routes) — Calendar + recording player
6. **Advanced Topics** (4 routes) — Content pages
7. **Resources** (4 routes) — Templates, case studies

---

### Phase 5: Validation & Testing (Priority: HIGH)

Per spec §Validation:

| Validation Criteria | Test Plan |
|---------------------|-----------|
| `GET /smb/{id}/full-profile` returns aggregated data | Integration test: seed customer with Google data, survey, AI context → verify all sections populated |
| AI chat responses reference real business details | E2E test: load AI chat with a seeded business → verify response contains business name, quotes |
| Campaign wizard can target a community's businesses | E2E test: select community → verify businesses load → filter by category → verify count |
| Profile page shows data from Google, enrichment, surveys, AI context | Visual test: load MyBusinessProfilePage → verify all 4 data source sections render |
| Profile strength shows per-source completeness | Unit test: pass various profile states → verify bar percentages |

---

## Priority Sequence

```
Week 1: Phase 1 (MyBusinessProfilePage, ProfileStrengthIndicator, CampaignWizard upgrade)
Week 2: Phase 2.1 (First 3 AI components: AccountManagerAI, ConsultingChat, AIServiceAdvisor)
Week 3: Phase 2.1 continued (Last 3 AI components) + Phase 2.2 (MarketingDiagnosticWizard)
Week 4: Phase 3 (Backend completions: enrichment, summary, campaign history)
Week 5: Phase 4 (Cleanup: fix profile pages, replace placeholders - first batch)
Week 6: Phase 5 (Validation testing) + Phase 4 remainder
```

**Total estimated effort: ~50-70 hours**

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Enrichment APIs (Google Places, SerpAPI) require API keys and billing | Blocks Phase 3.1 | Verify API key availability and billing before starting |
| Intelligence Hub migration may not have run on production | Blocks ALL features | Run migration and verify columns exist before any frontend work |
| 30+ placeholder pages are a separate large project | Scope creep | Phase 4.3 can be deferred or broken into multiple sprints |
| AI component architecture not established | Design risk | Use existing `AIChat.tsx` as pattern; get design approval before building all 6 |
