<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pitch;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Coupon;
use App\Models\PitchSession;
use App\Models\Service;
use App\Services\Pitch\PitchAnalyticsService;
use App\Services\Pitch\PitchEnrichmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Stripe\PaymentIntent;
use Stripe\Refund;
use Stripe\Stripe;

final class CheckoutController extends Controller
{
    /**
     * POST /api/v1/pitch/sessions/{id}/checkout
     *
     * Create a Stripe PaymentIntent for the pitch session.
     * Requires auth (sanctum middleware) — the auth gate happens BEFORE this call.
     */
    public function createPaymentIntent(Request $request, string $id): JsonResponse
    {
        $session = PitchSession::query()->findOrFail($id);

        // Verify the session belongs to the authenticated user
        $user = $request->user();
        if ($session->customer_id && $session->customer_id !== (string) $user->id) {
            abort(403, 'Session does not belong to this user.');
        }

        $data = $request->validate([
            'selected_products' => ['required', 'array', 'min:1'],
            'selected_products.*' => ['string', 'max:200'],
            // NOTE: a client-supplied total is NOT trusted. The charge amount is
            // re-priced server-side from the Service catalog below.
            'billing_cycle' => ['required', 'string', 'in:monthly,annual'],
            'coupon_code' => ['nullable', 'string', 'max:64'],
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        // Re-price server-side from the trusted Service catalog. Never trust a
        // client-supplied amount for the actual charge.
        $priced = $this->priceProducts($data['selected_products'], $data['billing_cycle']);

        if (! empty($priced['missing'])) {
            return response()->json([
                'error' => 'One or more products could not be priced server-side.',
                'unpriceable_products' => $priced['missing'],
            ], 422);
        }

        $baseCents = $priced['amount'];
        if ($baseCents < 50) { // Stripe minimum chargeable amount is 50 cents
            return response()->json([
                'error' => 'Computed charge is below the minimum chargeable amount.',
            ], 422);
        }

        $amountCents = $baseCents;

        // Optional coupon: validate redeemability + scope, then discount the
        // SERVER-computed base. uses_count is NOT incremented here — redemption
        // is recorded exactly once, after the payment is confirmed.
        $couponCode = $data['coupon_code'] ?? null;
        $discountCents = 0;
        if ($couponCode !== null && $couponCode !== '') {
            $coupon = Coupon::query()
                ->whereRaw('UPPER(code) = ?', [strtoupper($couponCode)])
                ->first();

            if ($coupon !== null
                && $coupon->isRedeemable()
                && $this->couponAppliesToAny($coupon, $data['selected_products'])) {
                $discountCents = $coupon->discountFor($amountCents);
                $amountCents = max(50, $amountCents - $discountCents);
            } else {
                // Ignore an invalid/inapplicable coupon rather than charging a
                // wrong amount or storing a code we won't honour at confirm.
                $couponCode = null;
            }
        }

        $community = $session->community;
        $businessName = $session->business_name
            ?? ($session->smb?->business_name ?? 'Unknown');

        $intent = PaymentIntent::create([
            'amount' => $amountCents,
            'currency' => 'usd',
            'metadata' => [
                'session_id' => $session->id,
                'community_id' => $session->community_id,
                'community_name' => $community?->name ?? '',
                'business_name' => $businessName,
                'billing_cycle' => $data['billing_cycle'],
                'products' => implode(', ', $data['selected_products']),
                'coupon_code' => $couponCode ?? '',
                'discount_cents' => (string) $discountCents,
                'base_amount_cents' => (string) $baseCents,
            ],
        ]);

        app(PitchAnalyticsService::class)->log($session->id, 'checkout_intent_created', [
            'payment_intent_id' => $intent->id,
            'amount' => $amountCents / 100,
            'billing_cycle' => $data['billing_cycle'],
            'products' => $data['selected_products'],
        ]);

        return response()->json([
            'data' => [
                'client_secret' => $intent->client_secret,
                'payment_intent_id' => $intent->id,
                'amount' => $amountCents / 100,
            ],
        ]);
    }

    /**
     * Price a set of product slugs from the trusted Service catalog.
     *
     * Mirrors how SarahCampaignController derives its total from server-side
     * line-item prices. Annual billing bills recurring products 12 months
     * up-front (matching RenewExpiredSubscriptions' annual handling).
     *
     * @param  array<int,string>  $slugs
     * @return array{amount:int, missing:array<int,string>}
     */
    private function priceProducts(array $slugs, string $billingCycle): array
    {
        $missing = [];
        $totalCents = 0;

        foreach ($slugs as $slug) {
            $service = Service::query()->where('product_slug', $slug)->first();

            if ($service === null) {
                $missing[] = $slug;

                continue;
            }

            $lineCents = (int) round(((float) $service->price) * 100);

            if ($billingCycle === 'annual' && $service->is_subscription) {
                $lineCents *= 12;
            }

            $totalCents += $lineCents;
        }

        return ['amount' => $totalCents, 'missing' => $missing];
    }

    /**
     * Whether a coupon's service scope covers at least one of the selected
     * products. An unscoped coupon applies to everything.
     *
     * @param  array<int,string>  $slugs
     */
    private function couponAppliesToAny(Coupon $coupon, array $slugs): bool
    {
        if (empty($coupon->applicable_service_ids)) {
            return true;
        }

        $serviceIds = Service::query()
            ->whereIn('product_slug', $slugs)
            ->pluck('id')
            ->all();

        foreach ($serviceIds as $serviceId) {
            if ($coupon->appliesToService((string) $serviceId)) {
                return true;
            }
        }

        return false;
    }

    /**
     * POST /api/v1/pitch/sessions/{id}/confirm-payment
     *
     * Verifies the PaymentIntent succeeded, converts the session, and creates
     * Campaign + line-item records from productsAccepted.
     */
    public function confirmPayment(Request $request, string $id): JsonResponse
    {
        $session = PitchSession::query()->findOrFail($id);

        $data = $request->validate([
            'payment_intent_id' => ['required', 'string', 'max:200'],
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        // Verify PaymentIntent
        $intent = PaymentIntent::retrieve($data['payment_intent_id']);

        if ($intent->status !== 'succeeded') {
            return response()->json([
                'error' => 'Payment has not been completed.',
                'payment_status' => $intent->status,
            ], 422);
        }

        // Bind the PaymentIntent to THIS session — an intent created for a
        // different session must not be replayed to convert this one.
        $metaSessionId = $intent->metadata->session_id ?? null;
        if ((string) $metaSessionId !== (string) $id) {
            return response()->json([
                'error' => 'Payment does not belong to this session.',
            ], 422);
        }

        // Verify the captured amount matches what the server priced for the
        // products recorded on the intent (defence-in-depth against a tampered
        // or amount-mismatched intent).
        $metaProducts = array_values(array_filter(array_map(
            'trim',
            explode(',', (string) ($intent->metadata->products ?? '')),
        )));
        $billingCycle = (string) ($intent->metadata->billing_cycle ?? 'monthly');
        $discountCents = (int) ($intent->metadata->discount_cents ?? 0);

        $priced = $this->priceProducts($metaProducts, $billingCycle);
        $expectedCents = max(50, $priced['amount'] - $discountCents);

        if (! empty($priced['missing']) || (int) $intent->amount !== $expectedCents) {
            return response()->json([
                'error' => 'Payment amount does not match the server-computed price.',
            ], 422);
        }

        // Provisioning prerequisites MUST exist before we convert. If they are
        // missing we would take money with zero fulfilment, so refund instead.
        if (! $session->customer || ! $session->community) {
            try {
                Refund::create(['payment_intent' => $intent->id]);
            } catch (\Throwable $e) {
                Log::error('CheckoutController: refund failed for unfulfillable session', [
                    'session_id' => $session->id,
                    'payment_intent_id' => $intent->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return response()->json([
                'error' => 'This session cannot be provisioned (missing customer or community). Your payment has been refunded.',
            ], 422);
        }

        // One-shot conversion under a row lock: concurrent confirms and replays
        // cannot double-convert the session or double-count the coupon.
        $alreadyConverted = false;
        DB::transaction(function () use ($id, $intent, &$alreadyConverted): void {
            $locked = PitchSession::query()->lockForUpdate()->findOrFail($id);

            if ($locked->status === 'converted') {
                $alreadyConverted = true;

                return;
            }

            $locked->status = 'converted';
            $locked->last_step = 'done';
            $locked->pitch_completed_at = now();
            $locked->last_active_at = now();
            $locked->save();

            // Record the coupon redemption exactly once, now that payment is
            // confirmed. The row lock + redeemability check are atomic.
            $couponCode = $intent->metadata->coupon_code ?? null;
            if ($couponCode !== null && $couponCode !== '') {
                $coupon = Coupon::query()
                    ->whereRaw('UPPER(code) = ?', [strtoupper((string) $couponCode)])
                    ->lockForUpdate()
                    ->first();

                if ($coupon !== null && $coupon->isRedeemable()) {
                    $coupon->increment('uses_count');
                }
            }
        });

        if ($alreadyConverted) {
            // Idempotent: already processed on a prior call — return current state.
            return response()->json([
                'data' => $session->fresh()->load(['smb', 'customer', 'community', 'campaign']),
            ]);
        }

        $session->refresh();

        // Create Campaign from productsAccepted
        $products = $session->products_accepted ?? [];
        $campaignId = (string) Str::uuid();

        $campaign = Campaign::create([
            'id' => $campaignId,
            'name' => ($session->business_name ?? 'Business') . ' — Pitch Enrollment',
            'customer_id' => $session->customer_id,
            'smb_id' => $session->smb_id,
            'community_id' => $session->community_id,
            'status' => 'active',
            'is_active' => true,
            'approval_config' => [
                'source' => 'pitch_engine',
                'pitch_session_id' => $session->id,
                'payment_intent_id' => $data['payment_intent_id'],
                'products' => $products,
            ],
        ]);

        // Link campaign to session
        $session->proposal_id = $campaignId;
        $session->save();

        // Enrichment + analytics
        app(PitchEnrichmentService::class)->process(
            $session->fresh(),
            'pitch_completed',
            [
                'campaign_id' => $campaignId,
                'payment_intent_id' => $data['payment_intent_id'],
                'products' => $products,
            ]
        );

        app(PitchAnalyticsService::class)->log($session->id, 'pitch_completed', [
            'step' => 'done',
            'campaign_id' => $campaignId,
            'payment_intent_id' => $data['payment_intent_id'],
            'products' => $products,
        ]);

        // Post-purchase provisioning: slot claim, subscription, PP push, onboarding timeline
        app(\App\Services\Pitch\PitchProvisioningService::class)->provision(
            $session->fresh(),
            $data['payment_intent_id'],
        );

        return response()->json([
            'data' => $session->fresh()->load(['smb', 'customer', 'community', 'campaign']),
        ]);
    }
}
