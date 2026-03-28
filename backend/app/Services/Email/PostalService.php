<?php

declare(strict_types=1);

namespace App\Services\Email;

use App\Models\EmailMessage;
use Exception;
use Illuminate\Support\Facades\Http;

final class PostalService
{
    /**
     * Send an email message via Postal's HTTP API.
     */
    public function send(EmailMessage $message): array
    {
        $pool = $message->pool;
        if (! $pool || ! $pool->api_url || ! $pool->api_key) {
            throw new Exception('Email pool configuration missing for Postal.');
        }

        $payload = [
            'to' => [$message->to_address],
            'from' => $message->sender->email_address,
            'subject' => $message->subject,
            'plain_body' => $message->payload_log['plain_body'] ?? strip_tags($message->payload_log['html_body'] ?? ''),
            'html_body' => $message->payload_log['html_body'] ?? '',
        ];

        // Attach custom ID to track webhooks back to this message
        if (isset($message->id)) {
            $payload['headers'] = [
                'X-Fibonacco-Message-ID' => $message->id,
            ];
        }

        $response = Http::withHeaders([
            'X-Server-API-Key' => $pool->api_key,
        ])
            ->timeout(15)
            ->post(rtrim($pool->api_url, '/').'/api/v1/send/message', $payload);

        if ($response->failed()) {
            throw new Exception('Postal API Error: '.$response->body());
        }

        return $response->json();
    }
}
