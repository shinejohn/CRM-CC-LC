<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Customer;
use App\Models\AiPersonality;
use App\Models\PersonalityAssignment;
use App\Models\DialogTree;
use App\Models\DialogExecution;
use App\Jobs\AM\SendProactiveEmail;
use App\Jobs\AM\SendProactiveSMS;
use App\Jobs\AM\MakeProactiveCall;
use Illuminate\Support\Facades\Log;

final class AccountManagerService
{
    public function __construct(
        protected DialogExecutorService $dialogExecutor,
        protected ObjectionHandlerService $objectionHandler
    ) {}
    
    /**
     * Assign an AI Account Manager to a customer.
     */
    public function assignToCustomer(Customer $customer, ?AiPersonality $personality = null): PersonalityAssignment
    {
        // Find best match if not specified
        if (!$personality) {
            $personality = AiPersonality::findBestMatch($customer);
        }
        
        if (!$personality) {
            throw new \Exception('No available AI Account Manager found');
        }
        
        // Check for existing assignment
        $existing = PersonalityAssignment::where('customer_id', $customer->id)
            ->where('personality_id', $personality->id)
            ->first();
        
        if ($existing && $existing->status === 'active') {
            return $existing;
        }
        
        // Deactivate other assignments
        PersonalityAssignment::where('customer_id', $customer->id)
            ->where('status', 'active')
            ->update(['status' => 'inactive']);
        
        // Create or reactivate assignment
        $assignment = PersonalityAssignment::updateOrCreate(
            [
                'customer_id' => $customer->id,
                'personality_id' => $personality->id,
            ],
            [
                'status' => 'active',
                'assigned_at' => now(),
                'tenant_id' => $customer->tenant_id ?? $personality->tenant_id,
            ]
        );
        
        // Update AM customer count
        $personality->assignCustomer();
        
        Log::info("Assigned AM {$personality->name} to customer {$customer->id}");
        
        return $assignment;
    }
    
    /**
     * Get the primary AM for a customer.
     */
    public function getAccountManager(Customer $customer): ?AiPersonality
    {
        $assignment = PersonalityAssignment::where('customer_id', $customer->id)
            ->where('status', 'active')
            ->first();
        
        return $assignment?->personality;
    }
    
    /**
     * Initiate proactive outreach from AM to customer.
     */
    public function initiateOutreach(Customer $customer, string $channel, string $reason, array $context = []): void
    {
        $am = $this->getAccountManager($customer);
        
        if (!$am) {
            $am = $this->assignToCustomer($customer)->personality;
        }
        
        match($channel) {
            'email' => SendProactiveEmail::dispatch($customer, $am, $reason, $context),
            'sms' => SendProactiveSMS::dispatch($customer, $am, $reason, $context),
            'phone' => MakeProactiveCall::dispatch($customer, $am, $reason, $context),
            default => throw new \InvalidArgumentException("Invalid channel: {$channel}"),
        };
        
        Log::info("Initiated {$channel} outreach from AM {$am->name} to customer {$customer->id}", [
            'reason' => $reason,
        ]);
    }
    
    /**
     * Start a dialog tree execution.
     */
    public function startDialog(Customer $customer, string $triggerType): ?DialogExecution
    {
        $am = $this->getAccountManager($customer);
        $tree = DialogTree::findForContext($triggerType, $customer->pipeline_stage?->value);
        
        if (!$tree) {
            Log::warning("No dialog tree found for trigger: {$triggerType}");
            return null;
        }
        
        return $this->dialogExecutor->start($customer, $tree, $am);
    }
    
    /**
     * Process a response in ongoing dialog.
     */
    public function processDialogResponse(DialogExecution $execution, string $response): array
    {
        return $this->dialogExecutor->processResponse($execution, $response);
    }
    
    /**
     * Handle an objection from customer.
     */
    public function handleObjection(Customer $customer, string $statement, string $channel): ?array
    {
        $am = $this->getAccountManager($customer);
        
        return $this->objectionHandler->handle($customer, $statement, $channel, $am);
    }
    
    /**
     * Route inbound communication to correct AM.
     */
    public function routeInbound(string $channel, string $identifier): ?array
    {
        // Find AM by dedicated channel
        $am = match($channel) {
            'phone' => AiPersonality::where('dedicated_phone', $identifier)->first(),
            'email' => AiPersonality::where('dedicated_email', $identifier)->first(),
            'sms' => AiPersonality::where('dedicated_sms', $identifier)->first(),
            default => null,
        };
        
        if (!$am) {
            return null;
        }
        
        return [
            'personality' => $am,
            'customers' => $am->customers()->get(),
        ];
    }
    
    /**
     * Get marketing kit drip touchpoints for the Manifest Destiny sequence.
     *
     * @return array<int, array{type: string, day: int, subject: string, tool_slug: string, description: string}>
     */
    public function getMarketingKitTouchpoints(): array
    {
        return [
            ['type' => 'marketing_kit_branded_image', 'day' => 3, 'subject' => 'I created a professional branded image for {business_name}', 'tool_slug' => 'branded-image', 'description' => 'A custom branded image featuring your business name, community, and website — ready to share anywhere.'],
            ['type' => 'marketing_kit_email_signature', 'day' => 5, 'subject' => 'Here is a professional email signature for your team', 'tool_slug' => 'email-signature', 'description' => 'A polished email signature with your business info, links, and branding. Copy it into any email client.'],
            ['type' => 'marketing_kit_social_headers', 'day' => 8, 'subject' => 'I made social media headers for all your platforms', 'tool_slug' => 'social-headers', 'description' => 'Custom header images sized for Facebook, X, Instagram, and TikTok — download and upload in seconds.'],
            ['type' => 'marketing_kit_social_posts', 'day' => 12, 'subject' => 'Here are ready-to-post social graphics for this week', 'tool_slug' => 'social-posts', 'description' => 'Eye-catching 1080x1080 social post graphics with captions and hashtags. Just download and share.'],
            ['type' => 'marketing_kit_content_cards', 'day' => 15, 'subject' => 'Here is today\'s community content — share it with your followers', 'tool_slug' => 'content-cards', 'description' => 'Fresh community content ready to post. News, events, and more — with your brand attached.'],
            ['type' => 'marketing_kit_website_widget', 'day' => 20, 'subject' => 'Add this community widget to your website', 'tool_slug' => 'website-widget', 'description' => 'An embeddable widget showing community news, events, and weather. One line of code to install.'],
            ['type' => 'marketing_kit_syndication_invite', 'day' => 25, 'subject' => 'You could earn money sharing community content', 'tool_slug' => 'syndication', 'description' => 'If you manage a Facebook group or community page, become a syndication partner and earn revenue by sharing sponsored content.'],
        ];
    }

    /**
     * Get the marketing kit touchpoint for a given Manifest Destiny day.
     */
    public function getMarketingKitTouchpointForDay(int $day): ?array
    {
        foreach ($this->getMarketingKitTouchpoints() as $touchpoint) {
            if ($touchpoint['day'] === $day) {
                return $touchpoint;
            }
        }

        return null;
    }

    /**
     * Build the marketing kit email link for a touchpoint.
     */
    public function buildMarketingKitLink(array $touchpoint): string
    {
        $slug = $touchpoint['tool_slug'];

        if ($slug === 'content-cards') {
            return config('app.frontend_url', config('app.url')) . '/command-center/attract/content-cards';
        }

        if ($slug === 'syndication') {
            return config('app.frontend_url', config('app.url')) . '/command-center/syndication';
        }

        return config('app.frontend_url', config('app.url')) . '/command-center/attract/marketing-kit/' . $slug;
    }

    /**
     * Generate AI response as AM.
     */
    public function generateResponse(Customer $customer, string $message, array $context = []): string
    {
        $am = $this->getAccountManager($customer);
        
        if (!$am) {
            return "I'm here to help! Let me connect you with the right person.";
        }
        
        // Check for objection first
        $objectionResult = $this->handleObjection($customer, $message, $context['channel'] ?? 'chat');
        
        if ($objectionResult) {
            return $objectionResult['response'];
        }
        
        // Generate AI response with AM personality
        return $this->generateAIResponse($am, $customer, $message, $context);
    }
    
    /**
     * Generate AI response with personality.
     */
    protected function generateAIResponse(AiPersonality $am, Customer $customer, string $message, array $context): string
    {
        $systemPrompt = $am->getSystemPrompt();
        
        // Add customer context
        $customerContext = "You are speaking with {$customer->contact_name} from {$customer->business_name}.";
        if ($customer->business_type) {
            $customerContext .= " They are in the {$customer->business_type} industry.";
        }
        
        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openrouter.api_key'),
                'Content-Type' => 'application/json',
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'anthropic/claude-3-haiku',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt . "\n\n" . $customerContext],
                    ['role' => 'user', 'content' => $message],
                ],
                'max_tokens' => 300,
            ]);
            
            return $response->json('choices.0.message.content') ?? "I'd be happy to help with that. Let me look into it for you.";
            
        } catch (\Exception $e) {
            Log::error("AM AI response failed: " . $e->getMessage());
            return "I'd be happy to help with that. Let me get back to you shortly.";
        }
    }
}

