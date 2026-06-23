<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

final class BackfillCustomerOrgType extends Command
{
    protected $signature = 'customers:backfill-org-type {--dry-run : Count rows in each bucket without writing}';

    protected $description = 'Backfill the org_type/org_subtype columns on existing customers using external_id prefixes and PP metadata';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        if ($dryRun) {
            $this->warn('DRY RUN — no rows will be updated.');
        }

        // 1. Nonprofits — external_id like 'np:%'. Subtype = NTEE code from PP metadata.
        $nonprofit = $dryRun
            ? (int) DB::table('customers')
                ->whereNull('org_type')
                ->where('external_id', 'like', 'np:%')
                ->count()
            : DB::update(
                "UPDATE customers
                 SET org_type = 'nonprofit',
                     org_subtype = COALESCE(org_subtype, metadata->>'pp_ntee_code')
                 WHERE org_type IS NULL
                   AND external_id LIKE 'np:%'"
            );
        $this->line(($dryRun ? 'Would backfill' : 'Backfilled')." nonprofit: {$nonprofit}");

        // 2. Civic entities — external_id like 'civic:%'. Map PP entity_type → org_type.
        $civic = $dryRun
            ? (int) DB::table('customers')
                ->whereNull('org_type')
                ->where('external_id', 'like', 'civic:%')
                ->count()
            : DB::update(
                "UPDATE customers
                 SET org_type = CASE lower(metadata->>'pp_entity_type')
                         WHEN 'school' THEN 'education'
                         WHEN 'school_district' THEN 'education'
                         WHEN 'church' THEN 'religious'
                         WHEN 'nonprofit' THEN 'nonprofit'
                         ELSE 'government'
                     END,
                     org_subtype = COALESCE(org_subtype, metadata->>'pp_entity_subtype')
                 WHERE org_type IS NULL
                   AND external_id LIKE 'civic:%'"
            );
        $this->line(($dryRun ? 'Would backfill' : 'Backfilled')." civic: {$civic}");

        // 3. Businesses default — everything else still NULL becomes 'smb'.
        //    Business-customer rows (Google Maps scrapes) do not carry pp_organization_type
        //    in metadata, so there is nothing more specific to key on; default to 'smb'.
        $business = $dryRun
            ? (int) DB::table('customers')->whereNull('org_type')->count()
            : DB::update("UPDATE customers SET org_type = 'smb' WHERE org_type IS NULL");
        $this->line(($dryRun ? 'Would backfill' : 'Backfilled')." smb (default): {$business}");

        $this->newLine();
        $this->table(
            ['Bucket', $dryRun ? 'Rows (would change)' : 'Rows updated'],
            [
                ['nonprofit', $nonprofit],
                ['civic', $civic],
                ['smb (default)', $business],
                ['total', $nonprofit + $civic + $business],
            ]
        );

        return self::SUCCESS;
    }
}
