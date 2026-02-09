<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SMSIntentClassifier
{
    /**
     * Intent patterns for classification
     */
    protected array $intentPatterns = [
        'yes' => [
            'patterns' => ['yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'absolutely', 'definitely', 'correct', 'right', 'i agree', 'sounds good', 'lets do it', 'im in', 'sign me up'],
            'confidence' => 0.9,
        ],
        'no' => [
            'patterns' => ['no', 'nope', 'nah', 'not interested', 'stop', 'unsubscribe', 'opt out', 'remove me', 'dont want', 'cancel', 'never'],
            'confidence' => 0.9,
        ],
        'question' => [
            'patterns' => ['?', 'what', 'how', 'when', 'where', 'why', 'who', 'can you', 'could you', 'would you', 'tell me', 'explain', 'help', 'info', 'information', 'more about'],
            'confidence' => 0.8,
        ],
        'call_request' => [
            'patterns' => ['call me', 'call', 'phone', 'speak', 'talk', 'contact me', 'reach out', 'give me a call', 'call back', 'callback'],
            'confidence' => 0.85,
        ],
        'appointment' => [
            'patterns' => ['schedule', 'meeting', 'appointment', 'book', 'calendar', 'available', 'time', 'when can'],
            'confidence' => 0.8,
        ],
        'pricing' => [
            'patterns' => ['price', 'cost', 'pricing', 'how much', 'expensive', 'budget', 'fee', 'charge'],
            'confidence' => 0.8,
        ],
    ];

    /**
     * Classify SMS intent
     * 
     * @param string $message The SMS message text
     * @return array Intent classification result with 'intent', 'confidence', and 'method'
     */
    public function classify(string $message): array
    {
        $normalizedMessage = $this->normalizeMessage($message);
        
        // First, try pattern matching
        $patternResult = $this->classifyWithPatterns($normalizedMessage);
        
        // If high confidence pattern match, return it
        if ($patternResult['confidence'] >= 0.7) {
            return $patternResult;
        }
        
        // Otherwise, use AI fallback for ambiguous messages
        return $this->classifyWithAI($normalizedMessage, $patternResult);
    }

    /**
     * Normalize message for classification
     */
    protected function normalizeMessage(string $message): string
    {
        // Convert to lowercase and remove extra whitespace
        $normalized = strtolower(trim($message));
        
        // Remove common punctuation except question marks
        $normalized = preg_replace('/[^\w\s?]/', ' ', $normalized);
        
        // Normalize whitespace
        $normalized = preg_replace('/\s+/', ' ', $normalized);
        
        return trim($normalized);
    }

    /**
     * Classify using pattern matching
     */
    protected function classifyWithPatterns(string $message): array
    {
        $scores = [];
        
        foreach ($this->intentPatterns as $intent => $config) {
            $score = 0;
            $matches = 0;
            
            foreach ($config['patterns'] as $pattern) {
                if (str_contains($message, $pattern)) {
                    $matches++;
                    // Longer patterns get higher weight
                    $score += (strlen($pattern) / 10) + 0.1;
                }
            }
            
            if ($matches > 0) {
                // Base confidence from config, adjusted by match quality
                $baseConfidence = $config['confidence'];
                $matchQuality = min($score / max($matches, 1), 1.0);
                $scores[$intent] = $baseConfidence * $matchQuality;
            }
        }
        
        if (empty($scores)) {
            return [
                'intent' => 'other',
                'confidence' => 0.3,
                'method' => 'pattern',
            ];
        }
        
        // Get highest scoring intent
        arsort($scores);
        $topIntent = array_key_first($scores);
        $confidence = $scores[$topIntent];
        
        return [
            'intent' => $topIntent,
            'confidence' => min($confidence, 1.0),
            'method' => 'pattern',
        ];
    }

    /**
     * Classify using AI fallback
     */
    protected function classifyWithAI(string $message, array $patternResult): array
    {
        try {
            $apiKey = config('services.openrouter.api_key');
            
            if (!$apiKey) {
                Log::warning('OpenRouter API key not configured, using pattern fallback');
                return $patternResult;
            }
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(10)->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'anthropic/claude-3-haiku',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Classify SMS message intent. Respond with JSON only: {"intent": "yes|no|question|call_request|appointment|pricing|other", "confidence": 0.0-1.0}. Intent meanings: yes=affirmative response, no=negative/opt-out, question=asking something, call_request=wants phone call, appointment=wants to schedule, pricing=asking about cost, other=anything else.'
                    ],
                    [
                        'role' => 'user',
                        'content' => substr($message, 0, 500) // Limit to 500 chars
                    ]
                ],
                'max_tokens' => 50,
                'temperature' => 0.3,
            ]);
            
            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                
                if ($content) {
                    // Try to extract JSON from response
                    $jsonMatch = [];
                    if (preg_match('/\{[^}]+\}/', $content, $jsonMatch)) {
                        $parsed = json_decode($jsonMatch[0], true);
                        
                        if ($parsed && isset($parsed['intent'])) {
                            return [
                                'intent' => $parsed['intent'],
                                'confidence' => $parsed['confidence'] ?? 0.7,
                                'method' => 'ai',
                            ];
                        }
                    }
                }
            }
            
            Log::warning('AI classification failed, using pattern fallback', [
                'response_status' => $response->status(),
                'response_body' => $response->body(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('AI SMS intent classification error', [
                'error' => $e->getMessage(),
                'message' => substr($message, 0, 100),
            ]);
        }
        
        // Fallback to pattern result
        return $patternResult;
    }

    /**
     * Analyze sentiment of SMS message
     * 
     * @param string $message The SMS message text
     * @return string 'positive', 'neutral', or 'negative'
     */
    public function analyzeSentiment(string $message): string
    {
        $normalized = strtolower($message);
        
        $positiveWords = [
            'thanks', 'thank you', 'great', 'awesome', 'love', 'excellent', 'perfect',
            'wonderful', 'amazing', 'happy', 'excited', 'pleased', 'satisfied', 'good', 'nice'
        ];
        
        $negativeWords = [
            'terrible', 'awful', 'hate', 'angry', 'frustrated', 'annoyed', 'disappointed',
            'worst', 'horrible', 'bad', 'unhappy', 'upset', 'furious', 'stop', 'cancel'
        ];
        
        $positiveCount = 0;
        $negativeCount = 0;
        
        foreach ($positiveWords as $word) {
            if (str_contains($normalized, $word)) {
                $positiveCount++;
            }
        }
        
        foreach ($negativeWords as $word) {
            if (str_contains($normalized, $word)) {
                $negativeCount++;
            }
        }
        
        if ($positiveCount > $negativeCount && $positiveCount > 0) {
            return 'positive';
        }
        
        if ($negativeCount > $positiveCount && $negativeCount > 0) {
            return 'negative';
        }
        
        return 'neutral';
    }
}

