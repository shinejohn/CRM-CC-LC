<?php

namespace App\Services\Communication\Gateways;

use App\Contracts\Communication\GatewayInterface;
use App\DTOs\Communication\OutboundMessage;
use App\DTOs\Communication\GatewayResult;
use App\DTOs\Communication\RateStatus;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PostalGateway implements GatewayInterface
{
    private string $apiKey;
    private string $apiUrl;
    private string $serverKey;

    public function __construct()
    {
        $this->apiKey = config('services.postal.api_key');
        $this->apiUrl = config('services.postal.api_url');
        $this->serverKey = config('services.postal.server_key');
    }
    
    public function getName(): string
    {
        return 'postal';
    }
    
    public function isAvailable(): bool
    {
        // Simple health check - could be enhanced
        return !empty($this->apiKey) && !empty($this->apiUrl) && !empty($this->serverKey);
    }
    
    public function send(OutboundMessage $message): GatewayResult
    {
        try {
            $response = Http::withHeaders([
                'X-Server-API-Key' => $this->serverKey,
            ])->post("{$this->apiUrl}/api/v1/send/message", [
                'to' => [$message->to],
                'subject' => $message->subject,
                'html_body' => $message->bodyHtml,
                'plain_body' => $message->body,
                'from' => config('services.postal.from_address'),
                'server_pool' => $message->ipPool ?? 'default',
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                return new GatewayResult(
                    success: true,
                    externalId: $data['message_id'] ?? null,
                );
            }
            
            return new GatewayResult(
                success: false,
                error: $response->body(),
                statusCode: $response->status(),
            );
        } catch (\Exception $e) {
            Log::error('Postal gateway error', [
                'error' => $e->getMessage(),
                'to' => $message->to,
            ]);
            
            return new GatewayResult(
                success: false,
                error: $e->getMessage(),
            );
        }
    }
    
    public function sendBatch(array $messages): array
    {
        $results = [];
        
        foreach ($messages as $message) {
            $results[] = $this->send($message);
        }
        
        return $results;
    }
    
    public function getRateStatus(): RateStatus
    {
        // Postal doesn't expose rate limits via API, return defaults
        return new RateStatus(
            currentPerSecond: 0,
            maxPerSecond: 100,
            currentPerHour: 0,
            maxPerHour: 10000,
            canSend: true,
        );
    }
}
