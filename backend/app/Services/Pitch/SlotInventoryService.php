<?php

declare(strict_types=1);

namespace App\Services\Pitch;

use App\Models\CommunitySlotInventory;
use App\Models\CommunitySlotLimit;
use App\Models\SMB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Canonical slot management service.
 *
 * Handles both platform-level slot inventory (CommunitySlotInventory — Day.News
 * headliners, influencers, etc.) and category-level slot limits (CommunitySlotLimit —
 * the subscription-tier ceiling enforced during pitch checkout).
 *
 * Merged from the former SlotEnforcementService (community ceiling + category limits)
 * and the original SlotInventoryService (platform-specific slots with caching + watchers).
 */
final class SlotInventoryService
{
    // ─── Constants ───────────────────────────────────────────────────

    private const CACHE_TTL_SECONDS = 300;

    /**
     * Hard ceiling: maximum total influencer slots across all categories in one community.
     */
    private const COMMUNITY_CEILING = 37;

    // ─── Platform Slot Inventory (CommunitySlotInventory) ────────────

    public function cacheKey(int|string $communityId, string $slotType, string $category, string $platform = 'day_news'): string
    {
        return "slot:{$communityId}:{$slotType}:{$category}:{$platform}";
    }

    /**
     * @return array{record: CommunitySlotInventory|null, total_slots: int, held_slots: int, available_slots: int, status: string}
     */
    public function getStatus(
        int|string $communityId,
        string $slotType,
        string $category,
        string $platform = 'day_news',
    ): array {
        $key = $this->cacheKey($communityId, $slotType, $category, $platform);

        return Cache::remember($key, self::CACHE_TTL_SECONDS, function () use ($communityId, $slotType, $category, $platform) {
            $row = CommunitySlotInventory::query()->where([
                'community_id' => $communityId,
                'platform' => $platform,
                'slot_type' => $slotType,
                'category' => $category,
            ])->first();

            return $this->formatRow($row);
        });
    }

    /**
     * @param  list<array{community_id: int|string, slot_type: string, category: string, platform?: string}>  $keys
     * @return list<array{community_id: int|string, slot_type: string, category: string, platform: string, total_slots: int, held_slots: int, available_slots: int, status: string}>
     */
    public function getStatusBatch(array $keys): array
    {
        $out = [];
        foreach ($keys as $k) {
            $platform = $k['platform'] ?? 'day_news';
            $status = $this->getStatus($k['community_id'], $k['slot_type'], $k['category'], $platform);
            $out[] = [
                'community_id' => $k['community_id'],
                'slot_type' => $k['slot_type'],
                'category' => $k['category'],
                'platform' => $platform,
                'total_slots' => $status['total_slots'],
                'held_slots' => $status['held_slots'],
                'available_slots' => $status['available_slots'],
                'status' => $status['status'],
            ];
        }

        return $out;
    }

    public function claimSlot(string $inventoryId, int $smbId): CommunitySlotInventory
    {
        return DB::transaction(function () use ($inventoryId, $smbId) {
            /** @var CommunitySlotInventory|null $row */
            $row = CommunitySlotInventory::query()->whereKey($inventoryId)->lockForUpdate()->first();

            if (! $row) {
                throw new \InvalidArgumentException('Slot inventory row not found.');
            }

            if ($row->total_slots < 999999 && $row->held_slots >= $row->total_slots) {
                throw new \RuntimeException('No slots available to claim.');
            }

            $heldBy = $row->held_by ?? [];
            if (! in_array($smbId, $heldBy, true)) {
                $heldBy[] = $smbId;
            }

            $row->held_slots = $row->held_slots + 1;
            $row->held_by = $heldBy;
            $row->save();

            $this->forgetCacheForRow($row);
            $this->notifySlotWatchers($row);

            $row->refresh();

            return $row;
        });
    }

    public function releaseSlot(string $inventoryId, int $smbId): CommunitySlotInventory
    {
        return DB::transaction(function () use ($inventoryId, $smbId) {
            /** @var CommunitySlotInventory|null $row */
            $row = CommunitySlotInventory::query()->whereKey($inventoryId)->lockForUpdate()->first();

            if (! $row) {
                throw new \InvalidArgumentException('Slot inventory row not found.');
            }

            if ($row->held_slots <= 0) {
                return $row;
            }

            $heldBy = array_values(array_filter(
                $row->held_by ?? [],
                fn ($id) => (int) $id !== $smbId
            ));

            $row->held_slots = max(0, $row->held_slots - 1);
            $row->held_by = $heldBy;
            $row->save();

            $this->forgetCacheForRow($row);

            $row->refresh();

            return $row;
        });
    }

    public function notifySlotWatchers(CommunitySlotInventory $row): void
    {
        $watchers = SMB::query()
            ->where('community_id', $row->community_id)
            ->whereNotNull('products_deferred')
            ->get()
            ->filter(function (SMB $smb) use ($row) {
                $deferred = $smb->products_deferred ?? [];

                return is_array($deferred) && $this->deferredMentionsSlot($deferred, $row->slot_type, $row->category);
            });

        foreach ($watchers as $smb) {
            $session = \App\Models\PitchSession::query()
                ->where('smb_id', $smb->id)
                ->whereIn('status', ['pitching', 'deferred', 'proposed'])
                ->orderByDesc('updated_at')
                ->first();

            if ($session) {
                app(ReengagementQueueService::class)->queue($session, 'slot_alert', [
                    'category' => $row->category,
                    'slot_type' => $row->slot_type,
                    'spots_held' => $row->held_slots,
                    'spots_total' => $row->total_slots,
                ]);
            }
        }
    }

    // ─── Category Slot Limits (CommunitySlotLimit) — merged from SlotEnforcementService ──

    /**
     * Check if a category-level slot is available (for subscription checkout).
     */
    public function checkAvailability(
        string $communityId,
        string $categoryGroup,
        ?string $categorySubtype,
        string $tier = 'influencer'
    ): array {
        $slot = CommunitySlotLimit::where('community_id', $communityId)
            ->where('category_group', $categoryGroup)
            ->where('category_subtype', $categorySubtype)
            ->first();

        if (! $slot) {
            return [
                'available' => false,
                'reason' => 'No slot limits configured for this category',
                'remaining' => 0,
                'max' => 0,
            ];
        }

        if ($tier === 'expert') {
            $remaining = $slot->expertSlotsRemaining();

            return [
                'available' => $remaining > 0,
                'remaining' => $remaining,
                'max' => $slot->max_expert_slots,
                'current' => $slot->current_expert_count,
            ];
        }

        // Influencer: check both category limit AND community ceiling
        $remaining = $slot->influencerSlotsRemaining();

        $totalInfluencers = CommunitySlotLimit::where('community_id', $communityId)
            ->sum('current_influencer_count');

        $ceilingRemaining = max(0, self::COMMUNITY_CEILING - $totalInfluencers);

        return [
            'available' => $remaining > 0 && $ceilingRemaining > 0,
            'remaining' => min($remaining, $ceilingRemaining),
            'max' => $slot->max_influencer_slots,
            'current' => $slot->current_influencer_count,
            'community_ceiling_remaining' => $ceilingRemaining,
        ];
    }

    /**
     * Reserve a category-level slot using row-level locking.
     */
    public function reserveSlot(
        string $communityId,
        string $categoryGroup,
        ?string $categorySubtype,
        string $tier = 'influencer'
    ): bool {
        return DB::transaction(function () use ($communityId, $categoryGroup, $categorySubtype, $tier) {
            $slot = CommunitySlotLimit::where('community_id', $communityId)
                ->where('category_group', $categoryGroup)
                ->where('category_subtype', $categorySubtype)
                ->lockForUpdate()
                ->first();

            if (! $slot) {
                return false;
            }

            if ($tier === 'expert') {
                if ($slot->expertSlotsRemaining() <= 0) {
                    return false;
                }
                $slot->increment('current_expert_count');

                return true;
            }

            // Influencer: check both category limit and community ceiling
            if ($slot->influencerSlotsRemaining() <= 0) {
                return false;
            }

            $totalInfluencers = CommunitySlotLimit::where('community_id', $communityId)
                ->sum('current_influencer_count');

            if ($totalInfluencers >= self::COMMUNITY_CEILING) {
                return false;
            }

            $slot->increment('current_influencer_count');

            return true;
        });
    }

    /**
     * Release a category-level slot when a subscription is cancelled.
     */
    public function releaseCategorySlot(
        string $communityId,
        string $categoryGroup,
        ?string $categorySubtype,
        string $tier = 'influencer'
    ): bool {
        return DB::transaction(function () use ($communityId, $categoryGroup, $categorySubtype, $tier) {
            $slot = CommunitySlotLimit::where('community_id', $communityId)
                ->where('category_group', $categoryGroup)
                ->where('category_subtype', $categorySubtype)
                ->lockForUpdate()
                ->first();

            if (! $slot) {
                return false;
            }

            $column = $tier === 'expert' ? 'current_expert_count' : 'current_influencer_count';

            if ($slot->$column > 0) {
                $slot->decrement($column);
            }

            return true;
        });
    }

    /**
     * Full availability overview for all categories in a community (used by bridge endpoint).
     */
    public function getAvailabilityOverview(string $communityId): array
    {
        $slots = CommunitySlotLimit::where('community_id', $communityId)
            ->orderBy('category_group')
            ->orderBy('category_subtype')
            ->get();

        $totalInfluencers = $slots->sum('current_influencer_count');

        $categories = [];
        foreach ($slots as $slot) {
            $categories[] = [
                'category_group' => $slot->category_group,
                'category_subtype' => $slot->category_subtype,
                'influencer' => [
                    'max' => $slot->max_influencer_slots,
                    'current' => $slot->current_influencer_count,
                    'remaining' => $slot->influencerSlotsRemaining(),
                ],
                'expert' => [
                    'max' => $slot->max_expert_slots,
                    'current' => $slot->current_expert_count,
                    'remaining' => $slot->expertSlotsRemaining(),
                ],
            ];
        }

        return [
            'community_id' => $communityId,
            'community_ceiling' => self::COMMUNITY_CEILING,
            'total_influencers' => $totalInfluencers,
            'ceiling_remaining' => max(0, self::COMMUNITY_CEILING - $totalInfluencers),
            'categories' => $categories,
        ];
    }

    // ─── Private Helpers ─────────────────────────────────────────────

    /**
     * @param  array<int, mixed>  $deferred
     */
    private function deferredMentionsSlot(array $deferred, string $slotType, string $category): bool
    {
        foreach ($deferred as $item) {
            if (! is_array($item)) {
                continue;
            }
            $product = $item['product'] ?? null;
            if (is_string($product) && str_contains($product, $slotType)) {
                return true;
            }
            if (($item['category'] ?? null) === $category) {
                return true;
            }
        }

        return false;
    }

    private function forgetCacheForRow(CommunitySlotInventory $row): void
    {
        Cache::forget($this->cacheKey($row->community_id, $row->slot_type, $row->category, $row->platform));
    }

    /**
     * @return array{record: CommunitySlotInventory|null, total_slots: int, held_slots: int, available_slots: int, status: string}
     */
    private function formatRow(?CommunitySlotInventory $row): array
    {
        if (! $row) {
            return [
                'record' => null,
                'total_slots' => 0,
                'held_slots' => 0,
                'available_slots' => 0,
                'status' => 'open',
            ];
        }

        return [
            'record' => $row,
            'total_slots' => $row->total_slots,
            'held_slots' => $row->held_slots,
            'available_slots' => $row->available_slots,
            'status' => $row->status,
        ];
    }
}
