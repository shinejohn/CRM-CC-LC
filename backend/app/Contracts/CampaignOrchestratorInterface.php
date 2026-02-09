<?php

namespace App\Contracts;

use App\Models\Customer;
use App\Models\CampaignTimeline;
use App\Models\CustomerTimelineProgress;

interface CampaignOrchestratorInterface
{
    /**
     * Start a customer on a campaign timeline.
     */
    public function startTimeline(Customer $customer, CampaignTimeline $timeline): CustomerTimelineProgress;
    
    /**
     * Execute today's actions for a customer.
     */
    public function executeActionsForCustomer(Customer $customer): array;
    
    /**
     * Process all customers due for actions today.
     */
    public function processAllDueCustomers(): array;
    
    /**
     * Pause a customer's timeline.
     */
    public function pauseTimeline(CustomerTimelineProgress $progress): void;
    
    /**
     * Resume a paused timeline.
     */
    public function resumeTimeline(CustomerTimelineProgress $progress): void;
}

