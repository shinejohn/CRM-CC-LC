<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pitch;

use App\Http\Controllers\Controller;
use App\Services\Pitch\SlotInventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SlotInventoryController extends Controller
{
    public function show(
        string $communityId,
        string $slotType,
        string $category,
        Request $request,
        SlotInventoryService $slots,
    ): JsonResponse {
        $platform = $request->query('platform', 'day_news');
        $status = $slots->getStatus($communityId, $slotType, $category, (string) $platform);

        return response()->json([
            'data' => [
                'community_id' => $communityId,
                'slot_type' => $slotType,
                'category' => $category,
                'platform' => $platform,
                'total_slots' => $status['total_slots'],
                'held_slots' => $status['held_slots'],
                'available_slots' => $status['available_slots'],
                'status' => $status['status'],
                'record_id' => $status['record']?->id,
            ],
        ]);
    }

    public function batch(Request $request, SlotInventoryService $slots): JsonResponse
    {
        $data = $request->validate([
            'slots' => ['required', 'array', 'min:1'],
            'slots.*.community_id' => ['required'],
            'slots.*.slot_type' => ['required', 'string', 'max:120'],
            'slots.*.category' => ['required', 'string', 'max:120'],
            'slots.*.platform' => ['sometimes', 'nullable', 'string', 'max:80'],
        ]);

        return response()->json(['data' => $slots->getStatusBatch($data['slots'])]);
    }

    public function claim(Request $request, string $id, SlotInventoryService $slots): JsonResponse
    {
        $data = $request->validate([
            'smb_id' => ['required', 'integer', 'exists:smbs,id'],
        ]);

        $row = $slots->claimSlot($id, $data['smb_id']);

        return response()->json(['data' => ['inventory' => $row]]);
    }
}
