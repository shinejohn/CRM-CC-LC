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
use Illuminate\Support\Facades\Log;

class ProcessMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;
    public $tries = 1; // Fail fast, handle retries in code

    public function __construct(
        public int $messageId
    ) {}
    
    public function handle(ChannelFactory $channelFactory): void
    {
        $message = MessageQueue::find($this->messageId);
        
        if (!$message) {
            Log::warning("Message not found: {$this->messageId}");
            return;
        }
        
        // Lock the message
        $lockId = \Illuminate\Support\Str::uuid()->toString();
        $locked = MessageQueue::where('id', $message->id)
            ->where('status', 'pending')
            ->whereNull('locked_at')
            ->update([
                'status' => 'processing',
                'locked_by' => $lockId,
                'locked_at' => now(),
            ]);
        
        if (!$locked) {
            // Message already being processed
            return;
        }
        
        // Refresh message
        $message->refresh();
        
        try {
            $channel = $channelFactory->get($message->channel, $message->gateway);
            $result = $channel->send($message);
            
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
            Log::error("Error processing message {$message->id}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            $this->handleFailure($message, $e->getMessage());
        }
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
            
            // Try failover gateway if available
            if ($message->gateway === 'postal' && $message->channel === 'email') {
                $this->retryWithFailover($message, 'ses');
            }
        } else {
            // Exponential backoff
            $delay = pow(2, $message->attempts) * 60; // 2, 4, 8 minutes
            
            $message->update([
                'status' => 'pending',
                'last_error' => $error,
                'next_retry_at' => now()->addSeconds($delay),
                'scheduled_for' => now()->addSeconds($delay),
                'locked_by' => null,
                'locked_at' => null,
            ]);
            
            // Re-dispatch with delay
            dispatch(new self($message->id))
                ->delay(now()->addSeconds($delay))
                ->onQueue("messages-{$message->priority}");
        }
    }
    
    private function retryWithFailover(MessageQueue $message, string $failoverGateway): void
    {
        MessageQueue::create([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'priority' => $message->priority,
            'message_type' => $message->message_type,
            'channel' => $message->channel,
            'recipient_type' => $message->recipient_type,
            'recipient_id' => $message->recipient_id,
            'recipient_address' => $message->recipient_address,
            'subject' => $message->subject,
            'template' => $message->template,
            'content_data' => $message->content_data,
            'source_type' => $message->source_type,
            'source_id' => $message->source_id,
            'ip_pool' => $message->ip_pool,
            'gateway' => $failoverGateway,
            'scheduled_for' => now(),
        ]);
    }
}
