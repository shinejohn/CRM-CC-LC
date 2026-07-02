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

    /**
     * tries=1: with ~10.5K communities each making a synchronous PP HTTP call, a mid-run
     * failure previously retried from community #1 and never finished. The per-community
     * try/catch below isolates failures, and every write is an idempotent updateOrCreate,
     * so we don't need whole-job retries. Runs on the maintenance queue (generous timeout).
     */
    public int $tries = 1;

    public int $backoff = 60;

    /** Long-running full sweep of every launched community — runs on the maintenance queue. */
    public function __construct()
    {
        $this->onQueue('maintenance');
    }

    /**
     * 2h ceiling for the full sweep of ~10.5K communities (one PP HTTP call each).
     * If the sweep ever outgrows this, lower MAX_COMMUNITIES_PER_RUN below.
     */
    public int $timeout = 7200;

    /**
     * Safety cap on communities processed per run (0 = no cap, process all).
     * Because writes are idempotent (updateOrCreate keyed on occurred_at=startOfDay),
     * a capped/interrupted run is safely re-run without duplicating data.
     */
    private const MAX_COMMUNITIES_PER_RUN = 0;

    public function handle(PublishingPlatformService $publishingService): void
    {
        $month = now()->format('Y-m');
        $runDay = now()->startOfDay();

        $totalEvents = 0;
        $failedCommunities = 0;
        $processedCommunities = 0;

        // chunkById (not ->get()): streams communities in id order without loading all 10.5K
        // rows into memory, and is stable/resumable across the long-running sweep.
        Community::whereNotNull('launched_at')
            ->orderBy('id')
            ->chunkById(200, function ($communities) use (
                $publishingService,
                $month,
                $runDay,
                &$totalEvents,
                &$failedCommunities,
                &$processedCommunities
            ) {
                foreach ($communities as $community) {
                    if (self::MAX_COMMUNITIES_PER_RUN > 0
                        && $processedCommunities >= self::MAX_COMMUNITIES_PER_RUN) {
                        return false; // stop the chunk loop; remaining communities picked up next run
                    }

                    $processedCommunities++;

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

                            // Idempotent upsert: one analytics event per business per day.
                            AnalyticsEvent::updateOrCreate(
                                [
                                    'event_type' => 'readership_sync',
                                    'smb_id' => $smbId,
                                    'community_id' => $community->id,
                                    'occurred_at' => $runDay,
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

                return true;
            });

        if ($processedCommunities === 0) {
            Log::info('ReadershipSync: no launched communities found');

            return;
        }

        Log::info('ReadershipSync: completed', [
            'communities_processed' => $processedCommunities - $failedCommunities,
            'communities_failed' => $failedCommunities,
            'events_upserted' => $totalEvents,
            'month' => $month,
        ]);
    }
}
