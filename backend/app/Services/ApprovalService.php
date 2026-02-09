<?php

namespace App\Services;

use App\Contracts\ApprovalServiceInterface;
use App\Events\Approval\ApprovalProvisioned;
use App\Events\ApprovalSubmitted;
use App\Events\Approval\UpsellAccepted;
use App\Events\Approval\UpsellOffered;
use App\Events\SMB\SMBEngagementChanged;
use App\Jobs\ProcessApproval;
use App\Jobs\StartProvisioning;
use App\Jobs\Provisioners\ProvisionAppointmentBooking;
use App\Jobs\Provisioners\ProvisionGenericService;
use App\Jobs\Provisioners\ProvisionInvoiceAutomation;
use App\Jobs\Provisioners\ProvisionReviewAutomation;
use App\Models\Approval;
use App\Models\ApprovalUpsell;
use App\Models\ProvisioningTask;
use Illuminate\Support\Facades\Log;

class ApprovalService implements ApprovalServiceInterface
{
    public function __construct(
        protected ApprovalTokenService $tokenService
    ) {
    }

    public function validateToken(string $token): ?array
    {
        return $this->tokenService->validateToken($token);
    }

    public function generateToken(string $customerId, string $serviceType, string $sourceId): string
    {
        return $this->tokenService->generateToken($customerId, $serviceType, $sourceId);
    }

    public function create(array $data): Approval
    {
        $approval = Approval::create($data);

        event(new ApprovalSubmitted($approval->customer_id, (string) $approval->id, $approval->service_type));

        return $approval;
    }

    public function process(int $approvalId): void
    {
        $approval = Approval::with('customer')->findOrFail($approvalId);

        ProcessApproval::dispatch($approval->id);
    }

    public function getUpsellOffers(string $serviceType): array
    {
        $upsellMap = config('fibonacco.upsell_map', []);
        $upsellTypes = $upsellMap[$serviceType] ?? [];

        return collect($upsellTypes)
            ->take(3)
            ->map(function (string $type) {
                $config = config("fibonacco.services.{$type}", []);
                return [
                    'type' => $type,
                    'name' => $config['name'] ?? $type,
                    'description' => $config['short_description'] ?? '',
                    'benefit' => $config['benefit'] ?? '',
                ];
            })
            ->values()
            ->toArray();
    }

    public function recordUpsellOffer(int $approvalId, string $upsellType): void
    {
        $existing = ApprovalUpsell::where('approval_id', $approvalId)
            ->where('upsell_service_type', $upsellType)
            ->first();

        if ($existing) {
            return;
        }

        ApprovalUpsell::create([
            'approval_id' => $approvalId,
            'upsell_service_type' => $upsellType,
            'offered_at' => now(),
        ]);

        event(new UpsellOffered($approvalId, $upsellType));
    }

    public function acceptUpsell(int $approvalId, string $upsellType): Approval
    {
        $originalApproval = Approval::with('customer')->findOrFail($approvalId);

        $upsell = ApprovalUpsell::where('approval_id', $approvalId)
            ->where('upsell_service_type', $upsellType)
            ->whereNull('accepted_at')
            ->whereNull('declined_at')
            ->firstOrFail();

        $newApproval = Approval::create([
            'customer_id' => $originalApproval->customer_id,
            'service_type' => $upsellType,
            'approver_name' => $originalApproval->approver_name,
            'approver_email' => $originalApproval->approver_email,
            'approver_phone' => $originalApproval->approver_phone,
            'approver_role' => $originalApproval->approver_role,
            'source_type' => 'upsell',
            'source_id' => $originalApproval->uuid,
            'contact_consent' => true,
            'status' => 'pending',
            'approved_at' => now(),
        ]);

        $upsell->update([
            'accepted' => true,
            'accepted_at' => now(),
            'resulting_approval_id' => $newApproval->id,
        ]);

        event(new UpsellAccepted($newApproval->id, $upsellType));

        ProcessApproval::dispatch($newApproval->id);

        return $newApproval;
    }

    public function startProvisioning(int $approvalId): void
    {
        $approval = Approval::with('customer')->findOrFail($approvalId);

        if ($approval->status === 'provisioning' || $approval->status === 'provisioned') {
            return;
        }

        $approval->update([
            'status' => 'provisioning',
            'provisioning_started_at' => now(),
        ]);

        $task = ProvisioningTask::create([
            'approval_id' => $approval->id,
            'customer_id' => $approval->customer_id,
            'service_type' => $approval->service_type,
            'status' => 'queued',
            'priority' => $this->calculatePriority($approval),
        ]);

        $provisionerClass = $this->getProvisionerClass($approval->service_type);
        $provisionerClass::dispatch($task->id);
    }

    public function completeProvisioning(int $approvalId, array $resultData): void
    {
        $approval = Approval::with('customer')->findOrFail($approvalId);

        $approval->update([
            'status' => 'provisioned',
            'provisioned_at' => now(),
        ]);

        $task = ProvisioningTask::where('approval_id', $approval->id)->latest()->first();
        if ($task) {
            $task->update([
                'status' => 'completed',
                'completed_at' => now(),
                'result_data' => $resultData,
            ]);
        }

        $customer = $approval->customer;
        $activated = $customer->services_activated ?? [];
        $activated[] = $approval->service_type;
        $pending = array_diff($customer->services_approved_pending ?? [], [$approval->service_type]);
        $customer->update([
            'services_activated' => array_values(array_unique($activated)),
            'services_approved_pending' => array_values($pending),
        ]);

        event(new ApprovalProvisioned($approval->id, $approval->customer_id));
    }

    public function failProvisioning(int $approvalId, string $reason): void
    {
        $approval = Approval::findOrFail($approvalId);
        $approval->update(['status' => 'failed']);

        $task = ProvisioningTask::where('approval_id', $approval->id)->latest()->first();
        if ($task) {
            $task->update([
                'status' => 'failed',
                'failed_at' => now(),
                'failure_reason' => $reason,
            ]);
        }

        Log::warning('Provisioning failed', [
            'approval_id' => $approval->id,
            'reason' => $reason,
        ]);
    }

    protected function calculatePriority(Approval $approval): int
    {
        return (int) ($approval->customer->engagement_tier ?? 4);
    }

    public function getProvisionerClass(string $serviceType): string
    {
        return match ($serviceType) {
            'appointment_booking' => ProvisionAppointmentBooking::class,
            'review_automation' => ProvisionReviewAutomation::class,
            'invoice_automation' => ProvisionInvoiceAutomation::class,
            default => ProvisionGenericService::class,
        };
    }

    public function updateEngagementForApproval(Approval $approval): void
    {
        $customer = $approval->customer;
        $previousScore = (int) $customer->engagement_score;
        $weight = (int) config('fibonacco.engagement.score_weights.approval', 25);
        $newScore = $previousScore + $weight;

        $customer->update([
            'engagement_score' => $newScore,
            'engagement_tier' => $this->determineEngagementTier($newScore),
            'last_approval' => now(),
            'total_approvals' => $customer->total_approvals + 1,
        ]);

        event(new SMBEngagementChanged($customer->fresh(), $previousScore, $newScore));
    }

    public function addPendingService(Approval $approval): void
    {
        $customer = $approval->customer;
        $pending = $customer->services_approved_pending ?? [];

        if (!in_array($approval->service_type, $pending, true)) {
            $pending[] = $approval->service_type;
            $customer->update(['services_approved_pending' => array_values($pending)]);
        }
    }

    public function recordUpsellOffersForApproval(Approval $approval): void
    {
        $upsellTypes = collect(config("fibonacco.upsell_map.{$approval->service_type}", []))
            ->take(3);

        foreach ($upsellTypes as $upsellType) {
            $this->recordUpsellOffer($approval->id, $upsellType);
        }
    }

    protected function determineEngagementTier(int $score): int
    {
        $tiers = config('fibonacco.engagement.tiers', []);
        $sorted = collect($tiers)->sortByDesc('min_score');

        foreach ($sorted as $tier => $data) {
            if ($score >= ($data['min_score'] ?? 0)) {
                return (int) $tier;
            }
        }

        return 4;
    }
}

