<?php

namespace App\Services\Newsletter;

use App\Services\EmailService;
use Illuminate\Support\Facades\Log;

/**
 * Adapter to bridge Newsletter Engine with EmailService (Module 0B equivalent)
 * This wraps EmailService to provide the interface expected by NewsletterService
 */
class MessageServiceAdapter
{
    public function __construct(
        private EmailService $emailService
    ) {}

    /**
     * Send bulk messages (newsletter)
     * 
     * @param array $recipients Array of recipient data: ['id' => int, 'type' => string, 'address' => string, 'data' => array]
     * @param string $subject Email subject
     * @param string $htmlContent HTML content
     * @param array $options Additional options
     * @return array ['queued' => int, 'suppressed' => int]
     */
    public function sendBulk(array $recipients, string $subject, string $htmlContent, array $options = []): array
    {
        $queued = 0;
        $suppressed = 0;
        
        foreach ($recipients as $recipient) {
            $email = $recipient['address'] ?? $recipient['email'] ?? null;
            if (!$email) {
                continue;
            }
            
            $result = $this->emailService->send(
                $email,
                $subject,
                $htmlContent,
                strip_tags($htmlContent),
                array_merge($options, [
                    'campaign_id' => $options['sourceId'] ?? null,
                    'recipient_id' => $recipient['id'] ?? null,
                ])
            );
            
            if ($result && ($result['success'] ?? false)) {
                $queued++;
            } elseif (isset($result['provider']) && $result['provider'] === 'suppression') {
                $suppressed++;
            }
        }
        
        return [
            'queued' => $queued,
            'suppressed' => $suppressed,
        ];
    }
}



