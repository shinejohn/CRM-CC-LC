<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Service;
use App\Models\ServiceSubscription;
use Carbon\Carbon;

final class ProrationService
{
    /**
     * Calculate the prorated cost or credit for a subscription change.
     */
    public function calculateProration(ServiceSubscription $subscription, Service $newService): array
    {
        $now = Carbon::now();
        $expiresAt = $subscription->subscription_expires_at ?: $now->copy()->addMonth();

        $totalDays = $now->diffInDays($expiresAt);
        if ($totalDays <= 0) {
            return [
                'prorated_amount' => 0,
                'credit_amount' => 0,
                'charge_amount' => $newService->price,
            ];
        }

        $dailyRateOld = $subscription->monthly_amount / 30; // Approximation
        $dailyRateNew = $newService->price / 30;

        $remainingValue = $dailyRateOld * $totalDays;
        $newValueForPeriod = $dailyRateNew * $totalDays;

        $difference = $newValueForPeriod - $remainingValue;

        if ($difference < 0) {
            return [
                'prorated_amount' => abs($difference),
                'credit_amount' => abs($difference),
                'charge_amount' => 0,
            ];
        }

        return [
            'prorated_amount' => $difference,
            'credit_amount' => 0,
            'charge_amount' => $difference,
        ];
    }
}
