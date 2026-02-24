<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_studio_connected_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('smb_id');
            $table->enum('platform', ['facebook', 'instagram', 'x', 'google_biz', 'linkedin', 'pinterest']);
            $table->string('platform_account_id');
            $table->string('display_name')->nullable();
            $table->string('profile_image_url')->nullable();
            $table->text('oauth_access_token');
            $table->text('oauth_refresh_token')->nullable();
            $table->timestamp('token_expires_at')->nullable();
            
            // JSON to be SQLite test-friendly
            $table->json('scopes')->nullable(); 
            
            $table->enum('status', ['active', 'expired', 'revoked'])->default('active');
            $table->timestamp('connected_at')->nullable();
            $table->timestamp('last_verified_at')->nullable();
            $table->timestamps();

            $table->foreign('smb_id')->references('id')->on('smbs')->onDelete('cascade');
            $table->unique(['smb_id', 'platform', 'platform_account_id'], 'studio_accounts_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_studio_connected_accounts');
    }
};
