<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ═══════════════════════════════════════════════════════════════════════════════
        // MESSAGE QUEUE (Priority-Partitioned)
        // ═══════════════════════════════════════════════════════════════════════════════
        
        // Note: PostgreSQL partitioning requires creating parent table first
        // For MySQL/MariaDB, we'll use regular tables with indexes
        
        Schema::create('message_queue', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            
            // Priority (P0 always processed first)
            $table->string('priority', 10)->index(); // P0, P1, P2, P3, P4
            
            // Message classification
            $table->string('message_type', 50); // emergency, alert, newsletter, campaign, transactional
            
            // Source reference
            $table->string('source_type', 50)->nullable()->index();
            $table->unsignedBigInteger('source_id')->nullable()->index();
            
            // Channel
            $table->string('channel', 20)->index(); // email, sms, push, voice
            
            // Recipient
            $table->string('recipient_type', 20)->nullable(); // subscriber, smb
            $table->unsignedBigInteger('recipient_id')->nullable();
            $table->string('recipient_address', 255)->index(); // email, phone, or device token
            
            // Content (denormalized for speed)
            $table->string('subject', 255)->nullable();
            $table->string('template', 100)->nullable();
            $table->json('content_data')->nullable();
            
            // Routing
            $table->string('ip_pool', 50)->nullable(); // Which IP pool to use
            $table->string('gateway', 50)->nullable(); // postal, ses, twilio, etc.
            
            // Processing state
            $table->string('status', 20)->default('pending')->index(); // pending, processing, sent, delivered, failed, bounced
            $table->timestamp('scheduled_for')->default(DB::raw('CURRENT_TIMESTAMP'))->index();
            $table->string('locked_by', 100)->nullable();
            $table->timestamp('locked_at')->nullable()->index();
            
            // Results
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->string('external_id', 255)->nullable(); // ID from gateway (SES message ID, etc.)
            
            // Error handling
            $table->integer('attempts')->default(0);
            $table->integer('max_attempts')->default(3);
            $table->text('last_error')->nullable();
            $table->timestamp('next_retry_at')->nullable()->index();
            
            $table->timestamps();
            
            // Composite indexes for efficient querying
            $table->index(['priority', 'status', 'scheduled_for']);
            $table->index(['status', 'scheduled_for', 'locked_at']);
            $table->index(['source_type', 'source_id']);
        });
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // DELIVERY EVENTS (Append-Only Log)
        // ═══════════════════════════════════════════════════════════════════════════════
        
        Schema::create('delivery_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('message_queue_id')->index();
            
            // Event details
            $table->string('event_type', 50)->index(); // queued, sent, delivered, opened, clicked, bounced, complained, unsubscribed
            $table->json('event_data')->nullable();
            
            // Source
            $table->string('source', 50)->nullable(); // postal, ses, twilio, webhook
            $table->string('external_event_id', 255)->nullable();
            
            $table->timestamp('occurred_at')->default(DB::raw('CURRENT_TIMESTAMP'))->index();
            
            $table->foreign('message_queue_id')->references('id')->on('message_queue')->onDelete('cascade');
            
            $table->index(['event_type', 'occurred_at']);
        });
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // CHANNEL HEALTH (For Failover Decisions)
        // ═══════════════════════════════════════════════════════════════════════════════
        
        Schema::create('channel_health', function (Blueprint $table) {
            $table->id();
            $table->string('channel', 20); // email, sms, push
            $table->string('gateway', 50); // postal, ses, twilio
            
            // Health metrics (updated by monitoring job)
            $table->boolean('is_healthy')->default(true)->index();
            $table->decimal('success_rate_1h', 5, 2)->nullable(); // Last hour success rate
            $table->decimal('success_rate_24h', 5, 2)->nullable(); // Last 24h success rate
            $table->integer('avg_latency_ms')->nullable();
            
            // Capacity
            $table->integer('current_rate_per_sec')->nullable();
            $table->integer('max_rate_per_sec')->nullable();
            
            // Last check
            $table->timestamp('last_check_at')->nullable();
            $table->timestamp('last_failure_at')->nullable();
            $table->text('failure_reason')->nullable();
            
            $table->timestamps();
            
            $table->unique(['channel', 'gateway']);
            $table->index(['channel', 'is_healthy']);
        });
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // RATE LIMITS (Per-Domain Throttling)
        // ═══════════════════════════════════════════════════════════════════════════════
        
        Schema::create('rate_limits', function (Blueprint $table) {
            $table->id();
            
            // What's being limited
            $table->string('limit_type', 50)->index(); // domain, ip_pool, gateway, recipient
            $table->string('limit_key', 255)->index(); // gmail.com, pool_alerts, ses, etc.
            
            // Limits
            $table->integer('max_per_second')->nullable();
            $table->integer('max_per_minute')->nullable();
            $table->integer('max_per_hour')->nullable();
            $table->integer('max_per_day')->nullable();
            
            // Current usage (updated by Redis, persisted periodically)
            $table->integer('current_hour_count')->default(0);
            $table->integer('current_day_count')->default(0);
            $table->timestamp('hour_reset_at')->nullable();
            $table->timestamp('day_reset_at')->nullable();
            
            // Config
            $table->boolean('is_active')->default(true)->index();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            $table->unique(['limit_type', 'limit_key']);
        });
        
        // Default rate limits for major ISPs
        DB::table('rate_limits')->insert([
            ['limit_type' => 'domain', 'limit_key' => 'gmail.com', 'max_per_hour' => 10000, 'notes' => 'Google rate limits', 'created_at' => now(), 'updated_at' => now()],
            ['limit_type' => 'domain', 'limit_key' => 'yahoo.com', 'max_per_hour' => 5000, 'notes' => 'Yahoo rate limits', 'created_at' => now(), 'updated_at' => now()],
            ['limit_type' => 'domain', 'limit_key' => 'hotmail.com', 'max_per_hour' => 5000, 'notes' => 'Microsoft rate limits', 'created_at' => now(), 'updated_at' => now()],
            ['limit_type' => 'domain', 'limit_key' => 'outlook.com', 'max_per_hour' => 5000, 'notes' => 'Microsoft rate limits', 'created_at' => now(), 'updated_at' => now()],
            ['limit_type' => 'domain', 'limit_key' => 'aol.com', 'max_per_hour' => 3000, 'notes' => 'AOL rate limits', 'created_at' => now(), 'updated_at' => now()],
        ]);
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // SUPPRESSION LIST (Do Not Contact)
        // ═══════════════════════════════════════════════════════════════════════════════
        
        Schema::create('suppression_list', function (Blueprint $table) {
            $table->id();
            
            // What's suppressed
            $table->string('channel', 20)->index(); // email, sms, push, all
            $table->string('address', 255)->index(); // email or phone
            
            // Why
            $table->string('reason', 50); // bounce_hard, complaint, unsubscribe, manual, legal
            $table->string('source', 100)->nullable(); // Where the suppression came from
            
            // Scope
            $table->unsignedBigInteger('community_id')->nullable(); // NULL = global, otherwise community-specific
            
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('expires_at')->nullable()->index(); // NULL = permanent
            
            $table->index(['channel', 'address', 'expires_at']);
        });
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // MESSAGE TEMPLATES
        // ═══════════════════════════════════════════════════════════════════════════════
        
        Schema::create('message_templates', function (Blueprint $table) {
            $table->id();
            
            // Identification
            $table->string('slug', 100)->unique();
            $table->string('name', 255);
            $table->text('description')->nullable();
            
            // Channel
            $table->string('channel', 20); // email, sms, push
            
            // Content
            $table->string('subject', 255)->nullable(); // For email
            $table->text('body_html')->nullable(); // For email
            $table->text('body_text')->nullable(); // For email/SMS
            
            // Variables
            $table->json('variables')->default('[]'); // List of expected variables
            
            // Versioning
            $table->integer('version')->default(1);
            $table->boolean('is_active')->default(true)->index();
            
            $table->timestamps();
            
            $table->index(['channel', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_templates');
        Schema::dropIfExists('suppression_list');
        Schema::dropIfExists('rate_limits');
        Schema::dropIfExists('channel_health');
        Schema::dropIfExists('delivery_events');
        Schema::dropIfExists('message_queue');
    }
};
