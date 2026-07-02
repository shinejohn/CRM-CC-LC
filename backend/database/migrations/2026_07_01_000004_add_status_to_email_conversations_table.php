<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_conversations', function (Blueprint $table): void {
            // Inbox workflow state: pending -> responded / escalated / archived.
            $table->string('status', 30)->default('pending')->index();
        });
    }

    public function down(): void
    {
        Schema::table('email_conversations', function (Blueprint $table): void {
            $table->dropColumn('status');
        });
    }
};
