<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Customer;
use App\Services\StripeService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(
        private StripeService $stripeService
    ) {}

    /**
     * Handle Stripe webhook events
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        if (!$webhookSecret) {
            Log::error('Stripe webhook secret not configured');
            return response()->json(['error' => 'Webhook secret not configured'], 500);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe webhook signature verification failed: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (Exception $e) {
            Log::error('Stripe webhook error: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook error'], 400);
        }

        // Handle the event
        try {
            match ($event->type) {
                'checkout.session.completed' => $this->handleCheckoutSessionCompleted($event->data->object),
                'payment_intent.succeeded' => $this->handlePaymentIntentSucceeded($event->data->object),
                'payment_intent.payment_failed' => $this->handlePaymentIntentFailed($event->data->object),
                'charge.refunded' => $this->handleChargeRefunded($event->data->object),
                default => Log::info('Unhandled Stripe webhook event: ' . $event->type),
            };

            return response()->json(['status' => 'success']);
        } catch (Exception $e) {
            Log::error('Error handling Stripe webhook: ' . $e->getMessage(), [
                'event_type' => $event->type,
                'event_id' => $event->id,
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

        if (!$order) {
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

        if (!$order) {
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
            });
        }
    }

    /**
     * Find or create customer from order
     */
    private function findOrCreateCustomer(Order $order): ?Customer
    {
        if (!$order->customer_email) {
            return null;
        }

        // Try to find existing customer by email
        $customer = Customer::where('tenant_id', $order->tenant_id)
            ->where('email', $order->customer_email)
            ->first();

        if (!$customer) {
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
        if (!$customer) {
            return;
        }

        // Update customer lead score based on purchase
        $purchaseAmount = $order->total;
        $scoreIncrease = min((int)($purchaseAmount / 10), 50); // Max 50 point increase
        
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
            $services = $order->items->map(fn($item) => $item->service_name)->join(', ');
            
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
            Log::error('Failed to track purchase in CRM: ' . $e->getMessage());
        }
    }

    /**
     * Fulfill order (create subscriptions, activate services, etc.)
     */
    private function fulfillOrder(Order $order): void
    {
        $order->load('items.service');

        foreach ($order->items as $item) {
            $service = $item->service;

            if (!$service) {
                continue;
            }

            // If service is a subscription, create subscription record
            if ($service->is_subscription && $order->customer_id) {
                try {
                    \App\Models\ServiceSubscription::create([
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

                    Log::info('Service subscription created', [
                        'order_id' => $order->id,
                        'service_id' => $service->id,
                    ]);
                } catch (Exception $e) {
                    Log::error('Failed to create subscription: ' . $e->getMessage());
                }
            }
        }

        // Mark order as completed after fulfillment
        $order->update(['status' => 'completed']);
    }
}
