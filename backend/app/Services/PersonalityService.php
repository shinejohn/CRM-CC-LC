<?php

namespace App\Services;

use App\Models\AiPersonality;
use App\Models\PersonalityAssignment;
use App\Models\Customer;
use App\Models\Conversation;
use App\Services\OpenRouterService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PersonalityService
{
    protected OpenRouterService $openRouterService;
    protected SmbProfileService $smbProfileService;

    public function __construct(OpenRouterService $openRouterService, SmbProfileService $smbProfileService)
    {
        $this->openRouterService = $openRouterService;
        $this->smbProfileService = $smbProfileService;
    }

    /**
     * Assign personality to customer
     */
    public function assignPersonality(
        string $customerId,
        ?string $personalityId = null,
        array $rules = []
    ): PersonalityAssignment {
        $customer = Customer::findOrFail($customerId);
        
        // If no personality specified, find the best match
        if (!$personalityId) {
            $personality = $this->findBestPersonality($customer);
        } else {
            $personality = AiPersonality::findOrFail($personalityId);
        }

        // Check if assignment already exists
        $existing = PersonalityAssignment::where('customer_id', $customerId)
            ->where('personality_id', $personality->id)
            ->first();

        if ($existing) {
            // Reactivate if inactive
            if ($existing->status !== 'active') {
                $existing->update(['status' => 'active']);
            }
            return $existing;
        }

        // Deactivate other assignments for this customer
        PersonalityAssignment::where('customer_id', $customerId)
            ->where('status', 'active')
            ->update(['status' => 'inactive']);

        // Create new assignment
        $assignment = PersonalityAssignment::create([
            'personality_id' => $personality->id,
            'customer_id' => $customerId,
            'tenant_id' => $customer->tenant_id,
            'status' => 'active',
            'assignment_rules' => $rules ?: $this->buildAssignmentRules($customer, $personality),
            'context' => $this->buildContext($customer),
        ]);

        return $assignment;
    }

    /**
     * Find best personality for customer
     */
    public function findBestPersonality(Customer $customer): AiPersonality
    {
        $tenantId = $customer->tenant_id;

        // Get active personalities, ordered by priority
        $personalities = AiPersonality::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'asc')
            ->get();

        if ($personalities->isEmpty()) {
            throw new \Exception('No active personalities found');
        }

        // Score personalities based on customer match
        $bestPersonality = null;
        $bestScore = 0;

        foreach ($personalities as $personality) {
            $score = $this->scorePersonalityMatch($customer, $personality);
            
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestPersonality = $personality;
            }
        }

        return $bestPersonality ?? $personalities->first();
    }

    /**
     * Score how well a personality matches a customer
     */
    private function scorePersonalityMatch(Customer $customer, AiPersonality $personality): int
    {
        $score = 0;

        // Base score from priority
        $score += $personality->priority * 10;

        // Match expertise areas with customer industry
        if ($personality->expertise_areas && $customer->industry_category) {
            foreach ($personality->expertise_areas as $area) {
                if (stripos($customer->industry_category, $area) !== false) {
                    $score += 20;
                    break;
                }
            }
        }

        // Check if personality is currently active (time-based)
        if ($personality->isCurrentlyActive()) {
            $score += 10;
        }

        // Prefer personalities with fewer active assignments (load balancing)
        $activeAssignments = $personality->activeAssignments()->count();
        $score -= $activeAssignments; // Fewer assignments = higher score

        return $score;
    }

    /**
     * Build assignment rules
     */
    private function buildAssignmentRules(Customer $customer, AiPersonality $personality): array
    {
        return [
            'matched_on' => [
                'industry' => $customer->industry_category,
                'personality_priority' => $personality->priority,
            ],
            'assigned_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Build context for personality assignment
     */
    private function buildContext(Customer $customer): array
    {
        return [
            'customer_id' => $customer->id,
            'business_name' => $customer->business_name,
            'industry' => $customer->industry_category,
            'lead_score' => $customer->lead_score,
        ];
    }

    /**
     * Get personality for conversation
     */
    public function getPersonalityForConversation(string $conversationId): ?AiPersonality
    {
        $conversation = Conversation::findOrFail($conversationId);
        
        // Check if conversation already has a personality
        if ($conversation->personality_id) {
            return AiPersonality::find($conversation->personality_id);
        }

        // Get personality from assignment
        if ($conversation->customer_id) {
            $assignment = PersonalityAssignment::where('customer_id', $conversation->customer_id)
                ->where('status', 'active')
                ->first();

            if ($assignment) {
                // Link personality to conversation
                $conversation->update(['personality_id' => $assignment->personality_id]);
                return $assignment->personality;
            }
        }

        return null;
    }

    /**
     * Generate response using personality
     */
    public function generateResponse(
        AiPersonality $personality,
        string $message,
        array $conversationContext = [],
        ?Customer $customer = null
    ): string {
        // Build system prompt with personality context
        $additionalContext = [];

        if ($customer) {
            $additionalContext['customer'] = [
                'business_name' => $customer->business_name,
                'industry' => $customer->industry_category,
            ];
            // Intelligence Hub: inject full profile, AI context, and summary for richer AI responses
            $additionalContext['business_profile'] = $this->smbProfileService->buildFullProfile($customer);
            $additionalContext['ai_context'] = $this->smbProfileService->getAIContext($customer);
            $additionalContext['intelligence_summary'] = $this->smbProfileService->buildIntelligenceSummary($customer);
        }

        $systemPrompt = $personality->getFullSystemPrompt($additionalContext);

        // Build messages
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        // Add conversation history
        foreach ($conversationContext as $msg) {
            $messages[] = [
                'role' => $msg['role'] ?? 'user',
                'content' => $msg['content'] ?? '',
            ];
        }

        // Add current message
        $messages[] = [
            'role' => 'user',
            'content' => $message,
        ];

        // Generate response
        $response = $this->openRouterService->chatCompletion($messages, [
            'model' => $personality->ai_model,
            'temperature' => (float) $personality->temperature,
            'max_tokens' => 2000,
        ]);

        if (!$response) {
            throw new \Exception('Failed to generate response from AI');
        }

        return $response['choices'][0]['message']['content'] ?? 'I apologize, but I was unable to generate a response.';
    }

    /**
     * Get greeting message for personality
     */
    public function getGreeting(AiPersonality $personality, ?Customer $customer = null): string
    {
        if ($personality->greeting_message) {
            $greeting = $personality->greeting_message;
            
            // Replace variables
            if ($customer) {
                $greeting = str_replace('{{customer_name}}', $customer->owner_name ?? $customer->business_name, $greeting);
                $greeting = str_replace('{{business_name}}', $customer->business_name, $greeting);
            }
            
            return $greeting;
        }

        return "Hello! I'm {$personality->identity}. How can I help you today?";
    }
}
