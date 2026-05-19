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
    private string $baseUrl;

    public function __construct()
    {
        $provider = config('services.tts.default_provider', 'openai');

        if ($provider === 'openrouter') {
            $this->apiKey = config('services.tts.openrouter.api_key') ?: config('services.openrouter.api_key');
            $this->model = config('services.tts.openrouter.model', 'openai/gpt-4o-mini-tts');
            $this->defaultVoice = config('services.tts.openrouter.voice', 'nova');
            $this->baseUrl = 'https://openrouter.ai/api/v1/audio/speech';
        } else {
            $this->apiKey = config('services.tts.openai.api_key') ?: config('services.openai.api_key');
            $this->model = config('services.tts.openai.model', 'tts-1-hd');
            $this->defaultVoice = config('services.tts.openai.voice', 'nova');
            $this->baseUrl = 'https://api.openai.com/v1/audio/speech';
        }
    }

    public function generateAudio(string $text, ?string $voiceId = null): ?string
    {
        if (! $this->apiKey) {
            Log::warning('TTS API key not configured', ['base_url' => $this->baseUrl]);

            return null;
        }

        $voice = $voiceId ?? $this->defaultVoice;

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
            ])
                ->timeout(60)
                ->post($this->baseUrl, [
                    'model' => $this->model,
                    'input' => $text,
                    'voice' => $voice,
                    'response_format' => 'mp3',
                ]);

            if ($response->successful()) {
                return $response->body();
            }

            Log::error('TTS generation failed', [
                'status' => $response->status(),
                'body' => substr($response->body(), 0, 500),
                'model' => $this->model,
                'base_url' => $this->baseUrl,
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('TTS error', ['error' => $e->getMessage(), 'base_url' => $this->baseUrl]);

            return null;
        }
    }
}
