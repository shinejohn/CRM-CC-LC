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

class ProvisionReviewAutomation implements ShouldQueue
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
                'workflow_id' => (string) Str::uuid(),
                'review_channels' => ['google', 'facebook', 'yelp'],
                'request_schedule' => [
                    'trigger' => 'after_service',
                    'delay_hours' => 24,
                ],
                'templates' => [
                    'email' => 'review_request_email_v1',
                    'sms' => 'review_request_sms_v1',
                ],
            ];

            $approvalService->completeProvisioning($task->approval_id, $resultData);
            SendProvisioningCompleteEmail::dispatch($task->id);
        } catch (\Throwable $e) {
            $approvalService->failProvisioning($task->approval_id, $e->getMessage());

            Log::error('Review automation provisioning failed', [
                'task_id' => $task->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

