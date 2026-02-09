<?php

namespace App\Events;

use App\Models\Customer;
use App\Models\CampaignSend;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmailNotOpened
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public CampaignSend $campaignSend,
        public int $hoursSinceSent
    ) {}
}

