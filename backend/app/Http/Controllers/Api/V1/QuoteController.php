<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuoteRequest;
use App\Http\Requests\UpdateQuoteRequest;
use App\Models\Quote;
use App\Services\QuoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class QuoteController extends Controller
{
    public function __construct(
        protected QuoteService $quoteService
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
     * List quotes (paginated, filterable).
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $filters = $request->only(['status', 'customer_id', 'search', 'date_from', 'date_to', 'sort_by', 'sort_dir']);
        $perPage = min((int) $request->input('per_page', 20), 100);

        $paginator = $this->quoteService->list($tenantId, $filters, $perPage);

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
     * Store a new quote.
     */
    public function store(StoreQuoteRequest $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $quote = $this->quoteService->create($tenantId, $request->validated());

        return response()->json(['data' => $quote], 201);
    }

    /**
     * Show a quote.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $quote = Quote::where('tenant_id', $tenantId)
            ->with(['customer', 'deal', 'items'])
            ->findOrFail($id);

        return response()->json(['data' => $quote]);
    }

    /**
     * Update a quote.
     */
    public function update(UpdateQuoteRequest $request, string $id): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $quote = Quote::where('tenant_id', $tenantId)->findOrFail($id);
        $quote = $this->quoteService->update($quote, $request->validated());

        return response()->json(['data' => $quote]);
    }

    /**
     * Send quote.
     */
    public function send(Request $request, string $id): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $quote = Quote::where('tenant_id', $tenantId)->findOrFail($id);

        try {
            $quote = $this->quoteService->send($quote);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $quote]);
    }

    /**
     * Convert quote to invoice.
     */
    public function convertToInvoice(Request $request, string $id): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $quote = Quote::where('tenant_id', $tenantId)->findOrFail($id);

        try {
            $invoice = $this->quoteService->convertToInvoice($quote);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $invoice], 201);
    }

    /**
     * Delete a quote.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $quote = Quote::where('tenant_id', $tenantId)->findOrFail($id);
        $quote->delete();

        return response()->json(null, 204);
    }
}
