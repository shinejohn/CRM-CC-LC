<?php

declare(strict_types=1);

namespace App\Services\Sarah;

use App\Models\AdvertiserSession;
use App\Models\Campaign;
use App\Models\SarahMessage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Manages Sarah's messaging lifecycle — intake, proposal, pushback,
 * confirmation, performance summaries, renewal prompts, and upsells.
 *
 * Sarah is the persistent AI relationship for every advertiser. This service
 * handles both the conversational flow during campaign creation and the
 * ongoing account management messages after purchase.
 */
final class SarahMessageService
{
    /**
     * Send a message from Sarah (outbound).
     */
    public function send(
        AdvertiserSession|Campaign $parent,
        string $type,
        string $message,
        array $context = [],
    ): SarahMessage {
        $attributes = [
            'type' => $type,
            'direction' => 'outbound',
            'message' => $message,
            'context' => $context ?: null,
        ];

        if ($parent instanceof AdvertiserSession) {
            $attributes['advertiser_session_id'] = $parent->id;
            $attributes['business_id'] = $parent->business_id;
            $attributes['campaign_id'] = $parent->campaign_id;
        } else {
            $attributes['campaign_id'] = $parent->id;
            $attributes['business_id'] = $parent->smb_id;
        }

        return SarahMessage::create($attributes);
    }

    /**
     * Record a message from the user (inbound).
     */
    public function recordUserMessage(
        AdvertiserSession $session,
        string $type,
        string $message,
        array $context = [],
    ): SarahMessage {
        return SarahMessage::create([
            'advertiser_session_id' => $session->id,
            'business_id' => $session->business_id,
            'campaign_id' => $session->campaign_id,
            'type' => $type,
            'direction' => 'inbound',
            'message' => $message,
            'context' => $context ?: null,
        ]);
    }

    /**
     * Send a pushback message when the user adjusts products.
     *
     * @param  list<array{type: string, message: string, suggestion?: string}>  $warnings
     */
    public function sendPushback(AdvertiserSession $session, array $warnings): void
    {
        foreach ($warnings as $warning) {
            if (in_array($warning['type'], ['soft_block', 'hard_block'], true)) {
                $this->send($session, 'pushback', $warning['message'], [
                    'warning_type' => $warning['type'],
                    'suggestion' => $warning['suggestion'] ?? null,
                ]);
            }
        }
    }

    /**
     * Send a performance summary for an active campaign.
     *
     * @param  array<string, mixed>  $metrics
     */
    public function sendPerformanceSummary(Campaign $campaign, array $metrics): SarahMessage
    {
        $businessName = $campaign->smb?->business_name ?? 'your business';
        $impressions = $metrics['impressions'] ?? 0;
        $clicks = $metrics['clicks'] ?? 0;

        $message = "Weekly update for {$businessName}: Your campaign reached {$impressions} people and got {$clicks} clicks.";

        if (($metrics['ctr'] ?? 0) > 0.05) {
            $message .= ' That click rate is above average — your ads are connecting well.';
        }

        return $this->send($campaign, 'performance', $message, $metrics);
    }

    /**
     * Send a renewal prompt before campaign expiry.
     */
    public function sendRenewalPrompt(Campaign $campaign, int $daysRemaining): SarahMessage
    {
        $businessName = $campaign->smb?->business_name ?? 'your campaign';

        $message = "Heads up — {$businessName}'s campaign ends in {$daysRemaining} days. "
            . 'Results have been solid. Want to keep it going?';

        return $this->send($campaign, 'renewal', $message, [
            'days_remaining' => $daysRemaining,
            'campaign_id' => $campaign->id,
        ]);
    }

    /**
     * Send an upsell suggestion based on campaign performance.
     *
     * @param  array<int, array<string, mixed>>  $recommendations  Optional intelligence-driven recommendations
     */
    public function sendUpsell(
        Campaign $campaign,
        string $suggestedProduct,
        string $reason,
        array $recommendations = [],
    ): SarahMessage {
        return $this->send($campaign, 'upsell', $reason, [
            'suggested_product' => $suggestedProduct,
            'campaign_id' => $campaign->id,
            'recommendations' => $recommendations,
        ]);
    }

    /**
     * Get conversation history for a session.
     */
    public function getConversation(AdvertiserSession $session): Collection
    {
        return SarahMessage::where('advertiser_session_id', $session->id)
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get all messages for a campaign (post-purchase).
     */
    public function getCampaignMessages(Campaign $campaign): Collection
    {
        return SarahMessage::where('campaign_id', $campaign->id)
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get unactioned messages for a business (for CC operator dashboard).
     */
    public function getUnactionedMessages(?string $businessId = null): Collection
    {
        $query = SarahMessage::where('actioned', false)
            ->where('direction', 'outbound')
            ->whereIn('type', ['renewal', 'upsell', 'performance']);

        if ($businessId) {
            $query->where('business_id', $businessId);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Mark a message as actioned (user responded).
     */
    public function markActioned(SarahMessage $message, string $action): void
    {
        $message->markActioned($action);

        Log::info('Sarah message actioned', [
            'message_id' => $message->id,
            'type' => $message->type,
            'action' => $action,
        ]);
    }
}
