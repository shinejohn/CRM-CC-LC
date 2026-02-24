<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cssn\CssnSubscription;
use App\Models\Cssn\CssnSmbPreference;
use App\Models\Cssn\CssnSmbReport;
use App\Models\SMB;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CssnSubscriptionController extends Controller
{
    private StripeService $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Create a new CSSN subscription.
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'smb_id' => 'required|exists:smbs,id',
            'community_id' => 'required|exists:communities,id',
            'tier' => 'required|in:local,reach,network,enterprise',
            'payment_method_id' => 'required|string',
        ]);

        $smb = SMB::findOrFail($validated['smb_id']);

        // Determine pricing based on tier (hardcoded for now, would typically be in config or db)
        $prices = [
            'local' => ['amount' => 19900, 'stripe_price_id' => config('services.stripe.prices.cssn_local', 'price_fake_local')],
            'reach' => ['amount' => 39900, 'stripe_price_id' => config('services.stripe.prices.cssn_reach', 'price_fake_reach')],
            'network' => ['amount' => 79900, 'stripe_price_id' => config('services.stripe.prices.cssn_network', 'price_fake_network')],
            'enterprise' => ['amount' => 149900, 'stripe_price_id' => config('services.stripe.prices.cssn_enterprise', 'price_fake_enterprise')],
        ];

        $priceInfo = $prices[$validated['tier']];

        try {
            // Check if SMB already has a Stripe Customer ID stored (assuming it's in a metadata column for now or we create one)
            // For Sprint 1, we will create a new Stripe customer based on SMB data if needed.
            $stripeCustomer = $this->stripeService->createCustomer(
                "billing-{$smb->id}@fibonacco.internal",
                $smb->business_name ?? 'CSSN Subscriber',
                ['smb_id' => $smb->id]
            );

            // Create subscription in Stripe
            $stripeSubscription = $this->stripeService->createSubscription(
                $stripeCustomer->id,
                $priceInfo['stripe_price_id'],
                ['smb_id' => $smb->id, 'tier' => $validated['tier']]
            );
            
            $subscription = CssnSubscription::create([
                'smb_id' => $smb->id,
                'community_id' => $validated['community_id'],
                'tier' => $validated['tier'],
                'mode' => 'subscription',
                'status' => 'active',
                'billing_amount_cents' => $priceInfo['amount'],
                'billing_interval' => 'monthly',
                'stripe_subscription_id' => $stripeSubscription->id,
                'activated_at' => now(),
            ]);

            // Ensure preferences exist
            CssnSmbPreference::firstOrCreate(['smb_id' => $smb->id]);

            return response()->json([
                'message' => 'Subscription created successfully',
                'subscription' => $subscription
            ], 201);

        } catch (\Exception $e) {
            Log::error('CSSN Subscription Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create subscription'], 500);
        }
    }

    /**
     * Get a specific SMB's CSSN subscription.
     */
    public function showSubscription($smbId)
    {
        $subscription = CssnSubscription::where('smb_id', $smbId)->first();
        
        if (!$subscription) {
            return response()->json(['message' => 'No active subscription found'], 404);
        }

        return response()->json(['subscription' => $subscription]);
    }

    /**
     * Update an existing subscription (e.g., change tier or cancel).
     */
    public function updateSubscription(Request $request, $id)
    {
        $subscription = CssnSubscription::findOrFail($id);

        $validated = $request->validate([
            'tier' => 'sometimes|in:local,reach,network,enterprise',
            'status' => 'sometimes|in:active,paused,cancelled',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'cancelled') {
            $validated['cancelled_at'] = now();
            if ($subscription->stripe_subscription_id) {
                try {
                    $this->stripeService->cancelSubscription($subscription->stripe_subscription_id);
                } catch (\Exception $e) {
                    Log::error('Failed to cancel Stripe subscription: ' . $e->getMessage());
                    // We still proceed to cancel locally
                }
            }
        }

        $subscription->update($validated);

        return response()->json([
            'message' => 'Subscription updated successfully',
            'subscription' => $subscription
        ]);
    }

    /**
     * Enter campaign mode (one-time purchase).
     */
    public function startCampaign(Request $request)
    {
        $validated = $request->validate([
            'smb_id' => 'required|exists:smbs,id',
            'community_id' => 'required|exists:communities,id',
            'duration_days' => 'required|integer|min:7|max:90',
            'target_communities' => 'required|array',
            'amount_cents' => 'required|integer|min:10000',
        ]);

        // Placeholder for Stripe payment intent charge.

        $subscription = CssnSubscription::create([
            'smb_id' => $validated['smb_id'],
            'community_id' => $validated['community_id'],
            'tier' => 'network', // Defaulting to network capabilities for campaigns
            'mode' => 'campaign',
            'status' => 'active',
            'campaign_start_date' => now(),
            'campaign_end_date' => now()->addDays($validated['duration_days']),
            'cross_community_ids' => $validated['target_communities'],
            'billing_amount_cents' => $validated['amount_cents'],
            'billing_interval' => 'one_time',
            'activated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Campaign started successfully',
            'subscription' => $subscription
        ], 201);
    }

    /**
     * Get CSSN distribution preferences.
     */
    public function getPreferences($smbId)
    {
        $preferences = CssnSmbPreference::firstOrCreate(['smb_id' => $smbId]);
        return response()->json(['preferences' => $preferences]);
    }

    /**
     * Update CSSN distribution preferences.
     */
    public function updatePreferences(Request $request, $smbId)
    {
        $preferences = CssnSmbPreference::where('smb_id', $smbId)->firstOrFail();

        $validated = $request->validate([
            'auto_distribute_coupons' => 'boolean',
            'auto_distribute_events' => 'boolean',
            'auto_distribute_articles' => 'boolean',
            'auto_distribute_announcements' => 'boolean',
            'require_approval_before_post' => 'boolean',
            'preferred_post_time' => 'nullable|string',
            'excluded_platforms' => 'nullable|array',
            'brand_voice_override' => 'nullable|string'
        ]);

        $preferences->update($validated);

        return response()->json([
            'message' => 'Preferences updated successfully',
            'preferences' => $preferences
        ]);
    }
    
    /**
     * Get CSSN reports for an SMB.
     */
    public function getReports($smbId)
    {
        $reports = CssnSmbReport::where('smb_id', $smbId)->orderBy('report_period_start', 'desc')->get();
        return response()->json(['reports' => $reports]);
    }
}
