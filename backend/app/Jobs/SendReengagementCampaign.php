<?php

namespace App\Jobs;

use App\Services\Subscriber\EngagementService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendReengagementCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct()
    {
        $this->onQueue('emails');
    }

    public function handle(EngagementService $engagementService): void
    {
        $disengaged = $engagementService->getDisengaged(90);
        
        foreach ($disengaged as $subscriber) {
            try {
                Mail::send('emails.reengagement', [
                    'first_name' => $subscriber->first_name,
                    'preferences_url' => route('subscriber.preferences'),
                ], function ($message) use ($subscriber) {
                    $message->to($subscriber->email)
                        ->subject('We miss you!');
                });
            } catch (\Exception $e) {
                \Log::error('Failed to send re-engagement email', [
                    'subscriber_id' => $subscriber->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}



