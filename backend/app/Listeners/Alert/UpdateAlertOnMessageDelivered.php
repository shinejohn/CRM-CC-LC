<?php

namespace App\Listeners\Alert;

use App\Events\EmailDelivered;
use App\Models\Alert\AlertSend;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateAlertOnMessageDelivered implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(EmailDelivered $event): void
    {
        // Update alert_sends record if this is an alert email
        if (isset($event->metadata['alert_id']) && isset($event->metadata['recipient_id'])) {
            $alertSend = AlertSend::where('alert_id', $event->metadata['alert_id'])
                ->where('subscriber_id', $event->metadata['recipient_id'])
                ->where('email_sent', true)
                ->first();
            
            if ($alertSend) {
                // Update alert stats
                $alert = $alertSend->alert;
                $alert->increment('email_delivered');
            }
        }
    }
}



