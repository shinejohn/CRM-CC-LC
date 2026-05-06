<?php

declare(strict_types=1);

namespace App\Http\Controllers\Sarah;

use App\Http\Controllers\Controller;
use App\Models\AdvertiserSession;
use App\Models\Campaign;
use App\Models\SMB;
use App\Services\Sarah\SarahCampaignService;
use App\Services\Sarah\SarahMessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\PaymentIntent;
use Stripe\Stripe;

final class SarahCampaignController extends Controller
{
    public function __construct(
        private readonly SarahCampaignService $campaignService,
        private readonly SarahMessageService $messageService,
    ) {}

    /**
     * POST /api/v1/sarah/sessions
     * Create a new advertiser session from an "Advertise" CTA.
     */
    public function createSession(Request $request): JsonResponse
    {
        $data = $request->validate([
            'community_id' => ['required', 'uuid'],
            'source_platform' => ['required', 'string', 'in:day_news,goeventcity,downtownguide,golocalvoices'],
            'source_url' => ['required', 'string', 'max:2000'],
            'source_article_id' => ['nullable', 'uuid'],
            'visitor_type' => ['nullable', 'string', 'in:guest,user,business_owner'],
            'business_id' => ['nullable', 'uuid'],
            'user_id' => ['nullable', 'uuid'],
        ]);

        $user = $request->user();
        if ($user && ! isset($data['user_id'])) {
            $data['user_id'] = $user->id;
            $data['visitor_type'] = 'user';
        }

        $session = $this->campaignService->createSession($data);

        return response()->json(['data' => $session->load('community')], 201);
    }

    /**
     * GET /api/v1/sarah/sessions/{id}
     * Retrieve session with messages and proposal.
     */
    public function showSession(string $id): JsonResponse
    {
        $session = AdvertiserSession::with(['community', 'smb', 'campaign.lineItems', 'messages'])
            ->findOrFail($id);

        return response()->json(['data' => $session]);
    }

    /**
     * POST /api/v1/sarah/sessions/{id}/identify
     * Link a business to the session.
     */
    public function identifyBusiness(Request $request, string $id): JsonResponse
    {
        $session = AdvertiserSession::findOrFail($id);

        $data = $request->validate([
            'business_id' => ['required', 'uuid'],
        ]);

        $smb = SMB::findOrFail($data['business_id']);
        $session = $this->campaignService->identifyBusiness($session, $smb);

        return response()->json(['data' => $session->load('smb')]);
    }

    /**
     * POST /api/v1/sarah/sessions/{id}/intake
     * Record the 3 intake answers (goal, timeline, budget).
     */
    public function recordIntake(Request $request, string $id): JsonResponse
    {
        $session = AdvertiserSession::findOrFail($id);

        $data = $request->validate([
            'goal' => ['required', 'string', 'in:foot_traffic,leads,online_sales,brand_awareness,event_promotion,hiring'],
            'timeline' => ['required', 'string', 'in:immediate,short,ongoing'],
            'budget' => ['required', 'string', 'in:under_100,100_300,300_600,600_plus,not_sure'],
        ]);

        $this->messageService->recordUserMessage($session, 'intake', json_encode($data), $data);

        $session = $this->campaignService->recordIntake($session, $data);

        return response()->json(['data' => $session]);
    }

    /**
     * POST /api/v1/sarah/sessions/{id}/proposal
     * Generate a tailored campaign proposal.
     */
    public function generateProposal(string $id): JsonResponse
    {
        $session = AdvertiserSession::findOrFail($id);

        if (! $session->intake_answers) {
            return response()->json(['error' => 'Complete intake before generating a proposal.'], 422);
        }

        $proposal = $this->campaignService->generateProposal($session);

        return response()->json(['data' => $proposal]);
    }

    /**
     * POST /api/v1/sarah/sessions/{id}/validate
     * Validate a product selection change and return bundle warnings.
     */
    public function validateSelection(Request $request, string $id): JsonResponse
    {
        $session = AdvertiserSession::findOrFail($id);

        $data = $request->validate([
            'selected_products' => ['required', 'array'],
            'selected_products.*' => ['string'],
        ]);

        $warnings = $this->campaignService->validateSelection($session, $data['selected_products']);

        if (! empty($warnings)) {
            $this->messageService->sendPushback($session, $warnings);
        }

        return response()->json(['data' => ['warnings' => $warnings]]);
    }

    /**
     * POST /api/v1/sarah/sessions/{id}/create-campaign
     * Finalize the proposal into a Campaign with line items.
     */
    public function createCampaign(Request $request, string $id): JsonResponse
    {
        $session = AdvertiserSession::findOrFail($id);

        $data = $request->validate([
            'products' => ['required', 'array', 'min:1'],
            'products.*.product_slug' => ['required', 'string'],
            'products.*.product_type' => ['required', 'string'],
            'products.*.price' => ['required', 'numeric', 'min:0'],
            'products.*.configuration' => ['nullable', 'array'],
            'products.*.rationale' => ['nullable', 'string'],
        ]);

        $campaign = $this->campaignService->createCampaign($session, $data['products']);

        return response()->json([
            'data' => $campaign->load('lineItems'),
        ], 201);
    }

    /**
     * POST /api/v1/sarah/campaigns/{id}/checkout
     * Create a Stripe PaymentIntent for the campaign total.
     */
    public function checkout(Request $request, string $id): JsonResponse
    {
        $campaign = Campaign::with('lineItems')->findOrFail($id);

        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Authentication required for checkout.'], 401);
        }

        Stripe::setApiKey((string) config('services.stripe.secret'));

        $total = $campaign->lineItems->sum('price');
        $amountCents = (int) round($total * 100);

        $intent = PaymentIntent::create([
            'amount' => $amountCents,
            'currency' => 'usd',
            'metadata' => [
                'campaign_id' => $campaign->id,
                'community_id' => $campaign->community_id,
                'business_name' => $campaign->smb?->business_name ?? '',
                'source' => 'sarah_campaign_builder',
                'line_items' => $campaign->lineItems->count(),
            ],
        ]);

        return response()->json([
            'data' => [
                'client_secret' => $intent->client_secret,
                'payment_intent_id' => $intent->id,
                'amount' => $total,
            ],
        ]);
    }

    /**
     * POST /api/v1/sarah/campaigns/{id}/confirm-payment
     * Verify payment succeeded and activate the campaign.
     */
    public function confirmPayment(Request $request, string $id): JsonResponse
    {
        $campaign = Campaign::with('lineItems')->findOrFail($id);

        $data = $request->validate([
            'payment_intent_id' => ['required', 'string', 'max:200'],
        ]);

        Stripe::setApiKey((string) config('services.stripe.secret'));

        $intent = PaymentIntent::retrieve($data['payment_intent_id']);

        if ($intent->status !== 'succeeded') {
            return response()->json([
                'error' => 'Payment has not been completed.',
                'payment_status' => $intent->status,
            ], 422);
        }

        $campaign = $this->campaignService->activateCampaign($campaign, $data['payment_intent_id']);

        return response()->json([
            'data' => $campaign->load(['lineItems', 'smb', 'community']),
        ]);
    }

    /**
     * GET /api/v1/sarah/sessions/{id}/messages
     * Retrieve conversation history for a session.
     */
    public function messages(string $id): JsonResponse
    {
        $session = AdvertiserSession::findOrFail($id);
        $messages = $this->messageService->getConversation($session);

        return response()->json(['data' => $messages]);
    }

    /**
     * POST /api/v1/sarah/sessions/{id}/message
     * Send a user message to Sarah.
     */
    public function sendMessage(Request $request, string $id): JsonResponse
    {
        $session = AdvertiserSession::findOrFail($id);

        $data = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
            'type' => ['nullable', 'string'],
        ]);

        $message = $this->messageService->recordUserMessage(
            $session,
            $data['type'] ?? 'intake',
            $data['message'],
        );

        return response()->json(['data' => $message], 201);
    }

    /**
     * GET /api/v1/sarah/campaigns
     * List all Sarah-created campaigns (for CC operator dashboard).
     */
    public function listCampaigns(Request $request): JsonResponse
    {
        $query = Campaign::where('type', 'sarah_campaign')
            ->with(['smb', 'community', 'lineItems'])
            ->orderBy('created_at', 'desc');

        $status = $request->query('status');
        if ($status) {
            $query->where('status', $status);
        }

        $communityId = $request->query('community_id');
        if ($communityId) {
            $query->where('community_id', $communityId);
        }

        $campaigns = $query->paginate(25);

        return response()->json($campaigns);
    }

    /**
     * GET /api/v1/sarah/campaigns/{id}
     * Show campaign detail with line items and messages.
     */
    public function showCampaign(string $id): JsonResponse
    {
        $campaign = Campaign::with(['smb', 'community', 'lineItems', 'sarahMessages', 'advertiserSession'])
            ->findOrFail($id);

        return response()->json(['data' => $campaign]);
    }

    /**
     * GET /api/v1/sarah/dashboard
     * Aggregated dashboard stats for CC operators.
     */
    public function dashboard(): JsonResponse
    {
        $activeSessions = AdvertiserSession::whereIn('status', ['intake', 'proposed', 'negotiating'])->count();
        $convertedToday = AdvertiserSession::where('status', 'converted')
            ->whereDate('converted_at', today())
            ->count();
        $abandonedToday = AdvertiserSession::where('status', 'abandoned')
            ->whereDate('abandoned_at', today())
            ->count();

        $activeCampaigns = Campaign::where('type', 'sarah_campaign')
            ->where('status', 'active')
            ->count();

        $revenueThisMonth = Campaign::where('type', 'sarah_campaign')
            ->where('status', 'active')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');

        $recentSessions = AdvertiserSession::with(['community', 'smb'])
            ->orderBy('last_active_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => [
                'active_sessions' => $activeSessions,
                'converted_today' => $convertedToday,
                'abandoned_today' => $abandonedToday,
                'active_campaigns' => $activeCampaigns,
                'revenue_this_month' => (float) $revenueThisMonth,
                'recent_sessions' => $recentSessions,
            ],
        ]);
    }

    /**
     * GET /api/v1/sarah/sessions
     * List all advertiser sessions for CC operators.
     */
    public function listSessions(Request $request): JsonResponse
    {
        $query = AdvertiserSession::with(['community', 'smb'])
            ->orderBy('last_active_at', 'desc');

        $status = $request->query('status');
        if ($status) {
            $query->where('status', $status);
        }

        $communityId = $request->query('community_id');
        if ($communityId) {
            $query->where('community_id', $communityId);
        }

        $sessions = $query->paginate(25);

        return response()->json($sessions);
    }

    /**
     * POST /api/v1/sarah/messages/{id}/action
     * Mark a Sarah message as actioned (accepted, declined, ignored).
     */
    public function actionMessage(Request $request, string $id): JsonResponse
    {
        $message = \App\Models\SarahMessage::findOrFail($id);

        $data = $request->validate([
            'action' => ['required', 'string', 'in:accepted,declined,ignored'],
        ]);

        $this->messageService->markActioned($message, $data['action']);

        return response()->json(['data' => $message->fresh()]);
    }
}
