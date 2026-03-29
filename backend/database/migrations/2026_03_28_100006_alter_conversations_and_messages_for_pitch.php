<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            if (! Schema::hasColumn('conversations', 'pitch_subject')) {
                $table->string('pitch_subject')->nullable()->after('session_id');
            }
            if (! Schema::hasColumn('conversations', 'pitch_status')) {
                $table->string('pitch_status', 50)->nullable()->after('pitch_subject');
            }
            if (! Schema::hasColumn('conversations', 'pitch_source')) {
                $table->string('pitch_source', 50)->nullable()->after('pitch_status');
            }
            if (! Schema::hasColumn('conversations', 'pitch_metadata')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('pitch_metadata')->nullable()->after('pitch_source');
                } else {
                    $table->json('pitch_metadata')->nullable()->after('pitch_source');
                }
            }
        });

        Schema::table('conversation_messages', function (Blueprint $table) {
            if (! Schema::hasColumn('conversation_messages', 'message_type')) {
                $table->string('message_type', 80)->nullable()->after('role');
            }
            if (! Schema::hasColumn('conversation_messages', 'source')) {
                $table->string('source', 50)->nullable()->after('message_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('conversation_messages', function (Blueprint $table) {
            if (Schema::hasColumn('conversation_messages', 'source')) {
                $table->dropColumn('source');
            }
            if (Schema::hasColumn('conversation_messages', 'message_type')) {
                $table->dropColumn('message_type');
            }
        });

        Schema::table('conversations', function (Blueprint $table) {
            foreach (['pitch_metadata', 'pitch_source', 'pitch_status', 'pitch_subject'] as $c) {
                if (Schema::hasColumn('conversations', $c)) {
                    $table->dropColumn($c);
                }
            }
        });
    }
};
