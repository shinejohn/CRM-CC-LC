<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Support\Facades\Log;

class ApprovalTokenService
{
    public function generateToken(string $customerId, string $serviceType, string $sourceId): string
    {
        $payload = [
            'customer_id' => $customerId,
            'service_type' => $serviceType,
            'source_id' => $sourceId,
            'expires_at' => now()->addDays(7)->timestamp,
        ];

        return encrypt(json_encode($payload));
    }

    public function validateToken(string $token): ?array
    {
        try {
            $payload = json_decode(decrypt($token), true);

            if (!is_array($payload)) {
                return null;
            }

            if (($payload['expires_at'] ?? 0) < now()->timestamp) {
                return null;
            }

            if (empty($payload['customer_id']) || !Customer::find($payload['customer_id'])) {
                return null;
            }

            return $payload;
        } catch (\Throwable $e) {
            Log::warning('Approval token validation failed', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }
}

