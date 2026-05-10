<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketing_kit_assets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('smb_id')->constrained('smbs')->cascadeOnDelete();
            $table->text('asset_type');
            $table->text('platform')->nullable();
            $table->text('title');
            $table->jsonb('config');
            $table->text('generated_html')->nullable();
            $table->text('generated_svg')->nullable();
            $table->text('embed_code')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampTz('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('content_cards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('smb_id')->nullable()->constrained('smbs')->nullOnDelete();
            $table->foreignUuid('community_id')->constrained('communities')->cascadeOnDelete();
            $table->text('content_type');
            $table->text('card_mode');
            $table->jsonb('content_data');
            $table->jsonb('sponsor_data')->nullable();
            $table->text('caption_text');
            $table->text('tracking_url')->nullable();
            $table->timestampTz('posted_at')->nullable();
            $table->integer('clicks')->default(0);
            $table->date('date_for');
            $table->timestamps();
        });

        Schema::create('syndication_partners', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('name');
            $table->text('email');
            $table->text('tier')->default('bronze');
            $table->integer('revenue_share_pct')->default(20);
            $table->integer('total_earned')->default(0);
            $table->text('status')->default('pending');
            $table->timestamps();
        });

        Schema::create('partner_communities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('partner_id')->constrained('syndication_partners')->cascadeOnDelete();
            $table->foreignUuid('community_id')->nullable()->constrained('communities')->nullOnDelete();
            $table->text('platform');
            $table->text('group_name');
            $table->text('group_url')->nullable();
            $table->integer('member_count')->default(0);
            $table->text('status')->default('pending');
            $table->integer('posts_this_month')->default(0);
            $table->integer('clicks_this_month')->default(0);
            $table->timestamps();
        });

        Schema::create('sponsor_placements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('smb_id')->constrained('smbs')->cascadeOnDelete();
            $table->foreignUuid('partner_id')->constrained('syndication_partners')->cascadeOnDelete();
            $table->integer('monthly_budget_cents');
            $table->integer('partner_cut_cents');
            $table->text('status')->default('active');
            $table->integer('posts_delivered')->default(0);
            $table->integer('clicks_delivered')->default(0);
            $table->timestamps();
        });

        Schema::create('click_tracking', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('content_card_id')->nullable()->constrained('content_cards')->nullOnDelete();
            $table->foreignUuid('asset_id')->nullable()->constrained('marketing_kit_assets')->nullOnDelete();
            $table->foreignUuid('partner_id')->nullable()->constrained('syndication_partners')->nullOnDelete();
            $table->foreignUuid('smb_id')->nullable()->constrained('smbs')->nullOnDelete();
            $table->foreignUuid('community_id')->nullable()->constrained('communities')->nullOnDelete();
            $table->text('source');
            $table->jsonb('utm_params');
            $table->text('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestampTz('clicked_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('click_tracking');
        Schema::dropIfExists('sponsor_placements');
        Schema::dropIfExists('partner_communities');
        Schema::dropIfExists('syndication_partners');
        Schema::dropIfExists('content_cards');
        Schema::dropIfExists('marketing_kit_assets');
    }
};
