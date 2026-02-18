<?php

namespace App\Jobs\Communication;

use App\Models\Communication\MessageQueue;
use App\Services\Communication\ChannelFactory;
use App\Events\Communication\MessageSent;
use App\Events\Communication\MessageFailed;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class ProcessMessages implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;
    public $tries = 1;

    public function __construct(
        public string $priority = 'P3',
        public int $batchSize = 100,
    ) {}
    
    public function handle(ChannelFactory $channelFactory): void
    {
        // Claim batch of messages
        $messages = $this->claimBatch();
        
        if ($messages->isEmpty()) {
            return;
        }
        
        // Group by channel and gateway for efficient sending
        $grouped = $messages->groupBy(fn($m) => $m->channel . ':' . $m->gateway);
        
        foreach ($grouped as $key => $batch) {
            [$channel, $gateway] = explode(':', $key);
            
            $channelService = $channelFactory->get($channel, $gateway);
            
            foreach ($batch as $message) {
                try {
                    $result = $channelService->send($message);
                    
                    if ($result->success) {
                        $message->update([
                            'status' => 'sent',
                            'sent_at' => now(),
                            'external_id' => $result->externalId,
                            'locked_by' => null,
                            'locked_at' => null,
                        ]);
                        
                        event(new MessageSent($message, $result));
                    } else {
                        $this->handleFailure($message, $result->error ?? 'Unknown error');
                    }
                } catch (\Exception $e) {
                    $this->handleFailure($message, $e->getMessage());
                }
            }
        }
        
        // If we processed a full batch, there might be more
        if ($messages->count() === $this->batchSize) {
            dispatch(new self($this->priority, $this->batchSize))
                ->onQueue("messages-{$this->priority}");
        }
    }
    
    private function claimBatch(): Collection
    {
        return DB::transaction(function () {
            $lockId = \Illuminate\Support\Str::uuid()->toString();
            
            $claimed = MessageQueue::where('priority', $this->priority)
                ->where('status', 'pending')
                ->where('scheduled_for', '<=', now())
                ->whereNull('locked_at')
                ->limit($this->batchSize)
                ->lockForUpdate()
                ->pluck('id');
            
            if ($claimed->isEmpty()) {
                return collect();
            }
            
            MessageQueue::whereIn('id', $claimed)
                ->update([
                    'locked_by' => $lockId,
                    'locked_at' => now(),
                    'status' => 'processing',
                ]);
            
            return MessageQueue::whereIn('id', $claimed)->get();
        });
    }
    
    private function handleFailure(MessageQueue $message, string $error): void
    {
        $message->attempts++;
        
        if ($message->attempts >= $message->max_attempts) {
            $message->update([
                'status' => 'failed',
                'last_error' => $error,
                'locked_by' => null,
                'locked_at' => null,
            ]);
            
            event(new MessageFailed($message, $error));
        } else {
            // Exponential backoff
            $delay = pow(2, $message->attempts) * 60;
            
            $message->update([
                'status' => 'pending',
                'last_error' => $error,
                'next_retry_at' => now()->addSeconds($delay),
                'scheduled_for' => now()->addSeconds($delay),
                'locked_by' => null,
                'locked_at' => null,
            ]);
        }
    }
}
