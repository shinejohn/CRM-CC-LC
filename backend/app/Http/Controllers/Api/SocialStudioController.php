<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SMB;
use App\Models\SocialStudio\StudioCredit;
use App\Models\SocialStudio\StudioCreditTransaction;
use App\Models\SocialStudio\StudioSubscription;
use App\Models\SocialStudio\StudioContent;
use App\Models\SocialStudio\StudioConnectedAccount;
use App\Services\StripeService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SocialStudioController extends Controller
{
    protected StripeService $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Get credit balance and history
     */
    public function getCredits($smbId)
    {
        $credits = StudioCredit::firstOrCreate(
            ['smb_id' => $smbId],
            ['balance' => 0, 'lifetime_purchased' => 0, 'lifetime_consumed' => 0]
        );

        return response()->json([
            'credits' => $credits
        ]);
    }

    /**
     * Purchase a credit package via Stripe
     */
    public function purchaseCredits(Request $request)
    {
        $validated = $request->validate([
            'smb_id' => 'required|exists:smbs,id',
            'amount_cents' => 'required|integer|min:500',
            'credit_amount' => 'required|integer|min:1',
            'payment_method_id' => 'required|string',
        ]);

        $smb = SMB::findOrFail($validated['smb_id']);

        try {
            // Simplified Stripe Payment Intent logic for Studio
            // In a real app, you'd confirm the PaymentIntent with Stripe
            
            $credits = StudioCredit::firstOrCreate(['smb_id' => $smb->id]);
            $credits->balance += $validated['credit_amount'];
            $credits->lifetime_purchased += $validated['credit_amount'];
            $credits->save();

            StudioCreditTransaction::create([
                'smb_id' => $smb->id,
                'type' => 'purchase',
                'amount' => $validated['credit_amount'],
                'balance_after' => $credits->balance,
                'stripe_payment_intent_id' => 'pi_mock_' . uniqid(),
            ]);

            return response()->json([
                'message' => 'Credits purchased successfully',
                'balance' => $credits->balance
            ]);
        } catch (\Exception $e) {
            Log::error('Studio Credit Purchase Failed: ' . $e->getMessage());
            return response()->json(['message' => 'Payment failed'], 500);
        }
    }

    /**
     * Start a monthly Studio subscription (recurring credits)
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'smb_id' => 'required|exists:smbs,id',
            'payment_method_id' => 'required|string',
        ]);

        $smb = SMB::findOrFail($validated['smb_id']);

        try {
            $stripeCustomer = $this->stripeService->createCustomer(
                "studio-{$smb->id}@fibonacco.internal",
                $smb->business_name ?? 'Studio Subscriber',
                ['smb_id' => $smb->id]
            );

            // Mock subscription for local dev until real pricing is connected
            $stripeSubscriptionId = 'sub_mock_' . uniqid();

            $subscription = StudioSubscription::updateOrCreate(
                ['smb_id' => $smb->id],
                [
                    'status' => 'active',
                    'monthly_credits' => 200,
                    'discount_pct' => 20,
                    'billing_amount_cents' => 7900,
                    'stripe_subscription_id' => $stripeSubscriptionId,
                    'next_credit_refresh_at' => now()->addMonth(),
                ]
            );

            // Add initial bonus credits
            $credits = StudioCredit::firstOrCreate(['smb_id' => $smb->id]);
            $credits->balance += 200;
            $credits->lifetime_purchased += 200;
            $credits->save();

            StudioCreditTransaction::create([
                'smb_id' => $smb->id,
                'type' => 'bonus',
                'amount' => 200,
                'balance_after' => $credits->balance,
                'action_type' => 'subscription_start'
            ]);

            return response()->json([
                'message' => 'Subscription activated successfully',
                'subscription' => $subscription,
                'balance' => $credits->balance
            ], 201);
        } catch (\Exception $e) {
            Log::error('Studio Subscription Failed: ' . $e->getMessage());
            return response()->json(['message' => 'Subscription failed'], 500);
        }
    }

    /**
     * Generate social post copy using AI tools
     */
    public function generatePostCopy(Request $request)
    {
        $validated = $request->validate([
            'smb_id' => 'required|exists:smbs,id',
            'source_brief' => 'required|string',
            'platforms' => 'required|array',
        ]);

        $credits = StudioCredit::firstOrCreate(['smb_id' => $validated['smb_id']]);
        $costPerPlatform = 5;
        $totalCost = count($validated['platforms']) * $costPerPlatform;

        if ($credits->balance < $totalCost) {
            return response()->json(['message' => 'Insufficient credits'], 402);
        }

        try {
            DB::beginTransaction();

            // Deduct credits
            $credits->balance -= $totalCost;
            $credits->lifetime_consumed += $totalCost;
            $credits->save();

            // Generate content mock response
            $generatedOutputs = [];
            foreach ($validated['platforms'] as $platform) {
                $generatedOutputs[$platform] = [
                    'copy' => "Exciting update for our followers on {$platform}! " . $validated['source_brief'],
                    'hashtags' => ['#fibo', '#socialstudio', "#{$platform}"],
                ];
            }

            $contentRecord = StudioContent::create([
                'smb_id' => $validated['smb_id'],
                'content_type' => 'post_copy',
                'source_brief' => $validated['source_brief'],
                'generated_output' => $generatedOutputs,
                'credits_consumed' => $totalCost,
                'status' => 'draft',
            ]);

            StudioCreditTransaction::create([
                'smb_id' => $validated['smb_id'],
                'type' => 'consume',
                'amount' => -$totalCost,
                'balance_after' => $credits->balance,
                'action_type' => 'post_copy_generation',
                'content_id' => $contentRecord->id,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Content generated',
                'content' => $contentRecord,
                'balance' => $credits->balance
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Social Studio Generate Post Failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to generate post copy'], 500);
        }
    }

    /**
     * List Connected Accounts
     */
    public function getAccounts($smbId)
    {
        $accounts = StudioConnectedAccount::where('smb_id', $smbId)->get();
        return response()->json(['accounts' => $accounts]);
    }

    /**
     * Initiate OAuth Connect
     */
    public function connectAccount(Request $request)
    {
        $validated = $request->validate([
            'smb_id' => 'required|exists:smbs,id',
            'platform' => 'required|string|in:facebook,instagram,x,google_biz',
        ]);

        // Mock OAuth initiation URL
        $authUrl = "https://oauth.provider.com/auth?client_id=mock&state={$validated['smb_id']}_{$validated['platform']}";

        return response()->json([
            'auth_url' => $authUrl
        ]);
    }

    /**
     * Handle OAuth Callback (simulated)
     */
    public function callbackAccount(Request $request)
    {
        $validated = $request->validate([
            'smb_id' => 'required|exists:smbs,id',
            'platform' => 'required|string',
            'code' => 'required|string',
        ]);

        $account = StudioConnectedAccount::updateOrCreate(
            [
                'smb_id' => $validated['smb_id'],
                'platform' => $validated['platform'],
                'platform_account_id' => 'mock_acct_' . uniqid(),
            ],
            [
                'display_name' => ucfirst($validated['platform']) . ' Page',
                'oauth_access_token' => 'mock_token_' . uniqid(),
                'status' => 'active',
                'connected_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Account connected successfully',
            'account' => $account
        ], 201);
    }
}
