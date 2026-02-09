<?php

namespace App\Jobs;

use App\Contracts\CampaignOrchestratorInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessCampaignTimelines implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $this->onQueue('campaigns');
    }

    /**
     * Execute the job.
     */
    public function handle(CampaignOrchestratorInterface $orchestrator): void
    {
        Log::info('Processing campaign timelines for all due customers');
        
        try {
            $results = $orchestrator->processAllDueCustomers();
            
            $totalCustomers = count($results);
            $totalActions = array_sum(array_map(fn($r) => count($r), $results));
            
            Log::info("Campaign timeline processing completed", [
                'customers_processed' => $totalCustomers,
                'total_actions_executed' => $totalActions,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to process campaign timelines', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
        }
    }
}

