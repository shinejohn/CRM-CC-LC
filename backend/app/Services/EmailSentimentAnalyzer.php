<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmailSentimentAnalyzer
{
    protected array $positiveWords = [
        'thanks', 'thank you', 'great', 'awesome', 'love', 'excellent', 'perfect', 
        'wonderful', 'amazing', 'happy', 'excited', 'pleased', 'satisfied'
    ];
    
    protected array $negativeWords = [
        'terrible', 'awful', 'hate', 'angry', 'frustrated', 'annoyed', 'disappointed',
        'worst', 'horrible', 'bad', 'unhappy', 'upset', 'furious'
    ];
    
    public function analyze(string $body): string
    {
        $text = strtolower($body);
        
        $positiveCount = 0;
        $negativeCount = 0;
        
        foreach ($this->positiveWords as $word) {
            if (str_contains($text, $word)) $positiveCount++;
        }
        
        foreach ($this->negativeWords as $word) {
            if (str_contains($text, $word)) $negativeCount++;
        }
        
        // Simple rule-based analysis
        if ($positiveCount > $negativeCount && $positiveCount > 0) {
            return 'positive';
        }
        
        if ($negativeCount > $positiveCount && $negativeCount > 0) {
            return 'negative';
        }
        
        // For more nuanced analysis, use AI
        return $this->analyzeWithAI($body);
    }
    
    protected function analyzeWithAI(string $body): string
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openrouter.api_key'),
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'anthropic/claude-3-haiku',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Analyze sentiment: positive, neutral, negative. Respond JSON: {"sentiment": "..."}'
                    ],
                    ['role' => 'user', 'content' => substr($body, 0, 1000)]
                ],
                'max_tokens' => 20,
            ]);
            
            $content = $response->json('choices.0.message.content') ?? '{}';
            $parsed = json_decode($content, true);
            
            return $parsed['sentiment'] ?? 'neutral';
            
        } catch (\Exception $e) {
            Log::error("AI sentiment analysis failed: " . $e->getMessage());
            return 'neutral';
        }
    }
}

