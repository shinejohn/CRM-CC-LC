<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Customer;
use App\Enums\PipelineStage;
use App\Events\PipelineStageChanged;
use App\Services\PipelineTransitionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;

class PipelineStageTransitionTest extends TestCase
{
    use RefreshDatabase;

    protected PipelineTransitionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createAndAuthenticateUser();
        $this->service = new PipelineTransitionService();
    }

    /** @test */
    public function it_transitions_customer_through_pipeline_stages(): void
    {
        Event::fake();

        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(),
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'pipeline_stage' => PipelineStage::HOOK,
            'engagement_score' => 0,
            'lead_score' => 0,
        ]);

        // Transition Hook -> Engagement
        $this->service->transition($customer, PipelineStage::ENGAGEMENT, 'manual');
        $customer->refresh();
        $this->assertEquals(PipelineStage::ENGAGEMENT, $customer->pipeline_stage);

        // Transition Engagement -> Sales
        $this->service->transition($customer, PipelineStage::SALES, 'manual');
        $customer->refresh();
        $this->assertEquals(PipelineStage::SALES, $customer->pipeline_stage);

        // Transition Sales -> Retention
        $this->service->transition($customer, PipelineStage::RETENTION, 'conversion');
        $customer->refresh();
        $this->assertEquals(PipelineStage::RETENTION, $customer->pipeline_stage);

        Event::assertDispatched(PipelineStageChanged::class, 3);
    }

    /** @test */
    public function it_blocks_invalid_stage_transitions(): void
    {
        Event::fake();

        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(),
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'pipeline_stage' => PipelineStage::HOOK,
            'lead_score' => 0,
        ]);

        // Try to jump from Hook to Sales (should fail)
        $result = $this->service->transition($customer, PipelineStage::SALES, 'manual');

        $this->assertFalse($result);
        $customer->refresh();
        $this->assertEquals(PipelineStage::HOOK, $customer->pipeline_stage);

        Event::assertNotDispatched(PipelineStageChanged::class);
    }

    /** @test */
    public function it_automatically_advances_on_engagement_threshold(): void
    {
        Event::fake();

        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(),
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'pipeline_stage' => PipelineStage::HOOK,
            'engagement_score' => 55, // Above threshold of 50
            'lead_score' => 0,
        ]);

        $this->service->checkEngagementThreshold($customer);

        $customer->refresh();
        $this->assertEquals(PipelineStage::ENGAGEMENT, $customer->pipeline_stage);

        Event::assertDispatched(PipelineStageChanged::class, function ($event) {
            return $event->trigger === 'engagement_threshold';
        });
    }

    /** @test */
    public function it_handles_trial_acceptance_workflow(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(),
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'pipeline_stage' => PipelineStage::HOOK,
            'lead_score' => 0,
        ]);

        $this->service->handleTrialAcceptance($customer);

        $customer->refresh();
        $this->assertTrue($customer->trial_active);
        $this->assertNotNull($customer->trial_started_at);
        $this->assertNotNull($customer->trial_ends_at);
        $this->assertEquals(90, $customer->trial_started_at->diffInDays($customer->trial_ends_at));
    }

    /** @test */
    public function it_records_complete_stage_history(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(),
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'pipeline_stage' => PipelineStage::HOOK,
            'stage_entered_at' => now()->subDays(10),
            'days_in_stage' => 10,
            'lead_score' => 0,
        ]);

        $this->service->transition($customer, PipelineStage::ENGAGEMENT, 'manual');
        $customer->refresh();

        $history = $customer->stage_history;
        $this->assertIsArray($history);
        $this->assertCount(1, $history);
        $this->assertEquals('hook', $history[0]['from']);
        $this->assertEquals('engagement', $history[0]['to']);
        $this->assertEquals(10, $history[0]['days_in_previous']);
        $this->assertEquals('manual', $history[0]['trigger']);
    }
}

