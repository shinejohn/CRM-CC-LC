<?php

declare(strict_types=1);

namespace App\Services\Pitch;

use App\Models\PitchEvent;
use App\Models\PitchSession;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class PitchAnalyticsService
{
    public function log(
        string $sessionId,
        string $eventType,
        array $payload,
        ?string $gate = null,
        ?string $product = null,
    ): PitchEvent {
        $session = PitchSession::query()->findOrFail($sessionId);

        return PitchEvent::query()->create([
            'session_id' => $session->id,
            'smb_id' => $session->smb_id,
            'community_id' => $session->community_id,
            'event_type' => $eventType,
            'step' => $payload['step'] ?? null,
            'gate' => $gate ?? $payload['gate'] ?? null,
            'product' => $product ?? $payload['product'] ?? null,
            'payload' => $payload,
            'occurred_at' => now(),
        ]);
    }

    /**
     * @return array{granted: int, denied_or_deferred: int}
     */
    public function getGatePermissionRates(int $days): array
    {
        $since = Carbon::now()->subDays($days);

        $granted = PitchEvent::query()
            ->where('event_type', 'gate_permission_granted')
            ->where('occurred_at', '>=', $since)
            ->count();

        $notGranted = PitchEvent::query()
            ->whereIn('event_type', ['gate_permission_denied', 'gate_permission_deferred'])
            ->where('occurred_at', '>=', $since)
            ->count();

        return [
            'granted' => $granted,
            'denied_or_deferred' => $notGranted,
        ];
    }

    /**
     * Ordered counts toward abandonment (session lifecycle).
     *
     * @return array<string, int>
     */
    public function getAbandonmentFunnel(int $days): array
    {
        $since = Carbon::now()->subDays($days);

        return PitchEvent::query()
            ->select('event_type', DB::raw('count(*) as c'))
            ->whereIn('event_type', [
                'session_started',
                'session_abandoned',
                'pitch_completed',
                'proposal_presented',
            ])
            ->where('occurred_at', '>=', $since)
            ->groupBy('event_type')
            ->pluck('c', 'event_type')
            ->all();
    }

    /**
     * @return array{accepted: int, declined: int, deferred: int}
     */
    public function getProductAcceptanceRates(int $days): array
    {
        $since = Carbon::now()->subDays($days);

        $accepted = PitchEvent::query()
            ->where('event_type', 'product_accepted')
            ->where('occurred_at', '>=', $since)
            ->count();

        $declined = PitchEvent::query()
            ->where('event_type', 'product_declined')
            ->where('occurred_at', '>=', $since)
            ->count();

        $deferred = PitchEvent::query()
            ->where('event_type', 'product_deferred')
            ->where('occurred_at', '>=', $since)
            ->count();

        return [
            'accepted' => $accepted,
            'declined' => $declined,
            'deferred' => $deferred,
        ];
    }
}
