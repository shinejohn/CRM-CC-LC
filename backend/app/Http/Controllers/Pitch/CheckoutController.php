<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pitch;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\PitchSession;
use App\Services\Pitch\PitchAnalyticsService;
use App\Services\Pitch\PitchEnrichmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Stripe\PaymentIntent;
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
            'total_amount' => ['required', 'numeric', 'min:1'],
            'billing_cycle' => ['required', 'string', 'in:monthly,annual'],
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        $amountCents = (int) round($data['total_amount'] * 100);

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
            ],
        ]);

        app(PitchAnalyticsService::class)->log($session->id, 'checkout_intent_created', [
            'payment_intent_id' => $intent->id,
            'amount' => $data['total_amount'],
            'billing_cycle' => $data['billing_cycle'],
            'products' => $data['selected_products'],
        ]);

        return response()->json([
            'data' => [
                'client_secret' => $intent->client_secret,
                'payment_intent_id' => $intent->id,
            ],
        ]);
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

        // Update PitchSession
        $session->status = 'converted';
        $session->last_step = 'done';
        $session->pitch_completed_at = now();
        $session->last_active_at = now();
        $session->save();

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

        return response()->json([
            'data' => $session->fresh()->load(['smb', 'customer', 'community', 'campaign']),
        ]);
    }
}
