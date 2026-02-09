<?php

namespace App\Services\Newsletter;

use App\Contracts\Newsletter\SponsorServiceInterface;
use App\DTOs\Newsletter\SponsorReport;
use App\Models\Newsletter\Newsletter;
use App\Models\Newsletter\NewsletterContentItem;
use App\Models\Newsletter\Sponsorship;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SponsorService implements SponsorServiceInterface
{
    public function getActive(int $communityId, string $type): Collection
    {
        return Sponsorship::where('sponsorship_type', $type)
            ->where(function ($q) use ($communityId) {
                $q->whereNull('community_id')
                  ->orWhere('community_id', $communityId);
            })
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->whereRaw('impressions_delivered < impressions_purchased')
            ->get();
    }
    
    public function selectForPlacement(int $communityId, string $type): ?Sponsorship
    {
        return Sponsorship::where('sponsorship_type', $type)
            ->where(function ($q) use ($communityId) {
                $q->whereNull('community_id')
                  ->orWhere('community_id', $communityId);
            })
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->whereRaw('impressions_delivered < impressions_purchased')
            ->orderByRaw('(impressions_delivered::float / NULLIF(impressions_purchased, 0)) ASC')
            ->first();
    }
    
    public function insertSponsors(array $content, Newsletter $newsletter): array
    {
        $communityId = $newsletter->community_id;
        
        // Header sponsor
        $headerSponsor = $this->selectForPlacement($communityId, 'newsletter_header');
        if ($headerSponsor) {
            $content['header_sponsor'] = [
                'type' => 'sponsor',
                'id' => $headerSponsor->id,
                'sponsor_name' => $headerSponsor->sponsor->name,
                'creative' => $headerSponsor->creative_json,
            ];
        }
        
        // Mid-content sponsor
        $midSponsor = $this->selectForPlacement($communityId, 'newsletter_section');
        if ($midSponsor) {
            $content['sections']['sponsor_spotlight'] = [[
                'type' => 'sponsor',
                'id' => $midSponsor->id,
                'sponsor_name' => $midSponsor->sponsor->name,
                'creative' => $midSponsor->creative_json,
            ]];
        }
        
        // Calculate revenue estimate
        $revenue = 0;
        if ($headerSponsor && $headerSponsor->rate_type === 'cpm') {
            $revenue += $headerSponsor->rate_cents; // Will multiply by impressions later
        }
        if ($midSponsor && $midSponsor->rate_type === 'cpm') {
            $revenue += $midSponsor->rate_cents;
        }
        
        $content['sponsor_revenue_estimate_cpm'] = $revenue;
        
        return $content;
    }
    
    public function recordImpression(int $sponsorshipId, int $count = 1): void
    {
        DB::transaction(function () use ($sponsorshipId, $count) {
            Sponsorship::where('id', $sponsorshipId)
                ->increment('impressions_delivered', $count);
            
            // Check if campaign is now completed
            $sponsorship = Sponsorship::find($sponsorshipId);
            if ($sponsorship && $sponsorship->impressions_delivered >= $sponsorship->impressions_purchased) {
                $sponsorship->update(['status' => 'completed']);
            }
        });
    }
    
    public function recordClick(int $sponsorshipId): void
    {
        Sponsorship::where('id', $sponsorshipId)->increment('click_count');
    }
    
    public function getPerformance(int $sponsorId, Carbon $start, Carbon $end): array
    {
        $sponsorships = Sponsorship::where('sponsor_id', $sponsorId)
            ->where('start_date', '<=', $end)
            ->where('end_date', '>=', $start)
            ->get();
        
        $totalImpressions = $sponsorships->sum('impressions_delivered');
        $totalClicks = $sponsorships->sum('click_count');
        $totalSpend = $sponsorships->sum('total_value_cents');
        
        $report = new SponsorReport(
            sponsorId: $sponsorId,
            period: [$start, $end],
            campaigns: $sponsorships->count(),
            impressions: $totalImpressions,
            clicks: $totalClicks,
            ctr: $totalImpressions > 0 ? ($totalClicks / $totalImpressions) * 100 : 0,
            spend: $totalSpend,
            cpm: $totalImpressions > 0 ? ($totalSpend / $totalImpressions) * 1000 : 0,
            cpc: $totalClicks > 0 ? $totalSpend / $totalClicks : 0,
        );
        
        return $report->toArray();
    }
}



