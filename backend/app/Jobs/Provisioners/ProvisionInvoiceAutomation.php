<?php

namespace App\Jobs\Provisioners;

use App\Jobs\SendProvisioningCompleteEmail;
use App\Models\ProvisioningTask;
use App\Services\ApprovalService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProvisionInvoiceAutomation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $taskId
    ) {
    }

    public function handle(ApprovalService $approvalService): void
    {
        $task = ProvisioningTask::with(['approval', 'customer'])->findOrFail($this->taskId);

        try {
            $task->update(['status' => 'processing', 'started_at' => now()]);

            $resultData = [
                'invoice_template_id' => (string) Str::uuid(),
                'automation_rules' => [
                    'reminder_days' => [3, 7, 14],
                    'late_fee_enabled' => true,
                    'late_fee_percent' => 5,
                ],
                'payment_links' => [
                    'provider' => 'stripe',
                    'public_key' => Str::random(24),
                ],
            ];

            $approvalService->completeProvisioning($task->approval_id, $resultData);
            SendProvisioningCompleteEmail::dispatch($task->id);
        } catch (\Throwable $e) {
            $approvalService->failProvisioning($task->approval_id, $e->getMessage());

            Log::error('Invoice automation provisioning failed', [
                'task_id' => $task->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

