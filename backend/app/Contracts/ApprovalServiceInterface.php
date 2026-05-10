<?php

namespace App\Contracts;

use App\Models\Approval;

interface ApprovalServiceInterface
{
    public function validateToken(string $token): ?array;
    public function generateToken(string $customerId, string $serviceType, string $sourceId): string;

    public function create(array $data): Approval;
    public function process(string $approvalId): void;

    public function getUpsellOffers(string $serviceType): array;
    public function recordUpsellOffer(string $approvalId, string $upsellType): void;
    public function acceptUpsell(string $approvalId, string $upsellType): Approval;

    public function startProvisioning(string $approvalId): void;
    public function completeProvisioning(string $approvalId, array $resultData): void;
    public function failProvisioning(string $approvalId, string $reason): void;
}

