<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EngagementService
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
     * Count email opens in last N days
     */
    public function countEmailOpens(Customer $customer, int $days): int
    {
        // This will query campaign_sends table (from Module 2)
        // For now, use last_email_open timestamp
        if (!$customer->last_email_open) {
            return 0;
        }

        $daysSinceLastOpen = Carbon::now()->diffInDays($customer->last_email_open);
        if ($daysSinceLastOpen > $days) {
            return 0;
        }

        // TODO: Query actual email opens from campaign_sends table when Module 2 is ready
        // For now, return 1 if opened in last N days
        return 1;
    }

    /**
     * Count email clicks in last N days
     */
    public function countEmailClicks(Customer $customer, int $days): int
    {
        if (!$customer->last_email_click) {
            return 0;
        }

        $daysSinceLastClick = Carbon::now()->diffInDays($customer->last_email_click);
        if ($daysSinceLastClick > $days) {
            return 0;
        }

        // TODO: Query actual email clicks from campaign_sends table when Module 2 is ready
        return 1;
    }

    /**
     * Count content views in last N days
     */
    public function countContentViews(Customer $customer, int $days): int
    {
        // Query content_views table (from Module 3)
        // Check if table exists first
        if (!DB::getSchemaBuilder()->hasTable('content_views')) {
            return 0;
        }

        return DB::table('content_views')
            ->where('customer_id', $customer->id)
            ->where('viewed_at', '>=', Carbon::now()->subDays($days))
            ->count();
    }

    /**
     * Calculate approval score (weighted by recency)
     */
    public function calculateApprovalScore(Customer $customer): int
    {
        if (!$customer->last_approval) {
            return 0;
        }

        $daysSinceApproval = Carbon::now()->diffInDays($customer->last_approval);
        
        // Weight: 5 points per approval, decay by 1 point per week
        $baseScore = 5;
        $decay = (int) ($daysSinceApproval / 7);
        
        return max(0, $baseScore - $decay);
    }

    /**
     * Determine if tier should change based on score
     */
    public function evaluateTierChange(Customer $customer): ?int
    {
        $score = $customer->engagement_score;
        $currentTier = $customer->engagement_tier;
        $tiers = config('fibonacco.engagement.tiers', []);

        // Find appropriate tier based on score
        $newTier = 4; // Default to Passive
        foreach ($tiers as $tier => $config) {
            if ($score >= $config['min_score']) {
                $newTier = $tier;
                break;
            }
        }

        // Only return if changed
        return ($newTier !== $currentTier) ? $newTier : null;
    }
}



