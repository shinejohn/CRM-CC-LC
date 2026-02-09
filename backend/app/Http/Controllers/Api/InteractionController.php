<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInteractionRequest;
use App\Models\Interaction;
use App\Models\InteractionTemplate;
use App\Models\Customer;
use App\Services\InteractionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class InteractionController extends Controller
{
    protected InteractionService $interactionService;

    public function __construct(InteractionService $interactionService)
    {
        $this->interactionService = $interactionService;
    }

    /**
     * List all interactions
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = Interaction::where('tenant_id', $tenantId)
            ->with(['customer', 'template', 'nextInteraction', 'previousInteraction']);

        // Filter by customer
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter overdue
        if ($request->boolean('overdue')) {
            $query->where('status', 'pending')
                  ->whereNotNull('due_at')
                  ->where('due_at', '<', now());
        }

        // Filter due soon (within 24 hours)
        if ($request->boolean('due_soon')) {
            $query->where('status', 'pending')
                  ->whereNotNull('due_at')
                  ->where('due_at', '>', now())
                  ->where('due_at', '<=', now()->addDay());
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('scheduled_at', '>=', $request->input('start_date'));
        }
        if ($request->has('end_date')) {
            $query->where('scheduled_at', '<=', $request->input('end_date'));
        }

        $perPage = $request->input('per_page', 20);
        $interactions = $query->orderBy('due_at', 'asc')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $interactions->items(),
            'meta' => [
                'current_page' => $interactions->currentPage(),
                'last_page' => $interactions->lastPage(),
                'per_page' => $interactions->perPage(),
                'total' => $interactions->total(),
            ],
        ]);
    }

    /**
     * Get a specific interaction
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $interaction = Interaction::where('tenant_id', $tenantId)
            ->with(['customer', 'template', 'nextInteraction', 'previousInteraction', 'campaign', 'conversation'])
            ->findOrFail($id);

        return response()->json(['data' => $interaction]);
    }

    /**
     * Create a new interaction
     */
    public function store(StoreInteractionRequest $request): JsonResponse
    {
        $tenantId = $request->getTenantId();
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $validated = $request->validated();

        // Verify customer belongs to tenant
        $customer = Customer::where('tenant_id', $tenantId)
            ->findOrFail($validated['customer_id']);

        $interaction = $this->interactionService->createInteraction(
            $validated['customer_id'],
            $validated['type'],
            $validated['title'],
            $validated
        );

        return response()->json([
            'data' => $interaction->load(['customer', 'template']),
            'message' => 'Interaction created successfully'
        ], 201);
    }

    /**
     * Update an interaction
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $interaction = Interaction::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
            'due_at' => 'nullable|date',
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled,skipped',
            'priority' => 'sometimes|in:low,normal,high,urgent',
            'outcome' => 'nullable|string|max:50',
            'outcome_details' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        // If marking as completed, use the complete method to trigger next step
        if (isset($validated['status']) && $validated['status'] === 'completed' && $interaction->status !== 'completed') {
            $interaction->complete(
                $validated['outcome'] ?? null,
                $validated['outcome_details'] ?? null
            );
            
            // Remove status from validated since complete() already sets it
            unset($validated['status']);
        }

        $interaction->update($validated);

        return response()->json([
            'data' => $interaction->fresh(['customer', 'template', 'nextInteraction']),
            'message' => 'Interaction updated successfully'
        ]);
    }

    /**
     * Complete an interaction (triggers next step creation)
     */
    public function complete(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $interaction = Interaction::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'outcome' => 'nullable|string|max:50',
            'outcome_details' => 'nullable|string',
        ]);

        $interaction->complete(
            $validated['outcome'] ?? null,
            $validated['outcome_details'] ?? null
        );

        $nextInteraction = $interaction->nextInteraction;

        return response()->json([
            'data' => $interaction->fresh(['customer', 'template', 'nextInteraction']),
            'next_interaction' => $nextInteraction,
            'message' => 'Interaction completed successfully' . ($nextInteraction ? '. Next interaction created.' : ''),
        ]);
    }

    /**
     * Cancel an interaction
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $interaction = Interaction::where('tenant_id', $tenantId)->findOrFail($id);

        $interaction->update(['status' => 'cancelled']);

        return response()->json([
            'data' => $interaction->fresh(),
            'message' => 'Interaction cancelled successfully'
        ]);
    }

    /**
     * Start a workflow from a template
     */
    public function startWorkflow(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $validated = $request->validate([
            'customer_id' => 'required|uuid|exists:customers,id',
            'template_id' => 'required|uuid|exists:interaction_templates,id',
            'start_date' => 'nullable|date',
            'campaign_id' => 'nullable|string',
        ]);

        // Verify customer belongs to tenant
        $customer = Customer::where('tenant_id', $tenantId)
            ->findOrFail($validated['customer_id']);

        // Verify template belongs to tenant
        $template = InteractionTemplate::where('tenant_id', $tenantId)
            ->findOrFail($validated['template_id']);

        $interaction = $this->interactionService->startWorkflow(
            $validated['customer_id'],
            $validated['template_id'],
            [
                'start_date' => isset($validated['start_date']) ? new \DateTime($validated['start_date']) : null,
                'campaign_id' => $validated['campaign_id'] ?? null,
            ]
        );

        return response()->json([
            'data' => $interaction->load(['customer', 'template']),
            'message' => 'Workflow started successfully'
        ], 201);
    }

    /**
     * Get next pending interaction for a customer
     */
    public function getNextPending(Request $request, string $customerId): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        // Verify customer belongs to tenant
        $customer = Customer::where('tenant_id', $tenantId)
            ->findOrFail($customerId);

        $interaction = $this->interactionService->getNextPendingInteraction($customerId);

        return response()->json([
            'data' => $interaction,
        ]);
    }

    /**
     * Get all pending interactions for a customer
     */
    public function getPending(Request $request, string $customerId): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        // Verify customer belongs to tenant
        $customer = Customer::where('tenant_id', $tenantId)
            ->findOrFail($customerId);

        $interactions = $this->interactionService->getPendingInteractions($customerId);

        return response()->json([
            'data' => $interactions,
        ]);
    }

    /**
     * Get overdue interactions for a customer
     */
    public function getOverdue(Request $request, string $customerId): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        // Verify customer belongs to tenant
        $customer = Customer::where('tenant_id', $tenantId)
            ->findOrFail($customerId);

        $interactions = $this->interactionService->getOverdueInteractions($customerId);

        return response()->json([
            'data' => $interactions,
        ]);
    }

    /**
     * Interaction Templates Management
     */
    public function templates(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = InteractionTemplate::where('tenant_id', $tenantId);

        if ($request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        $templates = $query->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $templates]);
    }

    /**
     * Create interaction template
     */
    public function createTemplate(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'steps' => 'required|array|min:1',
            'steps.*.step_number' => 'required|integer',
            'steps.*.type' => 'required|string|max:50',
            'steps.*.title' => 'required|string|max:255',
            'steps.*.description' => 'nullable|string',
            'steps.*.scheduled_offset_days' => 'nullable|integer',
            'steps.*.due_offset_days' => 'nullable|integer',
            'steps.*.next_step' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'is_default' => 'nullable|boolean',
        ]);

        // If setting as default, unset other defaults
        if ($validated['is_default'] ?? false) {
            InteractionTemplate::where('tenant_id', $tenantId)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $template = InteractionTemplate::create([
            'tenant_id' => $tenantId,
            'name' => $validated['name'],
            'slug' => \Illuminate\Support\Str::slug($validated['name']) . '-' . \Illuminate\Support\Str::random(6),
            'description' => $validated['description'] ?? null,
            'steps' => $validated['steps'],
            'is_active' => $validated['is_active'] ?? true,
            'is_default' => $validated['is_default'] ?? false,
        ]);

        return response()->json([
            'data' => $template,
            'message' => 'Template created successfully'
        ], 201);
    }
}

