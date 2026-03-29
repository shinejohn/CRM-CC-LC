<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pitch;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunitySlotInventory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CommunityController extends Controller
{
    public function showBySlug(string $slug): JsonResponse
    {
        $community = Community::query()->where('slug', $slug)->firstOrFail();

        return response()->json(['data' => $community]);
    }

    public function nearby(Request $request): JsonResponse
    {
        $data = $request->validate([
            'community_id' => ['required', 'integer', 'exists:communities,id'],
            'category' => ['nullable', 'string', 'max:120'],
            'platform' => ['sometimes', 'nullable', 'string', 'max:80'],
        ]);

        $platform = $data['platform'] ?? 'day_news';

        $base = Community::query()->findOrFail($data['community_id']);

        $slotQuery = CommunitySlotInventory::query()
            ->where('community_id', $base->id)
            ->where('platform', $platform);

        if (! empty($data['category'])) {
            $slotQuery->where('category', $data['category']);
        }

        $slots = $slotQuery->get();

        $nearbyCommunities = Community::query()
            ->where('id', '!=', $base->id)
            ->when($base->county, fn ($q) => $q->where('county', $base->county))
            ->when($base->state, fn ($q) => $q->where('state', $base->state))
            ->orderBy('name')
            ->limit(12)
            ->get(['id', 'name', 'slug', 'state', 'county']);

        return response()->json([
            'data' => [
                'community' => $base,
                'slots' => $slots,
                'nearby_communities' => $nearbyCommunities,
            ],
        ]);
    }
}
