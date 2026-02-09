<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\InboundEmailService;
use App\Services\EmailIntentClassifier;
use App\Services\EmailSentimentAnalyzer;
use App\Models\Customer;
use App\Models\Conversation;
use App\Events\InboundEmailReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Mockery;

class InboundEmailServiceTest extends TestCase
{
    use RefreshDatabase;

    protected InboundEmailService $service;
    protected EmailIntentClassifier $intentClassifier;
    protected EmailSentimentAnalyzer $sentimentAnalyzer;

    protected function setUp(): void
    {
        parent::setUp();

        // Mock dependencies if service exists, otherwise create placeholder
        if (class_exists(\App\Services\EmailIntentClassifier::class)) {
            $this->intentClassifier = Mockery::mock(EmailIntentClassifier::class);
            $this->sentimentAnalyzer = Mockery::mock(EmailSentimentAnalyzer::class);
            $this->service = new InboundEmailService($this->intentClassifier, $this->sentimentAnalyzer);
        }
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_processes_inbound_email(): void
    {
        if (!class_exists(\App\Services\InboundEmailService::class)) {
            $this->markTestSkipped('InboundEmailService not yet implemented');
        }

        Event::fake();

        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(), 'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'email' => 'customer@example.com',
            'lead_score' => 0,
        ]);

        $this->intentClassifier->shouldReceive('classify')
            ->once()
            ->andReturn(['intent' => 'question', 'confidence' => 0.8]);

        $this->sentimentAnalyzer->shouldReceive('analyze')
            ->once()
            ->andReturn('neutral');

        $result = $this->service->process(
            $customer,
            'customer@example.com',
            'Test Subject',
            'Test email body',
            'msg-123',
            null
        );

        $this->assertIsArray($result);
        $this->assertArrayHasKey('intent', $result);
        $this->assertArrayHasKey('sentiment', $result);

        Event::assertDispatched(InboundEmailReceived::class);
    }

    /** @test */
    public function it_logs_conversation(): void
    {
        if (!class_exists(\App\Services\InboundEmailService::class)) {
            $this->markTestSkipped('InboundEmailService not yet implemented');
        }

        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(), 'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'email' => 'customer@example.com',
            'lead_score' => 0,
        ]);

        $this->intentClassifier->shouldReceive('classify')
            ->andReturn(['intent' => 'question', 'confidence' => 0.8]);

        $this->sentimentAnalyzer->shouldReceive('analyze')
            ->andReturn('neutral');

        $this->service->process(
            $customer,
            'customer@example.com',
            'Test Subject',
            'Test email body'
        );

        $conversation = Conversation::where('customer_id', $customer->id)
            ->where('entry_point', 'email')
            ->first();

        $this->assertNotNull($conversation);
        $this->assertEquals('Test Subject', $conversation->new_data_collected['subject']);
    }
}

