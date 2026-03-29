<?php

declare(strict_types=1);

namespace Tests\Feature\Pitch;

use App\Models\CampaignRecipient;
use App\Models\Community;
use App\Models\Customer;
use App\Models\OutboundCampaign;
use App\Models\PitchReengagementQueue;
use App\Models\PitchSession;
use App\Services\Pitch\ReengagementQueueService;
use Illuminate\Support\Str;
use Tests\TestCase;

final class ReengagementQueueSendCreatesOutboundCampaignTest extends TestCase
{
    public function test_send_creates_outbound_campaign_and_recipient(): void
    {
        $community = Community::factory()->create();

        $mail = 'reengage-'.Str::random(8).'@example.com';
        $customer = Customer::factory()->create([
            'community_id' => $community->id,
            'tenant_id' => (string) config('fibonacco.system_tenant_id'),
            'primary_email' => $mail,
            'email' => $mail,
        ]);

        $session = PitchSession::query()->create([
            'id' => (string) Str::uuid(),
            'community_id' => $community->id,
            'customer_id' => $customer->id,
            'entry_platform' => 'web',
            'status' => 'pitching',
            'last_step' => 'discovery',
        ]);

        $queueItem = PitchReengagementQueue::query()->create([
            'session_id' => $session->id,
            'customer_id' => $customer->id,
            'contact_email' => $customer->primary_email ?? $customer->email,
            'reengagement_type' => 'resume_incomplete',
            'context' => [
                'business_name' => 'Test Biz',
                'community_name' => $community->name,
                'contact_name' => 'Chris',
            ],
            'send_after' => now()->subMinute(),
            'status' => 'queued',
        ]);

        $before = OutboundCampaign::query()->count();

        app(ReengagementQueueService::class)->send($queueItem);

        $this->assertSame($before + 1, OutboundCampaign::query()->count());

        $queueItem->refresh();

        $this->assertNotNull($queueItem->outbound_campaign_id);
        $this->assertSame('sent', $queueItem->status);

        $campaign = OutboundCampaign::query()->findOrFail($queueItem->outbound_campaign_id);
        $this->assertSame('email', $campaign->type);
        $this->assertSame('running', $campaign->status);
        $this->assertIsArray($campaign->metadata);
        $this->assertArrayHasKey('pitch_queue_id', $campaign->metadata);
        $this->assertSame($queueItem->id, $campaign->metadata['pitch_queue_id']);

        $this->assertTrue(
            CampaignRecipient::query()
                ->where('campaign_id', $campaign->id)
                ->where('customer_id', $customer->id)
                ->exists()
        );
    }
}
