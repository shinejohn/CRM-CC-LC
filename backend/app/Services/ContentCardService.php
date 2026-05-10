<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Community;
use App\Models\ContentCard;
use App\Models\SMB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class ContentCardService
{
    public function __construct(
        private PublishingPlatformService $publishingPlatform,
        private OpenRouterService $openRouter
    ) {}

    /**
     * Generate daily content cards for a community.
     */
    public function generateDailyCards(Community $community): int
    {
        $today = now()->toDateString();
        $contentType = $this->getContentTypeForDay();

        // Pull content from Publishing Platform
        $contentData = $this->pullContentData($community, $contentType);

        $count = 0;

        // Get active SMBs in community (via smbs table)
        $smbs = SMB::where('community_id', $community->id)
            ->where('do_not_contact', false)
            ->get();

        foreach ($smbs as $smb) {
            // Skip if card already exists for today
            $exists = ContentCard::where('smb_id', $smb->id)
                ->where('date_for', $today)
                ->where('card_mode', 'smb_self_post')
                ->exists();

            if ($exists) {
                continue;
            }

            $trackingUrl = $this->generateTrackingUrl($smb, $community, $contentType);

            $caption = $this->generateCaption($contentType, $contentData, $smb);

            ContentCard::create([
                'smb_id' => $smb->id,
                'community_id' => $community->id,
                'content_type' => $contentType,
                'card_mode' => 'smb_self_post',
                'content_data' => $contentData,
                'caption_text' => $caption,
                'tracking_url' => $trackingUrl,
                'date_for' => $today,
            ]);
            $count++;
        }

        // Generate syndication sponsored cards for SMBs with active sponsor placements
        $sponsoredSmbs = SMB::where('community_id', $community->id)
            ->whereHas('sponsorPlacements', fn ($q) => $q->where('status', 'active'))
            ->get();

        foreach ($sponsoredSmbs as $smb) {
            $exists = ContentCard::where('smb_id', $smb->id)
                ->where('date_for', $today)
                ->where('card_mode', 'syndication_sponsored')
                ->exists();

            if ($exists) {
                continue;
            }

            $sponsorData = [
                'business_name' => $smb->business_name,
                'category' => $smb->category,
                'phone' => $smb->primary_phone,
                'website' => $smb->metadata['website'] ?? null,
            ];

            ContentCard::create([
                'smb_id' => $smb->id,
                'community_id' => $community->id,
                'content_type' => $contentType,
                'card_mode' => 'syndication_sponsored',
                'content_data' => $contentData,
                'sponsor_data' => $sponsorData,
                'caption_text' => $this->generateCaption($contentType, $contentData, $smb, true),
                'tracking_url' => $this->generateTrackingUrl($smb, $community, $contentType, 'syndication'),
                'date_for' => $today,
            ]);
            $count++;
        }

        Log::info("Generated {$count} content cards for community {$community->name}");

        return $count;
    }

    /**
     * Get today's card for an SMB.
     */
    public function getCardForSmb(SMB $smb, ?string $contentType = null): ?ContentCard
    {
        $query = ContentCard::where('smb_id', $smb->id)
            ->where('date_for', now()->toDateString())
            ->where('card_mode', 'smb_self_post');

        if ($contentType) {
            $query->where('content_type', $contentType);
        }

        $card = $query->first();

        // Generate if not exists
        if (!$card && $smb->community) {
            $this->generateDailyCards($smb->community);
            $card = $query->first();
        }

        return $card;
    }

    /**
     * Determine content type by day of week.
     */
    public function getContentTypeForDay(?string $dayName = null): string
    {
        $day = $dayName ?? now()->format('l');

        return match ($day) {
            'Monday' => 'news',
            'Tuesday' => 'events',
            'Wednesday' => 'weather',
            'Thursday' => 'downtown',
            'Friday' => 'spotlight',
            default => 'news',
        };
    }

    /**
     * Pull content data from publishing platform.
     */
    private function pullContentData(Community $community, string $contentType): array
    {
        try {
            return match ($contentType) {
                'news' => $this->pullNewsData($community),
                'events' => $this->pullEventsData($community),
                'weather' => $this->getWeatherData($community),
                'downtown' => $this->getDowntownData($community),
                'spotlight' => $this->getSpotlightData($community),
                default => ['type' => $contentType, 'items' => []],
            };
        } catch (\Throwable $e) {
            Log::warning("Failed to pull {$contentType} data for {$community->name}: {$e->getMessage()}");
            return ['type' => $contentType, 'items' => [], 'fallback' => true];
        }
    }

    private function pullNewsData(Community $community): array
    {
        $readership = $this->publishingPlatform->reportReadership($community->id);
        return [
            'type' => 'news',
            'community_name' => $community->name,
            'items' => array_slice($readership['articles'] ?? [], 0, 5),
            'source' => 'Day.News',
        ];
    }

    private function pullEventsData(Community $community): array
    {
        $readership = $this->publishingPlatform->reportReadership($community->id);
        return [
            'type' => 'events',
            'community_name' => $community->name,
            'items' => array_slice($readership['events'] ?? [], 0, 5),
            'source' => 'GoEventCity',
        ];
    }

    private function getWeatherData(Community $community): array
    {
        return [
            'type' => 'weather',
            'community_name' => $community->name,
            'state' => $community->state,
            'items' => [],
        ];
    }

    private function getDowntownData(Community $community): array
    {
        return [
            'type' => 'downtown',
            'community_name' => $community->name,
            'items' => [],
            'source' => 'DowntownsGuide',
        ];
    }

    private function getSpotlightData(Community $community): array
    {
        return [
            'type' => 'spotlight',
            'community_name' => $community->name,
            'items' => [],
        ];
    }

    /**
     * Generate AI caption for a content card.
     */
    private function generateCaption(string $contentType, array $contentData, SMB $smb, bool $sponsored = false): string
    {
        $communityName = $contentData['community_name'] ?? 'your community';
        $businessName = $smb->business_name;

        $typeLabels = [
            'news' => 'community news',
            'events' => 'upcoming events',
            'weather' => 'weather update',
            'downtown' => 'downtown highlights',
            'spotlight' => 'business spotlight',
        ];
        $label = $typeLabels[$contentType] ?? 'community update';

        try {
            $prompt = $sponsored
                ? "Write a short social media caption (2-3 sentences) for a sponsored community content card. The sponsor is {$businessName}. The content is about {$label} in {$communityName}. Include 3-5 relevant hashtags. Keep it professional and engaging."
                : "Write a short social media caption (2-3 sentences) for a {$label} content card that {$businessName} is sharing about {$communityName}. Include 3-5 relevant hashtags. Keep it friendly and community-focused.";

            $response = $this->openRouter->chatCompletion([
                ['role' => 'system', 'content' => 'You are a social media copywriter for local businesses. Write concise, engaging captions.'],
                ['role' => 'user', 'content' => $prompt],
            ], ['max_tokens' => 200, 'temperature' => 0.8]);

            return $response['choices'][0]['message']['content'] ?? $this->fallbackCaption($businessName, $label, $communityName);
        } catch (\Throwable $e) {
            Log::warning("Caption generation failed: {$e->getMessage()}");
            return $this->fallbackCaption($businessName, $label, $communityName);
        }
    }

    private function fallbackCaption(string $business, string $label, string $community): string
    {
        return "Check out today's {$label} from {$community}! Brought to you by {$business}. #LocalBusiness #{$community} #CommunityFirst";
    }

    /**
     * Generate a tracking URL with UTM params.
     */
    private function generateTrackingUrl(SMB $smb, Community $community, string $contentType, string $source = 'self_post'): string
    {
        $payload = [
            'smb' => $smb->id,
            'community' => $community->id,
            'type' => $contentType,
            'source' => $source,
        ];

        $encoded = base64_encode(json_encode($payload));
        $signature = hash_hmac('sha256', $encoded, config('app.key'));
        $code = $encoded . '.' . $signature;

        return config('app.url') . '/api/v1/t/' . $code;
    }
}
