<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ServiceSubscription;
use App\Services\StripeService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class RenewExpiredSubscriptions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    private const MAX_RENEWAL_ATTEMPTS = 3;

    public function handle(StripeService $stripeService): void
    {
        $subscriptions = ServiceSubscription::query()
            ->where('status', 'active')
            ->where('auto_renew', true)
            ->whereNull('stripe_subscription_id')
            ->where('subscription_expires_at', '<=', now())
            ->where('renewal_attempts', '<', self::MAX_RENEWAL_ATTEMPTS)
            ->with(['customer', 'service'])
            ->get();

        $renewed = 0;
        $failed = 0;

        foreach ($subscriptions as $subscription) {
            try {
                $this->renewSubscription($subscription, $stripeService);
                $renewed++;
            } catch (\Exception $e) {
                $failed++;
                Log::error('Subscription renewal failed', [
                    'subscription_id' => $subscription->id,
                    'customer_id' => $subscription->customer_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Subscription renewal batch complete', [
            'total' => $subscriptions->count(),
            'renewed' => $renewed,
            'failed' => $failed,
        ]);
    }

    private function renewSubscription(ServiceSubscription $subscription, StripeService $stripeService): void
    {
        $customer = $subscription->customer;
        $service = $subscription->service;

        if (! $customer || ! $service) {
            $subscription->update([
                'renewal_failure_reason' => 'Missing customer or service record',
                'renewal_attempts' => $subscription->renewal_attempts + 1,
                'last_renewal_attempt_at' => now(),
            ]);

            return;
        }

        $amountCents = (int) round((float) $subscription->monthly_amount * 100);

        if ($subscription->billing_cycle === 'annual') {
            $amountCents *= 12;
        }

        if ($amountCents <= 0) {
            $this->extendSubscription($subscription);
            Log::info('Free subscription auto-renewed', ['subscription_id' => $subscription->id]);

            return;
        }

        $stripeCustomerId = $customer->stripe_customer_id ?? $subscription->stripe_customer_id;

        if (! $stripeCustomerId) {
            // No Stripe customer means we can't auto-charge — but this is NOT a
            // payment failure. Do not increment attempts or suspend an otherwise
            // paid subscription; just record the reason and nudge the customer.
            $subscription->update([
                'renewal_failure_reason' => 'No Stripe customer ID — cannot charge automatically',
                'last_renewal_attempt_at' => now(),
            ]);

            SendPaymentReminder::dispatch($subscription, 'missing_payment_method');

            Log::info('Subscription renewal skipped — no Stripe customer', [
                'subscription_id' => $subscription->id,
            ]);

            return;
        }

        // Deterministic idempotency key: a retry after a mid-run crash reuses the
        // same key so Stripe returns the original PaymentIntent instead of
        // charging the customer a second time for the same billing period.
        $periodKey = optional($subscription->subscription_expires_at)->timestamp ?? 'no-expiry';
        $idempotencyKey = "renew_{$subscription->id}_{$periodKey}";

        try {
            $paymentIntent = $stripeService->createPaymentIntent($amountCents, 'usd', [
                'customer' => $stripeCustomerId,
                'subscription_id' => $subscription->id,
                'service_id' => $service->id,
                'renewal' => 'true',
            ], $idempotencyKey);

            if ($paymentIntent->status === 'succeeded') {
                DB::transaction(function () use ($subscription, $paymentIntent) {
                    $this->extendSubscription($subscription);
                    $subscription->update([
                        'renewal_attempts' => 0,
                        'renewal_failure_reason' => null,
                        'last_renewal_attempt_at' => now(),
                    ]);
                });

                Log::info('Subscription renewed successfully', [
                    'subscription_id' => $subscription->id,
                    'payment_intent' => $paymentIntent->id,
                ]);
            } else {
                DB::transaction(function () use ($subscription, $paymentIntent) {
                    $attempts = $subscription->renewal_attempts + 1;
                    $subscription->update([
                        'renewal_attempts' => $attempts,
                        'renewal_failure_reason' => "PaymentIntent status: {$paymentIntent->status}",
                        'last_renewal_attempt_at' => now(),
                        'status' => $attempts >= self::MAX_RENEWAL_ATTEMPTS ? 'suspended' : 'active',
                    ]);
                });

                SendPaymentReminder::dispatch($subscription, 'payment_incomplete');
            }
        } catch (\Exception $e) {
            DB::transaction(function () use ($subscription, $e) {
                $attempts = $subscription->renewal_attempts + 1;
                $subscription->update([
                    'renewal_attempts' => $attempts,
                    'renewal_failure_reason' => $e->getMessage(),
                    'last_renewal_attempt_at' => now(),
                    'status' => $attempts >= self::MAX_RENEWAL_ATTEMPTS ? 'suspended' : 'active',
                ]);
            });

            SendPaymentReminder::dispatch($subscription, 'payment_failed');

            throw $e;
        }
    }

    private function extendSubscription(ServiceSubscription $subscription): void
    {
        $baseDate = $subscription->subscription_expires_at ?? now();

        if ($baseDate->isPast()) {
            $baseDate = now();
        }

        $newExpiry = $subscription->billing_cycle === 'annual'
            ? Carbon::parse($baseDate)->addYear()
            : Carbon::parse($baseDate)->addMonth();

        $subscription->update([
            'subscription_expires_at' => $newExpiry,
        ]);
    }
}
