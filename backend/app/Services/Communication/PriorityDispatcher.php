<?php

namespace App\Services\Communication;

use App\Jobs\Communication\ProcessMessages;
use Illuminate\Support\Facades\DB;

class PriorityDispatcher
{
    /**
     * Dispatch message processing jobs based on queue depth
     */
    public function dispatch(): void
    {
        // Always process P0 first
        $this->dispatchForPriority('P0', 'messages-p0');
        
        // Check P1 queue depth
        $p1Depth = $this->getQueueDepth('P1');
        if ($p1Depth > 0) {
            $jobs = min(ceil($p1Depth / 100), 10);
            $this->dispatchForPriority('P1', 'messages-p1', $jobs);
        }
        
        // P2 and P3 only if P1 is manageable
        if ($p1Depth < 10000) {
            $this->dispatchForPriority('P2', 'messages-p2');
            $this->dispatchForPriority('P3', 'messages-p3');
            $this->dispatchForPriority('P4', 'messages-p4');
        }
    }
    
    private function dispatchForPriority(string $priority, string $queue, int $jobs = 1): void
    {
        for ($i = 0; $i < $jobs; $i++) {
            dispatch(new ProcessMessages($priority))->onQueue($queue);
        }
    }
    
    private function getQueueDepth(string $priority): int
    {
        return DB::table('message_queue')
            ->where('priority', $priority)
            ->where('status', 'pending')
            ->where('scheduled_for', '<=', now())
            ->whereNull('locked_at')
            ->count();
    }
}
