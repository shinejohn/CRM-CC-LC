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
        // Service + product catalog (community-influencer / expert / sponsor / reporter bundles live here)
        $this->call([
            ServiceCatalogSeeder::class,
            ProductCatalogSeeder::class,
        ]);

        // Seed operations data
        $this->call([
            \Database\Seeders\Operations\MetricDefinitionsSeeder::class,
            \Database\Seeders\Operations\InfrastructureComponentsSeeder::class,
            \Database\Seeders\Operations\AlertRulesSeeder::class,
        ]);

        // Manifest Destiny — community rollout outreach (run `db:wipe` before re-seeding timelines)
        $this->call([
            ManifestDestinyTimelineSeeder::class,
            ManifestDestinyEmailTemplateSeeder::class,
        ]);

        // Per-community slot caps (no-op until `communities` has rows; re-run after importing communities)
        $this->call([
            SlotLimitSeeder::class,
        ]);
    }
}
