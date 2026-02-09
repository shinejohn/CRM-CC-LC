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

class ProvisionAppointmentBooking implements ShouldQueue
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
                'calendar_settings' => [
                    'id' => (string) Str::uuid(),
                    'timezone' => config('app.timezone'),
                    'buffer_minutes' => 15,
                    'min_notice_hours' => 4,
                ],
                'booking_widget' => [
                    'embed_code' => "<div data-fibonacco-booking='{$task->customer_id}'></div>",
                    'script_url' => config('app.url') . '/booking/widget.js',
                ],
                'availability' => [
                    'weekdays' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                    'start_time' => '09:00',
                    'end_time' => '17:00',
                ],
            ];

            $approvalService->completeProvisioning($task->approval_id, $resultData);
            SendProvisioningCompleteEmail::dispatch($task->id);
        } catch (\Throwable $e) {
            $approvalService->failProvisioning($task->approval_id, $e->getMessage());

            Log::error('Appointment booking provisioning failed', [
                'task_id' => $task->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

