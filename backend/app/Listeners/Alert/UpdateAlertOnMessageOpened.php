<?php

namespace App\Listeners\Alert;

use App\Events\Alert\AlertOpened;
use App\Events\EmailOpened;
use App\Models\Alert\AlertSend;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateAlertOnMessageOpened implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(EmailOpened $event): void
    {
        // Update alert_sends record if this is an alert email
        if (isset($event->metadata['alert_id']) && isset($event->metadata['recipient_id'])) {
            $alertSend = AlertSend::where('alert_id', $event->metadata['alert_id'])
                ->where('subscriber_id', $event->metadata['recipient_id'])
                ->where('email_sent', true)
                ->first();
            
            if ($alertSend && !$alertSend->opened_at) {
                $alertSend->update(['opened_at' => now()]);
                
                // Update alert stats
                $alert = $alertSend->alert;
                $alert->increment('email_opened');
                
                // Fire alert-specific event
                event(new AlertOpened($alertSend));
            }
        }
    }
}



