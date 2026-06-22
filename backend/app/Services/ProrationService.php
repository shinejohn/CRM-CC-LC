<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Service;
use App\Models\ServiceSubscription;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;

/**
 * Computes proration previews and applies plan changes (upgrade / downgrade)
 * for ServiceSubscription records.
 *
 * When the subscription is Stripe-managed (has a stripe_subscription_id and the
 * target Service has a stripe_price_id) the upcoming-invoice preview from Stripe
 * is used. Otherwise a manual proration is computed from the time remaining in
 * the current billing period.
 */
final class ProrationService
{
    public function __construct(
        private ?StripeService $stripeService = null,
    ) {
        $this->stripeService = $stripeService ?? app(StripeService::class);
    }

    /**
     * Build a proration preview for switching $subscription to $targetService.
     *
     * @return array{
     *     current_plan: array{service_id: string|null, name: string, tier: string|null, amount_cents: int, billing_cycle: string},
     *     target_plan: array{service_id: string, name: string, tier: string|null, amount_cents: int, billing_cycle: string},
     *     proration_amount_cents: int,
     *     next_invoice_total_cents: int,
     *     effective_date: string,
     *     stripe_preview: bool,
     *     direction: string
     * }
     */
    public function preview(ServiceSubscription $subscription, Service $targetService): array
    {
        $currentService = $subscription->service;

        $currentAmountCents = $this->subscriptionAmountCents($subscription);
        $targetAmountCents = $this->serviceAmountCents($targetService);

        $direction = $this->direction($currentAmountCents, $targetAmountCents);

        $effectiveDate = now()->toIso8601String();
        $stripePreview = false;
        $prorationAmountCents = 0;
        $nextInvoiceTotalCents = $targetAmountCents;

        if ($this->canUseStripePreview($subscription, $targetService)) {
            try {
                $result = $this->stripePreview($subscription, $targetService);
                $prorationAmountCents = $result['proration_amount_cents'];
                $nextInvoiceTotalCents = $result['next_invoice_total_cents'];
                $stripePreview = true;
            } catch (Exception $e) {
                Log::warning('Stripe proration preview failed, falling back to manual', [
                    'subscription_id' => $subscription->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if (! $stripePreview) {
            $manual = $this->manualProration($subscription, $currentAmountCents, $targetAmountCents);
            $prorationAmountCents = $manual['proration_amount_cents'];
            $nextInvoiceTotalCents = $manual['next_invoice_total_cents'];
        }

        return [
            'current_plan' => [
                'service_id' => $subscription->service_id,
                'name' => $currentService?->name ?? 'Current Plan',
                'tier' => $subscription->tier ?? $currentService?->service_tier,
                'amount_cents' => $currentAmountCents,
                'billing_cycle' => $subscription->billing_cycle ?? 'monthly',
            ],
            'target_plan' => [
                'service_id' => $targetService->id,
                'name' => $targetService->name,
                'tier' => $targetService->service_tier,
                'amount_cents' => $targetAmountCents,
                'billing_cycle' => $targetService->billing_period === 'annual' ? 'annual' : 'monthly',
            ],
            'proration_amount_cents' => $prorationAmountCents,
            'next_invoice_total_cents' => $nextInvoiceTotalCents,
            'effective_date' => $effectiveDate,
            'stripe_preview' => $stripePreview,
            'direction' => $direction,
        ];
    }

    /**
     * Apply a plan change to the subscription. Updates the Stripe subscription
     * item (with proration) when Stripe-managed, then updates the local row.
     */
    public function applyPlanChange(ServiceSubscription $subscription, Service $targetService): ServiceSubscription
    {
        $billingCycle = $targetService->billing_period === 'annual' ? 'annual' : 'monthly';

        if ($this->canUseStripePreview($subscription, $targetService)) {
            try {
                $this->stripeService->updateSubscriptionPrice(
                    $subscription->stripe_subscription_id,
                    $targetService->stripe_price_id,
                );
            } catch (Exception $e) {
                Log::error('Stripe subscription price update failed', [
                    'subscription_id' => $subscription->id,
                    'error' => $e->getMessage(),
                ]);

                throw $e;
            }
        }

        $subscription->update([
            'service_id' => $targetService->id,
            'tier' => $targetService->service_tier ?? $subscription->tier,
            'monthly_amount' => (float) $targetService->price,
            'billing_cycle' => $billingCycle,
        ]);

        return $subscription->fresh(['service']);
    }

    public function direction(int $currentAmountCents, int $targetAmountCents): string
    {
        if ($targetAmountCents > $currentAmountCents) {
            return 'upgrade';
        }

        if ($targetAmountCents < $currentAmountCents) {
            return 'downgrade';
        }

        return 'unchanged';
    }

    /**
     * Legacy decimal proration helper retained for backward compatibility.
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
                'charge_amount' => (float) $newService->price,
            ];
        }

        $dailyRateOld = (float) $subscription->monthly_amount / 30; // Approximation
        $dailyRateNew = (float) $newService->price / 30;

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

    private function canUseStripePreview(ServiceSubscription $subscription, Service $targetService): bool
    {
        return ! empty($subscription->stripe_subscription_id)
            && ! empty($targetService->stripe_price_id);
    }

    /**
     * @return array{proration_amount_cents: int, next_invoice_total_cents: int}
     */
    private function stripePreview(ServiceSubscription $subscription, Service $targetService): array
    {
        $invoice = $this->stripeService->previewProration(
            $subscription->stripe_customer_id,
            $subscription->stripe_subscription_id,
            $targetService->stripe_price_id,
        );

        // Sum proration line items (the immediate charge/credit) vs the full total.
        $prorationCents = 0;
        foreach (($invoice->lines->data ?? []) as $line) {
            if (! empty($line->proration)) {
                $prorationCents += (int) $line->amount;
            }
        }

        return [
            'proration_amount_cents' => $prorationCents,
            'next_invoice_total_cents' => (int) ($invoice->total ?? 0),
        ];
    }

    /**
     * Manual proration: credit unused time on the current plan, charge prorated
     * time on the new plan for the remainder of the current period.
     *
     * @return array{proration_amount_cents: int, next_invoice_total_cents: int}
     */
    private function manualProration(ServiceSubscription $subscription, int $currentAmountCents, int $targetAmountCents): array
    {
        $periodEnd = $subscription->subscription_expires_at;
        $now = Carbon::now();

        if (! $periodEnd || $periodEnd->isPast()) {
            // No remaining period — charge the new plan in full at next cycle.
            return [
                'proration_amount_cents' => 0,
                'next_invoice_total_cents' => $targetAmountCents,
            ];
        }

        $periodStart = $subscription->subscription_started_at ?? $now->copy()->subMonth();
        $totalSeconds = max(1, $periodStart->diffInSeconds($periodEnd, true));
        $remainingSeconds = max(0, $now->diffInSeconds($periodEnd, true));
        $remainingFraction = min(1.0, $remainingSeconds / $totalSeconds);

        $unusedCredit = (int) round($currentAmountCents * $remainingFraction);
        $newCharge = (int) round($targetAmountCents * $remainingFraction);

        // Positive = amount owed now, negative = credit applied.
        $prorationAmountCents = $newCharge - $unusedCredit;

        return [
            'proration_amount_cents' => $prorationAmountCents,
            'next_invoice_total_cents' => $targetAmountCents,
        ];
    }

    private function subscriptionAmountCents(ServiceSubscription $subscription): int
    {
        $monthly = (float) ($subscription->monthly_amount ?? $subscription->service?->price ?? 0);
        $cents = (int) round($monthly * 100);

        if ($subscription->billing_cycle === 'annual') {
            $cents *= 12;
        }

        return $cents;
    }

    private function serviceAmountCents(Service $service): int
    {
        $cents = (int) round((float) $service->price * 100);

        if ($service->billing_period === 'annual') {
            $cents *= 12;
        }

        return $cents;
    }
}
