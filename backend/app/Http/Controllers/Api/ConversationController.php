<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConversationRequest;
use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ConversationController extends Controller
{
    /**
     * List all conversations
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $query = Conversation::where('tenant_id', $tenantId)
            ->with(['customer', 'conversationMessages']);
        
        // Filter by customer
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }
        
        // Filter by outcome
        if ($request->has('outcome')) {
            $query->where('outcome', $request->input('outcome'));
        }
        
        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('started_at', '>=', $request->input('start_date'));
        }
        if ($request->has('end_date')) {
            $query->where('started_at', '<=', $request->input('end_date'));
        }
        
        $perPage = $request->input('per_page', 20);
        $conversations = $query->orderBy('started_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'data' => $conversations->items(),
            'meta' => [
                'current_page' => $conversations->currentPage(),
                'last_page' => $conversations->lastPage(),
                'per_page' => $conversations->perPage(),
                'total' => $conversations->total(),
            ],
        ]);
    }
    
    /**
     * Get a specific conversation
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $conversation = Conversation::where('tenant_id', $tenantId)
            ->with(['customer', 'conversationMessages'])
            ->findOrFail($id);
        
        return response()->json(['data' => $conversation]);
    }
    
    /**
     * Create a new conversation
     */
    public function store(StoreConversationRequest $request): JsonResponse
    {
        $tenantId = $request->getTenantId();
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $validated = $request->validated();
        $validated['tenant_id'] = $tenantId;
        
        // Verify customer belongs to tenant if provided
        if (!empty($validated['customer_id'])) {
            $customer = Customer::where('tenant_id', $tenantId)
                ->findOrFail($validated['customer_id']);
        }
        
        $conversation = Conversation::create($validated);
        
        return response()->json([
            'data' => $conversation,
            'message' => 'Conversation created successfully'
        ], 201);
    }
    
    /**
     * Update a conversation
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $conversation = Conversation::where('tenant_id', $tenantId)->findOrFail($id);
        
        $validated = $request->validate([
            'outcome' => 'nullable|string|max:50',
            'outcome_details' => 'nullable|string',
            'topics_discussed' => 'nullable|array',
            'questions_asked' => 'nullable|array',
            'objections_raised' => 'nullable|array',
            'sentiment_trajectory' => 'nullable|array',
            'new_data_collected' => 'nullable|array',
            'faqs_generated' => 'nullable|array',
            'followup_needed' => 'nullable|boolean',
            'followup_scheduled_at' => 'nullable|date',
            'followup_notes' => 'nullable|string',
            'messages' => 'nullable|array',
        ]);
        
        $conversation->update($validated);
        
        return response()->json([
            'data' => $conversation->fresh(),
            'message' => 'Conversation updated successfully'
        ]);
    }
    
    /**
     * End a conversation
     */
    public function end(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $conversation = Conversation::where('tenant_id', $tenantId)->findOrFail($id);
        
        $conversation->end();
        
        return response()->json([
            'data' => $conversation->fresh(),
            'message' => 'Conversation ended successfully'
        ]);
    }
    
    /**
     * Add a message to a conversation
     */
    public function addMessage(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $conversation = Conversation::where('tenant_id', $tenantId)->findOrFail($id);
        
        $validated = $request->validate([
            'role' => 'required|string|in:user,assistant,system',
            'content' => 'required|string',
            'tokens_used' => 'nullable|integer',
            'model_used' => 'nullable|string|max:50',
            'response_time_ms' => 'nullable|integer',
            'actions_triggered' => 'nullable|array',
        ]);
        
        $validated['conversation_id'] = $conversation->id;
        
        $message = ConversationMessage::create($validated);
        
        // Update conversation messages array
        $messages = $conversation->messages ?? [];
        $messages[] = [
            'role' => $message->role,
            'content' => $message->content,
            'timestamp' => $message->timestamp->toIso8601String(),
        ];
        $conversation->messages = $messages;
        $conversation->save();
        
        return response()->json([
            'data' => $message,
            'message' => 'Message added successfully'
        ], 201);
    }
    
    /**
     * Get conversation messages
     */
    public function messages(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $conversation = Conversation::where('tenant_id', $tenantId)->findOrFail($id);
        
        $messages = ConversationMessage::where('conversation_id', $conversation->id)
            ->orderBy('timestamp', 'asc')
            ->get();
        
        return response()->json(['data' => $messages]);
    }
}
