<?php

namespace App\Jobs\Alert;

use App\Models\Alert\Alert;
use App\Models\Alert\AlertSend;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateAlertStats implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Update stats from alert_sends table
        $alerts = Alert::where('status', 'sent')
            ->whereNotNull('sending_completed_at')
            ->get();
        
        foreach ($alerts as $alert) {
            $stats = AlertSend::where('alert_id', $alert->id)
                ->selectRaw('
                    COUNT(*) as total,
                    SUM(CASE WHEN email_sent THEN 1 ELSE 0 END) as email_sent,
                    SUM(CASE WHEN sms_sent THEN 1 ELSE 0 END) as sms_sent,
                    SUM(CASE WHEN push_sent THEN 1 ELSE 0 END) as push_sent,
                    SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
                    SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked
                ')
                ->first();
            
            if ($stats) {
                $alert->update([
                    'email_opened' => $stats->opened ?? 0,
                    'total_clicks' => $stats->clicked ?? 0,
                ]);
            }
        }
    }
}



