<?php

declare(strict_types=1);

namespace App\Services\Sarah;

use App\Models\Campaign;
use App\Models\CampaignLineItem;
use App\Services\PublishingPlatformService;
use Illuminate\Support\Facades\Log;

/**
 * Routes each campaign line item to its fulfillment handler.
 *
 * After a campaign payment succeeds, this service dispatches each line item
 * to the appropriate product service for activation/creation.
 *
 * Product-specific services are called via PublishingPlatformService where
 * the fulfillment lives on the Publishing Platform side, or handled locally
 * for Learning Center-native products.
 */
final class CampaignFulfillmentService
{
    public function __construct(
        private readonly PublishingPlatformService $publishingService,
    ) {}

    /**
     * Fulfill all pending line items in a campaign.
     *
     * @return array{fulfilled: int, failed: int, errors: list<string>}
     */
    public function fulfill(Campaign $campaign): array
    {
        $fulfilled = 0;
        $failed = 0;
        $errors = [];

        $lineItems = $campaign->lineItems()->where('status', 'pending')->get();

        foreach ($lineItems as $item) {
            try {
                $this->fulfillItem($campaign, $item);
                $item->markActive();
                $fulfilled++;
            } catch (\Throwable $e) {
                $item->update(['status' => 'failed']);
                $failed++;
                $errors[] = "{$item->product_type}: {$e->getMessage()}";

                Log::error('Sarah fulfillment: item failed', [
                    'campaign_id' => $campaign->id,
                    'line_item_id' => $item->id,
                    'product_type' => $item->product_type,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Sarah fulfillment: completed', [
            'campaign_id' => $campaign->id,
            'fulfilled' => $fulfilled,
            'failed' => $failed,
        ]);

        return [
            'fulfilled' => $fulfilled,
            'failed' => $failed,
            'errors' => $errors,
        ];
    }

    /**
     * Fulfill a single line item by routing to the correct handler.
     */
    private function fulfillItem(Campaign $campaign, CampaignLineItem $item): void
    {
        $businessName = $campaign->smb?->business_name ?? 'Business';
        $communityId = $campaign->community_id;
        $externalId = $campaign->customer?->external_id ?? $campaign->customer_id;

        match ($item->product_type) {
            'headliner_ad' => $this->fulfillHeadlinerAd($item, $communityId, $businessName, $externalId),
            'newsletter_callout' => $this->fulfillNewsletterCallout($item, $communityId, $businessName, $externalId),
            'sponsored_article' => $this->fulfillSponsoredArticle($item, $communityId, $businessName, $externalId),
            'display_campaign' => $this->fulfillDisplayCampaign($item, $communityId, $businessName, $externalId),
            'event_promotion' => $this->fulfillEventPromotion($item, $communityId, $businessName, $externalId),
            'featured_listing' => $this->fulfillFeaturedListing($item, $communityId, $businessName, $externalId),
            'classified' => $this->fulfillClassified($item, $communityId, $businessName),
            'coupon' => $this->fulfillCoupon($item, $communityId, $businessName),
            'announcement' => $this->fulfillAnnouncement($item, $communityId, $businessName),
            default => Log::warning('Sarah fulfillment: unknown product type', [
                'product_type' => $item->product_type,
                'line_item_id' => $item->id,
            ]),
        };
    }

    private function fulfillHeadlinerAd(CampaignLineItem $item, ?string $communityId, string $businessName, ?string $externalId): void
    {
        $config = $item->configuration ?? [];

        $this->publishingService->createListing([
            'business_name' => $businessName,
            'community_id' => $communityId,
            'external_id' => $externalId,
            'category' => $config['category'] ?? 'general',
            'listing_type' => 'headliner',
            'headline' => $config['headline'] ?? $businessName,
            'description' => $config['description'] ?? '',
            'duration_days' => $config['duration_days'] ?? 7,
            'metadata' => [
                'source' => 'sarah_campaign',
                'line_item_id' => $item->id,
                'campaign_id' => $item->campaign_id,
            ],
        ]);
    }

    private function fulfillNewsletterCallout(CampaignLineItem $item, ?string $communityId, string $businessName, ?string $externalId): void
    {
        $config = $item->configuration ?? [];

        $this->publishingService->featureInNewsletter([
            'business_name' => $businessName,
            'community_id' => $communityId,
            'external_id' => $externalId,
            'headline' => $config['headline'] ?? "Discover {$businessName}",
            'body' => $config['body'] ?? '',
            'cta_url' => $config['cta_url'] ?? '',
            'cta_text' => $config['cta_text'] ?? "Visit {$businessName}",
            'priority' => 'sponsored',
            'metadata' => [
                'source' => 'sarah_campaign',
                'line_item_id' => $item->id,
            ],
        ]);
    }

    private function fulfillSponsoredArticle(CampaignLineItem $item, ?string $communityId, string $businessName, ?string $externalId): void
    {
        $config = $item->configuration ?? [];

        $this->publishingService->publishArticle([
            'title' => $config['title'] ?? "Sponsored: Meet {$businessName}",
            'content' => $config['content'] ?? '',
            'excerpt' => $config['excerpt'] ?? '',
            'business_name' => $businessName,
            'community_id' => $communityId,
            'author_name' => 'Day.News Sponsored',
            'category' => $config['category'] ?? 'sponsored',
            'metadata' => [
                'source' => 'sarah_campaign',
                'sponsored' => true,
                'line_item_id' => $item->id,
            ],
        ]);
    }

    private function fulfillDisplayCampaign(CampaignLineItem $item, ?string $communityId, string $businessName, ?string $externalId): void
    {
        $config = $item->configuration ?? [];

        $this->publishingService->createListing([
            'business_name' => $businessName,
            'community_id' => $communityId,
            'external_id' => $externalId,
            'category' => $config['category'] ?? 'general',
            'listing_type' => 'display_ad',
            'creative_url' => $config['creative_url'] ?? '',
            'target_url' => $config['target_url'] ?? '',
            'duration_days' => $config['duration_days'] ?? 30,
            'metadata' => [
                'source' => 'sarah_campaign',
                'line_item_id' => $item->id,
            ],
        ]);
    }

    private function fulfillEventPromotion(CampaignLineItem $item, ?string $communityId, string $businessName, ?string $externalId): void
    {
        $config = $item->configuration ?? [];

        $this->publishingService->createEvent([
            'title' => $config['event_title'] ?? "{$businessName} — Featured Event",
            'description' => $config['event_description'] ?? '',
            'community_id' => $communityId,
            'business_name' => $businessName,
            'external_id' => $externalId,
            'event_date' => $config['event_date'] ?? now()->addDays(14)->toDateString(),
            'category' => $config['category'] ?? 'business',
            'metadata' => [
                'source' => 'sarah_campaign',
                'line_item_id' => $item->id,
            ],
        ]);
    }

    private function fulfillFeaturedListing(CampaignLineItem $item, ?string $communityId, string $businessName, ?string $externalId): void
    {
        $config = $item->configuration ?? [];

        $this->publishingService->createListing([
            'business_name' => $businessName,
            'community_id' => $communityId,
            'external_id' => $externalId,
            'category' => $config['category'] ?? 'general',
            'listing_type' => 'premium',
            'description' => $config['description'] ?? '',
            'address' => $config['address'] ?? '',
            'phone' => $config['phone'] ?? '',
            'website' => $config['website'] ?? '',
            'metadata' => [
                'source' => 'sarah_campaign',
                'line_item_id' => $item->id,
            ],
        ]);
    }

    private function fulfillClassified(CampaignLineItem $item, ?string $communityId, string $businessName): void
    {
        $config = $item->configuration ?? [];

        $this->publishingService->publishArticle([
            'title' => $config['title'] ?? "Classified: {$businessName}",
            'content' => $config['body'] ?? '',
            'business_name' => $businessName,
            'community_id' => $communityId,
            'author_name' => $businessName,
            'category' => 'classified',
            'metadata' => [
                'source' => 'sarah_campaign',
                'classified' => true,
                'line_item_id' => $item->id,
                'duration_days' => $config['duration_days'] ?? 30,
            ],
        ]);
    }

    private function fulfillCoupon(CampaignLineItem $item, ?string $communityId, string $businessName): void
    {
        $config = $item->configuration ?? [];

        $this->publishingService->createListing([
            'business_name' => $businessName,
            'community_id' => $communityId,
            'listing_type' => 'coupon',
            'description' => $config['offer_description'] ?? '',
            'metadata' => [
                'source' => 'sarah_campaign',
                'line_item_id' => $item->id,
                'coupon_code' => $config['coupon_code'] ?? '',
                'expires_at' => $config['expires_at'] ?? now()->addDays(30)->toDateString(),
            ],
        ]);
    }

    private function fulfillAnnouncement(CampaignLineItem $item, ?string $communityId, string $businessName): void
    {
        $config = $item->configuration ?? [];

        $this->publishingService->publishArticle([
            'title' => $config['title'] ?? "Announcement from {$businessName}",
            'content' => $config['body'] ?? '',
            'business_name' => $businessName,
            'community_id' => $communityId,
            'author_name' => $businessName,
            'category' => 'announcement',
            'metadata' => [
                'source' => 'sarah_campaign',
                'announcement' => true,
                'line_item_id' => $item->id,
            ],
        ]);
    }
}
