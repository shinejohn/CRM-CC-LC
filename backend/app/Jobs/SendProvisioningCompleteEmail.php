<?php

namespace App\Jobs;

use App\Models\ProvisioningTask;
use App\Services\EmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendProvisioningCompleteEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $taskId
    ) {
    }

    public function handle(EmailService $emailService): void
    {
        $task = ProvisioningTask::with(['approval', 'customer'])->find($this->taskId);

        if (!$task || !$task->approval) {
            Log::warning("Provisioning task not found for completion email: {$this->taskId}");
            return;
        }

        $approval = $task->approval;
        $subject = 'Your service is now active';
        $html = view('emails.provisioning-complete', [
            'approval' => $approval,
            'customer' => $task->customer,
            'task' => $task,
            'serviceConfig' => config("fibonacco.services.{$approval->service_type}", []),
        ])->render();

        $emailService->send(
            $approval->approver_email,
            $subject,
            $html,
            strip_tags($html),
            [
                'from_name' => config('fibonacco.email.from_name', config('mail.from.name')),
                'from_email' => config('fibonacco.email.from_email', config('mail.from.address')),
                'tag' => 'provisioning_complete',
            ]
        );
    }
}

