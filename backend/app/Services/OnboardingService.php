<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Customer;
use App\Models\OnboardingProgress;
use Illuminate\Support\Collection;

/**
 * Post-purchase onboarding checklist service.
 *
 * Defines the default set of onboarding steps a customer works through after
 * purchasing, and provides read/write helpers backed by the
 * `onboarding_progress` table (one row per customer+step).
 */
final class OnboardingService
{
    /**
     * The default onboarding step definitions.
     *
     * Each entry: key => [label, cta_route]. The cta_route is a frontend
     * (React Router) path the checklist links to so the customer can act on
     * the step. Steps are intentionally simple/static for now; see
     * {@see self::stepsFor()} for how they may be varied per customer.
     *
     * @return array<string, array{label: string, cta_route: string}>
     */
    public function defaultSteps(): array
    {
        return [
            'complete_profile' => [
                'label' => 'Complete your business profile',
                'cta_route' => '/command-center/define/profile',
            ],
            'upload_logo' => [
                'label' => 'Upload your logo and brand assets',
                'cta_route' => '/command-center/define/profile',
            ],
            'review_listing' => [
                'label' => 'Review your business listing',
                'cta_route' => '/command-center/define',
            ],
            'watch_intro' => [
                'label' => 'Watch the getting-started intro',
                'cta_route' => '/command-center/learn',
            ],
            'schedule_kickoff' => [
                'label' => 'Schedule your kickoff call',
                'cta_route' => '/command-center/sell/activities',
            ],
        ];
    }

    /**
     * The ordered step definitions for a given customer.
     *
     * Kept deliberately simple: today every customer receives the full default
     * set. The signature accepts the Customer so the step set can later be
     * varied by package / subscription_tier / pipeline_stage without changing
     * callers (e.g. additional steps for higher tiers).
     *
     * @return array<string, array{label: string, cta_route: string}>
     */
    public function stepsFor(Customer $customer): array
    {
        // Placeholder for future per-package variation. For now, identical for all.
        return $this->defaultSteps();
    }

    /**
     * Create the onboarding step rows for a customer.
     *
     * Idempotent: uses firstOrCreate keyed on (customer_id, step) so calling it
     * repeatedly (e.g. from a webhook that may retry) never duplicates rows and
     * never resets completion state on existing rows.
     */
    public function seedFor(Customer $customer): void
    {
        foreach (array_keys($this->stepsFor($customer)) as $step) {
            OnboardingProgress::firstOrCreate(
                ['customer_id' => $customer->id, 'step' => $step],
                ['completed_at' => null],
            );
        }
    }

    /**
     * Get the existing progress rows for a customer, keyed by step.
     *
     * @return Collection<string, OnboardingProgress>
     */
    public function progressFor(Customer $customer): Collection
    {
        return OnboardingProgress::query()
            ->where('customer_id', $customer->id)
            ->get()
            ->keyBy('step');
    }

    /**
     * Mark a step complete for a customer. Idempotent.
     *
     * Returns the persisted progress row, or null if the step key is not part
     * of this customer's step set.
     */
    public function markComplete(Customer $customer, string $step): ?OnboardingProgress
    {
        if (! array_key_exists($step, $this->stepsFor($customer))) {
            return null;
        }

        $progress = OnboardingProgress::firstOrCreate(
            ['customer_id' => $customer->id, 'step' => $step],
            ['completed_at' => null],
        );

        if ($progress->completed_at === null) {
            $progress->update(['completed_at' => now()]);
        }

        return $progress;
    }

    /**
     * Build the API-shaped checklist payload for a customer.
     *
     * @return array{
     *     steps: array<int, array{key: string, label: string, cta_route: string, completed: bool, completed_at: ?string}>,
     *     complete: bool,
     *     percent: int
     * }
     */
    public function summaryFor(Customer $customer): array
    {
        $definitions = $this->stepsFor($customer);
        $progress = $this->progressFor($customer);

        $steps = [];
        $completedCount = 0;

        foreach ($definitions as $key => $definition) {
            $row = $progress->get($key);
            $completed = $row !== null && $row->completed_at !== null;

            if ($completed) {
                $completedCount++;
            }

            $steps[] = [
                'key' => $key,
                'label' => $definition['label'],
                'cta_route' => $definition['cta_route'],
                'completed' => $completed,
                'completed_at' => $row?->completed_at?->toIso8601String(),
            ];
        }

        $total = count($definitions);
        $percent = $total > 0 ? (int) round(($completedCount / $total) * 100) : 0;

        return [
            'steps' => $steps,
            'complete' => $total > 0 && $completedCount === $total,
            'percent' => $percent,
        ];
    }
}
