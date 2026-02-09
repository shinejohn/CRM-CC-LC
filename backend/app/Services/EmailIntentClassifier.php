<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmailIntentClassifier
{
    protected array $intentPatterns = [
        'question' => ['?', 'what', 'how', 'when', 'where', 'why', 'can you', 'could you', 'explain', 'help'],
        'complaint' => ['problem', 'issue', 'broken', 'not working', 'error', 'bug', 'disappointed', 'unhappy'],
        'request' => ['please', 'can you', 'would you', 'need', 'want', 'request'],
        'appointment' => ['schedule', 'meeting', 'call', 'appointment', 'book', 'calendar', 'available'],
        'support' => ['help', 'support', 'assistance', 'troubleshoot', 'fix'],
        'pricing' => ['price', 'cost', 'pricing', 'how much', 'expensive', 'budget'],
    ];
    
    public function classify(string $subject, string $body): array
    {
        $text = strtolower($subject . ' ' . $body);
        $scores = [];
        
        // Pattern matching
        foreach ($this->intentPatterns as $intent => $patterns) {
            $score = $this->calculatePatternScore($text, $patterns);
            if ($score > 0) {
                $scores[$intent] = $score;
            }
        }
        
        // If high confidence pattern match, use it
        if (!empty($scores)) {
            arsort($scores);
            $topIntent = array_key_first($scores);
            $confidence = $scores[$topIntent];
            
            if ($confidence >= 0.7) {
                return [
                    'intent' => $topIntent,
                    'confidence' => $confidence,
                    'method' => 'pattern',
                ];
            }
        }
        
        // Use AI for complex classification
        return $this->classifyWithAI($text, $scores);
    }
    
    protected function calculatePatternScore(string $text, array $patterns): float
    {
        $score = 0;
        foreach ($patterns as $pattern) {
            if (str_contains($text, $pattern)) {
                $score += 0.3;
            }
        }
        return min(1.0, $score);
    }
    
    protected function classifyWithAI(string $text, array $existingScores): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openrouter.api_key'),
                'Content-Type' => 'application/json',
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'anthropic/claude-3-haiku',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Classify email intent: question, complaint, request, appointment, support, pricing, other. Respond JSON: {"intent": "...", "confidence": 0.0-1.0}'
                    ],
                    ['role' => 'user', 'content' => substr($text, 0, 1000)]
                ],
                'max_tokens' => 50,
            ]);
            
            $content = $response->json('choices.0.message.content') ?? '{}';
            $parsed = json_decode($content, true);
            
            return [
                'intent' => $parsed['intent'] ?? 'other',
                'confidence' => $parsed['confidence'] ?? 0.5,
                'method' => 'ai',
            ];
            
        } catch (\Exception $e) {
            Log::error("AI email intent classification failed: " . $e->getMessage());
            
            return [
                'intent' => !empty($existingScores) ? array_key_first($existingScores) : 'other',
                'confidence' => !empty($existingScores) ? reset($existingScores) : 0.3,
                'method' => 'fallback',
            ];
        }
    }
}

