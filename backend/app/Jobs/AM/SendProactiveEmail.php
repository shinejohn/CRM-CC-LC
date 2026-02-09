<?php

namespace App\Jobs\AM;

use App\Models\Customer;
use App\Models\AiPersonality;
use App\Models\Interaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendProactiveEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public AiPersonality $am,
        public string $reason,
        public array $context = []
    ) {}

    public function handle(): void
    {
        // Generate personalized email content
        $subject = $this->generateSubject();
        $body = $this->generateBody();
        
        // Send from AM's dedicated email
        $fromEmail = $this->am->dedicated_email ?? $this->am->contact_email ?? config('mail.from.address');
        $fromName = $this->am->name;
        
        try {
            Mail::send([], [], function ($message) use ($subject, $body, $fromEmail, $fromName) {
                $message->to($this->customer->email ?? $this->customer->primary_email)
                    ->from($fromEmail, $fromName)
                    ->subject($subject)
                    ->html($body);
            });
            
            // Log interaction
            Interaction::create([
                'customer_id' => $this->customer->id,
                'type' => 'proactive_email',
                'channel' => 'email',
                'status' => 'completed',
                'notes' => "Proactive outreach: {$this->reason}",
                'metadata' => [
                    'am_id' => $this->am->id,
                    'am_name' => $this->am->name,
                    'reason' => $this->reason,
                    'subject' => $subject,
                ],
            ]);
            
            // Update AM stats
            $this->am->increment('total_interactions');
        } catch (\Exception $e) {
            Log::error("Failed to send proactive email from AM", [
                'am_id' => $this->am->id,
                'customer_id' => $this->customer->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
    
    protected function generateSubject(): string
    {
        $customerName = $this->customer->contact_name ?? $this->customer->owner_name ?? '';
        $amName = $this->am->name;
        
        $templates = [
            'check_in' => "Hi {$customerName}, quick check-in from {$amName}",
            'value_report' => "Your monthly marketing impact report is ready",
            'new_feature' => "New feature available for {$this->customer->business_name}",
            'opportunity' => "I found an opportunity for {$this->customer->business_name}",
            'default' => "A message from your account manager, {$amName}",
        ];
        
        return $templates[$this->reason] ?? $templates['default'];
    }
    
    protected function generateBody(): string
    {
        // Generate AI-powered personalized email body
        $customerName = $this->customer->contact_name ?? $this->customer->owner_name ?? 'there';
        $businessName = $this->customer->business_name ?? 'your business';
        
        $prompt = "Write a brief, friendly email from {$this->am->name} (account manager) to {$customerName} at {$businessName}. Reason for email: {$this->reason}. Keep it under 150 words, warm and professional.";
        
        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openrouter.api_key'),
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'anthropic/claude-3-haiku',
                'messages' => [['role' => 'user', 'content' => $prompt]],
                'max_tokens' => 300,
            ]);
            
            return $response->json('choices.0.message.content') ?? $this->getDefaultBody();
        } catch (\Exception $e) {
            Log::warning("AI email generation failed, using default", [
                'error' => $e->getMessage(),
            ]);
            return $this->getDefaultBody();
        }
    }
    
    protected function getDefaultBody(): string
    {
        $customerName = $this->customer->contact_name ?? $this->customer->owner_name ?? 'there';
        return "Hi {$customerName},\n\nI wanted to reach out and check in on how things are going with your marketing efforts. I'm here if you need anything!\n\nBest,\n{$this->am->name}";
    }
}

