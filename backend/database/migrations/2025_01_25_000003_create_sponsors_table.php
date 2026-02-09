<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sponsors', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);

            // Identity
            $table->string('name', 255);
            $table->foreignId('smb_id')->nullable()->constrained('customers')->onDelete('set null')->comment('If sponsor is also an SMB');

            // Display
            $table->string('logo_url', 500)->nullable();
            $table->string('website_url', 500)->nullable();
            $table->string('tagline', 255)->nullable();

            // Contact
            $table->string('contact_email', 255)->nullable();
            $table->string('contact_name', 255)->nullable();

            // Status
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsors');
    }
};



