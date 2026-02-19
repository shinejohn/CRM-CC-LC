<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('email_conversations')) {
            return;
        }
        Schema::create('email_conversations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('smb_id')->nullable();

            $table->string('direction', 10);
            $table->string('from_email');
            $table->string('to_email');
            $table->string('subject')->nullable();
            $table->text('body');
            $table->text('body_html')->nullable();

            $table->string('in_reply_to')->nullable();
            $table->foreignId('campaign_send_id')->nullable()->constrained();

            $table->string('intent', 100)->nullable();
            $table->string('sentiment', 50)->nullable();

            $table->boolean('ai_responded')->default(false);
            $table->text('ai_response')->nullable();

            $table->timestamps();

            $table->index('smb_id');
            $table->index('direction');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_conversations');
    }
};



