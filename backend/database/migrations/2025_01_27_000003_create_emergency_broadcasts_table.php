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
        if (!Schema::hasTable('emergency_broadcasts')) {
            Schema::create('emergency_broadcasts', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);
                
                // Content
                $table->string('title', 255);
                $table->text('message');
                $table->text('instructions')->nullable();
                
                // Classification
                $table->string('category', 50);
                $table->string('severity', 20);
                
                // Targeting
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('community_ids')->default(DB::raw("'[]'::jsonb"));
                } else {
                    $table->json('community_ids')->default('[]');
                }
                
                $table->boolean('send_email')->default(true);
                $table->boolean('send_sms')->default(true);
                $table->boolean('send_push')->default(true);
                $table->boolean('send_voice')->default(false);
                
                $table->foreignId('authorized_by')->constrained('users')->onDelete('restrict');
                $table->string('authorizer_name', 255);
                $table->string('authorizer_title', 255);
                $table->string('authorization_code', 100);
                $table->timestamp('authorized_at');
                
                $table->string('status', 20)->default('pending');
                $table->timestamp('sending_started_at')->nullable();
                $table->timestamp('sending_completed_at')->nullable();
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
                
                $table->string('ipaws_alert_id', 100)->nullable();
                
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('audit_log')->default(DB::raw("'[]'::jsonb"));
                } else {
                    $table->json('audit_log')->default('[]');
                }
                
                $table->timestamps();
                $table->index(['status', 'created_at']);
            });
        }

        // Separate check for index
        if (DB::getDriverName() === 'pgsql') {
            try {
                // Check if index exists by querying pg_indexes
                $indexExists = DB::select("SELECT count(*) FROM pg_indexes WHERE indexname = 'idx_emergency_communities'")[0]->count > 0;
                if (!$indexExists) {
                    DB::statement('CREATE INDEX idx_emergency_communities ON emergency_broadcasts USING GIN (community_ids)');
                }
            } catch (\Exception $e) {
                // Log and continue if index fails
                error_log("Failed to create GIN index: " . $e->getMessage());
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_broadcasts');
    }
};
