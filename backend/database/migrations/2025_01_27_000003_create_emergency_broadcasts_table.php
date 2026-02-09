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
        Schema::create('emergency_broadcasts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);
            
            // Content
            $table->string('title', 255);
            $table->text('message');
            $table->text('instructions')->nullable();
            
            // Classification
            $table->string('category', 50); // fire, flood, earthquake, tornado, shooter, amber, shelter, evacuation, other
            $table->string('severity', 20); // critical, severe, moderate
            
            // Targeting
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('community_ids')->default(DB::raw("'[]'::jsonb"));
            } else {
                $table->json('community_ids')->default('[]');
            }
            
            // ALL channels for emergencies
            $table->boolean('send_email')->default(true);
            $table->boolean('send_sms')->default(true);
            $table->boolean('send_push')->default(true);
            $table->boolean('send_voice')->default(false);
            
            // Authorization (CRITICAL)
            $table->foreignId('authorized_by')->constrained('users')->onDelete('restrict');
            $table->string('authorizer_name', 255);
            $table->string('authorizer_title', 255);
            $table->string('authorization_code', 100);
            $table->timestamp('authorized_at');
            
            // Status
            $table->string('status', 20)->default('pending'); // pending, authorized, sending, sent, cancelled
            
            // Timing
            $table->timestamp('sending_started_at')->nullable();
            $table->timestamp('sending_completed_at')->nullable();
            
            // Delivery stats
            $table->integer('total_recipients')->default(0);
            
            $table->integer('email_queued')->default(0);
            $table->integer('email_sent')->default(0);
            $table->integer('email_delivered')->default(0);
            
            $table->integer('sms_queued')->default(0);
            $table->integer('sms_sent')->default(0);
            $table->integer('sms_delivered')->default(0);
            
            $table->integer('push_queued')->default(0);
            $table->integer('push_sent')->default(0);
            $table->integer('push_delivered')->default(0);
            
            $table->integer('voice_queued')->default(0);
            $table->integer('voice_sent')->default(0);
            $table->integer('voice_answered')->default(0);
            
            // External integrations
            $table->string('ipaws_alert_id', 100)->nullable(); // FEMA IPAWS ID if integrated
            
            // Audit
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('audit_log')->default(DB::raw("'[]'::jsonb"));
            } else {
                $table->json('audit_log')->default('[]');
            }
            
            $table->timestamps();
            
            // Indexes
            $table->index(['status', 'created_at']);
            if (DB::getDriverName() === 'pgsql') {
                DB::statement('CREATE INDEX idx_emergency_communities ON emergency_broadcasts USING GIN (community_ids)');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_broadcasts');
    }
};



