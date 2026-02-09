<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\CampaignOrchestratorService;
use App\Services\CampaignActionExecutor;
use App\Models\Customer;
use App\Models\CampaignTimeline;
use App\Models\CampaignTimelineAction;
use App\Models\CustomerTimelineProgress;
use App\Enums\PipelineStage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Mockery;

class CampaignOrchestratorServiceTest extends TestCase
{
    use RefreshDatabase;

    protected CampaignOrchestratorService $service;
    protected CampaignActionExecutor $actionExecutor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actionExecutor = Mockery::mock(CampaignActionExecutor::class);
        $this->service = new CampaignOrchestratorService($this->actionExecutor);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_starts_timeline_for_customer(): void
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
            'name' => 'Test Timeline',
            'slug' => 'test-timeline',
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
    public function it_does_not_create_duplicate_active_timelines(): void
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
            'name' => 'Test Timeline',
            'slug' => 'test-timeline',
            'pipeline_stage' => PipelineStage::HOOK,
            'duration_days' => 90,
            'is_active' => true,
            'is_default' => true,
        ]);

        $progress1 = $this->service->startTimeline($customer, $timeline);
        $progress2 = $this->service->startTimeline($customer, $timeline);

        $this->assertEquals($progress1->id, $progress2->id);
        $this->assertEquals(1, CustomerTimelineProgress::where('customer_id', $customer->id)
            ->where('campaign_timeline_id', $timeline->id)
            ->where('status', 'active')
            ->count());
    }

    /** @test */
    public function it_assigns_timeline_for_stage(): void
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

        $progress = $this->service->assignTimelineForStage($customer);

        $this->assertNotNull($progress);
        $this->assertEquals($timeline->id, $progress->campaign_timeline_id);
    }

    /** @test */
    public function it_returns_null_when_no_timeline_found(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) \Illuminate\Support\Str::uuid(),
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'pipeline_stage' => PipelineStage::ENGAGEMENT,
            'lead_score' => 0,
        ]);

        $progress = $this->service->assignTimelineForStage($customer);

        $this->assertNull($progress);
    }

    /** @test */
    public function it_executes_actions_for_customer(): void
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
            'name' => 'Test Timeline',
            'slug' => 'test-timeline',
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
            'priority' => 0,
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
            ->andReturn(['status' => 'sent']);

        $results = $this->service->executeActionsForCustomer($customer);

        $this->assertIsArray($results);
        $this->assertNotEmpty($results);
    }
}

