<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

final class PaymentMethodController extends Controller
{
    public function __construct(
        private StripeService $stripeService,
    ) {}

    /**
     * Create a Stripe SetupIntent so the frontend can collect payment method details.
     */
    public function createSetupIntent(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);

        if (! $customer) {
            return response()->json(['error' => 'Customer not found'], 404);
        }

        $stripeCustomerId = $this->ensureStripeCustomer($customer);

        try {
            $setupIntent = $this->stripeService->createSetupIntent($stripeCustomerId);

            return response()->json([
                'client_secret' => $setupIntent->client_secret,
                'setup_intent_id' => $setupIntent->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create SetupIntent', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Failed to create setup intent'], 500);
        }
    }

    /**
     * List saved payment methods for the authenticated customer.
     */
    public function index(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);

        if (! $customer) {
            return response()->json(['error' => 'Customer not found'], 404);
        }

        $stripeCustomerId = $customer->stripe_customer_id;

        if (! $stripeCustomerId) {
            return response()->json(['data' => []]);
        }

        try {
            $methods = $this->stripeService->listPaymentMethods($stripeCustomerId);

            $data = array_map(fn ($method) => [
                'id' => $method->id,
                'type' => $method->type,
                'card' => $method->type === 'card' ? [
                    'brand' => $method->card->brand,
                    'last4' => $method->card->last4,
                    'exp_month' => $method->card->exp_month,
                    'exp_year' => $method->card->exp_year,
                ] : null,
                'created' => $method->created,
            ], $methods->data);

            return response()->json(['data' => $data]);
        } catch (\Exception $e) {
            Log::error('Failed to list payment methods', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Failed to retrieve payment methods'], 500);
        }
    }

    /**
     * Detach (remove) a payment method.
     */
    public function destroy(Request $request, string $paymentMethodId): JsonResponse
    {
        $customer = $this->resolveCustomer($request);

        if (! $customer) {
            return response()->json(['error' => 'Customer not found'], 404);
        }

        try {
            $method = $this->stripeService->retrievePaymentMethod($paymentMethodId);

            if ($method->customer !== $customer->stripe_customer_id) {
                return response()->json(['error' => 'Payment method does not belong to this customer'], 403);
            }

            $this->stripeService->detachPaymentMethod($paymentMethodId);

            return response()->json(['message' => 'Payment method removed']);
        } catch (\Exception $e) {
            Log::error('Failed to detach payment method', [
                'customer_id' => $customer->id,
                'payment_method_id' => $paymentMethodId,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Failed to remove payment method'], 500);
        }
    }

    /**
     * Set a payment method as the default for the customer.
     */
    public function setDefault(Request $request): JsonResponse
    {
        $request->validate([
            'payment_method_id' => 'required|string',
        ]);

        $customer = $this->resolveCustomer($request);

        if (! $customer) {
            return response()->json(['error' => 'Customer not found'], 404);
        }

        $stripeCustomerId = $customer->stripe_customer_id;

        if (! $stripeCustomerId) {
            return response()->json(['error' => 'No Stripe customer on file'], 400);
        }

        try {
            $method = $this->stripeService->retrievePaymentMethod($request->input('payment_method_id'));

            if ($method->customer !== $stripeCustomerId) {
                return response()->json(['error' => 'Payment method does not belong to this customer'], 403);
            }

            $this->stripeService->setDefaultPaymentMethod($stripeCustomerId, $method->id);

            return response()->json(['message' => 'Default payment method updated']);
        } catch (\Exception $e) {
            Log::error('Failed to set default payment method', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Failed to update default payment method'], 500);
        }
    }

    private function resolveCustomer(Request $request): ?Customer
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        return Customer::where('email', $user->email)->first();
    }

    private function ensureStripeCustomer(Customer $customer): string
    {
        if ($customer->stripe_customer_id) {
            return $customer->stripe_customer_id;
        }

        $stripeCustomer = $this->stripeService->createCustomer(
            $customer->email ?? $customer->primary_email ?? '',
            $customer->owner_name ?? $customer->business_name ?? 'Customer',
            ['fibonacco_customer_id' => $customer->id],
        );

        $customer->update(['stripe_customer_id' => $stripeCustomer->id]);

        return $stripeCustomer->id;
    }
}
