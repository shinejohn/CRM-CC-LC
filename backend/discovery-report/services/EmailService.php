<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    protected string $provider;
    protected ?string $sendgridApiKey;
    protected array $sesConfig;

    public function __construct()
    {
        $this->provider = config('mail.default', 'sendgrid');
        $this->sendgridApiKey = config('services.sendgrid.api_key');
        $this->sesConfig = config('services.ses');
    }

    /**
     * Send email via SendGrid
     */
    public function sendViaSendGrid(string $to, string $subject, string $htmlContent, ?string $textContent = null, array $options = []): ?array
    {
        if (!$this->sendgridApiKey) {
            Log::error('SendGrid API key not configured');
            return null;
        }

        try {
            $payload = [
                'personalizations' => [
                    [
                        'to' => [['email' => $to]],
                        'subject' => $subject,
                    ],
                ],
                'from' => [
                    'email' => $options['from_email'] ?? config('mail.from.address'),
                    'name' => $options['from_name'] ?? config('mail.from.name'),
                ],
                'subject' => $subject,
                'content' => [
                    [
                        'type' => 'text/html',
                        'value' => $htmlContent,
                    ],
                ],
            ];

            if ($textContent) {
                $payload['content'][] = [
                    'type' => 'text/plain',
                    'value' => $textContent,
                ];
            }

            // Add tracking if requested
            if ($options['track_opens'] ?? true) {
                $payload['tracking_settings'] = [
                    'open_tracking' => ['enable' => true],
                    'click_tracking' => ['enable' => true],
                ];
            }

            // Add custom args for webhook tracking
            if (isset($options['campaign_id'])) {
                $payload['custom_args'] = [
                    'campaign_id' => $options['campaign_id'],
                    'recipient_id' => $options['recipient_id'] ?? '',
                ];
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->sendgridApiKey}",
                'Content-Type' => 'application/json',
            ])->post('https://api.sendgrid.com/v3/mail/send', $payload);

            if ($response->successful()) {
                $messageId = $response->header('X-Message-Id');
                return [
                    'success' => true,
                    'message_id' => $messageId,
                    'provider' => 'sendgrid',
                ];
            }

            Log::error('SendGrid API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('SendGrid error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Send email via AWS SES
     */
    public function sendViaSES(string $to, string $subject, string $htmlContent, ?string $textContent = null, array $options = []): ?array
    {
        // SES integration would use AWS SDK
        // For now, fall back to Laravel Mail facade
        try {
            Mail::html($htmlContent, function ($message) use ($to, $subject, $textContent, $options) {
                $message->to($to)
                    ->subject($subject);
                
                if ($textContent) {
                    $message->text($textContent);
                }
            });

            return [
                'success' => true,
                'provider' => 'ses',
            ];
        } catch (\Exception $e) {
            Log::error('SES email error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Send email (auto-selects provider)
     */
    public function send(string $to, string $subject, string $htmlContent, ?string $textContent = null, array $options = []): ?array
    {
        if ($this->provider === 'sendgrid' && $this->sendgridApiKey) {
            return $this->sendViaSendGrid($to, $subject, $htmlContent, $textContent, $options);
        }

        return $this->sendViaSES($to, $subject, $htmlContent, $textContent, $options);
    }

    /**
     * Send bulk emails
     */
    public function sendBulk(array $recipients, string $subject, string $htmlContent, ?string $textContent = null, array $options = []): array
    {
        $results = [];
        
        foreach ($recipients as $recipient) {
            $email = is_array($recipient) ? $recipient['email'] : $recipient;
            $recipientOptions = array_merge($options, is_array($recipient) ? $recipient : []);
            
            $results[] = [
                'email' => $email,
                'result' => $this->send($email, $subject, $htmlContent, $textContent, $recipientOptions),
            ];
        }

        return $results;
    }
}
