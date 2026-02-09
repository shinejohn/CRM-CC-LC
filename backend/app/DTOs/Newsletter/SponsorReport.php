<?php

namespace App\DTOs\Newsletter;

use Carbon\Carbon;

class SponsorReport
{
    public function __construct(
        public int $sponsorId,
        public array $period,
        public int $campaigns,
        public int $impressions,
        public int $clicks,
        public float $ctr,
        public int $spend,
        public float $cpm,
        public float $cpc,
    ) {}

    public function toArray(): array
    {
        return [
            'sponsor_id' => $this->sponsorId,
            'period' => [
                'start' => $this->period[0]->toDateString(),
                'end' => $this->period[1]->toDateString(),
            ],
            'campaigns' => $this->campaigns,
            'impressions' => $this->impressions,
            'clicks' => $this->clicks,
            'ctr' => round($this->ctr, 2),
            'spend' => $this->spend,
            'cpm' => round($this->cpm, 2),
            'cpc' => round($this->cpc, 2),
        ];
    }
}



