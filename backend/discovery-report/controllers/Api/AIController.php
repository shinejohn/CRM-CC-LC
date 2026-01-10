<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OpenRouterService;
use App\Models\Customer;
use App\Models\Knowledge;
use App\Models\Conversation;
use App\Models\ConversationMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AIController extends Controller
{
    protected OpenRouterService $openRouterService;

    public function __construct(OpenRouterService $openRouterService)
    {
        $this->openRouterService = $openRouterService;
    }

    /**
     * Send chat message to AI
     */
    public function chat(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
            'tenant_id' => 'required|uuid',
            'conversation_id' => 'nullable|uuid|exists:conversations,id',
            'customer_id' => 'nullable|uuid|exists:customers,id',
            'context' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $message = $request->input('message');
        $tenantId = $request->input('tenant_id');
        $conversationId = $request->input('conversation_id');
        $customerId = $request->input('customer_id');
        $context = $request->input('context', []);
        
        // Build AI context
        $aiContext = $this->buildAIContext($tenantId, $customerId, $context);
        
        // Get conversation history
        $messages = [];
        if ($conversationId) {
            $conversation = Conversation::where('tenant_id', $tenantId)
                ->findOrFail($conversationId);
            
            $conversationMessages = ConversationMessage::where('conversation_id', $conversationId)
                ->orderBy('timestamp', 'asc')
                ->get();
            
            foreach ($conversationMessages as $msg) {
                $messages[] = [
                    'role' => $msg->role,
                    'content' => $msg->content,
                ];
            }
        }
        
        // Add user message
        $messages[] = [
            'role' => 'user',
            'content' => $message,
        ];
        
        // Call OpenRouter
        $response = $this->openRouterService->chatCompletion($messages, [
            'system' => $this->buildSystemPrompt($aiContext),
            'temperature' => 0.7,
            'max_tokens' => 2000,
        ]);
        
        if (!$response) {
            return response()->json([
                'error' => 'Failed to get AI response'
            ], 500);
        }
        
        $aiResponse = $response['choices'][0]['message']['content'] ?? '';
        
        // Parse actions from response
        $actions = $this->parseActions($aiResponse);
        $cleanResponse = $this->cleanResponse($aiResponse);
        
        // Create or update conversation
        if (!$conversationId) {
            $conversation = Conversation::create([
                'tenant_id' => $tenantId,
                'customer_id' => $customerId,
                'session_id' => 'session_' . Str::random(32),
                'entry_point' => 'chat',
                'messages' => [],
            ]);
            $conversationId = $conversation->id;
        } else {
            $conversation = Conversation::findOrFail($conversationId);
        }
        
        // Save messages
        ConversationMessage::create([
            'conversation_id' => $conversationId,
            'role' => 'user',
            'content' => $message,
        ]);
        
        ConversationMessage::create([
            'conversation_id' => $conversationId,
            'role' => 'assistant',
            'content' => $cleanResponse,
            'model_used' => $response['model'] ?? 'unknown',
            'tokens_used' => $response['usage']['total_tokens'] ?? null,
        ]);
        
        // Update conversation messages array
        $conversationMessages = $conversation->messages ?? [];
        $conversationMessages[] = ['role' => 'user', 'content' => $message, 'timestamp' => now()->toIso8601String()];
        $conversationMessages[] = ['role' => 'assistant', 'content' => $cleanResponse, 'timestamp' => now()->toIso8601String()];
        $conversation->messages = $conversationMessages;
        $conversation->save();
        
        return response()->json([
            'data' => [
                'response' => $cleanResponse,
                'conversation_id' => $conversationId,
                'suggested_actions' => $actions,
                'model' => $response['model'] ?? 'unknown',
                'tokens_used' => $response['usage']['total_tokens'] ?? null,
            ],
            'message' => 'AI response generated successfully',
        ]);
    }
    
    /**
     * Get AI context for customer
     */
    public function getContext(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => 'required|uuid',
            'customer_id' => 'nullable|uuid|exists:customers,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $tenantId = $request->input('tenant_id');
        $customerId = $request->input('customer_id');
        
        $context = $this->buildAIContext($tenantId, $customerId);
        
        return response()->json([
            'data' => $context,
        ]);
    }
    
    /**
     * Build AI context from database
     */
    protected function buildAIContext(string $tenantId, ?string $customerId, array $additionalContext = []): array
    {
        $context = [
            'product_knowledge' => [],
            'industry_knowledge' => [],
            'customer_data' => null,
            'faqs' => [],
        ];
        
        // Get knowledge base content
        $knowledge = Knowledge::where('tenant_id', $tenantId)
            ->where('is_public', true)
            ->orderBy('usage_count', 'desc')
            ->orderBy('helpful_count', 'desc')
            ->limit(50)
            ->get(['title', 'content', 'category', 'source', 'validation_status']);
        
        foreach ($knowledge as $item) {
            if ($item->category === 'faq') {
                $context['faqs'][] = [
                    'question' => $item->title,
                    'answer' => $item->content,
                ];
            } else {
                $context['product_knowledge'][] = [
                    'title' => $item->title,
                    'content' => $item->content,
                    'category' => $item->category,
                ];
            }
        }
        
        // Get customer data if provided
        if ($customerId) {
            $customer = Customer::where('tenant_id', $tenantId)->find($customerId);
            if ($customer) {
                $context['customer_data'] = [
                    'business_name' => $customer->business_name,
                    'owner_name' => $customer->owner_name,
                    'industry' => $customer->industry_category,
                    'description' => $customer->business_description,
                    'lead_score' => $customer->lead_score,
                ];
            }
        }
        
        // Merge additional context
        return array_merge_recursive($context, $additionalContext);
    }
    
    /**
     * Build system prompt for AI
     */
    protected function buildSystemPrompt(array $context): string
    {
        return "You are an AI assistant for Fibonacco, helping local businesses understand how AI employees can transform their operations.

CONTEXT:
" . json_encode($context, JSON_PRETTY_PRINT) . "

INSTRUCTIONS:
- Answer questions based on the provided context
- If information is missing, ask intelligent questions to fill gaps
- Suggest creating FAQs when you provide new information
- Be conversational, helpful, and professional
- Focus on how AI can solve specific business problems

When you suggest actions, use this format:
ACTION: {\"type\": \"update_customer_data\", \"data\": {...}}
ACTION: {\"type\": \"create_faq\", \"data\": {\"question\": \"...\", \"answer\": \"...\"}}";
    }
    
    /**
     * Parse actions from AI response
     */
    protected function parseActions(string $response): array
    {
        $actions = [];
        $pattern = '/ACTION:\s*(\{.*?\})/s';
        
        if (preg_match_all($pattern, $response, $matches)) {
            foreach ($matches[1] as $match) {
                try {
                    $action = json_decode($match, true);
                    if ($action) {
                        $actions[] = $action;
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to parse AI action', ['action' => $match, 'error' => $e->getMessage()]);
                }
            }
        }
        
        return $actions;
    }
    
    /**
     * Clean response by removing action markers
     */
    protected function cleanResponse(string $response): string
    {
        return trim(preg_replace('/ACTION:\s*\{.*?\}/s', '', $response));
    }
    
    /**
     * Get available AI models
     */
    public function models(): JsonResponse
    {
        $models = $this->openRouterService->getModels();
        
        return response()->json([
            'data' => $models,
            'count' => count($models),
        ]);
    }
}
