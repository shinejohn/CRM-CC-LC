<?php

namespace App\Jobs;

use App\Models\Approval;
use App\Services\ApprovalService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessApproval implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $approvalId
    ) {
    }

    public function handle(ApprovalService $approvalService): void
    {
        $approval = Approval::with('customer')->find($this->approvalId);

        if (!$approval) {
            Log::warning("Approval not found for processing: {$this->approvalId}");
            return;
        }

        SendApprovalConfirmationEmail::dispatch($approval->id);

        $approvalService->updateEngagementForApproval($approval);
        $approvalService->addPendingService($approval);
        $approvalService->recordUpsellOffersForApproval($approval);

        if (config("fibonacco.services.{$approval->service_type}.auto_provision", false)) {
            StartProvisioning::dispatch($approval->id);
        }
    }
}

