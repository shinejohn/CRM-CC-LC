<?php

namespace App\Events\Newsletter;

use App\Models\Newsletter\Sponsorship;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SponsorshipCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Sponsorship $sponsorship
    ) {}
}



