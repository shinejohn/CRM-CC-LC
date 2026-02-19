<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDealRequest;
use App\Http\Requests\UpdateDealRequest;
use App\Models\Deal;
use App\Services\DealService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DealController extends Controller
{
    public function __construct(
        protected DealService $dealService
    ) {}

    /**
     * List deals (paginated, filterable).
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $filters = $request->only(['stage', 'customer_id', 'search', 'date_from', 'date_to', 'sort_by', 'sort_dir']);
        $perPage = min((int) $request->input('per_page', 20), 100);

        $paginator = $this->dealService->list($tenantId, $filters, $perPage);

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
     * Get deals by stage for kanban board.
     */
    public function pipeline(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $byStage = $this->dealService->getByStage($tenantId);

        return response()->json(['data' => $byStage]);
    }

    /**
     * Store a new deal.
     */
    public function store(StoreDealRequest $request): JsonResponse
    {
        $tenantId = $request->getTenantId();
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $deal = $this->dealService->create($tenantId, $request->validated());

        return response()->json(['data' => $deal], 201);
    }

    /**
     * Show a deal.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $deal = Deal::where('tenant_id', $tenantId)
            ->with(['customer', 'contact', 'activities'])
            ->findOrFail($id);

        return response()->json(['data' => $deal]);
    }

    /**
     * Update a deal.
     */
    public function update(UpdateDealRequest $request, string $id): JsonResponse
    {
        $tenantId = $request->getTenantId();
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $deal = Deal::where('tenant_id', $tenantId)->findOrFail($id);
        $deal = $this->dealService->update($deal, $request->validated());

        return response()->json(['data' => $deal]);
    }

    /**
     * Transition deal stage.
     */
    public function transition(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $request->validate([
            'stage' => 'required|in:hook,engagement,sales,retention,won,lost',
            'loss_reason' => 'required_if:stage,lost|nullable|string|max:255',
        ]);

        $deal = Deal::where('tenant_id', $tenantId)->findOrFail($id);

        try {
            $deal = $this->dealService->transitionStage(
                $deal,
                $request->input('stage'),
                $request->input('loss_reason')
            );
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $deal]);
    }

    /**
     * Delete a deal.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $deal = Deal::where('tenant_id', $tenantId)->findOrFail($id);
        $deal->delete();

        return response()->json(null, 204);
    }
}
