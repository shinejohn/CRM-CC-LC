<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CampaignTimeline;
use App\Services\ManifestDestinySimulationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ManifestDestinySimulationController extends Controller
{
    public function __construct(
        private readonly ManifestDestinySimulationService $simulationService,
    ) {}

    /**
     * GET /api/v1/manifest-destiny/timelines
     *
     * Return all active timelines with action counts.
     */
    public function timelines(): JsonResponse
    {
        $timelines = CampaignTimeline::where('is_active', true)
            ->withCount('actions')
            ->orderBy('pipeline_stage')
            ->get()
            ->map(fn (CampaignTimeline $t): array => [
                'id' => $t->id,
                'name' => $t->name,
                'slug' => $t->slug,
                'pipeline_stage' => $t->pipeline_stage->value,
                'duration_days' => $t->duration_days,
                'action_count' => $t->actions_count,
                'description' => $t->description,
            ]);

        return response()->json([
            'data' => $timelines,
        ]);
    }

    /**
     * GET /api/v1/manifest-destiny/simulate?timeline=...&profile=...
     *
     * Run a full simulation and return the result.
     */
    public function simulate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'timeline' => ['sometimes', 'string', 'max:100'],
            'profile' => ['sometimes', 'string', 'in:engaged,passive,cold'],
            'business_name' => ['sometimes', 'string', 'max:200'],
            'community_name' => ['sometimes', 'string', 'max:200'],
            'contact_name' => ['sometimes', 'string', 'max:200'],
            'city' => ['sometimes', 'string', 'max:200'],
            'first_name' => ['sometimes', 'string', 'max:100'],
        ]);

        $timelineSlug = $validated['timeline'] ?? 'manifest-destiny-hook';
        $profile = $validated['profile'] ?? 'engaged';

        $overrides = array_filter([
            'business_name' => $validated['business_name'] ?? null,
            'community_name' => $validated['community_name'] ?? null,
            'contact_name' => $validated['contact_name'] ?? null,
            'city' => $validated['city'] ?? null,
            'first_name' => $validated['first_name'] ?? null,
        ]);

        try {
            $result = $this->simulationService->simulate($timelineSlug, $profile, $overrides);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'error' => 'Timeline not found',
                'timeline' => $timelineSlug,
            ], 404);
        }

        return response()->json([
            'data' => $result,
        ]);
    }
}
