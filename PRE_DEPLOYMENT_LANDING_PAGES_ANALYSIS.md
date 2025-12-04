# 📋 Pre-Deployment Analysis: Landing Pages & Campaigns
## Data-Land-pages-campaign Directory Review

**Date:** December 2, 2024  
**Status:** ⚠️ **WORK REQUIRED BEFORE DEPLOYMENT**

---

## 🔍 WHAT I FOUND

### Landing Page Campaign Data:
- **60 Campaigns** organized across 12 weeks (90-day rollout)
- **3 Campaign Types:**
  - Hook (15 campaigns) - Quick engagement
  - Educational (15 campaigns) - Trust building
  - How-To (30 campaigns) - Step-by-step guides

### Files in Directory:
1. `campaigns.csv` - Campaign metadata (60 rows)
2. `landing_pages.csv` - Landing page configuration (60 rows)
3. `landing_pages_master.json` - JSON master file (60 landing pages)
4. `campaign_*.json` - Individual campaign presentation files (at least 3 examples)
5. `Fibonacco_LandingPage_Database.xlsx` - Excel database

---

## ⚠️ WORK REQUIRED BEFORE DEPLOYMENT

### 1. **ROUTING** ❌ NOT IMPLEMENTED

**Current State:**
- Routes exist for `/learning/presentation/:id`
- NO routes for the 60 landing pages like:
  - `/learn/claim-your-listing`
  - `/learn/seo-reality-check`
  - `/learn/command-center-basics`
  - etc.

**Required:**
```typescript
// Need to add routes like:
<Route path="/learn/:slug" element={<CampaignLandingPage />} />
```

**Action:** Create dynamic route handler for `/learn/:slug` that:
- Looks up campaign by `landing_page_slug`
- Loads presentation data
- Renders presentation player

---

### 2. **DATABASE INTEGRATION** ❌ NOT IMPLEMENTED

**Current State:**
- Presentation tables exist in database schema
- NO campaign/landing page data loaded
- NO presentation_templates for these campaigns

**Required:**
- Import campaign data into database
- Create presentation_templates for each campaign type
- Link landing pages to presentations

**Action:** 
1. Create migration to import campaign data
2. Map CSV data to database tables
3. Create presentation templates

---

### 3. **PRESENTATION JSON STRUCTURE** ⚠️ PARTIAL

**Current State:**
- Presentation player exists and can render JSON
- Individual campaign JSON files exist (examples: HOOK-001, EDU-001, HOWTO-001)
- Format may not match our presentation schema exactly

**Required:**
- Verify JSON structure matches our Presentation type
- Ensure all 60 campaigns have complete JSON files
- Validate slide components exist for all template types

**Action:**
- Review campaign JSON structure
- Map to our Presentation schema
- Create missing JSON files if needed

---

### 4. **AUDIO FILES** ❌ NOT GENERATED

**Current State:**
- Audio generation scripts exist (TTS)
- NO audio files generated for campaigns
- Audio URLs point to: `https://cdn.fibonacco.com/presentations/{slug}/audio/`

**Required:**
- Generate audio files for all 60 campaigns
- Upload to S3 bucket
- Update URLs if needed

**Action:**
- Generate audio for each campaign using TTS scripts
- Upload to S3
- Update audio_base_url in database

---

### 5. **TEMPLATE TYPES** ⚠️ NEEDS VERIFICATION

**Current State:**
- Slide components exist for common types
- Campaign templates include:
  - `claim-listing`
  - `educational`
  - `tutorial`
  - `event-posting`
  - `coupon-creator`
  - `feature-application`
  - `sponsor-application`
  - `expert-application`
  - `influencer-application`
  - `integration`
  - `upgrade-offer`
  - `advertising-offer`
  - `trial-offer`
  - `seasonal-promotion`
  - `nomination`
  - `ai-intro`

**Required:**
- Verify all template types have corresponding slide components
- Create missing template types if needed

**Action:**
- Map template IDs to slide components
- Create missing components
- Test rendering

---

## 📊 DATA MAPPING NEEDED

### Campaign CSV → Database Tables:

```typescript
campaigns.csv → presentation_templates table
- id → template_id
- title → name
- template → template_id
- description → description

landing_pages.csv → generated_presentations table (or separate landing_pages table)
- campaign_id → id
- landing_page_slug → slug
- url → url_path
- template_id → template_id
- slide_count → slide_count
- duration_seconds → estimated_duration
- audio_base_url → audio_base_url
```

---

## 🚨 CRITICAL ITEMS BEFORE DEPLOYMENT

### Priority 1 (Must Have):
1. ✅ **Routes** - Add `/learn/:slug` route handler
2. ✅ **Database Import** - Import campaign data
3. ✅ **Campaign Landing Page Component** - Component to render campaign presentations

### Priority 2 (Should Have):
4. ⚠️ **Template Components** - Verify all template types supported
5. ⚠️ **JSON Validation** - Ensure all 60 campaigns have valid JSON

### Priority 3 (Can Do After):
6. ⏳ **Audio Generation** - Generate TTS audio files
7. ⏳ **CDN Upload** - Upload audio to S3/CDN

---

## 📝 RECOMMENDED ACTIONS

### Before First Deployment:

1. **Create Landing Page Route:**
   ```typescript
   // Add to AppRouter.tsx
   <Route path="/learn/:slug" element={<CampaignLandingPage />} />
   ```

2. **Create Campaign Landing Page Component:**
   - Loads campaign data by slug
   - Loads presentation JSON
   - Renders FibonaccoPlayer
   - Handles CTA buttons

3. **Import Campaign Data:**
   - Create database migration
   - Import from CSV or JSON
   - Link to presentation_templates

4. **Verify Template Support:**
   - Check all template IDs
   - Create missing slide components
   - Test rendering

### After Initial Deployment:

5. **Generate Audio Files:**
   - Use TTS scripts
   - Generate for all campaigns
   - Upload to S3

6. **Performance Optimization:**
   - Cache presentation data
   - Lazy load audio
   - CDN optimization

---

## 🎯 ESTIMATED WORK

- **Routes & Component:** 2-3 hours
- **Database Import:** 2-3 hours  
- **Template Verification:** 1-2 hours
- **Testing:** 2-3 hours
- **Total:** ~8-11 hours

---

## ✅ DECISION POINT

**Question:** Should we:
- A) Deploy Learning Center first, add landing pages later
- B) Complete landing pages integration before deployment
- C) Deploy with basic landing page support, enhance later

**Recommendation:** Option C - Deploy with basic route and component, import data after deployment for testing.

---

## 📋 CHECKLIST

- [ ] Add `/learn/:slug` route
- [ ] Create CampaignLandingPage component
- [ ] Create database migration for campaign data
- [ ] Import campaign data to database
- [ ] Verify all template types supported
- [ ] Test at least 3 campaigns (HOOK, EDU, HOWTO)
- [ ] Create audio generation plan
- [ ] Document campaign management process

---

**Status:** ⚠️ **LANDING PAGES NOT FULLY INTEGRATED - WORK REQUIRED**


