<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\CampaignTimeline;
use App\Models\Customer;
use App\Models\CustomerTimelineProgress;
use App\Services\EmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

final class EmailUnsubscribeTest extends TestCase
{
    use RefreshDatabase;

    private function makeCustomer(): Customer
    {
        return Customer::factory()->create([
            'email_suppressed' => false,
            'email_suppressed_reason' => null,
        ]);
    }

    public function test_signed_unsubscribe_link_suppresses_customer_and_pauses_timeline(): void
    {
        $customer = $this->makeCustomer();

        $timeline = CampaignTimeline::create([
            'name' => 'MD Hook',
            'slug' => 'md-hook',
            'pipeline_stage' => \App\Enums\PipelineStage::HOOK,
            'duration_days' => 30,
            'is_active' => true,
        ]);

        $progress = CustomerTimelineProgress::create([
            'customer_id' => $customer->id,
            'campaign_timeline_id' => $timeline->id,
            'current_day' => 1,
            'started_at' => now(),
            'status' => 'active',
        ]);

        $url = URL::signedRoute('public.unsubscribe', ['customer' => $customer->id]);

        $response = $this->get($url);

        $response->assertStatus(200);
        $response->assertSee('unsubscribed', false);

        $customer->refresh();
        $this->assertTrue($customer->email_suppressed);
        $this->assertSame('unsubscribed', $customer->email_suppressed_reason);

        $progress->refresh();
        $this->assertSame('paused', $progress->status);
        $this->assertNotNull($progress->paused_at);
    }

    public function test_unsigned_or_tampered_url_is_rejected(): void
    {
        $customer = $this->makeCustomer();

        // Unsigned (no signature query string at all) -> 403
        $this->get('/unsubscribe/'.$customer->id)->assertStatus(403);

        // Tampered signature -> 403
        $signed = URL::signedRoute('public.unsubscribe', ['customer' => $customer->id]);
        $tampered = $signed.'X';
        $this->get($tampered)->assertStatus(403);

        $customer->refresh();
        $this->assertFalse($customer->email_suppressed);
    }

    public function test_one_click_post_endpoint_suppresses_and_returns_200(): void
    {
        $customer = $this->makeCustomer();

        $url = URL::signedRoute('public.unsubscribe', ['customer' => $customer->id]);
        // The POST one-click endpoint shares the route key but uses the POST verb.
        $postUrl = str_replace('/unsubscribe/', '/unsubscribe/', $url);

        $response = $this->post($postUrl);
        $response->assertStatus(200);

        $customer->refresh();
        $this->assertTrue($customer->email_suppressed);
        $this->assertSame('unsubscribed', $customer->email_suppressed_reason);
    }

    public function test_suppressed_customer_is_not_sent_email(): void
    {
        $customer = $this->makeCustomer();
        $customer->forceFill([
            'email_suppressed' => true,
            'email_suppressed_reason' => 'unsubscribed',
        ])->save();

        Http::fake();

        config(['services.email_gateway.provider' => 'postal']);
        config(['services.postal.api_url' => 'https://postal.test']);
        config(['services.postal.server_key' => 'test-key']);

        $service = app(EmailService::class);
        $result = $service->send($customer->email, 'Hello', '<p>Hi there</p>');

        $this->assertIsArray($result);
        $this->assertFalse($result['success']);
        $this->assertSame('suppression', $result['provider']);

        Http::assertNothingSent();
    }

    public function test_normal_send_includes_unsubscribe_header_and_link(): void
    {
        $customer = $this->makeCustomer();

        config(['services.email_gateway.provider' => 'postal']);
        config(['services.postal.api_url' => 'https://postal.test']);
        config(['services.postal.server_key' => 'test-key']);

        Http::fake([
            'postal.test/*' => Http::response([
                'status' => 'success',
                'data' => ['message_id' => 'abc123'],
            ], 200),
        ]);

        $service = app(EmailService::class);
        $result = $service->send(
            $customer->email,
            'Welcome',
            '<p>Welcome to Day.News</p>',
            null,
            ['customer_id' => $customer->id]
        );

        $this->assertIsArray($result);
        $this->assertTrue($result['success']);

        Http::assertSent(function ($request) use ($customer) {
            $body = $request->data();

            $headers = $body['headers'] ?? [];
            $hasListUnsub = isset($headers['List-Unsubscribe'])
                && str_contains($headers['List-Unsubscribe'], '/unsubscribe/'.$customer->id);
            $hasOneClick = ($headers['List-Unsubscribe-Post'] ?? null) === 'List-Unsubscribe=One-Click';

            $hasLink = str_contains($body['html_body'] ?? '', '/unsubscribe/'.$customer->id)
                && str_contains(strtolower($body['html_body'] ?? ''), 'unsubscribe');

            return $hasListUnsub && $hasOneClick && $hasLink;
        });
    }
}
