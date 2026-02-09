<?php

namespace App\Listeners\Alert;

use App\Events\Alert\AlertClicked;
use App\Events\EmailClicked;
use App\Models\Alert\AlertSend;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateAlertOnMessageClicked implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(EmailClicked $event): void
    {
        // Update alert_sends record if this is an alert email
        if (isset($event->metadata['alert_id']) && isset($event->metadata['recipient_id'])) {
            $alertSend = AlertSend::where('alert_id', $event->metadata['alert_id'])
                ->where('subscriber_id', $event->metadata['recipient_id'])
                ->where('email_sent', true)
                ->first();
            
            if ($alertSend && !$alertSend->clicked_at) {
                $alertSend->update(['clicked_at' => now()]);
                
                // Update alert stats
                $alert = $alertSend->alert;
                $alert->increment('total_clicks');
                
                // Fire alert-specific event
                event(new AlertClicked($alertSend));
            }
        }
    }
}



