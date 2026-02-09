<?php

namespace App\Jobs;

use App\Events\EmailNotOpened;
use App\Models\CampaignSend;
use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckUnopenedEmails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Number of hours after sending to check for unopened emails
     */
    protected int $hoursThreshold = 48;

    public function __construct(int $hoursThreshold = 48)
    {
        $this->hoursThreshold = $hoursThreshold;
        $this->onQueue('default');
    }

    public function handle(): void
    {
        $cutoffTime = now()->subHours($this->hoursThreshold);

        // Find emails that:
        // 1. Were sent at least X hours ago
        // 2. Haven't been opened
        // 3. Haven't bounced or been complained about
        // 4. Haven't had a follow-up triggered yet
        $unopenedEmails = CampaignSend::where('status', 'sent')
            ->whereNotNull('sent_at')
            ->where('sent_at', '<=', $cutoffTime)
            ->whereNull('opened_at')
            ->whereNull('bounced_at')
            ->whereNull('complained_at')
            ->whereNull('followup_triggered_at')
            ->with('customer')
            ->get();

        Log::info("CheckUnopenedEmails: Found {$unopenedEmails->count()} unopened emails");

        foreach ($unopenedEmails as $campaignSend) {
            try {
                $customer = $this->getCustomer($campaignSend);
                
                if (!$customer) {
                    Log::warning("CheckUnopenedEmails: No customer found for campaign_send {$campaignSend->id}");
                    continue;
                }

                // Skip if customer has opted out
                if ($customer->do_not_contact || !$customer->email_opted_in) {
                    Log::info("CheckUnopenedEmails: Skipping customer {$customer->id} - opted out");
                    continue;
                }

                $hoursSinceSent = $campaignSend->sent_at->diffInHours(now());

                // Fire event
                event(new EmailNotOpened(
                    customer: $customer,
                    campaignSend: $campaignSend,
                    hoursSinceSent: $hoursSinceSent
                ));

                Log::info("CheckUnopenedEmails: Fired EmailNotOpened event", [
                    'customer_id' => $customer->id,
                    'campaign_send_id' => $campaignSend->id,
                    'hours_since_sent' => $hoursSinceSent,
                ]);

            } catch (\Exception $e) {
                Log::error("CheckUnopenedEmails: Error processing campaign_send {$campaignSend->id}", [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }
    }

    /**
     * Get customer from campaign send
     * Uses the customer relationship method
     */
    protected function getCustomer(CampaignSend $campaignSend): ?Customer
    {
        // Use the customer relationship if available
        if (method_exists($campaignSend, 'customer')) {
            return $campaignSend->customer;
        }

        // Fallback: direct lookup if smb_id points to customers table
        if ($campaignSend->smb_id) {
            return Customer::find($campaignSend->smb_id);
        }

        return null;
    }
}

