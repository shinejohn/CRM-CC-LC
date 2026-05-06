<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Contracts\CampaignOrchestratorInterface;
use App\Models\CustomerTimelineProgress;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Daily Manifest Destiny processor.
 *
 * Iterates all active timeline progress records and executes due actions.
 * Intended to run via `$schedule->command('manifest-destiny:run')->dailyAt('09:00')`.
 */
final class RunManifestDestiny extends Command
{
    protected $signature = 'manifest-destiny:run
                            {--dry-run : Show what would execute without taking action}';

    protected $description = 'Process all active Manifest Destiny campaign timelines and execute due actions';

    public function handle(CampaignOrchestratorInterface $orchestrator): int
    {
        $this->info('Manifest Destiny: processing active timelines...');

        $activeCount = CustomerTimelineProgress::where('status', 'active')->count();

        if ($activeCount === 0) {
            $this->info('No active timeline progress records found.');

            return self::SUCCESS;
        }

        $this->info("Found {$activeCount} active timeline(s).");

        if ($this->option('dry-run')) {
            $progress = CustomerTimelineProgress::where('status', 'active')
                ->with(['customer', 'timeline'])
                ->get();

            foreach ($progress as $p) {
                $this->line(sprintf(
                    '  [DRY RUN] Customer %s — Timeline "%s" — Day %d/%d',
                    $p->customer_id,
                    $p->timeline?->name ?? 'unknown',
                    $p->current_day,
                    $p->timeline?->duration_days ?? 0,
                ));

                $actions = $p->timeline?->getActionsForDay($p->current_day) ?? collect();
                foreach ($actions as $action) {
                    $done = $p->isActionCompleted($action->id) ? 'DONE' : 'PENDING';
                    $this->line("    [{$done}] {$action->action_type} — {$action->template_type} (delay: {$action->delay_hours}h)");
                }
            }

            return self::SUCCESS;
        }

        $results = $orchestrator->processAllDueCustomers();

        $totalActions = 0;
        foreach ($results as $customerResults) {
            $totalActions += count($customerResults);
        }

        $customerCount = count($results);
        $this->info("Processed {$customerCount} customer(s), executed {$totalActions} action(s).");

        Log::info('manifest-destiny:run completed', [
            'customers_processed' => $customerCount,
            'total_actions' => $totalActions,
        ]);

        return self::SUCCESS;
    }
}
