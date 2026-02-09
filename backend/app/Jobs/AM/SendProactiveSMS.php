<?php

namespace App\Jobs\AM;

use App\Models\Customer;
use App\Models\AiPersonality;
use App\Models\Interaction;
use App\Jobs\SendSMS;
use App\Models\CampaignRecipient;
use App\Models\OutboundCampaign;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendProactiveSMS implements ShouldQueue
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
        $message = $this->generateMessage();
        
        // Use SMSService directly since SendSMS job expects CampaignRecipient
        $smsService = app(\App\Services\SMSService::class);
        
        $phone = $this->customer->phone ?? $this->customer->primary_phone;
        if (!$phone) {
            Log::warning("No phone number for customer {$this->customer->id}");
            return;
        }
        
        $result = $smsService->send($phone, $message, [
            'from_number' => $this->am->dedicated_sms ?? $this->am->contact_phone,
            'am_id' => $this->am->id,
        ]);
        
        // Log interaction
        Interaction::create([
            'customer_id' => $this->customer->id,
            'type' => 'proactive_sms',
            'channel' => 'sms',
            'status' => 'completed',
            'notes' => $message,
            'metadata' => [
                'am_id' => $this->am->id,
                'reason' => $this->reason,
                'sms_result' => $result,
            ],
        ]);
        
        // Update AM stats
        $this->am->increment('total_interactions');
    }
    
    protected function generateMessage(): string
    {
        $name = $this->customer->contact_name ?? $this->customer->owner_name ?? 'there';
        $amName = $this->am->name;
        
        $templates = [
            'check_in' => "Hi {$name}! It's {$amName}. Just checking in - how's everything going? Let me know if you need anything!",
            'appointment_reminder' => "Hi {$name}, reminder about our call tomorrow. Looking forward to chatting! - {$amName}",
            'value_delivered' => "Hi {$name}! Your article just went live and it's already getting views! Check it out when you get a chance. - {$amName}",
            'quick_question' => "Hi {$name}, quick question - would you prefer a call or email for our next check-in? - {$amName}",
        ];
        
        return $templates[$this->reason] ?? "Hi {$name}! It's {$amName} from Fibonacco. Just reaching out - let me know if you need anything!";
    }
}

