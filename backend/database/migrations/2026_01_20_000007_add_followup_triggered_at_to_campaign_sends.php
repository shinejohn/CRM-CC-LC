<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaign_sends', function (Blueprint $table) {
            $table->timestamp('followup_triggered_at')->nullable()->after('complained_at');
            $table->integer('followup_count')->default(0)->after('followup_triggered_at');
            $table->string('followup_strategy')->nullable()->after('followup_count');
            // e.g., 'resend_email', 'send_sms', 'schedule_call', 'escalate'
            
            $table->index(['status', 'sent_at', 'opened_at', 'followup_triggered_at']);
        });
    }

    public function down(): void
    {
        Schema::table('campaign_sends', function (Blueprint $table) {
            $table->dropIndex(['status', 'sent_at', 'opened_at', 'followup_triggered_at']);
            $table->dropColumn([
                'followup_triggered_at',
                'followup_count',
                'followup_strategy',
            ]);
        });
    }
};

