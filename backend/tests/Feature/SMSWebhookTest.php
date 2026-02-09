<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Customer;
use App\Events\SMSReceived;
use App\Services\SMSIntentClassifier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;

class SMSWebhookTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    /** @test */
    public function it_processes_sms_webhook(): void
    {
        Event::fake();

        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(), 'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'phone' => '+1234567890',
            'sms_opted_in' => true,
            'lead_score' => 0,
        ]);

        $response = $this->postJson('/api/v1/webhooks/twilio/sms', [
            'From' => '+1234567890',
            'To' => '+1987654321',
            'Body' => 'Yes, I am interested',
        ]);

        $response->assertStatus(200);
        Event::assertDispatched(SMSReceived::class);
    }

    /** @test */
    public function it_classifies_sms_intent(): void
    {
        $classifier = new SMSIntentClassifier();

        $yesResult = $classifier->classify('Yes, I am interested');
        $this->assertEquals('yes', $yesResult['intent']);

        $noResult = $classifier->classify('No, not interested');
        $this->assertEquals('no', $noResult['intent']);

        $questionResult = $classifier->classify('How does this work?');
        $this->assertEquals('question', $questionResult['intent']);
    }

    /** @test */
    public function it_handles_unknown_phone_number(): void
    {
        $response = $this->postJson('/api/v1/webhooks/twilio/sms', [
            'From' => '+1999999999',
            'To' => '+1987654321',
            'Body' => 'Test message',
        ]);

        // Should handle gracefully - either create customer or return appropriate response
        $response->assertStatus(200);
    }
}

