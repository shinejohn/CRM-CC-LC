<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Customer;
use App\Models\EmailSuppression;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

final class EmailService
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
        if (! $this->sendgridApiKey) {
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

            // Custom headers (List-Unsubscribe, etc.)
            if (! empty($options['headers'])) {
                $payload['headers'] = $options['headers'];
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

        if (! $apiUrl || ! $serverKey) {
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

            if (! empty($options['tag'])) {
                $payload['tag'] = $options['tag'];
            }

            $ipPool = $options['ip_pool'] ?? ($this->postalConfig['default_ip_pool'] ?? null);
            if (! empty($ipPool)) {
                $payload['ip_pool'] = $ipPool;
            }

            $headers = $options['headers'] ?? [];
            if (! empty($options['campaign_id'])) {
                $headers['X-Fibonacco-Campaign-ID'] = (string) $options['campaign_id'];
            }
            if (! empty($options['recipient_id'])) {
                $headers['X-Fibonacco-Recipient-ID'] = (string) $options['recipient_id'];
            }
            if (! empty($headers)) {
                $payload['headers'] = $headers;
            }

            $response = Http::withHeaders([
                'X-Server-API-Key' => $serverKey,
                'Content-Type' => 'application/json',
            ])->post(rtrim($apiUrl, '/').'/api/v1/send/message', $payload);

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
            Mail::html($htmlContent, function ($message) use ($to, $subject, $textContent) {
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
        if (EmailSuppression::where('email_address', $to)->exists()) {
            return [
                'success' => false,
                'provider' => 'suppression',
                'error' => 'Recipient is suppressed',
            ];
        }

        // Also check ZeroBounce / unsubscribe suppression on the customer record.
        // Bypass tenant global scope: send() is called from queued jobs with no auth context.
        $customer = Customer::withoutGlobalScopes()
            ->where(function ($q) use ($to) {
                $q->where('email', $to)->orWhere('primary_email', $to);
            })
            ->first();
        if ($customer && $customer->email_suppressed) {
            return [
                'success' => false,
                'provider' => 'suppression',
                'error' => "Suppressed: {$customer->email_suppressed_reason}",
            ];
        }

        // Resolve a signed, tamper-proof unsubscribe URL and guarantee that the
        // visible footer + List-Unsubscribe headers are present on EVERY email
        // (CAN-SPAM / Gmail-Yahoo bulk-sender compliance), regardless of how the
        // caller rendered the body.
        $unsubscribeUrl = $this->resolveUnsubscribeUrl($options, $customer);
        if ($unsubscribeUrl) {
            [$htmlContent, $textContent] = $this->injectUnsubscribeFooter($htmlContent, $textContent, $unsubscribeUrl);
            $options['headers'] = array_merge(
                $options['headers'] ?? [],
                $this->unsubscribeHeaders($unsubscribeUrl)
            );
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

    /**
     * Resolve the signed unsubscribe URL for this send. Priority:
     *   1. An explicit unsubscribe_url passed in options.
     *   2. A customer_id (or customer) passed in options.
     *   3. The customer matched by recipient email address.
     */
    protected function resolveUnsubscribeUrl(array $options, ?Customer $customer): ?string
    {
        if (! empty($options['unsubscribe_url'])) {
            return (string) $options['unsubscribe_url'];
        }

        $customerOpt = $options['customer'] ?? null;
        $customerId = $options['customer_id']
            ?? ($customerOpt instanceof Customer ? $customerOpt->id : $customerOpt)
            ?? $customer?->id;

        if (! $customerId) {
            return null;
        }

        return URL::signedRoute('public.unsubscribe', ['customer' => (string) $customerId]);
    }

    /**
     * Ensure a visible unsubscribe footer is present in both the HTML and text
     * bodies. Mirrors EmailTemplate::render() so the styling stays consistent.
     *
     * @return array{0: string, 1: ?string}
     */
    protected function injectUnsubscribeFooter(string $htmlContent, ?string $textContent, string $unsubscribeUrl): array
    {
        if (! str_contains($htmlContent, 'unsubscribe') && ! str_contains($htmlContent, $unsubscribeUrl)) {
            $htmlContent .= '<p style="margin-top:24px;font-size:12px;color:#999;text-align:center;">You are receiving this because your business is listed in your community\'s Day.News directory. <a href="'.$unsubscribeUrl.'" style="color:#999;">Unsubscribe</a></p>';
        }

        $textContent = $textContent ?? strip_tags($htmlContent);
        if (! str_contains($textContent, 'Unsubscribe:') && ! str_contains($textContent, $unsubscribeUrl)) {
            $textContent .= "\n\n---\nUnsubscribe: ".$unsubscribeUrl;
        }

        return [$htmlContent, $textContent];
    }

    /**
     * Build the RFC 8058 one-click List-Unsubscribe headers.
     *
     * @return array<string, string>
     */
    protected function unsubscribeHeaders(string $unsubscribeUrl): array
    {
        $mailto = (string) config('mail.unsubscribe_mailto');

        return [
            'List-Unsubscribe' => "<{$unsubscribeUrl}>, <mailto:{$mailto}>",
            'List-Unsubscribe-Post' => 'List-Unsubscribe=One-Click',
        ];
    }
}
