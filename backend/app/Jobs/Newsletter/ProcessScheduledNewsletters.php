<?php

namespace App\Jobs\Newsletter;

use App\Models\Newsletter\Newsletter;
use App\Services\Newsletter\NewsletterService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessScheduledNewsletters implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(NewsletterService $newsletters): void
    {
        $scheduled = Newsletter::where('status', 'scheduled')
            ->where('scheduled_for', '<=', now())
            ->get();
        
        foreach ($scheduled as $newsletter) {
            try {
                if (!$newsletter->isReadyToSend()) {
                    Log::warning('Newsletter not ready to send', [
                        'newsletter_id' => $newsletter->id,
                        'status' => $newsletter->status,
                    ]);
                    continue;
                }
                
                $newsletters->send($newsletter->id);
                
                Log::info('Scheduled newsletter sent', [
                    'newsletter_id' => $newsletter->id,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send scheduled newsletter', [
                    'newsletter_id' => $newsletter->id,
                    'error' => $e->getMessage(),
                ]);
                
                $newsletter->update(['status' => 'failed']);
            }
        }
    }
}



