<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\PipelineStage;
use App\Models\CampaignTimeline;
use App\Models\CampaignTimelineAction;
use App\Models\Customer;
use App\Models\PhoneScript;
use App\Models\SmsTemplate;
use App\Services\CampaignActionExecutor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Hardening + coverage for the SMS / phone (voice) campaign timeline channels.
 *
 * The real CampaignActionExecutor + SMSService/PhoneService run end-to-end;
 * only the outbound Twilio HTTP is faked, so no network is touched.
 */
class CampaignSmsChannelTest extends TestCase
{
    use RefreshDatabase;

    protected string $tenantId;

    protected function setUp(): void
    {
        parent::setUp();
        $user = $this->createAndAuthenticateUser();
        // Use the authenticated user's tenant so tenant-scoped reads (Interaction)
        // resolve to the records created during the run.
        $this->tenantId = (string) ($user->tenant_id ?? Str::uuid());

        // Ensure Twilio creds are present so the gateway actually attempts a send.
        config([
            'services.twilio.account_sid' => 'ACtestsid',
            'services.twilio.auth_token' => 'testtoken',
            'services.twilio.from_phone' => '+15005550006',
        ]);
    }

    private function executor(): CampaignActionExecutor
    {
        return app(CampaignActionExecutor::class);
    }

    private function makeCustomer(array $attributes = []): Customer
    {
        return Customer::create(array_merge([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Test Business',
            'slug' => 'test-business-'.Str::random(8),
            'pipeline_stage' => PipelineStage::HOOK,
            'phone' => '+15125550100',
            'sms_opted_in' => true,
            'phone_opted_in' => true,
            'do_not_contact' => false,
            'lead_score' => 0,
        ], $attributes));
    }

    private function makeSmsTemplate(): SmsTemplate
    {
        return SmsTemplate::create([
            'tenant_id' => $this->tenantId,
            'name' => 'Listing Reminder',
            'slug' => 'listing_reminder_sms',
            'message' => 'Hi {{business_name}}, claim your free listing.',
            'is_active' => true,
        ]);
    }

    private function smsAction(SmsTemplate $template): CampaignTimelineAction
    {
        $timeline = CampaignTimeline::create([
            'name' => 'Hook Timeline',
            'slug' => 'hook-timeline-'.Str::random(6),
            'pipeline_stage' => PipelineStage::HOOK,
            'duration_days' => 90,
            'is_active' => true,
            'is_default' => false,
        ]);

        return CampaignTimelineAction::create([
            'campaign_timeline_id' => $timeline->id,
            'day_number' => 1,
            'channel' => 'sms',
            'action_type' => 'send_sms',
            'template_type' => $template->slug,
            'parameters' => ['template_id' => $template->id],
            'priority' => 0,
            'delay_hours' => 0,
            'is_active' => true,
        ]);
    }

    private function callAction(?string $scriptId = null): CampaignTimelineAction
    {
        $timeline = CampaignTimeline::create([
            'name' => 'Hook Timeline',
            'slug' => 'hook-timeline-'.Str::random(6),
            'pipeline_stage' => PipelineStage::HOOK,
            'duration_days' => 90,
            'is_active' => true,
            'is_default' => false,
        ]);

        return CampaignTimelineAction::create([
            'campaign_timeline_id' => $timeline->id,
            'day_number' => 1,
            'channel' => 'phone',
            'action_type' => 'make_call',
            'parameters' => $scriptId ? ['script_id' => $scriptId] : [],
            'priority' => 0,
            'delay_hours' => 0,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function it_sends_sms_to_an_opted_in_customer_and_records_the_attempt(): void
    {
        Http::fake([
            'api.twilio.com/*' => Http::response([
                'sid' => 'SM123abc',
                'status' => 'queued',
            ], 201),
        ]);

        $customer = $this->makeCustomer();
        $action = $this->smsAction($this->makeSmsTemplate());

        $result = $this->executor()->execute($customer, $action);

        $this->assertSame('sms', $result['type']);
        $this->assertTrue($result['dispatched']);
        $this->assertSame('SM123abc', $result['message_sid']);
        $this->assertSame('twilio', $result['provider']);

        // Outbound call hit Twilio Messages endpoint with the rendered body.
        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/Messages.json')
                && str_contains($request['Body'], 'Test Business')
                && $request['To'] === '+15125550100';
        });

        // Attempt recorded as a customer interaction (parity with email path).
        $interaction = $customer->interactions()->where('type', 'sms_sent')->first();
        $this->assertNotNull($interaction);
        $this->assertSame('dispatched', $interaction->outcome);
        $this->assertTrue($interaction->metadata['dispatched']);
        $this->assertSame('SM123abc', $interaction->metadata['message_sid']);
    }

    /** @test */
    public function it_skips_sms_for_a_customer_who_is_not_opted_in(): void
    {
        Http::fake();

        $customer = $this->makeCustomer(['sms_opted_in' => false]);
        $action = $this->smsAction($this->makeSmsTemplate());

        $result = $this->executor()->execute($customer, $action);

        $this->assertFalse($result['dispatched']);
        $this->assertSame('customer_not_sms_contactable', $result['reason']);
        Http::assertNothingSent();
        $this->assertSame(0, $customer->interactions()->count());
    }

    /** @test */
    public function it_skips_sms_for_a_do_not_contact_customer(): void
    {
        Http::fake();

        $customer = $this->makeCustomer(['do_not_contact' => true]);
        $action = $this->smsAction($this->makeSmsTemplate());

        $result = $this->executor()->execute($customer, $action);

        $this->assertFalse($result['dispatched']);
        $this->assertSame('customer_not_sms_contactable', $result['reason']);
        Http::assertNothingSent();
    }

    /** @test */
    public function it_skips_sms_when_the_customer_has_no_phone_number(): void
    {
        Http::fake();

        $customer = $this->makeCustomer(['phone' => null]);
        $action = $this->smsAction($this->makeSmsTemplate());

        $result = $this->executor()->execute($customer, $action);

        $this->assertFalse($result['dispatched']);
        $this->assertSame('customer_not_sms_contactable', $result['reason']);
        Http::assertNothingSent();
    }

    /** @test */
    public function a_gateway_failure_does_not_crash_the_run_and_is_recorded_as_failed(): void
    {
        // Twilio returns a 400 error; SMSService catches it and returns null.
        Http::fake([
            'api.twilio.com/*' => Http::response([
                'code' => 21211,
                'message' => 'Invalid To phone number',
            ], 400),
        ]);

        $customer = $this->makeCustomer();
        $action = $this->smsAction($this->makeSmsTemplate());

        $result = $this->executor()->execute($customer, $action);

        $this->assertFalse($result['dispatched']);
        $this->assertNull($result['message_sid']);

        $interaction = $customer->interactions()->where('type', 'sms_sent')->first();
        $this->assertNotNull($interaction);
        $this->assertSame('failed', $interaction->outcome);
        $this->assertFalse($interaction->metadata['dispatched']);
    }

    /** @test */
    public function a_gateway_exception_does_not_crash_the_run(): void
    {
        // Simulate a connection-level throwable from the HTTP client.
        Http::fake(function () {
            throw new \RuntimeException('connection reset');
        });

        $customer = $this->makeCustomer();
        $action = $this->smsAction($this->makeSmsTemplate());

        // Must not throw.
        $result = $this->executor()->execute($customer, $action);

        $this->assertFalse($result['dispatched']);

        $interaction = $customer->interactions()->where('type', 'sms_sent')->first();
        $this->assertNotNull($interaction);
        $this->assertSame('failed', $interaction->outcome);
    }

    /** @test */
    public function it_returns_template_not_found_when_no_sms_template_resolves(): void
    {
        Http::fake();

        $customer = $this->makeCustomer();

        $timeline = CampaignTimeline::create([
            'name' => 'Hook Timeline',
            'slug' => 'hook-timeline-'.Str::random(6),
            'pipeline_stage' => PipelineStage::HOOK,
            'duration_days' => 90,
            'is_active' => true,
            'is_default' => false,
        ]);
        $action = CampaignTimelineAction::create([
            'campaign_timeline_id' => $timeline->id,
            'day_number' => 1,
            'channel' => 'sms',
            'action_type' => 'send_sms',
            'template_type' => 'does_not_exist',
            'priority' => 0,
            'delay_hours' => 0,
            'is_active' => true,
        ]);

        $result = $this->executor()->execute($customer, $action);

        $this->assertFalse($result['dispatched']);
        $this->assertSame('template_not_found', $result['reason']);
        Http::assertNothingSent();
    }

    /** @test */
    public function it_places_a_call_for_an_opted_in_customer_and_records_the_attempt(): void
    {
        Http::fake([
            'api.twilio.com/*' => Http::response([
                'sid' => 'CA456xyz',
                'status' => 'queued',
            ], 201),
        ]);

        $customer = $this->makeCustomer();
        $action = $this->callAction();

        $result = $this->executor()->execute($customer, $action);

        $this->assertSame('phone', $result['type']);
        $this->assertTrue($result['dispatched']);
        $this->assertSame('CA456xyz', $result['call_sid']);

        Http::assertSent(fn ($request) => str_contains($request->url(), '/Calls.json'));

        $interaction = $customer->interactions()->where('type', 'call_placed')->first();
        $this->assertNotNull($interaction);
        $this->assertSame('dispatched', $interaction->outcome);
    }

    /** @test */
    public function it_skips_a_call_for_a_customer_not_opted_in_to_phone(): void
    {
        Http::fake();

        $customer = $this->makeCustomer(['phone_opted_in' => false]);
        $action = $this->callAction();

        $result = $this->executor()->execute($customer, $action);

        $this->assertFalse($result['dispatched']);
        $this->assertSame('customer_not_callable', $result['reason']);
        Http::assertNothingSent();
    }

    /** @test */
    public function a_call_gateway_failure_does_not_crash_the_run(): void
    {
        Http::fake([
            'api.twilio.com/*' => Http::response(['message' => 'boom'], 500),
        ]);

        $customer = $this->makeCustomer();
        $action = $this->callAction();

        $result = $this->executor()->execute($customer, $action);

        $this->assertFalse($result['dispatched']);

        $interaction = $customer->interactions()->where('type', 'call_placed')->first();
        $this->assertNotNull($interaction);
        $this->assertSame('failed', $interaction->outcome);
    }

    /** @test */
    public function a_call_uses_a_phone_script_when_provided(): void
    {
        Http::fake([
            'api.twilio.com/*' => Http::response(['sid' => 'CA789', 'status' => 'queued'], 201),
        ]);

        $script = PhoneScript::create([
            'tenant_id' => $this->tenantId,
            'name' => 'Welcome Script',
            'slug' => 'welcome_call',
            'script' => 'Hello {{business_name}}, welcome to Day.News.',
            'is_active' => true,
        ]);

        $customer = $this->makeCustomer();
        $action = $this->callAction($script->slug);

        $result = $this->executor()->execute($customer, $action);

        $this->assertTrue($result['dispatched']);
        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/Calls.json')
                && str_contains($request['Twiml'] ?? '', 'Test Business');
        });
    }
}
