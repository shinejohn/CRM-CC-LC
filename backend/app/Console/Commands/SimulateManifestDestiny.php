<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\ManifestDestinySimulationService;
use Illuminate\Console\Command;

final class SimulateManifestDestiny extends Command
{
    protected $signature = 'manifest-destiny:simulate
                            {--timeline=manifest-destiny-hook : Timeline slug to simulate}
                            {--profile=engaged : Engagement profile (engaged, passive, cold)}
                            {--business= : Business name override}
                            {--community= : Community name override}';

    protected $description = 'Simulate a Manifest Destiny timeline and display a day-by-day execution plan';

    public function handle(ManifestDestinySimulationService $service): int
    {
        $timelineSlug = (string) $this->option('timeline');
        $profile = (string) $this->option('profile');

        if (! in_array($profile, ['engaged', 'passive', 'cold'], true)) {
            $this->error("Invalid profile: {$profile}. Must be one of: engaged, passive, cold");

            return self::FAILURE;
        }

        $overrides = [];

        $business = $this->option('business');
        if ($business !== null && $business !== '') {
            $overrides['business_name'] = (string) $business;
        }

        $community = $this->option('community');
        if ($community !== null && $community !== '') {
            $overrides['community_name'] = (string) $community;
            $overrides['city'] = (string) $community;
        }

        $this->info("Simulating timeline: {$timelineSlug}");
        $this->info("Engagement profile: {$profile}");
        $this->newLine();

        try {
            $result = $service->simulate($timelineSlug, $profile, $overrides);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            $this->error("Timeline not found: {$timelineSlug}");

            return self::FAILURE;
        }

        // Summary
        $summary = $result['summary'];
        $this->info('=== SUMMARY ===');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Timeline', $result['timeline']['name']],
                ['Pipeline Stage', $result['timeline']['pipeline_stage']],
                ['Duration (days)', (string) $result['timeline']['duration_days']],
                ['Business', $result['business']['business_name']],
                ['Community', $result['business']['community_name']],
                ['Profile', $result['engagement_profile']],
                ['Days with actions', (string) $summary['total_days_with_actions']],
                ['Total actions', (string) $summary['total_actions']],
                ['Emails fired', (string) $summary['emails_fired']],
                ['Emails skipped', (string) $summary['emails_skipped']],
                ['SMS fired', (string) $summary['sms_fired']],
                ['Engagement checks', (string) $summary['engagement_checks']],
                ['Stage transitions', (string) $summary['stage_transitions']],
            ],
        );

        $this->newLine();

        // Day-by-day table
        $this->info('=== DAY-BY-DAY EXECUTION ===');

        $rows = [];
        foreach ($result['days'] as $day) {
            foreach ($day['actions'] as $action) {
                $subject = $this->resolveDescription($action);
                $fires = $action['fires'] ? '<fg=green>YES</>' : '<fg=red>NO</>';
                $skipInfo = $action['skip_reason'] !== null
                    ? " ({$action['skip_reason']})"
                    : '';

                $rows[] = [
                    (string) $day['day'],
                    $action['channel'],
                    $action['action_type'],
                    mb_substr($subject, 0, 70),
                    $fires . $skipInfo,
                ];
            }

            if ($day['stage_transition'] !== null) {
                $rows[] = [
                    (string) $day['day'],
                    'system',
                    'STAGE TRANSITION',
                    "{$day['stage_transition']['from']} -> {$day['stage_transition']['to']}",
                    '',
                ];
            }
        }

        $this->table(
            ['Day', 'Channel', 'Action', 'Subject / Description', 'Fires?'],
            $rows,
        );

        return self::SUCCESS;
    }

    /**
     * Extract a human-readable description for the action row.
     *
     * @param  array<string, mixed>  $action
     */
    private function resolveDescription(array $action): string
    {
        // Prefer rendered template subject
        if (isset($action['template']['subject']) && $action['template']['subject'] !== '') {
            return $action['template']['subject'];
        }

        // Fall back to campaign title
        if (isset($action['campaign']['title']) && $action['campaign']['title'] !== '') {
            return $action['campaign']['title'];
        }

        // System actions
        return match ($action['action_type']) {
            'check_engagement' => 'Check engagement threshold',
            'update_stage' => 'Update pipeline stage',
            'send_notification' => 'Internal notification',
            default => $action['action_type'],
        };
    }
}
