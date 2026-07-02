<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDealRequest;
use App\Http\Requests\UpdateDealRequest;
use App\Models\Deal;
use App\Services\DealService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class DealController extends Controller
{
    public function __construct(
        protected DealService $dealService
    ) {}

    /**
     * Resolve the active tenant strictly from the authenticated user.
     * Never trust a client-supplied header or request body for tenant identity.
     */
    private function tenantId(Request $request): string
    {
        $tenantId = $request->user()?->tenant_id;

        abort_if(empty($tenantId), 403, 'Forbidden: no tenant assigned to this account.');

        return (string) $tenantId;
    }

    /**
     * List deals (paginated, filterable).
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

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
        $tenantId = $this->tenantId($request);

        $byStage = $this->dealService->getByStage($tenantId);

        return response()->json(['data' => $byStage]);
    }

    /**
     * Store a new deal.
     */
    public function store(StoreDealRequest $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $deal = $this->dealService->create($tenantId, $request->validated());

        return response()->json(['data' => $deal], 201);
    }

    /**
     * Show a deal.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $this->tenantId($request);

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
        $tenantId = $this->tenantId($request);

        $deal = Deal::where('tenant_id', $tenantId)->findOrFail($id);
        $deal = $this->dealService->update($deal, $request->validated());

        return response()->json(['data' => $deal]);
    }

    /**
     * Transition deal stage.
     */
    public function transition(Request $request, string $id): JsonResponse
    {
        $tenantId = $this->tenantId($request);

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
        $tenantId = $this->tenantId($request);

        $deal = Deal::where('tenant_id', $tenantId)->findOrFail($id);
        $deal->delete();

        return response()->json(null, 204);
    }
}
