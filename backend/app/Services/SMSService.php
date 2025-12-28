<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SMSService
{
    protected string $accountSid;
    protected string $authToken;
    protected string $fromPhone;

    public function __construct()
    {
        $this->accountSid = config('services.twilio.account_sid');
        $this->authToken = config('services.twilio.auth_token');
        $this->fromPhone = config('services.twilio.from_phone');
    }

    /**
     * Send SMS via Twilio
     */
    public function send(string $to, string $message, array $options = []): ?array
    {
        if (!$this->accountSid || !$this->authToken) {
            Log::error('Twilio credentials not configured');
            return null;
        }

        try {
            $payload = [
                'To' => $to,
                'From' => $this->fromPhone,
                'Body' => $message,
            ];

            // Add status callback for delivery tracking
            if (isset($options['status_callback'])) {
                $payload['StatusCallback'] = $options['status_callback'];
            }

            // Add custom parameters for tracking
            if (isset($options['campaign_id'])) {
                $payload['StatusCallback'] = $payload['StatusCallback'] ?? $options['status_callback'] ?? '';
                // Store in webhook data via status callback
            }

            $response = Http::withBasicAuth($this->accountSid, $this->authToken)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$this->accountSid}/Messages.json", $payload);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'message_sid' => $data['sid'] ?? null,
                    'status' => $data['status'] ?? null,
                    'provider' => 'twilio',
                ];
            }

            Log::error('Twilio SMS API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Twilio SMS error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Send bulk SMS
     */
    public function sendBulk(array $recipients, string $message, array $options = []): array
    {
        $results = [];
        
        foreach ($recipients as $recipient) {
            $phone = is_array($recipient) ? $recipient['phone'] : $recipient;
            $recipientOptions = array_merge($options, is_array($recipient) ? $recipient : []);
            
            $results[] = [
                'phone' => $phone,
                'result' => $this->send($phone, $message, $recipientOptions),
            ];
        }

        return $results;
    }

    /**
     * Get message status
     */
    public function getMessageStatus(string $messageSid): ?array
    {
        if (!$this->accountSid || !$this->authToken) {
            return null;
        }

        try {
            $response = Http::withBasicAuth($this->accountSid, $this->authToken)
                ->get("https://api.twilio.com/2010-04-01/Accounts/{$this->accountSid}/Messages/{$messageSid}.json");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'status' => $data['status'] ?? null,
                    'date_sent' => $data['date_sent'] ?? null,
                    'direction' => $data['direction'] ?? null,
                ];
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Twilio get message status error', ['error' => $e->getMessage()]);
            return null;
        }
    }
}
