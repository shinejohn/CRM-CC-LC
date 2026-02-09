<?php

namespace App\Contracts;

use App\Models\Approval;

interface ApprovalServiceInterface
{
    public function validateToken(string $token): ?array;
    public function generateToken(string $customerId, string $serviceType, string $sourceId): string;

    public function create(array $data): Approval;
    public function process(int $approvalId): void;

    public function getUpsellOffers(string $serviceType): array;
    public function recordUpsellOffer(int $approvalId, string $upsellType): void;
    public function acceptUpsell(int $approvalId, string $upsellType): Approval;

    public function startProvisioning(int $approvalId): void;
    public function completeProvisioning(int $approvalId, array $resultData): void;
    public function failProvisioning(int $approvalId, string $reason): void;
}

