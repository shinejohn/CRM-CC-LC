<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CampaignRecipient;
use App\Models\CommunitySubscription;
use App\Models\Customer;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

final class SubscriberROIService
{
    /**
     * @return array<string, mixed>
     */
    public function generateReport(Customer $customer, string $yearMonth): array
    {
        $subscription = CommunitySubscription::query()
            ->where('customer_id', $customer->id)
            ->where('status', 'active')
            ->first();

        if (! $subscription) {
            return ['error' => 'No active subscription'];
        }

        if (! preg_match('/^\d{4}-\d{2}$/', $yearMonth)) {
            return ['error' => 'Invalid month format; use YYYY-MM'];
        }

        $billingData = $this->getBillingData($customer, $subscription, $yearMonth);
        $engagementData = $this->getEngagementData($customer);
        $campaignData = $this->getCampaignData($customer, $yearMonth);

        $externalId = $customer->external_id ?? '';
        $communityId = (string) $subscription->community_id;
        $publishingData = $externalId !== ''
            ? $this->getPublishingData($externalId, $communityId, $yearMonth)
            : [];

        $monthsActive = 0;
        if ($subscription->commitment_starts_at) {
            $monthsActive = max(0, (int) $subscription->commitment_starts_at->diffInMonths(now())) + 1;
        }

        return [
            'customer_id' => $customer->id,
            'business_name' => $customer->business_name,
            'month' => $yearMonth,
            'billing' => $billingData,
            'subscription' => [
                'tier' => $subscription->tier,
                'monthly_rate' => (float) $subscription->monthly_rate,
                'is_founder_pricing' => $subscription->is_founder_pricing,
                'months_active' => $monthsActive,
            ],
            'content_delivery' => [
                'story_mentions' => $publishingData['story_mentions'] ?? 0,
                'story_mention_target' => $publishingData['story_mention_target'] ?? 17,
                'articles_featuring_business' => $publishingData['articles_count'] ?? 0,
            ],
            'advertising' => [
                'ad_impressions' => $publishingData['ad_impressions'] ?? 0,
                'ad_clicks' => $publishingData['ad_clicks'] ?? 0,
                'ad_ctr' => $publishingData['ad_ctr'] ?? 0,
                'newsletter_impressions' => $publishingData['newsletter_impressions'] ?? 0,
            ],
            'listing_performance' => [
                'profile_views' => $publishingData['profile_views'] ?? 0,
                'search_appearances' => $publishingData['search_appearances'] ?? 0,
                'website_clicks' => $publishingData['website_clicks'] ?? 0,
                'phone_clicks' => $publishingData['phone_clicks'] ?? 0,
                'direction_requests' => $publishingData['direction_requests'] ?? 0,
            ],
            'commerce' => [
                'coupons_created' => $publishingData['coupons_created'] ?? 0,
                'coupons_claimed' => $publishingData['coupons_claimed'] ?? 0,
                'coupon_redemptions' => $publishingData['coupon_redemptions'] ?? 0,
                'events_promoted' => $publishingData['events_promoted'] ?? 0,
                'tickets_sold' => $publishingData['tickets_sold'] ?? 0,
            ],
            'engagement' => [
                ...$engagementData,
                'emails_sent' => $campaignData['emails_sent'],
                'emails_opened' => $campaignData['emails_opened'],
                'email_open_rate' => $campaignData['email_open_rate'],
            ],
            'estimated_value' => $this->calculateEstimatedValue($publishingData),
        ];
    }

    /**
     * Rolling 12-month snapshots (compact) plus month-over-month trends for key metrics.
     *
     * @return array<string, mixed>
     */
    public function generateSummary(Customer $customer): array
    {
        $subscription = CommunitySubscription::query()
            ->where('customer_id', $customer->id)
            ->where('status', 'active')
            ->first();

        if (! $subscription) {
            return ['error' => 'No active subscription'];
        }

        $months = [];
        $cursor = now()->startOfMonth();

        for ($i = 0; $i < 12; $i++) {
            $ym = $cursor->format('Y-m');
            $report = $this->generateReport($customer, $ym);
            if (! isset($report['error'])) {
                $months[] = [
                    'month' => $ym,
                    'estimated_value_total' => $report['estimated_value']['total_estimated_value'] ?? 0,
                    'story_mentions' => $report['content_delivery']['story_mentions'] ?? 0,
                    'ad_impressions' => $report['advertising']['ad_impressions'] ?? 0,
                    'profile_views' => $report['listing_performance']['profile_views'] ?? 0,
                    'coupon_redemptions' => $report['commerce']['coupon_redemptions'] ?? 0,
                    'engagement_score' => $report['engagement']['engagement_score'] ?? 0,
                    'email_open_rate' => $report['engagement']['email_open_rate'] ?? 0,
                ];
            }
            $cursor = $cursor->copy()->subMonth();
        }

        $monthsChronological = array_reverse($months);

        return [
            'customer_id' => $customer->id,
            'business_name' => $customer->business_name,
            'months' => $monthsChronological,
            'trends' => $this->computeMonthOverMonthTrends($monthsChronological),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $monthsChronological
     * @return array<string, mixed>
     */
    private function computeMonthOverMonthTrends(array $monthsChronological): array
    {
        if (count($monthsChronological) < 2) {
            return [];
        }

        $current = $monthsChronological[count($monthsChronological) - 1];
        $previous = $monthsChronological[count($monthsChronological) - 2];

        $keys = ['story_mentions', 'ad_impressions', 'profile_views', 'coupon_redemptions', 'engagement_score', 'email_open_rate'];

        $out = [];
        foreach ($keys as $key) {
            $a = (float) ($current[$key] ?? 0);
            $b = (float) ($previous[$key] ?? 0);
            $delta = $a - $b;
            if ($b > 0) {
                $pct = round((($a - $b) / $b) * 100, 1);
            } else {
                $pct = $a > 0 ? 100.0 : 0.0;
            }
            $out[$key] = [
                'current' => $current[$key] ?? 0,
                'previous' => $previous[$key] ?? 0,
                'delta' => round($delta, 2),
                'delta_percent' => $pct,
                'direction' => $delta > 0 ? 'up' : ($delta < 0 ? 'down' : 'flat'),
            ];
        }

        return $out;
    }

    /**
     * @return array{amount_charged: float, payment_status: string, invoices_paid_in_month: int}
     */
    private function getBillingData(Customer $customer, CommunitySubscription $sub, string $yearMonth): array
    {
        [$y, $m] = array_map('intval', explode('-', $yearMonth));
        $start = Carbon::createFromDate($y, $m, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $paidInvoices = Invoice::query()
            ->where('customer_id', $customer->id)
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$start, $end])
            ->count();

        $status = $paidInvoices > 0 ? 'paid' : 'pending';

        return [
            'amount_charged' => (float) $sub->monthly_rate,
            'payment_status' => $status,
            'invoices_paid_in_month' => $paidInvoices,
        ];
    }

    /**
     * @return array{engagement_score: int|null, engagement_tier: int|null, tier_name: string}
     */
    private function getEngagementData(Customer $customer): array
    {
        return [
            'engagement_score' => $customer->engagement_score,
            'engagement_tier' => $customer->engagement_tier,
            'tier_name' => $customer->getTierName(),
        ];
    }

    /**
     * @return array{emails_sent: int, emails_opened: int, email_open_rate: float}
     */
    private function getCampaignData(Customer $customer, string $yearMonth): array
    {
        [$y, $m] = array_map('intval', explode('-', $yearMonth));
        $start = Carbon::createFromDate($y, $m, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $base = CampaignRecipient::query()
            ->where('customer_id', $customer->id)
            ->whereHas('campaign', fn ($q) => $q->where('type', 'email'));

        $sent = (clone $base)
            ->whereNotNull('sent_at')
            ->whereBetween('sent_at', [$start, $end])
            ->count();

        $opened = (clone $base)
            ->whereNotNull('opened_at')
            ->whereBetween('opened_at', [$start, $end])
            ->count();

        return [
            'emails_sent' => $sent,
            'emails_opened' => $opened,
            'email_open_rate' => $sent > 0 ? round(($opened / $sent) * 100, 1) : 0.0,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function getPublishingData(string $externalId, string $communityId, string $yearMonth): array
    {
        $bridgeUrl = config('services.publishing_bridge.base_url');
        $bridgeKey = config('services.publishing_bridge.api_key');

        if ($bridgeUrl === '' || $bridgeUrl === '0' || ! $bridgeKey) {
            return [];
        }

        $cacheKey = "subscriber_roi:{$externalId}:{$communityId}:{$yearMonth}";

        return Cache::remember($cacheKey, now()->addHour(), function () use ($bridgeUrl, $bridgeKey, $externalId, $communityId, $yearMonth) {
            try {
                $response = Http::withToken($bridgeKey)
                    ->timeout(10)
                    ->get("{$bridgeUrl}/api/v1/bridge/subscriber-roi/{$externalId}/{$communityId}", [
                        'month' => $yearMonth,
                    ]);

                if ($response->successful()) {
                    return $response->json('data') ?? [];
                }
            } catch (\Throwable) {
                // Bridge unavailable — return empty publishing metrics
            }

            return [];
        });
    }

    /**
     * @param  array<string, mixed>  $publishingData
     * @return array{total_estimated_value: float, breakdown: array<string, float>}
     */
    private function calculateEstimatedValue(array $publishingData): array
    {
        $storyMentionValue = ($publishingData['story_mentions'] ?? 0) * 50;
        $adImpressionValue = (($publishingData['ad_impressions'] ?? 0) / 1000) * 15;
        $profileViewValue = ($publishingData['profile_views'] ?? 0) * 0.50;
        $couponRedemptionValue = ($publishingData['coupon_redemptions'] ?? 0) * 10;

        $total = $storyMentionValue + $adImpressionValue + $profileViewValue + $couponRedemptionValue;

        return [
            'total_estimated_value' => round($total, 2),
            'breakdown' => [
                'story_mentions' => round($storyMentionValue, 2),
                'ad_impressions' => round($adImpressionValue, 2),
                'profile_views' => round($profileViewValue, 2),
                'coupon_redemptions' => round($couponRedemptionValue, 2),
            ],
        ];
    }
}
