<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\PipelineStage;
use App\Models\CampaignTimeline;
use App\Models\CampaignTimelineAction;
use App\Models\Customer;
use App\Services\CampaignActionExecutor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Proves an unsubscribed (email_suppressed) customer is genuinely removed from
 * the Manifest Destiny email path — not just shown a dead unsubscribe link.
 */
final class ManifestDestinyUnsubscribeEnforcementTest extends TestCase
{
    use RefreshDatabase;

    private function emailAction(): CampaignTimelineAction
    {
        $timeline = CampaignTimeline::create([
            'slug' => 'test-enforcement',
            'name' => 'Test',
            'description' => 'test',
            'pipeline_stage' => PipelineStage::HOOK,
            'duration_days' => 1,
            'is_active' => true,
        ]);

        return CampaignTimelineAction::create([
            'campaign_timeline_id' => $timeline->id,
            'day_number' => 1,
            'channel' => 'email',
            'action_type' => 'send_email',
            'template_type' => 'welcome_community_launch',
            'parameters' => [],
            'is_active' => true,
        ]);
    }

    public function test_suppressed_customer_cannot_be_contacted_via_email(): void
    {
        $suppressed = Customer::factory()->create([
            'email' => 'suppressed@example.com',
            'email_opted_in' => true,
            'do_not_contact' => false,
            'email_suppressed' => true,
        ]);
        $this->assertFalse($suppressed->canContactViaEmail(), 'Unsubscribed customer must not be emailable');

        $normal = Customer::factory()->create([
            'email' => 'normal@example.com',
            'email_opted_in' => true,
            'do_not_contact' => false,
            'email_suppressed' => false,
        ]);
        $this->assertTrue($normal->canContactViaEmail());
    }

    public function test_timeline_does_not_email_unsubscribed_customer(): void
    {
        Http::fake();

        $customer = Customer::factory()->create([
            'email' => 'unsub@example.com',
            'email_opted_in' => true,
            'do_not_contact' => false,
            'email_suppressed' => true,
        ]);

        $result = app(CampaignActionExecutor::class)->execute($customer, $this->emailAction());

        $this->assertFalse($result['dispatched']);
        $this->assertSame('customer_not_emailable', $result['reason']);
        Http::assertNothingSent();
    }
}
