<?php

namespace Tests\Feature;

use App\Models\CampaignRecipient;
use App\Models\OutboundCampaign;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PostalWebhookTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_delivered_event_updates_recipient_and_campaign(): void
    {
        config(['services.postal.webhook_secret' => 'test-secret']);

        $tenantId = (string) Str::uuid();
        $campaign = OutboundCampaign::create([
            'tenant_id' => $tenantId,
            'name' => 'Test Campaign',
            'type' => 'email',
            'status' => 'running',
            'subject' => 'Hello',
            'message' => 'Body',
        ]);

        $recipient = CampaignRecipient::create([
            'campaign_id' => $campaign->id,
            'tenant_id' => $tenantId,
            'email' => 'recipient@example.com',
            'status' => 'sent',
            'external_id' => 'msg_123',
        ]);

        $payload = [
            'event' => 'MessageDelivered',
            'payload' => [
                'message' => [
                    'id' => 'msg_123',
                ],
            ],
        ];

        $raw = json_encode($payload);
        $signature = base64_encode(hash_hmac('sha1', $raw, 'test-secret', true));

        $response = $this->postJson('/api/outbound/email/postal/webhook', $payload, [
            'X-Postal-Signature' => $signature,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('campaign_recipients', [
            'id' => $recipient->id,
            'status' => 'delivered',
        ]);

        $this->assertDatabaseHas('outbound_campaigns', [
            'id' => $campaign->id,
            'delivered_count' => 1,
        ]);

        $this->assertDatabaseHas('email_delivery_events', [
            'external_id' => 'msg_123',
            'event_type' => 'MessageDelivered',
        ]);
    }

    public function test_hard_bounce_creates_suppression(): void
    {
        config(['services.postal.webhook_secret' => 'test-secret']);

        $tenantId = (string) Str::uuid();
        $campaign = OutboundCampaign::create([
            'tenant_id' => $tenantId,
            'name' => 'Bounce Campaign',
            'type' => 'email',
            'status' => 'running',
            'subject' => 'Hello',
            'message' => 'Body',
        ]);

        $recipient = CampaignRecipient::create([
            'campaign_id' => $campaign->id,
            'tenant_id' => $tenantId,
            'email' => 'bounce@example.com',
            'status' => 'sent',
            'external_id' => 'msg_456',
        ]);

        $payload = [
            'event' => 'MessageBounced',
            'payload' => [
                'id' => 'evt_789',
                'message' => [
                    'id' => 'msg_456',
                ],
                'bounce' => [
                    'type' => 'HardFail',
                ],
            ],
        ];

        $raw = json_encode($payload);
        $signature = base64_encode(hash_hmac('sha1', $raw, 'test-secret', true));

        $response = $this->postJson('/api/outbound/email/postal/webhook', $payload, [
            'X-Postal-Signature' => $signature,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('campaign_recipients', [
            'id' => $recipient->id,
            'status' => 'bounced',
        ]);

        $this->assertDatabaseHas('email_suppressions', [
            'email' => 'bounce@example.com',
            'reason' => 'bounce_hard',
        ]);
    }
}



