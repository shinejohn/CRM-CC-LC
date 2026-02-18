<?php

namespace App\Jobs\Communication;

use App\Models\Communication\MessageQueue;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class CleanupMessageQueue implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Delete messages older than 30 days
        $cutoff = now()->subDays(30);
        
        MessageQueue::where('created_at', '<', $cutoff)
            ->whereIn('status', ['sent', 'delivered', 'failed', 'bounced'])
            ->delete();
    }
}
