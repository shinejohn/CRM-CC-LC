<?php

namespace App\Services\Communication\Gateways;

use App\Contracts\Communication\GatewayInterface;
use App\DTOs\Communication\OutboundMessage;
use App\DTOs\Communication\GatewayResult;
use App\DTOs\Communication\RateStatus;
use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class TwilioGateway implements GatewayInterface
{
    private ?Client $client = null;

    public function __construct()
    {
        $accountSid = config('services.twilio.account_sid');
        $authToken = config('services.twilio.auth_token');
        
        if ($accountSid && $authToken) {
            $this->client = new Client($accountSid, $authToken);
        }
    }
    
    public function getName(): string
    {
        return 'twilio';
    }
    
    public function isAvailable(): bool
    {
        return $this->client !== null;
    }
    
    public function send(OutboundMessage $message): GatewayResult
    {
        if (!$this->client) {
            return new GatewayResult(
                success: false,
                error: 'Twilio client not configured',
            );
        }
        
        try {
            $twilioMessage = $this->client->messages->create(
                $message->to,
                [
                    'from' => config('services.twilio.from_number'),
                    'body' => $message->body ?? '',
                ]
            );
            
            return new GatewayResult(
                success: true,
                externalId: $twilioMessage->sid,
            );
        } catch (\Exception $e) {
            Log::error('Twilio gateway error', [
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
        // Twilio rate limits vary by account
        return new RateStatus(
            currentPerSecond: 0,
            maxPerSecond: 1, // Conservative default
            currentPerHour: 0,
            maxPerHour: 1000,
            canSend: true,
        );
    }
}
