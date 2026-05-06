<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\AnalyticsEvent;
use App\Models\Community;
use App\Models\Customer;
use App\Services\PublishingPlatformService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Nightly job that pulls readership/impression data from the Publishing Platform
 * for every active community and stores it as AnalyticsEvent records.
 *
 * This feeds the SubscriberROIService with real data instead of empty arrays.
 *
 * Scheduled in Kernel.php: ->dailyAt('01:00')
 */
final class ReadershipSyncJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function handle(PublishingPlatformService $publishingService): void
    {
        $month = now()->format('Y-m');

        $communities = Community::whereNotNull('launched_at')->get();

        if ($communities->isEmpty()) {
            Log::info('ReadershipSync: no launched communities found');

            return;
        }

        $totalEvents = 0;
        $failedCommunities = 0;

        foreach ($communities as $community) {
            try {
                $data = $publishingService->reportReadership($community->id, $month);

                if (empty($data) || isset($data['error'])) {
                    Log::warning('ReadershipSync: empty or error response', [
                        'community_id' => $community->id,
                        'response' => $data,
                    ]);
                    $failedCommunities++;

                    continue;
                }

                $businesses = $data['data'] ?? $data['businesses'] ?? $data;

                if (! is_array($businesses)) {
                    continue;
                }

                foreach ($businesses as $businessMetrics) {
                    if (! is_array($businessMetrics)) {
                        continue;
                    }

                    $externalId = $businessMetrics['external_id']
                        ?? $businessMetrics['business_id']
                        ?? null;

                    if (! $externalId) {
                        continue;
                    }

                    // Resolve SMB ID from external_id
                    $customer = Customer::withoutGlobalScopes()
                        ->where('external_id', $externalId)
                        ->where('community_id', $community->id)
                        ->first();

                    $smbId = $customer?->smb_id;

                    // Upsert an analytics event per business per day
                    AnalyticsEvent::updateOrCreate(
                        [
                            'event_type' => 'readership_sync',
                            'smb_id' => $smbId,
                            'community_id' => $community->id,
                            'occurred_at' => now()->startOfDay(),
                        ],
                        [
                            'event_category' => 'publishing_platform',
                            'properties' => [
                                'external_id' => $externalId,
                                'month' => $month,
                                'article_views' => $businessMetrics['article_views'] ?? 0,
                                'listing_views' => $businessMetrics['listing_views'] ?? 0,
                                'event_views' => $businessMetrics['event_views'] ?? 0,
                                'newsletter_clicks' => $businessMetrics['newsletter_clicks'] ?? 0,
                                'social_impressions' => $businessMetrics['social_impressions'] ?? 0,
                                'profile_views' => $businessMetrics['profile_views'] ?? 0,
                                'search_appearances' => $businessMetrics['search_appearances'] ?? 0,
                                'website_clicks' => $businessMetrics['website_clicks'] ?? 0,
                                'coupon_claims' => $businessMetrics['coupon_claims'] ?? 0,
                                'ad_impressions' => $businessMetrics['ad_impressions'] ?? 0,
                                'ad_clicks' => $businessMetrics['ad_clicks'] ?? 0,
                            ],
                        ]
                    );

                    $totalEvents++;
                }
            } catch (\Throwable $e) {
                Log::error('ReadershipSync: failed for community', [
                    'community_id' => $community->id,
                    'error' => $e->getMessage(),
                ]);
                $failedCommunities++;
            }
        }

        Log::info('ReadershipSync: completed', [
            'communities_processed' => $communities->count() - $failedCommunities,
            'communities_failed' => $failedCommunities,
            'events_upserted' => $totalEvents,
            'month' => $month,
        ]);
    }
}
