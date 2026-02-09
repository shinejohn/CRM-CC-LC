<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Customer;
use App\Models\CampaignTimeline;
use App\Models\CampaignTimelineAction;
use App\Models\CustomerTimelineProgress;
use App\Enums\PipelineStage;
use App\Services\CampaignOrchestratorService;
use App\Services\CampaignActionExecutor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Mockery;

class CampaignTimelineExecutionTest extends TestCase
{
    use RefreshDatabase;

    protected CampaignOrchestratorService $service;
    protected CampaignActionExecutor $actionExecutor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createAndAuthenticateUser();
        $this->actionExecutor = Mockery::mock(CampaignActionExecutor::class);
        $this->service = new CampaignOrchestratorService($this->actionExecutor);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_starts_customer_on_timeline(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(),
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'pipeline_stage' => PipelineStage::HOOK,
            'lead_score' => 0,
        ]);

        $timeline = CampaignTimeline::create([
            'name' => 'Hook Timeline',
            'slug' => 'hook-timeline',
            'pipeline_stage' => PipelineStage::HOOK,
            'duration_days' => 90,
            'is_active' => true,
            'is_default' => true,
        ]);

        $progress = $this->service->startTimeline($customer, $timeline);

        $this->assertInstanceOf(CustomerTimelineProgress::class, $progress);
        $this->assertEquals($customer->id, $progress->customer_id);
        $this->assertEquals($timeline->id, $progress->campaign_timeline_id);
        $this->assertEquals(1, $progress->current_day);
        $this->assertEquals('active', $progress->status);
    }

    /** @test */
    public function it_executes_actions_for_day(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(),
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'pipeline_stage' => PipelineStage::HOOK,
            'email' => 'test@example.com',
            'email_opted_in' => true,
            'lead_score' => 0,
        ]);

        $timeline = CampaignTimeline::create([
            'name' => 'Hook Timeline',
            'slug' => 'hook-timeline',
            'pipeline_stage' => PipelineStage::HOOK,
            'duration_days' => 90,
            'is_active' => true,
            'is_default' => true,
        ]);

        $action = CampaignTimelineAction::create([
            'campaign_timeline_id' => $timeline->id,
            'day_number' => 1,
            'channel' => 'email',
            'action_type' => 'send_email',
            'campaign_id' => 'TEST-001',
            'priority' => 0,
            'delay_hours' => 0,
            'is_active' => true,
        ]);

        $progress = CustomerTimelineProgress::create([
            'customer_id' => $customer->id,
            'campaign_timeline_id' => $timeline->id,
            'current_day' => 1,
            'started_at' => now(),
            'status' => 'active',
            'completed_actions' => [],
            'skipped_actions' => [],
        ]);

        $this->actionExecutor->shouldReceive('execute')
            ->once()
            ->with($customer, Mockery::on(function ($arg) use ($action) {
                return $arg->id === $action->id;
            }))
            ->andReturn(['status' => 'sent']);

        $results = $this->service->executeActionsForCustomer($customer);

        $this->assertIsArray($results);
        $this->assertNotEmpty($results);

        $progress->refresh();
        $this->assertTrue($progress->isActionCompleted($action->id));
    }

    /** @test */
    public function it_skips_actions_when_conditions_not_met(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(),
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'pipeline_stage' => PipelineStage::HOOK,
            'email' => 'test@example.com',
            'email_opted_in' => true,
            'last_email_open' => now()->subHours(1), // Recently opened email
            'lead_score' => 0,
        ]);

        $timeline = CampaignTimeline::create([
            'name' => 'Hook Timeline',
            'slug' => 'hook-timeline',
            'pipeline_stage' => PipelineStage::HOOK,
            'duration_days' => 90,
            'is_active' => true,
            'is_default' => true,
        ]);

        // Action with condition: skip if email opened within 48 hours
        $action = CampaignTimelineAction::create([
            'campaign_timeline_id' => $timeline->id,
            'day_number' => 1,
            'channel' => 'email',
            'action_type' => 'send_email',
            'campaign_id' => 'TEST-001',
            'conditions' => [
                'if' => 'email_opened',
                'within_hours' => 48,
                'then' => 'skip',
            ],
            'priority' => 0,
            'delay_hours' => 0,
            'is_active' => true,
        ]);

        $progress = CustomerTimelineProgress::create([
            'customer_id' => $customer->id,
            'campaign_timeline_id' => $timeline->id,
            'current_day' => 1,
            'started_at' => now(),
            'status' => 'active',
            'completed_actions' => [],
            'skipped_actions' => [],
        ]);

        $this->actionExecutor->shouldNotReceive('execute');

        $results = $this->service->executeActionsForCustomer($customer);

        $progress->refresh();
        $this->assertTrue($progress->isActionSkipped($action->id));
    }
}

