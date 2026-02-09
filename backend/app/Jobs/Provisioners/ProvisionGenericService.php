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

class ProvisionGenericService implements ShouldQueue
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
                'activation_id' => (string) Str::uuid(),
                'service_type' => $task->service_type,
                'enabled_features' => ['core_setup', 'monitoring', 'reporting'],
            ];

            $approvalService->completeProvisioning($task->approval_id, $resultData);
            SendProvisioningCompleteEmail::dispatch($task->id);
        } catch (\Throwable $e) {
            $approvalService->failProvisioning($task->approval_id, $e->getMessage());

            Log::error('Generic provisioning failed', [
                'task_id' => $task->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

