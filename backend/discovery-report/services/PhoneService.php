<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PhoneService
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
     * Make a phone call via Twilio
     */
    public function makeCall(string $to, string $script, array $options = []): ?array
    {
        if (!$this->accountSid || !$this->authToken) {
            Log::error('Twilio credentials not configured');
            return null;
        }

        try {
            // Twilio TwiML URL or script
            $twimlUrl = $options['twiml_url'] ?? null;
            $statusCallback = $options['status_callback'] ?? null;

            $payload = [
                'To' => $to,
                'From' => $this->fromPhone,
            ];

            if ($twimlUrl) {
                $payload['Url'] = $twimlUrl;
            } else {
                // Generate TwiML for script
                $payload['Twiml'] = $this->generateTwiML($script, $options);
            }

            if ($statusCallback) {
                $payload['StatusCallback'] = $statusCallback;
                $payload['StatusCallbackEvent'] = ['initiated', 'ringing', 'answered', 'completed'];
            }

            $response = Http::withBasicAuth($this->accountSid, $this->authToken)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$this->accountSid}/Calls.json", $payload);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'call_sid' => $data['sid'] ?? null,
                    'status' => $data['status'] ?? null,
                    'provider' => 'twilio',
                ];
            }

            Log::error('Twilio API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Twilio call error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Generate TwiML for call script
     */
    private function generateTwiML(string $script, array $options = []): string
    {
        // Simple TwiML generation - would need TTS for full implementation
        $twiml = '<?xml version="1.0" encoding="UTF-8"?>';
        $twiml .= '<Response>';
        
        if ($options['use_tts'] ?? false) {
            // Use text-to-speech
            $twiml .= '<Say voice="' . ($options['voice'] ?? 'alice') . '">' . htmlspecialchars($script) . '</Say>';
        } else {
            // Use play (for pre-recorded audio)
            if (isset($options['audio_url'])) {
                $twiml .= '<Play>' . htmlspecialchars($options['audio_url']) . '</Play>';
            } else {
                // Fallback to Say
                $twiml .= '<Say voice="alice">' . htmlspecialchars($script) . '</Say>';
            }
        }

        // Add voicemail handling
        if ($options['voicemail_enabled'] ?? true) {
            $twiml .= '<Record timeout="30" maxLength="60" transcribe="true" />';
        }

        $twiml .= '</Response>';
        
        return $twiml;
    }

    /**
     * Get call status
     */
    public function getCallStatus(string $callSid): ?array
    {
        if (!$this->accountSid || !$this->authToken) {
            return null;
        }

        try {
            $response = Http::withBasicAuth($this->accountSid, $this->authToken)
                ->get("https://api.twilio.com/2010-04-01/Accounts/{$this->accountSid}/Calls/{$callSid}.json");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'status' => $data['status'] ?? null,
                    'duration' => $data['duration'] ?? null,
                    'direction' => $data['direction'] ?? null,
                ];
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Twilio get call status error', ['error' => $e->getMessage()]);
            return null;
        }
    }
}
