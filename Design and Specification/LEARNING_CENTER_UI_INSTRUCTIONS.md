# Learning Center UI Build Instructions for Claude Code

## Overview

Build a comprehensive Learning Center for Shine Media's AI-powered local business platform. This system manages the knowledge that powers AI agents across the five integrated services (day.news, downtown guide, go event city, alphasite, local voices).

**Core Purpose:**
- 410-question FAQ database across 56 industry subcategories
- 375-question business profile survey (30 sections)
- Vector-based semantic search for AI retrieval
- Multi-source validation (google | serpapi | website | owner)
- Training data management for AI agents

**Tech Stack:**
- Laravel 11 with Inertia.js
- React (TypeScript)
- Tailwind CSS
- Supabase with pgvector for embeddings
- shadcn/ui as component foundation

---

## Database Context (From Schema)

```sql
-- Primary table for learning content
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    embedding vector(1536),      -- For semantic search
    is_public BOOLEAN DEFAULT true,
    allowed_agents UUID[],       -- Which AI agents can access
    source TEXT,
    source_url TEXT,
    usage_count INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    not_helpful_count INT DEFAULT 0,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    created_by UUID
);
```

---

## Part 1: Directory Structure

```
resources/js/
├── Components/
│   └── LearningCenter/
│       ├── Layout/
│       │   ├── LearningLayout.tsx        # Dedicated layout wrapper
│       │   ├── CategorySidebar.tsx       # Category/industry navigation
│       │   └── SearchHeader.tsx          # Global search bar
│       │
│       ├── FAQ/
│       │   ├── FAQList.tsx               # Paginated FAQ listing
│       │   ├── FAQCard.tsx               # Individual FAQ display
│       │   ├── FAQEditor.tsx             # Create/edit FAQ modal
│       │   ├── FAQBulkImport.tsx         # CSV/JSON bulk import
│       │   ├── FAQCategoryManager.tsx    # Manage 56 subcategories
│       │   └── FAQValidationStatus.tsx   # Source validation badges
│       │
│       ├── BusinessProfile/
│       │   ├── ProfileSurveyBuilder.tsx  # 30-section survey manager
│       │   ├── SectionEditor.tsx         # Edit survey sections
│       │   ├── QuestionEditor.tsx        # Individual question config
│       │   ├── QuestionTypes/
│       │   │   ├── TextQuestion.tsx
│       │   │   ├── SelectQuestion.tsx
│       │   │   ├── MultiSelectQuestion.tsx
│       │   │   ├── ScaleQuestion.tsx
│       │   │   ├── DateQuestion.tsx
│       │   │   └── MediaQuestion.tsx
│       │   ├── ProfilePreview.tsx        # Preview survey as business
│       │   └── ResponseAnalytics.tsx     # Survey completion stats
│       │
│       ├── Articles/
│       │   ├── ArticleList.tsx           # Knowledge articles grid
│       │   ├── ArticleEditor.tsx         # Rich text editor
│       │   ├── ArticleMetadata.tsx       # SEO, categorization
│       │   └── ArticleVersionHistory.tsx # Track changes
│       │
│       ├── VectorSearch/
│       │   ├── SearchPlayground.tsx      # Test semantic search
│       │   ├── SimilarityResults.tsx     # Show vector matches
│       │   ├── EmbeddingStatus.tsx       # Processing status
│       │   └── SearchAnalytics.tsx       # Query performance
│       │
│       ├── AITraining/
│       │   ├── AgentKnowledgeConfig.tsx  # Assign knowledge to agents
│       │   ├── TrainingDatasets.tsx      # Curated training sets
│       │   ├── ValidationQueue.tsx       # Items needing review
│       │   └── PerformanceMetrics.tsx    # Agent accuracy tracking
│       │
│       ├── Categories/
│       │   ├── IndustryTree.tsx          # 56 subcategory hierarchy
│       │   ├── CategoryEditor.tsx        # Add/edit categories
│       │   └── CategoryMapping.tsx       # Map content to categories
│       │
│       └── Common/
│           ├── SourceBadge.tsx           # google|serpapi|website|owner
│           ├── ValidationIndicator.tsx   # Verification status
│           ├── UsageStats.tsx            # helpful/not helpful counts
│           ├── EmbeddingIndicator.tsx    # Vector status
│           └── AgentAccessSelector.tsx   # Multi-select agents
│
├── Pages/
│   └── LearningCenter/
│       ├── Index.tsx                     # Dashboard overview
│       ├── FAQ/
│       │   ├── Index.tsx                 # FAQ management home
│       │   ├── Category.tsx              # View by category
│       │   └── Import.tsx                # Bulk import page
│       ├── BusinessProfile/
│       │   ├── Index.tsx                 # Survey builder home
│       │   ├── Section.tsx               # Edit section
│       │   └── Analytics.tsx             # Response analytics
│       ├── Articles/
│       │   ├── Index.tsx                 # Article library
│       │   ├── Create.tsx                # New article
│       │   └── Edit.tsx                  # Edit article
│       ├── Search/
│       │   └── Playground.tsx            # Search testing
│       ├── Training/
│       │   ├── Index.tsx                 # Training overview
│       │   ├── Datasets.tsx              # Manage datasets
│       │   └── Validation.tsx            # Validation queue
│       └── Settings/
│           ├── Categories.tsx            # Category management
│           └── Agents.tsx                # Agent knowledge config
│
├── Hooks/
│   └── LearningCenter/
│       ├── useKnowledgeSearch.ts         # Semantic search hook
│       ├── useFAQCategories.ts           # Category tree data
│       ├── useEmbeddingStatus.ts         # Vector processing status
│       ├── useValidation.ts              # Content validation
│       └── useSurveyBuilder.ts           # Survey state management
│
├── Services/
│   └── learning/
│       ├── knowledge-api.ts              # CRUD operations
│       ├── search-api.ts                 # Vector search
│       ├── embedding-api.ts              # Generate embeddings
│       └── validation-api.ts             # Source validation
│
└── Types/
    └── learning.ts                       # TypeScript interfaces
```

---

## Part 2: Type Definitions

**File:** `Types/learning.ts`

```typescript
// ============================================
// ENUMS & CONSTANTS
// ============================================

export const VALIDATION_SOURCES = ['google', 'serpapi', 'website', 'owner'] as const;
export type ValidationSource = typeof VALIDATION_SOURCES[number];

export const QUESTION_TYPES = [
  'text',
  'textarea',
  'select',
  'multi_select',
  'scale',
  'date',
  'time',
  'datetime',
  'number',
  'currency',
  'phone',
  'email',
  'url',
  'address',
  'media',
  'file',
  'boolean',
  'rating'
] as const;
export type QuestionType = typeof QUESTION_TYPES[number];

// ============================================
// KNOWLEDGE BASE
// ============================================

export interface KnowledgeArticle {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
  industry_codes?: string[];
  
  // Vector status
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed';
  has_embedding: boolean;
  
  // Access control
  is_public: boolean;
  allowed_agents: string[];
  
  // Source & validation
  source: ValidationSource;
  source_url?: string;
  validation_status: 'unverified' | 'verified' | 'disputed' | 'outdated';
  validated_at?: string;
  validated_by?: string;
  
  // Usage metrics
  usage_count: number;
  helpful_count: number;
  not_helpful_count: number;
  helpfulness_score: number; // Computed: helpful / (helpful + not_helpful)
  
  // Metadata
  tags: string[];
  metadata: Record<string, unknown>;
  
  created_at: string;
  updated_at: string;
  created_by: string;
}

// ============================================
// FAQ SYSTEM
// ============================================

export interface FAQItem extends KnowledgeArticle {
  question: string;           // Maps to 'title'
  answer: string;             // Maps to 'content'
  short_answer?: string;      // Quick response version
  related_faqs: string[];     // Related FAQ IDs
  applies_to_industries: string[];
}

export interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  color?: string;
  faq_count: number;
  children?: FAQCategory[];
  order: number;
}

// 56 Industry Subcategories Structure
export interface IndustryCategory {
  id: string;
  name: string;
  code: string;  // e.g., 'FOOD_RESTAURANT', 'RETAIL_CLOTHING'
  parent_industry: string;
  subcategories: IndustrySubcategory[];
}

export interface IndustrySubcategory {
  id: string;
  name: string;
  code: string;
  faq_count: number;
  profile_questions_count: number;
}

// ============================================
// BUSINESS PROFILE SURVEY
// ============================================

export interface SurveySection {
  id: string;
  name: string;
  description?: string;
  order: number;
  is_required: boolean;
  is_conditional: boolean;
  condition?: SectionCondition;
  questions: SurveyQuestion[];
  completion_percentage?: number;
}

export interface SectionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in';
  value: unknown;
}

export interface SurveyQuestion {
  id: string;
  section_id: string;
  question_text: string;
  help_text?: string;
  question_type: QuestionType;
  is_required: boolean;
  order: number;
  
  // Validation
  validation_rules?: ValidationRule[];
  
  // Options for select/multi-select
  options?: QuestionOption[];
  
  // Scale config
  scale_config?: {
    min: number;
    max: number;
    min_label?: string;
    max_label?: string;
  };
  
  // Conditional display
  is_conditional: boolean;
  show_when?: QuestionCondition;
  
  // AI/Data enrichment
  auto_populate_source?: 'serpapi' | 'google' | 'none';
  requires_owner_verification: boolean;
  
  // Metadata
  industry_specific: boolean;
  applies_to_industries?: string[];
  
  created_at: string;
  updated_at: string;
}

export interface ValidationRule {
  type: 'required' | 'min_length' | 'max_length' | 'pattern' | 'min' | 'max' | 'custom';
  value?: unknown;
  message: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  order: number;
  is_other: boolean;  // "Other (please specify)" option
}

export interface QuestionCondition {
  question_id: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'is_empty' | 'is_not_empty';
  value: unknown;
}

// ============================================
// VECTOR SEARCH
// ============================================

export interface SearchQuery {
  query: string;
  filters?: {
    categories?: string[];
    industries?: string[];
    sources?: ValidationSource[];
    validation_status?: string[];
    agent_ids?: string[];
  };
  limit?: number;
  threshold?: number;  // Similarity threshold 0-1
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  similarity_score: number;
  source: ValidationSource;
  validation_status: string;
  highlights?: string[];  // Text snippets with matches
}

export interface SearchAnalytics {
  query: string;
  results_count: number;
  avg_similarity: number;
  response_time_ms: number;
  clicked_result_id?: string;
  was_helpful?: boolean;
  timestamp: string;
}

// ============================================
// AI TRAINING
// ============================================

export interface TrainingDataset {
  id: string;
  name: string;
  description?: string;
  agent_ids: string[];
  article_ids: string[];
  faq_ids: string[];
  
  // Stats
  total_items: number;
  verified_items: number;
  
  // Training status
  status: 'draft' | 'ready' | 'training' | 'active' | 'archived';
  last_trained_at?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ValidationQueueItem {
  id: string;
  content_type: 'faq' | 'article' | 'profile_answer';
  content_id: string;
  title: string;
  content_preview: string;
  
  current_source: ValidationSource;
  suggested_source?: ValidationSource;
  
  // Validation data
  serpapi_data?: Record<string, unknown>;
  google_data?: Record<string, unknown>;
  website_data?: Record<string, unknown>;
  
  confidence_score: number;
  discrepancies?: string[];
  
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  created_at: string;
}

// ============================================
// AGENT KNOWLEDGE CONFIG
// ============================================

export interface AgentKnowledgeConfig {
  agent_id: string;
  agent_name: string;
  agent_type: string;
  
  // Knowledge access
  allowed_categories: string[];
  allowed_industries: string[];
  excluded_article_ids: string[];
  
  // Behavior config
  use_faq_first: boolean;
  confidence_threshold: number;
  fallback_behavior: 'escalate' | 'general_response' | 'ask_clarification';
  
  // Stats
  total_accessible_articles: number;
  total_accessible_faqs: number;
  
  updated_at: string;
}
```

---

## Part 3: Design System

**File:** `styles/learning-center.css`

```css
/* ============================================
   LEARNING CENTER DESIGN TOKENS
   ============================================ */

:root {
  /* Primary Palette - Knowledge/Learning Focus */
  --lc-primary: #6366f1;          /* Indigo - wisdom, learning */
  --lc-primary-light: #818cf8;
  --lc-primary-dark: #4f46e5;
  --lc-primary-bg: #eef2ff;
  
  /* Secondary - Validation/Trust */
  --lc-secondary: #10b981;        /* Emerald - verified, trusted */
  --lc-secondary-light: #34d399;
  --lc-secondary-dark: #059669;
  
  /* Accent - Attention/Action */
  --lc-accent: #f59e0b;           /* Amber - needs attention */
  --lc-accent-light: #fbbf24;
  --lc-accent-dark: #d97706;
  
  /* Source Colors */
  --source-google: #4285f4;
  --source-serpapi: #10b981;
  --source-website: #8b5cf6;
  --source-owner: #f59e0b;
  
  /* Validation Status */
  --status-verified: #10b981;
  --status-unverified: #6b7280;
  --status-disputed: #ef4444;
  --status-outdated: #f59e0b;
  
  /* Surfaces */
  --lc-bg: #f8fafc;
  --lc-surface: #ffffff;
  --lc-surface-hover: #f1f5f9;
  --lc-surface-active: #e2e8f0;
  
  /* Typography */
  --lc-text: #1e293b;
  --lc-text-secondary: #64748b;
  --lc-text-muted: #94a3b8;
  
  /* Borders */
  --lc-border: #e2e8f0;
  --lc-border-focus: var(--lc-primary);
  
  /* Shadows */
  --lc-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --lc-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --lc-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --lc-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  /* Spacing */
  --lc-sidebar-width: 280px;
  --lc-sidebar-collapsed: 64px;
  --lc-header-height: 64px;
  
  /* Transitions */
  --lc-transition-fast: 150ms ease;
  --lc-transition: 200ms ease;
  --lc-transition-slow: 300ms ease;
}

/* Dark Mode */
.dark {
  --lc-bg: #0f172a;
  --lc-surface: #1e293b;
  --lc-surface-hover: #334155;
  --lc-surface-active: #475569;
  --lc-text: #f1f5f9;
  --lc-text-secondary: #94a3b8;
  --lc-text-muted: #64748b;
  --lc-border: #334155;
}
```

**Font Configuration:**
```css
/* Import in app.css or layout */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## Part 4: Core Layout Components

### 4.1 Learning Layout

**File:** `Components/LearningCenter/Layout/LearningLayout.tsx`

```tsx
/**
 * LEARNING CENTER LAYOUT
 * 
 * Structure:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Header: Search Bar + Actions + User                         │
 * ├──────────────┬──────────────────────────────────────────────┤
 * │              │                                              │
 * │   Category   │                                              │
 * │   Sidebar    │           Main Content Area                  │
 * │              │                                              │
 * │   - FAQs     │                                              │
 * │   - Profile  │                                              │
 * │   - Articles │                                              │
 * │   - Search   │                                              │
 * │   - Training │                                              │
 * │              │                                              │
 * └──────────────┴──────────────────────────────────────────────┘
 * 
 * Features:
 * - Collapsible sidebar with keyboard shortcut (Cmd+B)
 * - Global semantic search in header
 * - Breadcrumb navigation
 * - Quick actions dropdown
 * - Real-time embedding status indicator
 */

interface LearningLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

// Sidebar should show:
// 1. Section navigation (FAQs, Profile Survey, Articles, etc.)
// 2. Industry/Category tree (collapsible, searchable)
// 3. Quick filters (Validation status, Source type)
// 4. Stats summary (Total items, Pending validation)
```

### 4.2 Category Sidebar

**File:** `Components/LearningCenter/Layout/CategorySidebar.tsx`

```tsx
/**
 * CATEGORY SIDEBAR
 * 
 * Navigation Structure:
 * 
 * 📚 CONTENT
 *   ├── FAQs (410)
 *   │     └── [Search within FAQs]
 *   ├── Business Profiles (375 questions)
 *   │     └── 30 Sections
 *   └── Articles (count)
 * 
 * 🏭 INDUSTRIES (56 subcategories)
 *   ├── Food & Dining
 *   │     ├── Restaurants (45)
 *   │     ├── Cafes (23)
 *   │     ├── Bars (18)
 *   │     └── Food Trucks (12)
 *   ├── Retail
 *   │     ├── Clothing (34)
 *   │     ├── Electronics (28)
 *   │     └── ...
 *   └── ... (other industries)
 * 
 * 🔍 FILTERS
 *   ├── Source: [All ▼]
 *   ├── Status: [All ▼]
 *   └── Agent Access: [All ▼]
 * 
 * 📊 QUICK STATS
 *   ├── Pending Validation: 23
 *   ├── Missing Embeddings: 5
 *   └── Low Helpfulness: 12
 * 
 * Features:
 * - Expandable/collapsible tree nodes
 * - Item counts per category
 * - Search/filter within sidebar
 * - Drag to reorder categories (admin only)
 * - Right-click context menu for actions
 */
```

### 4.3 Search Header

**File:** `Components/LearningCenter/Layout/SearchHeader.tsx`

```tsx
/**
 * SEARCH HEADER
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔍 [Search knowledge base...              ] [Semantic ▼] [⚡ Live] │
 * │                                                                     │
 * │ Quick filters: [FAQs] [Articles] [Verified only] [+ More]          │
 * └─────────────────────────────────────────────────────────────────────┘
 * 
 * Features:
 * - Semantic search toggle (vector vs keyword)
 * - Real-time search as you type (debounced 300ms)
 * - Search suggestions/autocomplete
 * - Recent searches
 * - Advanced search modal (Cmd+Shift+F)
 * - Voice search option
 * 
 * Search Results Dropdown:
 * - Groups by type (FAQs, Articles, Profile Questions)
 * - Shows similarity score for semantic search
 * - Source badge on each result
 * - Click to navigate, Enter to see all results
 */
```

---

## Part 5: FAQ Management Module

### 5.1 FAQ List Page

**File:** `Pages/LearningCenter/FAQ/Index.tsx`

```tsx
/**
 * FAQ MANAGEMENT HOME
 * 
 * Header Section:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ FAQs                                              [+ Add FAQ]│
 * │ 410 questions across 56 industry subcategories    [Import ▼]│
 * └─────────────────────────────────────────────────────────────┘
 * 
 * Filter Bar:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ [Search FAQs...] │ Category ▼ │ Industry ▼ │ Source ▼ │     │
 * │                  │ Status ▼   │ Agent ▼    │ [Clear all]    │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * View Toggle: [List] [Cards] [Grouped by Category]
 * 
 * List View Columns:
 * ☐ │ Question │ Category │ Industry │ Source │ Status │ Usage │ Actions
 * 
 * Card View:
 * - Question as title
 * - Truncated answer (3 lines)
 * - Category & industry tags
 * - Source badge with color
 * - Validation status indicator
 * - Usage stats (views, helpful %)
 * 
 * Bulk Actions (when items selected):
 * - Change Category
 * - Change Source
 * - Send to Validation
 * - Assign to Agents
 * - Export Selected
 * - Delete
 * 
 * Pagination: 25 | 50 | 100 per page
 */

// Data fetching with filters
interface FAQFilters {
  search?: string;
  categories?: string[];
  industries?: string[];
  sources?: ValidationSource[];
  validation_status?: string[];
  agent_ids?: string[];
  has_embedding?: boolean;
  helpfulness_min?: number;
}
```

### 5.2 FAQ Card Component

**File:** `Components/LearningCenter/FAQ/FAQCard.tsx`

```tsx
/**
 * FAQ CARD
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ ☐  [Category Badge]  [Industry Badge]           [Source: 🔵]│
 * ├─────────────────────────────────────────────────────────────┤
 * │                                                             │
 * │ Q: How do I set up online ordering for my restaurant?       │
 * │                                                             │
 * │ A: To set up online ordering, you'll need to first...       │
 * │    [truncated after 3 lines]                                │
 * │                                                             │
 * ├─────────────────────────────────────────────────────────────┤
 * │ 👁 234 views  │  👍 89%  │  🤖 3 agents  │  ✓ Verified      │
 * ├─────────────────────────────────────────────────────────────┤
 * │ [Edit]  [Preview]  [Duplicate]  [⋮ More]                    │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * States:
 * - Default
 * - Hover (show quick actions)
 * - Selected (checkbox checked, blue border)
 * - Needs Validation (yellow border, warning icon)
 * - Missing Embedding (orange indicator)
 * 
 * Source Badge Colors:
 * - Google: Blue (#4285f4)
 * - SerpAPI: Green (#10b981)
 * - Website: Purple (#8b5cf6)
 * - Owner: Amber (#f59e0b)
 */
```

### 5.3 FAQ Editor Modal

**File:** `Components/LearningCenter/FAQ/FAQEditor.tsx`

```tsx
/**
 * FAQ EDITOR MODAL
 * 
 * Full-screen modal or slide-over panel
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ [×]  Create New FAQ                              [Save Draft] [Publish]│
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Question *                                                          │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ How do I set up online ordering for my restaurant?              │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ Answer *                                                            │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ [Rich text editor with formatting toolbar]                      │ │
 * │ │                                                                 │ │
 * │ │ To set up online ordering for your restaurant:                  │ │
 * │ │                                                                 │ │
 * │ │ 1. Choose a platform...                                         │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ Short Answer (for quick responses)                                  │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ Set up through our partner platforms like...                    │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ─────────────────────────────────────────────────────────────────── │
 * │                                                                     │
 * │ Category *              │  Industry Subcategory                     │
 * │ [Getting Started    ▼]  │  [Restaurant - Full Service    ▼]        │
 * │                                                                     │
 * │ Source *                │  Source URL                               │
 * │ [● Google ○ SerpAPI    ]│  [https://...                         ]  │
 * │ [○ Website ○ Owner     ]│                                          │
 * │                                                                     │
 * │ Tags                                                                │
 * │ [online ordering] [restaurant] [setup] [+ Add tag]                  │
 * │                                                                     │
 * │ ─────────────────────────────────────────────────────────────────── │
 * │                                                                     │
 * │ AI Agent Access                                                     │
 * │ [✓] All agents  [ ] Specific agents only                           │
 * │                                                                     │
 * │ Related FAQs                                                        │
 * │ [Search and link related FAQs...]                                   │
 * │ • How do I manage online orders? [×]                                │
 * │ • What payment methods can I accept? [×]                            │
 * │                                                                     │
 * │ ─────────────────────────────────────────────────────────────────── │
 * │                                                                     │
 * │ [Generate Embedding]  Status: ✓ Embedded  │  [Preview] [Test Search]│
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 * 
 * Features:
 * - Auto-save draft every 30 seconds
 * - Rich text editor (Tiptap or Slate)
 * - AI writing assistant (suggest improvements)
 * - Duplicate detection (warn if similar FAQ exists)
 * - Preview mode (see how it appears to users)
 * - Test semantic search (see what queries match)
 */
```

### 5.4 FAQ Bulk Import

**File:** `Components/LearningCenter/FAQ/FAQBulkImport.tsx`

```tsx
/**
 * FAQ BULK IMPORT
 * 
 * Step 1: Upload File
 * ┌─────────────────────────────────────────────────────────────┐
 * │                                                             │
 * │     ┌─────────────────────────────────────────────┐         │
 * │     │                                             │         │
 * │     │    📁 Drop CSV or JSON file here            │         │
 * │     │         or click to browse                  │         │
 * │     │                                             │         │
 * │     │    Supported: .csv, .json, .xlsx            │         │
 * │     │                                             │         │
 * │     └─────────────────────────────────────────────┘         │
 * │                                                             │
 * │     [Download Template: CSV | JSON]                         │
 * │                                                             │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * Step 2: Map Columns
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Map your columns to FAQ fields:                             │
 * │                                                             │
 * │ Your Column        →    FAQ Field                           │
 * │ ─────────────────────────────────────────────────────       │
 * │ [question_text ▼]  →    Question *                          │
 * │ [answer_text ▼]    →    Answer *                            │
 * │ [category ▼]       →    Category                            │
 * │ [industry ▼]       →    Industry                            │
 * │ [source ▼]         →    Source (default: owner)             │
 * │ [tags ▼]           →    Tags (comma-separated)              │
 * │                                                             │
 * │ Preview (first 5 rows):                                     │
 * │ ┌─────────────────────────────────────────────────────────┐ │
 * │ │ Question          │ Answer           │ Category │ ...   │ │
 * │ ├─────────────────────────────────────────────────────────┤ │
 * │ │ How do I...       │ To set up...     │ Setup    │ ...   │ │
 * │ │ What is the...    │ The best...      │ General  │ ...   │ │
 * │ └─────────────────────────────────────────────────────────┘ │
 * │                                                             │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * Step 3: Validation & Import
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Validation Results:                                         │
 * │                                                             │
 * │ ✓ 385 valid rows ready to import                           │
 * │ ⚠ 18 rows with warnings (will import with defaults)        │
 * │ ✗ 7 rows with errors (will be skipped)                     │
 * │                                                             │
 * │ [Show errors and warnings]                                  │
 * │                                                             │
 * │ Options:                                                    │
 * │ [✓] Generate embeddings after import                       │
 * │ [✓] Skip duplicates (match by question text)               │
 * │ [ ] Overwrite existing (match by question text)            │
 * │ [✓] Send to validation queue                               │
 * │                                                             │
 * │                                    [Cancel]  [Import 385 FAQs]│
 * └─────────────────────────────────────────────────────────────┘
 * 
 * Step 4: Progress & Results
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Importing FAQs...                                           │
 * │                                                             │
 * │ ████████████████████████░░░░░░░░░░░░  234/385 (61%)        │
 * │                                                             │
 * │ ✓ Imported: 234                                            │
 * │ ⏳ Pending: 151                                             │
 * │ ✗ Failed: 0                                                │
 * │ ⏭ Skipped (duplicate): 12                                  │
 * │                                                             │
 * │ [View Import Log]                                           │
 * └─────────────────────────────────────────────────────────────┘
 */
```

### 5.5 FAQ Category Manager

**File:** `Components/LearningCenter/FAQ/FAQCategoryManager.tsx`

```tsx
/**
 * FAQ CATEGORY MANAGER
 * 
 * Manages the hierarchy of FAQ categories and the 56 industry subcategories
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ Category Management                              [+ Add Category]   │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Drag to reorder • Right-click for options                          │
 * │                                                                     │
 * │ ├── 📁 Getting Started (45 FAQs)                          [⋮]      │
 * │ │     ├── Account Setup (12)                                       │
 * │ │     ├── First Steps (18)                                         │
 * │ │     └── Platform Overview (15)                                   │
 * │ │                                                                   │
 * │ ├── 📁 Products & Services (89 FAQs)                      [⋮]      │
 * │ │     ├── Adding Products (34)                                     │
 * │ │     ├── Pricing (28)                                             │
 * │ │     └── Inventory (27)                                           │
 * │ │                                                                   │
 * │ ├── 📁 Marketing (67 FAQs)                                [⋮]      │
 * │ │     ├── Social Media (23)                                        │
 * │ │     ├── Email Campaigns (22)                                     │
 * │ │     └── Local Advertising (22)                                   │
 * │ │                                                                   │
 * │ └── 📁 ... (more categories)                                       │
 * │                                                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Industry Subcategories (56 total)                  [+ Add Industry] │
 * │                                                                     │
 * │ ├── 🍽️ Food & Dining (8 subcategories)                             │
 * │ │     ├── Restaurant - Full Service (45 FAQs)                      │
 * │ │     ├── Restaurant - Quick Service (38 FAQs)                     │
 * │ │     ├── Cafe/Coffee Shop (32 FAQs)                               │
 * │ │     ├── Bar/Nightclub (28 FAQs)                                  │
 * │ │     ├── Bakery (24 FAQs)                                         │
 * │ │     ├── Food Truck (22 FAQs)                                     │
 * │ │     ├── Catering (20 FAQs)                                       │
 * │ │     └── Specialty Food (18 FAQs)                                 │
 * │ │                                                                   │
 * │ ├── 🛍️ Retail (10 subcategories)                                   │
 * │ │     ├── Clothing & Apparel (42 FAQs)                             │
 * │ │     ├── Electronics (36 FAQs)                                    │
 * │ │     └── ... (more)                                               │
 * │ │                                                                   │
 * │ └── ... (more industries)                                          │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 * 
 * Edit Category Modal:
 * - Name
 * - Slug (auto-generated)
 * - Description
 * - Icon picker
 * - Color picker
 * - Parent category (for nesting)
 * - Default agent access
 */
```

---

## Part 6: Business Profile Survey Module

### 6.1 Survey Builder Home

**File:** `Pages/LearningCenter/BusinessProfile/Index.tsx`

```tsx
/**
 * BUSINESS PROFILE SURVEY BUILDER
 * 
 * Overview of 375 questions across 30 sections
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ Business Profile Survey                                             │
 * │ 375 questions • 30 sections • Powers AI agent responses            │
 * │                                                     [Preview Survey]│
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Survey Completion Stats (across all businesses):                    │
 * │ ┌──────────────────────────────────────────────────────────────┐   │
 * │ │ ████████████████░░░░░░░░  68% avg completion                 │   │
 * │ │                                                              │   │
 * │ │ Most completed: Basic Info (94%) • Hours (91%) • Contact (89%)│  │
 * │ │ Least completed: Marketing (34%) • Analytics (28%)           │   │
 * │ └──────────────────────────────────────────────────────────────┘   │
 * │                                                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Sections                                            [+ Add Section] │
 * │ Drag to reorder sections                                            │
 * │                                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ ≡  1. Basic Information                    12 questions   94%  │ │
 * │ │    Required • All industries                         [Edit ▶]  │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ ≡  2. Contact & Location                   15 questions   89%  │ │
 * │ │    Required • All industries                         [Edit ▶]  │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ ≡  3. Hours of Operation                   8 questions    91%  │ │
 * │ │    Required • All industries                         [Edit ▶]  │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ ≡  4. Products & Services                  24 questions   72%  │ │
 * │ │    Optional • Industry-specific questions          [Edit ▶]    │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ... (26 more sections)                                              │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 * 
 * 30 Sections (suggested structure):
 * 1. Basic Information
 * 2. Contact & Location  
 * 3. Hours of Operation
 * 4. Products & Services
 * 5. Pricing Information
 * 6. Payment Methods
 * 7. Delivery & Shipping
 * 8. Staff & Team
 * 9. Certifications & Licenses
 * 10. History & Story
 * 11. Mission & Values
 * 12. Target Audience
 * 13. Unique Selling Points
 * 14. Competitors
 * 15. Marketing Channels
 * 16. Social Media
 * 17. Website & Online Presence
 * 18. Customer Reviews
 * 19. Awards & Recognition
 * 20. Community Involvement
 * 21. Sustainability Practices
 * 22. Accessibility Features
 * 23. Events & Promotions
 * 24. Partnerships
 * 25. Technology & Tools
 * 26. Growth Plans
 * 27. Challenges & Pain Points
 * 28. Success Metrics
 * 29. Media & Press
 * 30. Additional Information
 */
```

### 6.2 Section Editor

**File:** `Pages/LearningCenter/BusinessProfile/Section.tsx`

```tsx
/**
 * SECTION EDITOR
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ← Back to Survey    Section 4: Products & Services       [Preview] │
 * │                                                                     │
 * │ Section Settings                                                    │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ Name: [Products & Services                                    ] │ │
 * │ │ Description: [Information about what you sell or offer...     ] │ │
 * │ │                                                                 │ │
 * │ │ [✓] Required section  [ ] Industry-specific questions          │ │
 * │ │                                                                 │ │
 * │ │ Show this section when:                                         │ │
 * │ │ [Always show ▼] or [Conditional: business_type = retail ▼]     │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Questions (24)                                    [+ Add Question]  │
 * │ Drag to reorder                                                     │
 * │                                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ ≡  Q1. What products or services do you offer? *               │ │
 * │ │    Type: Textarea │ Required │ All industries                  │ │
 * │ │    Auto-populate: SerpAPI ✓                    [Edit] [Delete] │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ ≡  Q2. What is your price range?                               │ │
 * │ │    Type: Select │ Optional │ All industries                    │ │
 * │ │    Options: $ (Budget), $$ (Mid-range), $$$ (Premium), $$$$ .. │ │
 * │ │                                                    [Edit] [Delete]│
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ ≡  Q3. Do you offer any specialty items?                       │ │
 * │ │    Type: Multi-select │ Optional │ Restaurant only             │ │
 * │ │    Options: Vegetarian, Vegan, Gluten-free, Halal, Kosher...  │ │
 * │ │    Conditional: Show when industry = 'restaurant'              │ │
 * │ │                                                    [Edit] [Delete]│
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ... (more questions)                                                │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 */
```

### 6.3 Question Editor Modal

**File:** `Components/LearningCenter/BusinessProfile/QuestionEditor.tsx`

```tsx
/**
 * QUESTION EDITOR MODAL
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ [×]  Edit Question                                [Cancel] [Save]  │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Question Text *                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ What products or services do you offer?                         │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ Help Text (shown below question)                                    │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ List your main offerings. Be specific about what makes them... │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ Question Type *                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ [Text     ▼]  Preview:  [_______________]                      │ │
 * │ │                                                                 │ │
 * │ │ Types:                                                          │ │
 * │ │ • Text (single line)     • Select (dropdown)                   │ │
 * │ │ • Textarea (multi-line)  • Multi-select (checkboxes)           │ │
 * │ │ • Number                 • Scale (1-5, 1-10)                   │ │
 * │ │ • Currency               • Rating (stars)                      │ │
 * │ │ • Date / Time / DateTime • Boolean (yes/no)                    │ │
 * │ │ • Phone / Email / URL    • Address                             │ │
 * │ │ • Media (image/video)    • File upload                         │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ─────────────────────────────────────────────────────────────────── │
 * │                                                                     │
 * │ OPTIONS (for Select/Multi-select)                                   │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ ≡ Option 1: [Budget ($)           ] [×]                        │ │
 * │ │ ≡ Option 2: [Mid-range ($$)       ] [×]                        │ │
 * │ │ ≡ Option 3: [Premium ($$$)        ] [×]                        │ │
 * │ │ ≡ Option 4: [Luxury ($$$$)        ] [×]                        │ │
 * │ │ [+ Add Option]  [✓] Include "Other" option                     │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ SCALE CONFIG (for Scale type)                                       │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ Min: [1]  Max: [10]                                            │ │
 * │ │ Min Label: [Not at all    ]  Max Label: [Extremely       ]     │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ─────────────────────────────────────────────────────────────────── │
 * │                                                                     │
 * │ VALIDATION                                                          │
 * │ [✓] Required                                                       │
 * │ [ ] Minimum length: [___] characters                               │
 * │ [ ] Maximum length: [___] characters                               │
 * │ [ ] Custom pattern: [_______________] (regex)                      │
 * │                                                                     │
 * │ ─────────────────────────────────────────────────────────────────── │
 * │                                                                     │
 * │ CONDITIONAL DISPLAY                                                 │
 * │ [ ] Show this question only when:                                  │
 * │     Question: [Select question... ▼]                               │
 * │     Condition: [equals ▼]  Value: [_______________]                │
 * │                                                                     │
 * │ ─────────────────────────────────────────────────────────────────── │
 * │                                                                     │
 * │ INDUSTRY TARGETING                                                  │
 * │ [●] All industries  [ ] Specific industries only                   │
 * │     [ ] Restaurant  [ ] Retail  [ ] Services  [ ] ...              │
 * │                                                                     │
 * │ ─────────────────────────────────────────────────────────────────── │
 * │                                                                     │
 * │ DATA ENRICHMENT                                                     │
 * │ Auto-populate from:                                                 │
 * │ [●] None  [ ] SerpAPI  [ ] Google                                  │
 * │ [✓] Requires owner verification after auto-populate                │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 */
```

---

## Part 7: Vector Search Module

### 7.1 Search Playground

**File:** `Pages/LearningCenter/Search/Playground.tsx`

```tsx
/**
 * SEMANTIC SEARCH PLAYGROUND
 * 
 * Test and debug vector search functionality
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ Search Playground                                                   │
 * │ Test semantic search across your knowledge base                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Search Query                                                        │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ How do I set up online ordering for my restaurant?              │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ Search Settings                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ Type: [●] Semantic (vector)  [ ] Keyword  [ ] Hybrid           │ │
 * │ │                                                                 │ │
 * │ │ Similarity Threshold: [0.7] ────●────────── 0.0 ──────── 1.0   │ │
 * │ │ Max Results: [10 ▼]                                            │ │
 * │ │                                                                 │ │
 * │ │ Filter by:                                                      │ │
 * │ │ Categories: [All ▼]  Industries: [All ▼]  Source: [All ▼]      │ │
 * │ │ Agent: [Simulate as... ▼]                                      │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ [🔍 Search]                                                         │
 * │                                                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Results (8 found in 124ms)                                          │
 * │                                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ 1. How do I add online ordering to my restaurant?     [0.94]   │ │
 * │ │    ──────────────────────────────────────────────────────────   │ │
 * │ │    To set up online ordering, you'll need to choose a          │ │
 * │ │    platform that integrates with your POS system...            │ │
 * │ │                                                                 │ │
 * │ │    📁 Getting Started  🍽️ Restaurant  🔵 Google  ✓ Verified    │ │
 * │ │                                                                 │ │
 * │ │    [View Full] [Mark Helpful 👍] [Not Helpful 👎] [Edit]        │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ 2. What POS systems support online ordering?          [0.87]   │ │
 * │ │    ──────────────────────────────────────────────────────────   │ │
 * │ │    Several POS systems offer built-in online ordering...       │ │
 * │ │                                                                 │ │
 * │ │    📁 Technology  🍽️ Restaurant  🟢 SerpAPI  ✓ Verified        │ │
 * │ │                                                                 │ │
 * │ │    [View Full] [Mark Helpful 👍] [Not Helpful 👎] [Edit]        │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ... (more results)                                                  │
 * │                                                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Query Analysis                                                      │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ Embedding generated: ✓ (1536 dimensions)                       │ │
 * │ │ Tokens used: 12                                                │ │
 * │ │ Detected intent: Setup/How-to                                  │ │
 * │ │ Key entities: online ordering, restaurant                      │ │
 * │ │                                                                 │ │
 * │ │ Similar queries that might help:                                │ │
 * │ │ • "online ordering setup"                                      │ │
 * │ │ • "restaurant delivery integration"                            │ │
 * │ │ • "digital menu ordering"                                      │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 */
```

### 7.2 Embedding Status Dashboard

**File:** `Components/LearningCenter/VectorSearch/EmbeddingStatus.tsx`

```tsx
/**
 * EMBEDDING STATUS DASHBOARD
 * 
 * Monitor vector embedding generation
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ Embedding Status                              [Refresh] [Process All]│
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Overview                                                            │
 * │ ┌───────────────┬───────────────┬───────────────┬────────────────┐ │
 * │ │   ✓ 392      │   ⏳ 12       │   ⚠ 5        │   ✗ 1          │ │
 * │ │   Embedded   │   Processing  │   Pending    │   Failed       │ │
 * │ └───────────────┴───────────────┴───────────────┴────────────────┘ │
 * │                                                                     │
 * │ Progress: ████████████████████████████░░░░  392/410 (95.6%)        │
 * │                                                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Processing Queue (12)                                               │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ ⏳ "How do I manage inventory..."      Started 2s ago           │ │
 * │ │ ⏳ "What payment methods..."           Started 5s ago           │ │
 * │ │ ⏳ "How to update business hours..."   Queued                   │ │
 * │ │ ... (9 more)                                                    │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ Failed Items (1)                                        [Retry All] │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ ✗ "Content too long..."  Error: Token limit exceeded   [Retry] │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ Pending Items (5)                                   [Process Queue] │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ ⏸ "New FAQ about..."      Created 5 min ago           [Process]│ │
 * │ │ ⏸ "Another FAQ..."        Created 10 min ago          [Process]│ │
 * │ │ ... (3 more)                                                    │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 */
```

---

## Part 8: AI Training Module

### 8.1 Agent Knowledge Configuration

**File:** `Pages/LearningCenter/Training/Index.tsx`

```tsx
/**
 * AI TRAINING OVERVIEW
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ AI Training & Knowledge                                             │
 * │ Configure what each AI agent knows and can access                   │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ AI Agents                                                           │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │                                                                 │ │
 * │ │ 🤖 CRM Manager                                      [Configure]│ │
 * │ │    Access: 410 FAQs • 156 Articles • All industries            │ │
 * │ │    Last trained: 2 hours ago                                   │ │
 * │ │    Performance: 94% accuracy                                   │ │
 * │ │                                                                 │ │
 * │ │ ────────────────────────────────────────────────────────────── │ │
 * │ │                                                                 │ │
 * │ │ 📧 Email Agent                                      [Configure]│ │
 * │ │    Access: 210 FAQs • 45 Articles • All industries             │ │
 * │ │    Last trained: 1 day ago                                     │ │
 * │ │    Performance: 91% accuracy                                   │ │
 * │ │                                                                 │ │
 * │ │ ────────────────────────────────────────────────────────────── │ │
 * │ │                                                                 │ │
 * │ │ 📱 SMS Agent                                        [Configure]│ │
 * │ │    Access: 150 FAQs • 20 Articles • All industries             │ │
 * │ │    Last trained: 3 days ago                                    │ │
 * │ │    Performance: 88% accuracy                                   │ │
 * │ │                                                                 │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Training Datasets                              [+ Create Dataset]   │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ Core Knowledge Base              410 items    Active    [Edit] │ │
 * │ │ Restaurant Specialty             89 items     Active    [Edit] │ │
 * │ │ Retail Focus                     76 items     Draft     [Edit] │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Quick Stats                                                         │
 * │ ┌───────────────┬───────────────┬───────────────┬────────────────┐ │
 * │ │   23         │   12          │   98.2%       │   1.2s         │ │
 * │ │   Pending    │   Low         │   Embedding   │   Avg Query    │ │
 * │ │   Validation │   Helpfulness │   Coverage    │   Time         │ │
 * │ └───────────────┴───────────────┴───────────────┴────────────────┘ │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 */
```

### 8.2 Agent Knowledge Config Detail

**File:** `Components/LearningCenter/AITraining/AgentKnowledgeConfig.tsx`

```tsx
/**
 * AGENT KNOWLEDGE CONFIGURATION
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ← Back    Configure: CRM Manager Agent                      [Save] │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Knowledge Access                                                    │
 * │ ─────────────────────────────────────────────────────────────────── │
 * │                                                                     │
 * │ Categories                                                          │
 * │ [✓] All categories  [ ] Select specific                            │
 * │                                                                     │
 * │ If specific:                                                        │
 * │ [✓] Getting Started    [✓] Products & Services    [✓] Marketing   │
 * │ [✓] Customer Service   [ ] Technical (exclude)    [✓] Billing     │
 * │                                                                     │
 * │ Industries                                                          │
 * │ [✓] All industries  [ ] Select specific                            │
 * │                                                                     │
 * │ Content Types                                                       │
 * │ [✓] FAQs  [✓] Articles  [ ] Business Profile Answers               │
 * │                                                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Response Behavior                                                   │
 * │ ─────────────────────────────────────────────────────────────────── │
 * │                                                                     │
 * │ [✓] Search FAQs first before generating response                   │
 * │                                                                     │
 * │ Confidence Threshold: [0.75] ────●────────── 0.0 ──────── 1.0      │
 * │ (Only use knowledge with similarity score above this)              │
 * │                                                                     │
 * │ When no good match found:                                           │
 * │ [●] Escalate to human                                              │
 * │ [ ] Generate general response                                       │
 * │ [ ] Ask for clarification                                          │
 * │                                                                     │
 * │ Max context items: [5 ▼]                                           │
 * │ (Number of knowledge items to include in context)                  │
 * │                                                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Excluded Content                                                    │
 * │ ─────────────────────────────────────────────────────────────────── │
 * │                                                                     │
 * │ Manually exclude specific items:                                    │
 * │ [Search to add exclusions...]                                       │
 * │                                                                     │
 * │ Currently excluded (3):                                             │
 * │ • "Internal pricing guidelines..." [×]                              │
 * │ • "Staff-only procedures..." [×]                                    │
 * │ • "Competitive analysis..." [×]                                     │
 * │                                                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Test Configuration                                                  │
 * │ ─────────────────────────────────────────────────────────────────── │
 * │                                                                     │
 * │ Query: [How do I set up my account?                              ] │
 * │ [Test Query]                                                        │
 * │                                                                     │
 * │ Results with this config:                                           │
 * │ 1. "Account setup guide..." (0.92) ✓ Would be used                 │
 * │ 2. "Getting started FAQ..." (0.87) ✓ Would be used                 │
 * │ 3. "Password reset..." (0.71) ✗ Below threshold                    │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 */
```

### 8.3 Validation Queue

**File:** `Pages/LearningCenter/Training/Validation.tsx`

```tsx
/**
 * VALIDATION QUEUE
 * 
 * Review and validate content from multiple sources
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ Validation Queue                                                    │
 * │ Review content accuracy across sources                              │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │ Filter: [All ▼] Priority: [All ▼] Type: [All ▼]    23 items       │
 * │                                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ 🔴 HIGH PRIORITY                                                │ │
 * │ │                                                                 │ │
 * │ │ "Restaurant hours discrepancy"                                  │ │
 * │ │ ──────────────────────────────────────────────────────────────  │ │
 * │ │                                                                 │ │
 * │ │ Current (Owner):    Mon-Sat 9am-9pm, Sun Closed                │ │
 * │ │ Google:             Mon-Sat 9am-10pm, Sun 10am-6pm             │ │
 * │ │ SerpAPI:            Mon-Sat 9am-9pm, Sun 10am-5pm              │ │
 * │ │                                                                 │ │
 * │ │ Confidence: 45%  │  Discrepancies: Sunday hours, Closing time  │ │
 * │ │                                                                 │ │
 * │ │ [Use Owner] [Use Google] [Use SerpAPI] [Mark for Owner Review] │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ┌─────────────────────────────────────────────────────────────────┐ │
 * │ │ 🟡 MEDIUM PRIORITY                                              │ │
 * │ │                                                                 │ │
 * │ │ "Service description needs verification"                        │ │
 * │ │ ──────────────────────────────────────────────────────────────  │ │
 * │ │                                                                 │ │
 * │ │ Auto-populated (SerpAPI):                                       │ │
 * │ │ "Full-service restaurant offering Italian cuisine..."           │ │
 * │ │                                                                 │ │
 * │ │ Website says:                                                   │ │
 * │ │ "Family-owned Italian restaurant since 1985..."                │ │
 * │ │                                                                 │ │
 * │ │ Confidence: 72%  │  Missing: founding year, family-owned       │ │
 * │ │                                                                 │ │
 * │ │ [Approve SerpAPI] [Use Website] [Merge Both] [Edit Manually]   │ │
 * │ └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * │ ... (more items)                                                    │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 * 
 * Validation Actions:
 * - Approve as-is (mark as verified)
 * - Choose preferred source
 * - Merge information from multiple sources
 * - Edit manually
 * - Mark as disputed
 * - Request owner verification
 * - Flag as outdated
 */
```

---

## Part 9: Common Components

### 9.1 Source Badge

**File:** `Components/LearningCenter/Common/SourceBadge.tsx`

```tsx
/**
 * SOURCE BADGE
 * 
 * Visual indicator of data source
 * 
 * Variants:
 * 
 * [🔵 Google]     - Blue, for Google-sourced data
 * [🟢 SerpAPI]    - Green, for SerpAPI data
 * [🟣 Website]    - Purple, for website-scraped data
 * [🟠 Owner]      - Amber, for owner-provided data
 * 
 * Sizes: sm, md, lg
 * 
 * Props:
 * - source: 'google' | 'serpapi' | 'website' | 'owner'
 * - size: 'sm' | 'md' | 'lg'
 * - showIcon: boolean
 * - showLabel: boolean
 * - tooltip: boolean (show source description on hover)
 */
```

### 9.2 Validation Indicator

**File:** `Components/LearningCenter/Common/ValidationIndicator.tsx`

```tsx
/**
 * VALIDATION INDICATOR
 * 
 * Shows verification status
 * 
 * States:
 * 
 * [✓ Verified]    - Green, verified by owner or admin
 * [○ Unverified]  - Gray, not yet verified
 * [⚠ Disputed]    - Red, conflicting information
 * [⏰ Outdated]   - Amber, needs refresh
 * 
 * With timestamp: "Verified 2 days ago"
 * With verifier: "Verified by John D."
 */
```

### 9.3 Usage Stats

**File:** `Components/LearningCenter/Common/UsageStats.tsx`

```tsx
/**
 * USAGE STATS
 * 
 * Display content effectiveness metrics
 * 
 * Compact:
 * 👁 234  👍 89%
 * 
 * Expanded:
 * ┌─────────────────────────────┐
 * │ 👁 234 views                │
 * │ 👍 187 helpful (89%)       │
 * │ 👎 23 not helpful (11%)    │
 * │ 🤖 Used by 3 agents        │
 * │ Last used: 2 hours ago     │
 * └─────────────────────────────┘
 */
```

### 9.4 Agent Access Selector

**File:** `Components/LearningCenter/Common/AgentAccessSelector.tsx`

```tsx
/**
 * AGENT ACCESS SELECTOR
 * 
 * Multi-select for assigning knowledge to agents
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ AI Agent Access                                             │
 * │                                                             │
 * │ [●] All agents can access                                  │
 * │ [ ] Specific agents only:                                  │
 * │                                                             │
 * │     [✓] 🤖 CRM Manager                                     │
 * │     [✓] 📧 Email Agent                                     │
 * │     [ ] 📱 SMS Agent                                       │
 * │     [✓] 💬 Chat Agent                                      │
 * │     [ ] 📞 Call Handler                                    │
 * │                                                             │
 * └─────────────────────────────────────────────────────────────┘
 */
```

---

## Part 10: API Routes & Services

### 10.1 API Routes (Laravel)

```php
// routes/api.php (Learning Center section)

Route::prefix('learning')->middleware(['auth:sanctum', 'tenant'])->group(function () {
    
    // Knowledge Base
    Route::apiResource('knowledge', KnowledgeController::class);
    Route::post('knowledge/bulk-import', [KnowledgeController::class, 'bulkImport']);
    Route::post('knowledge/{id}/embed', [KnowledgeController::class, 'generateEmbedding']);
    Route::post('knowledge/embed-all', [KnowledgeController::class, 'generateAllEmbeddings']);
    
    // FAQs
    Route::apiResource('faqs', FAQController::class);
    Route::get('faqs/category/{category}', [FAQController::class, 'byCategory']);
    Route::get('faqs/industry/{industry}', [FAQController::class, 'byIndustry']);
    Route::post('faqs/bulk-import', [FAQController::class, 'bulkImport']);
    Route::post('faqs/{id}/helpful', [FAQController::class, 'markHelpful']);
    Route::post('faqs/{id}/not-helpful', [FAQController::class, 'markNotHelpful']);
    
    // Categories
    Route::apiResource('categories', CategoryController::class);
    Route::post('categories/reorder', [CategoryController::class, 'reorder']);
    Route::get('categories/tree', [CategoryController::class, 'tree']);
    
    // Industries
    Route::apiResource('industries', IndustryController::class);
    Route::get('industries/{id}/subcategories', [IndustryController::class, 'subcategories']);
    
    // Business Profile Survey
    Route::apiResource('survey/sections', SurveySectionController::class);
    Route::post('survey/sections/reorder', [SurveySectionController::class, 'reorder']);
    Route::apiResource('survey/questions', SurveyQuestionController::class);
    Route::post('survey/questions/reorder', [SurveyQuestionController::class, 'reorder']);
    Route::get('survey/analytics', [SurveyController::class, 'analytics']);
    
    // Vector Search
    Route::post('search', [SearchController::class, 'search']);
    Route::post('search/semantic', [SearchController::class, 'semanticSearch']);
    Route::post('search/keyword', [SearchController::class, 'keywordSearch']);
    Route::post('search/hybrid', [SearchController::class, 'hybridSearch']);
    Route::get('search/analytics', [SearchController::class, 'analytics']);
    
    // Embeddings
    Route::get('embeddings/status', [EmbeddingController::class, 'status']);
    Route::post('embeddings/process', [EmbeddingController::class, 'processQueue']);
    Route::post('embeddings/retry/{id}', [EmbeddingController::class, 'retry']);
    
    // AI Training
    Route::apiResource('training/datasets', DatasetController::class);
    Route::post('training/datasets/{id}/train', [DatasetController::class, 'train']);
    Route::get('agents/{id}/knowledge-config', [AgentKnowledgeController::class, 'show']);
    Route::put('agents/{id}/knowledge-config', [AgentKnowledgeController::class, 'update']);
    Route::post('agents/{id}/test-query', [AgentKnowledgeController::class, 'testQuery']);
    
    // Validation
    Route::get('validation/queue', [ValidationController::class, 'queue']);
    Route::post('validation/{id}/approve', [ValidationController::class, 'approve']);
    Route::post('validation/{id}/reject', [ValidationController::class, 'reject']);
    Route::post('validation/{id}/merge', [ValidationController::class, 'merge']);
    Route::post('validation/{id}/request-owner-review', [ValidationController::class, 'requestOwnerReview']);
});
```

### 10.2 Frontend API Service

**File:** `Services/learning/knowledge-api.ts`

```typescript
import { api } from '../api';
import type { 
  KnowledgeArticle, 
  FAQItem, 
  FAQFilters,
  SearchQuery,
  SearchResult 
} from '@/Types/learning';

export const knowledgeApi = {
  // FAQs
  getFAQs: (filters: FAQFilters, page = 1, perPage = 25) =>
    api.get('/learning/faqs', { params: { ...filters, page, per_page: perPage } }),
  
  getFAQ: (id: string) =>
    api.get(`/learning/faqs/${id}`),
  
  createFAQ: (data: Partial<FAQItem>) =>
    api.post('/learning/faqs', data),
  
  updateFAQ: (id: string, data: Partial<FAQItem>) =>
    api.put(`/learning/faqs/${id}`, data),
  
  deleteFAQ: (id: string) =>
    api.delete(`/learning/faqs/${id}`),
  
  bulkImportFAQs: (file: File, options: Record<string, unknown>) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));
    return api.post('/learning/faqs/bulk-import', formData);
  },
  
  markHelpful: (id: string) =>
    api.post(`/learning/faqs/${id}/helpful`),
  
  markNotHelpful: (id: string) =>
    api.post(`/learning/faqs/${id}/not-helpful`),
  
  // Search
  search: (query: SearchQuery): Promise<SearchResult[]> =>
    api.post('/learning/search', query),
  
  semanticSearch: (query: string, options?: Partial<SearchQuery>) =>
    api.post('/learning/search/semantic', { query, ...options }),
  
  // Embeddings
  getEmbeddingStatus: () =>
    api.get('/learning/embeddings/status'),
  
  generateEmbedding: (id: string) =>
    api.post(`/learning/knowledge/${id}/embed`),
  
  processEmbeddingQueue: () =>
    api.post('/learning/embeddings/process'),
  
  // Categories
  getCategoryTree: () =>
    api.get('/learning/categories/tree'),
  
  // Industries
  getIndustries: () =>
    api.get('/learning/industries'),
  
  getIndustrySubcategories: (industryId: string) =>
    api.get(`/learning/industries/${industryId}/subcategories`),
};
```

---

## Part 11: State Management Hooks

### 11.1 useKnowledgeSearch Hook

**File:** `Hooks/LearningCenter/useKnowledgeSearch.ts`

```typescript
/**
 * useKnowledgeSearch
 * 
 * Custom hook for semantic search functionality
 * 
 * Features:
 * - Debounced search (300ms)
 * - Search type toggle (semantic/keyword/hybrid)
 * - Filter management
 * - Results caching
 * - Search history
 * - Analytics tracking
 * 
 * Usage:
 * const { 
 *   query, setQuery,
 *   results, isSearching,
 *   searchType, setSearchType,
 *   filters, setFilters,
 *   search, clearResults
 * } = useKnowledgeSearch();
 */
```

### 11.2 useSurveyBuilder Hook

**File:** `Hooks/LearningCenter/useSurveyBuilder.ts`

```typescript
/**
 * useSurveyBuilder
 * 
 * State management for the business profile survey builder
 * 
 * Features:
 * - Section CRUD with optimistic updates
 * - Question CRUD with drag-and-drop reorder
 * - Undo/redo history
 * - Auto-save drafts
 * - Validation
 * - Preview mode
 * 
 * Usage:
 * const {
 *   sections, 
 *   activeSection, setActiveSection,
 *   addSection, updateSection, deleteSection, reorderSections,
 *   addQuestion, updateQuestion, deleteQuestion, reorderQuestions,
 *   undo, redo, canUndo, canRedo,
 *   isDirty, save, isSaving
 * } = useSurveyBuilder();
 */
```

---

## Part 12: Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up directory structure
- [ ] Create TypeScript types
- [ ] Implement design system CSS
- [ ] Build LearningLayout component
- [ ] Build CategorySidebar component
- [ ] Build SearchHeader component
- [ ] Set up API service layer
- [ ] Create basic routing

### Phase 2: FAQ Module (Week 2)
- [ ] FAQ List page with filters
- [ ] FAQ Card component
- [ ] FAQ Editor modal
- [ ] FAQ Bulk Import wizard
- [ ] FAQ Category Manager
- [ ] Source badges and validation indicators

### Phase 3: Business Profile (Week 3)
- [ ] Survey Builder home page
- [ ] Section Editor
- [ ] Question Editor modal
- [ ] All question type components
- [ ] Conditional logic builder
- [ ] Survey preview mode
- [ ] Response analytics

### Phase 4: Vector Search (Week 4)
- [ ] Search Playground
- [ ] Embedding Status dashboard
- [ ] Search analytics
- [ ] Similar content suggestions

### Phase 5: AI Training (Week 5)
- [ ] Training overview dashboard
- [ ] Agent Knowledge Config
- [ ] Dataset management
- [ ] Validation Queue
- [ ] Performance metrics

### Phase 6: Polish & Integration (Week 6)
- [ ] Real-time updates with Supabase
- [ ] Error handling & loading states
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Integration testing
- [ ] Documentation

---

## Key Implementation Notes

1. **Remove ALL mock data** - Every component should fetch real data from API
2. **Use Supabase Realtime** - Subscribe to knowledge_base changes for live updates
3. **Implement proper error boundaries** - Graceful error handling throughout
4. **Add loading skeletons** - Not spinners, use skeleton placeholders
5. **Keyboard navigation** - Full keyboard support for power users
6. **Batch operations** - Support bulk actions with progress indicators
7. **Optimistic updates** - Update UI immediately, rollback on error
8. **Search debouncing** - 300ms debounce on all search inputs
9. **Infinite scroll** - For long lists instead of pagination where appropriate
10. **Dark mode** - Full dark mode support using CSS variables

---

## Testing Requirements

- Unit tests for all utility functions
- Component tests for all form components
- Integration tests for API calls
- E2E tests for critical user flows:
  - Creating and editing FAQs
  - Bulk import workflow
  - Search functionality
  - Survey builder operations
  - Validation queue workflow
