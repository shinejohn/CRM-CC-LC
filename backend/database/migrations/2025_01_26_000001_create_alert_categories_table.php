<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('alert_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slug', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            
            // Defaults
            $table->string('default_severity', 20)->default('standard');
            $table->boolean('default_send_sms')->default(false);
            
            // Subscriber preferences
            $table->boolean('allow_opt_out')->default(true);
            
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            
            $table->timestamps();
        });

        // Insert default categories
        DB::table('alert_categories')->insert([
            ['id' => Str::uuid()->toString(), 'slug' => 'breaking', 'name' => 'Breaking News', 'default_severity' => 'urgent', 'default_send_sms' => false, 'allow_opt_out' => false, 'display_order' => 1],
            ['id' => Str::uuid()->toString(), 'slug' => 'weather', 'name' => 'Weather Alerts', 'default_severity' => 'standard', 'default_send_sms' => true, 'allow_opt_out' => true, 'display_order' => 2],
            ['id' => Str::uuid()->toString(), 'slug' => 'traffic', 'name' => 'Traffic Updates', 'default_severity' => 'standard', 'default_send_sms' => false, 'allow_opt_out' => true, 'display_order' => 3],
            ['id' => Str::uuid()->toString(), 'slug' => 'crime', 'name' => 'Crime & Safety', 'default_severity' => 'urgent', 'default_send_sms' => false, 'allow_opt_out' => true, 'display_order' => 4],
            ['id' => Str::uuid()->toString(), 'slug' => 'sports', 'name' => 'Sports', 'default_severity' => 'standard', 'default_send_sms' => false, 'allow_opt_out' => true, 'display_order' => 5],
            ['id' => Str::uuid()->toString(), 'slug' => 'politics', 'name' => 'Politics', 'default_severity' => 'standard', 'default_send_sms' => false, 'allow_opt_out' => true, 'display_order' => 6],
            ['id' => Str::uuid()->toString(), 'slug' => 'business', 'name' => 'Business', 'default_severity' => 'standard', 'default_send_sms' => false, 'allow_opt_out' => true, 'display_order' => 7],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alert_categories');
    }
};



