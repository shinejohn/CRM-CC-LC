<?php

namespace App\Events;

use App\Models\Customer;
use App\Models\CampaignLandingPage;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FormSubmitted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public CampaignLandingPage $landingPage,
        public array $formData,
        public ?string $utmSource = null,
        public ?string $utmCampaign = null
    ) {}
}

