<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\GenerateEmbedding;

class GeneratePendingEmbeddings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'embeddings:generate-pending';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate embeddings for pending knowledge items';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Generating pending embeddings...');
        
        // TODO: Query database for items with embedding_status = 'pending'
        // TODO: Dispatch GenerateEmbedding job for each
        
        $this->info('Pending embeddings queued for generation!');
        
        return Command::SUCCESS;
    }
}

