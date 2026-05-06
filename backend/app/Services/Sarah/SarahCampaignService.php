<?php

declare(strict_types=1);

namespace App\Services\Sarah;

use App\Models\AdvertiserSession;
use App\Models\Campaign;
use App\Models\CampaignLineItem;
use App\Models\Service;
use App\Models\SMB;
use App\Services\Pitch\CampaignBundleValidator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Orchestrates the Sarah Campaign Builder flow.
 *
 * Phases:
 *  1. Create session with source context
 *  2. Identify/claim business
 *  3. Conversational intake (goal, timeline, budget)
 *  4. Generate proposal with AI rationale
 *  5. Validate bundle rules, handle pushback
 *  6. Create campaign + line items
 *  7. Checkout (Stripe PaymentIntent)
 */
final class SarahCampaignService
{
    public function __construct(
        private readonly CampaignBundleValidator $bundleValidator,
        private readonly CampaignFulfillmentService $fulfillmentService,
        private readonly SarahMessageService $messageService,
    ) {}

    /**
     * Create a new advertiser session from an "Advertise" CTA click.
     *
     * @param  array<string, mixed>  $context
     */
    public function createSession(array $context): AdvertiserSession
    {
        $session = AdvertiserSession::create([
            'community_id' => $context['community_id'],
            'source_platform' => $context['source_platform'] ?? 'day_news',
            'source_url' => $context['source_url'] ?? '',
            'source_article_id' => $context['source_article_id'] ?? null,
            'visitor_type' => $context['visitor_type'] ?? 'guest',
            'business_id' => $context['business_id'] ?? null,
            'user_id' => $context['user_id'] ?? null,
            'business_name' => $context['business_name'] ?? null,
            'business_category' => $context['business_category'] ?? null,
            'status' => 'intake',
            'last_active_at' => now(),
        ]);

        $this->messageService->send($session, 'intake', "Hi! I'm Sarah, your advertising advisor. Let's find the best way to get your business in front of the right people in {$session->community?->name}.");

        Log::info('Sarah: session created', [
            'session_id' => $session->id,
            'source_platform' => $session->source_platform,
            'community_id' => $session->community_id,
        ]);

        return $session;
    }

    /**
     * Link a business to the session after identification/claim.
     */
    public function identifyBusiness(AdvertiserSession $session, SMB $smb): AdvertiserSession
    {
        $session->update([
            'business_id' => $smb->id,
            'business_name' => $smb->business_name,
            'business_category' => $smb->category_group,
            'last_active_at' => now(),
        ]);

        return $session->fresh();
    }

    /**
     * Record intake answers and transition to proposal generation.
     *
     * @param  array{goal: string, timeline: string, budget: string}  $answers
     */
    public function recordIntake(AdvertiserSession $session, array $answers): AdvertiserSession
    {
        $session->update([
            'intake_answers' => $answers,
            'last_active_at' => now(),
        ]);

        return $session->fresh();
    }

    /**
     * Generate a campaign proposal based on intake answers and business context.
     *
     * @return array{products: list<array<string, mixed>>, total: float, warnings: list<array<string, mixed>>}
     */
    public function generateProposal(AdvertiserSession $session): array
    {
        $intake = $session->intake_answers ?? [];
        $goal = $intake['goal'] ?? 'brand_awareness';
        $timeline = $intake['timeline'] ?? 'ongoing';
        $budget = $intake['budget'] ?? 'not_sure';
        $category = $session->business_category ?? 'general';

        $recommended = $this->recommendProducts($goal, $timeline, $budget, $category);

        $total = collect($recommended)->sum('price');

        $selectedSlugs = collect($recommended)->pluck('product_slug')->toArray();
        $warnings = $this->bundleValidator->validate($selectedSlugs, [
            'has_logo' => false,
            'business_category' => $category,
        ]);

        $proposal = [
            'products' => $recommended,
            'total' => $total,
            'goal' => $goal,
            'timeline' => $timeline,
            'budget' => $budget,
            'generated_at' => now()->toISOString(),
        ];

        $session->update([
            'proposal' => $proposal,
            'status' => 'proposed',
            'last_active_at' => now(),
        ]);

        $this->messageService->send($session, 'proposal', $this->buildProposalMessage($session, $recommended, $total));

        return [
            'products' => $recommended,
            'total' => $total,
            'warnings' => $warnings,
        ];
    }

    /**
     * Validate a user's product selection changes and return bundle warnings.
     *
     * @param  list<string>  $selectedSlugs
     * @return list<array{type: string, message: string, suggestion?: string}>
     */
    public function validateSelection(AdvertiserSession $session, array $selectedSlugs): array
    {
        return $this->bundleValidator->validate($selectedSlugs, [
            'has_logo' => false,
            'business_category' => $session->business_category ?? 'general',
        ]);
    }

    /**
     * Finalize the proposal — create Campaign + CampaignLineItems.
     *
     * @param  list<array{product_slug: string, price: float, configuration?: array<string, mixed>}>  $selectedProducts
     */
    public function createCampaign(AdvertiserSession $session, array $selectedProducts): Campaign
    {
        return DB::transaction(function () use ($session, $selectedProducts) {
            $businessName = $session->business_name ?? 'Business';
            $community = $session->community;
            $intake = $session->intake_answers ?? [];
            $campaignId = (string) Str::uuid();

            $total = collect($selectedProducts)->sum('price');

            $campaign = Campaign::create([
                'id' => $campaignId,
                'customer_id' => $session->user_id,
                'smb_id' => $session->business_id,
                'community_id' => $session->community_id,
                'name' => $businessName . ' — ' . now()->format('F Y'),
                'goal' => $intake['goal'] ?? null,
                'timeline' => $intake['timeline'] ?? null,
                'status' => 'draft',
                'total_amount' => $total,
                'type' => 'sarah_campaign',
                'title' => $businessName . ' — ' . now()->format('F Y'),
                'subject' => $businessName . ' campaign',
                'slug' => Str::slug($businessName . '-' . now()->format('Y-m')),
                'week' => 0,
                'day' => 0,
                'is_active' => false,
                'sarah_context' => [
                    'session_id' => $session->id,
                    'intake' => $intake,
                    'source_platform' => $session->source_platform,
                    'business_category' => $session->business_category,
                ],
            ]);

            foreach ($selectedProducts as $index => $product) {
                $service = Service::where('product_slug', $product['product_slug'])->first();

                CampaignLineItem::create([
                    'campaign_id' => $campaign->id,
                    'product_type' => $product['product_type'] ?? $product['product_slug'],
                    'product_id' => $service?->id,
                    'product_slug' => $product['product_slug'],
                    'price' => $product['price'],
                    'configuration' => $product['configuration'] ?? [],
                    'sarah_rationale' => $product['rationale'] ?? null,
                    'sort_order' => $index,
                    'status' => 'pending',
                ]);
            }

            $session->update([
                'campaign_id' => $campaign->id,
                'status' => 'negotiating',
                'last_active_at' => now(),
            ]);

            Log::info('Sarah: campaign created', [
                'campaign_id' => $campaign->id,
                'session_id' => $session->id,
                'line_items' => count($selectedProducts),
                'total' => $total,
            ]);

            return $campaign;
        });
    }

    /**
     * After payment succeeds, activate the campaign and route to fulfillment.
     */
    public function activateCampaign(Campaign $campaign, string $paymentIntentId): Campaign
    {
        $campaign->update([
            'status' => 'active',
            'is_active' => true,
            'stripe_payment_intent_id' => $paymentIntentId,
        ]);

        $this->fulfillmentService->fulfill($campaign);

        $session = $campaign->advertiserSession;
        if ($session) {
            $session->update([
                'status' => 'converted',
                'converted_at' => now(),
                'last_active_at' => now(),
            ]);

            $this->messageService->send($session, 'confirmation', $this->buildConfirmationMessage($campaign));
        }

        Log::info('Sarah: campaign activated', [
            'campaign_id' => $campaign->id,
            'payment_intent_id' => $paymentIntentId,
        ]);

        return $campaign;
    }

    /**
     * Recommend products based on goal, timeline, budget, and category.
     *
     * @return list<array{product_slug: string, product_type: string, name: string, price: float, rationale: string, recommended: bool}>
     */
    private function recommendProducts(string $goal, string $timeline, string $budget, string $category): array
    {
        $budgetMax = match ($budget) {
            'under_100' => 100,
            '100_300' => 300,
            '300_600' => 600,
            '600_plus' => 1000,
            default => 500,
        };

        $products = Service::where('is_active', true)
            ->where('is_perk', false)
            ->whereNotNull('product_slug')
            ->get();

        $recommended = [];

        // Core recommendation: Headliner Ad — always included for visibility goals
        if (in_array($goal, ['foot_traffic', 'leads', 'brand_awareness', 'event_promotion'], true)) {
            $headliner = $products->firstWhere('product_slug', 'headliner');
            if ($headliner) {
                $price = min((float) ($headliner->price ?? 149), $budgetMax * 0.5);
                $recommended[] = [
                    'product_slug' => 'headliner',
                    'product_type' => 'headliner_ad',
                    'name' => $headliner->name,
                    'price' => max($price, (float) ($headliner->price ?? 75)),
                    'rationale' => 'This puts you at the top of the page where readers already looking at local news will see you first.',
                    'recommended' => true,
                ];
            }
        }

        // Newsletter callout for engagement goals
        if ($budgetMax >= 100) {
            $newsletter = $products->firstWhere('product_slug', 'newsletter-sponsor');
            if ($newsletter) {
                $recommended[] = [
                    'product_slug' => 'newsletter-sponsor',
                    'product_type' => 'newsletter_callout',
                    'name' => $newsletter->name ?? 'Newsletter Sponsor',
                    'price' => (float) ($newsletter->price ?? 100),
                    'rationale' => 'Your ad goes directly to the most engaged readers — the ones who open every issue.',
                    'recommended' => true,
                ];
            }
        }

        // Sponsored article for credibility / new-to-market
        if ($budgetMax >= 200 && in_array($goal, ['brand_awareness', 'leads'], true)) {
            $article = $products->firstWhere('product_slug', 'article-companion');
            if ($article) {
                $recommended[] = [
                    'product_slug' => 'article-companion',
                    'product_type' => 'sponsored_article',
                    'name' => $article->name ?? 'Article Companion',
                    'price' => (float) ($article->price ?? 100),
                    'rationale' => 'An article about your business adds real credibility — especially if you are new to the area.',
                    'recommended' => true,
                ];
            }
        }

        // Display campaign for online sales / ongoing visibility
        if ($budgetMax >= 300 && in_array($goal, ['online_sales', 'brand_awareness'], true) && $timeline === 'ongoing') {
            $display = $products->firstWhere('product_slug', 'display-ads');
            if ($display) {
                $recommended[] = [
                    'product_slug' => 'display-ads',
                    'product_type' => 'display_campaign',
                    'name' => $display->name ?? 'Display Ads',
                    'price' => (float) ($display->price ?? 150),
                    'rationale' => 'Keeps your business visible across the site over time — works best for ongoing brand presence.',
                    'recommended' => true,
                ];
            }
        }

        // Event promotion for event goal
        if ($goal === 'event_promotion') {
            $event = $products->firstWhere('product_slug', 'event-reminders');
            if ($event) {
                $recommended[] = [
                    'product_slug' => 'event-reminders',
                    'product_type' => 'event_promotion',
                    'name' => $event->name ?? 'Event Reminders',
                    'price' => (float) ($event->price ?? 25),
                    'rationale' => 'Automatically reminds people who expressed interest — the highest-converting audience for events.',
                    'recommended' => true,
                ];
            }
        }

        // Premium listing for foot traffic
        if ($goal === 'foot_traffic' && $budgetMax >= 100) {
            $listing = $products->firstWhere('product_slug', 'premium-listing');
            if ($listing) {
                $recommended[] = [
                    'product_slug' => 'premium-listing',
                    'product_type' => 'featured_listing',
                    'name' => $listing->name ?? 'Premium Listing',
                    'price' => (float) ($listing->price ?? 49),
                    'rationale' => 'Shows your business with full details, photos, and a direct link so people nearby can find you.',
                    'recommended' => true,
                ];
            }
        }

        // Trim to budget
        $running = 0;
        $filtered = [];
        foreach ($recommended as $item) {
            if ($running + $item['price'] <= $budgetMax * 1.1) {
                $filtered[] = $item;
                $running += $item['price'];
            }
        }

        return $filtered;
    }

    private function buildProposalMessage(AdvertiserSession $session, array $products, float $total): string
    {
        $businessName = $session->business_name ?? 'your business';
        $count = count($products);
        $names = collect($products)->pluck('name')->join(', ', ' and ');

        return "Based on what you told me, I recommend {$count} item" . ($count !== 1 ? 's' : '') . " for {$businessName}: {$names}. Total: \${$total}. You can adjust any of these — I'll tell you if something won't work well on its own.";
    }

    private function buildConfirmationMessage(Campaign $campaign): string
    {
        $itemCount = $campaign->lineItems()->count();
        $businessName = $campaign->smb?->business_name ?? 'your business';

        return "You're all set! Your campaign for {$businessName} is now live with {$itemCount} item" . ($itemCount !== 1 ? 's' : '') . ". I'll keep an eye on performance and let you know how things are going.";
    }
}
