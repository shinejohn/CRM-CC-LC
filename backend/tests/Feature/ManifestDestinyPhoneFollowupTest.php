<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\PipelineStage;
use App\Models\CampaignTimeline;
use App\Models\CampaignTimelineAction;
use App\Models\Customer;
use App\Models\PhoneScript;
use App\Services\CampaignActionExecutor;
use Database\Seeders\ManifestDestinyEmailTemplateSeeder;
use Database\Seeders\ManifestDestinyTimelineSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Verifies the phone-call follow-ups added to the Manifest Destiny Hook
 * timeline: the timeline carries make_call actions with script_id params,
 * the referenced PhoneScripts seed correctly, and the executor honours the
 * phone opt-in gate (TCPA-correct — calls only fire for opted-in customers).
 *
 * The real CampaignActionExecutor + PhoneService run end-to-end; only the
 * outbound Twilio HTTP is faked, so no network is touched.
 */
class ManifestDestinyPhoneFollowupTest extends TestCase
{
    use RefreshDatabase;

    private string $systemTenantId;

    protected function setUp(): void
    {
        parent::setUp();

        // Records + executor use the system tenant; authenticate the user under
        // the same tenant so tenant-scoped reads (interactions) resolve.
        $this->systemTenantId = (string) config('fibonacco.system_tenant_id');
        $this->createAndAuthenticateUser($this->systemTenantId);

        config([
            'services.twilio.account_sid' => 'ACtestsid',
            'services.twilio.auth_token' => 'testtoken',
            'services.twilio.from_phone' => '+15005550006',
        ]);

        $this->seed(ManifestDestinyTimelineSeeder::class);
        $this->seed(ManifestDestinyEmailTemplateSeeder::class);
    }

    private function executor(): CampaignActionExecutor
    {
        return app(CampaignActionExecutor::class);
    }

    private function makeCustomer(array $attributes = []): Customer
    {
        return Customer::create(array_merge([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->systemTenantId,
            'business_name' => 'Test Business',
            'owner_name' => 'Jane Owner',
            'slug' => 'test-business-'.Str::random(8),
            'pipeline_stage' => PipelineStage::HOOK,
            'phone' => '+15125550100',
            'sms_opted_in' => true,
            'phone_opted_in' => true,
            'do_not_contact' => false,
            'lead_score' => 0,
        ], $attributes));
    }

    /** @test */
    public function the_hook_timeline_has_make_call_actions_with_script_ids(): void
    {
        $timeline = CampaignTimeline::where('slug', 'manifest-destiny-hook')->firstOrFail();

        $callActions = CampaignTimelineAction::where('campaign_timeline_id', $timeline->id)
            ->where('action_type', 'make_call')
            ->orderBy('day_number')
            ->get();

        $this->assertGreaterThanOrEqual(1, $callActions->count());

        foreach ($callActions as $action) {
            $this->assertSame('phone', $action->channel);
            $this->assertArrayHasKey('script_id', $action->parameters ?? []);
            $this->assertNotEmpty($action->parameters['script_id']);
        }

        // The three expected follow-ups sit early in the sequence.
        $byDay = $callActions->keyBy('day_number');
        $this->assertSame('md_welcome_call', $byDay[2]->parameters['script_id'] ?? null);
        $this->assertSame('md_claim_followup_call', $byDay[8]->parameters['script_id'] ?? null);
        $this->assertSame('md_founder_call', $byDay[26]->parameters['script_id'] ?? null);
    }

    /** @test */
    public function every_referenced_phone_script_exists_and_renders(): void
    {
        $timeline = CampaignTimeline::where('slug', 'manifest-destiny-hook')->firstOrFail();

        $scriptIds = CampaignTimelineAction::where('campaign_timeline_id', $timeline->id)
            ->where('action_type', 'make_call')
            ->get()
            ->pluck('parameters.script_id')
            ->filter()
            ->unique();

        $this->assertNotEmpty($scriptIds);

        foreach ($scriptIds as $slug) {
            $script = PhoneScript::withoutGlobalScopes()->where('slug', $slug)->first();
            $this->assertNotNull($script, "PhoneScript {$slug} should be seeded");
            $this->assertTrue((bool) $script->is_active);

            $rendered = $script->render([
                'business_name' => 'Joe\'s Diner',
                'community_name' => 'Springfield',
                'customer_name' => 'Joe',
                'listing_url' => 'https://day.news/business/joes-diner',
            ]);

            $this->assertStringContainsString('Joe\'s Diner', $rendered);
            $this->assertStringNotContainsString('{{business_name}}', $rendered);
            // Compliance: each script carries an opt-out line.
            $this->assertStringContainsStringIgnoringCase('do not call', $rendered);
        }
    }

    /** @test */
    public function it_places_a_call_for_a_phone_opted_in_customer(): void
    {
        Http::fake([
            'api.twilio.com/*' => Http::response(['sid' => 'CA111', 'status' => 'queued'], 201),
        ]);

        $customer = $this->makeCustomer();
        $action = $this->hookCallAction('md_welcome_call');

        $result = $this->executor()->execute($customer, $action);

        $this->assertSame('phone', $result['type']);
        $this->assertTrue($result['dispatched']);
        $this->assertSame('CA111', $result['call_sid']);

        // The rendered script (with merged business name) is what Twilio speaks.
        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/Calls.json')
                && str_contains($request['Twiml'] ?? '', 'Test Business');
        });

        $interaction = $customer->interactions()->where('type', 'call_placed')->first();
        $this->assertNotNull($interaction);
        $this->assertSame('dispatched', $interaction->outcome);
    }

    /** @test */
    public function it_skips_a_call_for_a_customer_not_opted_in_to_phone(): void
    {
        Http::fake();

        $customer = $this->makeCustomer(['phone_opted_in' => false]);
        $action = $this->hookCallAction('md_welcome_call');

        $result = $this->executor()->execute($customer, $action);

        $this->assertFalse($result['dispatched']);
        $this->assertSame('customer_not_callable', $result['reason']);
        Http::assertNothingSent();
        $this->assertSame(0, $customer->interactions()->count());
    }

    /**
     * Pull a real make_call action from the seeded Hook timeline by script_id.
     */
    private function hookCallAction(string $scriptId): CampaignTimelineAction
    {
        $timeline = CampaignTimeline::where('slug', 'manifest-destiny-hook')->firstOrFail();

        return CampaignTimelineAction::where('campaign_timeline_id', $timeline->id)
            ->where('action_type', 'make_call')
            ->get()
            ->first(fn ($a) => ($a->parameters['script_id'] ?? null) === $scriptId)
            ?? throw new \RuntimeException("No seeded make_call action for {$scriptId}");
    }
}
