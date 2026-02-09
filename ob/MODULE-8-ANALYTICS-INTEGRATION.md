# MODULE 8: ANALYTICS & INTEGRATION
## Dashboards, Reporting & Cross-Module Integration

**Owner:** Lead Agent (Agent 0)
**Timeline:** Week 7-9
**Dependencies:** All other modules
**Blocks:** None (final module)

---

## OBJECTIVE

Build the analytics dashboards, cross-module integration tests, and ensure all modules work together seamlessly. This is the "glue" module that validates the entire system.

---

## TABLES OWNED

- `analytics_events`
- `reports` (if storing generated reports)

---

## RESPONSIBILITIES

1. **Analytics Dashboards** - Executive, Operations, Campaign, Customer
2. **Integration Testing** - End-to-end workflow validation
3. **Event Aggregation** - Listen to all module events, aggregate metrics
4. **Reporting** - Scheduled and on-demand reports

---

## FEATURES TO BUILD

### 1. Analytics Event Collection

```php
// app/Listeners/AnalyticsEventListener.php

class AnalyticsEventListener
{
    /**
     * Events to listen for from all modules
     */
    public $subscribe = [
        // Module 1: SMB
        SMBCreated::class => 'handleSMBCreated',
        SMBTierChanged::class => 'handleTierChanged',
        
        // Module 2: Campaign
        CampaignSendCompleted::class => 'handleCampaignSend',
        EmailOpened::class => 'handleEmailOpen',
        EmailClicked::class => 'handleEmailClick',
        RVMDelivered::class => 'handleRVMDelivery',
        
        // Module 3: Learning Center
        ContentViewed::class => 'handleContentView',
        ContentCompleted::class => 'handleContentComplete',
        
        // Module 4: Approvals
        ApprovalSubmitted::class => 'handleApproval',
        ApprovalProvisioned::class => 'handleProvisioning',
        UpsellAccepted::class => 'handleUpsell',
        
        // Module 5: Inbound
        InboundEmailReceived::class => 'handleInboundEmail',
        CallbackReceived::class => 'handleCallback',
        
        // Module 7: AI
        AITaskCompleted::class => 'handleAITask',
    ];
    
    protected function recordEvent(string $type, string $category, ?int $smbId, ?int $communityId, array $properties): void
    {
        AnalyticsEvent::create([
            'event_type' => $type,
            'event_category' => $category,
            'smb_id' => $smbId,
            'community_id' => $communityId,
            'properties' => $properties,
            'occurred_at' => now(),
        ]);
    }
    
    public function handleCampaignSend(CampaignSendCompleted $event): void
    {
        $send = CampaignSend::find($event->campaignSendId);
        
        $this->recordEvent(
            'campaign_send',
            'outbound',
            $event->smbId,
            $send?->smb?->community_id,
            [
                'campaign_id' => $event->campaignId,
                'campaign_type' => $send?->campaign?->type,
            ]
        );
    }
    
    public function handleApproval(ApprovalSubmitted $event): void
    {
        $approval = Approval::with('smb')->find($event->approvalId);
        
        $this->recordEvent(
            'approval_submitted',
            'conversion',
            $event->smbId,
            $approval?->smb?->community_id,
            [
                'service_type' => $event->serviceType,
                'source_type' => $approval?->source_type,
            ]
        );
    }
    
    // ... handlers for all other events
}
```

### 2. Executive Dashboard

```php
// app/Http/Controllers/Api/V1/Analytics/ExecutiveController.php

class ExecutiveController extends Controller
{
    // GET /api/v1/analytics/executive
    public function index(Request $request)
    {
        $range = $this->getDateRange($request);
        
        return [
            'summary' => $this->getSummary($range),
            'funnel' => $this->getFunnelMetrics($range),
            'trends' => $this->getTrends($range),
            'top_campaigns' => $this->getTopCampaigns($range),
            'revenue' => $this->getRevenueMetrics($range),
        ];
    }
    
    protected function getSummary(array $range): array
    {
        return [
            'total_smbs' => SMB::count(),
            'active_smbs' => SMB::where('campaign_status', 'active')->count(),
            'new_smbs_period' => SMB::whereBetween('created_at', $range)->count(),
            
            'total_approvals' => Approval::count(),
            'approvals_period' => Approval::whereBetween('approved_at', $range)->count(),
            
            'conversion_rate' => $this->calculateConversionRate($range),
            
            'tier_distribution' => [
                'premium' => SMB::where('engagement_tier', 1)->count(),
                'engaged' => SMB::where('engagement_tier', 2)->count(),
                'active' => SMB::where('engagement_tier', 3)->count(),
                'passive' => SMB::where('engagement_tier', 4)->count(),
            ],
        ];
    }
    
    protected function getFunnelMetrics(array $range): array
    {
        $emailsSent = CampaignSend::whereBetween('sent_at', $range)->count();
        $emailsOpened = CampaignSend::whereBetween('sent_at', $range)->whereNotNull('opened_at')->count();
        $emailsClicked = CampaignSend::whereBetween('sent_at', $range)->whereNotNull('clicked_at')->count();
        $contentViews = ContentView::whereBetween('started_at', $range)->count();
        $contentCompleted = ContentView::whereBetween('completed_at', $range)->count();
        $approvals = Approval::whereBetween('approved_at', $range)->count();
        
        return [
            'emails_sent' => $emailsSent,
            'emails_opened' => $emailsOpened,
            'open_rate' => $emailsSent > 0 ? round($emailsOpened / $emailsSent * 100, 2) : 0,
            'emails_clicked' => $emailsClicked,
            'click_rate' => $emailsOpened > 0 ? round($emailsClicked / $emailsOpened * 100, 2) : 0,
            'content_views' => $contentViews,
            'content_completed' => $contentCompleted,
            'completion_rate' => $contentViews > 0 ? round($contentCompleted / $contentViews * 100, 2) : 0,
            'approvals' => $approvals,
            'approval_rate' => $emailsClicked > 0 ? round($approvals / $emailsClicked * 100, 2) : 0,
        ];
    }
    
    protected function getTrends(array $range): array
    {
        // Daily metrics for charting
        return AnalyticsEvent::selectRaw('DATE(occurred_at) as date, event_category, COUNT(*) as count')
            ->whereBetween('occurred_at', $range)
            ->groupBy('date', 'event_category')
            ->orderBy('date')
            ->get()
            ->groupBy('date')
            ->map(fn($group) => $group->pluck('count', 'event_category'))
            ->toArray();
    }
    
    protected function getTopCampaigns(array $range): array
    {
        return CampaignSend::selectRaw('campaign_id, COUNT(*) as sends, SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opens, SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicks')
            ->whereBetween('sent_at', $range)
            ->groupBy('campaign_id')
            ->orderByDesc('clicks')
            ->limit(10)
            ->get()
            ->map(fn($row) => [
                'campaign_id' => $row->campaign_id,
                'sends' => $row->sends,
                'opens' => $row->opens,
                'clicks' => $row->clicks,
                'open_rate' => round($row->opens / $row->sends * 100, 2),
                'click_rate' => $row->opens > 0 ? round($row->clicks / $row->opens * 100, 2) : 0,
            ])
            ->toArray();
    }
}
```

### 3. Operations Dashboard

```php
// app/Http/Controllers/Api/V1/Analytics/OperationsController.php

class OperationsController extends Controller
{
    // GET /api/v1/analytics/operations
    public function index(Request $request)
    {
        return [
            'queue_health' => $this->getQueueHealth(),
            'email_health' => $this->getEmailHealth(),
            'rvm_health' => $this->getRVMHealth(),
            'errors' => $this->getRecentErrors(),
            'system_metrics' => $this->getSystemMetrics(),
        ];
    }
    
    protected function getQueueHealth(): array
    {
        return [
            'pending_jobs' => DB::table('jobs')->count(),
            'failed_jobs_24h' => DB::table('failed_jobs')
                ->where('failed_at', '>=', now()->subDay())
                ->count(),
            'jobs_processed_24h' => AnalyticsEvent::where('event_type', 'job_processed')
                ->where('occurred_at', '>=', now()->subDay())
                ->count(),
            'queues' => [
                'emails' => Redis::llen('queues:emails'),
                'rvm' => Redis::llen('queues:rvm'),
                'ai' => Redis::llen('queues:ai'),
                'default' => Redis::llen('queues:default'),
            ],
        ];
    }
    
    protected function getEmailHealth(): array
    {
        $last24h = now()->subDay();
        
        $sends = CampaignSend::where('sent_at', '>=', $last24h);
        
        return [
            'sent' => $sends->count(),
            'delivered' => $sends->clone()->whereNotNull('delivered_at')->count(),
            'bounced' => $sends->clone()->where('status', 'bounced')->count(),
            'complained' => $sends->clone()->where('status', 'complained')->count(),
            'bounce_rate' => $this->calculateRate($sends, 'bounced'),
            'complaint_rate' => $this->calculateRate($sends, 'complained'),
            'status' => $this->getEmailHealthStatus(),
        ];
    }
    
    protected function getRVMHealth(): array
    {
        $last24h = now()->subDay();
        
        return [
            'queued' => RvmDrop::where('status', 'queued')->count(),
            'sent_24h' => RvmDrop::where('sent_at', '>=', $last24h)->count(),
            'delivered_24h' => RvmDrop::where('delivered_at', '>=', $last24h)->count(),
            'failed_24h' => RvmDrop::where('status', 'failed')
                ->where('updated_at', '>=', $last24h)->count(),
            'callbacks_24h' => Callback::where('started_at', '>=', $last24h)->count(),
        ];
    }
    
    protected function getEmailHealthStatus(): string
    {
        $bounceRate = $this->getBounceRate();
        $complaintRate = $this->getComplaintRate();
        
        if ($bounceRate > 5 || $complaintRate > 0.1) {
            return 'critical';
        }
        if ($bounceRate > 3 || $complaintRate > 0.05) {
            return 'warning';
        }
        return 'healthy';
    }
}
```

### 4. Campaign Dashboard

```php
// app/Http/Controllers/Api/V1/Analytics/CampaignController.php

class CampaignAnalyticsController extends Controller
{
    // GET /api/v1/analytics/campaigns
    public function index(Request $request)
    {
        return [
            'overview' => $this->getOverview(),
            'by_type' => $this->getByType(),
            'by_week' => $this->getByWeek(),
            'ab_tests' => $this->getABTests(),
        ];
    }
    
    // GET /api/v1/analytics/campaigns/{id}
    public function show(string $campaignId)
    {
        $campaign = Campaign::findOrFail($campaignId);
        
        return [
            'campaign' => $campaign,
            'sends' => $this->getSendStats($campaign),
            'engagement' => $this->getEngagementStats($campaign),
            'conversions' => $this->getConversionStats($campaign),
            'rvm' => $this->getRVMStats($campaign),
            'hourly_performance' => $this->getHourlyPerformance($campaign),
        ];
    }
    
    protected function getByType(): array
    {
        return Campaign::selectRaw('type, COUNT(*) as campaigns')
            ->groupBy('type')
            ->get()
            ->map(function ($row) {
                $sends = CampaignSend::whereHas('campaign', fn($q) => $q->where('type', $row->type));
                
                return [
                    'type' => $row->type,
                    'campaigns' => $row->campaigns,
                    'total_sends' => $sends->count(),
                    'open_rate' => $this->calculateOpenRate($sends),
                    'click_rate' => $this->calculateClickRate($sends),
                    'approval_rate' => $this->calculateApprovalRate($row->type),
                ];
            })
            ->toArray();
    }
}
```

### 5. Integration Tests

```php
// tests/Integration/FullFunnelTest.php

class FullFunnelTest extends TestCase
{
    use RefreshDatabase;
    
    /**
     * Test complete funnel: Email → Open → Click → Content → Approval → Provisioning
     */
    public function test_complete_funnel_flow()
    {
        // 1. Create SMB
        $smb = SMB::factory()->create([
            'campaign_status' => 'active',
            'manifest_destiny_day' => 1,
        ]);
        
        // 2. Schedule campaign
        $campaign = Campaign::factory()->create(['id' => 'HOOK-001']);
        $scheduler = app(CampaignServiceInterface::class);
        $send = $scheduler->queueSend($smb->id, $campaign->id);
        
        $this->assertDatabaseHas('campaign_sends', [
            'smb_id' => $smb->id,
            'status' => 'queued',
        ]);
        
        // 3. Process send
        dispatch_sync(new SendCampaignEmail($send->id));
        
        $send->refresh();
        $this->assertEquals('sent', $send->status);
        $this->assertNotNull($send->message_id);
        
        // 4. Simulate email open
        $this->get("/track/open/{$send->uuid}");
        
        $send->refresh();
        $this->assertNotNull($send->opened_at);
        
        // 5. Simulate click to content
        $this->get("/track/click/{$send->uuid}?url=" . urlencode('/learn/hook-001'));
        
        $send->refresh();
        $this->assertNotNull($send->clicked_at);
        
        // 6. Track content view
        $contentService = app(LearningCenterServiceInterface::class);
        $viewId = $contentService->trackViewStart($smb->id, 'hook-001', ['source' => 'email']);
        $contentService->trackViewComplete($viewId);
        
        $this->assertDatabaseHas('content_views', [
            'smb_id' => $smb->id,
            'content_slug' => 'hook-001',
        ]);
        
        // 7. Submit approval
        $approvalService = app(ApprovalServiceInterface::class);
        $token = $approvalService->generateToken($smb->id, 'listing_claim', 'HOOK-001');
        
        $response = $this->post('/approve', [
            'smb_id' => $smb->id,
            'service_type' => 'listing_claim',
            'source' => 'HOOK-001',
            'token' => $token,
            'approver_name' => $smb->primary_contact_name,
            'approver_email' => $smb->primary_email,
            'contact_consent' => true,
        ]);
        
        $response->assertRedirect();
        
        $this->assertDatabaseHas('approvals', [
            'smb_id' => $smb->id,
            'service_type' => 'listing_claim',
            'status' => 'pending',
        ]);
        
        // 8. Process approval
        $approval = Approval::where('smb_id', $smb->id)->first();
        dispatch_sync(new ProcessApproval($approval->id));
        
        // 9. Verify SMB updated
        $smb->refresh();
        $this->assertContains('listing_claim', $smb->services_approved_pending);
        $this->assertGreaterThan(0, $smb->total_approvals);
        
        // 10. Verify analytics recorded
        $this->assertDatabaseHas('analytics_events', [
            'smb_id' => $smb->id,
            'event_type' => 'approval_submitted',
        ]);
    }
    
    /**
     * Test RVM trigger and callback flow
     */
    public function test_rvm_trigger_and_callback_flow()
    {
        $smb = SMB::factory()->create([
            'rvm_opted_in' => true,
            'primary_phone' => '+15551234567',
            'engagement_tier' => 2,
        ]);
        
        $campaign = Campaign::factory()->create();
        $send = CampaignSend::factory()->create([
            'smb_id' => $smb->id,
            'campaign_id' => $campaign->id,
            'status' => 'sent',
            'sent_at' => now()->subHours(25), // Over 24 hours ago
            'opened_at' => null, // Not opened
        ]);
        
        // 1. Check RVM trigger
        $campaignService = app(CampaignServiceInterface::class);
        $shouldTrigger = $campaignService->shouldTriggerRVM($send->id);
        $this->assertTrue($shouldTrigger);
        
        // 2. Trigger RVM
        dispatch_sync(new TriggerRVM($send->id));
        
        $this->assertDatabaseHas('rvm_drops', [
            'smb_id' => $smb->id,
            'campaign_send_id' => $send->id,
            'status' => 'queued',
        ]);
        
        // 3. Simulate callback
        $drop = RvmDrop::where('smb_id', $smb->id)->first();
        
        $callbackService = app(CallbackHandlerService::class);
        $result = $callbackService->handleIncomingCall([
            'from' => $smb->primary_phone,
            'to' => '+18005551234',
        ]);
        
        $this->assertArrayHasKey('callback_id', $result);
        
        // 4. Verify callback recorded
        $this->assertDatabaseHas('callbacks', [
            'smb_id' => $smb->id,
            'rvm_drop_id' => $drop->id,
        ]);
        
        // 5. Verify RVM marked as callback received
        $drop->refresh();
        $this->assertTrue($drop->callback_received);
    }
    
    /**
     * Test engagement tier progression
     */
    public function test_engagement_tier_progression()
    {
        $smb = SMB::factory()->create([
            'engagement_tier' => 4, // Start as Passive
            'engagement_score' => 0,
        ]);
        
        $engagementService = app(EngagementService::class);
        
        // Simulate activity that should upgrade tier
        // Open 3 emails
        for ($i = 0; $i < 3; $i++) {
            event(new EmailOpened(rand(1, 1000), $smb->id, 'HOOK-001'));
        }
        
        // Recalculate
        $newScore = $engagementService->calculateScore($smb);
        $smb->update(['engagement_score' => $newScore]);
        
        $newTier = $engagementService->evaluateTierChange($smb);
        
        // Should upgrade from 4 to 3
        $this->assertEquals(3, $newTier);
    }
}
```

### 6. Cross-Module Health Check

```php
// app/Http/Controllers/Api/V1/HealthController.php

class HealthController extends Controller
{
    // GET /api/v1/health
    public function index()
    {
        return [
            'status' => $this->getOverallStatus(),
            'modules' => [
                'database' => $this->checkDatabase(),
                'redis' => $this->checkRedis(),
                'ses' => $this->checkSES(),
                'rvm' => $this->checkRVM(),
                'ai' => $this->checkAI(),
            ],
            'timestamp' => now()->toISOString(),
        ];
    }
    
    protected function checkDatabase(): array
    {
        try {
            DB::select('SELECT 1');
            return ['status' => 'healthy', 'latency_ms' => $this->measureLatency(fn() => DB::select('SELECT 1'))];
        } catch (\Exception $e) {
            return ['status' => 'unhealthy', 'error' => $e->getMessage()];
        }
    }
    
    protected function checkRedis(): array
    {
        try {
            Redis::ping();
            return ['status' => 'healthy', 'latency_ms' => $this->measureLatency(fn() => Redis::ping())];
        } catch (\Exception $e) {
            return ['status' => 'unhealthy', 'error' => $e->getMessage()];
        }
    }
    
    protected function checkSES(): array
    {
        try {
            $client = app(SesClient::class);
            $client->getSendQuota();
            return ['status' => 'healthy'];
        } catch (\Exception $e) {
            return ['status' => 'unhealthy', 'error' => $e->getMessage()];
        }
    }
    
    protected function getOverallStatus(): string
    {
        $modules = $this->index()['modules'] ?? [];
        
        foreach ($modules as $module) {
            if ($module['status'] !== 'healthy') {
                return 'degraded';
            }
        }
        
        return 'healthy';
    }
}
```

---

## API ENDPOINTS

```
# Analytics
GET    /api/v1/analytics/executive           # Executive dashboard
GET    /api/v1/analytics/operations          # Operations dashboard
GET    /api/v1/analytics/campaigns           # Campaign analytics
GET    /api/v1/analytics/campaigns/{id}      # Single campaign analytics
GET    /api/v1/analytics/funnel              # Funnel metrics
GET    /api/v1/analytics/engagement          # Engagement metrics
GET    /api/v1/analytics/revenue             # Revenue metrics

# Reports
GET    /api/v1/reports                       # List reports
POST   /api/v1/reports                       # Generate report
GET    /api/v1/reports/{id}                  # Get report

# Health
GET    /api/v1/health                        # System health check
```

---

## SCHEDULED JOBS

```php
// Hourly: Aggregate analytics events
$schedule->job(new AggregateAnalytics)->hourly();

// Daily: Generate daily reports
$schedule->job(new GenerateDailyReport)->dailyAt('01:00');

// Weekly: Generate weekly summary
$schedule->job(new GenerateWeeklySummary)->weeklyOn(1, '06:00');

// Daily: Run integration smoke tests
$schedule->job(new RunIntegrationSmokeTests)->dailyAt('05:00');
```

---

## ACCEPTANCE CRITERIA

- [ ] Executive dashboard functional
- [ ] Operations dashboard functional
- [ ] Campaign analytics functional
- [ ] All event listeners registered
- [ ] Analytics events being recorded
- [ ] Integration tests passing
- [ ] Health check endpoint working
- [ ] Daily/weekly reports generating
- [ ] Cross-module data flows verified
- [ ] Performance acceptable at scale
