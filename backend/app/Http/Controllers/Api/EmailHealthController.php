<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailDeliveryEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Read-only deliverability control room for the CC Email Health page.
 *
 * Aggregates the raw {@see EmailDeliveryEvent} feed (Postal webhook events)
 * into rate metrics and exposes a recent-events tail. There is no dedicated
 * "email health" table — every number here is derived from the event log so
 * the dashboard always reflects real delivery activity.
 */
final class EmailHealthController extends Controller
{
    /**
     * GET /v1/email/health/stats
     *
     * Aggregate the delivery-event feed into deliverability rates.
     * All rate math guards against divide-by-zero.
     */
    public function stats(): JsonResponse
    {
        // Single grouped scan of the event feed → one row per event_type.
        $counts = EmailDeliveryEvent::query()
            ->select('event_type', DB::raw('count(*) as total'))
            ->groupBy('event_type')
            ->pluck('total', 'event_type');

        $sent = (int) ($counts['MessageSent'] ?? 0);
        $delivered = (int) ($counts['MessageDelivered'] ?? 0);
        $opened = (int) ($counts['MessageLoaded'] ?? 0);
        $clicked = (int) ($counts['MessageLinkClicked'] ?? 0);
        $bounced = (int) ($counts['MessageBounced'] ?? 0);
        $failed = (int) ($counts['MessageDeliveryFailed'] ?? 0);
        // Complaint events aren't part of the standard Postal set we track;
        // count any explicit spam/complaint event types if present.
        $complaints = (int) ($counts['MessageComplaint'] ?? 0)
            + (int) ($counts['SpamComplaint'] ?? 0);

        // Denominators: delivery is measured against attempted sends;
        // open/click are measured against successful deliveries.
        $deliveryBase = max($sent, 1);
        $engagementBase = max($delivered, 1);

        $stats = [
            'total_sent' => $sent,
            'total_delivered' => $delivered,
            'total_opened' => $opened,
            'total_clicked' => $clicked,
            'total_bounced' => $bounced,
            'total_failed' => $failed,
            'delivery_rate' => $this->rate($delivered, $deliveryBase),
            'open_rate' => $this->rate($opened, $engagementBase),
            'click_rate' => $this->rate($clicked, $engagementBase),
            'bounce_rate' => $this->rate($bounced, $deliveryBase),
            'complaint_rate' => $this->rate($complaints, $deliveryBase),
        ];

        return response()->json(['data' => $stats]);
    }

    /**
     * GET /v1/email/health/events?limit=&event_type=
     *
     * Recent delivery events, newest first. Shape matches the raw model
     * (id, campaign_recipient_id, external_id, event_type, provider,
     * payload, received_at, created_at) so the frontend can render the feed
     * without transformation.
     */
    public function events(Request $request): JsonResponse
    {
        $limit = (int) $request->integer('limit', 20);
        $limit = max(1, min($limit, 100));

        $query = EmailDeliveryEvent::query()->latest('received_at');

        if ($request->filled('event_type')) {
            $query->where('event_type', (string) $request->string('event_type'));
        }

        $events = $query->limit($limit)->get()->map(fn (EmailDeliveryEvent $e): array => [
            'id' => $e->id,
            'campaign_recipient_id' => $e->campaign_recipient_id,
            'external_id' => $e->external_id,
            'event_type' => $e->event_type,
            'provider' => $e->provider,
            'payload' => $e->payload ?? [],
            'received_at' => optional($e->received_at)->toISOString(),
            'created_at' => optional($e->created_at)->toISOString(),
        ]);

        return response()->json(['data' => $events]);
    }

    /**
     * Percentage of $numerator over $denominator, rounded to 1 decimal.
     * Divide-by-zero safe.
     */
    private function rate(int $numerator, int $denominator): float
    {
        if ($denominator <= 0) {
            return 0.0;
        }

        return round(($numerator / $denominator) * 100, 1);
    }
}
