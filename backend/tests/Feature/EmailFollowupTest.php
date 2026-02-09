<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Customer;
use App\Models\CampaignSend;
use App\Models\Interaction;
use App\Services\EmailFollowupService;
use App\Events\EmailNotOpened;
use App\Jobs\CheckUnopenedEmails;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;

class EmailFollowupTest extends TestCase
{
    use RefreshDatabase;

    private string $tenantId;
    private Customer $customer;
    protected EmailFollowupService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createAndAuthenticateUser();

        $this->tenantId = (string) Str::uuid();
        $this->customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Test Customer',
            'slug' => 'test-customer-' . Str::random(6),
            'email' => 'test@example.com',
            'email_opted_in' => true,
            'lead_score' => 0,
        ]);
        $this->service = new EmailFollowupService();
    }

    /** @test */
    public function it_finds_unopened_emails_after_threshold(): void
    {
        Queue::fake();

        // Create email sent 50 hours ago (over 48 hour threshold)
        $campaignSend = CampaignSend::create([
            'smb_id' => $this->customer->id,
            'campaign_id' => 'TEST-001',
            'email' => $this->customer->email,
            'subject' => 'Test Email',
            'status' => 'sent',
            'sent_at' => now()->subHours(50),
            'followup_triggered_at' => null, // Keep this from original for clarity if not explicitly removed
        ]);

        $job = new CheckUnopenedEmails(48);
        $job->handle();

        // The original test was dispatching an event, the new snippet seems to be checking for a new campaign_send.
        // I will combine the intent, assuming the new snippet's assertDatabaseHas is the primary new check,
        // and the Event::assertDispatched is still relevant for the EmailNotOpened event.
        // The provided snippet had a misplaced `$job->handle();` after `assertDatabaseHas`,
        // which I'm correcting by keeping the original `$job->handle();` before the assertions.

        $this->assertDatabaseHas('campaign_sends', [
            'smb_id' => $this->customer->id,
            'subject' => 'Follow-up: Test Email',
        ]);

        Event::assertDispatched(EmailNotOpened::class, function ($event) use ($campaignSend) {
            return $event->customer->id === $this->customer->id
                && $event->campaignSend->id === $campaignSend->id;
        });
    }

    /** @test */
    public function it_skips_emails_already_opened(): void
    {
        Event::fake();

        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(),
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'email' => 'test@example.com',
            'email_opted_in' => true,
            'lead_score' => 0,
        ]);

        // Create email that was opened
        CampaignSend::create([
            'smb_id' => $customer->id,
            'campaign_id' => 'TEST-001',
            'email' => $customer->email,
            'subject' => 'Test Email',
            'status' => 'sent',
            'sent_at' => now()->subHours(50),
            'opened_at' => now()->subHours(45),
            'followup_triggered_at' => null,
        ]);

        $job = new CheckUnopenedEmails(48);
        $job->handle();

        Event::assertNotDispatched(EmailNotOpened::class);
    }

    /** @test */
    public function it_executes_followup_strategy(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(),
            'business_name' => 'Test Business',
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

        // Check interaction was created
        $interaction = Interaction::where('customer_id', $customer->id)
            ->where('type', 'sms_followup')
            ->first();
        $this->assertNotNull($interaction);
    }

    /** @test */
    public function it_escalates_after_multiple_followups(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(),
            'business_name' => 'Test Business',
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

        // Check escalation interaction
        $interaction = Interaction::where('customer_id', $customer->id)
            ->where('type', 'human_escalation')
            ->first();
        $this->assertNotNull($interaction);
        $this->assertEquals('high', $interaction->priority);
    }
}

