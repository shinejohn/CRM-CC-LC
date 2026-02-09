<?php

namespace App\Services;

use App\Models\CampaignSend;
use App\Models\Customer;
use App\Models\Interaction;
use Illuminate\Support\Facades\Log;

class EmailFollowupService
{
    /**
     * Determine and execute follow-up strategy for unopened email
     */
    public function handleUnopenedEmail(Customer $customer, CampaignSend $campaignSend, int $hoursSinceSent): void
    {
        $followupCount = $campaignSend->followup_count ?? 0;

        // If already escalated, don't do anything
        if ($campaignSend->followup_strategy === 'escalated') {
            Log::info("EmailFollowupService: Email already escalated", [
                'campaign_send_id' => $campaignSend->id,
            ]);
            return;
        }

        // Determine strategy based on engagement score and follow-up count
        $strategy = $this->determineStrategy($customer, $followupCount, $hoursSinceSent);

        Log::info("EmailFollowupService: Executing follow-up strategy", [
            'customer_id' => $customer->id,
            'campaign_send_id' => $campaignSend->id,
            'strategy' => $strategy,
            'followup_count' => $followupCount,
            'engagement_score' => $customer->engagement_score,
        ]);

        // Execute strategy
        $this->executeStrategy($customer, $campaignSend, $strategy);

        // Update campaign send record
        $campaignSend->update([
            'followup_triggered_at' => now(),
            'followup_count' => $followupCount + 1,
            'followup_strategy' => $strategy,
        ]);
    }

    /**
     * Determine follow-up strategy based on customer engagement and context
     */
    protected function determineStrategy(Customer $customer, int $followupCount, int $hoursSinceSent): string
    {
        $engagementScore = $customer->engagement_score ?? 0;

        // After 2 failed follow-ups, escalate to human
        if ($followupCount >= 2) {
            return 'escalated';
        }

        // High engagement score (>70): Try SMS first, then resend email
        if ($engagementScore >= 70) {
            if ($followupCount === 0) {
                return 'send_sms';
            }
            return 'resend_email';
        }

        // Medium engagement score (40-70): Resend email first, then SMS
        if ($engagementScore >= 40) {
            if ($followupCount === 0) {
                return 'resend_email';
            }
            return 'send_sms';
        }

        // Low engagement score (<40): Try resend email, then schedule call
        if ($followupCount === 0) {
            return 'resend_email';
        }

        // Second follow-up for low engagement: schedule call
        return 'schedule_call';
    }

    /**
     * Execute the determined follow-up strategy
     */
    protected function executeStrategy(Customer $customer, CampaignSend $campaignSend, string $strategy): void
    {
        match ($strategy) {
            'resend_email' => $this->resendEmail($customer, $campaignSend),
            'send_sms' => $this->sendSMSFollowup($customer, $campaignSend),
            'schedule_call' => $this->scheduleCall($customer, $campaignSend),
            'escalated' => $this->escalateToHuman($customer, $campaignSend),
            default => Log::warning("EmailFollowupService: Unknown strategy: {$strategy}"),
        };
    }

    /**
     * Resend the email with a modified subject line
     */
    protected function resendEmail(Customer $customer, CampaignSend $campaignSend): void
    {
        if (!$customer->canContactViaEmail()) {
            Log::warning("EmailFollowupService: Cannot resend email - customer opted out", [
                'customer_id' => $customer->id,
            ]);
            return;
        }

        // Get the original campaign
        $campaign = $campaignSend->campaign ?? null;

        if (!$campaign) {
            Log::warning("EmailFollowupService: No campaign found for resend", [
                'campaign_send_id' => $campaignSend->id,
            ]);
            return;
        }

        // Modify subject to indicate follow-up
        $originalSubject = $campaignSend->subject ?? $campaign->subject ?? 'Follow-up';
        $followupSubject = "Re: {$originalSubject}";

        // Create a new campaign send record for tracking
        $newCampaignSend = CampaignSend::create([
            'smb_id' => $campaignSend->smb_id,
            'campaign_id' => $campaignSend->campaign_id,
            'email' => $campaignSend->email,
            'subject' => $followupSubject,
            'status' => 'queued',
            'scheduled_for' => now(),
        ]);

        // Dispatch email job (adapt to your email sending system)
        // Note: This assumes you have a way to send emails via CampaignSend
        // You may need to adapt this based on your actual email sending implementation
        Log::info("EmailFollowupService: Resending email", [
            'customer_id' => $customer->id,
            'original_campaign_send_id' => $campaignSend->id,
            'new_campaign_send_id' => $newCampaignSend->id,
        ]);

        // Create interaction record
        Interaction::create([
            'customer_id' => $customer->id,
            'tenant_id' => $customer->tenant_id,
            'type' => 'email_followup',
            'title' => 'Email Follow-up: Unopened Email',
            'description' => "Resent email due to no open after 48 hours",
            'status' => 'completed',
            'completed_at' => now(),
            'metadata' => [
                'original_campaign_send_id' => $campaignSend->id,
                'new_campaign_send_id' => $newCampaignSend->id,
                'strategy' => 'resend_email',
                'followup_count' => $campaignSend->followup_count + 1,
            ],
        ]);
    }

    /**
     * Send SMS follow-up
     */
    protected function sendSMSFollowup(Customer $customer, CampaignSend $campaignSend): void
    {
        if (!$customer->canContactViaSMS()) {
            Log::warning("EmailFollowupService: Cannot send SMS - customer opted out", [
                'customer_id' => $customer->id,
            ]);
            return;
        }

        $campaign = $campaignSend->campaign ?? null;
        $campaignTitle = $campaign->title ?? 'our recent email';

        $message = "Hi {$customer->business_name}! We noticed you haven't opened our email about {$campaignTitle}. Want to learn more? Reply YES for more info!";

        // Dispatch SMS job
        // Note: Adapt this to your SMS sending implementation
        Log::info("EmailFollowupService: Sending SMS follow-up", [
            'customer_id' => $customer->id,
            'campaign_send_id' => $campaignSend->id,
        ]);

        // Create interaction record
        Interaction::create([
            'customer_id' => $customer->id,
            'tenant_id' => $customer->tenant_id,
            'type' => 'sms_followup',
            'title' => 'SMS Follow-up: Unopened Email',
            'description' => "Sent SMS follow-up for unopened email",
            'status' => 'completed',
            'completed_at' => now(),
            'metadata' => [
                'campaign_send_id' => $campaignSend->id,
                'strategy' => 'send_sms',
                'followup_count' => $campaignSend->followup_count + 1,
                'message' => $message,
            ],
        ]);
    }

    /**
     * Schedule a phone call follow-up
     */
    protected function scheduleCall(Customer $customer, CampaignSend $campaignSend): void
    {
        if (!$customer->canContactViaPhone()) {
            Log::warning("EmailFollowupService: Cannot schedule call - customer opted out", [
                'customer_id' => $customer->id,
            ]);
            return;
        }

        // Schedule call for next business day
        $scheduledAt = now()->addDay();
        // Skip weekends
        while ($scheduledAt->isWeekend()) {
            $scheduledAt->addDay();
        }
        // Schedule for business hours (9 AM - 5 PM)
        $scheduledAt->setTime(10, 0); // 10 AM

        Log::info("EmailFollowupService: Scheduling call follow-up", [
            'customer_id' => $customer->id,
            'campaign_send_id' => $campaignSend->id,
            'scheduled_at' => $scheduledAt->toISOString(),
        ]);

        // Create interaction for scheduled call
        Interaction::create([
            'customer_id' => $customer->id,
            'tenant_id' => $customer->tenant_id,
            'type' => 'call_followup',
            'title' => 'Call Follow-up: Unopened Email',
            'description' => "Scheduled call to follow up on unopened email",
            'status' => 'pending',
            'scheduled_at' => $scheduledAt,
            'due_at' => $scheduledAt,
            'priority' => 'normal',
            'metadata' => [
                'campaign_send_id' => $campaignSend->id,
                'strategy' => 'schedule_call',
                'followup_count' => $campaignSend->followup_count + 1,
            ],
        ]);

        // Optionally dispatch MakePhoneCall job for automated calls
        // MakePhoneCall::dispatch($customer, $campaignSend->campaign_id, [
        //     'reason' => 'unopened_email_followup',
        //     'scheduled_at' => $scheduledAt,
        // ]);
    }

    /**
     * Escalate to human after multiple failed follow-ups
     */
    protected function escalateToHuman(Customer $customer, CampaignSend $campaignSend): void
    {
        Log::info("EmailFollowupService: Escalating to human", [
            'customer_id' => $customer->id,
            'campaign_send_id' => $campaignSend->id,
        ]);

        // Create high-priority interaction for human review
        Interaction::create([
            'customer_id' => $customer->id,
            'tenant_id' => $customer->tenant_id,
            'type' => 'human_escalation',
            'title' => 'Escalation: Multiple Unopened Email Follow-ups',
            'description' => "Customer has not opened email after multiple follow-up attempts. Requires human intervention.",
            'status' => 'pending',
            'priority' => 'high',
            'due_at' => now()->addHours(4), // Due in 4 hours
            'metadata' => [
                'campaign_send_id' => $campaignSend->id,
                'strategy' => 'escalate',
                'followup_count' => $campaignSend->followup_count,
                'engagement_score' => $customer->engagement_score,
                'last_email_open' => $customer->last_email_open?->toISOString(),
            ],
        ]);

        // Update campaign send to mark as escalated
        $campaignSend->update([
            'followup_strategy' => 'escalated',
        ]);
    }
}

