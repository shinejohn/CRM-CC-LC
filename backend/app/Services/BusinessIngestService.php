<?php

namespace App\Services;

use App\Contracts\CampaignOrchestratorInterface;
use App\Enums\PipelineStage;
use App\Models\Community;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BusinessIngestService
{
    public function ingestBusiness(array $data): array
    {
        $communityId = (int) $data['community_id'];
        $externalId = $data['external_id'];

        if (! Community::whereKey($communityId)->exists()) {
            throw new \InvalidArgumentException("Community {$communityId} not found");
        }

        $existing = Customer::where('external_id', $externalId)
            ->where('community_id', $communityId)
            ->first();

        if ($existing) {
            $updates = array_filter([
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null,
                'website' => $data['website'] ?? null,
                'google_rating' => $data['google_rating'] ?? null,
                'google_review_count' => $data['google_review_count'] ?? null,
                'business_name' => $data['business_name'] ?? null,
                'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null,
            ], fn ($v) => $v !== null && $v !== '');

            if (! empty($updates)) {
                $existing->update($updates);
            }

            return [
                'created' => false,
                'customer_id' => $existing->id,
                'pipeline_stage' => $existing->pipeline_stage?->value ?? 'hook',
            ];
        }

        $qualityScore = $this->calculateInitialQuality($data);
        $leadScore = $this->calculateInitialLeadScore($data);

        $customer = Customer::create([
            'tenant_id' => $this->getSystemTenantId(),
            'community_id' => $communityId,
            'external_id' => $externalId,
            'slug' => Str::slug($data['business_name']).'-'.Str::lower(Str::random(6)),
            'business_name' => $data['business_name'],
            'dba_name' => $data['dba_name'] ?? null,
            'business_type' => $data['business_type'] ?? null,
            'category' => $data['category'] ?? null,
            'sub_category' => $data['sub_category'] ?? null,
            'owner_name' => $data['owner_name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'website' => $data['website'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'zip' => $data['zip'] ?? null,
            'coordinates' => $data['coordinates'] ?? null,
            'google_rating' => $data['google_rating'] ?? null,
            'google_review_count' => $data['google_review_count'] ?? null,
            'hours' => $data['hours'] ?? null,
            'lead_source' => 'community_rollout',
            'lead_score' => $leadScore,
            'data_quality_score' => $qualityScore,
            'pipeline_stage' => PipelineStage::HOOK,
            'stage_entered_at' => now(),
            'engagement_tier' => 4,
            'engagement_score' => 0,
            'email_opted_in' => ! empty($data['email']),
            'sms_opted_in' => false,
            'rvm_opted_in' => false,
            'phone_opted_in' => false,
            'do_not_contact' => false,
            'customer_intelligence' => $data['enrichment_data'] ?? null,
            'data_sources' => ['google_places', 'community_rollout'],
        ]);

        Log::info('Business ingested from rollout', [
            'customer_id' => $customer->id,
            'external_id' => $externalId,
            'community_id' => $communityId,
            'business_name' => $data['business_name'],
            'quality_score' => $qualityScore,
        ]);

        try {
            $orchestrator = app(CampaignOrchestratorInterface::class);
            $orchestrator->assignTimelineForStage($customer);
        } catch (\Exception $e) {
            Log::warning("Failed to assign timeline for customer {$customer->id}: ".$e->getMessage());
        }

        return [
            'created' => true,
            'customer_id' => $customer->id,
            'pipeline_stage' => 'hook',
        ];
    }

    public function batchIngest(string $communityId, array $businesses): array
    {
        $created = 0;
        $updated = 0;
        $skipped = 0;

        DB::transaction(function () use ($communityId, $businesses, &$created, &$updated, &$skipped) {
            foreach ($businesses as $biz) {
                $biz['community_id'] = $communityId;
                try {
                    $result = $this->ingestBusiness($biz);
                    if ($result['created']) {
                        $created++;
                    } else {
                        $updated++;
                    }
                } catch (\Exception $e) {
                    Log::warning('Skipped business during batch ingest', [
                        'business_name' => $biz['business_name'] ?? 'unknown',
                        'error' => $e->getMessage(),
                    ]);
                    $skipped++;
                }
            }
        });

        return [
            'total' => count($businesses),
            'created' => $created,
            'updated' => $updated,
            'skipped' => $skipped,
        ];
    }

    public function updateEnrichment(string $externalId, array $data): array
    {
        $communityId = (int) $data['community_id'];
        $customer = Customer::where('external_id', $externalId)
            ->where('community_id', $communityId)
            ->firstOrFail();

        $existingIntel = $customer->customer_intelligence ?? [];
        if (! is_array($existingIntel)) {
            $existingIntel = [];
        }
        $newIntel = array_merge($existingIntel, $data['enrichment_data']);

        $sources = $customer->data_sources ?? [];
        if (! is_array($sources)) {
            $sources = [];
        }

        $customer->update([
            'customer_intelligence' => $newIntel,
            'last_enriched_at' => now(),
            'data_sources' => array_values(array_unique(array_merge(
                $sources,
                ['website_scan', 'enrichment_pipeline']
            ))),
        ]);

        $qualityScore = $this->calculateQualityFromFields($customer->fresh());
        $customer->update(['data_quality_score' => $qualityScore]);

        return [
            'customer_id' => $customer->id,
            'data_quality_score' => $qualityScore,
        ];
    }

    private function calculateInitialQuality(array $data): int
    {
        $score = 0;
        if (! empty($data['business_name'])) {
            $score += 10;
        }
        if (! empty($data['email'])) {
            $score += 25;
        }
        if (! empty($data['phone'])) {
            $score += 20;
        }
        if (! empty($data['website'])) {
            $score += 15;
        }
        if (! empty($data['address'])) {
            $score += 10;
        }
        if (! empty($data['category'])) {
            $score += 10;
        }
        if (($data['google_rating'] ?? 0) > 0) {
            $score += 5;
        }
        if (($data['google_review_count'] ?? 0) > 0) {
            $score += 5;
        }

        return min($score, 100);
    }

    private function calculateInitialLeadScore(array $data): int
    {
        $score = 50;
        if (($data['google_rating'] ?? 0) >= 4.0) {
            $score += 15;
        }
        if (($data['google_review_count'] ?? 0) >= 50) {
            $score += 10;
        }
        if (! empty($data['website'])) {
            $score += 10;
        }
        if (! empty($data['email'])) {
            $score += 15;
        }

        return min($score, 100);
    }

    private function calculateQualityFromFields(Customer $customer): int
    {
        $score = 0;
        if ($customer->business_name) {
            $score += 10;
        }
        if ($customer->email) {
            $score += 25;
        }
        if ($customer->phone) {
            $score += 20;
        }
        if ($customer->website) {
            $score += 15;
        }
        if ($customer->address) {
            $score += 10;
        }
        if ($customer->category) {
            $score += 10;
        }
        if ($customer->google_rating) {
            $score += 5;
        }
        if (! empty($customer->customer_intelligence)) {
            $score += 5;
        }

        return min($score, 100);
    }

    private function getSystemTenantId(): string
    {
        return (string) config('fibonacco.system_tenant_id', '00000000-0000-0000-0000-000000000001');
    }
}
