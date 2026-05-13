<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\TTSProvider;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class OpenAITTSService implements TTSProvider
{
    private string $apiKey;
    private string $model;
    private string $defaultVoice;

    public function __construct()
    {
        $this->apiKey = config('services.tts.openai.api_key') ?: config('services.openai.api_key');
        $this->model = config('services.tts.openai.model', 'tts-1-hd');
        $this->defaultVoice = config('services.tts.openai.voice', 'nova');
    }

    public function generateAudio(string $text, ?string $voiceId = null): ?string
    {
        if (! $this->apiKey) {
            Log::warning('OpenAI API key not configured for TTS');

            return null;
        }

        $voice = $voiceId ?? $this->defaultVoice;

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
            ])
                ->timeout(60)
                ->post('https://api.openai.com/v1/audio/speech', [
                    'model' => $this->model,
                    'input' => $text,
                    'voice' => $voice,
                    'response_format' => 'mp3',
                ]);

            if ($response->successful()) {
                return $response->body();
            }

            Log::error('OpenAI TTS failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('OpenAI TTS error', ['error' => $e->getMessage()]);

            return null;
        }
    }
}
