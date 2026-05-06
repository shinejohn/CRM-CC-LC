<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Approval;
use App\Models\Customer;
use App\Models\EmailDeliveryEvent;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

final class EngagementService
{
    /**
     * Calculate engagement score based on recent activity
     * Score range: 0-100
     */
    public function calculateScore(Customer $customer): int
    {
        $score = 0;
        $config = config('fibonacco.engagement.score_weights', [
            'email_open' => 1,
            'email_click' => 3,
            'content_view' => 2,
            'approval' => 5,
        ]);

        // Email engagement (last 30 days)
        $emailOpens = $this->countEmailOpens($customer, 30);
        $score += min($emailOpens * $config['email_open'], 25);

        $emailClicks = $this->countEmailClicks($customer, 30);
        $score += min($emailClicks * $config['email_click'], 30);

        // Content engagement (last 30 days)
        $contentViews = $this->countContentViews($customer, 30);
        $score += min($contentViews * $config['content_view'], 20);

        // Approvals (all time, weighted by recency)
        $approvalScore = $this->calculateApprovalScore($customer);
        $score += min($approvalScore, 25);

        return min($score, 100);
    }

    /**
     * Count email opens in last N days from delivery tracking (Postal + normalized types).
     */
    public function countEmailOpens(Customer $customer, int $days): int
    {
        $since = Carbon::now()->subDays($days);

        return EmailDeliveryEvent::query()
            ->join('campaign_recipients', 'email_delivery_events.campaign_recipient_id', '=', 'campaign_recipients.id')
            ->where('campaign_recipients.customer_id', $customer->id)
            ->where('email_delivery_events.received_at', '>=', $since)
            ->whereIn('email_delivery_events.event_type', $this->openEventTypes())
            ->count();
    }

    /**
     * Count email clicks in last N days from delivery tracking.
     */
    public function countEmailClicks(Customer $customer, int $days): int
    {
        $since = Carbon::now()->subDays($days);

        return EmailDeliveryEvent::query()
            ->join('campaign_recipients', 'email_delivery_events.campaign_recipient_id', '=', 'campaign_recipients.id')
            ->where('campaign_recipients.customer_id', $customer->id)
            ->where('email_delivery_events.received_at', '>=', $since)
            ->whereIn('email_delivery_events.event_type', $this->clickEventTypes())
            ->count();
    }

    /**
     * Count content views in last N days
     */
    public function countContentViews(Customer $customer, int $days): int
    {
        if (! DB::getSchemaBuilder()->hasTable('content_views')) {
            return 0;
        }

        return DB::table('content_views')
            ->where('customer_id', $customer->id)
            ->where('viewed_at', '>=', Carbon::now()->subDays($days))
            ->count();
    }

    /**
     * Sum per-approval points with weekly decay (5 pts each, −1 per week since approval).
     */
    public function calculateApprovalScore(Customer $customer): int
    {
        $approvals = Approval::query()
            ->where('customer_id', $customer->id)
            ->whereNotNull('approved_at')
            ->orderByDesc('approved_at')
            ->get(['approved_at']);

        if ($approvals->isEmpty()) {
            return 0;
        }

        $total = 0;
        foreach ($approvals as $approval) {
            $days = $approval->approved_at->diffInDays(Carbon::now());
            $weeks = (int) ($days / 7);
            $total += max(0, 5 - $weeks);
        }

        return min($total, 25);
    }

    /**
     * Determine if tier should change based on score
     */
    public function evaluateTierChange(Customer $customer): ?int
    {
        $score = $customer->engagement_score;
        $currentTier = $customer->engagement_tier;
        $tiers = config('fibonacco.engagement.tiers', []);

        // Highest tier whose min_score the customer meets (tiers ordered 1 = best … 4 = passive).
        $newTier = 4;
        $highestMin = -1;
        foreach ($tiers as $tierNum => $config) {
            $min = (int) ($config['min_score'] ?? 0);
            if ($score >= $min && $min > $highestMin) {
                $highestMin = $min;
                $newTier = (int) $tierNum;
            }
        }

        // Only return if changed
        return ($newTier !== $currentTier) ? $newTier : null;
    }

    /**
     * @return list<string>
     */
    private function openEventTypes(): array
    {
        return ['MessageLoaded', 'open', 'Open'];
    }

    /**
     * @return list<string>
     */
    private function clickEventTypes(): array
    {
        return ['MessageLinkClicked', 'click', 'Click'];
    }
}
