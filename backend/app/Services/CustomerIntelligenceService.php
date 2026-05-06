<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AnalyticsEvent;
use App\Models\CommunitySubscription;
use App\Models\Customer;
use App\Models\PitchSession;
use App\Models\Service;

final class CustomerIntelligenceService
{
    public function __construct(
        private readonly EngagementService $engagementService,
    ) {}

    /**
     * Build a complete intelligence context for a customer.
     * Returns: what they own, how they're using it, performance metrics,
     * gaps, and product recommendations.
     *
     * @return array<string, mixed>
     */
    public function buildContext(Customer $customer): array
    {
        // 1. What they bought
        $subscriptions = CommunitySubscription::where('customer_id', $customer->id)
            ->where('status', 'active')
            ->get();

        $ownedProductSlugs = $subscriptions->pluck('product_slug')->toArray();
        $currentMonthlyValue = $subscriptions->sum('monthly_rate');

        // 2. Past pitch sessions (products accepted/declined/deferred)
        $pitchHistory = PitchSession::where('customer_id', $customer->id)
            ->where('status', 'converted')
            ->get();

        $allAcceptedProducts = [];
        $allDeclinedProducts = [];
        $allDeferredProducts = [];
        foreach ($pitchHistory as $ps) {
            $allAcceptedProducts = array_merge($allAcceptedProducts, $ps->products_accepted ?? []);
            $allDeclinedProducts = array_merge($allDeclinedProducts, $ps->products_declined ?? []);
            $allDeferredProducts = array_merge($allDeferredProducts, $ps->products_deferred ?? []);
        }

        // 3. Engagement metrics
        $engagementScore = $this->engagementService->calculateScore($customer);
        $emailOpens30d = $this->engagementService->countEmailOpens($customer, 30);
        $emailClicks30d = $this->engagementService->countEmailClicks($customer, 30);
        $contentViews30d = $this->engagementService->countContentViews($customer, 30);

        // 4. Publishing platform performance (from AnalyticsEvent)
        $performance = $this->getPerformanceMetrics($customer);

        // 5. Generate gap analysis and recommendations
        $recommendations = $this->generateRecommendations(
            $customer,
            $ownedProductSlugs,
            $performance,
            $engagementScore,
            $allDeclinedProducts,
            $allDeferredProducts,
        );

        return [
            'customer_id' => $customer->id,
            'business_name' => $customer->business_name,
            'category' => $customer->category ?? $customer->industry_category,
            'community_id' => $customer->community_id,
            'pipeline_stage' => $customer->pipeline_stage,

            // What they bought
            'owned_products' => $ownedProductSlugs,
            'current_monthly_value' => (float) $currentMonthlyValue,
            'subscriptions' => $subscriptions->map(fn (CommunitySubscription $s): array => [
                'id' => $s->id,
                'product_slug' => $s->product_slug,
                'tier' => $s->tier,
                'monthly_rate' => (float) $s->monthly_rate,
                'is_founder_pricing' => $s->isFounderPricing(),
                'months_remaining' => $s->monthsRemaining(),
                'status' => $s->status,
            ])->toArray(),

            // What they're using
            'engagement' => [
                'score' => $engagementScore,
                'tier' => $customer->engagement_tier,
                'email_opens_30d' => $emailOpens30d,
                'email_clicks_30d' => $emailClicks30d,
                'content_views_30d' => $contentViews30d,
                'last_email_open' => $customer->last_email_open,
                'last_email_click' => $customer->last_email_click,
                'last_content_view' => $customer->last_content_view,
            ],

            // How it's performing
            'performance' => $performance,

            // History
            'pitch_history' => [
                'total_sessions' => $pitchHistory->count(),
                'products_accepted' => $allAcceptedProducts,
                'products_declined' => $allDeclinedProducts,
                'products_deferred' => $allDeferredProducts,
            ],

            // Recommendations
            'recommendations' => $recommendations,
        ];
    }

    /**
     * Get publishing platform performance metrics for last 30 days.
     * AnalyticsEvent uses smb_id (not customer_id), so we look up via the customer's smb.
     *
     * @return array<string, int|float>
     */
    private function getPerformanceMetrics(Customer $customer): array
    {
        $events = AnalyticsEvent::query()
            ->where('smb_id', $customer->smb_id)
            ->where('event_type', 'readership_sync')
            ->where('occurred_at', '>=', now()->subDays(30))
            ->get();

        $metrics = [
            'article_views' => 0,
            'listing_views' => 0,
            'event_views' => 0,
            'newsletter_clicks' => 0,
            'social_impressions' => 0,
            'profile_views' => 0,
            'search_appearances' => 0,
            'website_clicks' => 0,
            'coupon_claims' => 0,
            'ad_impressions' => 0,
            'ad_clicks' => 0,
        ];

        foreach ($events as $event) {
            $props = $event->properties ?? [];
            foreach ($metrics as $key => $val) {
                $metrics[$key] += (int) ($props[$key] ?? 0);
            }
        }

        // Compute CTR
        $totalImpressions = $metrics['listing_views'] + $metrics['ad_impressions'] + $metrics['article_views'];
        $totalClicks = $metrics['website_clicks'] + $metrics['ad_clicks'] + $metrics['newsletter_clicks'];
        $metrics['ctr'] = $totalImpressions > 0 ? round($totalClicks / $totalImpressions, 4) : 0.0;

        return $metrics;
    }

    /**
     * Generate product recommendations based on customer intelligence.
     * Each recommendation has: product_slug, product_name, reason, confidence (0-100),
     * projected_impact description, priority (1=highest).
     *
     * @param  array<string>  $ownedProductSlugs
     * @param  array<string, int|float>  $performance
     * @param  array<int, mixed>  $declinedProducts
     * @param  array<int, mixed>  $deferredProducts
     * @return array<int, array<string, mixed>>
     */
    private function generateRecommendations(
        Customer $customer,
        array $ownedProductSlugs,
        array $performance,
        int $engagementScore,
        array $declinedProducts,
        array $deferredProducts,
    ): array {
        $recommendations = [];
        $category = strtolower($customer->category ?? $customer->industry_category ?? '');

        // Load available products they don't own
        $availableProducts = Service::where('is_active', true)
            ->whereNotIn('product_slug', $ownedProductSlugs)
            ->get()
            ->keyBy('product_slug');

        // Extract declined/deferred slugs (don't strongly push these)
        $declinedSlugs = collect($declinedProducts)->pluck('product')->filter()->toArray();
        $deferredSlugs = collect($deferredProducts)->pluck('product_slug')
            ->merge(collect($deferredProducts)->pluck('product'))
            ->filter()
            ->toArray();

        // --- RULE ENGINE ---

        // 1. Upgrade path: influencer -> expert
        if (in_array('community-influencer', $ownedProductSlugs, true)
            && !in_array('community-expert', $ownedProductSlugs, true)
            && isset($availableProducts['community-expert'])) {
            $svc = $availableProducts['community-expert'];
            $recommendations[] = [
                'product_slug' => 'community-expert',
                'product_name' => $svc->name ?? 'Community Expert',
                'price' => (float) $svc->price,
                'reason' => 'You\'re already a Community Influencer. Upgrading to Expert gives you a dedicated column, priority placement, and deeper audience reach.',
                'trigger' => 'upgrade_path',
                'confidence' => 85,
                'projected_impact' => '2-3x more profile views and a dedicated content column',
                'priority' => 1,
            ];
        }

        // 2. Upgrade path: expert -> sponsor
        if (in_array('community-expert', $ownedProductSlugs, true)
            && !in_array('community-sponsor', $ownedProductSlugs, true)
            && isset($availableProducts['community-sponsor'])) {
            $svc = $availableProducts['community-sponsor'];
            $recommendations[] = [
                'product_slug' => 'community-sponsor',
                'product_name' => $svc->name ?? 'Community Sponsor',
                'price' => (float) $svc->price,
                'reason' => 'As an Expert, you\'re already seeing strong engagement. Sponsor tier adds section sponsorship, premium ad placement, and exclusive branding.',
                'trigger' => 'upgrade_path',
                'confidence' => 75,
                'projected_impact' => 'Brand-level visibility across the entire community platform',
                'priority' => 2,
            ];
        }

        // 3. AI services upsell chain
        if (in_array('ai-personal-assistant', $ownedProductSlugs, true)) {
            $aiUpsells = ['ai-4-calls', 'ai-email-response', 'ai-chatbot'];
            $reasons = [
                'ai-4-calls' => 'You have AI Assistant — add AI-powered call handling to never miss a lead.',
                'ai-email-response' => 'Your AI Assistant can also handle email inquiries automatically.',
                'ai-chatbot' => 'Add an AI chatbot to your website to capture visitors 24/7.',
            ];
            foreach ($aiUpsells as $slug) {
                if (!in_array($slug, $ownedProductSlugs, true) && isset($availableProducts[$slug])) {
                    $svc = $availableProducts[$slug];
                    $recommendations[] = [
                        'product_slug' => $slug,
                        'product_name' => $svc->name ?? $slug,
                        'price' => (float) $svc->price,
                        'reason' => $reasons[$slug],
                        'trigger' => 'ai_expansion',
                        'confidence' => 70,
                        'projected_impact' => 'Capture more leads without adding staff time',
                        'priority' => 3,
                    ];
                }
            }
        }

        // 4. Performance-triggered: low listing CTR -> premium listing
        if (($performance['listing_views'] ?? 0) > 50
            && ($performance['ctr'] ?? 0) < 0.04
            && !in_array('premium-listing', $ownedProductSlugs, true)
            && isset($availableProducts['premium-listing'])) {
            $svc = $availableProducts['premium-listing'];
            $ctrPct = round(($performance['ctr'] ?? 0) * 100, 1);
            $recommendations[] = [
                'product_slug' => 'premium-listing',
                'product_name' => $svc->name ?? 'Premium Listing',
                'price' => (float) $svc->price,
                'reason' => "Your listing gets {$performance['listing_views']} views but only {$ctrPct}% click through. Premium placement with featured badge typically doubles CTR.",
                'trigger' => 'low_ctr',
                'confidence' => 80,
                'projected_impact' => 'Double your click-through rate with premium placement',
                'priority' => 2,
            ];
        }

        // 5. No events posted -> event promotion (for event-oriented businesses)
        if (($performance['event_views'] ?? 0) === 0
            && !in_array('event-reminders', $ownedProductSlugs, true)
            && isset($availableProducts['event-reminders'])) {
            $isEventBusiness = (bool) preg_match('/restaurant|bar|venue|entertainment|fitness|gym|studio|gallery/i', $category);
            if ($isEventBusiness) {
                $svc = $availableProducts['event-reminders'];
                $recommendations[] = [
                    'product_slug' => 'event-reminders',
                    'product_name' => $svc->name ?? 'Event Reminders',
                    'price' => (float) $svc->price,
                    'reason' => 'You haven\'t posted any events yet. Businesses like yours that post events see 3x more engagement.',
                    'trigger' => 'unused_feature',
                    'confidence' => 65,
                    'projected_impact' => '3x more engagement from event-driven foot traffic',
                    'priority' => 3,
                ];
            }
        }

        // 6. High article views -> sponsored article
        if (($performance['article_views'] ?? 0) > 200
            && !in_array('article-companion', $ownedProductSlugs, true)
            && isset($availableProducts['article-companion'])) {
            $svc = $availableProducts['article-companion'];
            $recommendations[] = [
                'product_slug' => 'article-companion',
                'product_name' => $svc->name ?? 'Article Companion Ad',
                'price' => (float) $svc->price,
                'reason' => "Your articles are getting {$performance['article_views']} views. A companion ad alongside your content captures that audience with a direct call to action.",
                'trigger' => 'high_content_engagement',
                'confidence' => 75,
                'projected_impact' => 'Convert article readers into customers with targeted companion ads',
                'priority' => 2,
            ];
        }

        // 7. No coupons -> coupons & deals (for retail-oriented businesses)
        if (($performance['coupon_claims'] ?? 0) === 0
            && !in_array('coupons-deals', $ownedProductSlugs, true)
            && isset($availableProducts['coupons-deals'])) {
            $isRetail = (bool) preg_match('/restaurant|retail|shop|store|salon|cafe|bakery|pizza|food/i', $category);
            if ($isRetail) {
                $svc = $availableProducts['coupons-deals'];
                $recommendations[] = [
                    'product_slug' => 'coupons-deals',
                    'product_name' => $svc->name ?? 'Coupons & Deals',
                    'price' => (float) $svc->price,
                    'reason' => 'Coupons drive foot traffic for ' . ($customer->business_name ?? 'your business') . '. Local businesses using digital coupons see 15-25% redemption rates.',
                    'trigger' => 'category_match',
                    'confidence' => 70,
                    'projected_impact' => '15-25% coupon redemption rate driving new foot traffic',
                    'priority' => 3,
                ];
            }
        }

        // 8. Display ads cross-sell (if they have listing but no ads)
        if ((in_array('premium-listing', $ownedProductSlugs, true) || in_array('headliner', $ownedProductSlugs, true))
            && !in_array('display-ads', $ownedProductSlugs, true)
            && isset($availableProducts['display-ads'])) {
            $svc = $availableProducts['display-ads'];
            $recommendations[] = [
                'product_slug' => 'display-ads',
                'product_name' => $svc->name ?? 'Display Advertising',
                'price' => (float) $svc->price,
                'reason' => 'You have a strong listing presence. Display ads extend your visibility across the entire platform, not just your listing page.',
                'trigger' => 'cross_sell',
                'confidence' => 65,
                'projected_impact' => 'Platform-wide brand visibility beyond your listing',
                'priority' => 4,
            ];
        }

        // 9. Newsletter sponsor (if high newsletter clicks)
        if (($performance['newsletter_clicks'] ?? 0) > 20
            && !in_array('newsletter-sponsor', $ownedProductSlugs, true)
            && isset($availableProducts['newsletter-sponsor'])) {
            $svc = $availableProducts['newsletter-sponsor'];
            $recommendations[] = [
                'product_slug' => 'newsletter-sponsor',
                'product_name' => $svc->name ?? 'Newsletter Sponsorship',
                'price' => (float) $svc->price,
                'reason' => "You're already getting {$performance['newsletter_clicks']} newsletter clicks. As a sponsor, you'd get premium placement in every send.",
                'trigger' => 'high_newsletter_engagement',
                'confidence' => 72,
                'projected_impact' => 'Premium newsletter placement reaching the full subscriber base',
                'priority' => 3,
            ];
        }

        // 10. Declining engagement -> re-engagement content
        if ($engagementScore < 30 && $engagementScore > 0) {
            if (!in_array('content-posting', $ownedProductSlugs, true)
                && isset($availableProducts['content-posting'])) {
                $svc = $availableProducts['content-posting'];
                $recommendations[] = [
                    'product_slug' => 'content-posting',
                    'product_name' => $svc->name ?? 'Content Posting',
                    'price' => (float) $svc->price,
                    'reason' => 'Your engagement has dipped. Fresh content keeps your business visible and relevant to the community.',
                    'trigger' => 'declining_engagement',
                    'confidence' => 60,
                    'projected_impact' => 'Re-engage your audience with fresh, relevant content',
                    'priority' => 4,
                ];
            }
        }

        // De-prioritize recently declined products
        foreach ($recommendations as &$rec) {
            if (in_array($rec['product_slug'], $declinedSlugs, true)) {
                $rec['confidence'] = max(0, $rec['confidence'] - 30);
                $rec['priority'] = max($rec['priority'], 5);
                $rec['reason'] .= ' (You passed on this before — circumstances may have changed.)';
            }
            if (in_array($rec['product_slug'], $deferredSlugs, true)) {
                $rec['confidence'] = max(0, $rec['confidence'] - 10);
                $rec['reason'] .= ' (You were interested earlier — ready to revisit?)';
            }
        }
        unset($rec);

        // Sort by priority then confidence
        usort($recommendations, function (array $a, array $b): int {
            if ($a['priority'] !== $b['priority']) {
                return $a['priority'] <=> $b['priority'];
            }

            return $b['confidence'] <=> $a['confidence'];
        });

        return $recommendations;
    }

    /**
     * Determine which gates to show in upsell Pitch flow and in what order.
     * Returns gate keys filtered to only new products, ordered by recommendation priority.
     *
     * @param  array<int, array<string, mixed>>  $recommendations
     * @return array<int, string>
     */
    public function determineUpsellGateOrder(Customer $customer, array $recommendations): array
    {
        // Map product slugs to gate keys
        $productToGate = [
            'community-influencer' => 'day_news',
            'community-expert' => 'day_news',
            'community-sponsor' => 'day_news',
            'community-reporter' => 'day_news',
            'headliner' => 'day_news',
            'priority-listing' => 'day_news',
            'premium-listing' => 'downtown_guide',
            'display-ads' => 'day_news',
            'email-ads' => 'day_news',
            'newsletter-sponsor' => 'day_news',
            'article-companion' => 'day_news',
            'section-sponsor' => 'day_news',
            'content-posting' => 'day_news',
            'event-reminders' => 'event_host',
            'ticket-sales' => 'event_host',
            'classifieds' => 'downtown_guide',
            'coupons-deals' => 'downtown_guide',
            'booking-system' => 'downtown_guide',
            'ai-personal-assistant' => 'alphasite',
            'ai-4-calls' => 'alphasite',
            'ai-email-response' => 'alphasite',
            'ai-chatbot' => 'alphasite',
            'social-syndication' => 'golocalvoices',
            'poll-participation' => 'golocalvoices',
            'poll-sponsor' => 'golocalvoices',
        ];

        $gates = [];
        $seen = [];
        foreach ($recommendations as $rec) {
            $gate = $productToGate[$rec['product_slug']] ?? null;
            if ($gate !== null && !in_array($gate, $seen, true)) {
                $gates[] = $gate;
                $seen[] = $gate;
            }
        }

        return $gates;
    }
}
