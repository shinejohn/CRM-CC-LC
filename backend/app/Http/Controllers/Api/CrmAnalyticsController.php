<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Knowledge;
use App\Models\GeneratedPresentation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CrmAnalyticsController extends Controller
{
    /**
     * Get interest monitoring analytics
     */
    public function interest(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $days = (int) ($request->input('days', 30));
        $startDate = Carbon::now()->subDays($days);

        // Interest indicators from conversations
        $interestByTopic = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('topics_discussed')
            ->select('topics_discussed')
            ->get()
            ->flatMap(function ($conv) {
                return is_array($conv->topics_discussed) ? $conv->topics_discussed : [];
            })
            ->countBy()
            ->map(function ($count, $topic) {
                return [
                    'topic' => $topic,
                    'count' => $count,
                ];
            })
            ->sortByDesc('count')
            ->values()
            ->take(10);

        // Questions asked (indicates interest)
        $questionsByType = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('questions_asked')
            ->select('questions_asked')
            ->get()
            ->flatMap(function ($conv) {
                return is_array($conv->questions_asked) ? $conv->questions_asked : [];
            })
            ->countBy()
            ->map(function ($count, $question) {
                return [
                    'question' => substr($question, 0, 100),
                    'count' => $count,
                ];
            })
            ->sortByDesc('count')
            ->values()
            ->take(10);

        // Engagement level by customer
        $customerEngagement = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('customer_id')
            ->select('customer_id', DB::raw('COUNT(*) as conversation_count'), DB::raw('AVG(duration_seconds) as avg_duration'))
            ->groupBy('customer_id')
            ->with('customer:id,business_name,email,lead_score')
            ->get()
            ->map(function ($item) {
                return [
                    'customer_id' => $item->customer_id,
                    'customer_name' => $item->customer->business_name ?? 'Unknown',
                    'customer_email' => $item->customer->email ?? null,
                    'lead_score' => $item->customer->lead_score ?? 0,
                    'conversation_count' => (int) $item->conversation_count,
                    'avg_duration' => $item->avg_duration ? (int) $item->avg_duration : null,
                ];
            })
            ->sortByDesc('conversation_count')
            ->values()
            ->take(20);

        // Interest over time
        $interestOverTime = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->selectRaw("CAST(started_at AS DATE) as date, COUNT(*) as count")
            ->groupBy(DB::raw("CAST(started_at AS DATE)"))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date instanceof \Carbon\Carbon 
                        ? $item->date->toDateString() 
                        : (string) $item->date,
                    'count' => (int) $item->count,
                ];
            });

        return response()->json([
            'data' => [
                'interest_by_topic' => $interestByTopic,
                'questions_by_type' => $questionsByType,
                'customer_engagement' => $customerEngagement,
                'interest_over_time' => $interestOverTime,
                'date_range' => [
                    'start' => $startDate->toDateString(),
                    'end' => Carbon::now()->toDateString(),
                    'days' => $days,
                ],
            ],
        ]);
    }

    /**
     * Get purchase tracking analytics
     */
    public function purchases(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $days = (int) ($request->input('days', 30));
        $startDate = Carbon::now()->subDays($days);

        // Purchase metrics
        $totalPurchases = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->count();
        
        $recentPurchases = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->count();
        
        $totalRevenue = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->sum('total');
        
        $recentRevenue = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->sum('total');

        // Purchases by service type
        $purchasesByService = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->with('items.service')
            ->get()
            ->flatMap(function ($order) {
                return $order->items->filter(function ($item) {
                    return $item->service !== null;
                })->map(function ($item) {
                    return $item->service->service_type ?? 'unknown';
                });
            })
            ->countBy()
            ->map(function ($count, $type) {
                return [
                    'service_type' => $type,
                    'count' => $count,
                ];
            })
            ->sortByDesc('count')
            ->values();

        // Customer purchase history
        $customerPurchases = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->whereNotNull('customer_id')
            ->select('customer_id', DB::raw('COUNT(*) as purchase_count'), DB::raw('SUM(total) as total_spent'))
            ->groupBy('customer_id')
            ->with('customer:id,business_name,email,lead_score')
            ->get()
            ->map(function ($item) {
                return [
                    'customer_id' => $item->customer_id,
                    'customer_name' => $item->customer->business_name ?? 'Unknown',
                    'customer_email' => $item->customer->email ?? null,
                    'lead_score' => $item->customer->lead_score ?? 0,
                    'purchase_count' => (int) $item->purchase_count,
                    'total_spent' => (float) $item->total_spent,
                ];
            })
            ->sortByDesc('total_spent')
            ->values()
            ->take(20);

        // Purchase timeline
        $purchaseTimeline = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->selectRaw("CAST(paid_at AS DATE) as date, COUNT(*) as count, SUM(total) as revenue")
            ->groupBy(DB::raw("CAST(paid_at AS DATE)"))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date instanceof \Carbon\Carbon 
                        ? $item->date->toDateString() 
                        : (string) $item->date,
                    'count' => (int) $item->count,
                    'revenue' => (float) $item->revenue,
                ];
            });

        // Conversion funnel (conversations -> purchases)
        $totalConversations = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->count();
        
        $conversationsWithPurchase = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->where('outcome', 'service_purchase')
            ->count();
        
        $conversionRate = $totalConversations > 0 
            ? ($conversationsWithPurchase / $totalConversations) * 100 
            : 0;

        return response()->json([
            'data' => [
                'summary' => [
                    'total_purchases' => $totalPurchases,
                    'recent_purchases' => $recentPurchases,
                    'total_revenue' => (float) $totalRevenue,
                    'recent_revenue' => (float) $recentRevenue,
                    'conversion_rate' => round($conversionRate, 2),
                ],
                'purchases_by_service' => $purchasesByService,
                'customer_purchases' => $customerPurchases,
                'purchase_timeline' => $purchaseTimeline,
                'conversion_funnel' => [
                    'conversations' => $totalConversations,
                    'conversions' => $conversationsWithPurchase,
                    'rate' => round($conversionRate, 2),
                ],
                'date_range' => [
                    'start' => $startDate->toDateString(),
                    'end' => Carbon::now()->toDateString(),
                    'days' => $days,
                ],
            ],
        ]);
    }

    /**
     * Get learning analytics
     */
    public function learning(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $days = (int) ($request->input('days', 30));
        $startDate = Carbon::now()->subDays($days);

        // Knowledge base metrics
        $totalKnowledge = Knowledge::where('tenant_id', $tenantId)->count();
        $recentKnowledge = Knowledge::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->count();

        // Presentation metrics
        $totalPresentations = GeneratedPresentation::where('tenant_id', $tenantId)->count();
        $recentPresentations = GeneratedPresentation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->count();

        // Conversation learning metrics
        $conversationsWithQuestions = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('questions_asked')
            ->count();
        
        $totalQuestions = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('questions_asked')
            ->get()
            ->sum(function ($conv) {
                return is_array($conv->questions_asked) ? count($conv->questions_asked) : 0;
            });

        // Learning engagement by customer
        $customerLearning = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('customer_id')
            ->select('customer_id', 
                DB::raw('COUNT(*) as session_count'),
                DB::raw('SUM(CASE WHEN questions_asked IS NOT NULL THEN 1 ELSE 0 END) as sessions_with_questions'),
                DB::raw('AVG(duration_seconds) as avg_duration')
            )
            ->groupBy('customer_id')
            ->with('customer:id,business_name,email')
            ->get()
            ->map(function ($item) {
                return [
                    'customer_id' => $item->customer_id,
                    'customer_name' => $item->customer->business_name ?? 'Unknown',
                    'customer_email' => $item->customer->email ?? null,
                    'session_count' => (int) $item->session_count,
                    'sessions_with_questions' => (int) $item->sessions_with_questions,
                    'avg_duration' => $item->avg_duration ? (int) $item->avg_duration : null,
                ];
            })
            ->sortByDesc('session_count')
            ->values()
            ->take(20);

        // Learning activity over time
        $learningOverTime = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->selectRaw("CAST(started_at AS DATE) as date, COUNT(*) as sessions, SUM(CASE WHEN questions_asked IS NOT NULL THEN 1 ELSE 0 END) as sessions_with_questions")
            ->groupBy(DB::raw("CAST(started_at AS DATE)"))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date instanceof \Carbon\Carbon 
                        ? $item->date->toDateString() 
                        : (string) $item->date,
                    'sessions' => (int) $item->sessions,
                    'sessions_with_questions' => (int) $item->sessions_with_questions,
                ];
            });

        return response()->json([
            'data' => [
                'knowledge_base' => [
                    'total' => $totalKnowledge,
                    'recent' => $recentKnowledge,
                ],
                'presentations' => [
                    'total' => $totalPresentations,
                    'recent' => $recentPresentations,
                ],
                'engagement' => [
                    'conversations_with_questions' => $conversationsWithQuestions,
                    'total_questions' => $totalQuestions,
                    'avg_questions_per_session' => $conversationsWithQuestions > 0 
                        ? round($totalQuestions / $conversationsWithQuestions, 2) 
                        : 0,
                ],
                'customer_learning' => $customerLearning,
                'learning_over_time' => $learningOverTime,
                'date_range' => [
                    'start' => $startDate->toDateString(),
                    'end' => Carbon::now()->toDateString(),
                    'days' => $days,
                ],
            ],
        ]);
    }

    /**
     * Get campaign performance metrics
     */
    public function campaignPerformance(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $days = (int) ($request->input('days', 30));
        $startDate = Carbon::now()->subDays($days);

        // Campaign performance from conversations (using utm_campaign from landing pages)
        $campaignPerformance = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('entry_point')
            ->select('entry_point', 
                DB::raw('COUNT(*) as total_sessions'),
                DB::raw('SUM(CASE WHEN outcome = \'service_purchase\' THEN 1 ELSE 0 END) as conversions'),
                DB::raw('AVG(duration_seconds) as avg_duration'),
                DB::raw('SUM(CASE WHEN questions_asked IS NOT NULL THEN 1 ELSE 0 END) as sessions_with_questions')
            )
            ->groupBy('entry_point')
            ->get()
            ->map(function ($item) {
                $conversionRate = $item->total_sessions > 0 
                    ? ($item->conversions / $item->total_sessions) * 100 
                    : 0;
                
                return [
                    'campaign_type' => $item->entry_point,
                    'total_sessions' => (int) $item->total_sessions,
                    'conversions' => (int) $item->conversions,
                    'conversion_rate' => round($conversionRate, 2),
                    'avg_duration' => $item->avg_duration ? (int) $item->avg_duration : null,
                    'engagement_rate' => $item->total_sessions > 0 
                        ? round(($item->sessions_with_questions / $item->total_sessions) * 100, 2) 
                        : 0,
                ];
            })
            ->sortByDesc('conversion_rate')
            ->values();

        return response()->json([
            'data' => [
                'campaign_performance' => $campaignPerformance,
                'date_range' => [
                    'start' => $startDate->toDateString(),
                    'end' => Carbon::now()->toDateString(),
                    'days' => $days,
                ],
            ],
        ]);
    }
}
