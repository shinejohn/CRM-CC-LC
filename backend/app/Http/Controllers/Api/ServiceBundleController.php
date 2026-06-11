<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\PipelineStage;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\ServiceBundle;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

final class ServiceBundleController extends Controller
{
    public function __construct(
        private readonly StripeService $stripeService
    ) {}

    /**
     * GET /api/v1/bundles
     * List all active service bundles.
     */
    public function index(): JsonResponse
    {
        $bundles = ServiceBundle::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (ServiceBundle $b) => $this->formatBundle($b));

        return response()->json(['data' => $bundles]);
    }

    /**
     * GET /api/v1/bundles/{bundle}
     */
    public function show(ServiceBundle $bundle): JsonResponse
    {
        if (! $bundle->is_active) {
            return response()->json(['error' => 'Bundle not found'], 404);
        }

        return response()->json(['data' => $this->formatBundle($bundle)]);
    }

    /**
     * POST /api/v1/bundles/{bundle}/quote
     *
     * Generate a price summary for a customer selecting a bundle.
     * Does NOT create an order yet.
     */
    public function quote(Request $request, ServiceBundle $bundle): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['nullable', 'uuid', 'exists:customers,id'],
        ]);

        $customer = isset($validated['customer_id'])
            ? Customer::find($validated['customer_id'])
            : null;

        return response()->json([
            'data' => [
                'bundle'       => $this->formatBundle($bundle),
                'line_items'   => [
                    [
                        'label'      => $bundle->name . ' Plan — Monthly',
                        'amount'     => $bundle->price_cents,
                        'recurring'  => true,
                        'interval'   => 'month',
                    ],
                ],
                'subtotal'     => $bundle->price_cents,
                'setup_fee'    => $bundle->setup_fee_cents,
                'total_today'  => $bundle->price_cents + $bundle->setup_fee_cents,
                'currency'     => 'usd',
                'customer'     => $customer ? [
                    'id'            => $customer->id,
                    'business_name' => $customer->business_name,
                    'email'         => $customer->email,
                ] : null,
            ],
        ]);
    }

    /**
     * POST /api/v1/bundles/{bundle}/checkout
     *
     * Create a Stripe PaymentIntent for the selected bundle.
     * Metadata carries the customer_id and bundle_slug so the webhook
     * can advance the pipeline stage on success.
     */
    public function checkout(Request $request, ServiceBundle $bundle): JsonResponse
    {
        $validated = $request->validate([
            'customer_id'     => ['required', 'uuid', 'exists:customers,id'],
            'success_url'     => ['sometimes', 'string', 'max:500'],
            'cancel_url'      => ['sometimes', 'string', 'max:500'],
        ]);

        $customer = Customer::findOrFail($validated['customer_id']);

        if (! $bundle->is_active) {
            return response()->json(['error' => 'Bundle not available'], 422);
        }

        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));

            // Ensure the customer has a Stripe customer record
            $stripeCustomerId = $customer->stripe_customer_id;
            if (! $stripeCustomerId) {
                $stripeCustomer = $stripe->customers->create([
                    'email'    => $customer->email,
                    'name'     => $customer->business_name,
                    'metadata' => ['customer_id' => $customer->id],
                ]);
                $stripeCustomerId = $stripeCustomer->id;
                $customer->update(['stripe_customer_id' => $stripeCustomerId]);
            }

            // Create a PaymentIntent for the first month's charge
            // (For subscriptions we use checkout sessions; for one-time setup use PaymentIntent)
            $amountCents = $bundle->price_cents + $bundle->setup_fee_cents;

            $paymentIntent = $stripe->paymentIntents->create([
                'amount'               => $amountCents,
                'currency'             => 'usd',
                'customer'             => $stripeCustomerId,
                'automatic_payment_methods' => ['enabled' => true],
                'description'          => "Fibonacco {$bundle->name} Plan",
                'metadata'             => [
                    'customer_id'  => $customer->id,
                    'bundle_slug'  => $bundle->slug,
                    'bundle_name'  => $bundle->name,
                    'tenant_id'    => $customer->tenant_id ?? '',
                    'source'       => 'campaign_landing_page',
                ],
            ]);

            Log::info("Bundle checkout initiated", [
                'customer_id' => $customer->id,
                'bundle'      => $bundle->slug,
                'amount'      => $amountCents,
                'pi'          => $paymentIntent->id,
            ]);

            return response()->json([
                'data' => [
                    'client_secret'     => $paymentIntent->client_secret,
                    'payment_intent_id' => $paymentIntent->id,
                    'amount'            => $amountCents,
                    'currency'          => 'usd',
                    'bundle'            => $this->formatBundle($bundle),
                ],
            ]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error("Stripe error during bundle checkout", [
                'customer_id' => $customer->id,
                'bundle'      => $bundle->slug,
                'error'       => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Payment setup failed. Please try again.'], 422);
        }
    }

    private function formatBundle(ServiceBundle $bundle): array
    {
        return [
            'id'              => $bundle->id,
            'slug'            => $bundle->slug,
            'name'            => $bundle->name,
            'tagline'         => $bundle->tagline,
            'description'     => $bundle->description,
            'price_cents'     => $bundle->price_cents,
            'price'           => $bundle->price,
            'setup_fee_cents' => $bundle->setup_fee_cents,
            'setup_fee'       => $bundle->setup_fee,
            'features'        => $bundle->features,
            'included_services' => $bundle->included_services,
            'highlight_badge' => $bundle->highlight_badge,
            'sort_order'      => $bundle->sort_order,
        ];
    }
}
