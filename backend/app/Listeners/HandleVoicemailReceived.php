<?php

namespace App\Listeners;

use App\Events\VoicemailReceived;
use App\Jobs\ProcessVoicemail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class HandleVoicemailReceived implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(VoicemailReceived $event): void
    {
        Log::info('HandleVoicemailReceived listener triggered', [
            'customer_id' => $event->customer->id,
            'from_number' => $event->fromNumber,
        ]);

        // The ProcessVoicemail job will handle the actual processing
        // This listener is mainly for any immediate actions needed
        // The job is dispatched from the webhook controller
        
        // Update customer engagement score
        $this->updateEngagementScore($event);
    }

    /**
     * Update customer engagement score based on voicemail
     */
    protected function updateEngagementScore(VoicemailReceived $event): void
    {
        $customer = $event->customer;
        $currentScore = $customer->engagement_score ?? 0;
        
        // Voicemail indicates high engagement
        $pointsToAdd = match($event->urgency) {
            'high' => 15,
            'medium' => 10,
            'low' => 5,
            default => 5,
        };

        $newScore = min(100, $currentScore + $pointsToAdd);
        
        $customer->update([
            'engagement_score' => $newScore,
        ]);

        Log::info('Engagement score updated from voicemail', [
            'customer_id' => $customer->id,
            'previous_score' => $currentScore,
            'new_score' => $newScore,
            'points_added' => $pointsToAdd,
        ]);
    }
}

