<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletters', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);
            $table->foreignId('community_id')->constrained('communities')->onDelete('cascade');
            
            // Type and scheduling
            $table->string('newsletter_type', 20)->comment('daily, weekly, special');
            $table->date('issue_date');
            $table->timestamp('scheduled_for')->nullable();
            
            // Content
            $table->string('subject', 255);
            $table->string('subject_b', 255)->nullable()->comment('For A/B testing');
            $table->string('preheader', 255)->nullable();
            
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('content_json')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('content_json')->default('{}');
            }
            $table->text('content_html')->nullable()->comment('Rendered HTML (cached)');
            
            // Status
            $table->string('status', 20)->default('draft')->comment('draft, scheduled, building, sending, sent, failed');
            
            // A/B test config
            $table->boolean('ab_test_enabled')->default(false);
            $table->integer('ab_test_percentage')->default(10)->comment('% to send variant B');
            $table->string('ab_test_winner', 1)->nullable()->comment('a or b after test');
            $table->timestamp('ab_test_decided_at')->nullable();
            
            // Stats (denormalized for quick access)
            $table->integer('recipient_count')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('delivered_count')->default(0);
            $table->integer('open_count')->default(0);
            $table->integer('unique_open_count')->default(0);
            $table->integer('click_count')->default(0);
            $table->integer('unique_click_count')->default(0);
            $table->integer('unsubscribe_count')->default(0);
            
            // Revenue tracking
            $table->integer('sponsor_revenue_cents')->default(0);
            
            // Timestamps
            $table->timestamp('building_started_at')->nullable();
            $table->timestamp('sending_started_at')->nullable();
            $table->timestamp('sending_completed_at')->nullable();
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['community_id', 'newsletter_type', 'issue_date']);
        });
        
        // Indexes
        Schema::table('newsletters', function (Blueprint $table) {
            $table->index(['scheduled_for', 'status'], 'idx_newsletters_schedule')
                ->where('status', '=', 'scheduled');
            $table->index(['community_id', 'issue_date'], 'idx_newsletters_community');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletters');
    }
};



