<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\PipelineStage;
use App\Models\CampaignTimeline;
use App\Models\CampaignTimelineAction;
use App\Models\Community;
use App\Models\Customer;
use App\Models\CustomerTimelineProgress;
use App\Models\EmailTemplate;
use App\Models\OutboundCampaign;
use Illuminate\Console\Command;

/**
 * Dry-run simulation of the full Florida campaign pipeline.
 *
 * Checks every component in the email campaign flow without sending
 * anything. Outputs a report showing what works, what's missing, and
 * what would happen if you ran it for real.
 *
 * Usage: php artisan simulate:florida-campaign
 */
final class SimulateFloridaCampaign extends Command
{
    protected $signature = 'simulate:florida-campaign
        {--state=FL : State to simulate}
        {--save : Save results to docs/simulation-runs/}';

    protected $description = 'Dry-run simulation of the full campaign pipeline for a state';

    public function handle(): int
    {
        $state = strtoupper((string) $this->option('state'));
        $results = [];

        $this->info("=== Campaign Pipeline Simulation — {$state} ===");
        $this->newLine();

        // 1. Data Layer
        $this->info('1. DATA LAYER');
        $communities = Community::where('state', $state)->get();
        $communityCount = $communities->count();
        $results['communities'] = $communityCount;
        $this->line("   Communities in {$state}: {$communityCount}");

        $customerQuery = Customer::withoutGlobalScopes()->where('state', $state);
        $totalCustomers = (clone $customerQuery)->count();
        $results['total_customers'] = $totalCustomers;
        $this->line("   Total customers in {$state}: {$totalCustomers}");

        $emailableCount = (clone $customerQuery)
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->where('email_opted_in', true)
            ->where('do_not_contact', false)
            ->count();
        $results['emailable_customers'] = $emailableCount;
        $this->line("   Emailable customers: {$emailableCount}");

        $suppressedCount = (clone $customerQuery)->where('email_suppressed', true)->count();
        $results['suppressed'] = $suppressedCount;
        $this->line("   Suppressed (ZeroBounce): {$suppressedCount}");

        $byStage = (clone $customerQuery)
            ->selectRaw("pipeline_stage, count(*) as cnt")
            ->groupBy('pipeline_stage')
            ->pluck('cnt', 'pipeline_stage')
            ->toArray();
        $results['by_stage'] = $byStage;
        if (! empty($byStage)) {
            $this->line("   By pipeline stage:");
            foreach ($byStage as $stage => $count) {
                $this->line("     {$stage}: {$count}");
            }
        }

        $this->statusLine($totalCustomers > 0, 'Customer data populated');
        $this->newLine();

        // 2. Campaign Timelines
        $this->info('2. CAMPAIGN TIMELINES');
        $hookTimeline = CampaignTimeline::where('pipeline_stage', PipelineStage::HOOK)
            ->where('is_active', true)
            ->first();
        $results['hook_timeline'] = $hookTimeline !== null;
        $this->statusLine($hookTimeline !== null, 'Hook timeline exists');

        if ($hookTimeline) {
            $actionCount = $hookTimeline->actions()->count();
            $results['hook_actions'] = $actionCount;
            $this->line("   Actions: {$actionCount} across {$hookTimeline->duration_days} days");

            $day1Actions = $hookTimeline->getActionsForDay(1);
            $this->line("   Day 1 actions: " . $day1Actions->count());
            foreach ($day1Actions as $action) {
                $this->line("     - {$action->action_type}: {$action->template_type}");
            }
        }

        $totalTimelines = CampaignTimeline::where('is_active', true)->count();
        $results['total_timelines'] = $totalTimelines;
        $this->line("   Total active timelines: {$totalTimelines}");
        $this->newLine();

        // 3. Email Templates
        $this->info('3. EMAIL TEMPLATES');
        $templateCount = EmailTemplate::withoutGlobalScopes()->where('is_active', true)->count();
        $results['templates'] = $templateCount;
        $this->statusLine($templateCount >= 20, "Email templates: {$templateCount}");

        // Check specific critical templates
        $criticalTemplates = [
            'welcome_community_launch',
            'your_business_featured',
            'hook_post_event',
            'hook_create_coupon',
        ];
        foreach ($criticalTemplates as $slug) {
            $exists = EmailTemplate::withoutGlobalScopes()
                ->where('slug', $slug)
                ->where('is_active', true)
                ->exists();
            $results["template_{$slug}"] = $exists;
            $this->statusLine($exists, "  Template: {$slug}");
        }
        $this->newLine();

        // 4. Timeline Enrollment
        $this->info('4. TIMELINE ENROLLMENT');
        $enrolledCount = CustomerTimelineProgress::where('status', 'active')->count();
        $results['enrolled'] = $enrolledCount;
        $this->line("   Customers on active timelines: {$enrolledCount}");

        if ($hookTimeline) {
            $hookEnrolled = CustomerTimelineProgress::where('campaign_timeline_id', $hookTimeline->id)
                ->where('status', 'active')
                ->count();
            $results['hook_enrolled'] = $hookEnrolled;
            $this->line("   On Hook timeline: {$hookEnrolled}");

            $notEnrolled = $emailableCount - $hookEnrolled;
            if ($notEnrolled > 0) {
                $this->warn("   {$notEnrolled} emailable customers NOT yet enrolled");
            }
        }
        $this->statusLine($enrolledCount > 0, 'Customers enrolled on timelines');
        $this->newLine();

        // 5. Email Send Simulation
        $this->info('5. EMAIL SEND SIMULATION (Day 1)');
        if ($hookTimeline && $emailableCount > 0) {
            $day1 = $hookTimeline->getActionsForDay(1)
                ->where('action_type', 'send_email')
                ->first();

            if ($day1) {
                $template = EmailTemplate::withoutGlobalScopes()
                    ->where('slug', $day1->template_type)
                    ->where('is_active', true)
                    ->first();

                if ($template) {
                    $sampleCustomer = Customer::withoutGlobalScopes()
                        ->where('state', $state)
                        ->whereNotNull('email')
                        ->first();

                    if ($sampleCustomer) {
                        $sampleCustomer->loadMissing('community');
                        $community = $sampleCustomer->community;
                        $baseUrl = rtrim((string) config('app.url'), '/');

                        $vars = [
                            'business_name' => (string) ($sampleCustomer->business_name ?? 'Sample Business'),
                            'community_name' => (string) ($community->name ?? 'Day.News'),
                            'founder_days_remaining' => '82',
                            'city' => (string) ($sampleCustomer->city ?? ''),
                            'listing_url' => $baseUrl . '/business/' . ($sampleCustomer->slug ?? 'sample'),
                            'customer_name' => (string) ($sampleCustomer->owner_name ?? $sampleCustomer->business_name ?? 'Customer'),
                            'unsubscribe_url' => $baseUrl . '/unsubscribe?id=' . $sampleCustomer->id,
                        ];

                        $rendered = $template->render($vars);
                        $this->line("   Template: {$template->slug}");
                        $this->line("   Subject: {$rendered['subject']}");
                        $this->line("   To: {$sampleCustomer->email}");
                        $this->line("   Business: {$sampleCustomer->business_name}");
                        $hasUnsub = str_contains($rendered['html'], 'unsubscribe') || str_contains($rendered['html'], 'Unsubscribe');
                        $this->statusLine($hasUnsub, '  Has unsubscribe link');
                        $results['sample_rendered'] = true;
                        $results['has_unsubscribe'] = $hasUnsub;
                    }
                } else {
                    $this->error("   Template '{$day1->template_type}' NOT FOUND");
                    $results['sample_rendered'] = false;
                }
            }
        } else {
            $this->warn('   Skipped — no timeline or no customers');
            $results['sample_rendered'] = false;
        }
        $this->newLine();

        // 6. Outbound Campaign History
        $this->info('6. CAMPAIGN HISTORY');
        $campaignCount = OutboundCampaign::withoutGlobalScopes()->count();
        $results['total_campaigns_sent'] = $campaignCount;
        $this->line("   Total outbound campaigns: {$campaignCount}");

        $recent = OutboundCampaign::withoutGlobalScopes()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['name', 'status', 'total_recipients', 'sent_count', 'opened_count', 'created_at']);

        if ($recent->isNotEmpty()) {
            $rows = $recent->map(fn ($c) => [
                $c->name,
                $c->status,
                $c->total_recipients ?? 0,
                $c->sent_count ?? 0,
                $c->opened_count ?? 0,
                $c->created_at?->format('Y-m-d H:i') ?? '',
            ])->toArray();
            $this->table(['Campaign', 'Status', 'Recipients', 'Sent', 'Opened', 'Created'], $rows);
        }
        $this->newLine();

        // 7. Config Check
        $this->info('7. CONFIGURATION');
        $postalConfigured = ! empty(config('services.postal.api_url')) && ! empty(config('services.postal.server_key'));
        $this->statusLine($postalConfigured, 'Postal API configured');
        $results['postal_configured'] = $postalConfigured;

        $zbConfigured = ! empty(config('services.zerobounce.api_key'));
        $this->statusLine($zbConfigured, 'ZeroBounce API configured');
        $results['zerobounce_configured'] = $zbConfigured;

        $queueDriver = config('queue.default');
        $this->line("   Queue driver: {$queueDriver}");
        $results['queue_driver'] = $queueDriver;
        $this->newLine();

        // Summary
        $this->info('=== SUMMARY ===');
        $blockers = [];
        if ($totalCustomers === 0) {
            $blockers[] = 'No customers — run: php artisan sync:from-publishing-platform';
        }
        if (! $hookTimeline) {
            $blockers[] = 'No timeline — run: php artisan db:seed --class=ManifestDestinyTimelineSeeder';
        }
        if ($templateCount < 20) {
            $blockers[] = 'Missing templates — run: php artisan db:seed --class=ManifestDestinyEmailTemplateSeeder';
        }
        if ($enrolledCount === 0 && $totalCustomers > 0) {
            $blockers[] = 'No enrollments — run: php artisan campaign:start-customers --state=' . $state;
        }

        if (empty($blockers)) {
            $this->info('All systems GO. Ready to send.');
        } else {
            $this->warn('Blockers remaining:');
            foreach ($blockers as $i => $b) {
                $this->line('  ' . ($i + 1) . '. ' . $b);
            }
        }

        // Save results
        if ($this->option('save')) {
            $runNumber = $this->getNextRunNumber();
            $filename = sprintf('%03d-florida-campaign-%s.md', $runNumber, now()->format('Y-m-d'));
            $path = base_path("../docs/simulation-runs/{$filename}");
            $this->saveResults($path, $state, $results, $blockers);
            $this->info("Results saved to docs/simulation-runs/{$filename}");
        }

        return empty($blockers) ? self::SUCCESS : self::FAILURE;
    }

    private function statusLine(bool $ok, string $label): void
    {
        $icon = $ok ? '<fg=green>PASS</>' : '<fg=red>FAIL</>';
        $this->line("   [{$icon}] {$label}");
    }

    private function getNextRunNumber(): int
    {
        $dir = base_path('../docs/simulation-runs');
        if (! is_dir($dir)) {
            return 2; // #1 was manual
        }
        $files = glob($dir . '/*.md');
        $max = 1;
        foreach ($files as $f) {
            if (preg_match('/^(\d{3})-/', basename($f), $m)) {
                $max = max($max, (int) $m[1]);
            }
        }

        return $max + 1;
    }

    private function saveResults(string $path, string $state, array $results, array $blockers): void
    {
        $dir = dirname($path);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $content = "# Simulation Run — {$state} Campaign\n";
        $content .= "**Date:** " . now()->format('Y-m-d H:i') . "\n";
        $content .= "**State:** {$state}\n\n";

        $content .= "## Results\n\n";
        $content .= "| Metric | Value |\n|--------|-------|\n";
        foreach ($results as $key => $value) {
            if (is_array($value)) {
                $value = json_encode($value);
            } elseif (is_bool($value)) {
                $value = $value ? 'YES' : 'NO';
            }
            $content .= "| {$key} | {$value} |\n";
        }

        $content .= "\n## Blockers\n\n";
        if (empty($blockers)) {
            $content .= "None — all systems GO.\n";
        } else {
            foreach ($blockers as $i => $b) {
                $content .= ($i + 1) . ". {$b}\n";
            }
        }

        file_put_contents($path, $content);
    }
}
