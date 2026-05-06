<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\PipelineStage;
use App\Models\CampaignTimeline;
use App\Models\Community;
use App\Models\Customer;
use App\Models\SMB;
use App\Services\CampaignOrchestratorService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Community launch command — the "single command" that kicks off Manifest Destiny.
 *
 * Given a community_id:
 *  1. Loads all SMBs in the community (already imported via BusinessIngest)
 *  2. Creates Customer records for each SMB that doesn't have one
 *  3. Assigns them all to the manifest_destiny_hook timeline
 *  4. Day-1 actions execute on next scheduler run
 */
final class LaunchCommunity extends Command
{
    protected $signature = 'community:launch
                            {community_id : The community ID to launch}
                            {--dry-run : Preview what would happen without creating records}
                            {--limit=0 : Limit the number of SMBs processed (0 = all)}';

    protected $description = 'Launch Manifest Destiny for a community — create customers from SMBs and start the hook timeline';

    public function handle(CampaignOrchestratorService $orchestrator): int
    {
        $communityId = $this->argument('community_id');
        $dryRun = (bool) $this->option('dry-run');
        $limit = (int) $this->option('limit');

        $community = Community::find($communityId);
        if (! $community) {
            $this->error("Community {$communityId} not found.");

            return self::FAILURE;
        }

        $this->info("Launching Manifest Destiny for: {$community->name} (ID: {$communityId})");

        // Find the hook timeline
        $hookTimeline = CampaignTimeline::where('slug', 'manifest-destiny-hook')
            ->where('is_active', true)
            ->first();

        if (! $hookTimeline) {
            $this->error('Hook timeline not found. Run `php artisan db:seed --class=ManifestDestinyTimelineSeeder` first.');

            return self::FAILURE;
        }

        // Load SMBs in this community
        $smbQuery = SMB::where('community_id', $communityId);
        if ($limit > 0) {
            $smbQuery->limit($limit);
        }
        $smbs = $smbQuery->get();

        if ($smbs->isEmpty()) {
            $this->warn('No SMBs found in this community. Import businesses first via BusinessIngest or Google Places.');

            return self::SUCCESS;
        }

        $this->info("Found {$smbs->count()} SMB(s) in community.");

        $created = 0;
        $assigned = 0;
        $skipped = 0;
        $tenantId = (string) config('fibonacco.system_tenant_id', '00000000-0000-0000-0000-000000000001');

        foreach ($smbs as $smb) {
            // Find or create Customer for this SMB
            $customer = Customer::withoutGlobalScopes()
                ->where('smb_id', $smb->id)
                ->first();

            if (! $customer && $smb->email) {
                $customer = Customer::withoutGlobalScopes()
                    ->where('email', $smb->email)
                    ->where('community_id', $communityId)
                    ->first();
            }

            if (! $customer) {
                if ($dryRun) {
                    $this->line("  [DRY RUN] Would create customer for: {$smb->business_name}");
                    $created++;

                    continue;
                }

                $customer = Customer::create([
                    'id' => (string) Str::uuid(),
                    'tenant_id' => $tenantId,
                    'name' => $smb->owner_name ?? $smb->business_name ?? 'Business Owner',
                    'email' => $smb->email,
                    'phone' => $smb->phone,
                    'business_name' => $smb->business_name,
                    'community_id' => $communityId,
                    'smb_id' => $smb->id,
                    'pipeline_stage' => PipelineStage::HOOK,
                    'stage_entered_at' => now(),
                    'campaign_status' => 'pending',
                    'manifest_destiny_day' => 1,
                    'manifest_destiny_start_date' => now(),
                ]);

                $created++;
            }

            // Assign to hook timeline
            if ($dryRun) {
                $this->line("  [DRY RUN] Would assign: {$smb->business_name} → {$hookTimeline->name}");
                $assigned++;

                continue;
            }

            $progress = $orchestrator->startTimeline($customer, $hookTimeline);
            if ($progress->wasRecentlyCreated) {
                $assigned++;
            } else {
                $skipped++;
            }
        }

        // Mark community as launched
        if (! $dryRun && ! $community->launched_at) {
            $community->update(['launched_at' => now()]);
            $this->info("Set community launched_at to now.");
        }

        $prefix = $dryRun ? '[DRY RUN] ' : '';
        $this->info("{$prefix}Complete: {$created} customer(s) created, {$assigned} assigned to hook timeline, {$skipped} already on timeline.");

        Log::info('community:launch completed', [
            'community_id' => $communityId,
            'community_name' => $community->name,
            'dry_run' => $dryRun,
            'customers_created' => $created,
            'timelines_assigned' => $assigned,
            'skipped' => $skipped,
        ]);

        return self::SUCCESS;
    }
}
