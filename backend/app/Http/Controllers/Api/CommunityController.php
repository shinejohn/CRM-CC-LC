<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class CommunityController extends Controller
{
    /**
     * List communities
     */
    public function index(Request $request): JsonResponse
    {
        $query = Community::query();

        if ($request->has('state')) {
            $query->where('state', $request->input('state'));
        }

        $communities = $query->withCount('customers')->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $communities->items(),
            'meta' => [
                'current_page' => $communities->currentPage(),
                'last_page' => $communities->lastPage(),
                'per_page' => $communities->perPage(),
                'total' => $communities->total(),
            ],
        ]);
    }

    /**
     * Get community
     */
    public function show(string $id): JsonResponse
    {
        $community = Community::withCount('customers')->findOrFail($id);

        return response()->json(['data' => $community]);
    }

    /**
     * Create community
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:communities,slug',
            'state' => 'required|string|size:2',
            'county' => 'nullable|string',
            'population' => 'nullable|integer',
            'timezone' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        $community = Community::create($validated);

        return response()->json([
            'data' => $community,
            'message' => 'Community created successfully',
        ], 201);
    }

    /**
     * Update community
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $community = Community::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('communities')->ignore($community->id)],
            'state' => 'sometimes|string|size:2',
            'county' => 'nullable|string',
            'population' => 'nullable|integer',
            'timezone' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        $community->update($validated);

        return response()->json([
            'data' => $community->fresh(),
            'message' => 'Community updated successfully',
        ]);
    }

    /**
     * Get SMBs in community
     */
    public function smbs(Request $request, string $id): JsonResponse
    {
        $community = Community::findOrFail($id);
        
        $query = $community->customers();

        // Apply filters
        if ($request->has('engagement_tier')) {
            $query->where('engagement_tier', $request->input('engagement_tier'));
        }

        if ($request->has('campaign_status')) {
            $query->where('campaign_status', $request->input('campaign_status'));
        }

        $customers = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $customers->items(),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
        ]);
    }

    /**
     * Get community stats
     */
    public function stats(string $id): JsonResponse
    {
        $community = Community::findOrFail($id);

        $stats = [
            'total_smbs' => $community->customers()->count(),
            'active_campaigns' => $community->customers()->where('campaign_status', 'running')->count(),
            'by_tier' => $community->customers()
                ->selectRaw('engagement_tier, count(*) as count')
                ->groupBy('engagement_tier')
                ->pluck('count', 'engagement_tier'),
        ];

        return response()->json(['data' => $stats]);
    }
}
