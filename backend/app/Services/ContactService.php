<?php

namespace App\Services;

use App\Models\AiPersonality;
use App\Models\PersonalityAssignment;
use App\Models\Customer;
use App\Models\OutboundCampaign;
use App\Services\EmailService;
use App\Services\SMSService;
use App\Services\PhoneService;
use Illuminate\Support\Facades\Log;

class ContactService
{
    protected PersonalityService $personalityService;
    protected EmailService $emailService;
    protected SMSService $smsService;
    protected PhoneService $phoneService;

    public function __construct(
        PersonalityService $personalityService,
        EmailService $emailService,
        SMSService $smsService,
        PhoneService $phoneService
    ) {
        $this->personalityService = $personalityService;
        $this->emailService = $emailService;
        $this->smsService = $smsService;
        $this->phoneService = $phoneService;
    }

    /**
     * Contact customer using their assigned personality
     */
    public function contactCustomer(
        string $customerId,
        string $contactType,
        array $options = []
    ): bool {
        $customer = Customer::findOrFail($customerId);

        // Get customer's assigned personality
        $assignment = PersonalityAssignment::where('customer_id', $customerId)
            ->where('status', 'active')
            ->with('personality')
            ->first();

        if (!$assignment || !$assignment->personality) {
            throw new \Exception('Customer has no active personality assignment');
        }

        $personality = $assignment->personality;

        // Check if personality can handle this contact type
        if (!$personality->canHandle($contactType)) {
            throw new \Exception("Personality {$personality->identity} cannot handle {$contactType} contacts");
        }

        // Check if personality is currently active (time-based)
        $force = isset($options['force']) ? $options['force'] : false;
        if (!$personality->isCurrentlyActive() && !$force) {
            Log::warning("Personality {$personality->identity} is not currently active", [
                'customer_id' => $customerId,
                'contact_type' => $contactType,
            ]);
            return false;
        }

        // Generate message based on personality
        $message = $this->generatePersonalityMessage($personality, $customer, $options);

        // Send contact based on type
        $result = match($contactType) {
            'email' => $this->sendEmail($customer, $personality, $message, $options),
            'sms' => $this->sendSMS($customer, $personality, $message, $options),
            'call', 'phone' => $this->makeCall($customer, $personality, $message, $options),
            default => throw new \Exception("Unknown contact type: {$contactType}"),
        };

        // Record interaction
        if ($result) {
            $assignment->recordInteraction();
        }

        return $result;
    }

    /**
     * Schedule contact for customer
     */
    public function scheduleContact(
        string $customerId,
        string $contactType,
        \DateTimeInterface $scheduledAt,
        array $options = []
    ): void {
        // Store scheduled contact in options or use a scheduled contacts table
        // For now, we'll use the customer's metadata or create a scheduled contact record
        // This could be enhanced with a dedicated scheduled_contacts table
        
        $customer = Customer::findOrFail($customerId);
        
        // Get personality
        $assignment = PersonalityAssignment::where('customer_id', $customerId)
            ->where('status', 'active')
            ->with('personality')
            ->first();

        if (!$assignment || !$assignment->personality) {
            throw new \Exception('Customer has no active personality assignment');
        }

        $personality = $assignment->personality;

        // Check if personality can handle this contact type
        if (!$personality->canHandle($contactType)) {
            throw new \Exception("Personality {$personality->identity} cannot handle {$contactType} contacts");
        }

        // Store scheduled contact (could use a scheduled_contacts table)
        // For now, we'll just log it
        Log::info('Contact scheduled', [
            'customer_id' => $customerId,
            'personality_id' => $personality->id,
            'contact_type' => $contactType,
            'scheduled_at' => $scheduledAt->toIso8601String(),
            'options' => $options,
        ]);

        // In a production system, you would:
        // 1. Create a scheduled_contacts table
        // 2. Store the scheduled contact record
        // 3. Use a queue/job scheduler to send at the scheduled time
    }

    /**
     * Generate message using personality
     */
    private function generatePersonalityMessage(
        AiPersonality $personality,
        Customer $customer,
        array $options = []
    ): string {
        $messageTemplate = $options['message'] ?? null;

        if ($messageTemplate) {
            // Replace variables in template
            $customerName = $customer->owner_name ? $customer->owner_name : $customer->business_name;
            $message = str_replace('{{customer_name}}', $customerName, $messageTemplate);
            $message = str_replace('{{business_name}}', $customer->business_name, $message);
            $message = str_replace('{{personality_name}}', $personality->identity, $message);
            return $message;
        }

        // Generate message using AI
        $customerName = $customer->owner_name ? $customer->owner_name : $customer->business_name;
        $context = [
            'customer_name' => $customerName,
            'business_name' => $customer->business_name,
            'industry' => $customer->industry_category,
            'purpose' => isset($options['purpose']) ? $options['purpose'] : 'general outreach',
        ];

        try {
            $contactType = isset($options['contact_type']) ? $options['contact_type'] : 'email';
            $defaultPrompt = "Generate a brief {$contactType} message to reach out to this customer.";
            $prompt = isset($options['prompt']) ? $options['prompt'] : $defaultPrompt;
            $conversationContext = isset($options['conversation_context']) ? $options['conversation_context'] : [];
            
            return $this->personalityService->generateResponse(
                $personality,
                $prompt,
                $conversationContext,
                $customer
            );
        } catch (\Exception $e) {
            Log::error('Failed to generate personality message', [
                'error' => $e->getMessage(),
                'personality_id' => $personality->id,
                'customer_id' => $customer->id,
            ]);

            // Fallback to greeting message
            return $this->personalityService->getGreeting($personality, $customer);
        }
    }

    /**
     * Send email using personality
     */
    private function sendEmail(
        Customer $customer,
        AiPersonality $personality,
        string $message,
        array $options = []
    ): bool {
        if (!$customer->email) {
            Log::warning('Customer has no email address', ['customer_id' => $customer->id]);
            return false;
        }

        $subject = isset($options['subject']) && $options['subject'] ? $options['subject'] : "Message from {$personality->identity}";
        
        // Convert message to HTML if needed
        $htmlContent = nl2br(htmlspecialchars($message));
        
        // Add personality signature
        $htmlContent .= "<br><br>--<br>{$personality->identity}";
        if ($personality->contact_email) {
            $htmlContent .= "<br>{$personality->contact_email}";
        }

        $result = $this->emailService->send(
            $customer->email,
            $subject,
            $htmlContent,
            $message, // Plain text version
            [
                'from_email' => $personality->contact_email ? $personality->contact_email : config('mail.from.address'),
                'from_name' => $personality->identity,
                'campaign_id' => isset($options['campaign_id']) && $options['campaign_id'] ? $options['campaign_id'] : null,
            ]
        );

        return $result !== null && ($result['success'] ?? false);
    }

    /**
     * Send SMS using personality
     */
    private function sendSMS(
        Customer $customer,
        AiPersonality $personality,
        string $message,
        array $options = []
    ): bool {
        if (!$customer->phone) {
            Log::warning('Customer has no phone number', ['customer_id' => $customer->id]);
            return false;
        }

        // Add personality signature to SMS
        $messageWithSignature = $message;
        $includeSignature = isset($options['include_signature']) ? $options['include_signature'] : true;
        if ($includeSignature) {
            $messageWithSignature .= " - {$personality->identity}";
        }

        $result = $this->smsService->send(
            $customer->phone,
            $messageWithSignature,
            [
                'campaign_id' => isset($options['campaign_id']) && $options['campaign_id'] ? $options['campaign_id'] : null,
            ]
        );

        return $result !== null && ($result['success'] ?? false);
    }

    /**
     * Make phone call using personality
     */
    private function makeCall(
        Customer $customer,
        AiPersonality $personality,
        string $message,
        array $options = []
    ): bool {
        if (!$customer->phone) {
            Log::warning('Customer has no phone number', ['customer_id' => $customer->id]);
            return false;
        }

        // Use message as call script
        $script = $message;

        $result = $this->phoneService->makeCall(
            $customer->phone,
            $script,
            [
                'use_tts' => true,
                'voicemail_enabled' => true,
            ]
        );

        return $result !== null && ($result['success'] ?? false);
    }

    /**
     * Get customer contact preferences
     */
    public function getContactPreferences(string $customerId): array
    {
        $customer = Customer::findOrFail($customerId);

        // Check if customer has contact preferences stored
        $preferences = $customer->contact_preferences ? $customer->contact_preferences : [];

        // Default preferences if not set
        $defaults = [
            'preferred_channel' => 'email',
            'allowed_channels' => ['email', 'sms', 'chat'],
            'time_of_day' => 'business_hours',
            'frequency' => 'weekly',
        ];

        return array_merge($defaults, $preferences);
    }

    /**
     * Update customer contact preferences
     */
    public function updateContactPreferences(string $customerId, array $preferences): void
    {
        $customer = Customer::findOrFail($customerId);

        $currentPreferences = $customer->contact_preferences ? $customer->contact_preferences : [];
        $updatedPreferences = array_merge($currentPreferences, $preferences);

        $customer->update(['contact_preferences' => $updatedPreferences]);
    }
}
