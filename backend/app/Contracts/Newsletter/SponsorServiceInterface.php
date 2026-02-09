<?php

namespace App\Contracts\Newsletter;

use App\Models\Newsletter\Newsletter;
use App\Models\Newsletter\Sponsorship;
use Illuminate\Support\Collection;
use Carbon\Carbon;

interface SponsorServiceInterface
{
    /**
     * Get active sponsorships for a community and type
     */
    public function getActive(int $communityId, string $type): Collection;
    
    /**
     * Select sponsor for placement (respects inventory)
     */
    public function selectForPlacement(int $communityId, string $type): ?Sponsorship;
    
    /**
     * Record impression delivery
     */
    public function recordImpression(int $sponsorshipId, int $count = 1): void;
    
    /**
     * Record click
     */
    public function recordClick(int $sponsorshipId): void;
    
    /**
     * Get sponsor performance report
     */
    public function getPerformance(int $sponsorId, Carbon $start, Carbon $end): array;
    
    /**
     * Insert sponsors into newsletter content
     */
    public function insertSponsors(array $content, Newsletter $newsletter): array;
}

