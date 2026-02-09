<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\SMSIntentClassifier;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SMSIntentClassifierTest extends TestCase
{
    protected SMSIntentClassifier $classifier;

    protected function setUp(): void
    {
        parent::setUp();
        $this->classifier = new SMSIntentClassifier();
    }

    /** @test */
    public function it_classifies_yes_intent(): void
    {
        $result = $this->classifier->classify('Yes, I am interested');

        $this->assertEquals('yes', $result['intent']);
        $this->assertGreaterThanOrEqual(0.7, $result['confidence']);
        $this->assertEquals('pattern', $result['method']);
    }

    /** @test */
    public function it_classifies_no_intent(): void
    {
        $result = $this->classifier->classify('No, not interested');

        $this->assertEquals('no', $result['intent']);
        $this->assertGreaterThanOrEqual(0.7, $result['confidence']);
        $this->assertEquals('pattern', $result['method']);
    }

    /** @test */
    public function it_classifies_question_intent(): void
    {
        $result = $this->classifier->classify('How does this work?');

        $this->assertEquals('question', $result['intent']);
        $this->assertGreaterThanOrEqual(0.7, $result['confidence']);
    }

    /** @test */
    public function it_classifies_call_request_intent(): void
    {
        $result = $this->classifier->classify('Can you call me?');

        $this->assertEquals('call_request', $result['intent']);
        $this->assertGreaterThanOrEqual(0.7, $result['confidence']);
    }

    /** @test */
    public function it_uses_ai_fallback_for_ambiguous_messages(): void
    {
        Http::fake([
            'openrouter.ai/api/v1/chat/completions' => Http::response([
                'choices' => [[
                    'message' => [
                        'content' => '{"intent": "question", "confidence": 0.75}'
                    ]
                ]]
            ], 200),
        ]);

        $result = $this->classifier->classify('I might be interested but need to think');

        $this->assertEquals('ai', $result['method']);
        $this->assertArrayHasKey('intent', $result);
        $this->assertArrayHasKey('confidence', $result);
    }

    /** @test */
    public function it_normalizes_messages(): void
    {
        $result1 = $this->classifier->classify('YES!!!');
        $result2 = $this->classifier->classify('yes');

        $this->assertEquals($result1['intent'], $result2['intent']);
    }

    /** @test */
    public function it_handles_empty_messages(): void
    {
        $result = $this->classifier->classify('');

        $this->assertArrayHasKey('intent', $result);
        $this->assertArrayHasKey('confidence', $result);
    }
}

