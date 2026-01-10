# Database Tables (from migrations)

## 0001_01_01_000000_create_users_table.php
```php
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
```

## 0001_01_01_000001_create_cache_table.php
```php
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
```

## 0001_01_01_000002_create_jobs_table.php
```php
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
```

## 2024_12_01_000001_enable_extensions.php
```php
            \Log::warning('Vector extension not available: ' . $e->getMessage());
```

## 2024_12_01_000002_create_knowledge_base_table.php
```php
        Schema::create('knowledge_base', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->text('title');
            $table->text('content');
            $table->text('category')->nullable();
            $table->text('subcategory')->nullable();
            $table->json('industry_codes')->nullable();
            $table->string('embedding_status', 20)->default('pending');
            $table->text('embedding')->nullable(); // pgvector type - stored as text in Laravel
            $table->boolean('is_public')->default(true);
            $table->json('allowed_agents')->nullable();
            $table->string('source', 20)->nullable();
            $table->text('source_url')->nullable();
            $table->string('validation_status', 20)->default('unverified');
            $table->timestampTz('validated_at')->nullable();
            $table->uuid('validated_by')->nullable();
            $table->integer('usage_count')->default(0);
            $table->integer('helpful_count')->default(0);
            $table->integer('not_helpful_count')->default(0);
            $table->json('tags')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            $table->index('tenant_id');
            $table->index('category');
            $table->index('embedding_status');
            $table->index('validation_status');
            $table->index('source');
```

## 2024_12_01_000003_create_faq_categories_table.php
```php
        Schema::create('faq_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->uuid('parent_id')->nullable();
            $table->string('icon', 50)->nullable();
            $table->string('color', 7)->nullable();
            $table->integer('display_order')->default(0);
            $table->integer('faq_count')->default(0);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->foreign('parent_id')->references('id')->on('faq_categories')->onDelete('set null');
            $table->index('parent_id');
            $table->index('slug');
```

## 2024_12_01_000004_create_industry_tables.php
```php
        Schema::create('industry_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->string('code', 100)->unique();
            $table->string('parent_industry', 100)->nullable();
            $table->integer('display_order')->default(0);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
        Schema::create('industry_subcategories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('industry_id');
            $table->string('name', 255);
            $table->string('code', 100);
            $table->integer('faq_count')->default(0);
            $table->integer('profile_questions_count')->default(0);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->foreign('industry_id')->references('id')->on('industry_categories')->onDelete('cascade');
            $table->unique(['industry_id', 'code']);
```

## 2024_12_01_000005_create_survey_tables.php
```php
        Schema::create('survey_sections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_required')->default(true);
            $table->boolean('is_conditional')->default(false);
            $table->jsonb('condition_config')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            $table->index('tenant_id');
        Schema::create('survey_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('section_id');
            $table->text('question_text');
            $table->text('help_text')->nullable();
            $table->string('question_type', 50);
            $table->boolean('is_required')->default(false);
            $table->integer('display_order')->default(0);
            $table->jsonb('validation_rules')->nullable();
            $table->jsonb('options')->nullable();
            $table->jsonb('scale_config')->nullable();
            $table->boolean('is_conditional')->default(false);
            $table->jsonb('show_when')->nullable();
            $table->string('auto_populate_source', 20)->nullable();
            $table->boolean('requires_owner_verification')->default(false);
            $table->boolean('industry_specific')->default(false);
            $table->json('applies_to_industries')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
```

## 2024_12_01_000006_create_presentation_tables.php
```php
        Schema::create('presentation_templates', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('purpose', 100)->nullable();
            $table->string('target_audience', 255)->nullable();
            $table->jsonb('slides');
            $table->string('audio_base_url', 500)->nullable();
            $table->jsonb('audio_files')->nullable();
            $table->jsonb('injection_points')->nullable();
            $table->jsonb('default_theme')->nullable();
            $table->string('default_presenter_id', 50)->nullable();
            $table->integer('estimated_duration')->nullable();
            $table->integer('slide_count')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
        Schema::create('presenters', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('name', 100);
            $table->string('role', 100)->nullable();
            $table->string('avatar_url', 500)->nullable();
            $table->string('voice_provider', 50)->nullable();
            $table->string('voice_id', 100)->nullable();
            $table->jsonb('voice_settings')->nullable();
            $table->text('personality')->nullable();
            $table->text('communication_style')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
        Schema::create('generated_presentations', function (Blueprint $table) {
```

## 2024_12_01_000007_create_database_functions.php
```php
        $this->createTriggerIfTableExists('knowledge_base', 'update_knowledge_base_updated_at');
        $this->createTriggerIfTableExists('survey_sections', 'update_survey_sections_updated_at');
        $this->createTriggerIfTableExists('survey_questions', 'update_survey_questions_updated_at');
            Log::warning('Vector search function creation skipped: ' . $e->getMessage());
            Log::warning("Trigger {$triggerName} creation skipped: " . $e->getMessage());
```

## 2024_12_01_000008_create_crm_customers_table.php
```php
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id'); // Multi-tenant support
            $table->string('slug', 100)->unique();
            $table->string('external_id', 100)->nullable(); // ID from external CRM
            $table->string('business_name');
            $table->string('owner_name')->nullable();
            $table->string('industry_id', 50)->nullable(); // References industries table
            $table->string('sub_category', 100)->nullable(); // "pizza", "fine-dining", etc.
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('address_line1')->nullable();
            $table->string('address_line2')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 50)->nullable();
            $table->string('zip', 20)->nullable();
            $table->string('country', 50)->default('US');
            $table->string('timezone', 50)->nullable();
            $table->jsonb('hours')->nullable(); // Operating hours
            $table->jsonb('services')->nullable(); // Services offered
            $table->jsonb('social_media')->nullable(); // Social media links
            $table->string('pos_system', 100)->nullable();
            $table->json('current_integrations')->nullable(); // Array of integration names
            $table->decimal('google_rating', 2, 1)->nullable();
            $table->integer('google_review_count')->nullable();
            $table->decimal('yelp_rating', 2, 1)->nullable();
            $table->integer('yelp_review_count')->nullable();
            $table->integer('established_year')->nullable();
            $table->integer('employee_count')->nullable();
```

## 2024_12_01_000009_create_crm_conversations_table.php
```php
        Schema::create('conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('customer_id')->nullable();
            $table->string('session_id', 100);
            $table->string('entry_point', 100)->nullable(); // 'presentation', 'chat_widget', 'phone', 'sms'
            $table->string('template_id', 50)->nullable();
            $table->integer('slide_at_start')->nullable();
            $table->string('presenter_id', 50)->nullable(); // References presenters table
            $table->string('human_rep_id', 100)->nullable();
            $table->jsonb('messages')->default('[]');
            $table->json('topics_discussed')->nullable(); // Array
            $table->jsonb('questions_asked')->nullable();
            $table->jsonb('objections_raised')->nullable();
            $table->jsonb('sentiment_trajectory')->nullable();
            $table->jsonb('new_data_collected')->nullable();
            $table->json('faqs_generated')->nullable(); // Array of UUIDs
            $table->string('outcome', 50)->nullable(); // 'signup', 'demo_scheduled', 'pricing_sent', etc.
            $table->text('outcome_details')->nullable();
            $table->boolean('followup_needed')->default(false);
            $table->timestampTz('followup_scheduled_at')->nullable();
            $table->text('followup_notes')->nullable();
            $table->timestampTz('started_at')->default(DB::raw('NOW()'));
            $table->timestampTz('ended_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            $table->foreign('customer_id')
```

## 2024_12_01_000010_create_crm_conversation_messages_table.php
```php
        Schema::create('conversation_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conversation_id');
            $table->string('role', 20); // 'user', 'assistant', 'system'
            $table->text('content');
            $table->integer('tokens_used')->nullable();
            $table->string('model_used', 50)->nullable();
            $table->integer('response_time_ms')->nullable();
            $table->jsonb('actions_triggered')->nullable();
            $table->timestampTz('timestamp')->default(DB::raw('NOW()'));
            $table->index('conversation_id');
            $table->index('timestamp');
            $table->index(['conversation_id', 'timestamp']);
            $table->foreign('conversation_id')
                  ->references('id')
                  ->on('conversations')
                  ->onDelete('cascade');
```

## 2024_12_01_000011_create_crm_pending_questions_table.php
```php
        Schema::create('pending_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('customer_id');
            $table->string('field_to_populate', 100);
            $table->string('table_to_update', 50)->default('customers');
            $table->text('question');
            $table->text('context')->nullable(); // Why we're asking / when to ask
            $table->json('alternative_phrasings')->nullable(); // Array
            $table->integer('priority')->default(5); // 1-10, higher = more important
            $table->json('ask_during')->nullable(); // Array: ['onboarding', 'pricing_discussion', 'any']
            $table->boolean('asked')->default(false);
            $table->timestampTz('asked_at')->nullable();
            $table->uuid('asked_in_conversation_id')->nullable();
            $table->boolean('answered')->default(false);
            $table->text('answer')->nullable();
            $table->timestampTz('answered_at')->nullable();
            $table->boolean('needs_verification')->default(false);
            $table->boolean('verified')->default(false);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index(['customer_id', 'asked', 'answered']);
            $table->index('priority');
            $table->foreign('customer_id')
                  ->references('id')
                  ->on('customers')
                  ->onDelete('cascade');
```

## 2024_12_01_000012_create_crm_customer_faqs_table.php
```php
        Schema::create('customer_faqs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('customer_id');
            $table->text('question');
            $table->text('answer');
            $table->string('short_answer', 255)->nullable();
            $table->string('category', 50)->nullable();
            $table->json('keywords')->nullable(); // Array
            $table->string('source', 50); // 'owner_conversation', 'website_scrape', 'manual', 'inferred'
            $table->string('confidence', 20); // 'confirmed', 'likely', 'needs_verification'
            $table->uuid('source_conversation_id')->nullable();
            $table->boolean('verified_by_owner')->default(false);
            $table->timestampTz('verified_at')->nullable();
            $table->boolean('should_ask_clarification')->default(false);
            $table->text('clarification_question')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index(['customer_id', 'is_active']);
            $table->index('source');
            $table->foreign('customer_id')
                  ->references('id')
                  ->on('customers')
                  ->onDelete('cascade');
```

## 2025_12_25_000001_create_services_catalog_tables.php
```php
        Schema::create('service_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['tenant_id', 'is_active']);
        Schema::create('services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable();
            $table->foreignUuid('service_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->text('long_description')->nullable();
            $table->json('images')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->string('service_type')->nullable(); // 'day.news', 'goeventcity', 'downtownsguide', 'golocalvoices', 'alphasite', 'fibonacco'
            $table->string('service_tier')->nullable(); // 'basic', 'standard', 'premium', 'enterprise'
            $table->boolean('is_subscription')->default(false); // Recurring vs one-time
            $table->string('billing_period')->nullable(); // 'monthly', 'annual', 'one-time'
            $table->json('features')->nullable(); // Array of features
            $table->json('capabilities')->nullable(); // What it does
            $table->json('integrations')->nullable(); // What it connects to
            $table->integer('quantity')->default(0); // For inventory tracking (if needed)
```

## 2025_12_25_000002_create_outbound_campaigns_tables.php
```php
        Schema::create('outbound_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->string('type'); // 'email', 'phone', 'sms'
            $table->enum('status', ['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'])->default('draft');
            $table->string('subject')->nullable(); // For email
            $table->text('message'); // Message content
            $table->string('template_id')->nullable(); // Template reference
            $table->json('template_variables')->nullable(); // Template variables
            $table->timestampTz('scheduled_at')->nullable();
            $table->timestampTz('started_at')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->json('recipient_segments')->nullable(); // Segmentation criteria
            $table->integer('total_recipients')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('delivered_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->integer('opened_count')->default(0); // Email only
            $table->integer('clicked_count')->default(0); // Email only
            $table->integer('replied_count')->default(0); // Email/SMS
            $table->integer('answered_count')->default(0); // Phone only
            $table->integer('voicemail_count')->default(0); // Phone only
            $table->json('metadata')->nullable();
            $table->text('notes')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            $table->index('tenant_id');
            $table->index('type');
            $table->index('status');
```

## 2025_12_25_000003_create_content_workflow_tables.php
```php
        Schema::create('content_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type'); // 'article', 'blog', 'social', 'email', 'landing_page'
            $table->text('description')->nullable();
            $table->text('prompt_template'); // AI prompt template with variables
            $table->json('variables')->nullable(); // Available template variables
            $table->json('structure')->nullable(); // Content structure/outline
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            $table->index('tenant_id');
            $table->index('type');
            $table->index('slug');
        Schema::create('generated_content', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('title');
            $table->string('slug')->nullable();
            $table->string('type'); // 'article', 'blog', 'social', 'email', 'landing_page'
            $table->enum('status', ['draft', 'review', 'approved', 'published', 'archived'])->default('draft');
            $table->text('content'); // HTML/markdown content
            $table->text('excerpt')->nullable();
            $table->json('metadata')->nullable(); // SEO, tags, categories, etc.
            $table->uuid('campaign_id')->nullable(); // Source campaign
            $table->uuid('template_id')->nullable(); // Used template
            $table->json('generation_params')->nullable(); // Parameters used for generation
            $table->uuid('assigned_to')->nullable(); // Reviewer/approver
```

## 2025_12_25_000004_create_ads_table.php
```php
        Schema::create('ad_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('platform'); // 'facebook', 'google', 'instagram', 'linkedin', 'twitter', 'display'
            $table->string('ad_type'); // 'image', 'video', 'carousel', 'text', 'story'
            $table->text('description')->nullable();
            $table->json('structure')->nullable(); // Ad structure (headline, description, CTA, etc.)
            $table->text('prompt_template')->nullable(); // AI prompt template
            $table->json('variables')->nullable(); // Available template variables
            $table->json('specs')->nullable(); // Platform-specific specs (dimensions, file sizes, etc.)
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            $table->index('tenant_id');
            $table->index('platform');
            $table->index('ad_type');
            $table->index('slug');
        Schema::create('generated_ads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->string('platform'); // 'facebook', 'google', 'instagram', 'linkedin', 'twitter', 'display'
            $table->string('ad_type'); // 'image', 'video', 'carousel', 'text', 'story'
            $table->enum('status', ['draft', 'review', 'approved', 'scheduled', 'active', 'paused', 'archived'])->default('draft');
            $table->string('headline')->nullable();
            $table->text('description')->nullable();
            $table->string('call_to_action')->nullable();
            $table->string('destination_url')->nullable();
```

## 2025_12_25_000005_create_ai_personalities_tables.php
```php
        Schema::create('ai_personalities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('identity'); // Name/identity (e.g., "Sarah", "Marketing Expert")
            $table->text('persona_description'); // Detailed persona description
            $table->text('communication_style'); // How they communicate
            $table->json('traits')->nullable(); // Personality traits (array)
            $table->json('expertise_areas')->nullable(); // Areas of expertise
            $table->boolean('can_email')->default(true);
            $table->boolean('can_call')->default(false);
            $table->boolean('can_sms')->default(false);
            $table->boolean('can_chat')->default(true);
            $table->string('contact_email')->nullable(); // Personality-specific email
            $table->string('contact_phone')->nullable(); // Personality-specific phone
            $table->text('system_prompt'); // System prompt for AI
            $table->text('greeting_message')->nullable(); // Default greeting
            $table->json('custom_instructions')->nullable(); // Custom AI instructions
            $table->string('ai_model')->default('anthropic/claude-3.5-sonnet'); // AI model to use
            $table->decimal('temperature', 3, 2)->default(0.7); // AI temperature
            $table->json('active_hours')->nullable(); // When personality is active
            $table->json('working_days')->nullable(); // Days of week active
            $table->string('timezone')->default('UTC');
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0); // Higher priority personalities used first
            $table->json('metadata')->nullable();
            $table->text('notes')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
```

## fix-uuid-defaults.php
```php
    $pattern = '/\$table->uuid\([\'"]id[\'"]\)->primary\(\)->default\(DB::raw\([\'"]uuid_generate_v4\(\)[\'"]\)\);/';
    $replacement = "\$table->uuid('id')->primary();";
```

