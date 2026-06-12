<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── sla_policies ─────────────────────────────────────────────────────
        if (! Schema::hasTable('sla_policies')) {
            Schema::create('sla_policies', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name');
                $table->string('ticket_type', 30); // support | implementation | sales
                $table->string('priority', 20);    // low | normal | high | critical
                $table->integer('first_response_hrs')->default(24);
                $table->integer('resolution_hrs')->default(72);
                $table->string('applies_to_plan')->nullable();
                $table->timestamps();

                $table->index(['ticket_type', 'priority']);
            });

            // Seed default SLA policies
            $now = now();
            DB::table('sla_policies')->insert([
                // Support
                ['id' => \Illuminate\Support\Str::uuid(), 'name' => 'Support - Critical', 'ticket_type' => 'support', 'priority' => 'critical', 'first_response_hrs' => 1,  'resolution_hrs' => 4,   'applies_to_plan' => null, 'created_at' => $now, 'updated_at' => $now],
                ['id' => \Illuminate\Support\Str::uuid(), 'name' => 'Support - High',     'ticket_type' => 'support', 'priority' => 'high',     'first_response_hrs' => 4,  'resolution_hrs' => 24,  'applies_to_plan' => null, 'created_at' => $now, 'updated_at' => $now],
                ['id' => \Illuminate\Support\Str::uuid(), 'name' => 'Support - Normal',   'ticket_type' => 'support', 'priority' => 'normal',   'first_response_hrs' => 24, 'resolution_hrs' => 72,  'applies_to_plan' => null, 'created_at' => $now, 'updated_at' => $now],
                ['id' => \Illuminate\Support\Str::uuid(), 'name' => 'Support - Low',      'ticket_type' => 'support', 'priority' => 'low',      'first_response_hrs' => 48, 'resolution_hrs' => 168, 'applies_to_plan' => null, 'created_at' => $now, 'updated_at' => $now],
                // Implementation
                ['id' => \Illuminate\Support\Str::uuid(), 'name' => 'Implementation - High',   'ticket_type' => 'implementation', 'priority' => 'high',   'first_response_hrs' => 4,  'resolution_hrs' => 72,  'applies_to_plan' => null, 'created_at' => $now, 'updated_at' => $now],
                ['id' => \Illuminate\Support\Str::uuid(), 'name' => 'Implementation - Normal', 'ticket_type' => 'implementation', 'priority' => 'normal', 'first_response_hrs' => 24, 'resolution_hrs' => 168, 'applies_to_plan' => null, 'created_at' => $now, 'updated_at' => $now],
                // Sales
                ['id' => \Illuminate\Support\Str::uuid(), 'name' => 'Sales - High',   'ticket_type' => 'sales', 'priority' => 'high',   'first_response_hrs' => 4,  'resolution_hrs' => 48,  'applies_to_plan' => null, 'created_at' => $now, 'updated_at' => $now],
                ['id' => \Illuminate\Support\Str::uuid(), 'name' => 'Sales - Normal', 'ticket_type' => 'sales', 'priority' => 'normal', 'first_response_hrs' => 24, 'resolution_hrs' => 96,  'applies_to_plan' => null, 'created_at' => $now, 'updated_at' => $now],
            ]);
        }

        // ── tickets ──────────────────────────────────────────────────────────
        if (! Schema::hasTable('tickets')) {
            Schema::create('tickets', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('ticket_number', 20)->unique(); // TKT-2026-00001
                $table->string('type', 20);      // support | implementation | sales
                $table->string('status', 20)->default('new'); // new | open | pending | in_progress | escalated | resolved | closed | cancelled
                $table->string('priority', 20)->default('normal'); // low | normal | high | critical
                $table->string('subject');
                $table->text('description')->nullable();

                // CRM links
                $table->uuid('client_id')->nullable();   // → smbs.id
                $table->uuid('contact_id')->nullable();  // → customers.id
                $table->uuid('community_id')->nullable();

                $table->string('channel', 50)->nullable(); // facebook | instagram | day.news | email
                $table->string('app', 50)->nullable();     // day_news | goeventcity | downtowns_guide | alphasite_ai | golocal_voices
                $table->string('source', 30)->default('manual'); // email | social_monitor | manual | reader_form | internal

                $table->uuid('assigned_to')->nullable();
                $table->uuid('created_by')->nullable();

                $table->text('external_ref')->nullable(); // post ID, comment URL from social monitor

                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('tags')->default(DB::raw("'[]'::jsonb"));
                } else {
                    $table->json('tags')->default('[]');
                }

                $table->uuid('sla_policy_id')->nullable();
                $table->timestampTz('due_at')->nullable();
                $table->timestampTz('first_responded_at')->nullable();
                $table->timestampTz('resolved_at')->nullable();
                $table->timestamps();

                $table->index('ticket_number');
                $table->index('client_id');
                $table->index('contact_id');
                $table->index('community_id');
                $table->index('assigned_to');
                $table->index('status');
                $table->index('type');
                $table->index('priority');
                $table->index('created_at');
                $table->index('due_at');
            });
        }

        // ── ticket_notes ─────────────────────────────────────────────────────
        if (! Schema::hasTable('ticket_notes')) {
            Schema::create('ticket_notes', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('ticket_id');
                $table->uuid('author_id')->nullable();
                $table->text('body');
                $table->boolean('is_internal')->default(true);
                $table->timestamps();

                $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
                $table->index('ticket_id');
                $table->index('created_at');
            });
        }

        // ── ticket_attachments ───────────────────────────────────────────────
        if (! Schema::hasTable('ticket_attachments')) {
            Schema::create('ticket_attachments', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('ticket_id');
                $table->string('filename');
                $table->text('url');
                $table->uuid('uploaded_by')->nullable();
                $table->timestamps();

                $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
                $table->index('ticket_id');
            });
        }

        // ── ticket_status_history ────────────────────────────────────────────
        if (! Schema::hasTable('ticket_status_history')) {
            Schema::create('ticket_status_history', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('ticket_id');
                $table->string('from_status', 20)->nullable();
                $table->string('to_status', 20);
                $table->uuid('changed_by')->nullable();
                $table->timestampTz('changed_at')->useCurrent();
                $table->text('reason')->nullable();

                $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
                $table->index('ticket_id');
                $table->index('changed_at');
            });
        }

        // ── implementation_stages ────────────────────────────────────────────
        if (! Schema::hasTable('implementation_stages')) {
            Schema::create('implementation_stages', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('ticket_id');
                $table->string('stage_name');
                $table->smallInteger('stage_order')->default(0);
                $table->string('status', 20)->default('pending'); // pending | in_progress | complete | blocked
                $table->uuid('assigned_to')->nullable();
                $table->timestampTz('due_at')->nullable();
                $table->timestampTz('completed_at')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
                $table->index('ticket_id');
                $table->index(['ticket_id', 'stage_order']);
            });
        }

        // ── monitoring_signals ───────────────────────────────────────────────
        if (! Schema::hasTable('monitoring_signals')) {
            Schema::create('monitoring_signals', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('source_platform', 50); // facebook | instagram | x | linkedin
                $table->uuid('community_id')->nullable();
                $table->text('raw_content');
                $table->string('signal_type', 30); // complaint | bug_report | content_error | positive | spam | other
                $table->text('url')->nullable();
                $table->timestampTz('detected_at')->useCurrent();
                $table->uuid('ticket_id')->nullable();
                $table->boolean('auto_created')->default(false);
                $table->uuid('reviewed_by')->nullable();
                $table->timestampTz('reviewed_at')->nullable();
                $table->timestamps();

                $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('set null');
                $table->index('community_id');
                $table->index('signal_type');
                $table->index('source_platform');
                $table->index('detected_at');
                $table->index('ticket_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('monitoring_signals');
        Schema::dropIfExists('implementation_stages');
        Schema::dropIfExists('ticket_status_history');
        Schema::dropIfExists('ticket_attachments');
        Schema::dropIfExists('ticket_notes');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('sla_policies');
    }
};
