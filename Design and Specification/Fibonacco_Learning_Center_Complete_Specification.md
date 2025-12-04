# FIBONACCO LEARNING CENTER & LANDING PAGES
## Complete Project Specification & Implementation Plan

**Version:** 1.0
**Date:** December 2, 2025
**Status:** Technical Specification

---

# EXECUTIVE SUMMARY

## What We're Building

A **JSON-driven, AI-enhanced presentation system** that serves as both a Learning Center and personalized Landing Page platform for Fibonacco. The system combines:

1. **Pre-recorded presentations** (90%) - Professional, polished, consistent
2. **Live AI layer** (10%) - Contextual, adaptive, learning

The presentation is the **hook**. The AI is the **closer**.

## Why This Approach

| Traditional Approach | Fibonacco Approach |
|---------------------|-------------------|
| Static landing pages | Dynamic, personalized presentations |
| Generic sales videos | AI-narrated, customer-specific content |
| One-size-fits-all | Industry + customer data merged at runtime |
| No interaction | Live AI available during presentation |
| No learning | Every conversation improves the system |

## Key Innovation

**The AI doesn't just answer questions - it asks intelligent questions, captures data, and generates FAQs in real-time.** Every customer interaction makes the system smarter for that specific business.

---

# PART 1: SYSTEM ARCHITECTURE

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FIBONACCO PRESENTATION PLATFORM                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                    PRESENTATION LAYER                           │  │
│   │                    (90% Pre-recorded)                           │  │
│   │                                                                 │  │
│   │   • Slides with pre-generated audio                             │  │
│   │   • Scripted narrative flow                                     │  │
│   │   • Professional, polished, consistent                          │  │
│   │   • Customer name/business injected dynamically                 │  │
│   │   • Plays like a video but is lightweight JSON + audio          │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                              │                                         │
│                              ▼                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                    LIVE AI LAYER                                │  │
│   │                    (10% Dynamic)                                │  │
│   │                                                                 │  │
│   │   • AI available for questions anytime (chat or voice)          │  │
│   │   • AI has FULL CONTEXT:                                        │  │
│   │     - Product knowledge (Fibonacco services)                    │  │
│   │     - Industry knowledge (restaurant, plumber, etc.)            │  │
│   │     - Customer data (hours, services, challenges, goals)        │  │
│   │   • AI can ASK intelligent questions to fill data gaps          │  │
│   │   • AI creates FAQ entries from conversations automatically     │  │
│   │   • Every interaction improves customer-specific knowledge      │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REQUEST FLOW                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   User visits: fibonacco.com/demo/tonys-pizzeria                        │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │   1. ROUTE PARSING                                              │  │
│   │      └─▶ Extract: customerId = "tonys-pizzeria"                 │  │
│   │      └─▶ Extract: templateId = "ai-intro" (default)             │  │
│   │                                                                 │  │
│   │   2. DATA LOADING (parallel)                                    │  │
│   │      └─▶ Load presentation template (S3/CDN - cached)           │  │
│   │      └─▶ Load customer data (Database)                          │  │
│   │      └─▶ Load industry data (Database - cached)                 │  │
│   │      └─▶ Load product data (Database - cached)                  │  │
│   │                                                                 │  │
│   │   3. PRESENTATION ASSEMBLY                                      │  │
│   │      └─▶ Pre-recorded slides load from CDN                      │  │
│   │      └─▶ Customer name/business injected into display           │  │
│   │      └─▶ AI context assembled with all data layers              │  │
│   │                                                                 │  │
│   │   4. PLAYER INITIALIZATION                                      │  │
│   │      └─▶ Presentation player renders                            │  │
│   │      └─▶ AI chat available (dormant until activated)            │  │
│   │      └─▶ Audio begins streaming from CDN                        │  │
│   │                                                                 │  │
│   │   5. RUNTIME                                                    │  │
│   │      └─▶ User watches presentation                              │  │
│   │      └─▶ User can interrupt anytime to ask questions            │  │
│   │      └─▶ AI responds with full context                          │  │
│   │      └─▶ AI captures new data, generates FAQs                   │  │
│   │      └─▶ Presentation resumes or pivots based on interest       │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Three-Layer Data Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PRESENTATION COMPOSITION                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                  │
│   │  TEMPLATE   │ + │  INDUSTRY   │ + │  CUSTOMER   │ = PRESENTATION   │
│   │   (Base)    │   │  (Vertical) │   │  (Specific) │                  │
│   └─────────────┘   └─────────────┘   └─────────────┘                  │
│                                                                         │
│   TEMPLATE LAYER                                                        │
│   • Slide structure (which components, what order)                      │
│   • Pre-recorded audio (professional narration)                         │
│   • Visual design (theme, animations)                                   │
│   • Narrative flow (hook → problem → solution → close)                 │
│   • CTA framework                                                       │
│                                                                         │
│   INDUSTRY LAYER                                                        │
│   • Pain points specific to vertical                                    │
│   • Solutions framed for industry                                       │
│   • Industry-specific testimonials                                      │
│   • Relevant statistics                                                 │
│   • Terminology mapping (customer→guest, appointment→reservation)       │
│   • Common objections and responses                                     │
│   • Compliance notes                                                    │
│                                                                         │
│   CUSTOMER LAYER                                                        │
│   • Business name, owner name                                           │
│   • Location, hours, services                                           │
│   • Current challenges and goals                                        │
│   • Existing tech stack (POS, social, etc.)                            │
│   • Competitors                                                         │
│   • Customer-specific FAQs (learned over time)                         │
│   • Unknown data (gaps AI should fill)                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# PART 2: FILE STORAGE STRUCTURE

## S3/CDN Organization

```
s3://fibonacco-presentations/
│
├── player/
│   ├── FibonaccoPlayer.js              # Universal player component
│   ├── FibonaccoPlayer.css             # Player styles
│   └── components/                      # Slide components
│       ├── HeroSlide.js
│       ├── ProblemSlide.js
│       ├── SolutionSlide.js
│       ├── ComparisonSlide.js
│       ├── StatsSlide.js
│       ├── TestimonialSlide.js
│       ├── ProcessSlide.js
│       ├── PricingSlide.js
│       └── CTASlide.js
│
├── templates/
│   │
│   ├── ai-employee-intro/
│   │   ├── template.json               # Slide structure definition
│   │   └── audio/
│   │       ├── slide-01-intro.mp3
│   │       ├── slide-02-problems.mp3
│   │       ├── slide-03-solutions.mp3
│   │       ├── slide-04-comparison.mp3
│   │       ├── slide-05-stats.mp3
│   │       ├── slide-06-testimonial.mp3
│   │       ├── slide-07-process.mp3
│   │       ├── slide-08-pricing.mp3
│   │       └── slide-09-cta.mp3
│   │
│   ├── pricing-overview/
│   │   ├── template.json
│   │   └── audio/
│   │       └── ...
│   │
│   ├── how-it-works/
│   │   ├── template.json
│   │   └── audio/
│   │       └── ...
│   │
│   └── [additional-templates]/
│       └── ...
│
├── industry-content/
│   ├── restaurant.json
│   ├── plumber.json
│   ├── hvac.json
│   ├── salon.json
│   ├── dental.json
│   ├── real-estate.json
│   └── [50+ industries].json
│
└── assets/
    ├── presenters/
    │   ├── sarah-avatar.png
    │   ├── marcus-avatar.png
    │   ├── lisa-avatar.png
    │   └── emma-avatar.png
    ├── icons/
    │   └── [icon assets]
    └── backgrounds/
        └── [background patterns]
```

---

# PART 3: DATABASE SCHEMA

## Complete PostgreSQL Schema

```sql
-- ============================================================================
-- FIBONACCO LEARNING CENTER DATABASE SCHEMA
-- ============================================================================
-- Version: 1.0
-- Database: PostgreSQL 15+
-- Description: Complete schema for presentation system with AI learning
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- ============================================================================
-- LAYER 1: PRODUCT KNOWLEDGE (Fibonacco's offerings)
-- ============================================================================

CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    tagline VARCHAR(255),
    
    -- Pricing
    pricing JSONB NOT NULL,
    -- Example: {"monthly": 49, "annual": 470, "currency": "USD"}
    
    -- What it does
    capabilities JSONB NOT NULL,
    -- Example: ["Answer calls 24/7", "Take reservations", "Handle FAQs"]
    
    -- What it connects to
    integrations JSONB,
    -- Example: ["Square", "Toast", "Yelp", "Google Business"]
    
    -- AI persona
    persona JSONB,
    -- Example: {"name": "Lisa", "role": "AI Receptionist", "personality": "Friendly, professional"}
    
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_bundles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    product_ids TEXT[] NOT NULL,
    
    -- Bundle pricing
    pricing JSONB NOT NULL,
    savings VARCHAR(50),  -- "Save $48/month"
    
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(50) REFERENCES products(id),
    
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    short_answer VARCHAR(255),  -- For quick responses
    
    category VARCHAR(50),
    keywords TEXT[],
    
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_objections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(50) REFERENCES products(id),
    
    objection TEXT NOT NULL,
    response TEXT NOT NULL,
    
    -- When to use this response
    trigger_phrases TEXT[],
    
    category VARCHAR(50),  -- "pricing", "trust", "timing", "competition"
    severity VARCHAR(20),  -- "soft", "medium", "hard"
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- LAYER 2: INDUSTRY KNOWLEDGE (Vertical-specific content)
-- ============================================================================

CREATE TABLE industries (
    id VARCHAR(50) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    
    -- Industry-specific pain points
    pain_points JSONB NOT NULL,
    -- Example: [{"icon": "UserX", "title": "No-Show Employees", "description": "..."}]
    
    -- Common objections in this industry
    common_objections JSONB,
    -- Example: [{"objection": "I'm too small", "response": "..."}]
    
    -- Which integrations matter most
    relevant_integrations TEXT[],
    -- Example: ["Toast", "OpenTable", "Yelp", "DoorDash"]
    
    -- Language mapping
    terminology_map JSONB,
    -- Example: {"customer": "guest", "appointment": "reservation", "service": "dining experience"}
    
    -- Legal/compliance notes
    compliance_notes TEXT,
    
    -- Success metrics for this industry
    typical_results JSONB,
    -- Example: {"calls_answered": "100%", "time_saved": "15+ hours/week"}
    
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE industry_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_id VARCHAR(50) REFERENCES industries(id),
    
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    short_answer VARCHAR(255),
    
    category VARCHAR(50),
    keywords TEXT[],
    
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE industry_testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_id VARCHAR(50) REFERENCES industries(id),
    
    quote TEXT NOT NULL,
    
    -- Customer info
    customer_name VARCHAR(100) NOT NULL,
    customer_title VARCHAR(100),
    company_name VARCHAR(255),
    location VARCHAR(100),
    avatar_url VARCHAR(500),
    
    -- Results achieved
    metric_value VARCHAR(50),  -- "2X", "340%", "$44K"
    metric_label VARCHAR(100), -- "Bookings Increase", "More Visibility"
    
    -- For filtering/selection
    use_cases TEXT[],  -- ["staffing", "marketing", "operations"]
    
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE industry_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_id VARCHAR(50) REFERENCES industries(id),
    
    icon VARCHAR(50),
    value VARCHAR(50) NOT NULL,
    prefix VARCHAR(10),
    suffix VARCHAR(10),
    label VARCHAR(100) NOT NULL,
    
    source VARCHAR(255),  -- Where this stat comes from
    source_date DATE,
    
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- LAYER 3: CUSTOMER DATA (Business-specific information)
-- ============================================================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identifiers
    slug VARCHAR(100) UNIQUE NOT NULL,  -- URL-friendly identifier
    external_id VARCHAR(100),  -- ID from CRM or other system
    
    -- Basic info
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    industry_id VARCHAR(50) REFERENCES industries(id),
    sub_category VARCHAR(100),  -- "pizza", "fine-dining", "fast-casual"
    
    -- Contact
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Location
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    timezone VARCHAR(50),
    
    -- ========================================
    -- KNOWN DATA (confirmed information)
    -- ========================================
    
    hours JSONB,
    -- Example: {"mon": "11am-9pm", "tue": "11am-9pm", ..., "sun": "12pm-8pm"}
    
    services JSONB,
    -- Example: ["Dine-in", "Takeout", "Delivery", "Catering"]
    
    social_media JSONB,
    -- Example: {"facebook": "url", "instagram": "url", "twitter": null}
    
    pos_system VARCHAR(100),
    current_integrations TEXT[],
    
    -- Ratings
    google_rating DECIMAL(2,1),
    google_review_count INT,
    yelp_rating DECIMAL(2,1),
    yelp_review_count INT,
    
    -- Business intelligence
    established_year INT,
    employee_count INT,
    annual_revenue_range VARCHAR(50),  -- "<100K", "100K-500K", "500K-1M", "1M+"
    
    challenges TEXT[],
    goals TEXT[],
    competitors TEXT[],
    
    unique_selling_points TEXT[],
    
    -- ========================================
    -- UNKNOWN DATA (to be discovered by AI)
    -- ========================================
    
    unknown_fields JSONB DEFAULT '{
        "catering": null,
        "catering_minimum": null,
        "catering_menu": null,
        "special_events": null,
        "private_rooms": null,
        "event_hours": null,
        "delivery_radius": null,
        "delivery_minimum": null,
        "parking": null,
        "accessibility": null,
        "payment_methods": null,
        "reservation_policy": null,
        "cancellation_policy": null,
        "dress_code": null,
        "kids_menu": null,
        "dietary_options": null,
        "happy_hour": null,
        "live_entertainment": null,
        "wifi": null,
        "outdoor_seating": null,
        "decision_maker": null,
        "budget_range": null,
        "current_pain_severity": null,
        "timeline_to_decision": null
    }'::jsonb,
    
    -- ========================================
    -- FIBONACCO RELATIONSHIP
    -- ========================================
    
    lead_source VARCHAR(100),
    lead_score INT DEFAULT 0,
    subscription_tier VARCHAR(50),
    
    first_contact_at TIMESTAMP,
    onboarded_at TIMESTAMP,
    
    assigned_rep VARCHAR(100),
    notes TEXT,
    tags TEXT[],
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Customer-specific FAQs (learned from conversations)
CREATE TABLE customer_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    short_answer VARCHAR(255),
    
    category VARCHAR(50),
    keywords TEXT[],
    
    -- Source tracking (how we learned this)
    source VARCHAR(50) NOT NULL,  -- 'owner_conversation', 'website_scrape', 'manual', 'inferred'
    confidence VARCHAR(20) NOT NULL,  -- 'confirmed', 'likely', 'needs_verification'
    source_conversation_id UUID,  -- Link to conversation where this was learned
    
    -- Verification
    verified_by_owner BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    
    -- For AI handling
    should_ask_clarification BOOLEAN DEFAULT FALSE,
    clarification_question TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PRESENTATION SYSTEM
-- ============================================================================

CREATE TABLE presentation_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- What this template is for
    purpose VARCHAR(100),  -- 'intro', 'pricing', 'how-it-works', 'case-study'
    target_audience VARCHAR(255),
    
    -- Structure
    slides JSONB NOT NULL,
    -- Example: [{"id": 1, "component": "HeroSlide", "contentTemplate": "hero-hook"}, ...]
    
    -- Pre-recorded audio location
    audio_base_url VARCHAR(500),
    audio_files JSONB,
    -- Example: {"slide-01": "intro.mp3", "slide-02": "problems.mp3", ...}
    
    -- Dynamic injection points
    injection_points JSONB,
    -- Example: {"ownerName": "slide-01", "businessName": ["slide-01", "slide-09"]}
    
    -- Visual
    default_theme JSONB,
    default_presenter_id VARCHAR(50),
    
    -- Metadata
    estimated_duration INT,  -- seconds
    slide_count INT,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE presenters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    
    avatar_url VARCHAR(500),
    
    -- Voice settings
    voice_provider VARCHAR(50),  -- 'aws-polly', 'elevenlabs', 'google'
    voice_id VARCHAR(100),
    voice_settings JSONB,  -- {"rate": "medium", "pitch": "medium"}
    
    -- AI personality
    personality TEXT,
    communication_style TEXT,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cache of generated presentations
CREATE TABLE generated_presentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    customer_id UUID REFERENCES customers(id),
    template_id VARCHAR(50) REFERENCES presentation_templates(id),
    
    -- The assembled presentation
    presentation_json JSONB NOT NULL,
    
    -- Audio status
    audio_base_url VARCHAR(500),
    audio_generated BOOLEAN DEFAULT FALSE,
    audio_generated_at TIMESTAMP,
    
    -- Cache management
    input_hash VARCHAR(64),  -- Hash of customer+template+industry data
    expires_at TIMESTAMP,
    
    -- Analytics
    view_count INT DEFAULT 0,
    avg_completion_rate DECIMAL(5,2),
    last_viewed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- CONVERSATION & AI LEARNING
-- ============================================================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    customer_id UUID REFERENCES customers(id),
    session_id VARCHAR(100) NOT NULL,
    
    -- Context
    entry_point VARCHAR(100),  -- 'presentation', 'chat_widget', 'phone', 'sms'
    template_id VARCHAR(50),
    slide_at_start INT,  -- Which slide they were on when conversation started
    
    -- Participants
    presenter_id VARCHAR(50) REFERENCES presenters(id),
    human_rep_id VARCHAR(100),  -- If a human took over
    
    -- Full conversation log
    messages JSONB NOT NULL DEFAULT '[]',
    -- Example: [{"role": "user", "content": "...", "timestamp": "..."}, ...]
    
    -- AI analysis
    topics_discussed TEXT[],
    questions_asked JSONB,
    objections_raised JSONB,
    sentiment_trajectory JSONB,  -- How sentiment changed during convo
    
    -- Data collected
    new_data_collected JSONB,  -- What we learned about the customer
    faqs_generated UUID[],  -- References to customer_faqs created
    
    -- Outcome
    outcome VARCHAR(50),  -- 'signup', 'demo_scheduled', 'pricing_sent', 'objection', 'left', 'human_handoff'
    outcome_details TEXT,
    
    -- Follow-up
    followup_needed BOOLEAN DEFAULT FALSE,
    followup_scheduled_at TIMESTAMP,
    followup_notes TEXT,
    
    -- Duration
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    duration_seconds INT,
    
    -- Metadata
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Individual messages (for detailed analysis)
CREATE TABLE conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    
    role VARCHAR(20) NOT NULL,  -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    
    -- AI metadata
    tokens_used INT,
    model_used VARCHAR(50),
    response_time_ms INT,
    
    -- Actions taken
    actions_triggered JSONB,
    -- Example: {"updateCustomerData": {...}, "createFaq": {...}}
    
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Questions AI should ask (generated based on unknown data gaps)
CREATE TABLE pending_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    
    -- What this question answers
    field_to_populate VARCHAR(100) NOT NULL,
    table_to_update VARCHAR(50) DEFAULT 'customers',
    
    -- The question
    question TEXT NOT NULL,
    context TEXT,  -- Why we're asking / when to ask
    alternative_phrasings TEXT[],  -- Other ways to ask
    
    -- Priority (when to ask)
    priority INT DEFAULT 5,  -- 1-10, higher = more important
    ask_during TEXT[],  -- ['onboarding', 'pricing_discussion', 'any']
    
    -- Status
    asked BOOLEAN DEFAULT FALSE,
    asked_at TIMESTAMP,
    asked_in_conversation_id UUID REFERENCES conversations(id),
    
    answered BOOLEAN DEFAULT FALSE,
    answer TEXT,
    answered_at TIMESTAMP,
    
    -- If answer needs verification
    needs_verification BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS
-- ============================================================================

CREATE TABLE presentation_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- What was viewed
    customer_id UUID REFERENCES customers(id),
    template_id VARCHAR(50) REFERENCES presentation_templates(id),
    generated_presentation_id UUID REFERENCES generated_presentations(id),
    
    session_id VARCHAR(100) NOT NULL,
    
    -- Viewing data
    slides_viewed INT[],
    slides_completed INT[],
    slide_durations JSONB,  -- {"1": 45, "2": 30, ...} seconds per slide
    
    -- Engagement
    total_duration INT,  -- seconds
    completion_rate DECIMAL(5,2),
    
    -- Interactions
    chat_initiated BOOLEAN DEFAULT FALSE,
    chat_messages_count INT DEFAULT 0,
    questions_asked TEXT[],
    
    -- Outcome
    cta_clicked VARCHAR(50),
    cta_clicked_at TIMESTAMP,
    
    -- Source
    referrer VARCHAR(500),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Device
    device_type VARCHAR(20),
    browser VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Customer lookups
CREATE INDEX idx_customers_slug ON customers(slug);
CREATE INDEX idx_customers_industry ON customers(industry_id);
CREATE INDEX idx_customers_city_state ON customers(city, state);
CREATE INDEX idx_customers_subscription ON customers(subscription_tier);

-- FAQ searches
CREATE INDEX idx_product_faqs_keywords ON product_faqs USING GIN(keywords);
CREATE INDEX idx_industry_faqs_keywords ON industry_faqs USING GIN(keywords);
CREATE INDEX idx_customer_faqs_keywords ON customer_faqs USING GIN(keywords);
CREATE INDEX idx_customer_faqs_customer ON customer_faqs(customer_id);

-- Full text search on FAQs
CREATE INDEX idx_product_faqs_search ON product_faqs 
    USING GIN(to_tsvector('english', question || ' ' || answer));
CREATE INDEX idx_industry_faqs_search ON industry_faqs 
    USING GIN(to_tsvector('english', question || ' ' || answer));
CREATE INDEX idx_customer_faqs_search ON customer_faqs 
    USING GIN(to_tsvector('english', question || ' ' || answer));

-- Conversations
CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_outcome ON conversations(outcome);
CREATE INDEX idx_conversations_date ON conversations(created_at);

-- Pending questions
CREATE INDEX idx_pending_questions_customer ON pending_questions(customer_id);
CREATE INDEX idx_pending_questions_priority ON pending_questions(priority DESC) 
    WHERE asked = FALSE;

-- Analytics
CREATE INDEX idx_analytics_customer ON presentation_analytics(customer_id);
CREATE INDEX idx_analytics_template ON presentation_analytics(template_id);
CREATE INDEX idx_analytics_date ON presentation_analytics(created_at);

-- Generated presentations cache
CREATE INDEX idx_generated_presentations_hash ON generated_presentations(input_hash);
CREATE INDEX idx_generated_presentations_customer ON generated_presentations(customer_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customer_faqs_updated_at BEFORE UPDATE ON customer_faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_industries_updated_at BEFORE UPDATE ON industries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to search all FAQs for a customer
CREATE OR REPLACE FUNCTION search_faqs(
    p_customer_id UUID,
    p_query TEXT,
    p_limit INT DEFAULT 5
)
RETURNS TABLE (
    source VARCHAR(20),
    id UUID,
    question TEXT,
    answer TEXT,
    relevance REAL
) AS $$
DECLARE
    v_industry_id VARCHAR(50);
BEGIN
    -- Get customer's industry
    SELECT industry_id INTO v_industry_id FROM customers WHERE id = p_customer_id;
    
    RETURN QUERY
    -- Customer-specific FAQs (highest priority)
    SELECT 
        'customer'::VARCHAR(20) as source,
        cf.id,
        cf.question,
        cf.answer,
        ts_rank(to_tsvector('english', cf.question || ' ' || cf.answer), 
                plainto_tsquery('english', p_query)) * 3 as relevance
    FROM customer_faqs cf
    WHERE cf.customer_id = p_customer_id
        AND cf.is_active = TRUE
        AND to_tsvector('english', cf.question || ' ' || cf.answer) @@ plainto_tsquery('english', p_query)
    
    UNION ALL
    
    -- Industry FAQs
    SELECT 
        'industry'::VARCHAR(20) as source,
        if.id,
        if.question,
        if.answer,
        ts_rank(to_tsvector('english', if.question || ' ' || if.answer), 
                plainto_tsquery('english', p_query)) * 2 as relevance
    FROM industry_faqs if
    WHERE if.industry_id = v_industry_id
        AND if.is_active = TRUE
        AND to_tsvector('english', if.question || ' ' || if.answer) @@ plainto_tsquery('english', p_query)
    
    UNION ALL
    
    -- Product FAQs
    SELECT 
        'product'::VARCHAR(20) as source,
        pf.id,
        pf.question,
        pf.answer,
        ts_rank(to_tsvector('english', pf.question || ' ' || pf.answer), 
                plainto_tsquery('english', p_query)) as relevance
    FROM product_faqs pf
    WHERE pf.is_active = TRUE
        AND to_tsvector('english', pf.question || ' ' || pf.answer) @@ plainto_tsquery('english', p_query)
    
    ORDER BY relevance DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

---

# PART 4: JSON SCHEMAS

## Presentation Template JSON

```json
{
  "$schema": "https://fibonacco.com/schemas/presentation-template-v1.json",
  
  "id": "ai-employee-intro",
  "name": "AI Employee Introduction",
  "description": "Standard introduction to Fibonacco AI employees",
  "purpose": "intro",
  "targetAudience": "SMB owners unfamiliar with AI solutions",
  
  "audio": {
    "baseUrl": "https://cdn.fibonacco.com/templates/ai-employee-intro/audio/",
    "format": "mp3",
    "totalDuration": 225
  },
  
  "theme": {
    "primary": "#2563eb",
    "secondary": "#7c3aed",
    "accent": "#10b981",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f8fafc"
  },
  
  "presenter": {
    "id": "sarah",
    "name": "Sarah",
    "role": "AI Account Manager"
  },
  
  "injectionPoints": {
    "ownerName": ["slide-01", "slide-09"],
    "businessName": ["slide-01", "slide-03", "slide-09"],
    "industry": ["slide-02"],
    "challenges": ["slide-02"],
    "goals": ["slide-03"]
  },
  
  "slides": [
    {
      "id": 1,
      "component": "HeroSlide",
      "audioFile": "slide-01-intro.mp3",
      "duration": 8,
      "content": {
        "badge": "For {{industry}} Owners",
        "headline": "What If You {{accentWord}} Had to Worry About {{primaryChallenge}} Again?",
        "accentWord": "Never",
        "subtext": "Meet your new AI employees",
        "icon": "{{industryIcon}}"
      },
      "narration": "Hi {{ownerName}}, I'm Sarah from Fibonacco. What if you never had to worry about {{primaryChallenge}} again? I know that sounds impossible for a {{industry}} owner, but stick with me for the next few minutes."
    },
    {
      "id": 2,
      "component": "ProblemSlide",
      "audioFile": "slide-02-problems.mp3",
      "duration": 15,
      "content": {
        "headline": "Sound Familiar?",
        "subheadline": "The daily struggles of {{industry}} ownership",
        "problems": "{{industryPainPoints}}"
      },
      "narration": "Let me guess what your week looks like. {{painPointNarration}}"
    },
    {
      "id": 3,
      "component": "SolutionSlide",
      "audioFile": "slide-03-solutions.mp3",
      "duration": 18,
      "content": {
        "headline": "Meet Your AI Team",
        "subheadline": "They work 24/7. They never quit. They cost $99/month.",
        "solutions": [
          {
            "icon": "Phone",
            "name": "Lisa",
            "title": "AI Receptionist",
            "description": "Answers every call, takes {{appointmentTerm}}s, handles inquiries. Never puts anyone on hold.",
            "color": "blue"
          },
          {
            "icon": "Share2",
            "name": "Marcus",
            "title": "AI Marketing Manager",
            "description": "Posts daily to social media, writes blog posts, responds to reviews automatically.",
            "color": "purple"
          },
          {
            "icon": "ClipboardList",
            "name": "Emma",
            "title": "AI Operations Manager",
            "description": "Manages your calendar, sends reminders, tracks tasks, keeps everything organized.",
            "color": "green"
          }
        ]
      },
      "narration": "Meet Lisa, your AI receptionist. She answers every single call for {{businessName}}, takes {{appointmentTerm}}s, and handles {{customerTerm}} inquiries - 24 hours a day, 7 days a week..."
    },
    {
      "id": 4,
      "component": "ComparisonSlide",
      "audioFile": "slide-04-comparison.mp3",
      "duration": 12,
      "content": {
        "headline": "The Real Cost Comparison",
        "leftColumn": {
          "title": "Traditional Employee",
          "style": "negative",
          "items": [
            "$45,000+ per year salary",
            "Training takes weeks",
            "Calls in sick",
            "Takes vacation",
            "Quits without notice",
            "Works 40 hours max"
          ]
        },
        "rightColumn": {
          "title": "AI Employee",
          "style": "positive",
          "items": [
            "$99/month ($1,188/year)",
            "Ready immediately",
            "Never sick",
            "No vacation needed",
            "Never quits",
            "Works 24/7/365"
          ]
        }
      },
      "narration": "Let's talk real numbers. A traditional employee costs you at least forty-five thousand dollars a year..."
    },
    {
      "id": 5,
      "component": "StatsSlide",
      "audioFile": "slide-05-stats.mp3",
      "duration": 10,
      "content": {
        "headline": "Results Our {{industry}} Clients See",
        "stats": "{{industryStats}}"
      },
      "narration": "Here's what our {{industry}} clients actually experience. {{statsNarration}}"
    },
    {
      "id": 6,
      "component": "TestimonialSlide",
      "audioFile": "slide-06-testimonial.mp3",
      "duration": 12,
      "content": "{{industryTestimonial}}",
      "narration": "Don't just take my word for it. Here's {{testimonialName}}, owner of {{testimonialCompany}}..."
    },
    {
      "id": 7,
      "component": "ProcessSlide",
      "audioFile": "slide-07-process.mp3",
      "duration": 12,
      "content": {
        "headline": "Getting Started Takes 10 Minutes",
        "steps": [
          {
            "number": 1,
            "title": "Sign Up",
            "description": "Create your account and select {{industry}} as your industry",
            "duration": "2 min"
          },
          {
            "number": 2,
            "title": "Connect",
            "description": "Link your phone, social accounts, and calendar",
            "duration": "5 min"
          },
          {
            "number": 3,
            "title": "Customize",
            "description": "AI learns your {{serviceTerm}}s, hours, and how you want calls handled",
            "duration": "3 min"
          },
          {
            "number": 4,
            "title": "Go Live",
            "description": "Your AI team starts working immediately",
            "duration": "Instant"
          }
        ]
      },
      "narration": "Getting started takes about ten minutes..."
    },
    {
      "id": 8,
      "component": "PricingSlide",
      "audioFile": "slide-08-pricing.mp3",
      "duration": 10,
      "content": {
        "headline": "Simple, Transparent Pricing",
        "plan": {
          "name": "{{industry}} Pro",
          "badge": "Most Popular",
          "price": "99",
          "period": "month",
          "comparePrice": "vs. $45,000/year for one employee",
          "features": [
            "AI Receptionist (Lisa) - unlimited calls",
            "AI Marketing Manager (Marcus) - daily posts",
            "AI Operations Manager (Emma) - full automation",
            "24/7 customer support",
            "No contracts - cancel anytime"
          ]
        },
        "cta": {
          "text": "Start Your Free Trial",
          "subtext": "No credit card required"
        },
        "guarantee": "30-Day Money Back Guarantee"
      },
      "narration": "Our pricing is simple. Ninety-nine dollars a month. That's it..."
    },
    {
      "id": 9,
      "component": "CTASlide",
      "audioFile": "slide-09-cta.mp3",
      "duration": 8,
      "content": {
        "headline": "Ready to Transform {{businessName}}?",
        "subtext": "Your AI team is ready to start today.",
        "primaryButton": {
          "text": "Start Free Trial",
          "url": "/signup?industry={{industry}}&customer={{customerId}}"
        },
        "secondaryButton": {
          "text": "Schedule a Demo",
          "url": "/demo?customer={{customerId}}"
        },
        "urgency": "Limited: We're onboarding 50 {{industry}}s this month"
      },
      "narration": "So {{ownerName}}, are you ready to transform {{businessName}}? Your AI team - Lisa, Marcus, and Emma - are ready to start working for you today..."
    }
  ]
}
```

## Industry Content JSON

```json
{
  "id": "restaurant",
  "displayName": "Restaurant",
  "icon": "Utensils",
  
  "painPoints": [
    {
      "icon": "UserX",
      "title": "No-Show Employees",
      "description": "Staff calling in sick on your busiest nights",
      "severity": "high"
    },
    {
      "icon": "PhoneMissed",
      "title": "Missed Reservations",
      "description": "Phone rings while everyone's slammed",
      "severity": "high"
    },
    {
      "icon": "Clock",
      "title": "No Time for Marketing",
      "description": "Social media? Website updates? When?",
      "severity": "medium"
    },
    {
      "icon": "DollarSign",
      "title": "Rising Labor Costs",
      "description": "$15/hour minimum and still can't find help",
      "severity": "high"
    }
  ],
  
  "terminology": {
    "customer": "guest",
    "customers": "guests",
    "appointment": "reservation",
    "appointments": "reservations",
    "service": "dining experience",
    "services": "menu items"
  },
  
  "relevantIntegrations": [
    "Toast",
    "Square",
    "Clover",
    "OpenTable",
    "Resy",
    "Yelp",
    "Google Business",
    "DoorDash",
    "UberEats",
    "GrubHub"
  ],
  
  "stats": [
    {
      "icon": "TrendingUp",
      "value": "340",
      "suffix": "%",
      "label": "More Online Visibility"
    },
    {
      "icon": "Phone",
      "value": "100",
      "suffix": "%",
      "label": "Calls Answered"
    },
    {
      "icon": "Clock",
      "value": "15",
      "suffix": "+",
      "label": "Hours Saved Weekly"
    },
    {
      "icon": "DollarSign",
      "value": "44",
      "prefix": "$",
      "suffix": "K",
      "label": "Saved vs. Employee"
    }
  ],
  
  "commonObjections": [
    {
      "objection": "My customers want to talk to a real person",
      "response": "That's completely understandable. Lisa is trained to sound natural and handle 95% of calls perfectly. For complex situations, she seamlessly transfers to you or your staff. Most customers can't tell the difference - and they love getting their questions answered immediately instead of waiting on hold."
    },
    {
      "objection": "I'm too small for this",
      "response": "Actually, smaller restaurants benefit the most. You don't have a dedicated receptionist or marketing person - but now you can, for less than the cost of a single dinner service. It's like having a full team without the overhead."
    },
    {
      "objection": "I don't trust AI with my customers",
      "response": "I hear you. That's why we offer a 30-day trial. You can listen to every call Lisa handles and see exactly how she represents your restaurant. Most owners are surprised at how well she understands their business within the first week."
    }
  ],
  
  "complianceNotes": "Food service licensing varies by state. Health department regulations may affect how certain information is communicated.",
  
  "successMetrics": {
    "avgCallsHandled": "200+ per month",
    "avgTimeToROI": "2 weeks",
    "avgReviewIncrease": "4.2 → 4.6 stars",
    "avgReservationIncrease": "35%"
  }
}
```

## Customer Data JSON

```json
{
  "id": "cust-12345",
  "slug": "tonys-pizzeria",
  "businessName": "Tony's Pizzeria",
  "ownerName": "Tony Russo",
  "industryId": "restaurant",
  "subCategory": "pizza",
  
  "contact": {
    "phone": "(727) 555-1234",
    "email": "tony@tonyspizzeria.com",
    "website": "tonyspizzeria.com"
  },
  
  "location": {
    "address": "123 Main Street",
    "city": "Clearwater",
    "state": "FL",
    "zip": "33756",
    "timezone": "America/New_York"
  },
  
  "knownData": {
    "hours": {
      "mon": "11am-9pm",
      "tue": "11am-9pm",
      "wed": "11am-9pm",
      "thu": "11am-9pm",
      "fri": "11am-10pm",
      "sat": "11am-10pm",
      "sun": "12pm-8pm"
    },
    "services": ["Dine-in", "Takeout", "Delivery"],
    "posSystem": "Square",
    "socialMedia": {
      "facebook": "facebook.com/tonyspizzeria",
      "instagram": null,
      "twitter": null
    },
    "googleRating": 4.2,
    "googleReviewCount": 127,
    "yelpRating": 4.0,
    "yelpReviewCount": 89,
    "established": 2015,
    "employeeCount": 8
  },
  
  "challenges": [
    "Can't find reliable staff",
    "Missing calls during lunch and dinner rush",
    "No time for social media",
    "Competitors showing up higher in Google"
  ],
  
  "goals": [
    "Increase weekend reservations",
    "Build catering business",
    "Get more Google reviews",
    "Rank higher in local search"
  ],
  
  "competitors": ["Domino's", "Pizza Hut", "Mario's Italian Kitchen"],
  
  "uniqueSellingPoints": [
    "Family recipes from Naples",
    "Wood-fired oven",
    "Local ingredients"
  ],
  
  "unknownData": {
    "catering": null,
    "cateringMinimum": null,
    "cateringMenu": null,
    "specialEvents": null,
    "privateRooms": null,
    "deliveryRadius": null,
    "deliveryMinimum": null,
    "happyHour": null,
    "liveEntertainment": null,
    "outdoorSeating": null,
    "parking": null,
    "paymentMethods": null,
    "reservationPolicy": null,
    "cancellationPolicy": null,
    "dressCode": null,
    "kidsMenu": null,
    "dietaryOptions": null
  },
  
  "fibonaccoRelationship": {
    "leadSource": "google_ads",
    "leadScore": 72,
    "firstContact": "2025-11-28T14:30:00Z",
    "assignedRep": null,
    "subscriptionTier": null
  }
}
```

---

# PART 5: AI SYSTEM

## AI Context Assembly

```javascript
// Build complete AI context for a customer conversation
async function buildAIContext(customerId) {
  // Load all data layers in parallel
  const [customer, industry, products, productFaqs, industryFaqs, customerFaqs, pendingQuestions] = 
    await Promise.all([
      db.customers.findById(customerId),
      db.industries.findById(customer.industry_id),
      db.products.findAll({ where: { is_active: true } }),
      db.productFaqs.findAll({ where: { is_active: true } }),
      db.industryFaqs.findAll({ where: { industry_id: customer.industry_id, is_active: true } }),
      db.customerFaqs.findAll({ where: { customer_id: customerId, is_active: true } }),
      db.pendingQuestions.findAll({ where: { customer_id: customerId, asked: false }, orderBy: 'priority DESC' })
    ]);

  return {
    // Layer 1: Product knowledge
    product: {
      company: "Fibonacco",
      tagline: "The World's First AI Employment Agency",
      services: formatProducts(products),
      faqs: productFaqs,
      integrations: getAllIntegrations(products)
    },
    
    // Layer 2: Industry knowledge
    industry: {
      id: industry.id,
      name: industry.display_name,
      painPoints: industry.pain_points,
      terminology: industry.terminology,
      objections: industry.common_objections,
      relevantIntegrations: industry.relevant_integrations,
      faqs: industryFaqs,
      compliance: industry.compliance_notes
    },
    
    // Layer 3: Customer knowledge
    customer: {
      id: customer.id,
      businessName: customer.business_name,
      ownerName: customer.owner_name,
      
      // What we know
      known: {
        hours: customer.hours,
        services: customer.services,
        location: `${customer.city}, ${customer.state}`,
        phone: customer.phone,
        website: customer.website,
        posSystem: customer.pos_system,
        socialMedia: customer.social_media,
        ratings: {
          google: customer.google_rating,
          yelp: customer.yelp_rating
        },
        challenges: customer.challenges,
        goals: customer.goals,
        competitors: customer.competitors,
        uniqueSellingPoints: customer.unique_selling_points
      },
      
      // What we don't know (gaps to fill)
      unknown: customer.unknown_fields,
      
      // Customer-specific FAQs
      faqs: customerFaqs,
      
      // Questions to ask when appropriate
      questionsToAsk: pendingQuestions.map(q => ({
        field: q.field_to_populate,
        question: q.question,
        context: q.context,
        priority: q.priority
      }))
    }
  };
}
```

## AI System Prompt

```javascript
function buildSystemPrompt(context, presenter, currentSlide) {
  return `
You are ${presenter.name}, an AI ${presenter.role} for Fibonacco. You're currently in a presentation with ${context.customer.ownerName} from ${context.customer.businessName}.

=================
YOUR ROLE
=================
- You're friendly, professional, and genuinely helpful
- You're here to help ${context.customer.ownerName} understand how Fibonacco can help their business
- You can answer questions, address concerns, and learn about their specific needs
- You're NOT pushy - you're consultative
- You can pause the presentation anytime to have a conversation
- Your goal is to be helpful first, close second

=================
FIBONACCO PRODUCTS
=================
${JSON.stringify(context.product.services, null, 2)}

Integrations we support: ${context.product.integrations.join(', ')}

=================
${context.industry.name.toUpperCase()} INDUSTRY KNOWLEDGE
=================
Common pain points:
${context.industry.painPoints.map(p => `- ${p.title}: ${p.description}`).join('\n')}

Terminology to use:
${Object.entries(context.industry.terminology).map(([k, v]) => `- Use "${v}" instead of "${k}"`).join('\n')}

Common objections and responses:
${context.industry.objections.map(o => `
OBJECTION: "${o.objection}"
RESPONSE: "${o.response}"
`).join('\n')}

=================
${context.customer.businessName.toUpperCase()} - WHAT WE KNOW
=================
Owner: ${context.customer.ownerName}
Location: ${context.customer.known.location}
Hours: ${JSON.stringify(context.customer.known.hours)}
Services: ${context.customer.known.services?.join(', ') || 'Unknown'}
POS System: ${context.customer.known.posSystem || 'Unknown'}
Website: ${context.customer.known.website || 'None listed'}

Their challenges:
${context.customer.known.challenges?.map(c => `- ${c}`).join('\n') || 'Not yet discussed'}

Their goals:
${context.customer.known.goals?.map(g => `- ${g}`).join('\n') || 'Not yet discussed'}

Their competitors:
${context.customer.known.competitors?.join(', ') || 'Not yet discussed'}

What makes them unique:
${context.customer.known.uniqueSellingPoints?.join(', ') || 'Not yet discussed'}

=================
WHAT WE DON'T KNOW YET
=================
These are gaps you should try to fill naturally during conversation:
${Object.entries(context.customer.unknown)
  .filter(([k, v]) => v === null)
  .map(([k, v]) => `- ${k}`)
  .join('\n')}

Priority questions to ask when appropriate:
${context.customer.questionsToAsk.slice(0, 5).map(q => `
- Field: ${q.field}
  Question: "${q.question}"
  When to ask: ${q.context}
`).join('\n')}

=================
CUSTOMER-SPECIFIC FAQs
=================
Things we've already learned about ${context.customer.businessName}:
${context.customer.faqs.map(f => `
Q: ${f.question}
A: ${f.answer}
`).join('\n') || 'None yet - this is a new customer'}

=================
YOUR GUIDELINES
=================

1. ANSWERING QUESTIONS
   - Use specific details from the knowledge above
   - Reference their actual business name, location, challenges
   - If asked about pricing: our AI Team bundle is $99/month
   - If asked about integrations: check if it's in our list
   - If you don't know something, say so honestly

2. ASKING SMART QUESTIONS
   - When natural, ask about things in the "unknown" list
   - Frame questions as helpful, not interrogative
   - Good: "I want to make sure Lisa handles your calls perfectly - do you ever get inquiries about catering?"
   - Bad: "Do you do catering? What's your minimum? Do you have a separate menu?"

3. DATA COLLECTION
   - When you learn something new, note it in your response
   - If they correct something we have wrong, acknowledge it
   - Always confirm important details before saving

4. FAQ GENERATION
   - When they tell you something their customers often ask, create an FAQ
   - When they clarify something about their business, create an FAQ
   - Format: { question: "...", answer: "...", category: "..." }

5. HANDLING OBJECTIONS
   - Don't be defensive - acknowledge, empathize, then address
   - Use the prepared responses as a starting point
   - Reference similar businesses when helpful

6. PRESENTATION CONTROL
   - If they ask a question, answer it fully
   - Offer to continue the presentation or explore their question deeper
   - If they're clearly interested in a topic, explore it

=================
RESPONSE FORMAT
=================
Your response should be natural conversation. After your response, include a JSON block with any actions:

<response>
Your natural conversational response here...
</response>

<actions>
{
  "updateCustomerData": {
    "field": "value to update",
    "table": "customers or customer_faqs"
  },
  "createFaq": {
    "question": "The question",
    "answer": "The answer",
    "category": "category",
    "confidence": "confirmed or inferred"
  },
  "flagForFollowup": "Reason for human followup",
  "logObjection": {
    "objection": "What they said",
    "handled": true/false
  },
  "pendingQuestionAnswered": {
    "field": "catering",
    "answer": "Their response"
  }
}
</actions>

Only include actions that are relevant. Most responses won't need any actions.

=================
CURRENT STATE
=================
Currently on slide: ${currentSlide || 'Not in presentation'}
Presentation status: ${currentSlide ? 'Playing (can be paused)' : 'Not started or ended'}
`;
}
```

## AI Action Processing

```javascript
async function processAIActions(actions, customerId, conversationId) {
  const results = [];
  
  // Update customer data
  if (actions.updateCustomerData) {
    const { field, value, table } = actions.updateCustomerData;
    
    if (table === 'customers') {
      // Update main customer record
      if (field.startsWith('unknown_fields.')) {
        // Moving from unknown to known
        const actualField = field.replace('unknown_fields.', '');
        await db.customers.update(customerId, {
          [actualField]: value,
          unknown_fields: db.raw(`unknown_fields - '${actualField}'`)
        });
      } else {
        await db.customers.update(customerId, { [field]: value });
      }
    }
    
    results.push({ action: 'updateCustomerData', success: true, field });
  }
  
  // Create FAQ
  if (actions.createFaq) {
    const faq = await db.customerFaqs.create({
      customer_id: customerId,
      question: actions.createFaq.question,
      answer: actions.createFaq.answer,
      category: actions.createFaq.category,
      source: 'owner_conversation',
      confidence: actions.createFaq.confidence || 'confirmed',
      source_conversation_id: conversationId
    });
    
    results.push({ action: 'createFaq', success: true, faqId: faq.id });
  }
  
  // Flag for human followup
  if (actions.flagForFollowup) {
    await db.conversations.update(conversationId, {
      followup_needed: true,
      followup_notes: actions.flagForFollowup
    });
    
    // Could also trigger notification to sales team
    await notifySalesTeam(customerId, actions.flagForFollowup);
    
    results.push({ action: 'flagForFollowup', success: true });
  }
  
  // Log objection
  if (actions.logObjection) {
    await db.conversations.update(conversationId, {
      objections_raised: db.raw(`
        COALESCE(objections_raised, '[]'::jsonb) || $1::jsonb
      `, [JSON.stringify([actions.logObjection])])
    });
    
    results.push({ action: 'logObjection', success: true });
  }
  
  // Mark pending question as answered
  if (actions.pendingQuestionAnswered) {
    await db.pendingQuestions.update(
      { customer_id: customerId, field_to_populate: actions.pendingQuestionAnswered.field },
      {
        answered: true,
        answer: actions.pendingQuestionAnswered.answer,
        answered_at: new Date()
      }
    );
    
    results.push({ action: 'pendingQuestionAnswered', success: true });
  }
  
  return results;
}
```

---

# PART 6: COMPONENT LIBRARY

## Slide Components Overview

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **HeroSlide** | Opening impact | Gradient bg, large headline, accent word, badge |
| **ProblemSlide** | Pain point identification | 2x2 grid of problem cards, warning colors |
| **SolutionSlide** | Feature presentation | 3-column cards with AI personas |
| **ComparisonSlide** | Before/after contrast | 50/50 split, red vs green themes |
| **StatsSlide** | Data-driven proof | 4 stat cards, animated numbers |
| **TestimonialSlide** | Social proof | Quote, avatar, metric badge |
| **ProcessSlide** | How-it-works flow | Numbered steps with arrows |
| **PricingSlide** | Clear value proposition | Pricing card, feature list, CTA |
| **CTASlide** | Final conversion | Dual buttons, urgency element |

## Component Props Interface

```typescript
// Base interface all slides extend
interface BaseSlideProps {
  content: Record<string, any>;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  injections?: Record<string, string>;  // Dynamic values to inject
  isActive: boolean;
  onAnimationComplete?: () => void;
}

// Example: HeroSlide
interface HeroSlideProps extends BaseSlideProps {
  content: {
    badge?: string;
    headline: string;
    accentWord?: string;
    subtext?: string;
    icon?: string;
  };
}

// Example: ProblemSlide
interface ProblemSlideProps extends BaseSlideProps {
  content: {
    headline: string;
    subheadline?: string;
    problems: Array<{
      icon: string;
      title: string;
      description: string;
      color?: string;
    }>;
  };
}

// Component mapping
const COMPONENT_MAP: Record<string, React.ComponentType<BaseSlideProps>> = {
  HeroSlide,
  ProblemSlide,
  SolutionSlide,
  ComparisonSlide,
  StatsSlide,
  TestimonialSlide,
  ProcessSlide,
  PricingSlide,
  CTASlide
};
```

---

# PART 7: PLAYER ARCHITECTURE

## Universal Player Component

```jsx
// FibonaccoPlayer.jsx - Simplified structure
export function FibonaccoPlayer({
  templateUrl,
  customerId,
  autoPlay = false,
  showPresenter = true,
  showChat = true,
  onComplete,
  onCTAClick
}) {
  const [presentation, setPresentation] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [aiContext, setAiContext] = useState(null);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showChatPanel, setShowChatPanel] = useState(false);
  
  const audioRef = useRef(null);

  // Load presentation and customer data
  useEffect(() => {
    async function load() {
      const [templateData, customerData, context] = await Promise.all([
        fetch(templateUrl).then(r => r.json()),
        fetchCustomer(customerId),
        buildAIContext(customerId)
      ]);
      
      // Merge template with customer data
      const merged = mergePresentation(templateData, customerData);
      
      setPresentation(merged);
      setCustomer(customerData);
      setAiContext(context);
    }
    load();
  }, [templateUrl, customerId]);

  // Handle user message (pause presentation, get AI response)
  const handleUserMessage = async (message) => {
    setIsPlaying(false);
    audioRef.current?.pause();
    
    const response = await sendToAI(message, aiContext, currentSlide);
    
    // Process any AI actions
    if (response.actions) {
      await processAIActions(response.actions, customerId);
      // Refresh context with new data
      setAiContext(await buildAIContext(customerId));
    }
    
    return response.message;
  };

  // Render current slide
  const renderSlide = () => {
    if (!presentation) return <LoadingState />;
    
    const slide = presentation.slides[currentSlide];
    const SlideComponent = COMPONENT_MAP[slide.component];
    
    return (
      <SlideComponent
        content={slide.content}
        theme={presentation.theme}
        injections={{
          ownerName: customer?.ownerName,
          businessName: customer?.businessName,
          industry: customer?.industry
        }}
        isActive={true}
      />
    );
  };

  return (
    <div className="fibonacco-player">
      {/* Main presentation area */}
      <div className="player-main">
        <div className="slide-container">
          {renderSlide()}
        </div>
        
        {/* Audio element */}
        <audio
          ref={audioRef}
          src={presentation?.slides[currentSlide]?.audioUrl}
          onEnded={() => advanceSlide()}
        />
        
        {/* Controls */}
        <PlayerControls
          isPlaying={isPlaying}
          currentSlide={currentSlide}
          totalSlides={presentation?.slides.length || 0}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onPrev={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          onNext={() => setCurrentSlide(Math.min(presentation.slides.length - 1, currentSlide + 1))}
          onSeek={setCurrentSlide}
        />
      </div>
      
      {/* AI Presenter panel */}
      {showPresenter && (
        <PresenterPanel
          presenter={presentation?.presenter}
          narration={presentation?.slides[currentSlide]?.narration}
          isPlaying={isPlaying}
        />
      )}
      
      {/* AI Chat */}
      {showChat && (
        <AIChat
          isOpen={showChatPanel}
          onToggle={() => setShowChatPanel(!showChatPanel)}
          onMessage={handleUserMessage}
          onResume={() => setIsPlaying(true)}
          presenterName={presentation?.presenter?.name}
          isPaused={!isPlaying}
        />
      )}
      
      {/* Floating chat button */}
      {!showChatPanel && (
        <button 
          className="chat-fab"
          onClick={() => setShowChatPanel(true)}
        >
          💬 Ask {presentation?.presenter?.name} a Question
        </button>
      )}
    </div>
  );
}
```

---

# PART 8: USER EXPERIENCE FLOW

## Complete Customer Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CUSTOMER JOURNEY                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   1. ENTRY                                                              │
│      ────────────────────────────────────────────────                   │
│      Customer receives personalized link via:                           │
│      • Email campaign                                                   │
│      • SMS outreach                                                     │
│      • Ad click                                                         │
│      • Referral                                                         │
│                                                                         │
│      URL: fibonacco.com/demo/tonys-pizzeria                            │
│                                                                         │
│   2. PAGE LOAD                                                          │
│      ────────────────────────────────────────────────                   │
│      • Presentation template loads from CDN                             │
│      • Customer data loads from database                                │
│      • AI context assembled                                             │
│      • Player initializes                                               │
│                                                                         │
│      Time: < 2 seconds                                                  │
│                                                                         │
│   3. PRESENTATION BEGINS                                                │
│      ────────────────────────────────────────────────                   │
│                                                                         │
│      "Hi Tony, I'm Sarah from Fibonacco. I know you're                 │
│       busy running Tony's Pizzeria in Clearwater, so                   │
│       I'll keep this brief..."                                         │
│                                                                         │
│      • Pre-recorded professional audio                                  │
│      • Customer name/business dynamically displayed                     │
│      • Polished animations                                              │
│      • "Ask a Question" button always visible                          │
│                                                                         │
│   4. USER INTERRUPTS (optional)                                         │
│      ────────────────────────────────────────────────                   │
│                                                                         │
│      User: "Wait, do you work with Square?"                            │
│                                                                         │
│      [Presentation PAUSES]                                             │
│                                                                         │
│      Sarah (AI): "Yes! I actually see you're already using             │
│      Square at Tony's Pizzeria - that's perfect. Lisa                  │
│      integrates directly with Square for seamless                       │
│      payment tracking..."                                               │
│                                                                         │
│      [AI KNEW: customer.pos_system = "Square"]                         │
│                                                                         │
│   5. AI ASKS SMART QUESTION                                            │
│      ────────────────────────────────────────────────                   │
│                                                                         │
│      Sarah (AI): "By the way, I noticed you mentioned                   │
│      wanting to grow your catering business. Do you                     │
│      currently offer catering, or is that something                     │
│      you're looking to start?"                                          │
│                                                                         │
│      [AI SAW: customer.unknown.catering = null]                        │
│      [AI SAW: customer.goals includes "Build catering"]                │
│                                                                         │
│   6. DATA CAPTURE                                                       │
│      ────────────────────────────────────────────────                   │
│                                                                         │
│      User: "Yeah we do catering for local businesses,                   │
│            mostly lunch meetings. Minimum is $150."                     │
│                                                                         │
│      Sarah (AI): "That's great! Lunch catering for                      │
│      businesses is a solid market. I've noted that                      │
│      down. When Lisa gets catering inquiries, she'll                   │
│      know exactly how to handle them."                                  │
│                                                                         │
│      [BACKGROUND ACTIONS:]                                              │
│      • Update customer.catering = true                                  │
│      • Update customer.catering_minimum = "$150"                        │
│      • Create FAQ: "Do you offer catering?"                            │
│      • Mark pending_question as answered                                │
│                                                                         │
│   7. PRESENTATION CONTINUES                                             │
│      ────────────────────────────────────────────────                   │
│                                                                         │
│      Sarah: "Would you like me to continue with the                     │
│      overview, or would you like to explore how Marcus                  │
│      could specifically promote your catering services?"               │
│                                                                         │
│      [User chooses to continue or dive deeper]                         │
│                                                                         │
│   8. CLOSE                                                              │
│      ────────────────────────────────────────────────                   │
│                                                                         │
│      • CTA slide with personalized offer                               │
│      • "Start Free Trial" or "Schedule Demo"                           │
│      • AI available for final questions                                │
│      • All captured data saved to customer record                      │
│                                                                         │
│   9. POST-INTERACTION                                                   │
│      ────────────────────────────────────────────────                   │
│                                                                         │
│      • Full conversation logged                                         │
│      • Analytics captured                                               │
│      • Customer data enriched                                           │
│      • FAQs generated for future use                                   │
│      • If needed, human rep notified for follow-up                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# PART 9: IMPLEMENTATION PLAN

## Phase 1: Foundation (Week 1-2)

### Database Setup
- [ ] Create PostgreSQL database
- [ ] Run schema creation scripts
- [ ] Seed product data
- [ ] Seed 5 industry verticals (restaurant, plumber, hvac, salon, dental)
- [ ] Create 10 test customer records

### Storage Setup
- [ ] Configure S3 bucket with folder structure
- [ ] Set up CloudFront CDN
- [ ] Configure CORS policies
- [ ] Create IAM roles for audio generation

### API Endpoints
- [ ] GET /api/presentations/:templateId
- [ ] GET /api/customers/:slug
- [ ] GET /api/context/:customerId
- [ ] POST /api/conversations
- [ ] POST /api/ai/chat

## Phase 2: Components (Week 2-3)

### Slide Components
- [ ] HeroSlide
- [ ] ProblemSlide
- [ ] SolutionSlide
- [ ] ComparisonSlide
- [ ] StatsSlide
- [ ] TestimonialSlide
- [ ] ProcessSlide
- [ ] PricingSlide
- [ ] CTASlide

### Player Components
- [ ] FibonaccoPlayer (main container)
- [ ] PlayerControls
- [ ] PresenterPanel
- [ ] ProgressIndicator
- [ ] AIChat panel

### Styling
- [ ] Design system tokens
- [ ] Component animations
- [ ] Responsive breakpoints
- [ ] Dark/light theme support

## Phase 3: Audio System (Week 3-4)

### Audio Generation
- [ ] AWS Polly integration
- [ ] Audio generation script
- [ ] S3 upload automation
- [ ] Generate audio for first template

### Audio Playback
- [ ] Audio synchronization with slides
- [ ] Preloading next slide audio
- [ ] Volume controls
- [ ] Fallback to browser TTS

## Phase 4: AI Integration (Week 4-5)

### AI System
- [ ] System prompt builder
- [ ] Context assembly function
- [ ] Claude API integration
- [ ] Action processing system
- [ ] FAQ generation logic

### Conversation Management
- [ ] Conversation logging
- [ ] Message storage
- [ ] Analytics capture
- [ ] Human handoff triggers

## Phase 5: Content Creation (Week 5-6)

### Templates
- [ ] AI Employee Introduction (primary)
- [ ] Pricing Overview
- [ ] How It Works
- [ ] Case Study template

### Industry Content
- [ ] Complete 50 industry profiles
- [ ] Industry-specific pain points
- [ ] Industry testimonials
- [ ] Industry FAQs

### Customer Data
- [ ] Import process for customer data
- [ ] Data validation rules
- [ ] Unknown field identification
- [ ] Pending question generation

## Phase 6: Testing & Launch (Week 6-7)

### Testing
- [ ] Component unit tests
- [ ] Integration tests
- [ ] AI response testing
- [ ] Load testing
- [ ] Mobile responsive testing

### Launch Preparation
- [ ] Performance optimization
- [ ] Error handling
- [ ] Analytics dashboard
- [ ] Documentation

---

# PART 10: COST ANALYSIS

## Per-Presentation Costs

| Item | Cost | Notes |
|------|------|-------|
| Template creation (one-time) | ~$5 | Claude API for content |
| Audio generation (9 slides) | ~$0.80 | AWS Polly Neural |
| Storage (JSON + audio) | ~$0.01/mo | ~5MB per presentation |
| CDN delivery | ~$0.10/1000 views | CloudFront |

## AI Conversation Costs

| Item | Cost | Notes |
|------|------|-------|
| Average conversation | ~$0.05-0.15 | Depends on length |
| Complex conversation | ~$0.25-0.50 | Multiple back-and-forth |

## Scale Projections

| Scale | Monthly Cost | Notes |
|-------|--------------|-------|
| 100 customers, 500 views | ~$50 | Infrastructure + AI |
| 1,000 customers, 5,000 views | ~$200 | Dominated by AI conversations |
| 10,000 customers, 50,000 views | ~$1,000 | Significant AI usage |

## ROI Calculation

| Metric | Value |
|--------|-------|
| Cost per qualified lead (traditional) | $50-150 |
| Cost per qualified lead (this system) | ~$5-15 |
| Conversion rate improvement | 2-3x |
| Data capture value | Priceless |

---

# PART 11: SUCCESS METRICS

## Key Performance Indicators

### Presentation Metrics
- **View Rate**: % of visitors who start presentation
- **Completion Rate**: % who watch to end
- **Drop-off Points**: Which slides lose viewers
- **Avg. Watch Time**: Time spent in presentation

### AI Engagement Metrics
- **Chat Initiation Rate**: % who ask questions
- **Questions per Session**: Average questions asked
- **AI Resolution Rate**: % answered without human
- **Data Capture Rate**: New fields learned per session

### Conversion Metrics
- **CTA Click Rate**: % who click primary CTA
- **Trial Start Rate**: % who begin free trial
- **Demo Request Rate**: % who request demo
- **Conversion by Industry**: Performance by vertical

### Data Quality Metrics
- **Unknown→Known Rate**: Speed of filling data gaps
- **FAQ Generation Rate**: New FAQs per conversation
- **Data Accuracy**: % of AI-captured data verified correct

---

# SUMMARY

## What This System Does

1. **Delivers professional presentations** that feel personalized without per-customer video production costs

2. **Captures valuable data** through natural AI conversations, turning every interaction into business intelligence

3. **Learns continuously** - every conversation makes the system smarter for that specific customer and industry

4. **Scales infinitely** - one player, one template, unlimited personalized experiences

5. **Closes deals** - AI handles objections, answers questions, and guides toward conversion

## Core Innovation

**The presentation is the hook. The AI is the closer.**

Pre-recorded content establishes professionalism and consistency. Live AI provides personalization and responsiveness. Together, they create an experience that feels like a personal sales conversation at the cost of a landing page.

## Technical Foundation

- **JSON-driven architecture** for maximum flexibility
- **Three-layer data model** (Product → Industry → Customer)
- **Real-time AI** with full business context
- **Automatic FAQ generation** from conversations
- **Intelligent question asking** to fill data gaps

## Business Impact

- **Replaces:** Generic landing pages, sales videos, initial sales calls
- **Enables:** Personalized demos at scale, 24/7 sales conversations, continuous data enrichment
- **Reduces:** Cost per lead, time to qualification, manual data entry
- **Increases:** Conversion rates, data quality, customer understanding

---

*Document Version: 1.0*
*Last Updated: December 2, 2025*
*Status: Ready for Implementation*
