<?php

namespace App\Jobs\AM;

use App\Models\Customer;
use App\Models\AiPersonality;
use App\Models\Interaction;
use App\Models\DialogTree;
use App\Services\AccountManagerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MakeProactiveCall implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public AiPersonality $am,
        public string $reason,
        public array $context = []
    ) {}

    public function handle(AccountManagerService $amService): void
    {
        // Start dialog tree for this call type
        $execution = $amService->startDialog($this->customer, $this->reason);
        
        // Create scheduled call interaction
        Interaction::create([
            'customer_id' => $this->customer->id,
            'type' => 'proactive_call',
            'channel' => 'phone',
            'status' => 'scheduled',
            'scheduled_at' => now(),
            'notes' => "Proactive call: {$this->reason}",
            'metadata' => [
                'am_id' => $this->am->id,
                'am_name' => $this->am->name,
                'am_phone' => $this->am->dedicated_phone ?? $this->am->contact_phone,
                'dialog_execution_id' => $execution?->id,
                'reason' => $this->reason,
            ],
        ]);
        
        // Dispatch actual phone call job
        \App\Jobs\MakePhoneCall::dispatch($this->customer, $this->context['script_id'] ?? null, [
            'from_number' => $this->am->dedicated_phone ?? $this->am->contact_phone,
            'am_id' => $this->am->id,
            'dialog_execution_id' => $execution?->id,
        ]);
    }
}

