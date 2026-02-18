<?php

namespace App\Services\Communication\Gateways;

use App\Contracts\Communication\GatewayInterface;
use App\DTOs\Communication\OutboundMessage;
use App\DTOs\Communication\GatewayResult;
use App\DTOs\Communication\RateStatus;
use Aws\Ses\SesClient;
use Illuminate\Support\Facades\Log;

class SesGateway implements GatewayInterface
{
    private ?SesClient $client = null;

    public function __construct()
    {
        if (config('services.ses.key') && config('services.ses.secret')) {
            $this->client = new SesClient([
                'version' => 'latest',
                'region' => config('services.ses.region', 'us-east-1'),
                'credentials' => [
                    'key' => config('services.ses.key'),
                    'secret' => config('services.ses.secret'),
                ],
            ]);
        }
    }
    
    public function getName(): string
    {
        return 'ses';
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
                error: 'SES client not configured',
            );
        }
        
        try {
            $result = $this->client->sendEmail([
                'Source' => config('services.ses.from_address'),
                'Destination' => [
                    'ToAddresses' => [$message->to],
                ],
                'Message' => [
                    'Subject' => [
                        'Data' => $message->subject ?? '',
                        'Charset' => 'UTF-8',
                    ],
                    'Body' => [
                        'Html' => [
                            'Data' => $message->bodyHtml ?? $message->body ?? '',
                            'Charset' => 'UTF-8',
                        ],
                        'Text' => [
                            'Data' => $message->body ?? '',
                            'Charset' => 'UTF-8',
                        ],
                    ],
                ],
            ]);
            
            return new GatewayResult(
                success: true,
                externalId: $result->get('MessageId'),
            );
        } catch (\Exception $e) {
            Log::error('SES gateway error', [
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
        // SES rate limits vary by account, return conservative defaults
        return new RateStatus(
            currentPerSecond: 0,
            maxPerSecond: 14, // SES default sending rate
            currentPerHour: 0,
            maxPerHour: 1000,
            canSend: true,
        );
    }
}
