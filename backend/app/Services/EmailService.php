<?php

namespace App\Services;

use App\Models\EmailSuppression;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    protected string $provider;
    protected string $fallbackProvider;
    protected ?string $sendgridApiKey;
    protected array $sesConfig;
    protected array $postalConfig;

    public function __construct()
    {
        $this->provider = config('services.email_gateway.provider', config('mail.default', 'sendgrid'));
        $this->fallbackProvider = config('services.email_gateway.fallback_provider', 'ses');
        $this->sendgridApiKey = config('services.sendgrid.api_key');
        $this->sesConfig = config('services.ses');
        $this->postalConfig = config('services.postal', []);
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
     * Send email via Postal
     */
    public function sendViaPostal(string $to, string $subject, string $htmlContent, ?string $textContent = null, array $options = []): ?array
    {
        $apiUrl = $this->postalConfig['api_url'] ?? null;
        $serverKey = $this->postalConfig['server_key'] ?? null;

        if (!$apiUrl || !$serverKey) {
            Log::error('Postal API not configured');
            return null;
        }

        try {
            $payload = [
                'to' => [$to],
                'from' => $options['from_email'] ?? config('mail.from.address'),
                'sender' => $options['from_email'] ?? config('mail.from.address'),
                'subject' => $subject,
                'html_body' => $htmlContent,
                'plain_body' => $textContent ?? strip_tags($htmlContent),
            ];

            if (!empty($options['tag'])) {
                $payload['tag'] = $options['tag'];
            }

            $ipPool = $options['ip_pool'] ?? ($this->postalConfig['default_ip_pool'] ?? null);
            if (!empty($ipPool)) {
                $payload['ip_pool'] = $ipPool;
            }

            $headers = [];
            if (!empty($options['campaign_id'])) {
                $headers['X-Fibonacco-Campaign-ID'] = (string) $options['campaign_id'];
            }
            if (!empty($options['recipient_id'])) {
                $headers['X-Fibonacco-Recipient-ID'] = (string) $options['recipient_id'];
            }
            if (!empty($headers)) {
                $payload['headers'] = $headers;
            }

            $response = Http::withHeaders([
                'X-Server-API-Key' => $serverKey,
                'Content-Type' => 'application/json',
            ])->post(rtrim($apiUrl, '/') . '/api/v1/send/message', $payload);

            if ($response->successful()) {
                $data = $response->json();
                $messageId = $data['data']['message_id'] ?? $data['message_id'] ?? null;

                return [
                    'success' => true,
                    'message_id' => $messageId,
                    'provider' => 'postal',
                    'ip_pool' => $ipPool ?? null,
                ];
            }

            Log::error('Postal API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'provider' => 'postal',
                'error' => $response->json('message') ?? 'Postal API error',
            ];
        } catch (\Exception $e) {
            Log::error('Postal error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'provider' => 'postal',
                'error' => $e->getMessage(),
            ];
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
        if (EmailSuppression::where('email', $to)->exists()) {
            return [
                'success' => false,
                'provider' => 'suppression',
                'error' => 'Recipient is suppressed',
            ];
        }

        if ($this->provider === 'postal') {
            $result = $this->sendViaPostal($to, $subject, $htmlContent, $textContent, $options);
            if ($result && ($result['success'] ?? false)) {
                return $result;
            }
        }

        if ($this->provider === 'sendgrid' && $this->sendgridApiKey) {
            $result = $this->sendViaSendGrid($to, $subject, $htmlContent, $textContent, $options);
            if ($result && ($result['success'] ?? false)) {
                return $result;
            }
        }

        return match ($this->fallbackProvider) {
            'sendgrid' => $this->sendViaSendGrid($to, $subject, $htmlContent, $textContent, $options),
            default => $this->sendViaSES($to, $subject, $htmlContent, $textContent, $options),
        };
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
