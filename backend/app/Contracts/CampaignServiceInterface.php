<?php

namespace App\Contracts;

use App\Models\Campaign;
use App\Models\CampaignSend;
use App\Models\Customer;

interface CampaignServiceInterface
{
    public function getCampaign(string $id): ?Campaign;
    public function getNextCampaignForCustomer(Customer $customer): ?Campaign;
    public function getCampaignForDay(int $day): ?Campaign;

    public function queueSend(int $customerId, string $campaignId, ?\DateTime $scheduledFor = null): CampaignSend;
    public function processSend(int $campaignSendId): void;
    public function recordEmailEvent(int $campaignSendId, string $eventType, array $data): void;

    public function shouldTriggerRVM(int $campaignSendId): bool;
    public function triggerRVM(int $campaignSendId): void;
    public function processRVMDrop(int $rvmDropId): void;
}

