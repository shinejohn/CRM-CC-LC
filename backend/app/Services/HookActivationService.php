<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CampaignTimeline;
use App\Models\Community;
use App\Models\Customer;
use App\Models\SMB;
use Illuminate\Support\Facades\Log;

/**
 * The Hook activation pipeline.
 *
 * When a business enters The Hook (free trial), this service automatically:
 *  1. Generates an intro article via AI
 *  2. Publishes the article to Day.News
 *  3. Creates listings on all publishing platforms (DTG, GEC, AlphaSite)
 *  4. Creates an event listing if the business has events
 *  5. Schedules a newsletter feature
 *  6. Activates an AlphaSite trial (90 days)
 *  7. Starts the hook campaign timeline
 *  8. Updates customer status
 *
 * Entry points:
 *  - Pitch engine when a business completes the free-trial path
 *  - CampaignActionExecutor when a timeline action triggers Hook activation
 *  - CC dashboard for manual activation
 */
final class HookActivationService
{
    public function __construct(
        private readonly ContentGenerationService $contentService,
        private readonly PublishingPlatformService $publishingService,
        private readonly CampaignOrchestratorService $orchestrator,
    ) {}

    /**
     * Activate The Hook for a business.
     *
     * @return array{steps: list<array{step: string, status: string, data?: array<string, mixed>, error?: string}>, errors: list<string>}
     */
    public function activate(Customer $customer, SMB $smb, Community $community): array
    {
        $steps = [];
        $errors = [];

        $businessName = $smb->business_name ?? $customer->business_name ?? 'Local Business';
        $tenantId = (string) config('fibonacco.system_tenant_id', '00000000-0000-0000-0000-000000000001');

        Log::info('HookActivation: starting', [
            'customer_id' => $customer->id,
            'smb_id' => $smb->id,
            'community_id' => $community->id,
            'business_name' => $businessName,
        ]);

        // ── 1. Generate intro article ────────────────────────────
        try {
            $article = $this->contentService->generate($tenantId, 'article', [
                'title' => "Meet {$businessName}: A Local Business Worth Knowing",
                'topic' => "An introductory feature about {$businessName}, a {$smb->category_group} business in {$community->name}",
                'business_name' => $businessName,
                'category' => $smb->category_group ?? 'local business',
                'location' => $community->name ?? '',
                'description' => $smb->description ?? "A local business serving the {$community->name} community",
            ]);

            $steps[] = ['step' => 'generate_article', 'status' => 'completed', 'data' => [
                'content_id' => $article->id,
                'title' => $article->title,
            ]];

            // ── 2. Publish article to Day.News ───────────────────
            try {
                $publishResult = $this->publishingService->publishArticle([
                    'title' => $article->title,
                    'content' => $article->content,
                    'excerpt' => $article->excerpt ?? '',
                    'business_name' => $businessName,
                    'community_id' => $community->id,
                    'author_name' => 'Day.News Editorial',
                    'category' => $smb->category_group ?? 'local-business',
                    'metadata' => [
                        'source' => 'hook_activation',
                        'customer_id' => $customer->id,
                        'generated_content_id' => $article->id,
                    ],
                ]);

                $steps[] = ['step' => 'publish_article', 'status' => 'completed', 'data' => $publishResult];
            } catch (\Throwable $e) {
                $errors[] = "Article publish failed: {$e->getMessage()}";
                $steps[] = ['step' => 'publish_article', 'status' => 'failed', 'error' => $e->getMessage()];
            }
        } catch (\Throwable $e) {
            $errors[] = "Article generation failed: {$e->getMessage()}";
            $steps[] = ['step' => 'generate_article', 'status' => 'failed', 'error' => $e->getMessage()];
        }

        // ── 3. Create listings on all platforms ──────────────────
        $listingData = [
            'business_name' => $businessName,
            'community_id' => $community->id,
            'external_id' => $customer->external_id ?? $customer->id,
            'category' => $smb->category_group ?? 'general',
            'description' => $smb->description ?? '',
            'address' => $smb->address ?? '',
            'city' => $smb->city ?? $community->name ?? '',
            'state' => $smb->state ?? $community->state ?? '',
            'phone' => $smb->phone ?? $customer->phone ?? '',
            'email' => $customer->email ?? '',
            'website' => $smb->website ?? '',
        ];

        foreach (['dtg', 'gec', 'alphasite'] as $platform) {
            try {
                $result = $this->publishingService->createListing(array_merge($listingData, [
                    'platform' => $platform,
                ]));
                $steps[] = ['step' => "create_listing_{$platform}", 'status' => 'completed', 'data' => $result];
            } catch (\Throwable $e) {
                $errors[] = "Listing ({$platform}) failed: {$e->getMessage()}";
                $steps[] = ['step' => "create_listing_{$platform}", 'status' => 'failed', 'error' => $e->getMessage()];
            }
        }

        // ── 4. Create event listing (if business has events) ─────
        if ($smb->has_events ?? false) {
            try {
                $eventResult = $this->publishingService->createEvent([
                    'title' => "Welcome to {$businessName} — Community Open House",
                    'description' => "{$businessName} is joining the {$community->name} community on Day.News. Stop by to say hello!",
                    'community_id' => $community->id,
                    'business_name' => $businessName,
                    'external_id' => $customer->external_id ?? $customer->id,
                    'event_date' => now()->addDays(14)->toDateString(),
                    'category' => 'community',
                    'metadata' => ['source' => 'hook_activation'],
                ]);
                $steps[] = ['step' => 'create_event', 'status' => 'completed', 'data' => $eventResult];
            } catch (\Throwable $e) {
                $errors[] = "Event creation failed: {$e->getMessage()}";
                $steps[] = ['step' => 'create_event', 'status' => 'failed', 'error' => $e->getMessage()];
            }
        }

        // ── 5. Schedule newsletter feature ──────────────────���────
        try {
            $newsletterResult = $this->publishingService->featureInNewsletter([
                'business_name' => $businessName,
                'community_id' => $community->id,
                'external_id' => $customer->external_id ?? $customer->id,
                'headline' => "New to {$community->name}: {$businessName}",
                'body' => $smb->description ?? "Welcome {$businessName} to our community platform!",
                'cta_url' => $smb->website ?? '',
                'cta_text' => "Visit {$businessName}",
                'priority' => 'normal',
            ]);
            $steps[] = ['step' => 'newsletter_feature', 'status' => 'completed', 'data' => $newsletterResult];
        } catch (\Throwable $e) {
            $errors[] = "Newsletter feature failed: {$e->getMessage()}";
            $steps[] = ['step' => 'newsletter_feature', 'status' => 'failed', 'error' => $e->getMessage()];
        }

        // ── 6. Activate AlphaSite trial (90 days) ────────────────
        try {
            $alphaResult = $this->publishingService->activateAlphaSite([
                'business_name' => $businessName,
                'community_id' => $community->id,
                'external_id' => $customer->external_id ?? $customer->id,
                'email' => $customer->email ?? '',
                'tier' => 'trial',
                'trial_days' => 90,
            ]);
            $steps[] = ['step' => 'activate_alphasite_trial', 'status' => 'completed', 'data' => $alphaResult];
        } catch (\Throwable $e) {
            $errors[] = "AlphaSite trial failed: {$e->getMessage()}";
            $steps[] = ['step' => 'activate_alphasite_trial', 'status' => 'failed', 'error' => $e->getMessage()];
        }

        // ── 7. Start hook campaign timeline ────────────��─────────
        try {
            $hookTimeline = CampaignTimeline::where('slug', 'manifest-destiny-hook')
                ->where('is_active', true)
                ->first();

            if ($hookTimeline) {
                $this->orchestrator->startTimeline($customer, $hookTimeline);
                $steps[] = ['step' => 'start_hook_timeline', 'status' => 'completed', 'data' => [
                    'timeline' => $hookTimeline->slug,
                    'duration_days' => $hookTimeline->duration_days,
                ]];
            } else {
                $errors[] = 'Hook timeline not seeded';
                $steps[] = ['step' => 'start_hook_timeline', 'status' => 'failed', 'error' => 'Timeline not found'];
            }
        } catch (\Throwable $e) {
            $errors[] = "Timeline start failed: {$e->getMessage()}";
            $steps[] = ['step' => 'start_hook_timeline', 'status' => 'failed', 'error' => $e->getMessage()];
        }

        // ── 8. Update customer status ────────────────────────────
        $customer->update([
            'subscription_tier' => 'trial',
            'campaign_status' => 'running',
            'manifest_destiny_day' => 1,
            'manifest_destiny_start_date' => now(),
        ]);

        $smb->update([
            'pitch_status' => 'hook_active',
            'campaign_status' => 'running',
            'manifest_destiny_day' => 1,
            'manifest_destiny_start_date' => now(),
        ]);

        $completedCount = collect($steps)->where('status', 'completed')->count();
        $failedCount = collect($steps)->where('status', 'failed')->count();

        Log::info('HookActivation: completed', [
            'customer_id' => $customer->id,
            'steps_completed' => $completedCount,
            'steps_failed' => $failedCount,
            'errors' => $errors,
        ]);

        return ['steps' => $steps, 'errors' => $errors];
    }
}
