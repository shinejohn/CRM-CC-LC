<?php

namespace App\Services;

use App\Events\InboundEmailReceived;
use App\Models\Interaction;
use App\Jobs\SendEmailCampaign;
use App\Services\AccountManagerService;
use Illuminate\Support\Facades\Log;

class InboundEmailRoutingService
{
    public function __construct(
        protected ?AccountManagerService $accountManagerService = null
    ) {
    }

    /**
     * Route inbound email based on intent and sentiment.
     */
    public function route(InboundEmailReceived $event): void
    {
        $intent = $event->classifiedIntent ?? 'other';
        $sentiment = $event->sentiment ?? 'neutral';

        Log::info("Routing inbound email", [
            'customer_id' => $event->customer->id,
            'intent' => $intent,
            'sentiment' => $sentiment,
        ]);

        match ($intent) {
            'question' => $this->handleQuestion($event),
            'complaint' => $this->handleComplaint($event),
            'request' => $this->handleRequest($event),
            'appointment' => $this->handleAppointment($event),
            'support' => $this->handleSupport($event),
            'pricing' => $this->handlePricing($event),
            default => $this->handleOther($event),
        };

        // If negative sentiment, escalate
        if ($sentiment === 'negative') {
            $this->escalateToHuman($event);
        }
    }

    protected function handleQuestion(InboundEmailReceived $event): void
    {
        // Generate AI answer using Account Manager if available
        if ($this->accountManagerService) {
            try {
                $response = $this->accountManagerService->generateResponse(
                    $event->customer,
                    $event->body,
                    ['channel' => 'email', 'subject' => $event->subject]
                );

                // Send response email
                SendEmailCampaign::dispatch(
                    $event->customer,
                    null,
                    'ai_response',
                    [
                        'subject' => 'Re: ' . $event->subject,
                        'body' => $response,
                        'in_reply_to' => $event->messageId,
                    ]
                );

                Log::info("Generated AI answer for question from customer {$event->customer->id}");
            } catch (\Exception $e) {
                Log::error("Failed to generate AI answer", [
                    'customer_id' => $event->customer->id,
                    'error' => $e->getMessage(),
                ]);

                // Fallback: create interaction for human review
                Interaction::create([
                    'customer_id' => $event->customer->id,
                    'tenant_id' => $event->customer->tenant_id,
                    'type' => 'question',
                    'title' => 'Customer Question: ' . $event->subject,
                    'entry_point' => 'email',
                    'status' => 'pending',
                    'notes' => "Question: {$event->subject}\n\n{$event->body}",
                ]);
            }
        } else {
            // No AM service available, create interaction
            Interaction::create([
                'customer_id' => $event->customer->id,
                'tenant_id' => $event->customer->tenant_id,
                'type' => 'question',
                'title' => 'Customer Question: ' . $event->subject,
                'channel' => 'email',
                'status' => 'pending',
                'notes' => "Question: {$event->subject}\n\n{$event->body}",
            ]);
        }
    }

    protected function handleComplaint(InboundEmailReceived $event): void
    {
        // High priority - create interaction and notify team
        Interaction::create([
            'customer_id' => $event->customer->id,
            'tenant_id' => $event->customer->tenant_id,
            'type' => 'complaint',
            'title' => 'Customer Complaint: ' . $event->subject,
            'entry_point' => 'email',
            'status' => 'pending',
            'priority' => 'high',
            'notes' => "Complaint: {$event->subject}\n\n{$event->body}",
            'metadata' => [
                'sentiment' => $event->sentiment,
                'message_id' => $event->messageId,
                'from_email' => $event->fromEmail,
            ],
        ]);

        Log::warning("Complaint received from customer {$event->customer->id}", [
            'subject' => $event->subject,
            'sentiment' => $event->sentiment,
        ]);
    }

    protected function handleRequest(InboundEmailReceived $event): void
    {
        // Create interaction for request fulfillment
        Interaction::create([
            'customer_id' => $event->customer->id,
            'tenant_id' => $event->customer->tenant_id,
            'type' => 'request',
            'title' => 'Customer Request: ' . $event->subject,
            'entry_point' => 'email',
            'status' => 'pending',
            'notes' => "Request: {$event->subject}\n\n{$event->body}",
            'metadata' => [
                'message_id' => $event->messageId,
                'from_email' => $event->fromEmail,
            ],
        ]);
    }

    protected function handleAppointment(InboundEmailReceived $event): void
    {
        // Schedule appointment
        Interaction::create([
            'customer_id' => $event->customer->id,
            'tenant_id' => $event->customer->tenant_id,
            'type' => 'appointment_request',
            'title' => 'Appointment Request: ' . $event->subject,
            'entry_point' => 'email',
            'status' => 'pending',
            'notes' => "Appointment request: {$event->subject}\n\n{$event->body}",
            'metadata' => [
                'message_id' => $event->messageId,
                'from_email' => $event->fromEmail,
            ],
        ]);
    }

    protected function handleSupport(InboundEmailReceived $event): void
    {
        // Route to support team
        Interaction::create([
            'customer_id' => $event->customer->id,
            'tenant_id' => $event->customer->tenant_id,
            'type' => 'support_request',
            'title' => 'Support Request: ' . $event->subject,
            'entry_point' => 'email',
            'status' => 'pending',
            'priority' => 'normal',
            'notes' => $event->body,
            'metadata' => [
                'subject' => $event->subject,
                'message_id' => $event->messageId,
                'from_email' => $event->fromEmail,
            ],
        ]);
    }

    protected function handlePricing(InboundEmailReceived $event): void
    {
        // Send pricing information
        SendEmailCampaign::dispatch(
            $event->customer,
            null,
            'pricing_info',
            [
                'subject' => 'Pricing Information',
                'in_reply_to' => $event->messageId,
            ]
        );

        Log::info("Sent pricing info to customer {$event->customer->id}");
    }

    protected function handleOther(InboundEmailReceived $event): void
    {
        // Flag for human review
        Interaction::create([
            'customer_id' => $event->customer->id,
            'tenant_id' => $event->customer->tenant_id,
            'type' => 'email_needs_review',
            'title' => 'Email Review Needed: ' . $event->subject,
            'entry_point' => 'email',
            'status' => 'pending',
            'notes' => "Unclassified email: {$event->subject}\n\n{$event->body}",
            'metadata' => [
                'intent' => $event->classifiedIntent,
                'sentiment' => $event->sentiment,
                'message_id' => $event->messageId,
                'from_email' => $event->fromEmail,
            ],
        ]);
    }

    protected function escalateToHuman(InboundEmailReceived $event): void
    {
        Interaction::create([
            'customer_id' => $event->customer->id,
            'tenant_id' => $event->customer->tenant_id,
            'type' => 'human_escalation',
            'title' => 'Negative Sentiment Escalation: ' . $event->subject,
            'entry_point' => 'email',
            'status' => 'pending',
            'priority' => 'high',
            'notes' => "Negative sentiment detected: {$event->subject}\n\n{$event->body}",
            'metadata' => [
                'sentiment' => $event->sentiment,
                'intent' => $event->classifiedIntent,
                'message_id' => $event->messageId,
                'from_email' => $event->fromEmail,
            ],
        ]);

        Log::warning("Escalated email with negative sentiment", [
            'customer_id' => $event->customer->id,
            'subject' => $event->subject,
        ]);
    }
}

