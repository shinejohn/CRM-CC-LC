<?php

namespace App\Jobs\Communication;

use App\Models\Communication\MessageQueue;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ReleaseStuckMessages implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Release messages locked for more than 10 minutes
        $cutoff = now()->subMinutes(10);
        
        MessageQueue::where('status', 'processing')
            ->where('locked_at', '<', $cutoff)
            ->update([
                'status' => 'pending',
                'locked_by' => null,
                'locked_at' => null,
            ]);
    }
}
