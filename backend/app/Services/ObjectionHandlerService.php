<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\AiPersonality;
use App\Models\ObjectionHandler;
use App\Models\ObjectionEncounter;
use Illuminate\Support\Facades\Log;

class ObjectionHandlerService
{
    /**
     * Handle an objection from a customer.
     */
    public function handle(Customer $customer, string $statement, string $channel, ?AiPersonality $am = null): ?array
    {
        $industry = $customer->business_type ?? $customer->industry_category ?? null;
        $handler = ObjectionHandler::findMatch($statement, $industry);
        
        if (!$handler) {
            return null;
        }
        
        // Build response
        $response = $this->personalizeResponse($handler->response, $customer, $am);
        
        // Log the encounter
        ObjectionEncounter::create([
            'customer_id' => $customer->id,
            'objection_handler_id' => $handler->id,
            'channel' => $channel,
            'customer_statement' => $statement,
            'am_response' => $response,
            'outcome' => 'pending', // Will be updated based on next interaction
        ]);
        
        // Execute next action if defined
        if ($handler->next_action) {
            $this->executeNextAction($customer, $handler);
        }
        
        Log::info("Handled objection for customer {$customer->id}", [
            'type' => $handler->objection_type,
            'handler_id' => $handler->id,
        ]);
        
        return [
            'response' => $response,
            'follow_up' => $handler->follow_up,
            'objection_type' => $handler->objection_type,
            'next_action' => $handler->next_action,
        ];
    }
    
    /**
     * Personalize the response with customer/AM details.
     */
    protected function personalizeResponse(string $response, Customer $customer, ?AiPersonality $am): string
    {
        $replacements = [
            '{customer_name}' => $customer->contact_name ?? $customer->owner_name ?? 'there',
            '{business_name}' => $customer->business_name ?? 'your business',
            '{am_name}' => $am?->name ?? 'your account manager',
            '{am_phone}' => $am?->dedicated_phone ?? $am?->contact_phone ?? config('app.phone_number', ''),
        ];
        
        return str_replace(array_keys($replacements), array_values($replacements), $response);
    }
    
    /**
     * Execute the next action for an objection.
     */
    protected function executeNextAction(Customer $customer, ObjectionHandler $handler): void
    {
        $params = $handler->next_action_params ?? [];
        
        match($handler->next_action) {
            'schedule_callback' => \App\Models\Interaction::create([
                'customer_id' => $customer->id,
                'type' => 'callback',
                'channel' => 'phone',
                'status' => 'scheduled',
                'scheduled_at' => now()->addDays($params['delay_days'] ?? 7),
                'notes' => "Follow-up after {$handler->objection_type} objection",
            ]),
            'send_info' => \App\Jobs\SendEmailCampaign::dispatch(
                $customer,
                $params['campaign_id'] ?? null,
                $params['template'] ?? 'more_info'
            ),
            'escalate' => \App\Models\Interaction::create([
                'customer_id' => $customer->id,
                'type' => 'escalation',
                'channel' => 'internal',
                'status' => 'pending',
                'notes' => "Escalated after {$handler->objection_type} objection",
            ]),
            'accept_no' => $customer->update(['do_not_contact' => true]),
            default => null,
        };
    }
}

