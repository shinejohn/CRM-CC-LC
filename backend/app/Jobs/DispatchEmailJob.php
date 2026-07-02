<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\EmailStatus;
use App\Models\EmailMessage;
use App\Services\Email\PostalService;
use Throwable;
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

        $response = $postalService->send($this->message);

        $this->message->update([
            'status' => EmailStatus::Sent,
            'provider_message_id' => $response['data']['message_id'] ?? null, // according to postal doc usually nested in data
        ]);
        // NOTE: do NOT catch-and-mark-Failed here. Previously the catch set status=Failed before
        // rethrowing; because handle() early-returns when status !== Pending, retries 2-3 became
        // no-ops and $tries was effectively dead. Let transient exceptions bubble up so the queue
        // actually re-attempts, and only record the terminal failure once retries are exhausted
        // (see failed()).
    }

    /**
     * Called by the queue after all $tries are exhausted (or the job is released as failed).
     * This is the single place we permanently mark the message Failed.
     */
    public function failed(?Throwable $e): void
    {
        // Refresh in case another worker touched the row; only downgrade a still-Pending message.
        $this->message->refresh();

        if ($this->message->status === EmailStatus::Sent) {
            return;
        }

        $this->message->update([
            'status' => EmailStatus::Failed,
            'error_message' => $e ? substr($e->getMessage(), 0, 1000) : 'Unknown error',
        ]);
    }
}
