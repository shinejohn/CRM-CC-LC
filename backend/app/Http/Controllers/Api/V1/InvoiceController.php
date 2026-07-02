<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Models\Invoice;
use App\Services\InvoicePdfService;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class InvoiceController extends Controller
{
    public function __construct(
        protected InvoiceService $invoiceService
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
     * List invoices (paginated, filterable).
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

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
        $tenantId = $this->tenantId($request);

        $invoice = $this->invoiceService->create($tenantId, $request->validated());

        return response()->json(['data' => $invoice], 201);
    }

    /**
     * Show an invoice.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $this->tenantId($request);

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
        $tenantId = $this->tenantId($request);

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
        $tenantId = $this->tenantId($request);

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
        $tenantId = $this->tenantId($request);

        $invoice = Invoice::where('tenant_id', $tenantId)->findOrFail($id);

        try {
            $invoice = $this->invoiceService->send($invoice);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $invoice]);
    }

    /**
     * Download the invoice as a branded PDF.
     */
    public function pdf(Request $request, string $id, InvoicePdfService $pdfService): Response
    {
        $tenantId = $this->tenantId($request);

        $invoice = Invoice::where('tenant_id', $tenantId)
            ->with(['customer', 'items', 'payments'])
            ->findOrFail($id);

        return $pdfService->render($invoice)
            ->download($pdfService->filename($invoice));
    }

    /**
     * Delete an invoice.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $invoice = Invoice::where('tenant_id', $tenantId)->findOrFail($id);
        $invoice->delete();

        return response()->json(null, 204);
    }
}
