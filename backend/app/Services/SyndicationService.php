<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Community;
use App\Models\ContentCard;
use App\Models\PartnerCommunity;
use App\Models\SMB;
use App\Models\SponsorPlacement;
use App\Models\SyndicationPartner;
use App\Models\ClickTracking;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

final class SyndicationService
{
    /**
     * Register a new syndication partner.
     */
    public function registerPartner(User $user, array $data): SyndicationPartner
    {
        return SyndicationPartner::create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'email' => $data['email'] ?? $user->email,
            'tier' => 'bronze',
            'revenue_share_pct' => 20,
            'status' => 'active',
        ]);
    }

    /**
     * Add a community to a partner's distribution.
     */
    public function addCommunity(SyndicationPartner $partner, array $communityData): PartnerCommunity
    {
        return PartnerCommunity::create([
            'partner_id' => $partner->id,
            'community_id' => $communityData['community_id'] ?? null,
            'platform' => $communityData['platform'],
            'group_name' => $communityData['group_name'],
            'group_url' => $communityData['group_url'] ?? null,
            'member_count' => $communityData['member_count'] ?? 0,
            'status' => 'active',
        ]);
    }

    /**
     * Match paying SMBs to a partner's communities.
     */
    public function matchSponsors(SyndicationPartner $partner): int
    {
        $communityIds = $partner->partnerCommunities()
            ->whereNotNull('community_id')
            ->pluck('community_id');

        if ($communityIds->isEmpty()) {
            return 0;
        }

        $smbs = SMB::whereIn('community_id', $communityIds)
            ->where('do_not_contact', false)
            ->whereNotNull('current_campaign_id')
            ->get();

        $matched = 0;
        foreach ($smbs as $smb) {
            $exists = SponsorPlacement::where('smb_id', $smb->id)
                ->where('partner_id', $partner->id)
                ->where('status', 'active')
                ->exists();

            if ($exists) {
                continue;
            }

            $budgetCents = 5000; // $50 default monthly
            $partnerCut = (int) round($budgetCents * ($partner->revenue_share_pct / 100));

            SponsorPlacement::create([
                'smb_id' => $smb->id,
                'partner_id' => $partner->id,
                'monthly_budget_cents' => $budgetCents,
                'partner_cut_cents' => $partnerCut,
                'status' => 'active',
            ]);
            $matched++;
        }

        return $matched;
    }

    /**
     * Get daily content queue for a partner.
     */
    public function getDailyQueue(SyndicationPartner $partner): array
    {
        $communityIds = $partner->partnerCommunities()
            ->where('status', 'active')
            ->pluck('community_id')
            ->filter();

        $today = now()->toDateString();

        $cards = ContentCard::where('date_for', $today)
            ->whereIn('community_id', $communityIds)
            ->with(['smb'])
            ->get();

        return [
            'date' => $today,
            'cards' => $cards->map(fn (ContentCard $card) => [
                'id' => $card->id,
                'content_type' => $card->content_type,
                'card_mode' => $card->card_mode,
                'caption_text' => $card->caption_text,
                'tracking_url' => $card->tracking_url,
                'content_data' => $card->content_data,
                'sponsor_data' => $card->sponsor_data,
                'smb_name' => $card->smb?->business_name,
                'is_sponsored' => $card->card_mode === 'syndication_sponsored',
            ])->toArray(),
            'total' => $cards->count(),
            'sponsored_count' => $cards->where('card_mode', 'syndication_sponsored')->count(),
        ];
    }

    /**
     * Calculate earnings for a partner over a period.
     */
    public function calculateEarnings(SyndicationPartner $partner, string $period = 'current_month'): array
    {
        $now = Carbon::now();

        [$start, $end] = match ($period) {
            'current_month' => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
            'last_month' => [$now->copy()->subMonth()->startOfMonth(), $now->copy()->subMonth()->endOfMonth()],
            'all_time' => [Carbon::parse('2020-01-01'), $now],
            default => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
        };

        $clicks = ClickTracking::where('partner_id', $partner->id)
            ->whereBetween('clicked_at', [$start, $end])
            ->count();

        $placements = $partner->sponsorPlacements()->where('status', 'active')->get();
        $totalEarnings = 0;

        foreach ($placements as $placement) {
            $placementClicks = ClickTracking::where('partner_id', $partner->id)
                ->where('smb_id', $placement->smb_id)
                ->whereBetween('clicked_at', [$start, $end])
                ->count();

            // Earnings per click = partner_cut / expected clicks per month (assume 100)
            $earningsPerClick = $placement->partner_cut_cents > 0
                ? (int) round($placement->partner_cut_cents / 100)
                : 10; // $0.10 per click default

            $totalEarnings += $placementClicks * $earningsPerClick;
        }

        return [
            'period' => $period,
            'start' => $start->toDateString(),
            'end' => $end->toDateString(),
            'clicks' => $clicks,
            'earnings_cents' => $totalEarnings,
            'earnings_formatted' => '$' . number_format($totalEarnings / 100, 2),
        ];
    }

    /**
     * Update partner tier based on active sponsor count.
     */
    public function updateTier(SyndicationPartner $partner): void
    {
        $activeSponsorCount = $partner->sponsorPlacements()
            ->where('status', 'active')
            ->count();

        [$tier, $share] = match (true) {
            $activeSponsorCount >= 15 => ['platinum', 35],
            $activeSponsorCount >= 8 => ['gold', 30],
            $activeSponsorCount >= 3 => ['silver', 25],
            default => ['bronze', 20],
        };

        $partner->update([
            'tier' => $tier,
            'revenue_share_pct' => $share,
        ]);

        // Update partner_cut_cents on all active placements
        $partner->sponsorPlacements()
            ->where('status', 'active')
            ->each(function (SponsorPlacement $placement) use ($share) {
                $placement->update([
                    'partner_cut_cents' => (int) round($placement->monthly_budget_cents * ($share / 100)),
                ]);
            });
    }

    /**
     * Process payouts for all partners (monthly).
     */
    public function processPayouts(string $period = 'last_month'): array
    {
        $partners = SyndicationPartner::where('status', 'active')->get();
        $results = [];

        foreach ($partners as $partner) {
            $earnings = $this->calculateEarnings($partner, $period);

            if ($earnings['earnings_cents'] > 0) {
                $partner->increment('total_earned', $earnings['earnings_cents']);
                $results[] = [
                    'partner_id' => $partner->id,
                    'partner_name' => $partner->name,
                    'payout_cents' => $earnings['earnings_cents'],
                ];
            }
        }

        Log::info('Syndication payouts processed', ['count' => count($results), 'period' => $period]);

        return $results;
    }
}
