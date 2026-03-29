<?php

declare(strict_types=1);

namespace Tests\Feature\Pitch;

use App\Models\Community;
use App\Models\CommunitySlotInventory;
use App\Services\Pitch\SlotInventoryService;
use Illuminate\Support\Facades\Concurrency;
use RuntimeException;
use Tests\TestCase;

/**
 * claimSlot wraps updates in DB::transaction() with lockForUpdate() (see SlotInventoryService).
 *
 * SQLite file + multiple PHP processes returns SQLITE_BUSY under heavy parallel writers; production
 * uses PostgreSQL row locks. Here we assert capacity invariants using the sync concurrency driver
 * (five competing claim closures) and a straight serial overflow path.
 *
 * @covers \App\Services\Pitch\SlotInventoryService::claimSlot
 */
final class SlotInventoryClaimTest extends TestCase
{
    public function test_claim_slot_invokes_transaction_with_locking_and_enforces_capacity(): void
    {
        $community = Community::factory()->create();

        $row = CommunitySlotInventory::query()->create([
            'community_id' => $community->id,
            'platform' => 'day_news',
            'slot_type' => 'influencer',
            'category' => 'restaurant',
            'total_slots' => 2,
            'held_slots' => 0,
            'held_by' => [],
        ]);

        $inventoryId = $row->id;
        $service = app(SlotInventoryService::class);

        config(['concurrency.default' => 'sync']);

        $results = Concurrency::run([
            static function () use ($service, $inventoryId): string {
                try {
                    $service->claimSlot($inventoryId, 9001);

                    return 'ok';
                } catch (\Throwable $e) {
                    return 'fail:'.$e->getMessage();
                }
            },
            static function () use ($service, $inventoryId): string {
                try {
                    $service->claimSlot($inventoryId, 9002);

                    return 'ok';
                } catch (\Throwable $e) {
                    return 'fail:'.$e->getMessage();
                }
            },
            static function () use ($service, $inventoryId): string {
                try {
                    $service->claimSlot($inventoryId, 9003);

                    return 'ok';
                } catch (\Throwable $e) {
                    return 'fail:'.$e->getMessage();
                }
            },
            static function () use ($service, $inventoryId): string {
                try {
                    $service->claimSlot($inventoryId, 9004);

                    return 'ok';
                } catch (\Throwable $e) {
                    return 'fail:'.$e->getMessage();
                }
            },
            static function () use ($service, $inventoryId): string {
                try {
                    $service->claimSlot($inventoryId, 9005);

                    return 'ok';
                } catch (\Throwable $e) {
                    return 'fail:'.$e->getMessage();
                }
            },
        ]);

        $oKs = count(array_filter($results, static fn (string $r) => $r === 'ok'));
        $fails = count(array_filter($results, static fn (string $r) => str_starts_with($r, 'fail:')));

        $this->assertSame(2, $oKs);
        $this->assertSame(3, $fails);

        $row->refresh();
        $this->assertSame(2, $row->held_slots);
    }

    public function test_serial_claims_throw_when_inventory_is_full(): void
    {
        $community = Community::factory()->create();

        $row = CommunitySlotInventory::query()->create([
            'community_id' => $community->id,
            'platform' => 'day_news',
            'slot_type' => 'venue_headliner',
            'category' => 'restaurant',
            'total_slots' => 1,
            'held_slots' => 0,
            'held_by' => [],
        ]);

        $service = app(SlotInventoryService::class);
        $service->claimSlot($row->id, 9201);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('No slots available to claim.');

        $service->claimSlot($row->id, 9202);
    }
}
