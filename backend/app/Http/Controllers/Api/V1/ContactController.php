<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Models\CrmContact;
use App\Services\CrmContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ContactController extends Controller
{
    public function __construct(
        protected CrmContactService $contactService
    ) {}

    /**
     * List CRM contacts (paginated, filterable).
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $filters = $request->only(['customer_id', 'search', 'is_primary', 'sort_by', 'sort_dir']);
        $perPage = min((int) $request->input('per_page', 20), 100);

        $paginator = $this->contactService->list($tenantId, $filters, $perPage);

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
     * Store a new contact.
     */
    public function store(StoreContactRequest $request): JsonResponse
    {
        $tenantId = $request->getTenantId();
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $contact = $this->contactService->create($tenantId, $request->validated());

        return response()->json(['data' => $contact], 201);
    }

    /**
     * Show a contact.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $contact = CrmContact::where('tenant_id', $tenantId)
            ->with(['customer', 'deals', 'activities'])
            ->findOrFail($id);

        return response()->json(['data' => $contact]);
    }

    /**
     * List activities for a contact.
     * GET /v1/crm-contacts/{id}/activities
     *
     * Tenant is derived strictly from the authenticated user (these nested
     * reads run under auth:sanctum), never a client-supplied header.
     */
    public function activities(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->user()?->tenant_id;
        if (! $tenantId) {
            return response()->json(['error' => 'Forbidden: no tenant assigned to this account.'], 403);
        }

        $contact = CrmContact::where('tenant_id', $tenantId)->findOrFail($id);

        $activities = $contact->activities()
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json(['data' => $activities]);
    }

    /**
     * Update a contact.
     */
    public function update(UpdateContactRequest $request, string $id): JsonResponse
    {
        $tenantId = $request->getTenantId();
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $contact = CrmContact::where('tenant_id', $tenantId)->findOrFail($id);
        $contact = $this->contactService->update($contact, $request->validated());

        return response()->json(['data' => $contact]);
    }

    /**
     * Delete a contact.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $contact = CrmContact::where('tenant_id', $tenantId)->findOrFail($id);
        $contact->delete();

        return response()->json(null, 204);
    }
}
