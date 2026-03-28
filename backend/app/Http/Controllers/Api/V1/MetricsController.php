<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EmailMessage;
use App\Models\EmailSuppression;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class MetricsController extends Controller
{
    /**
     * GET /api/v1/email/metrics/summary
     */
    public function summary(Request $request): JsonResponse
    {
        $client = $request->get('email_client');
        $period = (int) str_replace('d', '', $request->query('period', '30d'));

        $startDate = now()->subDays($period);

        $query = EmailMessage::where('email_client_id', $client->id)
            ->where('created_at', '>=', $startDate);

        $totalSent = (clone $query)->count();
        $delivered = (clone $query)->where('status', 'delivered')->count();
        $bounced = (clone $query)->where('status', 'bounced')->count();
        $complained = (clone $query)->where('status', 'complained')->count();

        // Optional UI params
        // Mock up open/click metrics since Postal handles pixel tracking
        $totals = [
            'sent' => $totalSent,
            'delivered' => $delivered,
            'opened' => (int) ($delivered * 0.28), // Placeholder logic as per 01_Email instructions
            'clicked' => (int) ($delivered * 0.04), // Placeholder
            'bounced' => $bounced,
            'complained' => $complained,
            'suppressed' => (clone $query)->where('status', 'suppressed')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'period' => "{$period}d",
                'totals' => $totals,
                'rates' => [
                    'delivery_rate' => $totalSent > 0 ? round(($delivered / $totalSent) * 100, 2) : 0,
                    'bounce_rate' => $totalSent > 0 ? round(($bounced / $totalSent) * 100, 2) : 0,
                    'complaint_rate' => $totalSent > 0 ? round(($complained / $totalSent) * 100, 2) : 0,
                ],
            ],
        ]);
    }

    /**
     * GET /api/v1/email/metrics/suppression-health
     */
    public function suppressionHealth(Request $request): JsonResponse
    {
        $client = $request->get('email_client');

        $globalCount = EmailSuppression::whereNull('email_client_id')->count();
        $clientCount = EmailSuppression::where('email_client_id', $client->id)->count();

        $hardBounces = EmailSuppression::where('reason', 'hard_bounce')->count();
        $softBounces = EmailSuppression::where('reason', 'soft_bounce')->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'global_suppressions' => $globalCount,
                'client_suppressions' => $clientCount,
                'breakdown' => [
                    'hard_bounces' => $hardBounces,
                    'soft_bounces' => $softBounces,
                ],
            ],
        ]);
    }
}
