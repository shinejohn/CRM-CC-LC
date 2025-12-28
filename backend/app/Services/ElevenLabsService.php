<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ElevenLabsService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://api.elevenlabs.io/v1';

    public function __construct()
    {
        $this->apiKey = config('services.elevenlabs.api_key');
    }

    /**
     * Generate TTS audio
     */
    public function generateAudio(string $text, ?string $voiceId = null): ?string
    {
        $voiceId = $voiceId ?? config('services.elevenlabs.default_voice_id');
        
        try {
            $response = Http::withHeaders([
                'xi-api-key' => $this->apiKey,
            ])->post("{$this->baseUrl}/text-to-speech/{$voiceId}", [
                'text' => $text,
                'model_id' => 'eleven_monolingual_v1',
                'voice_settings' => [
                    'stability' => 0.5,
                    'similarity_boost' => 0.75,
                ],
            ]);

            if ($response->successful()) {
                return $response->body();
            }

            Log::error('ElevenLabs TTS failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('ElevenLabs TTS error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * List available voices
     */
    public function getVoices(): array
    {
        try {
            $response = Http::withHeaders([
                'xi-api-key' => $this->apiKey,
            ])->get("{$this->baseUrl}/voices");

            if ($response->successful()) {
                return $response->json('voices', []);
            }

            return [];
        } catch (\Exception $e) {
            Log::error('ElevenLabs get voices error', ['error' => $e->getMessage()]);
            return [];
        }
    }
}






