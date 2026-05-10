<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\PipelineStage;
use App\Models\Community;
use App\Models\CommunitySubscription;
use App\Models\Customer;
use App\Models\SMB;
use App\Services\PublishingPlatformService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class SyncFromPublishingPlatform extends Command
{
    protected $signature = 'sync:from-publishing-platform
        {--community= : Sync only a specific community by slug}
        {--dry-run : Preview what would be synced without writing}
        {--skip-subscriptions : Skip subscription sync}';

    protected $description = 'Sync communities, businesses, and subscriptions from the Publishing Platform into the Command Center database';

    private int $communitiesCreated = 0;

    private int $communitiesUpdated = 0;

    private int $customersCreated = 0;

    private int $customersUpdated = 0;

    private int $smbsCreated = 0;

    private int $smbsUpdated = 0;

    private int $civicEntitiesSynced = 0;

    private int $nonprofitsSynced = 0;

    private int $subscriptionsSynced = 0;

    public function handle(PublishingPlatformService $ppService): int
    {
        $this->info('Starting sync from Publishing Platform...');
        $dryRun = (bool) $this->option('dry-run');
        $communitySlug = $this->option('community');

        if ($dryRun) {
            $this->warn('DRY RUN — no data will be written.');
        }

        // Phase 1: Sync communities
        $this->info('Phase 1: Syncing communities...');
        $communities = $this->syncCommunities($ppService, $dryRun, $communitySlug);

        if (empty($communities)) {
            $this->error('No communities returned from Publishing Platform. Check PUBLISHING_PLATFORM_URL and PUBLISHING_BRIDGE_API_KEY.');

            return self::FAILURE;
        }

        // Phase 2: Sync businesses per community
        $this->info('Phase 2: Syncing businesses...');
        foreach ($communities as $community) {
            $this->syncBusinessesForCommunity($ppService, $community, $dryRun);
        }

        // Phase 3: Sync civic entities per community
        $this->info('Phase 3: Syncing civic entities (governments, schools, churches)...');
        foreach ($communities as $community) {
            $this->syncCivicEntitiesForCommunity($ppService, $community, $dryRun);
        }

        // Phase 4: Sync nonprofits per community
        $this->info('Phase 4: Syncing nonprofit organizations...');
        foreach ($communities as $community) {
            $this->syncNonprofitsForCommunity($ppService, $community, $dryRun);
        }

        // Phase 5: Sync subscriptions
        if (! $this->option('skip-subscriptions')) {
            $this->info('Phase 5: Syncing subscriptions...');
            foreach ($communities as $community) {
                $this->syncSubscriptionsForCommunity($ppService, $community, $dryRun);
            }
        }

        $this->newLine();
        $this->info('Sync complete.');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Communities created', $this->communitiesCreated],
                ['Communities updated', $this->communitiesUpdated],
                ['Customers created', $this->customersCreated],
                ['Customers updated', $this->customersUpdated],
                ['SMBs created', $this->smbsCreated],
                ['SMBs updated', $this->smbsUpdated],
                ['Civic entities synced', $this->civicEntitiesSynced],
                ['Nonprofits synced', $this->nonprofitsSynced],
                ['Subscriptions synced', $this->subscriptionsSynced],
            ]
        );

        Log::info('SyncFromPublishingPlatform completed', [
            'communities_created' => $this->communitiesCreated,
            'communities_updated' => $this->communitiesUpdated,
            'customers_created' => $this->customersCreated,
            'customers_updated' => $this->customersUpdated,
            'smbs_created' => $this->smbsCreated,
            'smbs_updated' => $this->smbsUpdated,
            'civic_entities_synced' => $this->civicEntitiesSynced,
            'nonprofits_synced' => $this->nonprofitsSynced,
            'subscriptions_synced' => $this->subscriptionsSynced,
        ]);

        return self::SUCCESS;
    }

    /**
     * @return array<int, array{id: string, cc_id: string, slug: string}>
     */
    private function syncCommunities(PublishingPlatformService $ppService, bool $dryRun, ?string $filterSlug): array
    {
        $ppCommunities = $ppService->exportCommunities();

        if (empty($ppCommunities)) {
            return [];
        }

        $synced = [];

        foreach ($ppCommunities as $ppComm) {
            $slug = $ppComm['slug'] ?? '';
            if ($filterSlug && $slug !== $filterSlug) {
                continue;
            }

            $this->line("  Community: {$ppComm['name']} ({$slug})");

            if ($dryRun) {
                $synced[] = ['id' => $ppComm['id'], 'cc_id' => '', 'slug' => $slug];

                continue;
            }

            $existing = Community::where('slug', $slug)->first();

            $data = [
                'name' => $ppComm['name'],
                'slug' => $slug,
                'state' => $ppComm['state'] ?? null,
                'county' => $ppComm['county'] ?? null,
                'population' => $ppComm['population'] ?? null,
                'timezone' => $ppComm['timezone'] ?? null,
                'launched_at' => $ppComm['launched_at'] ?? null,
                'settings' => [
                    'pp_community_id' => $ppComm['id'],
                    'pp_total_businesses' => $ppComm['total_businesses'] ?? 0,
                    'pp_description' => $ppComm['description'] ?? null,
                    'pp_hero_image_url' => $ppComm['hero_image_url'] ?? null,
                    'pp_logo_url' => $ppComm['logo_url'] ?? null,
                ],
            ];

            if ($existing) {
                $existing->update($data);
                $this->communitiesUpdated++;
                $synced[] = ['id' => $ppComm['id'], 'cc_id' => $existing->id, 'slug' => $slug];
            } else {
                $community = Community::create($data);
                $this->communitiesCreated++;
                $synced[] = ['id' => $ppComm['id'], 'cc_id' => $community->id, 'slug' => $slug];
            }
        }

        $this->info("  Communities: {$this->communitiesCreated} created, {$this->communitiesUpdated} updated");

        return $synced;
    }

    /**
     * @param  array{id: string, cc_id: string, slug: string}  $community
     */
    private function syncBusinessesForCommunity(PublishingPlatformService $ppService, array $community, bool $dryRun): void
    {
        $ppCommunityId = $community['id'];
        $ccCommunityId = $community['cc_id'];
        $page = 1;
        $totalSynced = 0;

        $ccCommunity = $ccCommunityId ? Community::find($ccCommunityId) : null;
        if (! $ccCommunity && ! $dryRun) {
            $ccCommunity = Community::where('slug', $community['slug'])->first();
            $ccCommunityId = $ccCommunity?->id ?? '';
        }

        do {
            $result = $ppService->exportBusinesses($ppCommunityId, $page);
            $businesses = $result['data'] ?? [];
            $meta = $result['meta'] ?? ['current_page' => 1, 'last_page' => 1];

            foreach ($businesses as $biz) {
                if ($dryRun) {
                    $totalSynced++;

                    continue;
                }

                try {
                    $this->upsertBusinessAsCustomerAndSmb($biz, $ccCommunityId);
                    $totalSynced++;
                } catch (\Throwable $e) {
                    $bizName = $biz['name'] ?? $biz['id'] ?? 'unknown';
                    $this->warn("    Skipped business '{$bizName}': {$e->getMessage()}");
                    Log::warning('SyncFromPublishingPlatform: skipped business', [
                        'business_id' => $biz['id'] ?? null,
                        'business_name' => $biz['name'] ?? null,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $page++;
        } while ($page <= ($meta['last_page'] ?? 1));

        $this->line("  {$community['slug']}: {$totalSynced} businesses synced");
    }

    /**
     * @param  array<string, mixed>  $biz
     */
    private function upsertBusinessAsCustomerAndSmb(array $biz, string $ccCommunityId): void
    {
        $externalId = $biz['id'] ?? '';
        if ($externalId === '') {
            return;
        }

        $categories = $biz['categories'] ?? [];
        $primaryCategory = is_array($categories) ? ($categories[0] ?? null) : null;

        DB::transaction(function () use ($biz, $externalId, $ccCommunityId, $primaryCategory): void {
            // Upsert SMB
            $smb = SMB::where('community_id', $ccCommunityId)
                ->where(function ($q) use ($externalId, $biz): void {
                    $q->whereJsonContains('metadata->pp_business_id', $externalId)
                        ->orWhere('business_name', $biz['name'] ?? '');
                })
                ->first();

            $smbData = [
                'community_id' => $ccCommunityId,
                'business_name' => $biz['name'] ?? 'Unknown',
                'category' => $primaryCategory,
                'primary_email' => $biz['email'] ?? null,
                'primary_phone' => $biz['phone'] ?? null,
                'address' => $biz['address'] ?? null,
                'city' => $biz['city'] ?? null,
                'state' => $biz['state'] ?? null,
                'zip' => $biz['postal_code'] ?? null,
                'coordinates' => (($biz['latitude'] ?? null) && ($biz['longitude'] ?? null))
                    ? ['lat' => (float) $biz['latitude'], 'lng' => (float) $biz['longitude']]
                    : null,
                'metadata' => [
                    'pp_business_id' => $externalId,
                    'pp_google_place_id' => $biz['google_place_id'] ?? null,
                    'pp_organization_type' => $biz['organization_type'] ?? 'business',
                    'pp_advertising_tier' => $biz['advertising_tier'] ?? 'basic',
                    'pp_synced_at' => now()->toISOString(),
                ],
                'email_opted_in' => true,
                'sms_opted_in' => false,
                'rvm_opted_in' => false,
                'phone_opted_in' => false,
                'do_not_contact' => false,
            ];

            if ($smb) {
                $smb->update($smbData);
                $this->smbsUpdated++;
            } else {
                $smb = SMB::create($smbData);
                $this->smbsCreated++;
            }

            // Upsert Customer
            $customer = Customer::withoutGlobalScopes()
                ->where('external_id', $externalId)
                ->first();

            if (! $customer) {
                $customer = Customer::withoutGlobalScopes()
                    ->where('smb_id', $smb->id)
                    ->first();
            }

            $customerData = [
                'community_id' => $ccCommunityId,
                'smb_id' => $smb->id,
                'external_id' => $externalId,
                'business_name' => $biz['name'] ?? 'Unknown',
                'category' => $primaryCategory,
                'email' => $biz['email'] ?? null,
                'phone' => $biz['phone'] ?? null,
                'website' => $biz['website'] ?? null,
                'address' => $biz['address'] ?? null,
                'city' => $biz['city'] ?? null,
                'state' => $biz['state'] ?? null,
                'zip' => $biz['postal_code'] ?? null,
                'coordinates' => (($biz['latitude'] ?? null) && ($biz['longitude'] ?? null))
                    ? ['lat' => (float) $biz['latitude'], 'lng' => (float) $biz['longitude']]
                    : null,
                'google_rating' => $biz['rating'] ?? null,
                'google_review_count' => $biz['reviews_count'] ?? null,
                'business_description' => $biz['description'] ?? $biz['short_description'] ?? null,
                'business_hours' => $biz['opening_hours'] ?? null,
                'email_opted_in' => true,
                'sms_opted_in' => false,
                'rvm_opted_in' => false,
                'phone_opted_in' => false,
                'do_not_contact' => false,
                'data_sources' => ['publishing_platform'],
                'metadata' => [
                    'pp_business_id' => $externalId,
                    'pp_google_place_id' => $biz['google_place_id'] ?? null,
                    'pp_images' => $biz['images'] ?? null,
                    'pp_is_advertiser' => $biz['is_advertiser'] ?? false,
                    'pp_synced_at' => now()->toISOString(),
                ],
            ];

            if ($customer) {
                // Preserve existing pipeline stage and engagement data
                unset($customerData['email_opted_in'], $customerData['sms_opted_in']);
                unset($customerData['rvm_opted_in'], $customerData['phone_opted_in']);
                unset($customerData['do_not_contact']);
                $customer->update($customerData);
                $this->customersUpdated++;
            } else {
                $customerData['pipeline_stage'] = PipelineStage::HOOK;
                $customerData['stage_entered_at'] = now();
                $customerData['lead_source'] = 'publishing_platform_sync';
                Customer::create($customerData);
                $this->customersCreated++;
            }
        });
    }

    /**
     * @param  array{id: string, cc_id: string, slug: string}  $community
     */
    private function syncCivicEntitiesForCommunity(PublishingPlatformService $ppService, array $community, bool $dryRun): void
    {
        $ppCommunityId = $community['id'];
        $ccCommunityId = $this->resolveCcCommunityId($community, $dryRun);
        $page = 1;
        $totalSynced = 0;

        do {
            $result = $ppService->exportCivicEntities($ppCommunityId, $page);
            $entities = $result['data'] ?? [];
            $meta = $result['meta'] ?? ['current_page' => 1, 'last_page' => 1];

            foreach ($entities as $entity) {
                if ($dryRun) {
                    $totalSynced++;

                    continue;
                }

                try {
                    $this->upsertCivicEntityAsCustomerAndSmb($entity, $ccCommunityId);
                    $totalSynced++;
                } catch (\Throwable $e) {
                    $name = $entity['legal_name'] ?? $entity['display_name'] ?? $entity['id'] ?? 'unknown';
                    $this->warn("    Skipped civic entity '{$name}': {$e->getMessage()}");
                    Log::warning('SyncFromPublishingPlatform: skipped civic entity', [
                        'entity_id' => $entity['id'] ?? null,
                        'entity_name' => $entity['legal_name'] ?? null,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $page++;
        } while ($page <= ($meta['last_page'] ?? 1));

        $this->civicEntitiesSynced += $totalSynced;

        if ($totalSynced > 0) {
            $this->line("  {$community['slug']}: {$totalSynced} civic entities synced");
        }
    }

    /**
     * @param  array<string, mixed>  $entity
     */
    private function upsertCivicEntityAsCustomerAndSmb(array $entity, string $ccCommunityId): void
    {
        $externalId = $entity['id'] ?? '';
        if ($externalId === '') {
            return;
        }

        $entityType = $entity['entity_type'] ?? 'government';
        $entitySubtype = $entity['entity_subtype'] ?? null;
        $category = match ($entityType) {
            'school' => 'Education - ' . ucfirst($entitySubtype ?? 'School'),
            'school_district' => 'Education - School District',
            'church' => 'Religious Organization',
            'nonprofit' => 'Nonprofit',
            default => 'Government - ' . ucfirst($entitySubtype ?? 'Municipal'),
        };

        $name = $entity['display_name'] ?? $entity['legal_name'] ?? 'Unknown';

        DB::transaction(function () use ($entity, $externalId, $ccCommunityId, $category, $name, $entityType): void {
            $smb = SMB::where('community_id', $ccCommunityId)
                ->where(function ($q) use ($externalId, $name): void {
                    $q->whereJsonContains('metadata->pp_civic_entity_id', $externalId)
                        ->orWhere('business_name', $name);
                })
                ->first();

            $smbData = [
                'community_id' => $ccCommunityId,
                'business_name' => $name,
                'category' => $category,
                'primary_email' => $entity['email'] ?? null,
                'primary_phone' => $entity['phone'] ?? null,
                'address' => $entity['address'] ?? null,
                'city' => $entity['city'] ?? null,
                'state' => $entity['state_abbr'] ?? null,
                'zip' => $entity['zip'] ?? null,
                'coordinates' => (($entity['lat'] ?? null) && ($entity['lng'] ?? null))
                    ? ['lat' => (float) $entity['lat'], 'lng' => (float) $entity['lng']]
                    : null,
                'metadata' => [
                    'pp_civic_entity_id' => $externalId,
                    'pp_entity_type' => $entityType,
                    'pp_entity_subtype' => $entity['entity_subtype'] ?? null,
                    'pp_fips_code' => $entity['fips_code'] ?? null,
                    'pp_nces_id' => $entity['nces_id'] ?? null,
                    'pp_synced_at' => now()->toISOString(),
                ],
                'email_opted_in' => true,
                'sms_opted_in' => false,
                'rvm_opted_in' => false,
                'phone_opted_in' => false,
                'do_not_contact' => false,
            ];

            if ($smb) {
                $smb->update($smbData);
                $this->smbsUpdated++;
            } else {
                $smb = SMB::create($smbData);
                $this->smbsCreated++;
            }

            $customer = Customer::withoutGlobalScopes()
                ->where('external_id', 'civic:' . $externalId)
                ->first();

            if (! $customer) {
                $customer = Customer::withoutGlobalScopes()
                    ->where('smb_id', $smb->id)
                    ->first();
            }

            $customerData = [
                'community_id' => $ccCommunityId,
                'smb_id' => $smb->id,
                'external_id' => 'civic:' . $externalId,
                'business_name' => $name,
                'category' => $category,
                'email' => $entity['email'] ?? null,
                'phone' => $entity['phone'] ?? null,
                'website' => $entity['website'] ?? null,
                'address' => $entity['address'] ?? null,
                'city' => $entity['city'] ?? null,
                'state' => $entity['state_abbr'] ?? null,
                'zip' => $entity['zip'] ?? null,
                'coordinates' => (($entity['lat'] ?? null) && ($entity['lng'] ?? null))
                    ? ['lat' => (float) $entity['lat'], 'lng' => (float) $entity['lng']]
                    : null,
                'business_description' => $entity['mission_statement'] ?? null,
                'email_opted_in' => true,
                'sms_opted_in' => false,
                'rvm_opted_in' => false,
                'phone_opted_in' => false,
                'do_not_contact' => false,
                'data_sources' => ['publishing_platform', 'civic_entities'],
                'metadata' => [
                    'pp_civic_entity_id' => $externalId,
                    'pp_entity_type' => $entityType,
                    'pp_entity_subtype' => $entity['entity_subtype'] ?? null,
                    'pp_synced_at' => now()->toISOString(),
                ],
            ];

            if ($customer) {
                unset($customerData['email_opted_in'], $customerData['sms_opted_in']);
                unset($customerData['rvm_opted_in'], $customerData['phone_opted_in']);
                unset($customerData['do_not_contact']);
                $customer->update($customerData);
                $this->customersUpdated++;
            } else {
                $customerData['pipeline_stage'] = PipelineStage::HOOK;
                $customerData['stage_entered_at'] = now();
                $customerData['lead_source'] = 'civic_entity_sync';
                Customer::create($customerData);
                $this->customersCreated++;
            }
        });
    }

    /**
     * @param  array{id: string, cc_id: string, slug: string}  $community
     */
    private function syncNonprofitsForCommunity(PublishingPlatformService $ppService, array $community, bool $dryRun): void
    {
        $ppCommunityId = $community['id'];
        $ccCommunityId = $this->resolveCcCommunityId($community, $dryRun);
        $page = 1;
        $totalSynced = 0;

        do {
            $result = $ppService->exportNonprofits($ppCommunityId, $page);
            $nonprofits = $result['data'] ?? [];
            $meta = $result['meta'] ?? ['current_page' => 1, 'last_page' => 1];

            foreach ($nonprofits as $np) {
                if ($dryRun) {
                    $totalSynced++;

                    continue;
                }

                try {
                    $this->upsertNonprofitAsCustomerAndSmb($np, $ccCommunityId);
                    $totalSynced++;
                } catch (\Throwable $e) {
                    $name = $np['legal_name'] ?? $np['id'] ?? 'unknown';
                    $this->warn("    Skipped nonprofit '{$name}': {$e->getMessage()}");
                    Log::warning('SyncFromPublishingPlatform: skipped nonprofit', [
                        'nonprofit_id' => $np['id'] ?? null,
                        'nonprofit_name' => $np['legal_name'] ?? null,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $page++;
        } while ($page <= ($meta['last_page'] ?? 1));

        $this->nonprofitsSynced += $totalSynced;

        if ($totalSynced > 0) {
            $this->line("  {$community['slug']}: {$totalSynced} nonprofits synced");
        }
    }

    /**
     * @param  array<string, mixed>  $np
     */
    private function upsertNonprofitAsCustomerAndSmb(array $np, string $ccCommunityId): void
    {
        $externalId = $np['id'] ?? '';
        if ($externalId === '') {
            return;
        }

        $name = $np['legal_name'] ?? 'Unknown Nonprofit';
        $ntee = $np['ntee_code'] ?? '';
        $category = $this->mapNteeToCategory($ntee);

        DB::transaction(function () use ($np, $externalId, $ccCommunityId, $category, $name): void {
            $smb = SMB::where('community_id', $ccCommunityId)
                ->where(function ($q) use ($externalId, $name): void {
                    $q->whereJsonContains('metadata->pp_nonprofit_id', $externalId)
                        ->orWhere('business_name', $name);
                })
                ->first();

            $smbData = [
                'community_id' => $ccCommunityId,
                'business_name' => $name,
                'category' => $category,
                'primary_email' => $np['email'] ?? null,
                'primary_phone' => $np['phone'] ?? null,
                'address' => $np['street'] ?? null,
                'city' => $np['city'] ?? null,
                'state' => $np['state_abbr'] ?? null,
                'zip' => $np['zip'] ?? null,
                'coordinates' => (($np['lat'] ?? null) && ($np['lng'] ?? null))
                    ? ['lat' => (float) $np['lat'], 'lng' => (float) $np['lng']]
                    : null,
                'metadata' => [
                    'pp_nonprofit_id' => $externalId,
                    'pp_ein' => $np['ein'] ?? null,
                    'pp_ntee_code' => $np['ntee_code'] ?? null,
                    'pp_subsection_code' => $np['subsection_code'] ?? null,
                    'pp_annual_revenue' => $np['income_amount'] ?? null,
                    'pp_synced_at' => now()->toISOString(),
                ],
                'email_opted_in' => true,
                'sms_opted_in' => false,
                'rvm_opted_in' => false,
                'phone_opted_in' => false,
                'do_not_contact' => false,
            ];

            if ($smb) {
                $smb->update($smbData);
                $this->smbsUpdated++;
            } else {
                $smb = SMB::create($smbData);
                $this->smbsCreated++;
            }

            $customer = Customer::withoutGlobalScopes()
                ->where('external_id', 'np:' . $externalId)
                ->first();

            if (! $customer) {
                $customer = Customer::withoutGlobalScopes()
                    ->where('smb_id', $smb->id)
                    ->first();
            }

            $customerData = [
                'community_id' => $ccCommunityId,
                'smb_id' => $smb->id,
                'external_id' => 'np:' . $externalId,
                'business_name' => $name,
                'category' => $category,
                'email' => $np['email'] ?? null,
                'phone' => $np['phone'] ?? null,
                'website' => $np['website'] ?? null,
                'address' => $np['street'] ?? null,
                'city' => $np['city'] ?? null,
                'state' => $np['state_abbr'] ?? null,
                'zip' => $np['zip'] ?? null,
                'coordinates' => (($np['lat'] ?? null) && ($np['lng'] ?? null))
                    ? ['lat' => (float) $np['lat'], 'lng' => (float) $np['lng']]
                    : null,
                'business_description' => $np['mission_statement'] ?? null,
                'email_opted_in' => true,
                'sms_opted_in' => false,
                'rvm_opted_in' => false,
                'phone_opted_in' => false,
                'do_not_contact' => false,
                'data_sources' => ['publishing_platform', 'nonprofit_organizations'],
                'metadata' => [
                    'pp_nonprofit_id' => $externalId,
                    'pp_ein' => $np['ein'] ?? null,
                    'pp_ntee_code' => $np['ntee_code'] ?? null,
                    'pp_synced_at' => now()->toISOString(),
                ],
            ];

            if ($customer) {
                unset($customerData['email_opted_in'], $customerData['sms_opted_in']);
                unset($customerData['rvm_opted_in'], $customerData['phone_opted_in']);
                unset($customerData['do_not_contact']);
                $customer->update($customerData);
                $this->customersUpdated++;
            } else {
                $customerData['pipeline_stage'] = PipelineStage::HOOK;
                $customerData['stage_entered_at'] = now();
                $customerData['lead_source'] = 'nonprofit_sync';
                Customer::create($customerData);
                $this->customersCreated++;
            }
        });
    }

    private function resolveCcCommunityId(array $community, bool $dryRun): string
    {
        $ccCommunityId = $community['cc_id'];

        if (! $ccCommunityId && ! $dryRun) {
            $ccCommunity = Community::where('slug', $community['slug'])->first();
            $ccCommunityId = $ccCommunity?->id ?? '';
        }

        return $ccCommunityId;
    }

    private function mapNteeToCategory(string $nteeCode): string
    {
        $major = strtoupper(substr($nteeCode, 0, 1));

        return match ($major) {
            'A' => 'Nonprofit - Arts & Culture',
            'B' => 'Nonprofit - Education',
            'C', 'D' => 'Nonprofit - Environment & Animals',
            'E', 'F', 'G', 'H' => 'Nonprofit - Health',
            'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P' => 'Nonprofit - Human Services',
            'Q' => 'Nonprofit - International',
            'R', 'S', 'T', 'U', 'V', 'W' => 'Nonprofit - Public Benefit',
            'X' => 'Religious Organization',
            'Y' => 'Nonprofit - Mutual Benefit',
            'Z' => 'Nonprofit - Unknown',
            default => 'Nonprofit',
        };
    }

    /**
     * @param  array{id: string, cc_id: string, slug: string}  $community
     */
    private function syncSubscriptionsForCommunity(PublishingPlatformService $ppService, array $community, bool $dryRun): void
    {
        $ppCommunityId = $community['id'];
        $ccCommunityId = $community['cc_id'];

        if (! $ccCommunityId && ! $dryRun) {
            $ccCommunity = Community::where('slug', $community['slug'])->first();
            $ccCommunityId = $ccCommunity?->id ?? '';
        }

        $ppSubscriptions = $ppService->exportBusinessSubscriptions($ppCommunityId);

        foreach ($ppSubscriptions as $ppSub) {
            if ($dryRun) {
                $this->subscriptionsSynced++;

                continue;
            }

            $ppBusinessId = $ppSub['business_id'] ?? '';
            if ($ppBusinessId === '') {
                continue;
            }

            // Find the matching CC customer via external_id
            $customer = Customer::withoutGlobalScopes()
                ->where('external_id', $ppBusinessId)
                ->first();

            if (! $customer) {
                continue;
            }

            $tier = $this->mapSubscriptionTier($ppSub['tier'] ?? 'basic');

            CommunitySubscription::updateOrCreate(
                [
                    'customer_id' => $customer->id,
                    'community_id' => $ccCommunityId,
                ],
                [
                    'tier' => $tier,
                    'status' => $ppSub['status'] ?? 'active',
                    'monthly_rate' => $ppSub['monthly_amount'] ?? null,
                    'stripe_subscription_id' => $ppSub['stripe_subscription_id'] ?? null,
                    'stripe_customer_id' => $ppSub['stripe_customer_id'] ?? null,
                    'product_slug' => 'community-' . $tier,
                ]
            );

            // Update customer subscription tier — active subscribers are in RETENTION
            $customer->update([
                'subscription_tier' => $tier,
                'pipeline_stage' => PipelineStage::RETENTION,
                'stage_entered_at' => $ppSub['subscription_started_at'] ?? now(),
            ]);

            $this->subscriptionsSynced++;
        }

        if ($this->subscriptionsSynced > 0) {
            $this->line("  {$community['slug']}: {$this->subscriptionsSynced} subscriptions synced");
        }
    }

    private function mapSubscriptionTier(string $ppTier): string
    {
        return match ($ppTier) {
            'trial' => 'basic',
            'basic', 'standard' => 'influencer',
            'premium' => 'expert',
            'enterprise' => 'sponsor',
            default => 'influencer',
        };
    }
}
