<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class QueueNextCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $customerId
    ) {}

    public function handle(\App\Contracts\CampaignOrchestratorInterface $orchestrator): void
    {
        $customer = Customer::find($this->customerId);

        if (! $customer) {
            return;
        }

        // Execute today's timeline actions via the orchestrator (email, SMS, phone, stage updates)
        $orchestrator->executeActionsForCustomer($customer);
    }
}
