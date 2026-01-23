<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed service catalog
        $this->call([
            ServiceCatalogSeeder::class,
        ]);

        // Seed operations data
        $this->call([
            \Database\Seeders\Operations\MetricDefinitionsSeeder::class,
            \Database\Seeders\Operations\InfrastructureComponentsSeeder::class,
            \Database\Seeders\Operations\AlertRulesSeeder::class,
        ]);
    }
}
