<?php

namespace App\Events;

use App\Models\Customer;
use App\Enums\PipelineStage;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PipelineStageChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public ?PipelineStage $previousStage,
        public PipelineStage $newStage,
        public string $trigger // What caused the change
    ) {}
}

