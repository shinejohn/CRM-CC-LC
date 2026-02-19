<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Models\Invoice;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function __construct(
        protected InvoiceService $invoiceService
    ) {}

    /**
     * List invoices (paginated, filterable).
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $filters = $request->only(['status', 'customer_id', 'search', 'date_from', 'date_to', 'sort_by', 'sort_dir']);
        $perPage = min((int) $request->input('per_page', 20), 100);

        $paginator = $this->invoiceService->list($tenantId, $filters, $perPage);

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
     * Store a new invoice.
     */
    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $tenantId = $request->getTenantId();
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $invoice = $this->invoiceService->create($tenantId, $request->validated());

        return response()->json(['data' => $invoice], 201);
    }

    /**
     * Show an invoice.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $invoice = Invoice::where('tenant_id', $tenantId)
            ->with(['customer', 'quote', 'items', 'payments'])
            ->findOrFail($id);

        return response()->json(['data' => $invoice]);
    }

    /**
     * Update an invoice (draft only).
     */
    public function update(UpdateInvoiceRequest $request, string $id): JsonResponse
    {
        $tenantId = $request->getTenantId();
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $invoice = Invoice::where('tenant_id', $tenantId)->findOrFail($id);

        if ($invoice->status !== 'draft') {
            return response()->json(['error' => 'Only draft invoices can be updated'], 422);
        }

        $invoice->fill($request->validated());
        $invoice->save();

        return response()->json(['data' => $invoice->load(['customer', 'quote', 'items', 'payments'])]);
    }

    /**
     * Record payment on invoice.
     */
    public function recordPayment(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string|max:50',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $invoice = Invoice::where('tenant_id', $tenantId)->findOrFail($id);

        try {
            $invoice = $this->invoiceService->recordPayment(
                $invoice,
                (float) $request->input('amount'),
                $request->only(['payment_method', 'reference', 'notes'])
            );
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $invoice]);
    }

    /**
     * Send invoice.
     */
    public function send(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $invoice = Invoice::where('tenant_id', $tenantId)->findOrFail($id);

        try {
            $invoice = $this->invoiceService->send($invoice);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $invoice]);
    }

    /**
     * Delete an invoice.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $invoice = Invoice::where('tenant_id', $tenantId)->findOrFail($id);
        $invoice->delete();

        return response()->json(null, 204);
    }
}
