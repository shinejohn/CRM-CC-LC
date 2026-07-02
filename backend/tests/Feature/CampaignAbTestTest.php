<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\PoolType;
use App\Jobs\SendEmailCampaign;
use App\Models\CampaignRecipient;
use App\Models\CampaignVariant;
use App\Models\Customer;
use App\Models\EmailPool;
use App\Models\OutboundCampaign;
use App\Services\Email\PostalService;
use App\Services\EmailService;
use App\Services\ZeroBounceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class CampaignAbTestTest extends TestCase
{
    use RefreshDatabase;

    private string $tenantId = '00000000-0000-0000-0000-000000000000';

    protected function setUp(): void
    {
        parent::setUp();
        $this->createAndAuthenticateUser();
    }

    private function makeCustomers(int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            Customer::create([
                'tenant_id' => $this->tenantId,
                'business_name' => "Biz {$i}",
                'owner_name' => "Owner {$i}",
                'email' => "biz{$i}@example.com",
                'pipeline_stage' => 'hook',
                // Pass the mandatory email-health filter applied on start/send.
                'email_opted_in' => true,
                'email_suppressed' => false,
                'do_not_contact' => false,
            ]);
        }
    }

    /**
     * Configure an SMB campaign pool + fake Postal HTTP so SendEmailCampaign
     * runs its real send path and we can inspect the outbound payload.
     */
    private function fakePostalPool(): void
    {
        EmailPool::create([
            'pool_type' => PoolType::SmbCampaign,
            'api_url' => 'https://postal.test',
            'api_key' => 'test-key',
            'username' => 'sender@example.com',
        ]);

        Http::fake([
            'postal.test/*' => Http::response(['data' => ['message_id' => 'msg-1']], 200),
        ]);
    }

    /**
     * THE REGRESSION GUARD: a campaign with NO variants sends exactly as before.
     * Recipients get the campaign's own subject/message; no variant assignment.
     */
    public function test_campaign_without_variants_sends_unchanged(): void
    {
        Queue::fake();
        $this->makeCustomers(5);

        $campaign = OutboundCampaign::create([
            'tenant_id' => $this->tenantId,
            'name' => 'Plain Campaign',
            'type' => 'email',
            'status' => 'draft',
            'subject' => 'Original Subject',
            'message' => 'Original body',
            // Non-empty segment now required to start a campaign.
            'recipient_segments' => ['pipeline_stage' => 'hook'],
        ]);

        $this->postJson("/api/v1/outbound/campaigns/{$campaign->id}/start", [])
            ->assertStatus(200);

        $recipients = CampaignRecipient::where('campaign_id', $campaign->id)->get();

        $this->assertCount(5, $recipients);
        // No variant assignment whatsoever.
        $this->assertTrue($recipients->every(fn ($r) => $r->variant_id === null));
        $this->assertSame(0, CampaignVariant::where('outbound_campaign_id', $campaign->id)->count());

        Queue::assertPushed(SendEmailCampaign::class, 5);

        // Prove the rendered content equals the campaign's own (variant null path).
        $recipient = $recipients->first();
        $recipient->refresh();
        $this->assertNull($recipient->variant_id);

        $this->fakePostalPool();
        (new SendEmailCampaign($recipient, $campaign))
            ->handle(app(PostalService::class), app(EmailService::class), app(ZeroBounceService::class));

        // The outbound payload carried the campaign's own subject/body.
        Http::assertSent(function ($request) {
            $body = $request->data();

            return $body['subject'] === 'Original Subject'
                && $body['html_body'] === 'Original body';
        });

        $this->assertSame('sent', $recipient->fresh()->status);
    }

    public function test_create_campaign_with_variants_persists_them(): void
    {
        $payload = [
            'name' => 'AB Campaign',
            'type' => 'email',
            'message' => 'Default body',
            'subject' => 'Default subject',
            'tenant_id' => $this->tenantId,
            'ab_test_enabled' => true,
            'ab_winner_metric' => 'open_rate',
            'variants' => [
                ['label' => 'A', 'subject' => 'Subject A', 'message' => 'Body A', 'weight' => 50],
                ['label' => 'B', 'subject' => 'Subject B', 'message' => 'Body B', 'weight' => 50],
            ],
        ];

        $response = $this->postJson('/api/v1/outbound/campaigns', $payload);

        $response->assertStatus(201);
        $campaignId = $response->json('data.id');

        $this->assertSame(2, CampaignVariant::where('outbound_campaign_id', $campaignId)->count());
        $this->assertTrue((bool) OutboundCampaign::find($campaignId)->ab_test_enabled);
    }

    public function test_recipients_split_across_variants_by_weight(): void
    {
        Queue::fake();
        $this->makeCustomers(40);

        $campaign = OutboundCampaign::create([
            'tenant_id' => $this->tenantId,
            'name' => 'Split Campaign',
            'type' => 'email',
            'status' => 'draft',
            'subject' => 'Default',
            'message' => 'Default',
            'ab_test_enabled' => true,
            'ab_winner_metric' => 'open_rate',
            // Non-empty segment now required to start a campaign.
            'recipient_segments' => ['pipeline_stage' => 'hook'],
        ]);

        $variantA = CampaignVariant::create([
            'outbound_campaign_id' => $campaign->id,
            'label' => 'A', 'subject' => 'Subject A', 'message' => 'Body A', 'weight' => 50,
        ]);
        $variantB = CampaignVariant::create([
            'outbound_campaign_id' => $campaign->id,
            'label' => 'B', 'subject' => 'Subject B', 'message' => 'Body B', 'weight' => 50,
        ]);

        $this->postJson("/api/v1/outbound/campaigns/{$campaign->id}/start", [])
            ->assertStatus(200);

        $recipients = CampaignRecipient::where('campaign_id', $campaign->id)->get();
        $this->assertCount(40, $recipients);

        // Every recipient assigned to one of the two variants.
        $this->assertTrue($recipients->every(
            fn ($r) => in_array($r->variant_id, [$variantA->id, $variantB->id], true)
        ));

        $countA = $recipients->where('variant_id', $variantA->id)->count();
        $countB = $recipients->where('variant_id', $variantB->id)->count();

        // Both buckets get a meaningful share under a 50/50 split.
        $this->assertGreaterThan(0, $countA);
        $this->assertGreaterThan(0, $countB);
        $this->assertSame(40, $countA + $countB);

        // recipients_count tallied onto the variants.
        $this->assertSame($countA, $variantA->fresh()->recipients_count);
        $this->assertSame($countB, $variantB->fresh()->recipients_count);

        // Each recipient's send uses its variant's content.
        $r = $recipients->firstWhere('variant_id', $variantA->id);
        $this->fakePostalPool();
        (new SendEmailCampaign($r, $campaign))
            ->handle(app(PostalService::class), app(EmailService::class), app(ZeroBounceService::class));

        Http::assertSent(function ($request) {
            $body = $request->data();

            return $body['subject'] === 'Subject A' && $body['html_body'] === 'Body A';
        });
    }

    public function test_per_variant_sent_counter_increments(): void
    {
        $this->makeCustomers(1);

        $campaign = OutboundCampaign::create([
            'tenant_id' => $this->tenantId,
            'name' => 'Counter Campaign',
            'type' => 'email',
            'status' => 'running',
            'subject' => 'Default',
            'message' => 'Default',
            'ab_test_enabled' => true,
        ]);
        $variant = CampaignVariant::create([
            'outbound_campaign_id' => $campaign->id,
            'label' => 'A', 'subject' => 'Subject A', 'message' => 'Body A', 'weight' => 100,
        ]);

        $recipient = CampaignRecipient::create([
            'campaign_id' => $campaign->id,
            'variant_id' => $variant->id,
            'tenant_id' => $this->tenantId,
            'email' => 'one@example.com',
            'name' => 'One',
            'status' => 'pending',
        ]);

        $this->fakePostalPool();
        (new SendEmailCampaign($recipient, $campaign))
            ->handle(app(PostalService::class), app(EmailService::class), app(ZeroBounceService::class));

        $this->assertSame(1, $variant->fresh()->sent_count);
        $this->assertSame(1, $campaign->fresh()->sent_count);
    }

    public function test_declare_winner_marks_higher_metric_variant(): void
    {
        $campaign = OutboundCampaign::create([
            'tenant_id' => $this->tenantId,
            'name' => 'Winner Campaign',
            'type' => 'email',
            'status' => 'completed',
            'subject' => 'Default',
            'message' => 'Default',
            'ab_test_enabled' => true,
            'ab_winner_metric' => 'open_rate',
        ]);

        // A: 10 sent, 2 opens (20%). B: 10 sent, 5 opens (50%) → B wins.
        $variantA = CampaignVariant::create([
            'outbound_campaign_id' => $campaign->id,
            'label' => 'A', 'subject' => 'A', 'message' => 'A',
            'sent_count' => 10, 'open_count' => 2,
        ]);
        $variantB = CampaignVariant::create([
            'outbound_campaign_id' => $campaign->id,
            'label' => 'B', 'subject' => 'B', 'message' => 'B',
            'sent_count' => 10, 'open_count' => 5,
        ]);

        $response = $this->postJson("/api/v1/outbound/campaigns/{$campaign->id}/variants/winner", []);

        $response->assertStatus(200);
        $this->assertSame($variantB->id, $response->json('data.id'));
        $this->assertTrue($variantB->fresh()->is_winner);
        $this->assertFalse($variantA->fresh()->is_winner);
    }

    public function test_analytics_returns_per_variant_stats(): void
    {
        $campaign = OutboundCampaign::create([
            'tenant_id' => $this->tenantId,
            'name' => 'Analytics Campaign',
            'type' => 'email',
            'status' => 'running',
            'subject' => 'Default',
            'message' => 'Default',
            'ab_test_enabled' => true,
        ]);
        CampaignVariant::create([
            'outbound_campaign_id' => $campaign->id,
            'label' => 'A', 'subject' => 'A', 'message' => 'A',
            'sent_count' => 4, 'open_count' => 1,
        ]);

        $response = $this->getJson("/api/v1/outbound/campaigns/{$campaign->id}/analytics");

        $response->assertStatus(200)
            ->assertJsonPath('data.ab_test_enabled', true)
            ->assertJsonCount(1, 'data.variants');
    }
}
