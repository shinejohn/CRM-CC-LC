<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\AiPersonality;
use App\Models\DialogExecution;
use App\Services\AccountManagerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AccountManagerController extends Controller
{
    public function __construct(
        protected AccountManagerService $amService
    ) {}
    
    /**
     * Assign an AM to a customer
     */
    public function assign(Customer $customer, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'personality_id' => 'nullable|uuid|exists:ai_personalities,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $personality = $request->has('personality_id') 
            ? AiPersonality::find($request->personality_id)
            : null;
        
        $assignment = $this->amService->assignToCustomer($customer, $personality);
        
        return response()->json([
            'success' => true,
            'assignment' => $assignment,
            'personality' => $assignment->personality,
        ]);
    }
    
    /**
     * Get AM for a customer
     */
    public function getForCustomer(Customer $customer): JsonResponse
    {
        $am = $this->amService->getAccountManager($customer);
        
        return response()->json([
            'personality' => $am,
        ]);
    }
    
    /**
     * Initiate proactive outreach
     */
    public function initiateOutreach(Customer $customer, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'channel' => 'required|in:email,sms,phone',
            'reason' => 'required|string',
            'context' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $this->amService->initiateOutreach(
            $customer,
            $request->channel,
            $request->reason,
            $request->context ?? []
        );
        
        return response()->json([
            'success' => true,
            'message' => "Outreach initiated via {$request->channel}",
        ]);
    }
    
    /**
     * Start a dialog tree
     */
    public function startDialog(Customer $customer, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'trigger_type' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $execution = $this->amService->startDialog($customer, $request->trigger_type);
        
        if (!$execution) {
            return response()->json([
                'success' => false,
                'message' => 'No dialog tree found for trigger type',
            ], 404);
        }
        
        $currentNode = $execution->dialogTree->getNode($execution->current_node);
        
        return response()->json([
            'success' => true,
            'execution' => $execution,
            'current_node' => [
                'type' => $currentNode->node_type,
                'content' => $currentNode->content,
                'prompt' => $currentNode->prompt,
            ],
        ]);
    }
    
    /**
     * Process dialog response
     */
    public function processResponse(DialogExecution $execution, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'response' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $result = $this->amService->processDialogResponse($execution, $request->response);
        
        return response()->json([
            'success' => true,
            'result' => $result,
        ]);
    }
    
    /**
     * Generate AI response
     */
    public function generateResponse(Customer $customer, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
            'channel' => 'nullable|string',
            'context' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $response = $this->amService->generateResponse(
            $customer,
            $request->message,
            array_merge($request->context ?? [], ['channel' => $request->channel ?? 'chat'])
        );
        
        return response()->json([
            'success' => true,
            'response' => $response,
        ]);
    }
    
    /**
     * List all personalities
     */
    public function listPersonalities(Request $request): JsonResponse
    {
        $personalities = AiPersonality::where('is_active', true)
            ->orWhere('is_available', true)
            ->get();
        
        return response()->json([
            'personalities' => $personalities,
        ]);
    }
    
    /**
     * Show a specific personality
     */
    public function showPersonality(AiPersonality $personality): JsonResponse
    {
        return response()->json([
            'personality' => $personality,
        ]);
    }
}

