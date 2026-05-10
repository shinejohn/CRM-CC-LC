<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CampaignTimeline;
use App\Models\CampaignTimelineAction;
use App\Models\EmailTemplate;

final class ManifestDestinySimulationService
{
    private const ENGAGEMENT_PROFILES = [
        'engaged' => [
            'email_opened' => true,
            'engagement_score' => 60,
            'founder_window_open' => true,
        ],
        'passive' => [
            'email_opened' => false, // resolved per-day below
            'engagement_score' => 25,
            'founder_window_open' => true,
        ],
        'cold' => [
            'email_opened' => false,
            'engagement_score' => 5,
            'founder_window_open' => true,
        ],
    ];

    /**
     * Run a full simulation of a Manifest Destiny timeline.
     *
     * @param  string  $timelineSlug      e.g. 'manifest-destiny-hook'
     * @param  string  $engagementProfile  engaged|passive|cold
     * @param  array<string, string>  $businessOverrides  merge-variable overrides
     * @return array<string, mixed>
     */
    public function simulate(
        string $timelineSlug,
        string $engagementProfile = 'engaged',
        array $businessOverrides = [],
    ): array {
        $timeline = CampaignTimeline::where('slug', $timelineSlug)->firstOrFail();

        $actions = $timeline->actions()->where('is_active', true)->get();

        $profile = self::ENGAGEMENT_PROFILES[$engagementProfile]
            ?? self::ENGAGEMENT_PROFILES['engaged'];

        $mergeVars = $this->buildMergeVars($businessOverrides);

        // Pre-load all templates referenced by these actions (bypass tenant scope)
        $templateSlugs = $actions->pluck('template_type')->filter()->unique()->values()->all();
        $templates = EmailTemplate::withoutGlobalScopes()
            ->whereIn('slug', $templateSlugs)
            ->get()
            ->keyBy('slug');

        // Pre-load all campaign JSON content
        $campaignIds = $actions->pluck('campaign_id')->filter()->unique()->values()->all();
        $campaignContents = $this->loadCampaignContents($campaignIds);

        // Group actions by day
        $actionsByDay = $actions->groupBy('day_number');

        $days = [];
        $summary = [
            'total_days_with_actions' => 0,
            'total_actions' => 0,
            'emails_fired' => 0,
            'emails_skipped' => 0,
            'sms_fired' => 0,
            'engagement_checks' => 0,
            'stage_transitions' => 0,
        ];

        foreach ($actionsByDay as $dayNumber => $dayActions) {
            $dayResult = $this->simulateDay(
                (int) $dayNumber,
                $dayActions,
                $profile,
                $engagementProfile,
                $mergeVars,
                $templates,
                $campaignContents,
                $summary,
            );

            $days[] = $dayResult;
            $summary['total_days_with_actions']++;
        }

        return [
            'timeline' => [
                'name' => $timeline->name,
                'slug' => $timeline->slug,
                'pipeline_stage' => $timeline->pipeline_stage->value,
                'duration_days' => $timeline->duration_days,
            ],
            'business' => [
                'business_name' => $mergeVars['business_name'],
                'community_name' => $mergeVars['community_name'],
                'contact_name' => $mergeVars['customer_name'],
                'city' => $mergeVars['city'],
            ],
            'engagement_profile' => $engagementProfile,
            'days' => $days,
            'summary' => $summary,
        ];
    }

    /**
     * Simulate all actions for a single day.
     *
     * @param  int  $dayNumber
     * @param  \Illuminate\Database\Eloquent\Collection<int, CampaignTimelineAction>  $dayActions
     * @param  array<string, mixed>  $profile
     * @param  string  $engagementProfile
     * @param  array<string, string>  $mergeVars
     * @param  \Illuminate\Database\Eloquent\Collection<int, EmailTemplate>  $templates
     * @param  array<string, array<string, mixed>>  $campaignContents
     * @param  array<string, int>  $summary
     * @return array<string, mixed>
     */
    private function simulateDay(
        int $dayNumber,
        \Illuminate\Database\Eloquent\Collection $dayActions,
        array $profile,
        string $engagementProfile,
        array $mergeVars,
        \Illuminate\Database\Eloquent\Collection $templates,
        array $campaignContents,
        array &$summary,
    ): array {
        $actionResults = [];
        $stageTransition = null;

        foreach ($dayActions as $action) {
            /** @var CampaignTimelineAction $action */
            $summary['total_actions']++;

            $fires = true;
            $skipReason = null;

            // Evaluate conditions
            if (! empty($action->conditions)) {
                [$fires, $skipReason] = $this->evaluateConditions(
                    $action->conditions,
                    $profile,
                    $engagementProfile,
                    $dayNumber,
                );
            }

            // Build template data
            $templateData = null;
            if ($action->template_type !== null && $templates->has($action->template_type)) {
                /** @var EmailTemplate $tpl */
                $tpl = $templates->get($action->template_type);
                $rendered = $tpl->render($mergeVars);

                $bodyPreview = $rendered['text'] !== null
                    ? mb_substr(trim($rendered['text']), 0, 200)
                    : mb_substr(strip_tags($rendered['html'] ?? ''), 0, 200);

                $templateData = [
                    'name' => $tpl->name,
                    'slug' => $tpl->slug,
                    'subject' => $rendered['subject'],
                    'body_preview' => $bodyPreview,
                    'body_html' => $rendered['html'],
                ];
            }

            // Build campaign data
            $campaignData = null;
            if ($action->campaign_id !== null && isset($campaignContents[$action->campaign_id])) {
                $campaignData = $campaignContents[$action->campaign_id];
            }

            // Detect stage transitions
            if ($action->action_type === 'update_stage') {
                $newStage = $action->parameters['new_stage'] ?? null;
                if ($newStage !== null) {
                    $stageTransition = [
                        'from' => $action->timeline?->pipeline_stage->value ?? 'unknown',
                        'to' => $newStage,
                    ];
                    if ($fires) {
                        $summary['stage_transitions']++;
                    }
                }
            }

            // Update summary counters
            if ($action->action_type === 'check_engagement') {
                $summary['engagement_checks']++;
            } elseif ($action->channel === 'email') {
                if ($fires) {
                    $summary['emails_fired']++;
                } else {
                    $summary['emails_skipped']++;
                }
            } elseif ($action->channel === 'sms') {
                if ($fires) {
                    $summary['sms_fired']++;
                }
            }

            $actionResults[] = [
                'action_type' => $action->action_type,
                'channel' => $action->channel,
                'fires' => $fires,
                'skip_reason' => $skipReason,
                'conditions' => $action->conditions,
                'template' => $templateData,
                'campaign' => $campaignData,
            ];
        }

        return [
            'day' => $dayNumber,
            'actions' => $actionResults,
            'stage_transition' => $stageTransition,
        ];
    }

    /**
     * Evaluate action conditions against the simulated engagement profile.
     *
     * @param  array<string, mixed>  $conditions
     * @param  array<string, mixed>  $profile
     * @param  string  $engagementProfile
     * @param  int  $dayNumber
     * @return array{0: bool, 1: string|null}
     */
    private function evaluateConditions(
        array $conditions,
        array $profile,
        string $engagementProfile,
        int $dayNumber,
    ): array {
        $conditionType = $conditions['if'] ?? null;

        if ($conditionType === null) {
            return [true, null];
        }

        switch ($conditionType) {
            case 'email_opened':
                $emailOpened = $this->isEmailOpened($engagementProfile, $dayNumber);
                $then = $conditions['then'] ?? 'proceed';

                if ($then === 'skip' && $emailOpened) {
                    return [false, 'Condition: email_opened=true, then=skip'];
                }
                if ($then === 'proceed' && ! $emailOpened) {
                    return [false, 'Condition: email_opened=false, then=proceed (not met)'];
                }

                return [true, null];

            case 'engagement_score_above':
                $threshold = (int) ($conditions['threshold'] ?? 50);
                $score = (int) $profile['engagement_score'];
                $then = $conditions['then'] ?? 'proceed';

                if ($then === 'skip' && $score >= $threshold) {
                    return [false, "Condition: engagement_score ({$score}) >= threshold ({$threshold}), then=skip"];
                }

                return [true, null];

            case 'founder_window_open':
                $windowOpen = (bool) $profile['founder_window_open'];

                if (! $windowOpen) {
                    return [false, 'Condition: founder_window_open=false'];
                }

                return [true, null];

            default:
                return [true, null];
        }
    }

    /**
     * Determine whether email_opened is true for a given profile and day.
     */
    private function isEmailOpened(string $engagementProfile, int $dayNumber): bool
    {
        return match ($engagementProfile) {
            'engaged' => true,
            'passive' => $dayNumber % 2 !== 0, // odd days = opened
            'cold' => false,
            default => false,
        };
    }

    /**
     * Build the default merge variables with optional overrides.
     *
     * @param  array<string, string>  $overrides
     * @return array<string, string>
     */
    private function buildMergeVars(array $overrides): array
    {
        return [
            'business_name' => $overrides['business_name'] ?? 'Acme Coffee Shop',
            'community_name' => $overrides['community_name'] ?? 'Springfield',
            'customer_name' => $overrides['contact_name'] ?? 'Jane Doe',
            'city' => $overrides['city'] ?? 'Springfield',
            'listing_url' => 'https://day.news/springfield/acme-coffee-shop',
            'founder_days_remaining' => '47',
            'first_name' => $overrides['first_name'] ?? 'Jane',
        ];
    }

    /**
     * Load campaign JSON content files for a list of campaign IDs.
     *
     * @param  list<string>  $campaignIds
     * @return array<string, array<string, mixed>>
     */
    private function loadCampaignContents(array $campaignIds): array
    {
        $contents = [];
        $contentPath = base_path('/../content');

        foreach ($campaignIds as $campaignId) {
            $filePath = $contentPath . '/campaign_' . $campaignId . '_complete.json';

            if (! file_exists($filePath)) {
                continue;
            }

            $raw = file_get_contents($filePath);

            if ($raw === false) {
                continue;
            }

            /** @var array<string, mixed>|null $decoded */
            $decoded = json_decode($raw, true);

            if ($decoded === null) {
                continue;
            }

            $campaign = $decoded['campaign'] ?? [];
            $landingPage = $decoded['landing_page'] ?? [];
            $slides = $decoded['slides'] ?? [];

            $contents[$campaignId] = [
                'id' => $campaign['id'] ?? $campaignId,
                'title' => $campaign['title'] ?? '',
                'landing_page_slug' => $landingPage['landing_page_slug'] ?? '',
                'slide_count' => count($slides),
                'slides' => $slides,
                'cta_primary' => $landingPage['primary_cta'] ?? null,
            ];
        }

        return $contents;
    }
}
