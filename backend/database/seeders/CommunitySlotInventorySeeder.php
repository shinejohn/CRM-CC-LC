<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CommunitySlotInventory;
use Illuminate\Database\Seeder;

/**
 * Seeds standard slot rows for one community (run per community at launch).
 */
final class CommunitySlotInventorySeeder extends Seeder
{
    private const PLATFORM = 'day_news';

    private const INFLUENCER_CATEGORIES = [
        'restaurant', 'retail', 'bar', 'professional_services', 'home_services',
        'healthcare', 'fitness', 'entertainment', 'real_estate', 'other',
    ];

    private const EVENT_CATEGORIES = [
        'music', 'food_drink', 'sports', 'arts', 'community', 'fitness',
        'business', 'education', 'family', 'other',
    ];

    private const VENUE_CATEGORIES = [
        'restaurant', 'bar', 'event_space', 'outdoor', 'hotel', 'other',
    ];

    private const PERFORMER_CATEGORIES = [
        'band', 'dj', 'comedian', 'speaker', 'solo_artist', 'other',
    ];

    private const EXPERT_CATEGORIES = [
        'legal', 'financial', 'health', 'fitness', 'nutrition', 'real_estate',
        'education', 'culinary', 'other',
    ];

    public function run(): void
    {
        $communityId = (int) (env('SLOT_SEED_COMMUNITY_ID') ?: 0);
        if ($communityId === 0) {
            $this->command?->warn('Set SLOT_SEED_COMMUNITY_ID in .env to seed slots for a community.');

            return;
        }

        $rows = [];

        foreach (self::INFLUENCER_CATEGORIES as $cat) {
            $rows[] = ['slot_type' => 'influencer', 'category' => $cat, 'total_slots' => 5];
            $rows[] = ['slot_type' => 'headliner', 'category' => $cat, 'total_slots' => 1];
        }

        foreach (self::EVENT_CATEGORIES as $cat) {
            $rows[] = ['slot_type' => 'event_headliner', 'category' => $cat, 'total_slots' => 1];
        }

        foreach (self::VENUE_CATEGORIES as $cat) {
            $rows[] = ['slot_type' => 'venue_headliner', 'category' => $cat, 'total_slots' => 1];
        }

        foreach (self::PERFORMER_CATEGORIES as $cat) {
            $rows[] = ['slot_type' => 'performer_headliner', 'category' => $cat, 'total_slots' => 1];
        }

        foreach (self::EXPERT_CATEGORIES as $cat) {
            $rows[] = ['slot_type' => 'expert_column', 'category' => $cat, 'total_slots' => 1];
        }

        $rows[] = ['slot_type' => 'section_sponsor', 'category' => 'other', 'total_slots' => 999999];

        foreach ($rows as $r) {
            CommunitySlotInventory::query()->firstOrCreate(
                [
                    'community_id' => $communityId,
                    'platform' => self::PLATFORM,
                    'slot_type' => $r['slot_type'],
                    'category' => $r['category'],
                ],
                [
                    'total_slots' => $r['total_slots'],
                    'held_slots' => 0,
                    'held_by' => [],
                ]
            );
        }

        $this->command?->info('Community slot inventory seeded for community_id='.$communityId);
    }
}
