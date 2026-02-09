<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    protected string $openaiApiKey;
    protected string $baseUrl = 'https://api.openai.com/v1';

    public function __construct()
    {
        $this->openaiApiKey = (string) config('services.openai.api_key', '');
    }

    /**
     * Generate embedding vector
     */
    public function generateEmbedding(string $text): ?array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->openaiApiKey}",
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/embeddings", [
                        'model' => 'text-embedding-ada-002',
                        'input' => $text,
                    ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['data'][0]['embedding'] ?? null;
            }

            throw new \Exception('OpenAI embedding failed with status ' . $response->status());
        } catch (\Exception $e) {
            Log::error('OpenAI embedding error', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}






