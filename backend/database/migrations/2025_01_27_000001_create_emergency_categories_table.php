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
        Schema::create('emergency_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slug', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            
            // Template defaults
            $table->string('default_severity', 20)->default('severe');
            $table->text('template_message')->nullable();
            $table->text('template_instructions')->nullable();
            
            // Channel defaults
            $table->boolean('default_voice')->default(false);
            
            // Display
            $table->string('icon', 50)->nullable();
            $table->string('color', 20)->nullable();
            $table->integer('display_order')->default(0);
            
            $table->timestamps();
        });

        // Insert default categories
        DB::table('emergency_categories')->insert([
            ['id' => Str::uuid()->toString(), 'slug' => 'fire', 'name' => 'Fire/Wildfire', 'default_severity' => 'critical', 'template_message' => 'A fire emergency has been declared in your area.', 'template_instructions' => 'Follow evacuation orders. Do not return until authorities indicate it is safe.', 'default_voice' => true, 'icon' => '🔥', 'color' => '#dc2626', 'display_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid()->toString(), 'slug' => 'flood', 'name' => 'Flood', 'default_severity' => 'severe', 'template_message' => 'A flood warning is in effect for your area.', 'template_instructions' => 'Move to higher ground immediately. Avoid walking or driving through flood waters.', 'default_voice' => true, 'icon' => '🌊', 'color' => '#2563eb', 'display_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid()->toString(), 'slug' => 'earthquake', 'name' => 'Earthquake', 'default_severity' => 'critical', 'template_message' => 'An earthquake has occurred in your area.', 'template_instructions' => 'Drop, Cover, and Hold On. After shaking stops, check for injuries and damage.', 'default_voice' => false, 'icon' => '⚠️', 'color' => '#dc2626', 'display_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid()->toString(), 'slug' => 'tornado', 'name' => 'Tornado', 'default_severity' => 'critical', 'template_message' => 'A tornado warning is in effect for your area.', 'template_instructions' => 'Seek shelter immediately in a basement or interior room on the lowest floor.', 'default_voice' => true, 'icon' => '🌪️', 'color' => '#dc2626', 'display_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid()->toString(), 'slug' => 'shooter', 'name' => 'Active Threat', 'default_severity' => 'critical', 'template_message' => 'An active threat has been reported in your area.', 'template_instructions' => 'Run, Hide, Fight. If possible, evacuate. If not, hide and silence your phone.', 'default_voice' => true, 'icon' => '🚨', 'color' => '#dc2626', 'display_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid()->toString(), 'slug' => 'amber', 'name' => 'AMBER Alert', 'default_severity' => 'severe', 'template_message' => 'An AMBER Alert has been issued.', 'template_instructions' => 'If you see the suspect or vehicle, call 911 immediately. Do not approach.', 'default_voice' => false, 'icon' => '🚨', 'color' => '#f59e0b', 'display_order' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid()->toString(), 'slug' => 'shelter', 'name' => 'Shelter in Place', 'default_severity' => 'severe', 'template_message' => 'A shelter in place order has been issued for your area.', 'template_instructions' => 'Remain indoors. Close all windows and doors. Monitor local news for updates.', 'default_voice' => false, 'icon' => '🏠', 'color' => '#f59e0b', 'display_order' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid()->toString(), 'slug' => 'evacuation', 'name' => 'Evacuation Order', 'default_severity' => 'critical', 'template_message' => 'An evacuation order has been issued for your area.', 'template_instructions' => 'Leave immediately using designated routes. Take essential items only.', 'default_voice' => true, 'icon' => '🚨', 'color' => '#dc2626', 'display_order' => 8, 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid()->toString(), 'slug' => 'health', 'name' => 'Public Health', 'default_severity' => 'severe', 'template_message' => 'A public health emergency has been declared.', 'template_instructions' => 'Follow guidance from health authorities.', 'default_voice' => false, 'icon' => '🏥', 'color' => '#f59e0b', 'display_order' => 9, 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid()->toString(), 'slug' => 'other', 'name' => 'Other Emergency', 'default_severity' => 'moderate', 'template_message' => null, 'template_instructions' => 'Follow instructions from local authorities.', 'default_voice' => false, 'icon' => '⚠️', 'color' => '#6b7280', 'display_order' => 10, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_categories');
    }
};



