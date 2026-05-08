<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\CampaignTimelineAction;
use App\Models\EmailTemplate;
use App\Models\SmsTemplate;
use Illuminate\Console\Command;

final class ValidateManifestDestiny extends Command
{
    protected $signature = 'manifest-destiny:validate';

    protected $description = 'Validate all Manifest Destiny timeline actions: template refs, campaign JSON files, conditions, and action types';

    /** @var list<array{check: string, status: string, details: string}> */
    private array $results = [];

    private bool $hasFailures = false;

    private const VALID_ACTION_TYPES = [
        'send_email',
        'send_sms',
        'make_call',
        'schedule_followup',
        'update_stage',
        'check_engagement',
        'send_notification',
    ];

    private const VALID_CONDITION_KEYS = [
        'if',
        'within_hours',
        'then',
        'threshold',
    ];

    public function handle(): int
    {
        $this->info('Validating Manifest Destiny timelines...');
        $this->newLine();

        $actions = CampaignTimelineAction::with('timeline')->get();

        if ($actions->isEmpty()) {
            $this->warn('No timeline actions found. Have you run the seeder?');

            return self::FAILURE;
        }

        $this->validateTemplateRefs($actions);
        $this->validateCampaignJsonFiles($actions);
        $this->validateConditionSchemas($actions);
        $this->validateActionTypes($actions);

        $this->table(
            ['Check', 'Status', 'Details'],
            array_map(fn (array $row): array => [
                $row['check'],
                $row['status'] === 'PASS' ? '<fg=green>PASS</>' : '<fg=red>FAIL</>',
                $row['details'],
            ], $this->results),
        );

        $this->newLine();

        if ($this->hasFailures) {
            $this->error('Validation FAILED — see details above.');

            return self::FAILURE;
        }

        $this->info('All checks passed.');

        return self::SUCCESS;
    }

    /**
     * Every non-null template_type must have a matching EmailTemplate or SmsTemplate by slug.
     *
     * @param \Illuminate\Database\Eloquent\Collection<int, CampaignTimelineAction> $actions
     */
    private function validateTemplateRefs(\Illuminate\Database\Eloquent\Collection $actions): void
    {
        $emailSlugs = $actions
            ->where('channel', '!=', 'sms')
            ->pluck('template_type')
            ->filter()
            ->unique()
            ->values();

        $smsSlugs = $actions
            ->where('channel', 'sms')
            ->pluck('template_type')
            ->filter()
            ->unique()
            ->values();

        if ($emailSlugs->isEmpty() && $smsSlugs->isEmpty()) {
            $this->addResult('Template references', 'PASS', 'No template_type values found.');

            return;
        }

        $missing = collect();

        if ($emailSlugs->isNotEmpty()) {
            $existingEmail = EmailTemplate::withoutGlobalScopes()
                ->whereIn('slug', $emailSlugs->all())
                ->pluck('slug')
                ->unique();
            $missing = $missing->merge($emailSlugs->diff($existingEmail));
        }

        if ($smsSlugs->isNotEmpty()) {
            $existingSms = SmsTemplate::withoutGlobalScopes()
                ->whereIn('slug', $smsSlugs->all())
                ->pluck('slug')
                ->unique();
            $missing = $missing->merge($smsSlugs->diff($existingSms));
        }

        $totalCount = $emailSlugs->count() + $smsSlugs->count();

        if ($missing->isEmpty()) {
            $this->addResult('Template references', 'PASS', "{$totalCount} template slugs verified ({$emailSlugs->count()} email, {$smsSlugs->count()} SMS).");
        } else {
            $this->addResult(
                'Template references',
                'FAIL',
                'Missing templates: ' . $missing->implode(', '),
            );
        }
    }

    /**
     * Every non-null campaign_id must have a matching content JSON file.
     *
     * @param \Illuminate\Database\Eloquent\Collection<int, CampaignTimelineAction> $actions
     */
    private function validateCampaignJsonFiles(\Illuminate\Database\Eloquent\Collection $actions): void
    {
        $campaignIds = $actions
            ->pluck('campaign_id')
            ->filter()
            ->unique()
            ->values();

        if ($campaignIds->isEmpty()) {
            $this->addResult('Campaign JSON files', 'PASS', 'No campaign_id values found.');

            return;
        }

        $contentPath = base_path('../content');
        $missing = [];

        foreach ($campaignIds as $campaignId) {
            $filePath = $contentPath . '/campaign_' . $campaignId . '_complete.json';
            if (! file_exists($filePath)) {
                $missing[] = $campaignId;
            }
        }

        if ($missing === []) {
            $this->addResult('Campaign JSON files', 'PASS', "{$campaignIds->count()} campaign files verified.");
        } else {
            $this->addResult(
                'Campaign JSON files',
                'FAIL',
                'Missing files for: ' . implode(', ', $missing),
            );
        }
    }

    /**
     * Every non-null conditions JSON must have only known keys.
     *
     * @param \Illuminate\Database\Eloquent\Collection<int, CampaignTimelineAction> $actions
     */
    private function validateConditionSchemas(\Illuminate\Database\Eloquent\Collection $actions): void
    {
        $withConditions = $actions->filter(fn (CampaignTimelineAction $a): bool => ! empty($a->conditions));

        if ($withConditions->isEmpty()) {
            $this->addResult('Condition schemas', 'PASS', 'No actions have conditions.');

            return;
        }

        $invalid = [];

        foreach ($withConditions as $action) {
            $conditions = $action->conditions;

            if (! is_array($conditions)) {
                $invalid[] = "Action {$action->id} (day {$action->day_number}): conditions is not an array";

                continue;
            }

            $unknownKeys = array_diff(array_keys($conditions), self::VALID_CONDITION_KEYS);

            if ($unknownKeys !== []) {
                $timeline = $action->timeline?->slug ?? 'unknown';
                $invalid[] = "Action day {$action->day_number} ({$timeline}): unknown keys [" . implode(', ', $unknownKeys) . ']';
            }
        }

        if ($invalid === []) {
            $this->addResult('Condition schemas', 'PASS', "{$withConditions->count()} conditions validated.");
        } else {
            $this->addResult(
                'Condition schemas',
                'FAIL',
                implode('; ', $invalid),
            );
        }
    }

    /**
     * Every action_type must be in the allowed list.
     *
     * @param \Illuminate\Database\Eloquent\Collection<int, CampaignTimelineAction> $actions
     */
    private function validateActionTypes(\Illuminate\Database\Eloquent\Collection $actions): void
    {
        $actionTypes = $actions->pluck('action_type')->unique();
        $invalid = $actionTypes->diff(self::VALID_ACTION_TYPES);

        if ($invalid->isEmpty()) {
            $this->addResult('Action types', 'PASS', "{$actionTypes->count()} unique action types verified.");
        } else {
            $this->addResult(
                'Action types',
                'FAIL',
                'Invalid action types: ' . $invalid->implode(', '),
            );
        }
    }

    private function addResult(string $check, string $status, string $details): void
    {
        if ($status === 'FAIL') {
            $this->hasFailures = true;
        }

        $this->results[] = [
            'check' => $check,
            'status' => $status,
            'details' => $details,
        ];
    }
}
