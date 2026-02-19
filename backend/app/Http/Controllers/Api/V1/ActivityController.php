<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Models\CrmActivity;
use App\Services\CrmActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function __construct(
        protected CrmActivityService $activityService
    ) {}

    /**
     * List CRM activities (paginated, filterable).
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $filters = $request->only(['customer_id', 'deal_id', 'type', 'status', 'search', 'date_from', 'date_to', 'sort_by', 'sort_dir']);
        $perPage = min((int) $request->input('per_page', 20), 100);

        $paginator = $this->activityService->list($tenantId, $filters, $perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Store a new activity.
     */
    public function store(StoreActivityRequest $request): JsonResponse
    {
        $tenantId = $request->getTenantId();
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $activity = $this->activityService->create($tenantId, $request->validated());

        return response()->json(['data' => $activity], 201);
    }

    /**
     * Show an activity.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $activity = CrmActivity::where('tenant_id', $tenantId)
            ->with(['customer', 'deal', 'contact'])
            ->findOrFail($id);

        return response()->json(['data' => $activity]);
    }

    /**
     * Update an activity.
     */
    public function update(UpdateActivityRequest $request, string $id): JsonResponse
    {
        $tenantId = $request->getTenantId();
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $activity = CrmActivity::where('tenant_id', $tenantId)->findOrFail($id);
        $activity = $this->activityService->update($activity, $request->validated());

        return response()->json(['data' => $activity]);
    }

    /**
     * Complete an activity.
     */
    public function complete(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $request->validate(['outcome' => 'nullable|string|max:255']);

        $activity = CrmActivity::where('tenant_id', $tenantId)->findOrFail($id);
        $activity = $this->activityService->complete($activity, $request->input('outcome'));

        return response()->json(['data' => $activity]);
    }

    /**
     * Delete an activity.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $activity = CrmActivity::where('tenant_id', $tenantId)->findOrFail($id);
        $activity->delete();

        return response()->json(null, 204);
    }
}
