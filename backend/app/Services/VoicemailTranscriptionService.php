<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class VoicemailTranscriptionService
{
    protected string $openaiApiKey;

    public function __construct()
    {
        $this->openaiApiKey = (string) config('services.openai.api_key', '');
    }

    /**
     * Download voicemail recording from Twilio URL
     */
    public function downloadRecording(string $recordingUrl, string $accountSid, string $authToken): ?string
    {
        try {
            // Twilio recording URLs require authentication
            $response = Http::withBasicAuth($accountSid, $authToken)
                ->get($recordingUrl . '.mp3'); // Twilio recordings are typically .mp3

            if (!$response->successful()) {
                // Try .wav format
                $response = Http::withBasicAuth($accountSid, $authToken)
                    ->get($recordingUrl . '.wav');
            }

            if (!$response->successful()) {
                Log::error('Failed to download voicemail recording', [
                    'url' => $recordingUrl,
                    'status' => $response->status(),
                ]);
                return null;
            }

            // Store temporarily
            $filename = 'voicemails/' . uniqid('vm_', true) . '.mp3';
            Storage::disk('local')->put($filename, $response->body());

            $fullPath = Storage::disk('local')->path($filename);

            Log::info('Voicemail recording downloaded', [
                'url' => $recordingUrl,
                'path' => $fullPath,
                'size' => filesize($fullPath),
            ]);

            return $fullPath;

        } catch (\Exception $e) {
            Log::error('Error downloading voicemail recording', [
                'url' => $recordingUrl,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Transcribe audio file using OpenAI Whisper API
     */
    public function transcribe(string $audioFilePath): ?array
    {
        if (!$this->openaiApiKey) {
            Log::error('OpenAI API key not configured');
            return null;
        }

        if (!file_exists($audioFilePath)) {
            Log::error('Audio file not found', ['path' => $audioFilePath]);
            return null;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
            ])->attach(
                    'file',
                    file_get_contents($audioFilePath),
                    basename($audioFilePath)
                )->post('https://api.openai.com/v1/audio/transcriptions', [
                        'model' => 'whisper-1',
                        'language' => 'en', // Optional: specify language
                        'response_format' => 'verbose_json', // Get detailed response
                    ]);

            if (!$response->successful()) {
                Log::error('OpenAI Whisper API failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return null;
            }

            $data = $response->json();

            Log::info('Voicemail transcribed successfully', [
                'text' => $data['text'] ?? null,
                'duration' => $data['duration'] ?? null,
            ]);

            return [
                'text' => $data['text'] ?? '',
                'language' => $data['language'] ?? 'en',
                'duration' => $data['duration'] ?? null,
                'segments' => $data['segments'] ?? [],
            ];

        } catch (\Exception $e) {
            Log::error('Error transcribing voicemail', [
                'path' => $audioFilePath,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Analyze transcription for urgency, intent, and action items
     */
    public function analyzeTranscription(string $transcription): array
    {
        $urgency = $this->detectUrgency($transcription);
        $intent = $this->detectIntent($transcription);
        $actionItems = $this->extractActionItems($transcription);

        return [
            'urgency' => $urgency,
            'intent' => $intent,
            'action_items' => $actionItems,
        ];
    }

    /**
     * Detect urgency level from transcription
     */
    protected function detectUrgency(string $transcription): string
    {
        $text = strtolower($transcription);

        $highUrgencyKeywords = [
            'urgent',
            'asap',
            'immediately',
            'emergency',
            'critical',
            'important',
            'right away',
            'now',
            'today',
            'hurry',
            'problem',
            'issue',
            'broken',
            'not working',
            'error'
        ];

        $mediumUrgencyKeywords = [
            'soon',
            'when you can',
            'at your convenience',
            'follow up',
            'call back',
            'return call',
            'get back to me'
        ];

        foreach ($highUrgencyKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return 'high';
            }
        }

        foreach ($mediumUrgencyKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return 'medium';
            }
        }

        return 'low';
    }

    /**
     * Detect intent from transcription
     */
    protected function detectIntent(string $transcription): string
    {
        $text = strtolower($transcription);

        $intentPatterns = [
            'callback_request' => ['call back', 'return call', 'call me', 'phone me', 'reach me'],
            'question' => ['?', 'what', 'how', 'when', 'where', 'why', 'can you', 'could you'],
            'complaint' => ['problem', 'issue', 'broken', 'not working', 'disappointed', 'unhappy'],
            'appointment' => ['schedule', 'meeting', 'appointment', 'book', 'calendar', 'available'],
            'information_request' => ['need', 'want', 'looking for', 'tell me', 'information'],
        ];

        foreach ($intentPatterns as $intent => $patterns) {
            foreach ($patterns as $pattern) {
                if (str_contains($text, $pattern)) {
                    return $intent;
                }
            }
        }

        return 'general';
    }

    /**
     * Extract action items from transcription
     */
    protected function extractActionItems(string $transcription): array
    {
        $actionItems = [];
        $text = strtolower($transcription);

        // Look for action verbs
        $actionPatterns = [
            'call' => ['call', 'phone', 'reach'],
            'email' => ['email', 'send', 'reply'],
            'schedule' => ['schedule', 'book', 'appointment'],
            'follow_up' => ['follow up', 'check', 'verify'],
        ];

        foreach ($actionPatterns as $action => $patterns) {
            foreach ($patterns as $pattern) {
                if (str_contains($text, $pattern)) {
                    $actionItems[] = $action;
                    break;
                }
            }
        }

        return array_unique($actionItems);
    }

    /**
     * Clean up temporary audio file
     */
    public function cleanup(string $audioFilePath): void
    {
        try {
            if (file_exists($audioFilePath)) {
                unlink($audioFilePath);
                Log::info('Cleaned up temporary voicemail file', ['path' => $audioFilePath]);
            }
        } catch (\Exception $e) {
            Log::warning('Failed to cleanup voicemail file', [
                'path' => $audioFilePath,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

