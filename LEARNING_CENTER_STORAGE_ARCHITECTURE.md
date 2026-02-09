# Learning Center Content Storage Architecture

## Overview

The Learning Center uses a **hybrid storage approach** combining static JSON files and database tables. Currently, content is primarily stored in static JSON files, with database infrastructure in place for future migration.

---

## Current Storage: Static JSON Files

### Location
**`public/campaigns/`** directory

### Files
- **61 JSON files total:**
  - `landing_pages_master.json` - Master index/slug mapping (1 file)
  - `campaign_HOOK-001.json` through `campaign_HOOK-015.json` (15 files)
  - `campaign_EDU-001.json` through `campaign_EDU-015.json` (15 files)
  - `campaign_HOWTO-001.json` through `campaign_HOWTO-030.json` (30 files)

### Structure

Each campaign JSON file contains:
```json
{
  "campaign": {
    "id": "HOOK-001",
    "week": 1,
    "day": 1,
    "type": "Hook",
    "title": "Claim Your Listing",
    "subject": "...",
    "landing_page": "claim-your-listing",
    "template": "claim-listing",
    "description": "..."
  },
  "landing_page": {
    "campaign_id": "HOOK-001",
    "landing_page_slug": "claim-your-listing",
    "url": "/claim/{{business_slug}}",
    "template_id": "claim-listing",
    "slide_count": 6,
    "duration_seconds": 120,
    "primary_cta": "claim_now",
    "secondary_cta": "customize_first",
    "ai_persona": "Sarah",
    "ai_tone": "Excited, helpful, personal",
    "data_capture_fields": "name, email, phone, business_name, role",
    "audio_base_url": "https://cdn.fibonacco.com/presentations/...",
    "crm_tracking": true,
    "conversion_goal": "signup",
    "utm_source": "email",
    "utm_medium": "outbound",
    "utm_campaign": "90day-week1-hook",
    "utm_content": "HOOK-001"
  },
  "template": {
    "template_id": "claim-listing",
    "name": "Claim Your Listing",
    "slides": 6,
    "duration": 120,
    "purpose": "hook",
    "audio_required": true
  },
  "slides": [
    {
      "slide_num": 1,
      "component": "PersonalizedHeroSlide",
      "title": "We Built This For You",
      "content": {
        "headline": "We Built This For {{business_name}}",
        "subhead": "Your listing is ready. Take a look.",
        "visual": "Preview mockup of their listing",
        "personalization": ["business_name", "business_type", "location"]
      },
      "narration": "Hey {{first_name}}, we did something for {{business_name}}...",
      "duration_seconds": 15,
      "audio_file": "slide-01-hero.mp3"
    },
    // ... more slides
  ],
  "article": {
    "title": "...",
    "content": "..."
  },
  "emails": {
    "day_1": {
      "subject": "...",
      "body": "..."
    }
  }
}
```

### How It's Loaded

**Frontend Loading (`src/services/learning/campaign-api.ts`):**
```typescript
// 1. Loads landing_pages_master.json to map slug → campaign_id
// 2. Loads campaign_{ID}.json file
// 3. Converts to Presentation format
// 4. Falls back to API endpoint if JSON not found
```

**Backend API (`backend/app/Http/Controllers/Api/CampaignController.php`):**
```php
// Can load from database tables:
// - campaigns table
// - campaign_landing_pages table
// - content table (for slides)
```

---

## Database Storage: Infrastructure Ready

### Tables Available

#### 1. **`campaign_landing_pages`** Table
**Purpose:** Landing page metadata and configuration

**Columns:**
- `campaign_id` (primary key, string)
- `landing_page_slug` (unique)
- `url`
- `template_id`
- `template_name`
- `slide_count`
- `duration_seconds`
- `primary_cta`, `secondary_cta`
- `ai_persona`, `ai_tone`, `ai_goal`
- `audio_base_url`
- `crm_tracking` (boolean)
- `conversion_goal`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
- `data_capture_fields` (JSON)
- `metadata` (JSON)
- `timestamps`

**Model:** `CampaignLandingPage`

#### 2. **`content`** Table
**Purpose:** Content items including slides and articles

**Columns:**
- `id` (primary key)
- `slug` (unique)
- `type` (edu, hook, howto, article)
- `title`
- `campaign_id` (foreign key)
- `slides` (JSON array)
- `article_body` (text)
- `audio_base_url`
- `duration_seconds`
- `service_type`
- `approval_button_text`
- `personalization_fields` (JSON)
- `metadata` (JSON)
- `is_active` (boolean)
- `timestamps`

**Model:** `Content`

#### 3. **`presentation_templates`** Table
**Purpose:** Reusable presentation templates

**Columns:**
- `id` (primary key, string)
- `name`
- `description`
- `purpose`
- `target_audience`
- `slides` (JSON)
- `audio_base_url`
- `audio_files` (JSON)
- `injection_points` (JSON)
- `default_theme` (JSON)
- `default_presenter_id`
- `estimated_duration`
- `slide_count`
- `is_active` (boolean)
- `timestamps`

**Model:** `PresentationTemplate`

#### 4. **`generated_presentations`** Table
**Purpose:** Cached/generated presentations for customers

**Columns:**
- `id` (UUID primary key)
- `tenant_id`
- `customer_id`
- `template_id`
- `presentation_json` (JSON)
- `audio_base_url`
- `audio_generated` (boolean)
- `audio_generated_at`
- `input_hash` (for cache lookup)
- `expires_at`
- `view_count`
- `avg_completion_rate`
- `last_viewed_at`
- `created_at`

**Model:** `GeneratedPresentation`

#### 5. **`knowledge_base`** Table
**Purpose:** Knowledge articles and FAQs

**Columns:**
- `id` (UUID primary key)
- `tenant_id`
- `title`
- `content`
- `category`, `subcategory`
- `industry_codes` (JSON)
- `embedding` (vector for semantic search)
- `embedding_status`
- `is_public` (boolean)
- `allowed_agents` (JSON array)
- `source`, `source_url`
- `validation_status`
- `validated_at`, `validated_by`
- `usage_count`
- `helpful_count`, `not_helpful_count`
- `tags` (JSON)
- `metadata` (JSON)
- `created_by`
- `timestamps`

**Model:** `Knowledge`

#### 6. **`campaigns`** Table
**Purpose:** Campaign definitions

**Columns:**
- `id` (string primary key)
- `slug`
- `title`
- `type` (hook, edu, howto)
- `week`, `day`
- `subject`
- `description`
- `is_active` (boolean)
- `timestamps`

**Model:** `Campaign`

---

## Current State: Hybrid Approach

### What's in Files (Static JSON)
✅ **Campaign presentation slides** - Full slide content  
✅ **Landing page configuration** - Metadata  
✅ **Template definitions** - Template structure  
✅ **Article content** - Full article text  
✅ **Email templates** - Email content  

### What's in Database (Ready but Not Populated)
⚠️ **Campaign metadata** - Table exists, not populated  
⚠️ **Landing page config** - Table exists, not populated  
⚠️ **Content items** - Table exists, not populated  
⚠️ **Presentation templates** - Table exists, not populated  

### How It Works Now

1. **Frontend loads from JSON:**
   ```
   User visits /learn/claim-your-listing
   → Loads landing_pages_master.json
   → Finds campaign_id (HOOK-001)
   → Loads campaign_HOOK-001.json
   → Renders presentation
   ```

2. **Backend API can serve from database:**
   ```
   GET /api/v1/campaigns/{slug}
   → Queries campaigns table
   → Joins campaign_landing_pages
   → Joins content table
   → Returns formatted data
   ```

3. **Fallback mechanism:**
   - Frontend tries JSON files first
   - Falls back to API endpoint
   - API can query database or return 404

---

## Migration Path: JSON → Database

### Step 1: Import Campaign Metadata
```php
// Migration or Artisan command to import:
// - campaigns table: Campaign definitions
// - campaign_landing_pages table: Landing page configs
```

### Step 2: Import Content
```php
// Import slides into content table:
// - Each campaign's slides → content.slides JSON
// - Articles → content.article_body
```

### Step 3: Import Templates
```php
// Import templates into presentation_templates:
// - Template definitions
// - Slide structures
```

### Step 4: Update Frontend
```typescript
// Change campaign-api.ts to:
// 1. Try API endpoint first
// 2. Fall back to JSON files
// 3. Eventually remove JSON fallback
```

---

## Storage Comparison

| Aspect | Static JSON Files | Database Tables |
|--------|------------------|-----------------|
| **Current Usage** | ✅ Primary | ⚠️ Infrastructure ready |
| **Campaign Slides** | ✅ In JSON | ⚠️ Can store in `content.slides` |
| **Landing Page Config** | ✅ In JSON | ✅ Table: `campaign_landing_pages` |
| **Templates** | ✅ In JSON | ✅ Table: `presentation_templates` |
| **Articles** | ✅ In JSON | ✅ Table: `content.article_body` |
| **Knowledge Base** | ❌ Not in JSON | ✅ Table: `knowledge_base` |
| **FAQs** | ❌ Not in JSON | ✅ Table: `knowledge_base` |
| **Surveys** | ❌ Not in JSON | ✅ Tables: `survey_sections`, `survey_questions` |

---

## Recommendations

### Short-term (Current)
✅ **Keep using JSON files** - They work and are fast  
✅ **Use database for:** Knowledge base, FAQs, Surveys  
✅ **Hybrid approach** - Best of both worlds  

### Medium-term (Migration)
1. **Import campaign data to database**
   - Create migration to import JSON → database
   - Populate `campaigns`, `campaign_landing_pages`, `content` tables

2. **Update frontend to prefer API**
   - Change `campaign-api.ts` to call API first
   - Keep JSON as fallback during transition

3. **Admin interface for content**
   - Build UI to edit campaigns in database
   - Replace JSON file editing

### Long-term (Full Database)
1. **Remove JSON files** (or keep as backup)
2. **All content in database**
3. **Dynamic content generation**
4. **Version control via database**
5. **A/B testing capabilities**

---

## Database Tables Summary

### Content-Related Tables
- ✅ `campaigns` - Campaign definitions
- ✅ `campaign_landing_pages` - Landing page configs
- ✅ `content` - Content items (slides, articles)
- ✅ `content_views` - View tracking
- ✅ `content_templates` - Content templates
- ✅ `presentation_templates` - Presentation templates
- ✅ `generated_presentations` - Cached presentations
- ✅ `knowledge_base` - Knowledge articles/FAQs
- ✅ `campaign_emails` - Email templates

### Related Tables
- ✅ `campaign_sends` - Send history
- ✅ `campaign_timelines` - Automation timelines
- ✅ `campaign_timeline_actions` - Timeline actions
- ✅ `interactions` - User interactions
- ✅ `analytics_events` - Analytics tracking

---

## Answer to Your Question

**Q: Is Learning Center content and pages stored in the database?**

**A: Partially - Hybrid Approach**

### Currently in Database:
✅ **Knowledge Base** (`knowledge_base` table)  
✅ **FAQs** (`knowledge_base` table)  
✅ **Surveys** (`survey_sections`, `survey_questions` tables)  
✅ **Database infrastructure** for campaigns/content (tables exist)

### Currently in JSON Files:
✅ **Campaign presentations** (`public/campaigns/*.json`)  
✅ **Landing page configs** (in JSON files)  
✅ **Slide content** (in JSON files)  
✅ **Article content** (in JSON files)  

### Migration Status:
⚠️ **Database tables exist** but are not populated with campaign data  
⚠️ **Frontend loads from JSON** but can fall back to API  
⚠️ **Backend API ready** to serve from database  

**Recommendation:** The infrastructure is ready for database storage. You can migrate JSON content to the database when ready, or continue using the hybrid approach.

---

**Last Updated:** January 2026  
**Status:** Hybrid storage (JSON + Database infrastructure ready)

