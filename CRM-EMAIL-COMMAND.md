# FIBONACCO OPERATIONS PLATFORM
## Complete Implementation Specification for Cursor AI
### Railway + Cloudflare + ElevenLabs + Twilio Stack

**Version:** 2.0  
**Date:** December 3, 2025  
**Status:** Ready for Implementation

---

# TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Database Schema - Operations DB](#database-schema)
4. [Laravel Application Structure](#laravel-application)
5. [Campaign Engine](#campaign-engine)
6. [API Endpoints](#api-endpoints)
7. [Learning Center Integration](#learning-center-integration)
8. [Command Center Vue.js App](#command-center)
9. [Content System Integration](#content-integration)
10. [Railway Infrastructure](#railway-infrastructure)
11. [Cloudflare Configuration](#cloudflare-configuration)
12. [Implementation Phases](#implementation-phases)
13. [File-by-File Implementation](#file-implementation)

---

# EXECUTIVE SUMMARY

## What We're Building

A complete **Operations Platform** that handles:
- **Campaign Engine**: 90-day email sequences to 4M businesses
- **Customer Intelligence**: Complete SMB knowledge base for AI
- **Commerce**: All orders, subscriptions, billing
- **Command Center**: Unified business owner dashboard
- **Learning Center**: Landing pages with AI chat

## Architecture Decision

**TWO SEPARATE DATABASES:**

| Database | Purpose | Workload |
|----------|---------|----------|
| **Content DB** (Existing) | Day.News, GoEventCity, DowntownGuide | Read-heavy, public-facing |
| **Operations DB** (New) | Campaigns, CRM, AI, Commerce | Write-heavy, internal |

**WHY:** Mixing 2.7M daily email operations with public website queries would kill performance.

## Technology Stack

| Component | Service |
|-----------|---------|
| **Hosting** | Railway |
| **Database** | Railway PostgreSQL |
| **Cache/Queue** | Railway Redis |
| **CDN/Static** | Cloudflare R2 + Pages |
| **Email** | AWS SES (or Resend) |
| **SMS** | Twilio |
| **Voice** | ElevenLabs |
| **Payments** | Stripe |
| **Backend** | Laravel 11 + PHP 8.3 |
| **Frontend** | Vue.js 3 + Vite + Tailwind |

---

# ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         FIBONACCO PLATFORM ARCHITECTURE                          │
│                         (Railway + Cloudflare Stack)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                         CLOUDFLARE LAYER                                 │   │
│   │                                                                          │   │
│   │   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐       │   │
│   │   │ Command Center  │   │ Learning Center │   │  Content Sites  │       │   │
│   │   │ (Cloudflare     │   │ (Cloudflare     │   │ (Existing or    │       │   │
│   │   │  Pages)         │   │  Pages + R2)    │   │  Railway)       │       │   │
│   │   │                 │   │                 │   │                 │       │   │
│   │   │ • Dashboard     │   │ • Presentations │   │ • Day.News      │       │   │
│   │   │ • AI Config     │   │ • AI Chat       │   │ • GoEventCity   │       │   │
│   │   │ • Billing       │   │ • Lead Capture  │   │ • DowntownGuide │       │   │
│   │   │ • Publishing    │   │ • Audio (R2)    │   │                 │       │   │
│   │   └────────┬────────┘   └────────┬────────┘   └────────┬────────┘       │   │
│   │            │                     │                     │                │   │
│   └────────────┼─────────────────────┼─────────────────────┼────────────────┘   │
│                │                     │                     │                    │
│                ▼                     ▼                     ▼                    │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                         RAILWAY LAYER                                    │   │
│   │                                                                          │   │
│   │   ┌───────────────────────────────────┐   ┌───────────────────────────┐ │   │
│   │   │     OPERATIONS API (Laravel)      │   │   CONTENT API (Existing)  │ │   │
│   │   │     (Railway Service)             │   │   (Railway Service)       │ │   │
│   │   │                                   │   │                           │ │   │
│   │   │ /api/businesses                   │   │ /api/listings             │ │   │
│   │   │ /api/campaigns                    │◄──│ /api/events               │ │   │
│   │   │ /api/orders                       │──►│ /api/articles             │ │   │
│   │   │ /api/subscriptions                │   │ /api/communities          │ │   │
│   │   │ /api/ai-config                    │   │                           │ │   │
│   │   │ /api/conversations                │   │                           │ │   │
│   │   │ /api/webhooks/*                   │   │                           │ │   │
│   │   └───────────────────────────────────┘   └───────────────────────────┘ │   │
│   │                                                                          │   │
│   │   ┌───────────────────────────────────┐   ┌───────────────────────────┐ │   │
│   │   │     CAMPAIGN WORKER               │   │     QUEUE WORKER          │ │   │
│   │   │     (Railway Service)             │   │     (Railway Service)     │ │   │
│   │   │                                   │   │                           │ │   │
│   │   │ • Process email queue             │   │ • General job processing  │ │   │
│   │   │ • Process SMS queue               │   │ • Webhook processing      │ │   │
│   │   │ • Process voice queue             │   │ • Lead scoring            │ │   │
│   │   └───────────────────────────────────┘   └───────────────────────────┘ │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                │                                                                │
│                ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                         RAILWAY DATABASE LAYER                           │   │
│   │                                                                          │   │
│   │   ┌───────────────────────────────────┐   ┌───────────────────────────┐ │   │
│   │   │       OPERATIONS DB               │   │       CONTENT DB          │ │   │
│   │   │       (Railway PostgreSQL)        │   │       (Railway PostgreSQL)│ │   │
│   │   │                                   │   │                           │ │   │
│   │   │ • businesses (replica)            │◄──│ • businesses (master)     │ │   │
│   │   │ • communities (replica)           │   │ • communities (master)    │ │   │
│   │   │ • people                          │   │ • events                  │ │   │
│   │   │ • subscriptions                   │   │ • articles                │ │   │
│   │   │ • orders                          │   │ • users                   │ │   │
│   │   │ • products                        │   │ • media                   │ │   │
│   │   │ • campaign_steps                  │   │ • categories              │ │   │
│   │   │ • send_log                        │   │                           │ │   │
│   │   │ • activities                      │   │                           │ │   │
│   │   │ • conversations                   │   │                           │ │   │
│   │   │ • business_faqs                   │   │                           │ │   │
│   │   │ • business_services               │   │                           │ │   │
│   │   │ • ai_configs                      │   │                           │ │   │
│   │   └───────────────────────────────────┘   └───────────────────────────┘ │   │
│   │                                                                          │   │
│   │   ┌───────────────────────────────────┐                                 │   │
│   │   │       REDIS                       │                                 │   │
│   │   │       (Railway Redis)             │                                 │   │
│   │   │                                   │                                 │   │
│   │   │ • Queue jobs                      │                                 │   │
│   │   │ • Cache                           │                                 │   │
│   │   │ • Session                         │                                 │   │
│   │   └───────────────────────────────────┘                                 │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                │                                                                │
│                ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                         EXTERNAL SERVICES                                │   │
│   │                                                                          │   │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│   │   │ AWS SES  │  │  Twilio  │  │ Eleven   │  │  Stripe  │  │Cloudflare│ │   │
│   │   │ (Email)  │  │  (SMS)   │  │  Labs    │  │(Payments)│  │   R2     │ │   │
│   │   │          │  │          │  │ (Voice)  │  │          │  │ (Files)  │ │   │
│   │   └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

# DATABASE SCHEMA

## Overview

The Operations database contains all CRM, campaign, commerce, and AI configuration data.

## Migration Files

### Migration 001: Core Tables

```php
<?php
// database/migrations/2025_01_01_000001_create_core_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =====================================================================
        // COMMUNITIES (Replicated from Content DB)
        // =====================================================================
        Schema::create('communities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('state', 2);
            $table->string('county')->nullable();
            $table->jsonb('zip_codes')->nullable();
            $table->integer('population')->nullable();
            $table->integer('business_count')->default(0);
            
            // Deployment tracking
            $table->enum('status', ['pending', 'deploying', 'active', 'paused'])->default('pending');
            $table->timestamp('deployed_at')->nullable();
            
            // Sync tracking
            $table->integer('content_db_id')->nullable()->index();
            $table->timestamp('synced_at')->nullable();
            
            $table->timestamps();
            
            $table->index('status');
            $table->index('state');
        });

        // =====================================================================
        // INDUSTRIES
        // =====================================================================
        Schema::create('industries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            
            // AI context
            $table->jsonb('terminology')->nullable(); // {"customer": "guest", "appointment": "reservation"}
            $table->jsonb('common_pain_points')->nullable();
            $table->jsonb('common_services')->nullable();
            $table->jsonb('common_objections')->nullable();
            
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        // =====================================================================
        // BUSINESSES (Replicated from Content DB + Extended)
        // =====================================================================
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_id')->constrained()->onDelete('cascade');
            $table->foreignId('industry_id')->nullable()->constrained()->onDelete('set null');
            
            // Core identity (synced from Content DB)
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('legal_name')->nullable();
            $table->text('description')->nullable();
            
            // Location
            $table->string('address_street')->nullable();
            $table->string('address_city')->nullable();
            $table->string('address_state', 2)->nullable();
            $table->string('address_zip', 10)->nullable();
            $table->decimal('address_lat', 10, 8)->nullable();
            $table->decimal('address_lng', 11, 8)->nullable();
            
            // Contact
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('website', 500)->nullable();
            
            // Operations
            $table->jsonb('hours_of_operation')->nullable();
            $table->string('employee_count_range', 20)->nullable();
            $table->integer('year_established')->nullable();
            $table->string('annual_revenue_range', 20)->nullable();
            
            // Online presence
            $table->string('google_business_id', 100)->nullable();
            $table->string('facebook_url', 500)->nullable();
            $table->string('instagram_handle', 100)->nullable();
            $table->string('yelp_url', 500)->nullable();
            
            // CRM Status
            $table->enum('lead_status', [
                'prospect', 'lead', 'qualified', 'trial', 'customer', 'churned', 'unsubscribed'
            ])->default('prospect');
            $table->integer('lead_score')->default(0);
            $table->integer('health_score')->nullable(); // Only for customers
            
            // Source tracking
            $table->string('source', 100)->nullable();
            $table->string('source_detail')->nullable();
            
            // Sync tracking
            $table->integer('content_db_id')->nullable()->index();
            $table->timestamp('synced_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('lead_status');
            $table->index('lead_score');
            $table->index(['community_id', 'lead_status']);
        });

        // =====================================================================
        // PEOPLE (Contacts at businesses)
        // =====================================================================
        Schema::create('people', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            
            // Identity
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            
            // Role
            $table->string('title', 100)->nullable();
            $table->enum('role', [
                'owner', 'manager', 'marketing', 'operations', 'tech', 'staff', 'other'
            ])->default('other');
            $table->boolean('is_primary_contact')->default(false);
            $table->boolean('is_decision_maker')->default(false);
            
            // Communication preferences
            $table->enum('preferred_channel', ['email', 'sms', 'phone'])->default('email');
            $table->string('best_time_to_contact', 50)->nullable();
            $table->boolean('do_not_email')->default(false);
            $table->boolean('do_not_sms')->default(false);
            $table->boolean('do_not_call')->default(false);
            
            // Engagement stats
            $table->integer('total_emails_sent')->default(0);
            $table->integer('total_emails_opened')->default(0);
            $table->integer('total_clicks')->default(0);
            $table->timestamp('last_engaged_at')->nullable();
            
            // Campaign sequence tracking
            $table->integer('sequence_step')->default(1);
            $table->timestamp('sequence_started_at')->nullable();
            $table->timestamp('next_send_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('email');
            $table->index(['business_id', 'is_primary_contact']);
            $table->index('next_send_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('people');
        Schema::dropIfExists('businesses');
        Schema::dropIfExists('industries');
        Schema::dropIfExists('communities');
    }
};
```

### Migration 002: Products & Commerce

```php
<?php
// database/migrations/2025_01_01_000002_create_commerce_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =====================================================================
        // PRODUCTS
        // =====================================================================
        Schema::create('products', function (Blueprint $table) {
            $table->string('id', 50)->primary(); // e.g., 'ai-receptionist'
            $table->string('name');
            $table->text('description')->nullable();
            
            $table->enum('type', ['subscription', 'addon', 'onetime']);
            $table->enum('category', ['content', 'ai', 'bundle', 'service']);
            
            // Pricing
            $table->decimal('price_monthly', 10, 2)->nullable();
            $table->decimal('price_annual', 10, 2)->nullable();
            $table->decimal('price_onetime', 10, 2)->nullable();
            
            // Display
            $table->jsonb('features')->nullable();
            $table->string('icon', 50)->nullable();
            $table->integer('display_order')->default(0);
            
            // Fulfillment
            $table->string('fulfillment_type', 50)->nullable(); // 'operations', 'content', 'both'
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // =====================================================================
        // SUBSCRIPTIONS
        // =====================================================================
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->string('product_id', 50);
            
            $table->enum('status', [
                'trial', 'active', 'past_due', 'cancelled', 'expired'
            ])->default('trial');
            
            // Dates
            $table->timestamp('trial_started_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            
            // Billing
            $table->enum('billing_cycle', ['monthly', 'annual'])->default('monthly');
            $table->decimal('price', 10, 2);
            
            // Stripe
            $table->string('stripe_subscription_id')->nullable();
            $table->string('stripe_customer_id')->nullable();
            
            $table->timestamps();
            
            $table->foreign('product_id')->references('id')->on('products');
            $table->index(['business_id', 'status']);
            $table->index('stripe_subscription_id');
        });

        // =====================================================================
        // ORDERS
        // =====================================================================
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            
            $table->enum('status', [
                'pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'
            ])->default('pending');
            
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            
            // Payment
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_checkout_session_id')->nullable();
            $table->timestamp('paid_at')->nullable();
            
            // Source
            $table->string('source', 50)->nullable(); // 'command_center', 'content_site', 'learning_center'
            $table->string('campaign_id', 20)->nullable();
            
            $table->timestamps();
            
            $table->index(['business_id', 'status']);
            $table->index('stripe_payment_intent_id');
        });

        // =====================================================================
        // ORDER ITEMS
        // =====================================================================
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('product_id', 50);
            
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total', 10, 2);
            
            $table->timestamps();
            
            $table->foreign('product_id')->references('id')->on('products');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('products');
    }
};
```

### Migration 003: Campaign Engine

```php
<?php
// database/migrations/2025_01_01_000003_create_campaign_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =====================================================================
        // CAMPAIGN SEQUENCES
        // =====================================================================
        Schema::create('campaign_sequences', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // =====================================================================
        // CAMPAIGN STEPS (The 60 emails in 90 days)
        // =====================================================================
        Schema::create('campaign_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sequence_id')->constrained('campaign_sequences')->onDelete('cascade');
            
            $table->integer('step_number');
            $table->integer('day_offset'); // Day 1, 2, 3, 8, 9, etc.
            
            // Campaign reference
            $table->string('campaign_id', 20); // "HOOK-001", "EDU-001"
            $table->string('template_id', 50); // "claim-listing"
            $table->string('landing_page', 100); // "claim-your-listing"
            
            // Email content
            $table->string('subject');
            $table->string('preview_text')->nullable();
            
            // Channel
            $table->enum('channel', ['email', 'sms', 'voice'])->default('email');
            
            // Conditions
            $table->jsonb('conditions')->nullable();
            // Example: {"skip_if_opened": true, "skip_if_tag": "engaged"}
            
            $table->timestamps();
            
            $table->unique(['sequence_id', 'step_number']);
            $table->index(['sequence_id', 'day_offset']);
        });

        // =====================================================================
        // SEND LOG (Billions of rows - partitioned)
        // =====================================================================
        Schema::create('send_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->onDelete('cascade');
            $table->foreignId('campaign_step_id')->nullable()->constrained('campaign_steps')->onDelete('set null');
            
            $table->enum('channel', ['email', 'sms', 'voice']);
            
            // Timing
            $table->timestamp('sent_at')->useCurrent();
            $table->timestamp('delivered_at')->nullable();
            
            // Provider tracking
            $table->string('provider_message_id')->nullable();
            
            // Engagement
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->timestamp('replied_at')->nullable();
            
            // Failures
            $table->timestamp('bounced_at')->nullable();
            $table->timestamp('complained_at')->nullable();
            $table->string('failure_reason')->nullable();
            
            $table->index('person_id');
            $table->index('provider_message_id');
            $table->index('sent_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('send_log');
        Schema::dropIfExists('campaign_steps');
        Schema::dropIfExists('campaign_sequences');
    }
};
```

### Migration 004: Engagement & Activities

```php
<?php
// database/migrations/2025_01_01_000004_create_engagement_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =====================================================================
        // ACTIVITIES (Unified timeline)
        // =====================================================================
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('person_id')->nullable()->constrained()->onDelete('set null');
            
            $table->enum('type', [
                // Email
                'email_sent', 'email_opened', 'email_clicked', 'email_bounced', 'email_complained',
                // SMS
                'sms_sent', 'sms_delivered', 'sms_replied', 'sms_failed',
                // Voice (ElevenLabs)
                'call_outbound', 'call_inbound', 'voicemail_left', 'call_answered',
                // Web
                'page_visited', 'presentation_watched', 'presentation_completed',
                'form_submitted', 'document_downloaded',
                // AI
                'chat_started', 'chat_message', 'chat_ended',
                // Commerce
                'order_created', 'order_paid', 'subscription_started', 
                'subscription_cancelled', 'subscription_renewed',
                // Support
                'support_ticket_created', 'support_ticket_resolved',
                // Internal
                'note_added', 'task_created', 'task_completed', 'status_changed'
            ]);
            
            // Details
            $table->string('subject')->nullable();
            $table->text('detail')->nullable();
            $table->jsonb('metadata')->nullable();
            
            // References
            $table->string('campaign_id', 20)->nullable();
            $table->integer('campaign_step')->nullable();
            $table->string('source', 100)->nullable();
            
            $table->timestamp('occurred_at')->useCurrent();
            
            $table->index(['business_id', 'occurred_at']);
            $table->index('type');
            $table->index('occurred_at');
        });

        // =====================================================================
        // CONVERSATIONS (AI chat transcripts)
        // =====================================================================
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('person_id')->nullable()->constrained()->onDelete('set null');
            
            // Context
            $table->enum('channel', ['chat', 'voice', 'sms']);
            $table->string('source', 100)->nullable(); // 'learning_center', 'alphasite', 'inbound'
            $table->string('landing_page', 100)->nullable();
            $table->string('campaign_id', 20)->nullable();
            
            // Transcript
            $table->jsonb('messages'); // Full message history
            $table->text('summary')->nullable(); // AI-generated summary
            
            // Outcomes
            $table->string('intent_detected', 100)->nullable();
            $table->jsonb('products_discussed')->nullable();
            $table->jsonb('pain_points_captured')->nullable();
            $table->jsonb('objections_captured')->nullable();
            $table->jsonb('action_items')->nullable();
            
            // AI handling
            $table->string('ai_persona', 50)->nullable(); // 'sarah', 'lisa', 'emma'
            $table->string('elevenlabs_voice_id', 50)->nullable(); // ElevenLabs voice used
            $table->boolean('escalated_to_human')->default(false);
            $table->integer('satisfaction_rating')->nullable(); // 1-5
            
            // Timing
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->integer('message_count')->default(0);
            
            $table->timestamps();
            
            $table->index('business_id');
            $table->index('started_at');
        });

        // =====================================================================
        // PRODUCT INTERESTS
        // =====================================================================
        Schema::create('product_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->string('product_id', 50);
            
            $table->enum('interest_level', [
                'viewed', 'engaged', 'inquired', 'demo_requested', 'quoted', 'declined'
            ])->default('viewed');
            
            // Source
            $table->string('source', 100)->nullable();
            $table->string('source_detail')->nullable();
            
            // Tracking
            $table->timestamp('first_shown_at')->useCurrent();
            $table->timestamp('last_shown_at')->useCurrent();
            $table->integer('view_count')->default(1);
            
            $table->timestamps();
            
            $table->foreign('product_id')->references('id')->on('products');
            $table->unique(['business_id', 'product_id']);
        });

        // =====================================================================
        // PAIN POINTS
        // =====================================================================
        Schema::create('pain_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('conversation_id')->nullable()->constrained()->onDelete('set null');
            
            $table->string('category', 100); // 'missed_calls', 'no_time_marketing', etc.
            $table->text('description');
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            
            $table->string('source', 100)->nullable();
            $table->timestamp('captured_at')->useCurrent();
            
            $table->timestamps();
            
            $table->index('business_id');
        });

        // =====================================================================
        // OBJECTIONS
        // =====================================================================
        Schema::create('objections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('person_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('conversation_id')->nullable()->constrained()->onDelete('set null');
            
            $table->string('objection_type', 100); // 'price', 'timing', 'trust', 'technical'
            $table->text('objection_text');
            
            // Response
            $table->text('response_given')->nullable();
            $table->boolean('resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            
            $table->string('source', 100)->nullable();
            $table->timestamp('captured_at')->useCurrent();
            
            $table->timestamps();
            
            $table->index('business_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('objections');
        Schema::dropIfExists('pain_points');
        Schema::dropIfExists('product_interests');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('activities');
    }
};
```

### Migration 005: AI Configuration

```php
<?php
// database/migrations/2025_01_01_000005_create_ai_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =====================================================================
        // BUSINESS AI CONFIG
        // =====================================================================
        Schema::create('business_ai_configs', function (Blueprint $table) {
            $table->foreignId('business_id')->primary()->constrained()->onDelete('cascade');
            
            // Voice & Tone
            $table->string('ai_name', 50)->default('Lisa');
            $table->string('tone', 100)->default('friendly, professional');
            $table->text('greeting_script')->nullable();
            
            // ElevenLabs Voice Configuration
            $table->string('elevenlabs_voice_id', 50)->nullable(); // e.g., 'rachel', 'drew'
            $table->string('elevenlabs_model_id', 50)->default('eleven_turbo_v2');
            $table->jsonb('elevenlabs_voice_settings')->nullable(); // stability, similarity_boost, etc.
            
            // Capabilities
            $table->boolean('can_book_appointments')->default(true);
            $table->boolean('can_give_quotes')->default(false);
            $table->boolean('can_process_orders')->default(false);
            $table->boolean('can_transfer_calls')->default(true);
            
            // Escalation
            $table->jsonb('escalate_keywords')->nullable();
            $table->integer('escalate_after_minutes')->default(10);
            $table->string('escalation_phone', 20)->nullable();
            $table->string('escalation_email')->nullable();
            
            // Boundaries
            $table->jsonb('prohibited_topics')->nullable();
            $table->enum('competitor_mentions', ['ignore', 'deflect', 'compare'])->default('deflect');
            
            // Scripts
            $table->text('voicemail_script')->nullable();
            $table->text('after_hours_script')->nullable();
            $table->text('hold_message')->nullable();
            $table->text('transfer_message')->nullable();
            
            // Status
            $table->boolean('is_configured')->default(false);
            $table->boolean('is_active')->default(false);
            
            $table->timestamps();
        });

        // =====================================================================
        // BUSINESS FAQS (What AI knows to answer)
        // =====================================================================
        Schema::create('business_faqs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            
            $table->text('question');
            $table->text('answer');
            $table->string('short_answer')->nullable();
            
            // Categorization
            $table->string('category', 50)->nullable(); // 'hours', 'services', 'pricing', 'policies'
            $table->jsonb('keywords')->nullable();
            
            // Pre-generated audio (ElevenLabs)
            $table->string('audio_url')->nullable(); // Cloudflare R2 URL
            $table->string('audio_voice_id', 50)->nullable();
            $table->integer('audio_duration_ms')->nullable();
            
            // Source & verification
            $table->enum('source', [
                'owner_provided', 'ai_learned', 'scraped', 'inferred'
            ])->default('ai_learned');
            $table->boolean('verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable();
            
            // Usage tracking
            $table->integer('times_used')->default(0);
            $table->timestamp('last_used_at')->nullable();
            
            // Vector embedding for semantic search
            $table->vector('embedding', 1536)->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('business_id');
            $table->index('category');
        });

        // =====================================================================
        // BUSINESS SERVICES
        // =====================================================================
        Schema::create('business_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            
            $table->string('name');
            $table->text('description')->nullable();
            
            // Pricing
            $table->enum('price_type', [
                'fixed', 'starting_at', 'hourly', 'custom', 'free', 'call_for_quote'
            ])->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('price_unit', 50)->nullable(); // 'per hour', 'per project'
            
            // Details
            $table->string('duration', 50)->nullable();
            $table->text('availability')->nullable();
            
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            
            $table->index('business_id');
        });

        // =====================================================================
        // UNANSWERED QUESTIONS (AI couldn't answer)
        // =====================================================================
        Schema::create('unanswered_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('conversation_id')->nullable()->constrained()->onDelete('set null');
            
            $table->text('question');
            $table->text('ai_response')->nullable(); // What AI said (probably deflection)
            $table->text('context')->nullable();
            
            // Resolution
            $table->enum('status', ['pending', 'answered', 'ignored', 'not_applicable'])->default('pending');
            $table->text('answer')->nullable();
            $table->timestamp('answered_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['business_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unanswered_questions');
        Schema::dropIfExists('business_services');
        Schema::dropIfExists('business_faqs');
        Schema::dropIfExists('business_ai_configs');
    }
};
```

### Migration 006: Tasks & Workflow

```php
<?php
// database/migrations/2025_01_01_000006_create_workflow_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =====================================================================
        // TASKS
        // =====================================================================
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('person_id')->nullable()->constrained()->onDelete('set null');
            
            $table->string('title');
            $table->text('description')->nullable();
            
            $table->enum('type', [
                'follow_up', 'demo', 'onboarding', 'support', 
                'review', 'ai_config', 'content', 'other'
            ])->default('other');
            
            // Assignment
            $table->string('assigned_to', 100)->nullable(); // AI agent or human email
            $table->enum('assigned_type', ['ai', 'human'])->default('ai');
            
            // Timing
            $table->timestamp('due_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('snoozed_until')->nullable();
            
            // Status
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            
            // Result
            $table->text('outcome')->nullable();
            
            // Source
            $table->string('source', 100)->nullable();
            $table->morphs('sourceable'); // Polymorphic: conversation, order, etc.
            
            $table->timestamps();
            
            $table->index(['business_id', 'status']);
            $table->index(['assigned_to', 'status']);
            $table->index('due_at');
        });

        // =====================================================================
        // NOTES
        // =====================================================================
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            
            $table->text('content');
            
            $table->string('created_by', 100)->nullable();
            $table->enum('created_by_type', ['human', 'ai'])->default('human');
            
            $table->timestamps();
            
            $table->index('business_id');
        });

        // =====================================================================
        // TAGS
        // =====================================================================
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('color', 7)->default('#6B7280');
            $table->string('category', 50)->nullable();
            $table->timestamps();
        });

        Schema::create('business_tag', function (Blueprint $table) {
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->timestamp('added_at')->useCurrent();
            
            $table->primary(['business_id', 'tag_id']);
        });

        // =====================================================================
        // EMAIL TEMPLATES
        // =====================================================================
        Schema::create('email_templates', function (Blueprint $table) {
            $table->string('id', 50)->primary(); // 'hook-001', 'edu-001'
            $table->string('name');
            
            $table->string('subject');
            $table->string('preview_text')->nullable();
            $table->text('body_html');
            $table->text('body_text')->nullable();
            
            // Variables available
            $table->jsonb('variables')->nullable();
            // ['first_name', 'business_name', 'community', 'landing_page_url']
            
            $table->string('category', 50)->nullable();
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_templates');
        Schema::dropIfExists('business_tag');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('notes');
        Schema::dropIfExists('tasks');
    }
};
```

---

# LARAVEL APPLICATION STRUCTURE

## Directory Structure

```
fibonacco-operations/
├── app/
│   ├── Console/
│   │   ├── Commands/
│   │   │   ├── Campaign/
│   │   │   │   ├── ProcessSendQueue.php
│   │   │   │   ├── ProcessSMSQueue.php
│   │   │   │   ├── ProcessVoiceQueue.php
│   │   │   │   └── DeployCommunity.php
│   │   │   ├── Sync/
│   │   │   │   └── SyncFromContentDB.php
│   │   │   └── Maintenance/
│   │   │       ├── RecalculateLeadScores.php
│   │   │       ├── RecalculateHealthScores.php
│   │   │       └── CleanupOldActivities.php
│   │   └── Kernel.php
│   │
│   ├── Events/
│   │   ├── OrderPaid.php
│   │   ├── SubscriptionStarted.php
│   │   ├── LeadConverted.php
│   │   ├── ConversationEnded.php
│   │   └── EmailOpened.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── BusinessController.php
│   │   │   │   ├── PersonController.php
│   │   │   │   ├── CampaignController.php
│   │   │   │   ├── OrderController.php
│   │   │   │   ├── SubscriptionController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── ConversationController.php
│   │   │   │   ├── ActivityController.php
│   │   │   │   ├── TaskController.php
│   │   │   │   ├── AiConfigController.php
│   │   │   │   ├── FaqController.php
│   │   │   │   └── DashboardController.php
│   │   │   │
│   │   │   ├── Webhooks/
│   │   │   │   ├── SESWebhookController.php
│   │   │   │   ├── TwilioWebhookController.php
│   │   │   │   ├── StripeWebhookController.php
│   │   │   │   ├── LearningCenterWebhookController.php
│   │   │   │   └── ContentSyncWebhookController.php
│   │   │   │
│   │   │   └── Tracking/
│   │   │       ├── EmailTrackingController.php
│   │   │       └── LinkTrackingController.php
│   │   │
│   │   ├── Middleware/
│   │   │   ├── ValidateApiKey.php
│   │   │   ├── ValidateWebhookSignature.php
│   │   │   └── BusinessAccess.php
│   │   │
│   │   ├── Requests/
│   │   │   ├── CreateOrderRequest.php
│   │   │   ├── UpdateAiConfigRequest.php
│   │   │   ├── CreateFaqRequest.php
│   │   │   └── ... (validation request classes)
│   │   │
│   │   └── Resources/
│   │       ├── BusinessResource.php
│   │       ├── BusinessFullResource.php
│   │       ├── PersonResource.php
│   │       ├── SubscriptionResource.php
│   │       ├── OrderResource.php
│   │       ├── ConversationResource.php
│   │       ├── ActivityResource.php
│   │       └── ... (API resource transformers)
│   │
│   ├── Jobs/
│   │   ├── SendCampaignEmail.php
│   │   ├── SendSMS.php
│   │   ├── MakeVoiceCall.php
│   │   ├── GenerateVoiceAudio.php        # ElevenLabs audio generation
│   │   ├── ProcessConversation.php
│   │   ├── GenerateFaqFromConversation.php
│   │   ├── SyncBusinessToContentDB.php
│   │   ├── FulfillOrder.php
│   │   ├── CalculateLeadScore.php
│   │   └── UploadToR2.php                # Cloudflare R2 uploads
│   │
│   ├── Listeners/
│   │   ├── OrderPaidListener.php
│   │   ├── SubscriptionEventListener.php
│   │   ├── ConversationEndedListener.php
│   │   └── EmailEngagementListener.php
│   │
│   ├── Models/
│   │   ├── Community.php
│   │   ├── Industry.php
│   │   ├── Business.php
│   │   ├── Person.php
│   │   ├── Product.php
│   │   ├── Subscription.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── CampaignSequence.php
│   │   ├── CampaignStep.php
│   │   ├── SendLog.php
│   │   ├── Activity.php
│   │   ├── Conversation.php
│   │   ├── ProductInterest.php
│   │   ├── PainPoint.php
│   │   ├── Objection.php
│   │   ├── BusinessAiConfig.php
│   │   ├── BusinessFaq.php
│   │   ├── BusinessService.php
│   │   ├── UnansweredQuestion.php
│   │   ├── Task.php
│   │   ├── Note.php
│   │   ├── Tag.php
│   │   └── EmailTemplate.php
│   │
│   ├── Services/
│   │   ├── Campaign/
│   │   │   ├── CampaignService.php
│   │   │   ├── EmailSender.php
│   │   │   ├── SMSSender.php              # Twilio
│   │   │   └── VoiceCaller.php            # ElevenLabs + Twilio
│   │   ├── Voice/
│   │   │   ├── ElevenLabsService.php      # Text-to-speech
│   │   │   └── TwilioVoiceService.php     # Call handling
│   │   ├── Commerce/
│   │   │   ├── OrderService.php
│   │   │   ├── SubscriptionService.php
│   │   │   ├── StripeService.php
│   │   │   └── FulfillmentService.php
│   │   ├── AI/
│   │   │   ├── ConversationService.php
│   │   │   ├── FaqService.php
│   │   │   └── ContextBuilder.php
│   │   ├── Storage/
│   │   │   └── CloudflareR2Service.php    # R2 storage
│   │   ├── Integration/
│   │   │   ├── ContentApiService.php
│   │   │   └── SyncService.php
│   │   └── Analytics/
│   │       ├── LeadScoringService.php
│   │       ├── HealthScoringService.php
│   │       └── DashboardService.php
│   │
│   └── Providers/
│       ├── AppServiceProvider.php
│       ├── EventServiceProvider.php
│       └── RouteServiceProvider.php
│
├── config/
│   ├── services.php          # External service credentials
│   ├── campaign.php          # Campaign settings
│   ├── cloudflare.php        # R2 configuration
│   ├── elevenlabs.php        # ElevenLabs configuration
│   └── content_api.php       # Content API connection
│
├── database/
│   ├── migrations/           # (As defined above)
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── IndustrySeeder.php
│   │   ├── ProductSeeder.php
│   │   ├── CampaignStepSeeder.php
│   │   └── EmailTemplateSeeder.php
│   └── factories/
│
├── routes/
│   ├── api.php               # API routes
│   ├── webhooks.php          # Webhook routes
│   └── console.php           # Console commands
│
├── resources/
│   └── views/
│       └── emails/           # Email blade templates
│
├── Dockerfile                # Railway deployment
├── railway.json              # Railway config
├── nixpacks.toml             # Railway build config
│
└── tests/
    ├── Feature/
    │   ├── CampaignTest.php
    │   ├── OrderTest.php
    │   └── WebhookTest.php
    └── Unit/
        ├── LeadScoringTest.php
        └── EmailSenderTest.php
```

---

# EXTERNAL SERVICE INTEGRATIONS

## ElevenLabs Voice Service

```php
<?php
// app/Services/Voice/ElevenLabsService.php

namespace App\Services\Voice;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\Storage\CloudflareR2Service;

class ElevenLabsService
{
    private string $apiKey;
    private string $baseUrl = 'https://api.elevenlabs.io/v1';
    
    // Available voice IDs
    public const VOICES = [
        'rachel' => '21m00Tcm4TlvDq8ikWAM',
        'drew' => '29vD33N1CtxCmqQRPOHJ',
        'clyde' => '2EiwWnXFnvU5JabPnv8n',
        'paul' => '5Q0t7uMcjvnagumLfvZi',
        'domi' => 'AZnzlk1XvdvUeBnXmlld',
        'dave' => 'CYw3kZ02Hs0563khs1Fj',
        'fin' => 'D38z5RcWu1voky8WS1ja',
        'sarah' => 'EXAVITQu4vr4xnSDxMaL',
        'antoni' => 'ErXwobaYiN019PkySvjV',
        'thomas' => 'GBv7mTt0atIp3Br8iCZE',
        'charlie' => 'IKne3meq5aSn9XLyUdCD',
        'emily' => 'LcfcDJNUP1GQjkzn1xUU',
        'elli' => 'MF3mGyEYCl7XYWbV9V6O',
        'callum' => 'N2lVS1w4EtoT3dr4eOWO',
        'patrick' => 'ODq5zmih8GrVes37Dizd',
        'harry' => 'SOYHLrjzK2X1ezoPC6cr',
        'liam' => 'TX3LPaxmHKxFdv7VOQHJ',
        'dorothy' => 'ThT5KcBeYPX3keUQqHPh',
        'josh' => 'TxGEqnHWrfWFTfGW9XjX',
        'arnold' => 'VR6AewLTigWG4xSOukaG',
        'charlotte' => 'XB0fDUnXU5powFXDhCwa',
        'matilda' => 'XrExE9yKIg1WjnnlVkGX',
        'matthew' => 'Yko7PKHZNXotIFUBG7I9',
        'james' => 'ZQe5CZNOzWyzPSCn5a3c',
        'joseph' => 'Zlb1dXrM653N07WRdFW3',
        'jeremy' => 'bVMeCyTHy58xNoL34h3p',
        'michael' => 'flq6f7yk4E4fJM5XTYuZ',
        'ethan' => 'g5CIjZEefAph4nQFvHAz',
        'gigi' => 'jBpfuIE2acCO8z3wKNLl',
        'freya' => 'jsCqWAovK2LkecY7zXl4',
        'grace' => 'oWAxZDx7w5VEj9dCyTzz',
        'daniel' => 'onwK4e9ZLuTAKqWW03F9',
        'serena' => 'pMsXgVXv3BLzUgSXRplE',
        'adam' => 'pNInz6obpgDQGcFmaJgB',
        'nicole' => 'piTKgcLEGmPE4e6mEKli',
        'jessie' => 't0jbNlBVZ17f02VDIeMI',
        'ryan' => 'wViXBPUzp2ZZixB1xQuM',
        'sam' => 'yoZ06aMxZJJ28mfd3POQ',
        'glinda' => 'z9fAnlkpzviPz146aGWa',
        'giovanni' => 'zcAOhNBS3c14rBihAFp1',
        'mimi' => 'zrHiDhphv9ZnVXBqCLjz',
    ];

    public function __construct(
        private CloudflareR2Service $r2
    ) {
        $this->apiKey = config('services.elevenlabs.api_key');
    }

    /**
     * Generate speech audio from text
     */
    public function textToSpeech(
        string $text,
        string $voiceId = 'sarah',
        array $settings = []
    ): ?string {
        // Resolve voice name to ID if needed
        $resolvedVoiceId = self::VOICES[$voiceId] ?? $voiceId;
        
        $defaultSettings = [
            'stability' => 0.5,
            'similarity_boost' => 0.75,
            'style' => 0.0,
            'use_speaker_boost' => true,
        ];
        
        $voiceSettings = array_merge($defaultSettings, $settings);
        
        try {
            $response = Http::withHeaders([
                'xi-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/text-to-speech/{$resolvedVoiceId}", [
                'text' => $text,
                'model_id' => config('services.elevenlabs.model_id', 'eleven_turbo_v2'),
                'voice_settings' => $voiceSettings,
            ]);
            
            if ($response->successful()) {
                return $response->body(); // Returns MP3 audio bytes
            }
            
            Log::error('ElevenLabs TTS failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            
            return null;
        } catch (\Exception $e) {
            Log::error('ElevenLabs TTS exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate and store FAQ audio
     */
    public function generateFaqAudio(
        int $businessId,
        int $faqId,
        string $text,
        string $voiceId = 'sarah'
    ): ?string {
        $audioData = $this->textToSpeech($text, $voiceId);
        
        if (!$audioData) {
            return null;
        }
        
        // Upload to Cloudflare R2
        $path = "audio/faqs/{$businessId}/{$faqId}.mp3";
        $url = $this->r2->upload($path, $audioData, 'audio/mpeg');
        
        return $url;
    }

    /**
     * Generate presentation slide audio
     */
    public function generateSlideAudio(
        string $presentationId,
        int $slideNumber,
        string $script,
        string $voiceId = 'sarah'
    ): ?string {
        $audioData = $this->textToSpeech($script, $voiceId);
        
        if (!$audioData) {
            return null;
        }
        
        // Upload to Cloudflare R2
        $path = "audio/presentations/{$presentationId}/slide-{$slideNumber}.mp3";
        $url = $this->r2->upload($path, $audioData, 'audio/mpeg');
        
        return $url;
    }

    /**
     * Get available voices
     */
    public function getVoices(): array
    {
        try {
            $response = Http::withHeaders([
                'xi-api-key' => $this->apiKey,
            ])->get("{$this->baseUrl}/voices");
            
            if ($response->successful()) {
                return $response->json('voices', []);
            }
            
            return [];
        } catch (\Exception $e) {
            Log::error('ElevenLabs get voices error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get user subscription info (quota, etc.)
     */
    public function getSubscription(): ?array
    {
        try {
            $response = Http::withHeaders([
                'xi-api-key' => $this->apiKey,
            ])->get("{$this->baseUrl}/user/subscription");
            
            return $response->successful() ? $response->json() : null;
        } catch (\Exception $e) {
            Log::error('ElevenLabs subscription error: ' . $e->getMessage());
            return null;
        }
    }
}
```

## Twilio SMS Service

```php
<?php
// app/Services/Campaign/SMSSender.php

namespace App\Services\Campaign;

use App\Models\Person;
use App\Models\CampaignStep;
use App\Models\SendLog;
use App\Models\Activity;
use Twilio\Rest\Client as TwilioClient;
use Illuminate\Support\Facades\Log;

class SMSSender
{
    private TwilioClient $twilio;
    private string $fromNumber;

    public function __construct()
    {
        $this->twilio = new TwilioClient(
            config('services.twilio.sid'),
            config('services.twilio.token')
        );
        $this->fromNumber = config('services.twilio.from');
    }

    /**
     * Send SMS to a person
     */
    public function send(Person $person, CampaignStep $step): ?string
    {
        if (!$person->phone || $person->do_not_sms) {
            return null;
        }
        
        $body = $this->buildMessage($person, $step);
        
        try {
            $message = $this->twilio->messages->create(
                $person->phone,
                [
                    'from' => $this->fromNumber,
                    'body' => $body,
                    'statusCallback' => route('webhooks.twilio.status'),
                ]
            );
            
            // Log the send
            SendLog::create([
                'person_id' => $person->id,
                'campaign_step_id' => $step->id,
                'channel' => 'sms',
                'provider_message_id' => $message->sid,
            ]);
            
            // Log activity
            Activity::create([
                'business_id' => $person->business_id,
                'person_id' => $person->id,
                'type' => 'sms_sent',
                'subject' => substr($body, 0, 50) . '...',
                'campaign_id' => $step->campaign_id,
                'campaign_step' => $step->step_number,
            ]);
            
            return $message->sid;
        } catch (\Exception $e) {
            Log::error("Twilio SMS failed: " . $e->getMessage(), [
                'person_id' => $person->id,
                'phone' => $person->phone,
            ]);
            return null;
        }
    }

    /**
     * Send a single SMS (not part of campaign)
     */
    public function sendSingle(string $to, string $body): ?string
    {
        try {
            $message = $this->twilio->messages->create(
                $to,
                [
                    'from' => $this->fromNumber,
                    'body' => $body,
                ]
            );
            
            return $message->sid;
        } catch (\Exception $e) {
            Log::error("Twilio SMS failed: " . $e->getMessage());
            return null;
        }
    }

    private function buildMessage(Person $person, CampaignStep $step): string
    {
        $template = config("campaign.sms_templates.{$step->template_id}");
        
        $replacements = [
            '{{first_name}}' => $person->first_name ?? 'there',
            '{{business_name}}' => $person->business->name,
            '{{community}}' => $person->business->community->name,
            '{{link}}' => $this->buildTrackingLink($person, $step),
        ];
        
        return str_replace(
            array_keys($replacements),
            array_values($replacements),
            $template
        );
    }

    private function buildTrackingLink(Person $person, CampaignStep $step): string
    {
        $baseUrl = config('app.learning_center_url') . '/' . $step->landing_page;
        $params = http_build_query([
            'utm_source' => 'sms',
            'utm_campaign' => $step->campaign_id,
            'pid' => $person->id,
            'bid' => $person->business_id,
        ]);
        
        return "{$baseUrl}?{$params}";
    }
}
```

## Twilio Voice Service (with ElevenLabs)

```php
<?php
// app/Services/Voice/TwilioVoiceService.php

namespace App\Services\Voice;

use App\Models\Person;
use App\Models\Business;
use App\Models\Conversation;
use Twilio\Rest\Client as TwilioClient;
use Twilio\TwiML\VoiceResponse;
use Illuminate\Support\Facades\Log;

class TwilioVoiceService
{
    private TwilioClient $twilio;
    private string $fromNumber;

    public function __construct(
        private ElevenLabsService $elevenLabs
    ) {
        $this->twilio = new TwilioClient(
            config('services.twilio.sid'),
            config('services.twilio.token')
        );
        $this->fromNumber = config('services.twilio.voice_from');
    }

    /**
     * Initiate outbound call
     */
    public function call(Person $person, string $script): ?string
    {
        if (!$person->phone || $person->do_not_call) {
            return null;
        }
        
        try {
            // Pre-generate audio with ElevenLabs
            $audioUrl = $this->generateCallAudio($person, $script);
            
            $call = $this->twilio->calls->create(
                $person->phone,
                $this->fromNumber,
                [
                    'url' => route('webhooks.twilio.voice.answer', [
                        'personId' => $person->id,
                        'audioUrl' => urlencode($audioUrl),
                    ]),
                    'statusCallback' => route('webhooks.twilio.voice.status'),
                    'statusCallbackEvent' => ['initiated', 'ringing', 'answered', 'completed'],
                ]
            );
            
            return $call->sid;
        } catch (\Exception $e) {
            Log::error("Twilio call failed: " . $e->getMessage(), [
                'person_id' => $person->id,
                'phone' => $person->phone,
            ]);
            return null;
        }
    }

    /**
     * Handle incoming call
     */
    public function handleIncomingCall(string $from, string $to): VoiceResponse
    {
        $response = new VoiceResponse();
        
        // Find business by phone number
        $business = Business::where('phone', $to)->first();
        
        if (!$business || !$business->aiConfig?->is_active) {
            $response->say('We\'re sorry, this number is not configured. Please try again later.');
            return $response;
        }
        
        // Get greeting audio
        $greeting = $business->aiConfig->greeting_script ?? 
            "Hi! Thanks for calling {$business->name}. How can I help you today?";
        
        $audioUrl = $this->generateGreetingAudio($business, $greeting);
        
        // Play greeting and gather input
        $gather = $response->gather([
            'input' => 'speech',
            'timeout' => 5,
            'speechTimeout' => 'auto',
            'action' => route('webhooks.twilio.voice.process', [
                'businessId' => $business->id,
            ]),
        ]);
        $gather->play($audioUrl);
        
        // If no input, repeat
        $response->redirect(route('webhooks.twilio.voice.answer', [
            'businessId' => $business->id,
        ]));
        
        return $response;
    }

    /**
     * Process speech input and respond
     */
    public function processSpeech(
        Business $business,
        string $speechResult,
        ?Conversation $conversation = null
    ): VoiceResponse {
        $response = new VoiceResponse();
        
        // Create or update conversation
        if (!$conversation) {
            $conversation = Conversation::create([
                'business_id' => $business->id,
                'channel' => 'voice',
                'source' => 'inbound',
                'messages' => [],
            ]);
        }
        
        // Add user message to transcript
        $messages = $conversation->messages;
        $messages[] = [
            'role' => 'user',
            'content' => $speechResult,
            'timestamp' => now()->toISOString(),
        ];
        
        // Generate AI response (using your AI service)
        $aiResponse = $this->generateAIResponse($business, $speechResult, $messages);
        
        // Add AI response to transcript
        $messages[] = [
            'role' => 'assistant',
            'content' => $aiResponse,
            'timestamp' => now()->toISOString(),
        ];
        
        $conversation->update([
            'messages' => $messages,
            'message_count' => count($messages),
        ]);
        
        // Generate audio for response
        $voiceId = $business->aiConfig->elevenlabs_voice_id ?? 'sarah';
        $audioUrl = $this->generateResponseAudio($conversation->id, $aiResponse, $voiceId);
        
        // Play response and gather more input
        $gather = $response->gather([
            'input' => 'speech',
            'timeout' => 5,
            'speechTimeout' => 'auto',
            'action' => route('webhooks.twilio.voice.process', [
                'businessId' => $business->id,
                'conversationId' => $conversation->id,
            ]),
        ]);
        $gather->play($audioUrl);
        
        // If no more input, say goodbye
        $goodbyeAudio = $this->generateGoodbyeAudio($business);
        $response->play($goodbyeAudio);
        $response->hangup();
        
        return $response;
    }

    private function generateCallAudio(Person $person, string $script): string
    {
        $business = $person->business;
        $voiceId = $business->aiConfig?->elevenlabs_voice_id ?? 'sarah';
        
        // Personalize script
        $personalizedScript = str_replace(
            ['{{first_name}}', '{{business_name}}'],
            [$person->first_name ?? 'there', $business->name],
            $script
        );
        
        return $this->elevenLabs->generateSlideAudio(
            "call-{$person->id}",
            1,
            $personalizedScript,
            $voiceId
        );
    }

    private function generateGreetingAudio(Business $business, string $greeting): string
    {
        $voiceId = $business->aiConfig?->elevenlabs_voice_id ?? 'sarah';
        
        // Cache greeting audio
        $cacheKey = "greeting_audio_{$business->id}_" . md5($greeting);
        
        return cache()->remember($cacheKey, 86400, function () use ($business, $greeting, $voiceId) {
            return $this->elevenLabs->generateSlideAudio(
                "greeting-{$business->id}",
                1,
                $greeting,
                $voiceId
            );
        });
    }

    private function generateResponseAudio(int $conversationId, string $response, string $voiceId): string
    {
        $messageNumber = time(); // Unique identifier
        
        return $this->elevenLabs->generateSlideAudio(
            "conv-{$conversationId}",
            $messageNumber,
            $response,
            $voiceId
        );
    }

    private function generateGoodbyeAudio(Business $business): string
    {
        $voiceId = $business->aiConfig?->elevenlabs_voice_id ?? 'sarah';
        $goodbye = "Thank you for calling {$business->name}. Have a great day!";
        
        return $this->elevenLabs->generateSlideAudio(
            "goodbye-{$business->id}",
            1,
            $goodbye,
            $voiceId
        );
    }

    private function generateAIResponse(Business $business, string $input, array $messages): string
    {
        // This would integrate with your AI service (Claude, GPT, etc.)
        // For now, return a placeholder
        return "I understand you're asking about {$input}. Let me help you with that.";
    }
}
```

## Cloudflare R2 Service

```php
<?php
// app/Services/Storage/CloudflareR2Service.php

namespace App\Services\Storage;

use Aws\S3\S3Client;
use Illuminate\Support\Facades\Log;

class CloudflareR2Service
{
    private S3Client $client;
    private string $bucket;
    private string $publicUrl;

    public function __construct()
    {
        $this->client = new S3Client([
            'version' => 'latest',
            'region' => 'auto',
            'endpoint' => config('services.cloudflare.r2.endpoint'),
            'credentials' => [
                'key' => config('services.cloudflare.r2.access_key'),
                'secret' => config('services.cloudflare.r2.secret_key'),
            ],
        ]);
        
        $this->bucket = config('services.cloudflare.r2.bucket');
        $this->publicUrl = config('services.cloudflare.r2.public_url');
    }

    /**
     * Upload file to R2
     */
    public function upload(string $path, string $contents, string $contentType = 'application/octet-stream'): string
    {
        try {
            $this->client->putObject([
                'Bucket' => $this->bucket,
                'Key' => $path,
                'Body' => $contents,
                'ContentType' => $contentType,
            ]);
            
            return $this->getPublicUrl($path);
        } catch (\Exception $e) {
            Log::error("R2 upload failed: " . $e->getMessage(), [
                'path' => $path,
            ]);
            throw $e;
        }
    }

    /**
     * Upload file from local path
     */
    public function uploadFile(string $localPath, string $remotePath, ?string $contentType = null): string
    {
        $contents = file_get_contents($localPath);
        $contentType = $contentType ?? mime_content_type($localPath);
        
        return $this->upload($remotePath, $contents, $contentType);
    }

    /**
     * Delete file from R2
     */
    public function delete(string $path): bool
    {
        try {
            $this->client->deleteObject([
                'Bucket' => $this->bucket,
                'Key' => $path,
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error("R2 delete failed: " . $e->getMessage(), [
                'path' => $path,
            ]);
            return false;
        }
    }

    /**
     * Check if file exists
     */
    public function exists(string $path): bool
    {
        try {
            $this->client->headObject([
                'Bucket' => $this->bucket,
                'Key' => $path,
            ]);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get public URL for a file
     */
    public function getPublicUrl(string $path): string
    {
        return rtrim($this->publicUrl, '/') . '/' . ltrim($path, '/');
    }

    /**
     * Get a temporary signed URL
     */
    public function getSignedUrl(string $path, int $expireMinutes = 60): string
    {
        $command = $this->client->getCommand('GetObject', [
            'Bucket' => $this->bucket,
            'Key' => $path,
        ]);
        
        $request = $this->client->createPresignedRequest(
            $command,
            "+{$expireMinutes} minutes"
        );
        
        return (string) $request->getUri();
    }

    /**
     * List files in a directory
     */
    public function listFiles(string $prefix = '', int $limit = 1000): array
    {
        $result = $this->client->listObjectsV2([
            'Bucket' => $this->bucket,
            'Prefix' => $prefix,
            'MaxKeys' => $limit,
        ]);
        
        return array_map(
            fn($item) => $item['Key'],
            $result['Contents'] ?? []
        );
    }
}
```

---

# RAILWAY INFRASTRUCTURE

## Railway Project Structure

```
fibonacco/
├── fibonacco-operations-api/        # Laravel API service
├── fibonacco-operations-worker/     # Queue worker service
├── fibonacco-campaign-worker/       # Campaign processor service
├── fibonacco-operations-db/         # PostgreSQL database
├── fibonacco-redis/                 # Redis service
└── fibonacco-content-api/           # Existing content service (if migrating)
```

## Railway Configuration Files

### railway.json (API Service)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 2,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

### nixpacks.toml (Laravel Build)

```toml
[phases.setup]
nixPkgs = ["php83", "php83Extensions.pdo_pgsql", "php83Extensions.redis", "php83Extensions.gd", "nodejs_20"]

[phases.install]
cmds = [
    "composer install --no-dev --optimize-autoloader",
    "npm ci",
    "npm run build"
]

[phases.build]
cmds = [
    "php artisan config:cache",
    "php artisan route:cache",
    "php artisan view:cache"
]

[start]
cmd = "php artisan serve --host=0.0.0.0 --port=$PORT"
```

### Dockerfile (Alternative)

```dockerfile
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    unzip \
    git \
    curl \
    nodejs \
    npm

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql gd bcmath opcache

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader
RUN npm ci && npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Copy nginx and supervisor configs
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port
EXPOSE 8080

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

### docker/supervisord.conf

```ini
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:php-fpm]
command=/usr/local/sbin/php-fpm -F
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
```

### Worker Service (Procfile)

```
worker: php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
```

### Campaign Worker Service

```
campaign: php artisan campaign:process-email-queue --limit=1000
```

## Railway Environment Variables

```bash
# Application
APP_NAME=Fibonacco
APP_ENV=production
APP_KEY=base64:xxx
APP_DEBUG=false
APP_URL=https://api.fibonacco.com

# Database (Railway provides these automatically)
DATABASE_URL=${DATABASE_URL}
# Or manually:
DB_CONNECTION=pgsql
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_DATABASE=${PGDATABASE}
DB_USERNAME=${PGUSER}
DB_PASSWORD=${PGPASSWORD}

# Redis (Railway provides these automatically)
REDIS_URL=${REDIS_URL}
# Or manually:
REDIS_HOST=${REDISHOST}
REDIS_PORT=${REDISPORT}
REDIS_PASSWORD=${REDISPASSWORD}

# Queue
QUEUE_CONNECTION=redis

# AWS SES (Email)
SES_KEY=xxx
SES_SECRET=xxx
SES_REGION=us-east-1

# Twilio (SMS & Voice)
TWILIO_SID=xxx
TWILIO_TOKEN=xxx
TWILIO_FROM=+1234567890
TWILIO_VOICE_FROM=+1234567891

# ElevenLabs (Voice AI)
ELEVENLABS_API_KEY=xxx
ELEVENLABS_MODEL_ID=eleven_turbo_v2

# Cloudflare R2 (Storage)
CLOUDFLARE_R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY=xxx
CLOUDFLARE_R2_SECRET_KEY=xxx
CLOUDFLARE_R2_BUCKET=fibonacco-assets
CLOUDFLARE_R2_PUBLIC_URL=https://assets.fibonacco.com

# Stripe
STRIPE_KEY=pk_live_xxx
STRIPE_SECRET=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Content API
CONTENT_API_URL=https://content-api.fibonacco.com
CONTENT_API_KEY=xxx

# Learning Center
LEARNING_CENTER_URL=https://learn.fibonacco.com
```

## Railway CLI Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project
railway link

# Add PostgreSQL
railway add --plugin postgresql

# Add Redis
railway add --plugin redis

# Deploy
railway up

# View logs
railway logs

# Open shell
railway shell

# Run migrations
railway run php artisan migrate

# Set environment variables
railway variables set APP_KEY=base64:xxx
```

---

# CLOUDFLARE CONFIGURATION

## R2 Bucket Setup

```bash
# Using Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create R2 bucket
wrangler r2 bucket create fibonacco-assets

# Create public access (optional - for CDN)
wrangler r2 bucket create fibonacco-assets --location wnam
```

## Cloudflare Pages (Command Center & Learning Center)

### wrangler.toml (Command Center)

```toml
name = "command-center"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"

[[routes]]
pattern = "command.fibonacco.com/*"
zone_name = "fibonacco.com"
```

### Deploy Command Center

```bash
cd command-center

# Build
npm run build

# Deploy
wrangler pages deploy dist --project-name=command-center
```

### wrangler.toml (Learning Center)

```toml
name = "learning-center"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"

# R2 binding for assets
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "fibonacco-assets"

[[routes]]
pattern = "learn.fibonacco.com/*"
zone_name = "fibonacco.com"
```

## DNS Configuration

```
# Cloudflare DNS Records

# API (Railway)
api.fibonacco.com         CNAME   your-app.up.railway.app

# Command Center (Pages)
command.fibonacco.com     CNAME   command-center.pages.dev

# Learning Center (Pages)
learn.fibonacco.com       CNAME   learning-center.pages.dev

# Assets (R2)
assets.fibonacco.com      CNAME   pub-xxx.r2.dev
```

## Cloudflare Workers (Optional - Edge Processing)

```javascript
// workers/tracking-pixel.js
// Fast edge-based tracking pixel

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const personId = url.searchParams.get('pid');
    const stepId = url.searchParams.get('sid');
    
    // Log to analytics (non-blocking)
    env.ANALYTICS.writeDataPoint({
      blobs: [personId, stepId, 'open'],
      doubles: [Date.now()],
    });
    
    // Queue for processing
    await env.TRACKING_QUEUE.send({
      type: 'email_open',
      personId,
      stepId,
      timestamp: Date.now(),
    });
    
    // Return 1x1 transparent GIF
    const pixel = Uint8Array.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
      0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
      0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
      0x01, 0x00, 0x3b
    ]);
    
    return new Response(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store',
      },
    });
  },
};
```

---

# IMPLEMENTATION PHASES

## Phase 1: Foundation (Week 1-2)

### Tasks
1. **Set up Railway infrastructure**
   - Create Railway project
   - Deploy PostgreSQL database
   - Deploy Redis
   - Configure services

2. **Set up Cloudflare**
   - Create R2 bucket
   - Configure DNS
   - Set up Pages projects

3. **Initialize Laravel application**
   - Create new Laravel 11 project
   - Configure database connections
   - Configure Redis for cache and queues
   - Set up Horizon for queue monitoring

4. **Create database schema**
   - Run all migrations
   - Seed industries, products, campaign steps
   - Test schema with sample data

5. **Set up Content DB sync**
   - Configure PostgreSQL connection to Content DB
   - Create sync jobs
   - Verify data sync working

### Deliverables
- [ ] Railway infrastructure running
- [ ] Cloudflare configured
- [ ] Laravel app deployed
- [ ] Database schema created
- [ ] Sync from Content DB working

---

## Phase 2: External Services (Week 2-3)

### Tasks
1. **Configure ElevenLabs**
   - Set up API access
   - Test voice generation
   - Create voice presets for AI personas

2. **Configure Twilio**
   - Set up SMS sending
   - Set up voice calling
   - Configure webhooks

3. **Configure Cloudflare R2**
   - Implement upload service
   - Test audio file storage
   - Configure CDN delivery

4. **Build email infrastructure**
   - Configure SES
   - Implement EmailSender service
   - Set up tracking pixel and link rewriting

### Deliverables
- [ ] ElevenLabs generating audio
- [ ] Twilio sending SMS
- [ ] Voice calls working
- [ ] R2 storing and serving files
- [ ] Email sending working

---

## Phase 3: Campaign Engine (Week 3-4)

### Tasks
1. **Build campaign processor**
   - ProcessSendQueue command
   - Sequence advancement logic
   - Condition checking (skip if engaged, etc.)
   - Error handling and retry logic

2. **Build tracking system**
   - Open tracking endpoint
   - Click tracking endpoint
   - SES webhook handler (bounces, complaints)
   - Activity logging

3. **Seed campaign data**
   - Import 60 campaign steps
   - Import email templates
   - Create test sequence

### Deliverables
- [ ] Campaign sequences defined
- [ ] Tracking working
- [ ] Send 10,000 test emails successfully

---

## Phase 4: API & Webhooks (Week 4-5)

### Tasks
1. **Build core API endpoints**
   - Business CRUD
   - Person CRUD
   - Dashboard stats
   - Activity timeline

2. **Build commerce API**
   - Product catalog
   - Order creation
   - Stripe integration
   - Subscription management

3. **Build webhook handlers**
   - Learning Center webhooks
   - Stripe webhooks
   - Twilio webhooks
   - Content sync webhooks

4. **Build AI config API**
   - AI config CRUD
   - FAQ management (with audio generation)
   - Service management

### Deliverables
- [ ] All API endpoints working
- [ ] Stripe integration complete
- [ ] Webhooks receiving data
- [ ] API documentation

---

## Phase 5: Command Center (Week 5-6)

### Tasks
1. **Set up Vue.js project**
   - Initialize Vite + Vue 3
   - Configure Tailwind CSS
   - Set up routing
   - Configure API client

2. **Build core views**
   - Dashboard
   - Business list
   - Business detail
   - Community list

3. **Build business management**
   - Profile editing
   - Contact management
   - Timeline view
   - Stats dashboard

4. **Build AI configuration UI**
   - Config form (with voice selection)
   - FAQ manager (with audio preview)
   - Service manager
   - Conversation viewer

5. **Build commerce UI**
   - Product catalog
   - Order flow
   - Billing management

6. **Deploy to Cloudflare Pages**

### Deliverables
- [ ] Command Center deployed to Cloudflare Pages
- [ ] All views working
- [ ] Connected to Operations API

---

## Phase 6: Learning Center Integration (Week 6-7)

### Tasks
1. **Build Learning Center Vue app**
   - Presentation player
   - AI chat widget
   - Lead capture forms
   - Audio playback from R2

2. **Integrate with Operations API**
   - Webhook sending
   - Visitor tracking
   - Conversation logging
   - Lead capture

3. **Build AI context assembly**
   - Load business FAQs
   - Load industry knowledge
   - Build conversation context

4. **Deploy Learning Center to Cloudflare Pages**

### Deliverables
- [ ] Learning Center deployed to Cloudflare Pages
- [ ] Webhooks sending to Operations
- [ ] AI chat working with context
- [ ] End-to-end flow tested

---

## Phase 7: Testing & Launch (Week 7-8)

### Tasks
1. **Load testing**
   - Test email sending at scale
   - Test API under load
   - Test database performance

2. **Integration testing**
   - Full campaign flow
   - Full conversion flow
   - Full commerce flow
   - Voice AI flow

3. **Deploy first communities**
   - Import first 500 communities
   - Import business data
   - Start campaign sequences

4. **Monitoring setup**
   - Railway metrics
   - Cloudflare analytics
   - Error alerting

### Deliverables
- [ ] All tests passing
- [ ] First 500 communities deployed
- [ ] Campaigns running
- [ ] Monitoring in place

---

# QUICK REFERENCE

## Service URLs

| Service | URL |
|---------|-----|
| Operations API | https://api.fibonacco.com |
| Content API | https://content.fibonacco.com |
| Command Center | https://command.fibonacco.com |
| Learning Center | https://learn.fibonacco.com |
| Assets CDN | https://assets.fibonacco.com |

## Key Commands

```bash
# Railway deployment
railway up

# Run migrations
railway run php artisan migrate

# Campaign processing
railway run php artisan campaign:process-email-queue --limit=1000
railway run php artisan campaign:process-sms-queue --limit=100

# Voice audio generation
railway run php artisan voice:generate-faq-audio --business=123

# Community deployment
railway run php artisan community:deploy {community_id}
railway run php artisan community:deploy-batch --count=100

# Lead scoring
railway run php artisan scoring:recalculate-leads
railway run php artisan scoring:recalculate-health

# Sync
railway run php artisan sync:from-content --full
railway run php artisan sync:from-content --incremental

# View logs
railway logs --service=fibonacco-operations-api
railway logs --service=fibonacco-campaign-worker

# Cloudflare Pages deployment
wrangler pages deploy dist --project-name=command-center
wrangler pages deploy dist --project-name=learning-center
```

## Cost Estimates (Monthly)

| Service | Estimated Cost |
|---------|---------------|
| Railway (API + Workers) | $50-150 |
| Railway PostgreSQL | $20-50 |
| Railway Redis | $10-20 |
| Cloudflare R2 | $15-30 (storage) |
| Cloudflare Pages | Free |
| AWS SES | $100-500 (volume dependent) |
| Twilio SMS | $2,000-10,000 (volume dependent) |
| Twilio Voice | $500-2,000 (volume dependent) |
| ElevenLabs | $99-330 (tier dependent) |
| **Total Infrastructure** | **$95-250/month** |
| **Total with Outbound** | **$2,700-13,000/month** |

---

# CONCLUSION

This specification provides everything needed to build the complete Fibonacco Operations Platform on the Railway + Cloudflare stack:

1. **Railway hosting** for Laravel API, workers, PostgreSQL, and Redis
2. **Cloudflare** for CDN, static hosting (Pages), and file storage (R2)
3. **ElevenLabs** for AI voice generation
4. **Twilio** for SMS and voice calling
5. **Campaign engine** capable of 2.7M emails/day
6. **Customer intelligence** for AI-powered business representation
7. **Commerce system** for all orders and subscriptions
8. **Command Center** on Cloudflare Pages
9. **Learning Center** on Cloudflare Pages with R2 audio

**Total estimated build time: 7-8 weeks**

**Key benefits of this stack:**
- **Cost effective**: Railway + Cloudflare is significantly cheaper than AWS
- **Simple deployment**: Railway's git-push deployment
- **Global CDN**: Cloudflare's edge network for fast content delivery
- **Scalable**: Easy to scale individual services as needed
- **Developer friendly**: Great local development experience

---

*Document ready for Cursor AI implementation.*
