<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\EmailStatus;
use App\Models\EmailMessage;
use App\Services\Email\PostalService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class DispatchEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(
        public readonly EmailMessage $message
    ) {}

    /**
     * Execute the job.
     */
    public function handle(PostalService $postalService): void
    {
        // Don't send if already suppressed, failed, or sent
        if ($this->message->status !== EmailStatus::Pending) {
            return;
        }

        try {
            $response = $postalService->send($this->message);

            $this->message->update([
                'status' => EmailStatus::Sent,
                'provider_message_id' => $response['data']['message_id'] ?? null, // according to postal doc usually nested in data
            ]);
        } catch (Exception $e) {
            $this->message->update([
                'status' => EmailStatus::Failed,
                'error_message' => substr($e->getMessage(), 0, 1000),
            ]);

            throw $e; // Throw to trigger retries
        }
    }
}
