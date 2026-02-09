<?php

namespace App\Services\Subscriber;

use App\Models\Subscriber\Subscriber;
use App\Models\Subscriber\SubscriberEvent;
use Illuminate\Database\Eloquent\Collection;

class EngagementService
{
    /**
     * Calculate engagement score for subscriber
     * Score 0-100 based on recent activity
     */
    public function calculateScore(Subscriber $subscriber): int
    {
        $score = 50; // Base score
        
        // Email engagement (last 30 days)
        $recentOpens = $this->getRecentOpens($subscriber->id, 30);
        $recentClicks = $this->getRecentClicks($subscriber->id, 30);
        $recentSends = $this->getRecentSends($subscriber->id, 30);
        
        if ($recentSends > 0) {
            $openRate = $recentOpens / $recentSends;
            $clickRate = $recentClicks / $recentSends;
            
            // Open rate contribution (max +25)
            $score += min(25, $openRate * 50);
            
            // Click rate contribution (max +25)
            $score += min(25, $clickRate * 100);
        }
        
        // Recency bonus
        if ($subscriber->last_email_opened_at) {
            $daysSinceOpen = $subscriber->last_email_opened_at->diffInDays(now());
            if ($daysSinceOpen < 7) {
                $score += 10;
            } elseif ($daysSinceOpen < 30) {
                $score += 5;
            } elseif ($daysSinceOpen > 90) {
                $score -= 15;
            }
        }
        
        // Login bonus
        if ($subscriber->last_login_at && $subscriber->last_login_at->diffInDays(now()) < 30) {
            $score += 10;
        }
        
        // Tenure bonus (longer = more valuable)
        $monthsSubscribed = $subscriber->created_at->diffInMonths(now());
        $score += min(10, $monthsSubscribed);
        
        // Cap at 0-100
        return max(0, min(100, $score));
    }
    
    /**
     * Update all subscriber engagement scores
     */
    public function updateAllScores(): void
    {
        Subscriber::where('status', 'active')
            ->chunk(1000, function ($subscribers) {
                foreach ($subscribers as $subscriber) {
                    $score = $this->calculateScore($subscriber);
                    $subscriber->update([
                        'engagement_score' => $score,
                        'engagement_calculated_at' => now(),
                    ]);
                }
            });
    }
    
    /**
     * Identify disengaged subscribers for re-engagement or cleanup
     */
    public function getDisengaged(int $daysSinceActivity = 90): Collection
    {
        return Subscriber::where('status', 'active')
            ->where('engagement_score', '<', 20)
            ->where(function ($q) use ($daysSinceActivity) {
                $q->whereNull('last_email_opened_at')
                  ->orWhere('last_email_opened_at', '<', now()->subDays($daysSinceActivity));
            })
            ->get();
    }
    
    private function getRecentOpens(int $subscriberId, int $days): int
    {
        return SubscriberEvent::where('subscriber_id', $subscriberId)
            ->where('event_type', 'open')
            ->where('created_at', '>=', now()->subDays($days))
            ->count();
    }
    
    private function getRecentClicks(int $subscriberId, int $days): int
    {
        return SubscriberEvent::where('subscriber_id', $subscriberId)
            ->where('event_type', 'click')
            ->where('created_at', '>=', now()->subDays($days))
            ->count();
    }
    
    private function getRecentSends(int $subscriberId, int $days): int
    {
        return SubscriberEvent::where('subscriber_id', $subscriberId)
            ->where('event_type', 'sent')
            ->where('created_at', '>=', now()->subDays($days))
            ->count();
    }
}



