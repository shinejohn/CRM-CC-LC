<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Interaction;
use App\Jobs\SendSMS;
use App\Jobs\MakePhoneCall;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class SMSResponseHandler
{
    public function __construct(
        protected SMSService $smsService,
        protected EngagementService $engagementService
    ) {}

    /**
     * Handle SMS response based on classified intent
     * 
     * @param Customer $customer The customer who sent the SMS
     * @param string $message The original SMS message
     * @param string $intent The classified intent
     * @param float $confidence The confidence score
     * @return array Result of handling the response
     */
    public function handle(
        Customer $customer,
        string $message,
        string $intent,
        float $confidence
    ): array {
        return match($intent) {
            'yes' => $this->handleYes($customer, $message),
            'no' => $this->handleNo($customer, $message),
            'question' => $this->handleQuestion($customer, $message),
            'call_request' => $this->handleCallRequest($customer, $message),
            'appointment' => $this->handleAppointment($customer, $message),
            'pricing' => $this->handlePricing($customer, $message),
            default => $this->handleOther($customer, $message),
        };
    }

    /**
     * Handle YES response - send landing page link and update CRM
     */
    protected function handleYes(Customer $customer, string $message): array
    {
        // Get appropriate landing page URL for customer
        $landingPageUrl = $this->getLandingPageUrl($customer);
        
        // Generate personalized message
        $customerName = $customer->contact_name ?? $customer->owner_name ?? 'there';
        $responseMessage = "Great {$customerName}! Check this out: {$landingPageUrl}";
        
        // Send SMS response
        $result = $this->smsService->send(
            $customer->phone,
            $responseMessage,
            [
                'campaign_id' => $customer->current_campaign_id,
                'status_callback' => url('/webhooks/twilio'),
            ]
        );
        
        // Update CRM - mark as interested
        $customer->update([
            'campaign_status' => 'interested',
        ]);
        
        // Create interaction record
        Interaction::create([
            'customer_id' => $customer->id,
            'type' => 'sms_response',
            'channel' => 'sms',
            'status' => 'completed',
            'notes' => "Customer responded YES: {$message}",
            'metadata' => [
                'intent' => 'yes',
                'response_sent' => true,
                'landing_page_url' => $landingPageUrl,
            ],
        ]);
        
        // Update engagement score
        $this->updateEngagementScore($customer, 'sms_interaction');
        
        Log::info("Handled YES SMS response", [
            'customer_id' => $customer->id,
            'message' => substr($message, 0, 100),
            'landing_page' => $landingPageUrl,
        ]);
        
        return [
            'handled' => true,
            'intent' => 'yes',
            'response_sent' => $result !== null,
            'landing_page_url' => $landingPageUrl,
        ];
    }

    /**
     * Handle NO response - opt-out gracefully
     */
    protected function handleNo(Customer $customer, string $message): array
    {
        // Check if this is an opt-out request
        $isOptOut = $this->isOptOutRequest($message);
        
        if ($isOptOut) {
            // Handle opt-out
            $customer->update([
                'sms_opted_in' => false,
                'do_not_contact' => true,
            ]);
            
            $responseMessage = "You've been unsubscribed. Reply START to opt back in anytime.";
        } else {
            // Just a negative response, not an opt-out
            $customerName = $customer->contact_name ?? $customer->owner_name ?? 'there';
            $responseMessage = "No problem {$customerName}. If you change your mind, just let me know!";
            
            // Update status but don't opt out
            $customer->update([
                'campaign_status' => 'not_interested',
            ]);
        }
        
        // Send response
        $result = $this->smsService->send(
            $customer->phone,
            $responseMessage,
            [
                'status_callback' => url('/webhooks/twilio'),
            ]
        );
        
        // Create interaction record
        Interaction::create([
            'customer_id' => $customer->id,
            'type' => $isOptOut ? 'opt_out' : 'sms_response',
            'channel' => 'sms',
            'status' => 'completed',
            'notes' => $isOptOut 
                ? "Customer opted out via SMS: {$message}"
                : "Customer responded NO: {$message}",
            'metadata' => [
                'intent' => 'no',
                'is_opt_out' => $isOptOut,
                'response_sent' => true,
            ],
        ]);
        
        Log::info("Handled NO SMS response", [
            'customer_id' => $customer->id,
            'is_opt_out' => $isOptOut,
            'message' => substr($message, 0, 100),
        ]);
        
        return [
            'handled' => true,
            'intent' => 'no',
            'is_opt_out' => $isOptOut,
            'response_sent' => $result !== null,
        ];
    }

    /**
     * Handle QUESTION response - generate AI answer
     */
    protected function handleQuestion(Customer $customer, string $message): array
    {
        // Generate AI answer using OpenRouter
        $answer = $this->generateAIAnswer($customer, $message);
        
        // Send response
        $result = $this->smsService->send(
            $customer->phone,
            $answer,
            [
                'status_callback' => url('/webhooks/twilio'),
            ]
        );
        
        // Create interaction record
        Interaction::create([
            'customer_id' => $customer->id,
            'type' => 'question_answered',
            'channel' => 'sms',
            'status' => 'completed',
            'notes' => "Question: {$message}\nAnswer: {$answer}",
            'metadata' => [
                'intent' => 'question',
                'question' => $message,
                'answer' => $answer,
                'response_sent' => true,
            ],
        ]);
        
        // Update engagement score
        $this->updateEngagementScore($customer, 'sms_interaction');
        
        Log::info("Handled QUESTION SMS response", [
            'customer_id' => $customer->id,
            'question' => substr($message, 0, 100),
        ]);
        
        return [
            'handled' => true,
            'intent' => 'question',
            'response_sent' => $result !== null,
            'answer_length' => strlen($answer),
        ];
    }

    /**
     * Handle CALL_REQUEST - schedule callback
     */
    protected function handleCallRequest(Customer $customer, string $message): array
    {
        // Schedule callback (could use a job queue)
        // For now, create an interaction that needs follow-up
        Interaction::create([
            'customer_id' => $customer->id,
            'type' => 'callback_request',
            'channel' => 'sms',
            'status' => 'pending',
            'priority' => 'high',
            'notes' => "Customer requested callback via SMS: {$message}",
            'metadata' => [
                'intent' => 'call_request',
                'requested_via' => 'sms',
            ],
        ]);
        
        // Send acknowledgment
        $customerName = $customer->contact_name ?? $customer->owner_name ?? 'there';
        $responseMessage = "Thanks {$customerName}! We'll call you soon. Our number is " . config('services.twilio.from_phone');
        
        $result = $this->smsService->send(
            $customer->phone,
            $responseMessage,
            [
                'status_callback' => url('/webhooks/twilio'),
            ]
        );
        
        // Update engagement score
        $this->updateEngagementScore($customer, 'sms_interaction');
        
        Log::info("Handled CALL_REQUEST SMS response", [
            'customer_id' => $customer->id,
            'message' => substr($message, 0, 100),
        ]);
        
        return [
            'handled' => true,
            'intent' => 'call_request',
            'callback_scheduled' => true,
            'response_sent' => $result !== null,
        ];
    }

    /**
     * Handle APPOINTMENT request
     */
    protected function handleAppointment(Customer $customer, string $message): array
    {
        // Create interaction for appointment scheduling
        Interaction::create([
            'customer_id' => $customer->id,
            'type' => 'appointment_request',
            'channel' => 'sms',
            'status' => 'pending',
            'priority' => 'normal',
            'notes' => "Appointment request via SMS: {$message}",
            'metadata' => [
                'intent' => 'appointment',
            ],
        ]);
        
        // Send response with scheduling link
        $customerName = $customer->contact_name ?? $customer->owner_name ?? 'there';
        $schedulingUrl = config('app.url') . '/schedule?customer=' . $customer->id;
        $responseMessage = "Hi {$customerName}! Schedule here: {$schedulingUrl}";
        
        $result = $this->smsService->send(
            $customer->phone,
            $responseMessage,
            [
                'status_callback' => url('/webhooks/twilio'),
            ]
        );
        
        // Update engagement score
        $this->updateEngagementScore($customer, 'sms_interaction');
        
        return [
            'handled' => true,
            'intent' => 'appointment',
            'response_sent' => $result !== null,
        ];
    }

    /**
     * Handle PRICING inquiry
     */
    protected function handlePricing(Customer $customer, string $message): array
    {
        // Send pricing information
        $customerName = $customer->contact_name ?? $customer->owner_name ?? 'there';
        $pricingUrl = config('app.url') . '/pricing';
        $responseMessage = "Hi {$customerName}! Check our pricing: {$pricingUrl} Or reply CALL to speak with us.";
        
        $result = $this->smsService->send(
            $customer->phone,
            $responseMessage,
            [
                'status_callback' => url('/webhooks/twilio'),
            ]
        );
        
        // Create interaction
        Interaction::create([
            'customer_id' => $customer->id,
            'type' => 'pricing_inquiry',
            'channel' => 'sms',
            'status' => 'completed',
            'notes' => "Pricing inquiry via SMS: {$message}",
            'metadata' => [
                'intent' => 'pricing',
                'response_sent' => true,
            ],
        ]);
        
        // Update engagement score
        $this->updateEngagementScore($customer, 'sms_interaction');
        
        return [
            'handled' => true,
            'intent' => 'pricing',
            'response_sent' => $result !== null,
        ];
    }

    /**
     * Handle OTHER/unknown intent
     */
    protected function handleOther(Customer $customer, string $message): array
    {
        // Create interaction for human review
        Interaction::create([
            'customer_id' => $customer->id,
            'type' => 'sms_needs_review',
            'channel' => 'sms',
            'status' => 'pending',
            'notes' => "Unclassified SMS: {$message}",
            'metadata' => [
                'intent' => 'other',
                'message' => $message,
            ],
        ]);
        
        // Send generic acknowledgment
        $responseMessage = "Thanks for your message! We'll get back to you soon.";
        
        $result = $this->smsService->send(
            $customer->phone,
            $responseMessage,
            [
                'status_callback' => url('/webhooks/twilio'),
            ]
        );
        
        // Update engagement score (smaller increment for unclassified)
        $this->updateEngagementScore($customer, 'sms_interaction', 0.5);
        
        Log::info("Handled OTHER SMS response", [
            'customer_id' => $customer->id,
            'message' => substr($message, 0, 100),
        ]);
        
        return [
            'handled' => true,
            'intent' => 'other',
            'needs_review' => true,
            'response_sent' => $result !== null,
        ];
    }

    /**
     * Get landing page URL for customer
     */
    protected function getLandingPageUrl(Customer $customer): string
    {
        $baseUrl = config('app.url', 'https://fibonacco.com');
        
        // If customer has a current campaign, use that landing page
        if ($customer->current_campaign_id) {
            // Default to a hook campaign landing page
            return $baseUrl . '/learn/claim-your-listing';
        }
        
        // Default landing page based on pipeline stage
        $stage = $customer->pipeline_stage?->value ?? 'hook';
        
        return match($stage) {
            'hook' => $baseUrl . '/learn/claim-your-listing',
            'engagement' => $baseUrl . '/learn/seo-reality-check',
            'sales' => $baseUrl . '/learn/command-center-basics',
            default => $baseUrl . '/learn/claim-your-listing',
        };
    }

    /**
     * Check if message is an opt-out request
     */
    protected function isOptOutRequest(string $message): bool
    {
        $optOutKeywords = ['stop', 'unsubscribe', 'opt out', 'remove me', 'cancel', 'never'];
        $normalized = strtolower($message);
        
        foreach ($optOutKeywords as $keyword) {
            if (str_contains($normalized, $keyword)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Generate AI answer to question
     */
    protected function generateAIAnswer(Customer $customer, string $question): string
    {
        try {
            $apiKey = config('services.openrouter.api_key');
            
            if (!$apiKey) {
                return "Thanks for your question! A team member will get back to you soon.";
            }
            
            // Build context about the customer
            $customerContext = $this->buildCustomerContext($customer);
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(15)->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'anthropic/claude-3-haiku',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => "You are a helpful assistant for Fibonacco, a platform that helps small businesses grow. Answer questions concisely (SMS length, max 160 chars). Be friendly and helpful.\n\nCustomer context: {$customerContext}"
                    ],
                    [
                        'role' => 'user',
                        'content' => substr($question, 0, 500)
                    ]
                ],
                'max_tokens' => 100,
                'temperature' => 0.7,
            ]);
            
            if ($response->successful()) {
                $answer = $response->json('choices.0.message.content');
                
                if ($answer) {
                    // Trim to SMS-friendly length (160 chars)
                    $answer = trim($answer);
                    if (strlen($answer) > 160) {
                        $answer = substr($answer, 0, 157) . '...';
                    }
                    
                    return $answer;
                }
            }
            
        } catch (\Exception $e) {
            Log::error('AI answer generation failed', [
                'error' => $e->getMessage(),
                'customer_id' => $customer->id,
            ]);
        }
        
        // Fallback response
        return "Thanks for your question! A team member will get back to you soon.";
    }

    /**
     * Build customer context for AI
     */
    protected function buildCustomerContext(Customer $customer): string
    {
        $context = [];
        
        if ($customer->business_name) {
            $context[] = "Business: {$customer->business_name}";
        }
        
        if ($customer->industry_category) {
            $context[] = "Industry: {$customer->industry_category}";
        }
        
        if ($customer->pipeline_stage) {
            $context[] = "Stage: {$customer->pipeline_stage->value}";
        }
        
        return implode(', ', $context) ?: 'New customer';
    }

    /**
     * Update engagement score for SMS interaction
     */
    protected function updateEngagementScore(Customer $customer, string $interactionType, float $multiplier = 1.0): void
    {
        // Recalculate engagement score
        $newScore = $this->engagementService->calculateScore($customer);
        
        // Add bonus for SMS interaction
        $smsBonus = (int) (5 * $multiplier);
        $newScore = min(100, $newScore + $smsBonus);
        
        $customer->update([
            'engagement_score' => $newScore,
        ]);
        
        Log::info("Updated engagement score for SMS interaction", [
            'customer_id' => $customer->id,
            'old_score' => $customer->getOriginal('engagement_score'),
            'new_score' => $newScore,
            'interaction_type' => $interactionType,
        ]);
    }
}

