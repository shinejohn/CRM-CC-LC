<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\StripeWebhookController;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use App\Services\StripeService;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class SimulateStripePayment extends Command
{
    protected $signature = 'stripe:simulate {order_id? : The ID of the order to simulate payment for}';
    protected $description = 'Simulate a successful Stripe payment for an order';

    public function handle()
    {
        // Fix missing deleted_at column if needed
        if (Schema::hasTable('customers') && !Schema::hasColumn('customers', 'deleted_at')) {
            $this->info('Fixing missing deleted_at column in customers table...');
            Schema::table('customers', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        $orderId = $this->argument('order_id');
        $order = null;

        if ($orderId) {
            $order = Order::find($orderId);
            if (!$order) {
                $this->error("Order with ID {$orderId} not found.");
                return 1;
            }
        } else {
            // Create a dummy order for testing
            $this->info('No order ID provided. Creating a test order...');

            // Ensure we have a user
            $user = User::first() ?? User::factory()->create();

            // Ensure we have a service
            $service = Service::first();
            if (!$service) {
                // Create dummy service if none exists
                $service = Service::create([
                    'tenant_id' => $user->tenant_id ?? Str::uuid(),
                    'name' => 'Premium Subscription',
                    'slug' => 'premium-subscription',
                    'description' => 'Unlock all features',
                    'price' => 99.00,
                    'is_subscription' => true,
                    'service_tier' => 'premium',
                    'billing_period' => 'monthly',
                    'is_active' => true,
                ]);
            }

            $order = Order::create([
                'tenant_id' => $user->tenant_id ?? Str::uuid(),
                'user_id' => $user->id,
                'customer_email' => $user->email,
                'customer_name' => $user->name,
                'subtotal' => 99.00,
                'tax' => 0,
                'shipping' => 0,
                'total' => 99.00,
                'status' => 'pending',
                'payment_status' => 'pending',
                'stripe_session_id' => 'sess_test_' . Str::random(24),
                'stripe_payment_intent_id' => 'pi_test_' . Str::random(24),
            ]);

            // Add item
            $order->items()->create([
                'service_id' => $service->id,
                'service_name' => $service->name,
                'service_description' => $service->description,
                'price' => $service->price,
                'quantity' => 1,
                'total' => $service->price,
            ]);

            $this->info("Created Test Order: {$order->id}");
            $this->info("Stripe Session ID: {$order->stripe_session_id}");
        }

        $this->info("Simulating payment for Order: {$order->order_number}");

        // Construct Payload
        $payload = json_encode([
            'id' => 'evt_test_' . Str::random(24),
            'object' => 'event',
            'api_version' => '2023-10-16',
            'created' => time(),
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => $order->stripe_session_id,
                    'object' => 'checkout.session',
                    'amount_total' => (int) ($order->total * 100),
                    'currency' => 'usd',
                    'payment_status' => 'paid',
                    'status' => 'complete',
                    'payment_intent' => $order->stripe_payment_intent_id,
                    'customer_email' => $order->customer_email,
                ]
            ]
        ]);

        // Generate Signature
        $secret = config('services.stripe.webhook_secret') ?? 'whsec_test';
        // We need to temporarily force the config to match if it's empty
        if (!config('services.stripe.webhook_secret')) {
            config(['services.stripe.webhook_secret' => $secret]);
            $this->warn("Stripe webhook secret was missing in config. Using temporary secret: {$secret}");
        }

        // Set dummy Stripe API key to allow StripeService instantiation
        if (!config('services.stripe.secret')) {
            config(['services.stripe.secret' => 'sk_test_dummy']);
        }

        $timestamp = time();
        $signedPayload = "{$timestamp}.{$payload}";
        $signature = hash_hmac('sha256', $signedPayload, $secret);
        $header = "t={$timestamp},v1={$signature}";

        // Mock Request
        $request = Request::create('/api/stripe/webhook', 'POST', [], [], [], [
            'HTTP_STRIPE_SIGNATURE' => $header,
            'CONTENT_TYPE' => 'application/json',
        ], $payload);

        // Execute Controller
        try {
            // We can't easily fetch the controller with constructor injection via 'new', 
            // so we resolve it from the container.
            $controller = app(StripeWebhookController::class);
            $response = $controller->handle($request);

            if ($response->getStatusCode() === 200) {
                $this->info("Payment simulated successfully!");

                $order->refresh();
                $this->info("Order Status: {$order->status}");
                $this->info("Payment Status: {$order->payment_status}");

                // Check if subscription was created
                $subscription = \App\Models\ServiceSubscription::where('order_id', $order->id)->first();
                if ($subscription) {
                    $this->info("Subscription Created: {$subscription->id} (Status: {$subscription->status})");

                    try {
                        // Push to Publishing Platform
                        $this->info("Syncing to Publishing Platform...");
                        $publishingService = app(\App\Services\PublishingPlatformService::class);
                        $result = $publishingService->provisionSubscription($subscription);

                        if ($result['success'] ?? false) {
                            $this->info("Successfully synced to Publishing Platform!");
                        } else {
                            $this->warn("Failed to sync to Publishing Platform: " . ($result['error'] ?? 'Unknown error'));
                            $this->warn("Check logs for details. (Likely networking issue if services are isolated)");
                        }
                    } catch (\Exception $e) {
                        $this->warn("Sync Service Error: " . $e->getMessage());
                    }
                } else {
                    $this->warn("No Subscription created (Service might not be configured as subscription).");
                }
            } else {
                $this->error("Webhook failed: " . $response->getContent());
            }

        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            $this->error($e->getTraceAsString());
        }

        return 0;
    }
}
