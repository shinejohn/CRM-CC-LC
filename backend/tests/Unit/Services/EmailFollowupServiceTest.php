<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\EmailFollowupService;
use App\Models\Customer;
use App\Models\CampaignSend;
use App\Models\Interaction;
use App\Enums\PipelineStage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EmailFollowupServiceTest extends TestCase
{
    use RefreshDatabase;

    protected EmailFollowupService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new EmailFollowupService();

        // Create a default campaign for all tests
        \App\Models\Campaign::create([
            'id' => 'TEST-001',
            'type' => 'email',
            'week' => 1,
            'day' => 1,
            'title' => 'Test Campaign',
            'subject' => 'Test Subject',
            'slug' => 'test-campaign',
        ]);
    }

    /** @test */
    public function it_determines_sms_strategy_for_high_engagement_customers(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(), 'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'email' => 'test@example.com',
            'engagement_score' => 75,
            'email_opted_in' => true,
            'lead_score' => 0,
        ]);

        $campaignSend = CampaignSend::create([
            'smb_id' => $customer->id,
            'campaign_id' => 'TEST-001',
            'email' => $customer->email,
            'subject' => 'Test Email',
            'status' => 'sent',
            'sent_at' => now()->subHours(50),
            'followup_count' => 0,
        ]);

        $this->service->handleUnopenedEmail($customer, $campaignSend, 50);

        $campaignSend->refresh();
        $this->assertEquals('send_sms', $campaignSend->followup_strategy);
        $this->assertEquals(1, $campaignSend->followup_count);
        $this->assertNotNull($campaignSend->followup_triggered_at);
    }

    /** @test */
    public function it_determines_resend_email_strategy_for_medium_engagement_customers(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(), 'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'email' => 'test@example.com',
            'engagement_score' => 50,
            'email_opted_in' => true,
            'lead_score' => 0,
        ]);

        $campaignSend = CampaignSend::create([
            'smb_id' => $customer->id,
            'campaign_id' => 'TEST-001',
            'email' => $customer->email,
            'subject' => 'Test Email',
            'status' => 'sent',
            'sent_at' => now()->subHours(50),
            'followup_count' => 0,
        ]);

        $this->service->handleUnopenedEmail($customer, $campaignSend, 50);

        $campaignSend->refresh();
        $this->assertEquals('resend_email', $campaignSend->followup_strategy);
    }

    /** @test */
    public function it_determines_schedule_call_strategy_for_low_engagement_second_followup(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(), 'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'email' => 'test@example.com',
            'phone' => '+1234567890',
            'engagement_score' => 30,
            'phone_opted_in' => true,
            'lead_score' => 0,
        ]);

        $campaignSend = CampaignSend::create([
            'smb_id' => $customer->id,
            'campaign_id' => 'TEST-001',
            'email' => $customer->email,
            'subject' => 'Test Email',
            'status' => 'sent',
            'sent_at' => now()->subHours(50),
            'followup_count' => 1,
        ]);

        $this->service->handleUnopenedEmail($customer, $campaignSend, 50);

        $campaignSend->refresh();
        $this->assertEquals('schedule_call', $campaignSend->followup_strategy);
    }

    /** @test */
    public function it_escalates_after_two_failed_followups(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(), 'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'email' => 'test@example.com',
            'engagement_score' => 50,
            'email_opted_in' => true,
            'lead_score' => 0,
        ]);

        $campaignSend = CampaignSend::create([
            'smb_id' => $customer->id,
            'campaign_id' => 'TEST-001',
            'email' => $customer->email,
            'subject' => 'Test Email',
            'status' => 'sent',
            'sent_at' => now()->subHours(50),
            'followup_count' => 2,
        ]);

        $this->service->handleUnopenedEmail($customer, $campaignSend, 50);

        $campaignSend->refresh();
        $this->assertEquals('escalated', $campaignSend->followup_strategy);

        // Check that escalation interaction was created
        $interaction = Interaction::where('customer_id', $customer->id)
            ->where('type', 'human_escalation')
            ->first();
        $this->assertNotNull($interaction);
        $this->assertEquals('high', $interaction->priority);
    }

    /** @test */
    public function it_skips_already_escalated_emails(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(), 'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'email' => 'test@example.com',
            'engagement_score' => 50,
            'email_opted_in' => true,
            'lead_score' => 0,
        ]);

        $campaignSend = CampaignSend::create([
            'smb_id' => $customer->id,
            'campaign_id' => 'TEST-001',
            'email' => $customer->email,
            'subject' => 'Test Email',
            'status' => 'sent',
            'sent_at' => now()->subHours(50),
            'followup_strategy' => 'escalated',
            'followup_count' => 2,
        ]);

        $initialCount = Interaction::count();
        $this->service->handleUnopenedEmail($customer, $campaignSend, 50);

        // Should not create new interactions
        $this->assertEquals($initialCount, Interaction::count());
    }

    /** @test */
    public function it_creates_interaction_for_resend_email(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(), 'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'email' => 'test@example.com',
            'engagement_score' => 50,
            'email_opted_in' => true,
            'lead_score' => 0,
        ]);

        $campaignSend = CampaignSend::create([
            'smb_id' => $customer->id,
            'campaign_id' => 'TEST-001',
            'email' => $customer->email,
            'subject' => 'Test Email',
            'status' => 'sent',
            'sent_at' => now()->subHours(50),
            'followup_count' => 0,
        ]);

        $this->service->handleUnopenedEmail($customer, $campaignSend, 50);

        $interaction = Interaction::where('customer_id', $customer->id)
            ->where('type', 'email_followup')
            ->first();
        $this->assertNotNull($interaction);
        $this->assertEquals('completed', $interaction->status);
    }
}

