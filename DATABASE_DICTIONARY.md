# 📚 Database Dictionary
## Fibonacco Learning Center - Railway PostgreSQL Database

**Database:** Railway PostgreSQL  
**Generated:** December 2024  
**Based on:** Laravel Migrations

---

## 📋 TABLE OF CONTENTS

1. [Extensions](#extensions)
2. [Core Tables](#core-tables)
3. [Knowledge Base System](#knowledge-base-system)
4. [Survey System](#survey-system)
5. [Presentation System](#presentation-system)
6. [Industry System](#industry-system)
7. [Database Functions](#database-functions)
8. [Indexes & Performance](#indexes--performance)
9. [Relationships](#relationships)

---

## 🔌 EXTENSIONS

### Enabled Extensions

| Extension | Purpose | Status |
|-----------|---------|--------|
| `uuid-ossp` | UUID generation | ✅ Required |
| `pg_trgm` | Trigram similarity for text search | ✅ Required |
| `vector` | pgvector for semantic search | ⚠️ Optional (if available) |

**Migration:** `2024_12_01_000001_enable_extensions.php`

---

## 📊 CORE TABLES

### migrations
**Purpose:** Laravel migration tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Migration identifier |
| `migration` | VARCHAR(255) | NOT NULL | Migration name |
| `batch` | INTEGER | NOT NULL | Migration batch number |

**Indexes:**
- PRIMARY KEY on `id`

**Migration:** Laravel default

---

### users
**Purpose:** User authentication and profile management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | User identifier |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| `email_verified_at` | TIMESTAMP | NULLABLE | Email verification timestamp |
| `password` | VARCHAR(255) | NOT NULL | Hashed password |
| `remember_token` | VARCHAR(100) | NULLABLE | Remember me token |
| `created_at` | TIMESTAMP | NULLABLE | Creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE on `email`

**Migration:** `0001_01_01_000000_create_users_table.php`

---

### password_reset_tokens
**Purpose:** Password reset token storage

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `email` | VARCHAR(255) | PRIMARY KEY | User email |
| `token` | VARCHAR(255) | NOT NULL | Reset token |
| `created_at` | TIMESTAMP | NULLABLE | Token creation timestamp |

**Indexes:**
- PRIMARY KEY on `email`

**Migration:** `0001_01_01_000000_create_users_table.php`

---

### sessions
**Purpose:** User session storage

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(255) | PRIMARY KEY | Session identifier |
| `user_id` | BIGINT | NULLABLE, FK → users.id | User identifier |
| `ip_address` | VARCHAR(45) | NULLABLE | IP address |
| `user_agent` | TEXT | NULLABLE | User agent string |
| `payload` | LONGTEXT | NOT NULL | Session payload |
| `last_activity` | INTEGER | NOT NULL | Last activity timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id`
- INDEX on `last_activity`
- FOREIGN KEY on `user_id` → `users(id)`

**Migration:** `0001_01_01_000000_create_users_table.php`

---

## 📚 KNOWLEDGE BASE SYSTEM

### knowledge_base
**Purpose:** Core knowledge articles and FAQ content storage

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Knowledge item identifier |
| `tenant_id` | UUID | NOT NULL | Tenant/organization identifier |
| `title` | TEXT | NOT NULL | Article/FAQ title |
| `content` | TEXT | NOT NULL | Full content text |
| `category` | TEXT | NULLABLE | Primary category |
| `subcategory` | TEXT | NULLABLE | Subcategory |
| `industry_codes` | JSON | NULLABLE | Array of industry codes |
| `embedding_status` | VARCHAR(20) | DEFAULT 'pending' | Status: pending, processing, completed, failed |
| `embedding` | TEXT | NULLABLE | pgvector embedding (1536 dimensions) |
| `is_public` | BOOLEAN | DEFAULT true | Public visibility flag |
| `allowed_agents` | JSON | NULLABLE | Array of allowed agent IDs |
| `source` | VARCHAR(20) | NULLABLE | Source: google, serpapi, website, owner |
| `source_url` | TEXT | NULLABLE | Source URL |
| `validation_status` | VARCHAR(20) | DEFAULT 'unverified' | Status: unverified, verified, rejected |
| `validated_at` | TIMESTAMPTZ | NULLABLE | Validation timestamp |
| `validated_by` | UUID | NULLABLE | User who validated |
| `usage_count` | INTEGER | DEFAULT 0 | Number of times accessed |
| `helpful_count` | INTEGER | DEFAULT 0 | Helpful votes |
| `not_helpful_count` | INTEGER | DEFAULT 0 | Not helpful votes |
| `tags` | JSON | NULLABLE | Array of tags |
| `metadata` | JSONB | NULLABLE | Additional metadata |
| `created_by` | UUID | NULLABLE | Creator user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `tenant_id`
- INDEX on `category`
- INDEX on `embedding_status`
- INDEX on `validation_status`
- INDEX on `source`
- GIN INDEX on `tags` (JSON array)
- GIN INDEX on `metadata` (JSONB)
- GIN INDEX on `title` (full-text search)
- GIN INDEX on `content` (full-text search)
- IVFFLAT INDEX on `embedding` (vector similarity, if pgvector available)

**Triggers:**
- `update_knowledge_base_updated_at` - Auto-updates `updated_at` on UPDATE

**Migration:** `2024_12_01_000002_create_knowledge_base_table.php`

---

### faq_categories
**Purpose:** Hierarchical FAQ category organization

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Category identifier |
| `name` | VARCHAR(255) | NOT NULL | Category name |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly slug |
| `description` | TEXT | NULLABLE | Category description |
| `parent_id` | UUID | NULLABLE, FK → faq_categories.id | Parent category (self-reference) |
| `icon` | VARCHAR(50) | NULLABLE | Icon identifier |
| `color` | VARCHAR(7) | NULLABLE | Hex color code |
| `display_order` | INTEGER | DEFAULT 0 | Display order |
| `faq_count` | INTEGER | DEFAULT 0 | Number of FAQs in category |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE on `slug`
- INDEX on `parent_id`
- FOREIGN KEY on `parent_id` → `faq_categories(id)` ON DELETE SET NULL

**Relationships:**
- Self-referential: Categories can have parent categories (hierarchical structure)

**Migration:** `2024_12_01_000003_create_faq_categories_table.php`

---

### articles
**Purpose:** Knowledge articles (separate from knowledge_base for articles specifically)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Article identifier |
| `tenant_id` | UUID | NOT NULL | Tenant identifier |
| `title` | TEXT | NOT NULL | Article title |
| `content` | TEXT | NOT NULL | Article content (rich text) |
| `category` | TEXT | NULLABLE | Article category |
| `subcategory` | TEXT | NULLABLE | Article subcategory |
| `industry_codes` | JSON | NULLABLE | Array of industry codes |
| `tags` | JSON | NULLABLE | Array of tags |
| `source` | VARCHAR(20) | NULLABLE | Source identifier |
| `source_url` | TEXT | NULLABLE | Source URL |
| `usage_count` | INTEGER | DEFAULT 0 | Access count |
| `created_by` | UUID | NULLABLE | Creator user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `tenant_id`
- INDEX on `category`

**Model:** `App\Models\Article`

---

## 📝 SURVEY SYSTEM

### survey_sections
**Purpose:** Survey section organization (30 sections expected)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Section identifier |
| `tenant_id` | UUID | NOT NULL | Tenant identifier |
| `name` | VARCHAR(255) | NOT NULL | Section name |
| `description` | TEXT | NULLABLE | Section description |
| `display_order` | INTEGER | DEFAULT 0 | Display order |
| `is_required` | BOOLEAN | DEFAULT true | Required section flag |
| `is_conditional` | BOOLEAN | DEFAULT false | Conditional display flag |
| `condition_config` | JSONB | NULLABLE | Conditional logic configuration |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `tenant_id`

**Triggers:**
- `update_survey_sections_updated_at` - Auto-updates `updated_at` on UPDATE

**Relationships:**
- One-to-Many with `survey_questions` (section_id)

**Migration:** `2024_12_01_000005_create_survey_tables.php`

---

### survey_questions
**Purpose:** Survey questions (375 questions expected across 30 sections)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Question identifier |
| `section_id` | UUID | NOT NULL, FK → survey_sections.id | Parent section |
| `question_text` | TEXT | NOT NULL | Question text |
| `help_text` | TEXT | NULLABLE | Help text/tooltip |
| `question_type` | VARCHAR(50) | NOT NULL | Type: text, textarea, select, multi-select, scale, etc. |
| `is_required` | BOOLEAN | DEFAULT false | Required question flag |
| `display_order` | INTEGER | DEFAULT 0 | Display order within section |
| `validation_rules` | JSONB | NULLABLE | Validation rules configuration |
| `options` | JSONB | NULLABLE | Options for select/multi-select questions |
| `scale_config` | JSONB | NULLABLE | Scale configuration (min, max, labels) |
| `is_conditional` | BOOLEAN | DEFAULT false | Conditional display flag |
| `show_when` | JSONB | NULLABLE | Conditional display logic |
| `auto_populate_source` | VARCHAR(20) | NULLABLE | Auto-population source |
| `requires_owner_verification` | BOOLEAN | DEFAULT false | Owner verification required |
| `industry_specific` | BOOLEAN | DEFAULT false | Industry-specific question flag |
| `applies_to_industries` | JSON | NULLABLE | Array of industry codes |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `section_id`
- INDEX on `question_type`
- FOREIGN KEY on `section_id` → `survey_sections(id)` ON DELETE CASCADE

**Triggers:**
- `update_survey_questions_updated_at` - Auto-updates `updated_at` on UPDATE

**Question Types:**
- `text` - Single line text input
- `textarea` - Multi-line text input
- `select` - Single selection dropdown
- `multi-select` - Multiple selection
- `scale` - Numeric scale (1-5, 1-10, etc.)
- `boolean` - Yes/No
- `date` - Date picker
- `time` - Time picker
- `datetime` - Date and time
- `email` - Email input
- `phone` - Phone number
- `url` - URL input
- `number` - Numeric input
- `currency` - Currency input
- `percentage` - Percentage input
- `file` - File upload
- `image` - Image upload
- `location` - Location/address

**Migration:** `2024_12_01_000005_create_survey_tables.php`

---

## 🎬 PRESENTATION SYSTEM

### presentation_templates
**Purpose:** Presentation template definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(50) | PRIMARY KEY | Template identifier (e.g., 'HOOK-001') |
| `name` | VARCHAR(255) | NOT NULL | Template name |
| `description` | TEXT | NULLABLE | Template description |
| `purpose` | VARCHAR(100) | NULLABLE | Purpose: hook, educational, how-to |
| `target_audience` | VARCHAR(255) | NULLABLE | Target audience description |
| `slides` | JSONB | NOT NULL | Slide definitions array |
| `audio_base_url` | VARCHAR(500) | NULLABLE | Base URL for audio files |
| `audio_files` | JSONB | NULLABLE | Audio file mapping |
| `injection_points` | JSONB | NULLABLE | Dynamic content injection points |
| `default_theme` | JSONB | NULLABLE | Default theme configuration |
| `default_presenter_id` | VARCHAR(50) | NULLABLE, FK → presenters.id | Default presenter |
| `estimated_duration` | INTEGER | NULLABLE | Estimated duration in seconds |
| `slide_count` | INTEGER | NULLABLE | Number of slides |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`

**Relationships:**
- One-to-Many with `generated_presentations` (template_id)

**Slide Types (in JSONB slides array):**
- `hero` - Hero slide
- `problem` - Problem statement
- `solution` - Solution presentation
- `benefits` - Benefits list
- `features` - Features list
- `testimonial` - Testimonial slide
- `pricing` - Pricing slide
- `cta` - Call-to-action slide
- `stats` - Statistics slide

**Migration:** `2024_12_01_000006_create_presentation_tables.php`

---

### presenters
**Purpose:** AI presenter configurations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(50) | PRIMARY KEY | Presenter identifier |
| `name` | VARCHAR(100) | NOT NULL | Presenter name |
| `role` | VARCHAR(100) | NULLABLE | Role/title |
| `avatar_url` | VARCHAR(500) | NULLABLE | Avatar image URL |
| `voice_provider` | VARCHAR(50) | NULLABLE | Voice provider: elevenlabs |
| `voice_id` | VARCHAR(100) | NULLABLE | Voice ID from provider |
| `voice_settings` | JSONB | NULLABLE | Voice settings (stability, similarity) |
| `personality` | TEXT | NULLABLE | Personality description |
| `communication_style` | TEXT | NULLABLE | Communication style |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`

**Relationships:**
- One-to-Many with `presentation_templates` (default_presenter_id)

**Migration:** `2024_12_01_000006_create_presentation_tables.php`

---

### generated_presentations
**Purpose:** Cached generated presentations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Presentation identifier |
| `tenant_id` | UUID | NOT NULL | Tenant identifier |
| `customer_id` | UUID | NULLABLE | Customer identifier |
| `template_id` | VARCHAR(50) | NULLABLE, FK → presentation_templates.id | Template used |
| `presentation_json` | JSONB | NOT NULL | Complete presentation JSON |
| `audio_base_url` | VARCHAR(500) | NULLABLE | Base URL for generated audio |
| `audio_generated` | BOOLEAN | DEFAULT false | Audio generation status |
| `audio_generated_at` | TIMESTAMPTZ | NULLABLE | Audio generation timestamp |
| `input_hash` | VARCHAR(64) | NULLABLE | Hash of input parameters (for caching) |
| `expires_at` | TIMESTAMPTZ | NULLABLE | Cache expiration timestamp |
| `view_count` | INTEGER | DEFAULT 0 | Number of views |
| `avg_completion_rate` | DECIMAL(5,2) | NULLABLE | Average completion rate percentage |
| `last_viewed_at` | TIMESTAMPTZ | NULLABLE | Last view timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `tenant_id`
- INDEX on `customer_id`
- INDEX on `template_id`
- INDEX on `input_hash`
- FOREIGN KEY on `template_id` → `presentation_templates(id)` ON DELETE SET NULL

**Migration:** `2024_12_01_000006_create_presentation_tables.php`

---

## 🔧 LARAVEL SYSTEM TABLES

### cache
**Purpose:** Application cache storage

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `key` | VARCHAR(255) | PRIMARY KEY | Cache key |
| `value` | MEDIUMTEXT | NOT NULL | Cached value |
| `expiration` | INTEGER | NOT NULL | Expiration timestamp |

**Indexes:**
- PRIMARY KEY on `key`

**Migration:** `0001_01_01_000001_create_cache_table.php`

---

### cache_locks
**Purpose:** Cache lock storage

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `key` | VARCHAR(255) | PRIMARY KEY | Lock key |
| `owner` | VARCHAR(255) | NOT NULL | Lock owner identifier |
| `expiration` | INTEGER | NOT NULL | Lock expiration timestamp |

**Indexes:**
- PRIMARY KEY on `key`

**Migration:** `0001_01_01_000001_create_cache_table.php`

---

### jobs
**Purpose:** Queue job storage

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Job identifier |
| `queue` | VARCHAR(255) | NOT NULL, INDEX | Queue name |
| `payload` | LONGTEXT | NOT NULL | Job payload (serialized) |
| `attempts` | TINYINT UNSIGNED | NOT NULL | Number of attempts |
| `reserved_at` | INTEGER UNSIGNED | NULLABLE | Reservation timestamp |
| `available_at` | INTEGER UNSIGNED | NOT NULL | Available timestamp |
| `created_at` | INTEGER UNSIGNED | NOT NULL | Creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `queue`

**Migration:** `0001_01_01_000002_create_jobs_table.php`

---

### job_batches
**Purpose:** Queue job batch tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(255) | PRIMARY KEY | Batch identifier |
| `name` | VARCHAR(255) | NOT NULL | Batch name |
| `total_jobs` | INTEGER | NOT NULL | Total jobs in batch |
| `pending_jobs` | INTEGER | NOT NULL | Pending jobs count |
| `failed_jobs` | INTEGER | NOT NULL | Failed jobs count |
| `failed_job_ids` | LONGTEXT | NOT NULL | Failed job IDs (serialized) |
| `options` | MEDIUMTEXT | NULLABLE | Batch options |
| `cancelled_at` | INTEGER | NULLABLE | Cancellation timestamp |
| `created_at` | INTEGER | NOT NULL | Creation timestamp |
| `finished_at` | INTEGER | NULLABLE | Completion timestamp |

**Indexes:**
- PRIMARY KEY on `id`

**Migration:** `0001_01_01_000002_create_jobs_table.php`

---

### failed_jobs
**Purpose:** Failed queue job storage

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Failed job identifier |
| `uuid` | VARCHAR(255) | UNIQUE, NOT NULL | Job UUID |
| `connection` | TEXT | NOT NULL | Connection name |
| `queue` | TEXT | NOT NULL | Queue name |
| `payload` | LONGTEXT | NOT NULL | Job payload |
| `exception` | LONGTEXT | NOT NULL | Exception details |
| `failed_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Failure timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE on `uuid`

**Migration:** `0001_01_01_000002_create_jobs_table.php`

---

## 🏭 INDUSTRY SYSTEM

### industry_categories
**Purpose:** Industry category classification

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Industry identifier |
| `name` | VARCHAR(255) | NOT NULL | Industry name |
| `code` | VARCHAR(100) | UNIQUE, NOT NULL | Industry code |
| `parent_industry` | VARCHAR(100) | NULLABLE | Parent industry code |
| `display_order` | INTEGER | DEFAULT 0 | Display order |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE on `code`

**Migration:** `2024_12_01_000004_create_industry_tables.php`

---

### industry_subcategories
**Purpose:** Industry subcategory classification (56 expected)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Subcategory identifier |
| `industry_id` | UUID | NOT NULL, FK → industry_categories.id | Parent industry |
| `name` | VARCHAR(255) | NOT NULL | Subcategory name |
| `code` | VARCHAR(100) | NOT NULL | Subcategory code |
| `faq_count` | INTEGER | DEFAULT 0 | Number of FAQs for this subcategory |
| `profile_questions_count` | INTEGER | DEFAULT 0 | Number of profile questions |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE on (`industry_id`, `code`)
- FOREIGN KEY on `industry_id` → `industry_categories(id)` ON DELETE CASCADE

**Relationships:**
- Many-to-One with `industry_categories` (industry_id)

**Migration:** `2024_12_01_000004_create_industry_tables.php`

---

## 🔧 DATABASE FUNCTIONS

### update_updated_at()
**Purpose:** Trigger function to automatically update `updated_at` timestamp

**Language:** PL/pgSQL

**Usage:** Automatically called by triggers on UPDATE operations

**Triggers Using This Function:**
- `update_knowledge_base_updated_at` on `knowledge_base`
- `update_survey_sections_updated_at` on `survey_sections`
- `update_survey_questions_updated_at` on `survey_questions`

**Migration:** `2024_12_01_000007_create_database_functions.php`

---

### search_knowledge_base()
**Purpose:** Semantic vector search function using pgvector

**Parameters:**
- `p_tenant_id` (UUID) - Tenant identifier
- `p_query_text` (TEXT) - Query text (for reference)
- `p_query_embedding` (vector(1536)) - Query embedding vector
- `p_limit` (INT) - Result limit (default: 10)
- `p_threshold` (FLOAT) - Similarity threshold (default: 0.7)

**Returns:** TABLE with columns:
- `id` (UUID)
- `title` (TEXT)
- `content` (TEXT)
- `category` (TEXT)
- `similarity_score` (FLOAT)
- `source` (VARCHAR(20))
- `validation_status` (VARCHAR(20))

**Algorithm:**
1. Filters by tenant_id
2. Requires embedding to be NOT NULL
3. Requires is_public = true
4. Checks allowed_agents (if specified)
5. Calculates cosine similarity: `1 - (embedding <=> p_query_embedding)`
6. Filters by similarity threshold
7. Orders by similarity (ascending distance)
8. Limits results

**Note:** Only available if pgvector extension is installed

**Migration:** `2024_12_01_000007_create_database_functions.php`

**Example Usage:**
```sql
SELECT * FROM search_knowledge_base(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'How do I set up online ordering?',
    '[0.123, 0.456, ...]'::vector(1536),
    10,
    0.7
);
```

---

## 📈 INDEXES & PERFORMANCE

### Vector Search Indexes

**Table:** `knowledge_base`
- **Index:** `idx_knowledge_base_embedding`
- **Type:** IVFFLAT (Inverted File Index)
- **Operator Class:** `vector_cosine_ops`
- **Lists:** 100
- **Purpose:** Fast vector similarity search
- **Status:** ⚠️ Only created if pgvector extension is available

### Full-Text Search Indexes

**Table:** `knowledge_base`
- **Index:** `idx_knowledge_base_title_search`
- **Type:** GIN (Generalized Inverted Index)
- **Purpose:** Full-text search on title
- **Language:** English

- **Index:** `idx_knowledge_base_content_search`
- **Type:** GIN
- **Purpose:** Full-text search on content
- **Language:** English

### JSON/JSONB Indexes

**Table:** `knowledge_base`
- **Index:** `idx_knowledge_base_tags` (GIN on `tags` JSON)
- **Index:** `idx_knowledge_base_metadata` (GIN on `metadata` JSONB)

### Standard Indexes

**Common Indexes:**
- PRIMARY KEY indexes on all `id` columns
- INDEX on `tenant_id` (multi-tenant filtering)
- INDEX on foreign key columns
- INDEX on frequently filtered columns (`category`, `embedding_status`, `validation_status`, `source`, `question_type`)

---

## 🔗 RELATIONSHIPS

### Entity Relationship Diagram

```
users
  └── (created_by) → knowledge_base
  └── (validated_by) → knowledge_base

faq_categories
  └── (parent_id) → faq_categories (self-reference, hierarchical)

knowledge_base
  └── (industry_codes) → industry_subcategories (via JSON array)

industry_categories
  └── (id) → industry_subcategories (industry_id)

survey_sections
  └── (id) → survey_questions (section_id)

presentation_templates
  └── (id) → generated_presentations (template_id)
  └── (default_presenter_id) → presenters (id)

presenters
  └── (id) → presentation_templates (default_presenter_id)
```

### Relationship Details

#### One-to-Many
- `faq_categories` → `faq_categories` (parent-child hierarchy)
- `industry_categories` → `industry_subcategories`
- `survey_sections` → `survey_questions`
- `presentation_templates` → `generated_presentations`
- `presenters` → `presentation_templates` (default_presenter_id)

#### Many-to-One
- `survey_questions` → `survey_sections`
- `industry_subcategories` → `industry_categories`
- `generated_presentations` → `presentation_templates`

#### Many-to-Many (via JSON arrays)
- `knowledge_base` ↔ `industry_subcategories` (via `industry_codes` JSON array)

---

## 📊 DATA STATISTICS

### Expected Data Volumes

| Table | Expected Records | Notes |
|-------|------------------|-------|
| `knowledge_base` | Variable | Grows with content |
| `faq_categories` | ~20-50 | Hierarchical structure |
| `survey_sections` | 30 | Fixed number |
| `survey_questions` | 375 | Fixed number (30 sections × ~12.5 avg) |
| `industry_categories` | ~10-20 | Main industries |
| `industry_subcategories` | 56 | Fixed number |
| `presentation_templates` | 60+ | Campaign templates |
| `presenters` | ~5-10 | AI presenter configurations |
| `generated_presentations` | Variable | Cached presentations |

---

## 🔐 SECURITY & ACCESS CONTROL

### Multi-Tenancy
- All tenant-scoped tables include `tenant_id` column
- Queries should always filter by `tenant_id`
- Indexes on `tenant_id` for performance

### Access Control Fields
- `is_public` (knowledge_base) - Public visibility flag
- `allowed_agents` (knowledge_base) - Agent whitelist (JSON array)
- `is_active` (presentation_templates, presenters) - Active status

### Validation
- `validation_status` (knowledge_base) - Content validation state
- `validated_by` (knowledge_base) - Validator user ID
- `validated_at` (knowledge_base) - Validation timestamp

---

## 🚀 PERFORMANCE OPTIMIZATION

### Query Optimization Tips

1. **Always filter by tenant_id first** - Use indexed tenant_id column
2. **Use vector search for semantic queries** - More accurate than full-text
3. **Use full-text search for keyword queries** - Faster for simple searches
4. **Leverage JSONB indexes** - For filtering by tags/metadata
5. **Cache generated presentations** - Use `input_hash` for cache lookups

### Index Maintenance

- Vector indexes (IVFFLAT) may need periodic rebuilding as data grows
- GIN indexes are automatically maintained
- Monitor index usage with `pg_stat_user_indexes`

---

## 📝 MIGRATION NOTES

### Migration Order
1. `2024_12_01_000001_enable_extensions.php` - Enable extensions
2. `2024_12_01_000002_create_knowledge_base_table.php` - Knowledge base
3. `2024_12_01_000003_create_faq_categories_table.php` - FAQ categories
4. `2024_12_01_000004_create_industry_tables.php` - Industry tables
5. `2024_12_01_000005_create_survey_tables.php` - Survey tables
6. `2024_12_01_000006_create_presentation_tables.php` - Presentation tables
7. `2024_12_01_000007_create_database_functions.php` - Functions and triggers

### Dependencies
- Extensions must be enabled before vector indexes
- Tables must exist before foreign keys
- Tables must exist before triggers

---

## 🔄 LARAVEL MIGRATION STATUS

**Status:** All migrations defined in Laravel format

**To Run Migrations:**
```bash
cd backend
php artisan migrate
```

**To Rollback:**
```bash
php artisan migrate:rollback
```

---

## 📚 ADDITIONAL RESOURCES

- **Laravel Models:** `backend/app/Models/`
- **Migrations:** `backend/database/migrations/`
- **Database Config:** `backend/config/database.php`

---

**Last Updated:** December 2024  
**Database Version:** PostgreSQL (Railway)  
**Schema Version:** 1.0
