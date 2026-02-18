<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Conversation;
use App\Models\Order;
use App\Models\ServiceSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CrmDashboardController extends Controller
{
    /**
     * Get CRM dashboard analytics
     */
    public function analytics(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        // Date range (default to last 30 days)
        $days = (int) ($request->input('days', 30));
        $startDate = Carbon::now()->subDays($days);
        $endDate = Carbon::now();

        // Customer Metrics
        $totalCustomers = Customer::where('tenant_id', $tenantId)->count();
        $newCustomers = Customer::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->count();
        
        $customersByLeadScore = Customer::where('tenant_id', $tenantId)
            ->selectRaw('
                CASE 
                    WHEN lead_score >= 80 THEN "high"
                    WHEN lead_score >= 50 THEN "medium"
                    WHEN lead_score >= 25 THEN "low"
                    ELSE "cold"
                END as score_category,
                COUNT(*) as count
            ')
            ->groupBy('score_category')
            ->get()
            ->pluck('count', 'score_category')
            ->toArray();

        $customersByIndustry = Customer::where('tenant_id', $tenantId)
            ->whereNotNull('industry_category')
            ->select('industry_category', DB::raw('COUNT(*) as count'))
            ->groupBy('industry_category')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'industry' => $item->industry_category,
                    'count' => (int) $item->count,
                ];
            });

        // Conversation Metrics
        $totalConversations = Conversation::where('tenant_id', $tenantId)->count();
        $recentConversations = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->count();

        $conversationsByOutcome = Conversation::where('tenant_id', $tenantId)
            ->whereNotNull('outcome')
            ->select('outcome', DB::raw('COUNT(*) as count'))
            ->groupBy('outcome')
            ->get()
            ->map(function ($item) {
                return [
                    'outcome' => $item->outcome,
                    'count' => (int) $item->count,
                ];
            });

        $avgConversationDuration = Conversation::where('tenant_id', $tenantId)
            ->whereNotNull('duration_seconds')
            ->where('duration_seconds', '>', 0)
            ->avg('duration_seconds');

        // Order & Revenue Metrics
        $totalOrders = Order::where('tenant_id', $tenantId)->count();
        $paidOrders = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->count();
        
        $totalRevenue = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->sum('total');
        
        $recentRevenue = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->sum('total');
        
        $recentOrders = Order::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->count();

        // Revenue over time (last 30 days, grouped by day)
        // PostgreSQL: CAST(paid_at AS DATE) or DATE_TRUNC('day', paid_at)::DATE
        $revenueOverTime = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->selectRaw("CAST(paid_at AS DATE) as date, SUM(total) as revenue")
            ->groupBy(DB::raw("CAST(paid_at AS DATE)"))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date instanceof \Carbon\Carbon 
                        ? $item->date->toDateString() 
                        : (string) $item->date,
                    'revenue' => (float) $item->revenue,
                ];
            });

        // Subscription Metrics
        $activeSubscriptions = ServiceSubscription::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->count();
        
        $subscriptionsByTier = ServiceSubscription::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->select('tier', DB::raw('COUNT(*) as count'))
            ->groupBy('tier')
            ->get()
            ->map(function ($item) {
                return [
                    'tier' => $item->tier,
                    'count' => (int) $item->count,
                ];
            });

        // Conversion Metrics
        $conversationsWithPurchase = Conversation::where('tenant_id', $tenantId)
            ->where('outcome', 'service_purchase')
            ->count();
        
        $conversionRate = $totalConversations > 0 
            ? ($conversationsWithPurchase / $totalConversations) * 100 
            : 0;

        // Recent Activity (last 10 items)
        $recentCustomers = Customer::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'business_name', 'email', 'lead_score', 'created_at']);

        $recentOrders = Order::where('tenant_id', $tenantId)
            ->with('customer:id,business_name')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'order_number', 'customer_id', 'total', 'status', 'payment_status', 'created_at']);

        $recentConversations = Conversation::where('tenant_id', $tenantId)
            ->with('customer:id,business_name')
            ->orderBy('started_at', 'desc')
            ->limit(5)
            ->get(['id', 'customer_id', 'outcome', 'duration_seconds', 'started_at']);

        return response()->json([
            'data' => [
                'customers' => [
                    'total' => $totalCustomers,
                    'new' => $newCustomers,
                    'by_lead_score' => [
                        'high' => (int) ($customersByLeadScore['high'] ?? 0),
                        'medium' => (int) ($customersByLeadScore['medium'] ?? 0),
                        'low' => (int) ($customersByLeadScore['low'] ?? 0),
                        'cold' => (int) ($customersByLeadScore['cold'] ?? 0),
                    ],
                    'by_industry' => $customersByIndustry,
                ],
                'conversations' => [
                    'total' => $totalConversations,
                    'recent' => $recentConversations,
                    'by_outcome' => $conversationsByOutcome,
                    'avg_duration_seconds' => $avgConversationDuration ? (int) $avgConversationDuration : null,
                ],
                'orders' => [
                    'total' => $totalOrders,
                    'paid' => $paidOrders,
                    'recent' => $recentOrders,
                    'total_revenue' => (float) $totalRevenue,
                    'recent_revenue' => (float) $recentRevenue,
                    'revenue_over_time' => $revenueOverTime,
                ],
                'subscriptions' => [
                    'active' => $activeSubscriptions,
                    'by_tier' => $subscriptionsByTier,
                ],
                'conversion' => [
                    'rate' => round($conversionRate, 2),
                    'conversations_with_purchase' => $conversationsWithPurchase,
                ],
                'recent_activity' => [
                    'customers' => $recentCustomers,
                    'orders' => $recentOrders,
                    'conversations' => $recentConversations,
                ],
                'date_range' => [
                    'start' => $startDate->toDateString(),
                    'end' => $endDate->toDateString(),
                    'days' => $days,
                ],
            ],
        ]);
    }

    /**
     * Get AI recommendations for tenant dashboard
     * GET /v1/crm/recommendations
     */
    public function recommendations(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $recommendations = [];

        $atRiskCount = Customer::where('tenant_id', $tenantId)
            ->where(function ($q) {
                $q->where('engagement_score', '<', 30)
                    ->orWhere(function ($q2) {
                        $q2->whereNull('last_email_open')
                            ->where('created_at', '<', Carbon::now()->subDays(60));
                    });
            })
            ->count();

        if ($atRiskCount > 0) {
            $recommendations[] = [
                'priority' => 'high',
                'category' => 'engagement',
                'title' => 'Re-engage At-Risk Customers',
                'impact' => '$' . ($atRiskCount * 800) . ' potential',
                'description' => "{$atRiskCount} customers haven't engaged in 60+ days. Historical value at risk.",
                'actions' => ['Launch Re-engagement Campaign', 'View Customers'],
            ];
        }

        $highIntentCount = Customer::where('tenant_id', $tenantId)
            ->where('lead_score', '>=', 70)
            ->where('campaign_status', '!=', 'running')
            ->count();

        if ($highIntentCount > 0) {
            $recommendations[] = [
                'priority' => 'opportunity',
                'category' => 'sales',
                'title' => 'High-Intent Leads Ready',
                'impact' => '+' . $highIntentCount . ' conversions',
                'description' => "{$highIntentCount} leads show strong buying signals. Prioritize follow-up.",
                'actions' => ['Schedule Strategy Call', 'View Leads'],
            ];
        }

        $recommendations[] = [
            'priority' => 'opportunity',
            'category' => 'marketing',
            'title' => 'Increase Email Frequency',
            'impact' => '+$800/mo',
            'description' => 'Email open rates above industry average. Increasing from 2x to 3x monthly could generate additional leads.',
            'actions' => ['Schedule Strategy Call', 'Adjust Email Frequency'],
        ];

        return response()->json(['data' => $recommendations]);
    }
}
