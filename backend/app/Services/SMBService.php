<?php

namespace App\Services;

use App\Contracts\SMBServiceInterface;
use App\Models\Customer;
use App\Services\EngagementService;
use App\Services\TierManager;
use App\Services\SMBCampaignService;
use App\Events\SMB\SMBCreated;
use App\Events\SMB\SMBUpdated;
use App\Events\SMB\SMBEngagementChanged;
use Illuminate\Contracts\Pagination\Paginator;

class SMBService implements SMBServiceInterface
{
    public function __construct(
        private EngagementService $engagementService,
        private TierManager $tierManager,
        private SMBCampaignService $campaignService
    ) {}

    public function list(array $filters = [], int $perPage = 20): Paginator
    {
        $query = Customer::query();

        if (isset($filters['tenant_id'])) {
            $query->where('tenant_id', $filters['tenant_id']);
        }

        if (isset($filters['community_id'])) {
            $query->where('community_id', $filters['community_id']);
        }

        if (isset($filters['engagement_tier'])) {
            $query->where('engagement_tier', $filters['engagement_tier']);
        }

        if (isset($filters['campaign_status'])) {
            $query->where('campaign_status', $filters['campaign_status']);
        }

        if (isset($filters['service_model'])) {
            $query->where('service_model', $filters['service_model']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('business_name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function find(string $id): ?Customer
    {
        return Customer::find($id);
    }

    public function findBySlug(string $slug): ?Customer
    {
        return Customer::where('slug', $slug)->first();
    }

    public function create(array $data): Customer
    {
        $customer = Customer::create($data);

        // Initialize engagement score
        $score = $this->engagementService->calculateScore($customer);
        $customer->update(['engagement_score' => $score]);

        // Set initial tier (4 - Passive)
        $customer->update(['engagement_tier' => 4]);

        event(new SMBCreated($customer));

        return $customer->fresh();
    }

    public function update(Customer $customer, array $data): Customer
    {
        $changedFields = array_keys(array_diff_assoc($data, $customer->getAttributes()));
        
        $customer->update($data);

        // Recalculate data quality score
        $this->recalculateDataQuality($customer);

        event(new SMBUpdated($customer, $changedFields));

        return $customer->fresh();
    }

    public function delete(Customer $customer): bool
    {
        // Soft delete
        return $customer->delete();
    }

    public function calculateEngagementScore(Customer $customer): int
    {
        $score = $this->engagementService->calculateScore($customer);
        $oldScore = $customer->engagement_score;

        $customer->update(['engagement_score' => $score]);

        // Check if tier should change
        $newTier = $this->engagementService->evaluateTierChange($customer);
        if ($newTier !== null) {
            // Lower tier number = higher tier (1 = Premium, 4 = Passive)
            if ($newTier < $customer->engagement_tier) {
                $this->tierManager->upgradeTier($customer, $newTier);
            } elseif ($newTier > $customer->engagement_tier) {
                $this->tierManager->downgradeTier($customer, $newTier);
            }
        }

        // Emit engagement changed event if significant change
        if (abs($score - $oldScore) > 10) {
            event(new SMBEngagementChanged($customer, $oldScore, $score));
        }

        return $score;
    }

    public function updateTier(Customer $customer, int $newTier): void
    {
        // Lower tier number = higher tier (1 = Premium, 4 = Passive)
        if ($newTier < $customer->engagement_tier) {
            $this->tierManager->upgradeTier($customer, $newTier);
        } elseif ($newTier > $customer->engagement_tier) {
            $this->tierManager->downgradeTier($customer, $newTier);
        }
    }

    public function startCampaign(Customer $customer): void
    {
        $this->campaignService->startCampaign($customer);
    }

    public function pauseCampaign(Customer $customer, string $reason): void
    {
        $this->campaignService->pauseCampaign($customer, $reason);
    }

    public function resumeCampaign(Customer $customer): void
    {
        $this->campaignService->resumeCampaign($customer);
    }

    private function recalculateDataQuality(Customer $customer): void
    {
        $score = 0;
        $maxScore = 100;
        $fields = [
            'business_name' => 10,
            'email' => 15,
            'phone' => 15,
            'address_line1' => 10,
            'city' => 10,
            'state' => 10,
            'industry_category' => 10,
            'business_description' => 10,
            'products_services' => 10,
        ];

        foreach ($fields as $field => $points) {
            if (!empty($customer->$field)) {
                $score += $points;
            }
        }

        $customer->update(['data_quality_score' => min($score, $maxScore)]);
    }
}

