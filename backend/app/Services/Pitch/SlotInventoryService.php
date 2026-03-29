<?php

declare(strict_types=1);

namespace App\Services\Pitch;

use App\Models\CommunitySlotInventory;
use App\Models\SMB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

final class SlotInventoryService
{
    private const CACHE_TTL_SECONDS = 300;

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
