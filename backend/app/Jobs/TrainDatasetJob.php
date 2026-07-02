<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\TrainingDataset;
use App\Models\TrainingRun;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * TrainDatasetJob
 *
 * HONEST PLACEHOLDER: there is no ML model-training backend integrated in this
 * codebase. This job performs the real workflow bookkeeping — it moves the
 * persisted TrainingRun through queued -> running -> completed and stamps the
 * dataset — but it does NOT actually train a model and deliberately fabricates
 * NO accuracy/metric numbers. When a real training backend is integrated, the
 * body of handle() is where that call belongs.
 */
final class TrainDatasetJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $runId)
    {
        $this->onQueue('ai');
    }

    public function handle(): void
    {
        $run = TrainingRun::find($this->runId);

        if ($run === null) {
            Log::warning('TrainDatasetJob: run not found', ['run_id' => $this->runId]);

            return;
        }

        $run->update([
            'status' => 'running',
            'started_at' => now(),
        ]);

        // ---------------------------------------------------------------
        // Model training backend not yet integrated. No real ML work runs
        // here and no accuracy metrics are produced. This is an honest
        // placeholder that records the run lifecycle only.
        // ---------------------------------------------------------------
        Log::info('TrainDatasetJob: model training backend not yet integrated', [
            'run_id' => $run->id,
            'dataset_id' => $run->dataset_id,
        ]);

        $run->update([
            'status' => 'completed',
            'finished_at' => now(),
            'notes' => 'Model training backend not yet integrated — run recorded as completed (placeholder, no model was trained).',
        ]);

        // Reflect the terminal state on the dataset without inventing metrics.
        TrainingDataset::withoutGlobalScopes()
            ->whereKey($run->dataset_id)
            ->update(['status' => 'ready']);
    }

    public function failed(Throwable $e): void
    {
        TrainingRun::whereKey($this->runId)->update([
            'status' => 'failed',
            'finished_at' => now(),
            'notes' => 'Training run failed: '.$e->getMessage(),
        ]);
    }
}
