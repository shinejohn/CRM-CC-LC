<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Conversation;
use App\Models\Order;
use App\Models\ServiceSubscription;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CrmAdvancedAnalyticsService
{
    /**
     * Calculate customer engagement score
     * 
     * Factors:
     * - Number of conversations
     * - Average conversation duration
     * - Questions asked
     * - Recent activity
     * - Time since last interaction
     */
    public function calculateEngagementScore(string $customerId, string $tenantId): int
    {
        $customer = Customer::where('tenant_id', $tenantId)->find($customerId);
        if (!$customer) {
            return 0;
        }

        $score = 0;

        // Base score from lead score
        $score += (int) ($customer->lead_score * 0.3);

        // Conversation activity (max 30 points)
        $conversationCount = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->count();
        
        $conversationScore = min($conversationCount * 5, 30);
        $score += $conversationScore;

        // Average conversation duration (max 20 points)
        $avgDuration = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->whereNotNull('duration_seconds')
            ->avg('duration_seconds');
        
        if ($avgDuration) {
            // 60 seconds = 5 points, 300 seconds (5 min) = 20 points
            $durationScore = min((int) ($avgDuration / 15), 20);
            $score += $durationScore;
        }

        // Questions asked (max 15 points)
        $totalQuestions = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->whereNotNull('questions_asked')
            ->get()
            ->sum(function ($conv) {
                return is_array($conv->questions_asked) ? count($conv->questions_asked) : 0;
            });
        
        $questionScore = min($totalQuestions * 2, 15);
        $score += $questionScore;

        // Recent activity (max 25 points)
        $recentConversations = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->where('started_at', '>=', Carbon::now()->subDays(30))
            ->count();
        
        $recentScore = min($recentConversations * 5, 25);
        $score += $recentScore;

        // Time since last interaction (penalty)
        $lastConversation = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->orderBy('started_at', 'desc')
            ->first();
        
        if ($lastConversation) {
            $daysSinceLastContact = Carbon::now()->diffInDays($lastConversation->started_at);
            // Penalty: -1 point per week after 4 weeks
            if ($daysSinceLastContact > 28) {
                $penalty = (int) (($daysSinceLastContact - 28) / 7);
                $score = max(0, $score - $penalty);
            }
        } else {
            // No conversations = low engagement
            $score = max(0, $score - 20);
        }

        // Cap at 100
        return min(100, max(0, $score));
    }

    /**
     * Calculate campaign ROI
     * 
     * ROI = (Revenue - Cost) / Cost * 100
     */
    public function calculateCampaignROI(string $campaignId, string $tenantId, ?int $days = null): array
    {
        $startDate = $days ? Carbon::now()->subDays($days) : null;

        // Get conversations from this campaign
        // Note: Campaign tracking relies on entry_point field or metadata
        // For better tracking, campaigns should store campaign_id in conversation metadata
        $query = Conversation::where('tenant_id', $tenantId)
            ->where(function ($q) use ($campaignId) {
                // Try to match by entry_point (basic match)
                $q->where('entry_point', $campaignId)
                  ->orWhere('entry_point', 'like', "%{$campaignId}%");
            });
        
        if ($startDate) {
            $query->where('started_at', '>=', $startDate);
        }

        $conversations = $query->get();

        // Count conversions (purchases)
        $conversions = Conversation::where('tenant_id', $tenantId)
            ->where('outcome', 'service_purchase')
            ->whereIn('id', $conversations->pluck('id'))
            ->count();

        // Calculate revenue from purchases
        $revenue = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->whereIn('customer_id', $conversations->whereNotNull('customer_id')->pluck('customer_id'))
            ->when($startDate, function ($q) use ($startDate) {
                $q->where('paid_at', '>=', $startDate);
            })
            ->sum('total');

        // Estimate campaign cost (placeholder - should be from campaign cost data)
        // Default: $0.50 per conversation (email campaign cost estimate)
        $cost = $conversations->count() * 0.50;

        // Calculate ROI
        $roi = $cost > 0 ? (($revenue - $cost) / $cost) * 100 : 0;
        $roas = $cost > 0 ? $revenue / $cost : 0; // Return on Ad Spend

        return [
            'campaign_id' => $campaignId,
            'conversations' => $conversations->count(),
            'conversions' => $conversions,
            'conversion_rate' => $conversations->count() > 0 
                ? ($conversions / $conversations->count()) * 100 
                : 0,
            'revenue' => (float) $revenue,
            'cost' => (float) $cost,
            'roi' => round($roi, 2),
            'roas' => round($roas, 2),
            'profit' => (float) ($revenue - $cost),
            'period_days' => $days,
        ];
    }

    /**
     * Calculate predictive lead score
     * 
     * Uses machine learning-like approach based on historical data:
     * - Similar customers who converted
     * - Engagement patterns
     * - Purchase history patterns
     * - Industry trends
     */
    public function calculatePredictiveLeadScore(string $customerId, string $tenantId): array
    {
        $customer = Customer::where('tenant_id', $tenantId)->find($customerId);
        if (!$customer) {
            return [
                'current_score' => 0,
                'predicted_score' => 0,
                'confidence' => 0,
                'factors' => [],
            ];
        }

        $currentScore = $customer->lead_score ?? 0;
        $predictedScore = $currentScore;
        $factors = [];

        // Factor 1: Industry conversion rate (max +15 points)
        $industryConversions = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->whereHas('customer', function ($q) use ($customer) {
                if ($customer->industry_category) {
                    $q->where('industry_category', $customer->industry_category);
                }
            })
            ->count();
        
        $industryCustomers = Customer::where('tenant_id', $tenantId)
            ->where('industry_category', $customer->industry_category)
            ->count();
        
        if ($industryCustomers > 0) {
            $industryConversionRate = ($industryConversions / $industryCustomers) * 100;
            $industryFactor = min((int) ($industryConversionRate / 2), 15);
            $predictedScore += $industryFactor;
            $factors[] = [
                'factor' => 'Industry conversion rate',
                'impact' => "+{$industryFactor}",
                'details' => "{$industryConversionRate}% conversion rate in {$customer->industry_category}",
            ];
        }

        // Factor 2: Engagement trend (max +20 points)
        $recentConversations = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->where('started_at', '>=', Carbon::now()->subDays(30))
            ->count();
        
        $olderConversations = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->where('started_at', '>=', Carbon::now()->subDays(60))
            ->where('started_at', '<', Carbon::now()->subDays(30))
            ->count();
        
        if ($olderConversations > 0) {
            $engagementTrend = ($recentConversations / $olderConversations) - 1;
            if ($engagementTrend > 0.5) {
                // 50%+ increase in engagement
                $trendFactor = min((int) ($engagementTrend * 20), 20);
                $predictedScore += $trendFactor;
                $factors[] = [
                    'factor' => 'Engagement trend',
                    'impact' => "+{$trendFactor}",
                    'details' => sprintf(
                        '%.0f%% increase in recent conversations',
                        $engagementTrend * 100
                    ),
                ];
            }
        }

        // Factor 3: Similar customer conversion rate (max +25 points)
        // Find customers with similar profiles who converted
        $similarCustomers = Customer::where('tenant_id', $tenantId)
            ->where('id', '!=', $customerId)
            ->when($customer->industry_category, function ($q) use ($customer) {
                $q->where('industry_category', $customer->industry_category);
            })
            ->where('lead_score', '>=', $currentScore - 10)
            ->where('lead_score', '<=', $currentScore + 10)
            ->pluck('id');
        
        if ($similarCustomers->count() > 0) {
            $similarConversions = Order::where('tenant_id', $tenantId)
                ->where('payment_status', 'paid')
                ->whereIn('customer_id', $similarCustomers)
                ->count();
            
            $similarConversionRate = ($similarConversions / $similarCustomers->count()) * 100;
            $similarFactor = min((int) ($similarConversionRate / 2), 25);
            $predictedScore += $similarFactor;
            $factors[] = [
                'factor' => 'Similar customer conversion',
                'impact' => "+{$similarFactor}",
                'details' => "{$similarConversionRate}% conversion rate for similar customers",
            ];
        }

        // Factor 4: Time in pipeline (max +15 points for recent additions)
        $daysSinceFirstContact = $customer->first_contact_at 
            ? Carbon::now()->diffInDays($customer->first_contact_at)
            : null;
        
        if ($daysSinceFirstContact !== null && $daysSinceFirstContact < 30) {
            // New customers more likely to convert
            $timeFactor = max(0, 15 - (int) ($daysSinceFirstContact / 2));
            $predictedScore += $timeFactor;
            $factors[] = [
                'factor' => 'Time in pipeline',
                'impact' => "+{$timeFactor}",
                'details' => "Recently added ({$daysSinceFirstContact} days ago)",
            ];
        } elseif ($daysSinceFirstContact !== null && $daysSinceFirstContact > 180) {
            // Old leads less likely
            $timePenalty = min((int) (($daysSinceFirstContact - 180) / 30), 10);
            $predictedScore = max(0, $predictedScore - $timePenalty);
            $factors[] = [
                'factor' => 'Time in pipeline',
                'impact' => "-{$timePenalty}",
                'details' => "Long time in pipeline ({$daysSinceFirstContact} days)",
            ];
        }

        // Factor 5: Conversation outcomes (max +10 points)
        $positiveOutcomes = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->whereIn('outcome', ['demo_scheduled', 'pricing_requested', 'interested'])
            ->count();
        
        if ($positiveOutcomes > 0) {
            $outcomeFactor = min($positiveOutcomes * 3, 10);
            $predictedScore += $outcomeFactor;
            $factors[] = [
                'factor' => 'Positive outcomes',
                'impact' => "+{$outcomeFactor}",
                'details' => "{$positiveOutcomes} conversations with positive outcomes",
            ];
        }

        // Cap predicted score at 100
        $predictedScore = min(100, max(0, (int) $predictedScore));

        // Calculate confidence (based on data availability)
        $confidence = $this->calculateConfidence($customer, $tenantId);

        return [
            'current_score' => $currentScore,
            'predicted_score' => $predictedScore,
            'score_change' => $predictedScore - $currentScore,
            'confidence' => $confidence,
            'factors' => $factors,
        ];
    }

    /**
     * Calculate confidence level for predictive score
     */
    private function calculateConfidence(Customer $customer, string $tenantId): int
    {
        $confidence = 50; // Base confidence

        // More conversations = higher confidence
        $conversationCount = Conversation::where('customer_id', $customer->id)
            ->where('tenant_id', $tenantId)
            ->count();
        
        $confidence += min($conversationCount * 5, 25);

        // More industry data = higher confidence
        $industryCustomers = Customer::where('tenant_id', $tenantId)
            ->where('industry_category', $customer->industry_category)
            ->count();
        
        if ($industryCustomers > 10) {
            $confidence += 15;
        } elseif ($industryCustomers > 5) {
            $confidence += 10;
        }

        // Recent activity = higher confidence
        $recentActivity = Conversation::where('customer_id', $customer->id)
            ->where('tenant_id', $tenantId)
            ->where('started_at', '>=', Carbon::now()->subDays(30))
            ->count();
        
        if ($recentActivity > 0) {
            $confidence += 10;
        }

        return min(100, $confidence);
    }
}
