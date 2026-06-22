<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\PipelineStage;
use App\Http\Controllers\Controller;
use App\Jobs\SendOrderConfirmationEmail;
use App\Jobs\SendPaymentReminder;
use App\Jobs\SendWelcomeEmail;
use App\Models\Customer;
use App\Models\CrmActivity;
use App\Models\Order;
use App\Models\ServiceBundle;
use App\Models\ServiceSubscription;
use App\Services\OnboardingService;
use App\Services\StripeService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

final class StripeWebhookController extends Controller
{
    public function __construct(
        private StripeService $stripeService,
        private OnboardingService $onboardingService
    ) {}

    /**
     * Handle Stripe webhook events
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        $eventType = null;
        $eventData = null;

        if ($webhookSecret) {
            try {
                $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
                $eventType = $event->type;
                $eventData = $event->data->object;
            } catch (SignatureVerificationException $e) {
                Log::error('Stripe webhook signature verification failed: '.$e->getMessage());

                return response()->json(['error' => 'Invalid signature'], 400);
            } catch (Exception $e) {
                Log::error('Stripe webhook error: '.$e->getMessage());

                return response()->json(['error' => 'Webhook error'], 400);
            }
        } else {
            // No webhook secret configured — parse payload directly (non-production fallback)
            Log::warning('Stripe webhook secret not configured, skipping signature verification');
            $decoded = json_decode($payload, true);
            $eventType = $decoded['type'] ?? null;
            $eventData = (object) ($decoded['data']['object'] ?? []);
        }

        if (! $eventType) {
            return response()->json(['error' => 'Missing event type'], 400);
        }

        // Handle the event
        try {
            match ($eventType) {
                'checkout.session.completed' => $this->handleCheckoutSessionCompleted($eventData),
                'payment_intent.succeeded' => $this->handlePaymentIntentSucceeded($eventData),
                'payment_intent.payment_failed' => $this->handlePaymentIntentFailed($eventData),
                'charge.refunded' => $this->handleChargeRefunded($eventData),
                'customer.subscription.deleted' => $this->handleSubscriptionDeleted($eventData),
                'customer.subscription.updated' => $this->handleSubscriptionUpdated($eventData),
                'invoice.payment_succeeded' => $this->handleInvoicePaymentSucceeded($eventData),
                'invoice.payment_failed' => $this->handleInvoicePaymentFailed($eventData),
                default => Log::info('Unhandled Stripe webhook event: '.$eventType),
            };

            return response()->json(['status' => 'success']);
        } catch (Exception $e) {
            Log::error('Error handling Stripe webhook: '.$e->getMessage(), [
                'event_type' => $eventType,
            ]);

            return response()->json(['error' => 'Processing error'], 500);
        }
    }

    /**
     * Handle checkout.session.completed event
     */
    private function handleCheckoutSessionCompleted(object $session): void
    {
        Log::info('Stripe checkout session completed', [
            'session_id' => $session->id,
            'payment_intent' => $session->payment_intent,
        ]);

        // Find order by session ID
        $order = Order::where('stripe_session_id', $session->id)->first();

        if (! $order) {
            Log::warning('Order not found for Stripe session', ['session_id' => $session->id]);

            return;
        }

        // Only process if not already paid
        if ($order->payment_status === 'paid') {
            Log::info('Order already processed', ['order_id' => $order->id]);

            return;
        }

        DB::transaction(function () use ($order, $session) {
            // Update order payment status
            $order->update([
                'payment_status' => 'paid',
                'status' => 'processing',
                'stripe_payment_intent_id' => $session->payment_intent ?? $order->stripe_payment_intent_id,
                'paid_at' => now(),
            ]);

            // Reduce service inventory
            $order->load('items.service');
            foreach ($order->items as $item) {
                if ($item->service && $item->service->track_inventory) {
                    $service = $item->service;
                    $service->decrement('quantity', $item->quantity);

                    if ($service->quantity <= 0) {
                        $service->update(['is_active' => false]);
                    }
                }
            }

            // Find or create customer
            $customer = $this->findOrCreateCustomer($order);

            if ($customer) {
                $order->update(['customer_id' => $customer->id]);

                // Seed the post-purchase onboarding checklist (idempotent).
                $this->onboardingService->seedFor($customer);
            }

            // Track purchase in CRM
            $this->trackPurchaseInCRM($order, $customer);

            // Fulfill order (create subscriptions if needed, etc.)
            $this->fulfillOrder($order);

            Log::info('Order payment completed', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'customer_id' => $customer?->id,
            ]);
        });
    }

    /**
     * Handle payment_intent.succeeded event
     */
    private function handlePaymentIntentSucceeded(object $paymentIntent): void
    {
        Log::info('Stripe payment intent succeeded', [
            'payment_intent_id' => $paymentIntent->id,
        ]);

        // Find order by payment intent ID
        $order = Order::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if (! $order) {
            Log::warning('Order not found for payment intent', ['payment_intent_id' => $paymentIntent->id]);

            return;
        }

        // Only update if not already paid (checkout.session.completed may have already processed it)
        if ($order->payment_status !== 'paid') {
            DB::transaction(function () use ($order, $paymentIntent) {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                    'stripe_charge_id' => $paymentIntent->charges->data[0]->id ?? null,
                    'paid_at' => now(),
                ]);

                // Reduce service inventory
                $order->load('items.service');
                foreach ($order->items as $item) {
                    if ($item->service && $item->service->track_inventory) {
                        $service = $item->service;
                        $service->decrement('quantity', $item->quantity);

                        if ($service->quantity <= 0) {
                            $service->update(['is_active' => false]);
                        }
                    }
                }

                $customer = $this->findOrCreateCustomer($order);
                if ($customer) {
                    $order->update(['customer_id' => $customer->id]);
                }

                $this->trackPurchaseInCRM($order, $customer);
                $this->fulfillOrder($order);
            });
        }

        // Handle bundle purchase metadata — advance pipeline to SALES/RETENTION
        $metadata = (array) ($paymentIntent->metadata ?? []);
        if (!empty($metadata['bundle_slug']) && !empty($metadata['customer_id'])) {
            $this->handleBundlePurchase($metadata['customer_id'], $metadata['bundle_slug']);
        }
    }

    /**
     * Handle payment_intent.payment_failed event
     */
    private function handlePaymentIntentFailed(object $paymentIntent): void
    {
        Log::info('Stripe payment intent failed', [
            'payment_intent_id' => $paymentIntent->id,
        ]);

        $order = Order::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if ($order) {
            $order->update([
                'payment_status' => 'failed',
                'status' => 'cancelled',
            ]);
        }
    }

    /**
     * Handle charge.refunded event
     */
    private function handleChargeRefunded(object $charge): void
    {
        Log::info('Stripe charge refunded', [
            'charge_id' => $charge->id,
        ]);

        $order = Order::where('stripe_charge_id', $charge->id)->first();

        if ($order) {
            DB::transaction(function () use ($order) {
                $order->update([
                    'payment_status' => 'refunded',
                    'status' => 'cancelled',
                ]);

                // Restore service inventory
                $order->load('items.service');
                foreach ($order->items as $item) {
                    if ($item->service && $item->service->track_inventory) {
                        $service = $item->service;
                        $service->increment('quantity', $item->quantity);
                        $service->update(['is_active' => true]);
                    }
                }

                // Cancel associated subscriptions if refunded
                \App\Models\ServiceSubscription::where('order_id', $order->id)->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                    'auto_renew' => false,
                ]);
            });
        }
    }

    /**
     * Find or create customer from order
     */
    private function findOrCreateCustomer(Order $order): ?Customer
    {
        if (! $order->customer_email) {
            return null;
        }

        // Try to find existing customer by email
        $customer = Customer::where('tenant_id', $order->tenant_id)
            ->where('email', $order->customer_email)
            ->first();

        if (! $customer) {
            // Create new customer
            $customer = Customer::create([
                'tenant_id' => $order->tenant_id,
                'email' => $order->customer_email,
                'business_name' => $order->customer_name ?? 'New Customer',
                'owner_name' => $order->customer_name,
                'lead_source' => 'service_purchase',
                'lead_score' => 50, // Starting score for paying customers
            ]);
        }

        return $customer;
    }

    /**
     * Track purchase in CRM
     */
    private function trackPurchaseInCRM(Order $order, ?Customer $customer): void
    {
        if (! $customer) {
            return;
        }

        // Update customer lead score based on purchase
        $purchaseAmount = $order->total;
        $scoreIncrease = min((int) ($purchaseAmount / 10), 50); // Max 50 point increase

        $customer->increment('lead_score', $scoreIncrease);
        if ($customer->lead_score > 100) {
            $customer->update(['lead_score' => 100]);
        }

        // Create conversation record for the purchase
        try {
            $conversation = \App\Models\Conversation::create([
                'tenant_id' => $order->tenant_id,
                'customer_id' => $customer->id,
                'entry_point' => 'service_purchase',
                'outcome' => 'service_purchase',
                'outcome_details' => "Purchased services: Order #{$order->order_number}",
                'started_at' => now(),
            ]);

            // Add order details to conversation new_data_collected
            $order->load('items.service');
            $services = $order->items->map(fn ($item) => $item->service_name)->join(', ');

            $conversation->update([
                'new_data_collected' => array_merge($conversation->new_data_collected ?? [], [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'total_amount' => $order->total,
                    'services' => $services,
                ]),
            ]);

            Log::info('Purchase tracked in CRM', [
                'order_id' => $order->id,
                'customer_id' => $customer->id,
                'conversation_id' => $conversation->id,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to track purchase in CRM: '.$e->getMessage());
        }
    }

    /**
     * Fulfill order (create subscriptions, activate services, etc.)
     */
    private function fulfillOrder(Order $order): void
    {
        $order->load('items.service');

        $firstSubscription = null;

        foreach ($order->items as $item) {
            $service = $item->service;

            if (! $service) {
                continue;
            }

            // If service is a subscription, create subscription record
            if ($service->is_subscription && $order->customer_id) {
                try {
                    $subscription = ServiceSubscription::create([
                        'tenant_id' => $order->tenant_id,
                        'customer_id' => $order->customer_id,
                        'user_id' => $order->user_id,
                        'service_id' => $service->id,
                        'order_id' => $order->id,
                        'tier' => $service->service_tier ?? 'basic',
                        'status' => 'active',
                        'subscription_started_at' => now(),
                        'subscription_expires_at' => $service->billing_period === 'annual'
                            ? now()->addYear()
                            : now()->addMonth(),
                        'auto_renew' => true,
                        'monthly_amount' => $service->price,
                        'billing_cycle' => $service->billing_period === 'annual' ? 'annual' : 'monthly',
                    ]);

                    if (! $firstSubscription) {
                        $firstSubscription = $subscription;
                    }

                    Log::info('Service subscription created', [
                        'order_id' => $order->id,
                        'service_id' => $service->id,
                    ]);
                } catch (Exception $e) {
                    Log::error('Failed to create subscription: '.$e->getMessage());
                }
            }
        }

        // Mark order as completed after fulfillment
        $order->update(['status' => 'completed']);

        // Send post-purchase emails
        SendOrderConfirmationEmail::dispatch($order);

        if ($order->customer_id) {
            $customer = Customer::find($order->customer_id);
            if ($customer) {
                SendWelcomeEmail::dispatch($customer, $firstSubscription)->delay(now()->addHour());
            }
        }
    }

    /**
     * Advance pipeline stage when a bundle is purchased via campaign landing page.
     */
    private function handleBundlePurchase(string $customerId, string $bundleSlug): void
    {
        $customer = Customer::find($customerId);
        if (! $customer) {
            Log::warning("Bundle purchase: customer {$customerId} not found");
            return;
        }

        $bundle = ServiceBundle::where('slug', $bundleSlug)->first();

        // Advance to SALES stage (bundle purchase is a clear buying signal)
        // If already in SALES or RETENTION, leave at current or advance further
        $targetStage = PipelineStage::SALES;
        if ($customer->pipeline_stage === PipelineStage::SALES) {
            $targetStage = PipelineStage::RETENTION;
        } elseif ($customer->pipeline_stage === PipelineStage::RETENTION) {
            // Already retained — just log
            $targetStage = null;
        }

        if ($targetStage !== null) {
            $customer->advanceToStage($targetStage, 'bundle_purchase');
            Log::info("Bundle purchase: advanced customer {$customerId} to {$targetStage->value}");
        }

        // Create a high-value CRM activity
        CrmActivity::create([
            'tenant_id'   => $customer->tenant_id,
            'customer_id' => $customer->id,
            'type'        => 'bundle_purchase',
            'title'       => 'Bundle Purchased: ' . ($bundle?->name ?? $bundleSlug),
            'channel'     => 'stripe',
            'status'      => 'completed',
            'priority'    => 'high',
            'notes'       => "Customer selected the {$bundleSlug} package via campaign landing page.",
            'metadata'    => [
                'bundle_slug'  => $bundleSlug,
                'bundle_name'  => $bundle?->name,
                'price_cents'  => $bundle?->price_cents,
            ],
        ]);
    }

    /**
     * Handle customer.subscription.deleted event
     */
    private function handleSubscriptionDeleted(object $subscription): void
    {
        Log::info('Stripe subscription deleted', ['subscription_id' => $subscription->id]);

        $serviceSubscription = \App\Models\ServiceSubscription::where('stripe_subscription_id', $subscription->id)->first();
        if ($serviceSubscription) {
            $serviceSubscription->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'auto_renew' => false,
            ]);
        }
    }

    /**
     * Handle customer.subscription.updated event
     */
    private function handleSubscriptionUpdated(object $subscription): void
    {
        Log::info('Stripe subscription updated', ['subscription_id' => $subscription->id]);

        $serviceSubscription = ServiceSubscription::where('stripe_subscription_id', $subscription->id)->first();
        if ($serviceSubscription) {
            $status = $subscription->status === 'active' ? 'active' : ($subscription->status === 'past_due' ? 'suspended' : ($subscription->status === 'canceled' ? 'cancelled' : 'active'));
            $serviceSubscription->update([
                'status' => $status,
                'auto_renew' => ! $subscription->cancel_at_period_end,
                'subscription_expires_at' => \Carbon\Carbon::createFromTimestamp($subscription->current_period_end),
            ]);
        }
    }

    /**
     * Handle invoice.payment_succeeded for Stripe-managed subscriptions.
     * Extends the local subscription period when Stripe auto-renews.
     */
    private function handleInvoicePaymentSucceeded(object $invoice): void
    {
        $stripeSubscriptionId = $invoice->subscription ?? null;

        if (! $stripeSubscriptionId) {
            return;
        }

        Log::info('Stripe invoice payment succeeded', [
            'invoice_id' => $invoice->id,
            'subscription_id' => $stripeSubscriptionId,
        ]);

        $serviceSubscription = ServiceSubscription::where('stripe_subscription_id', $stripeSubscriptionId)->first();

        if (! $serviceSubscription) {
            return;
        }

        $periodEnd = $invoice->lines->data[0]->period->end ?? null;

        $newExpiry = $periodEnd
            ? \Carbon\Carbon::createFromTimestamp($periodEnd)
            : ($serviceSubscription->billing_cycle === 'annual'
                ? now()->addYear()
                : now()->addMonth());

        $serviceSubscription->update([
            'status' => 'active',
            'subscription_expires_at' => $newExpiry,
            'renewal_attempts' => 0,
            'renewal_failure_reason' => null,
            'last_renewal_attempt_at' => now(),
        ]);

        Log::info('Stripe-managed subscription renewed', [
            'subscription_id' => $serviceSubscription->id,
            'new_expires_at' => $newExpiry->toIso8601String(),
        ]);
    }

    /**
     * Handle invoice.payment_failed for Stripe-managed subscriptions.
     * Increments retry counter and sends dunning emails.
     */
    private function handleInvoicePaymentFailed(object $invoice): void
    {
        $stripeSubscriptionId = $invoice->subscription ?? null;

        if (! $stripeSubscriptionId) {
            return;
        }

        Log::info('Stripe invoice payment failed', [
            'invoice_id' => $invoice->id,
            'subscription_id' => $stripeSubscriptionId,
        ]);

        $serviceSubscription = ServiceSubscription::where('stripe_subscription_id', $stripeSubscriptionId)->first();

        if (! $serviceSubscription) {
            return;
        }

        $attempts = $serviceSubscription->renewal_attempts + 1;

        $serviceSubscription->update([
            'renewal_attempts' => $attempts,
            'renewal_failure_reason' => 'Stripe invoice payment failed: ' . ($invoice->id ?? 'unknown'),
            'last_renewal_attempt_at' => now(),
            'status' => $attempts >= 3 ? 'suspended' : 'active',
        ]);

        SendPaymentReminder::dispatch($serviceSubscription, 'payment_failed');

        Log::info('Dunning email dispatched for Stripe subscription', [
            'subscription_id' => $serviceSubscription->id,
            'attempt' => $attempts,
        ]);
    }
}
