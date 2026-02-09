<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Add SMB-specific fields that may not exist
            if (!Schema::hasColumn('customers', 'dba_name')) {
                $table->string('dba_name')->nullable()->after('business_name');
            }
            
            if (!Schema::hasColumn('customers', 'business_type')) {
                $table->string('business_type', 100)->nullable()->after('dba_name');
            }
            
            if (!Schema::hasColumn('customers', 'category')) {
                $table->string('category', 100)->nullable()->after('business_type');
            }
            
            if (!Schema::hasColumn('customers', 'primary_contact_name')) {
                $table->string('primary_contact_name')->nullable()->after('owner_name');
            }
            
            if (!Schema::hasColumn('customers', 'primary_email')) {
                $table->string('primary_email')->nullable()->after('primary_contact_name');
            }
            
            if (!Schema::hasColumn('customers', 'primary_phone')) {
                $table->string('primary_phone', 50)->nullable()->after('primary_email');
            }
            
            if (!Schema::hasColumn('customers', 'secondary_contacts')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('secondary_contacts')->default(DB::raw("'[]'::jsonb"))->nullable()->after('primary_phone');
                } else {
                    $table->json('secondary_contacts')->default('[]')->nullable()->after('primary_phone');
                }
            }
            
            if (!Schema::hasColumn('customers', 'address')) {
                $table->string('address')->nullable()->after('address_line2');
            }
            
            if (!Schema::hasColumn('customers', 'coordinates')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('coordinates')->nullable()->after('address');
                } else {
                    $table->json('coordinates')->nullable()->after('address');
                }
            }
            
            if (!Schema::hasColumn('customers', 'total_approvals')) {
                $table->integer('total_approvals')->default(0)->after('last_approval');
            }
            
            if (!Schema::hasColumn('customers', 'total_meetings')) {
                $table->integer('total_meetings')->default(0)->after('total_approvals');
            }
            
            if (!Schema::hasColumn('customers', 'metadata')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('metadata')->default(DB::raw("'{}'::jsonb"))->nullable()->after('data_quality_score');
                } else {
                    $table->json('metadata')->default('{}')->nullable()->after('data_quality_score');
                }
            }
            
            // Add indexes for new columns
            if (Schema::hasColumn('customers', 'primary_email')) {
                $table->index('primary_email');
            }
            if (Schema::hasColumn('customers', 'primary_phone')) {
                $table->index('primary_phone');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $columns = [
                'dba_name',
                'business_type',
                'category',
                'primary_contact_name',
                'primary_email',
                'primary_phone',
                'secondary_contacts',
                'address',
                'coordinates',
                'total_approvals',
                'total_meetings',
                'metadata',
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('customers', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
