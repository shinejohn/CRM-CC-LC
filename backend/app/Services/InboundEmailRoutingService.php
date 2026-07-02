<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\PipelineStage;
use App\Events\InboundEmailReceived;
use App\Jobs\ProcessInboundEmailJob;
use App\Jobs\SendEmailCampaign;
use App\Models\CampaignRecipient;
use App\Models\CrmActivity;
use App\Models\Customer;
use App\Models\EmailSuppression;
use App\Models\Interaction;
use App\Models\OutboundCampaign;
use App\Services\AccountManagerService;
use App\Services\EmailService;
use Illuminate\Support\Facades\Log;

final class InboundEmailRoutingService
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

        // A single handler failure must never crash the event listener — otherwise
        // one malformed reply blocks the whole inbound pipeline (and, via the queued
        // listener, retries forever). Log and continue.
        try {
            match ($intent) {
                'question' => $this->handleQuestion($event),
                'complaint' => $this->handleComplaint($event),
                'request' => $this->handleRequest($event),
                'appointment' => $this->handleAppointment($event),
                'support' => $this->handleSupport($event),
                'pricing', 'interested', 'wants_info' => $this->handleInterest($event),
                'unsubscribe', 'opt_out' => $this->handleOptOut($event),
                default => $this->handleOther($event),
            };
        } catch (\Throwable $e) {
            Log::error('InboundEmailRoutingService: handler failed', [
                'customer_id' => $event->customer->id,
                'intent' => $intent,
                'error' => $e->getMessage(),
            ]);
        }

        // If negative sentiment, escalate (independent of handler outcome).
        if ($sentiment === 'negative') {
            try {
                $this->escalateToHuman($event);
            } catch (\Throwable $e) {
                Log::error('InboundEmailRoutingService: escalation failed', [
                    'customer_id' => $event->customer->id,
                    'error' => $e->getMessage(),
                ]);
            }
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

                // Send the AI answer through the normal transactional send path.
                // NOTE: SendEmailCampaign's constructor is frozen to
                // (CampaignRecipient, OutboundCampaign) and only sends campaign/
                // template content — it cannot carry an ad-hoc AI-generated body.
                // EmailService::send() is the correct mechanism: it also enforces
                // suppression + injects the CAN-SPAM/List-Unsubscribe footer.
                $replyTo = ProcessInboundEmailJob::normalizeEmail($event->fromEmail);
                $html = nl2br(e($response));

                app(EmailService::class)->send(
                    $replyTo,
                    'Re: ' . $event->subject,
                    $html,
                    $response,
                    [
                        'customer_id' => $event->customer->id,
                        'in_reply_to' => $event->messageId,
                        'category' => 'ai_response',
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

    protected function handleInterest(InboundEmailReceived $event): void
    {
        $customer = $event->customer;

        // Advance to ENGAGEMENT stage if still in HOOK
        if ($customer->pipeline_stage === PipelineStage::HOOK) {
            $customer->advanceToStage(PipelineStage::ENGAGEMENT, 'inbound_interest');
            Log::info("Inbound interest: advanced customer {$customer->id} to ENGAGEMENT");
        }

        // Create high-priority CRM activity for the sales rep
        CrmActivity::create([
            'tenant_id'   => $customer->tenant_id,
            'customer_id' => $customer->id,
            'type'        => 'inbound_interest',
            'title'       => 'Responded to campaign — interested in pricing',
            'channel'     => 'email',
            'status'      => 'pending',
            'priority'    => 'high',
            'notes'       => "Subject: {$event->subject}\n\n{$event->body}",
            'metadata'    => [
                'intent'       => $event->classifiedIntent,
                'message_id'   => $event->messageId,
                'from_email'   => $event->fromEmail,
            ],
        ]);

        // Queue the CONV-001 "Your Community Position" presentation as the follow-up.
        // This must respect SendEmailCampaign's frozen (CampaignRecipient,
        // OutboundCampaign) constructor — we look up the real campaign and build a
        // real recipient rather than passing a Customer + string. If the campaign
        // isn't provisioned, the high-priority CRM activity above is the durable
        // fallback (a human will follow up), so we don't crash.
        $dispatched = $this->dispatchCampaignFollowUp($customer, 'conv_your_community_position');

        Log::info("Inbound interest handled for customer {$customer->id}", [
            'follow_up_dispatched' => $dispatched,
        ]);
    }

    /**
     * Dispatch a follow-up presentation to a customer via the real campaign send
     * path, honoring the frozen SendEmailCampaign(CampaignRecipient, OutboundCampaign)
     * contract. Returns false (and logs) when no matching campaign is provisioned.
     */
    private function dispatchCampaignFollowUp(Customer $customer, string $campaignKey): bool
    {
        $email = ProcessInboundEmailJob::normalizeEmail(
            $customer->email ?? $customer->primary_email ?? ''
        );

        if ($email === '') {
            return false;
        }

        $campaign = OutboundCampaign::query()
            ->where('tenant_id', $customer->tenant_id)
            ->where(function ($q) use ($campaignKey) {
                $q->where('type', $campaignKey)
                    ->orWhere('name', $campaignKey)
                    ->orWhere('metadata->slug', $campaignKey);
            })
            ->whereNotIn('status', ['archived', 'completed'])
            ->latest()
            ->first();

        if (! $campaign) {
            Log::info('InboundEmailRoutingService: follow-up campaign not provisioned', [
                'campaign_key' => $campaignKey,
                'customer_id' => $customer->id,
            ]);

            return false;
        }

        $recipient = CampaignRecipient::firstOrCreate(
            [
                'campaign_id' => $campaign->id,
                'customer_id' => $customer->id,
            ],
            [
                'tenant_id' => $customer->tenant_id,
                'email' => $email,
                'name' => $customer->business_name ?? null,
                'status' => 'pending',
            ]
        );

        SendEmailCampaign::dispatch($recipient, $campaign);

        return true;
    }

    protected function handleOptOut(InboundEmailReceived $event): void
    {
        $customer = $event->customer;

        // Suppress email only. Do NOT write do_not_contact here — flipping an
        // existing DNC flag to false would silently RE-ENABLE contact for someone
        // who previously opted out entirely. Only ever tighten, never loosen.
        $customer->update([
            'email_opted_in'          => false,
            'email_suppressed'        => true,
            'email_suppressed_reason' => 'inbound_opt_out',
        ]);

        // Write a platform-level EmailSuppression row so SuppressionService /
        // EmailService::send() block this address everywhere, not just via the
        // customer flag. Normalize the address (bare, lowercased).
        $suppressEmail = ProcessInboundEmailJob::normalizeEmail(
            $event->fromEmail ?: ($customer->email ?? $customer->primary_email ?? '')
        );

        if ($suppressEmail !== '') {
            EmailSuppression::updateOrCreate(
                [
                    'email_address' => $suppressEmail,
                    'email_client_id' => null,
                ],
                [
                    'reason' => 'unsubscribe',
                    'source' => 'inbound_opt_out',
                ]
            );
        }

        CrmActivity::create([
            'tenant_id'   => $customer->tenant_id,
            'customer_id' => $customer->id,
            'type'        => 'opt_out',
            'title'       => 'Opted out via email reply',
            'channel'     => 'email',
            'status'      => 'completed',
            'notes'       => "Subject: {$event->subject}\n\n{$event->body}",
            'metadata'    => ['message_id' => $event->messageId],
        ]);

        Log::info("Customer {$customer->id} opted out via inbound email reply");
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

