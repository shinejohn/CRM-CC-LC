<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('outbound_campaign_id');

            $table->string('label'); // e.g. 'A', 'B'
            $table->string('subject')->nullable();
            $table->text('message')->nullable();
            $table->uuid('template_id')->nullable();
            $table->integer('weight')->default(50); // split percentage

            $table->integer('recipients_count')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('open_count')->default(0);
            $table->integer('click_count')->default(0);
            $table->boolean('is_winner')->default(false);

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('outbound_campaign_id')
                ->references('id')
                ->on('outbound_campaigns')
                ->onDelete('cascade');

            $table->index('outbound_campaign_id');
        });

        // Additive A/B columns on outbound_campaigns (guarded).
        Schema::table('outbound_campaigns', function (Blueprint $table) {
            if (! Schema::hasColumn('outbound_campaigns', 'ab_test_enabled')) {
                $table->boolean('ab_test_enabled')->default(false);
            }
            if (! Schema::hasColumn('outbound_campaigns', 'ab_winner_metric')) {
                $table->string('ab_winner_metric')->nullable(); // 'open_rate' | 'click_rate'
            }
            if (! Schema::hasColumn('outbound_campaigns', 'ab_test_size')) {
                $table->integer('ab_test_size')->nullable(); // % of audience in the test
            }
        });

        // Track which variant a recipient was assigned (null = no A/B).
        Schema::table('campaign_recipients', function (Blueprint $table) {
            if (! Schema::hasColumn('campaign_recipients', 'variant_id')) {
                $table->uuid('variant_id')->nullable();
                $table->index('variant_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('campaign_recipients', function (Blueprint $table) {
            if (Schema::hasColumn('campaign_recipients', 'variant_id')) {
                $table->dropIndex(['variant_id']);
                $table->dropColumn('variant_id');
            }
        });

        Schema::table('outbound_campaigns', function (Blueprint $table) {
            foreach (['ab_test_enabled', 'ab_winner_metric', 'ab_test_size'] as $column) {
                if (Schema::hasColumn('outbound_campaigns', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::dropIfExists('campaign_variants');
    }
};
