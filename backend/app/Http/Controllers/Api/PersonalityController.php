<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiPersonality;
use App\Models\PersonalityAssignment;
use App\Models\Customer;
use App\Services\PersonalityService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PersonalityController extends Controller
{
    protected PersonalityService $personalityService;

    public function __construct(PersonalityService $personalityService)
    {
        $this->personalityService = $personalityService;
    }

    /**
     * List all personalities
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = AiPersonality::where('tenant_id', $tenantId);

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $perPage = $request->input('per_page', 20);
        $personalities = $query->orderBy('priority', 'desc')
            ->orderBy('name')
            ->paginate($perPage);

        return response()->json([
            'data' => $personalities->items(),
            'meta' => [
                'current_page' => $personalities->currentPage(),
                'last_page' => $personalities->lastPage(),
                'per_page' => $personalities->perPage(),
                'total' => $personalities->total(),
            ],
        ]);
    }

    /**
     * Get personality details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $personality = AiPersonality::where('tenant_id', $tenantId)
            ->withCount(['assignments', 'activeAssignments', 'conversations'])
            ->findOrFail($id);

        return response()->json(['data' => $personality]);
    }

    /**
     * Create personality
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'identity' => 'required|string|max:255',
            'persona_description' => 'required|string',
            'communication_style' => 'required|string',
            'system_prompt' => 'required|string',
            'description' => 'nullable|string',
            'traits' => 'nullable|array',
            'expertise_areas' => 'nullable|array',
            'can_email' => 'nullable|boolean',
            'can_call' => 'nullable|boolean',
            'can_sms' => 'nullable|boolean',
            'can_chat' => 'nullable|boolean',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'greeting_message' => 'nullable|string',
            'custom_instructions' => 'nullable|array',
            'ai_model' => 'nullable|string',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'active_hours' => 'nullable|array',
            'working_days' => 'nullable|array',
            'timezone' => 'nullable|string',
            'priority' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $personality = AiPersonality::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'slug' => Str::slug($request->input('name')) . '-' . Str::random(6),
            'identity' => $request->input('identity'),
            'persona_description' => $request->input('persona_description'),
            'communication_style' => $request->input('communication_style'),
            'system_prompt' => $request->input('system_prompt'),
            'description' => $request->input('description'),
            'traits' => $request->input('traits', []),
            'expertise_areas' => $request->input('expertise_areas', []),
            'can_email' => $request->input('can_email', true),
            'can_call' => $request->input('can_call', false),
            'can_sms' => $request->input('can_sms', false),
            'can_chat' => $request->input('can_chat', true),
            'contact_email' => $request->input('contact_email'),
            'contact_phone' => $request->input('contact_phone'),
            'greeting_message' => $request->input('greeting_message'),
            'custom_instructions' => $request->input('custom_instructions', []),
            'ai_model' => $request->input('ai_model', 'anthropic/claude-3.5-sonnet'),
            'temperature' => $request->input('temperature', 0.7),
            'active_hours' => $request->input('active_hours'),
            'working_days' => $request->input('working_days'),
            'timezone' => $request->input('timezone', 'UTC'),
            'priority' => $request->input('priority', 0),
        ]);

        return response()->json([
            'data' => $personality,
            'message' => 'Personality created successfully',
        ], 201);
    }

    /**
     * Update personality
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $personality = AiPersonality::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'identity' => 'sometimes|string|max:255',
            'persona_description' => 'sometimes|string',
            'communication_style' => 'sometimes|string',
            'system_prompt' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'priority' => 'sometimes|integer',
            // ... other fields
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $personality->update($request->only([
            'name', 'identity', 'persona_description', 'communication_style',
            'system_prompt', 'description', 'traits', 'expertise_areas',
            'can_email', 'can_call', 'can_sms', 'can_chat',
            'contact_email', 'contact_phone', 'greeting_message',
            'custom_instructions', 'ai_model', 'temperature',
            'active_hours', 'working_days', 'timezone',
            'is_active', 'priority', 'notes',
        ]));

        return response()->json([
            'data' => $personality->fresh(),
            'message' => 'Personality updated successfully',
        ]);
    }

    /**
     * Delete personality
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $personality = AiPersonality::where('tenant_id', $tenantId)->findOrFail($id);

        $personality->delete();

        return response()->json(['message' => 'Personality deleted successfully']);
    }

    /**
     * Assign personality to customer
     */
    public function assignToCustomer(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|uuid|exists:customers,id',
            'personality_id' => 'nullable|uuid|exists:ai_personalities,id',
            'rules' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $assignment = $this->personalityService->assignPersonality(
                $request->input('customer_id'),
                $request->input('personality_id'),
                $request->input('rules', [])
            );

            return response()->json([
                'data' => $assignment->load(['personality', 'customer']),
                'message' => 'Personality assigned successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to assign personality',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer's assigned personality
     */
    public function getCustomerPersonality(Request $request, string $customerId): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $assignment = PersonalityAssignment::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->with('personality')
            ->first();

        if (!$assignment) {
            return response()->json([
                'data' => null,
                'message' => 'No active personality assignment found',
            ]);
        }

        return response()->json(['data' => $assignment]);
    }

    /**
     * List personality assignments
     */
    public function assignments(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = PersonalityAssignment::where('tenant_id', $tenantId)
            ->with(['personality', 'customer']);

        // Filter by personality
        if ($request->has('personality_id')) {
            $query->where('personality_id', $request->input('personality_id'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = $request->input('per_page', 20);
        $assignments = $query->orderBy('assigned_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $assignments->items(),
            'meta' => [
                'current_page' => $assignments->currentPage(),
                'last_page' => $assignments->lastPage(),
                'per_page' => $assignments->perPage(),
                'total' => $assignments->total(),
            ],
        ]);
    }

    /**
     * Generate response using personality
     */
    public function generateResponse(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
            'conversation_context' => 'nullable|array',
            'customer_id' => 'nullable|uuid|exists:customers,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $personality = AiPersonality::where('tenant_id', $tenantId)->findOrFail($id);
        
        $customer = null;
        if ($request->has('customer_id')) {
            $customer = Customer::find($request->input('customer_id'));
        }

        try {
            $response = $this->personalityService->generateResponse(
                $personality,
                $request->input('message'),
                $request->input('conversation_context', []),
                $customer
            );

            return response()->json([
                'data' => [
                    'response' => $response,
                    'personality_id' => $personality->id,
                    'personality_name' => $personality->identity,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate response',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
