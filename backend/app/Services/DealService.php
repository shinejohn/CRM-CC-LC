<?php

namespace App\Services;

use App\Enums\DealStage;
use App\Enums\PipelineStage;
use App\Models\Customer;
use App\Models\Deal;
use App\Models\DealActivity;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DealService
{
    /**
     * List deals for tenant with filters.
     */
    public function list(string $tenantId, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Deal::where('tenant_id', $tenantId)
            ->with(['customer', 'contact', 'activities']);

        if (!empty($filters['stage'])) {
            $query->where('stage', $filters['stage']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhereHas('customer', fn ($cq) => $cq->where('business_name', 'ilike', "%{$search}%"));
            });
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage);
    }

    /**
     * Create a new deal.
     */
    public function create(string $tenantId, array $data): Deal
    {
        $deal = new Deal([
            'tenant_id' => $tenantId,
            'customer_id' => $data['customer_id'],
            'contact_id' => $data['contact_id'] ?? null,
            'name' => $data['name'],
            'value' => $data['value'] ?? 0,
            'stage' => $data['stage'] ?? DealStage::HOOK->value,
            'probability' => DealStage::from($data['stage'] ?? 'hook')->probability(),
            'notes' => $data['notes'] ?? null,
            'expected_close_at' => $data['expected_close_at'] ?? null,
        ]);

        $deal->save();

        $this->logDealActivity($deal, 'created', null, $deal->stage, 'Deal created');

        return $deal->load(['customer', 'contact']);
    }

    /**
     * Update a deal.
     */
    public function update(Deal $deal, array $data): Deal
    {
        $oldStage = $deal->stage;

        $deal->fill(array_filter([
            'contact_id' => $data['contact_id'] ?? $deal->contact_id,
            'name' => $data['name'] ?? $deal->name,
            'value' => $data['value'] ?? $deal->value,
            'notes' => $data['notes'] ?? $deal->notes,
            'expected_close_at' => $data['expected_close_at'] ?? $deal->expected_close_at,
        ]));

        $deal->save();

        return $deal->load(['customer', 'contact', 'activities']);
    }

    /**
     * Transition deal to a new stage.
     */
    public function transitionStage(Deal $deal, string $newStage, ?string $lossReason = null): Deal
    {
        $newStageEnum = DealStage::from($newStage);

        if ($newStageEnum === DealStage::LOST && empty($lossReason)) {
            throw new \InvalidArgumentException('Loss reason is required when marking deal as lost');
        }

        $oldStage = $deal->stage;

        DB::transaction(function () use ($deal, $newStage, $newStageEnum, $lossReason, $oldStage) {
            $deal->stage = $newStage;
            $deal->probability = $newStageEnum->probability();

            if ($newStageEnum === DealStage::LOST) {
                $deal->loss_reason = $lossReason;
            }

            if ($newStageEnum->isTerminal()) {
                $deal->closed_at = now();
            }

            $deal->save();

            $this->logDealActivity($deal, 'stage_change', $oldStage, $newStage, "Stage changed from {$oldStage} to {$newStage}");

            if ($newStageEnum === DealStage::WON) {
                $this->handleDealWon($deal);
            }
        });

        return $deal->fresh(['customer', 'contact', 'activities']);
    }

    /**
     * Handle deal won: update customer tier, create notification.
     */
    protected function handleDealWon(Deal $deal): void
    {
        $customer = $deal->customer;
        if ($customer && $customer->pipeline_stage !== PipelineStage::RETENTION) {
            try {
                app(PipelineTransitionService::class)->transition($customer, PipelineStage::RETENTION, 'deal_won');
            } catch (\Throwable $e) {
                Log::warning('Failed to advance customer on deal won', ['deal_id' => $deal->id, 'error' => $e->getMessage()]);
            }
        }
    }

    protected function logDealActivity(Deal $deal, string $type, ?string $fromStage, ?string $toStage, string $description): void
    {
        DealActivity::create([
            'deal_id' => $deal->id,
            'type' => $type,
            'from_stage' => $fromStage,
            'to_stage' => $toStage,
            'description' => $description,
        ]);
    }

    /**
     * Get deals by stage for kanban view.
     */
    public function getByStage(string $tenantId): array
    {
        $stages = DealStage::pipelineStages();
        $result = [];

        foreach ($stages as $stage) {
            $result[$stage->value] = Deal::where('tenant_id', $tenantId)
                ->where('stage', $stage->value)
                ->with(['customer', 'contact'])
                ->orderBy('updated_at', 'desc')
                ->get();
        }

        return $result;
    }
}
