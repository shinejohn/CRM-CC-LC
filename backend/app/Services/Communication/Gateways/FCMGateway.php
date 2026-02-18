<?php

namespace App\Services\Communication\Gateways;

use App\Contracts\Communication\GatewayInterface;
use App\DTOs\Communication\OutboundMessage;
use App\DTOs\Communication\GatewayResult;
use App\DTOs\Communication\RateStatus;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FCMGateway implements GatewayInterface
{
    private string $serverKey;

    public function __construct()
    {
        $this->serverKey = config('services.fcm.server_key');
    }
    
    public function getName(): string
    {
        return 'firebase';
    }
    
    public function isAvailable(): bool
    {
        return !empty($this->serverKey);
    }
    
    public function send(OutboundMessage $message): GatewayResult
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "key={$this->serverKey}",
                'Content-Type' => 'application/json',
            ])->post('https://fcm.googleapis.com/fcm/send', [
                'to' => $message->to,
                'notification' => [
                    'title' => $message->subject,
                    'body' => $message->body,
                ],
                'data' => $message->metadata,
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
            Log::error('FCM gateway error', [
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
        // FCM supports batch sending via sendAll
        try {
            $registrationIds = array_map(fn($m) => $m->to, $messages);
            
            $response = Http::withHeaders([
                'Authorization' => "key={$this->serverKey}",
                'Content-Type' => 'application/json',
            ])->post('https://fcm.googleapis.com/fcm/send', [
                'registration_ids' => $registrationIds,
                'notification' => [
                    'title' => $messages[0]->subject ?? '',
                    'body' => $messages[0]->body ?? '',
                ],
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                $results = [];
                foreach ($data['results'] ?? [] as $result) {
                    $results[] = new GatewayResult(
                        success: isset($result['message_id']),
                        externalId: $result['message_id'] ?? null,
                        error: $result['error'] ?? null,
                    );
                }
                return $results;
            }
        } catch (\Exception $e) {
            Log::error('FCM batch error', ['error' => $e->getMessage()]);
        }
        
        // Fallback to individual sends
        $results = [];
        foreach ($messages as $message) {
            $results[] = $this->send($message);
        }
        
        return $results;
    }
    
    public function getRateStatus(): RateStatus
    {
        return new RateStatus(
            currentPerSecond: 0,
            maxPerSecond: 1000,
            currentPerHour: 0,
            maxPerHour: 1000000,
            canSend: true,
        );
    }
}
