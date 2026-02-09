# MODULE 2: CAMPAIGN ENGINE
## Email + RVM Outbound System

**Owner:** Agent 2
**Timeline:** Week 3-6
**Dependencies:** Module 0 (Core Infrastructure)
**Blocks:** None (parallel)

---

## OBJECTIVE

Build the complete outbound campaign system including email scheduling, AWS SES integration, ringless voicemail (RVM) via Drop Cowboy, and all tracking/analytics.

---

## TABLES OWNED

- `campaigns`
- `campaign_sends`
- `rvm_drops`
- `email_events`

---

## INTERFACE TO IMPLEMENT

```php
// Implement: App\Contracts\CampaignServiceInterface
```

---

## EXTERNAL INTEGRATIONS

### AWS SES
- Send emails via API or SMTP
- Handle webhooks via SNS (bounces, complaints, deliveries)
- Manage dedicated IP pool

### Drop Cowboy
- REST API for RVM drops
- Webhook for delivery status
- Callback routing

---

## FEATURES TO BUILD

### 1. Campaign Scheduler

```php
// app/Jobs/ScheduleDailyCampaigns.php

class ScheduleDailyCampaigns implements ShouldQueue
{
    public function handle()
    {
        // Get all active SMBs ready for next campaign
        $smbs = SMB::query()
            ->where('campaign_status', 'active')
            ->where('manifest_destiny_day', '<=', 90)
            ->whereNull('next_scheduled_send')
            ->orWhere('next_scheduled_send', '<', now())
            ->chunk(1000, function ($chunk) {
                foreach ($chunk as $smb) {
                    $this->scheduleCampaignForSMB($smb);
                }
            });
    }
    
    protected function scheduleCampaignForSMB(SMB $smb): void
    {
        $day = $smb->manifest_destiny_day;
        $campaign = $this->getCampaignForDay($day);
        
        if (!$campaign) {
            return; // No campaign for this day
        }
        
        // Calculate optimal send time (local timezone)
        $sendTime = $this->calculateOptimalSendTime($smb);
        
        // Queue the send
        CampaignSend::create([
            'smb_id' => $smb->id,
            'campaign_id' => $campaign->id,
            'email' => $smb->primary_email,
            'subject' => $this->personalizeSubject($campaign->subject, $smb),
            'scheduled_for' => $sendTime,
            'status' => 'queued',
        ]);
        
        // Update SMB
        $smb->update([
            'next_scheduled_send' => $sendTime,
            'current_campaign_id' => $campaign->id,
        ]);
    }
    
    protected function getCampaignForDay(int $day): ?Campaign
    {
        // Determine campaign type for this day
        $dayOfWeek = (($day - 1) % 7) + 1;
        $campaignType = config("fibonacco.manifest_destiny.campaigns_per_day.{$dayOfWeek}");
        
        if (!$campaignType) {
            return null;
        }
        
        // Get the specific campaign
        $week = ceil($day / 7);
        return Campaign::where('type', $campaignType)
            ->where('week', $week)
            ->first();
    }
    
    protected function calculateOptimalSendTime(SMB $smb): Carbon
    {
        $timezone = $smb->community->timezone ?? 'America/New_York';
        
        // Default: 10am local time
        $sendTime = now($timezone)->setTime(10, 0);
        
        // If already past 10am today, send tomorrow
        if ($sendTime->isPast()) {
            $sendTime->addDay();
        }
        
        // TODO: Add ML-based optimal time prediction
        
        return $sendTime->setTimezone('UTC');
    }
}
```

### 2. Email Sender

```php
// app/Jobs/SendCampaignEmail.php

class SendCampaignEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public $tries = 3;
    public $backoff = [60, 300, 900]; // 1min, 5min, 15min
    
    public function __construct(
        public int $campaignSendId
    ) {}
    
    public function handle(SESClient $ses): void
    {
        $send = CampaignSend::with(['smb', 'campaign'])->findOrFail($this->campaignSendId);
        
        if ($send->status !== 'queued') {
            return; // Already processed
        }
        
        // Build email content
        $html = $this->buildEmailHtml($send);
        $text = $this->buildEmailText($send);
        
        try {
            $result = $ses->sendEmail([
                'Source' => config('fibonacco.email.from_name') . ' <' . config('fibonacco.email.from_email') . '>',
                'Destination' => [
                    'ToAddresses' => [$send->email],
                ],
                'Message' => [
                    'Subject' => ['Data' => $send->subject, 'Charset' => 'UTF-8'],
                    'Body' => [
                        'Html' => ['Data' => $html, 'Charset' => 'UTF-8'],
                        'Text' => ['Data' => $text, 'Charset' => 'UTF-8'],
                    ],
                ],
                'ConfigurationSetName' => 'fibonacco-campaigns',
                'Tags' => [
                    ['Name' => 'campaign_id', 'Value' => $send->campaign_id],
                    ['Name' => 'smb_id', 'Value' => (string) $send->smb_id],
                    ['Name' => 'send_id', 'Value' => (string) $send->id],
                ],
            ]);
            
            $send->update([
                'status' => 'sent',
                'sent_at' => now(),
                'message_id' => $result['MessageId'],
            ]);
            
            event(new CampaignSendCompleted($send->id, $send->smb_id, $send->campaign_id));
            
        } catch (SesException $e) {
            $send->update(['status' => 'failed']);
            throw $e;
        }
    }
    
    protected function buildEmailHtml(CampaignSend $send): string
    {
        $campaign = $send->campaign;
        $smb = $send->smb;
        
        // Load template
        $template = view('emails.campaigns.' . $campaign->email_template_id, [
            'smb' => $smb,
            'campaign' => $campaign,
            'approval_url' => $this->generateApprovalUrl($send),
            'content_url' => $this->generateContentUrl($send),
            'tracking_pixel' => $this->generateTrackingPixel($send),
        ])->render();
        
        // Wrap links with tracking
        $template = $this->wrapLinksWithTracking($template, $send);
        
        return $template;
    }
    
    protected function generateApprovalUrl(CampaignSend $send): string
    {
        $token = app(ApprovalServiceInterface::class)->generateToken(
            $send->smb_id,
            $send->campaign->service_type,
            $send->campaign_id
        );
        
        return url("/approve?task={$send->campaign->service_type}&smb={$send->smb_id}&source={$send->campaign_id}&token={$token}");
    }
    
    protected function generateTrackingPixel(CampaignSend $send): string
    {
        return url("/track/open/{$send->uuid}");
    }
    
    protected function wrapLinksWithTracking(string $html, CampaignSend $send): string
    {
        // Replace all links with tracked versions
        return preg_replace_callback(
            '/href="([^"]+)"/',
            function ($matches) use ($send) {
                $originalUrl = $matches[1];
                $trackedUrl = url("/track/click/{$send->uuid}?url=" . urlencode($originalUrl));
                return 'href="' . $trackedUrl . '"';
            },
            $html
        );
    }
}
```

### 3. Email Event Tracking

```php
// app/Http/Controllers/TrackingController.php

class TrackingController extends Controller
{
    // GET /track/open/{uuid}
    public function trackOpen(string $uuid)
    {
        $send = CampaignSend::where('uuid', $uuid)->first();
        
        if ($send && !$send->opened_at) {
            $send->update(['opened_at' => now()]);
            
            EmailEvent::create([
                'campaign_send_id' => $send->id,
                'event_type' => 'opened',
                'event_at' => now(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
            
            event(new EmailOpened($send->id, $send->smb_id, $send->campaign_id));
        }
        
        // Return 1x1 transparent pixel
        return response(base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'))
            ->header('Content-Type', 'image/gif');
    }
    
    // GET /track/click/{uuid}
    public function trackClick(string $uuid, Request $request)
    {
        $send = CampaignSend::where('uuid', $uuid)->first();
        $targetUrl = $request->get('url');
        
        if ($send) {
            if (!$send->clicked_at) {
                $send->update(['clicked_at' => now()]);
            }
            
            EmailEvent::create([
                'campaign_send_id' => $send->id,
                'event_type' => 'clicked',
                'event_at' => now(),
                'link_clicked' => $targetUrl,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
            
            event(new EmailClicked($send->id, $send->smb_id, $send->campaign_id, $targetUrl));
        }
        
        return redirect($targetUrl);
    }
}

// app/Http/Controllers/WebhookController.php

class WebhookController extends Controller
{
    // POST /webhooks/ses
    public function ses(Request $request)
    {
        $payload = json_decode($request->getContent(), true);
        
        // Verify SNS message
        if (!$this->verifySNSMessage($payload)) {
            return response('Invalid signature', 403);
        }
        
        // Handle subscription confirmation
        if ($payload['Type'] === 'SubscriptionConfirmation') {
            Http::get($payload['SubscribeURL']);
            return response('OK');
        }
        
        // Parse notification
        $message = json_decode($payload['Message'], true);
        $eventType = $message['eventType'] ?? $message['notificationType'];
        
        // Find the campaign send
        $messageId = $message['mail']['messageId'];
        $send = CampaignSend::where('message_id', $messageId)->first();
        
        if (!$send) {
            return response('OK'); // Ignore unknown sends
        }
        
        switch ($eventType) {
            case 'Delivery':
                $send->update(['delivered_at' => now()]);
                EmailEvent::create([
                    'campaign_send_id' => $send->id,
                    'event_type' => 'delivered',
                    'event_at' => now(),
                    'raw_event' => $message,
                ]);
                break;
                
            case 'Bounce':
                $send->update([
                    'bounced_at' => now(),
                    'status' => 'bounced',
                ]);
                EmailEvent::create([
                    'campaign_send_id' => $send->id,
                    'event_type' => 'bounced',
                    'event_at' => now(),
                    'bounce_type' => $message['bounce']['bounceType'],
                    'raw_event' => $message,
                ]);
                
                // Add to suppression list
                $this->addToSuppressionList($send->email, 'bounce');
                
                event(new EmailBounced($send->id, $send->smb_id));
                break;
                
            case 'Complaint':
                $send->update([
                    'complained_at' => now(),
                    'status' => 'complained',
                ]);
                EmailEvent::create([
                    'campaign_send_id' => $send->id,
                    'event_type' => 'complained',
                    'event_at' => now(),
                    'raw_event' => $message,
                ]);
                
                // Add to suppression list and opt out
                $this->addToSuppressionList($send->email, 'complaint');
                $send->smb->update(['email_opted_in' => false]);
                
                break;
        }
        
        return response('OK');
    }
}
```

### 4. RVM Trigger & Drop

```php
// app/Jobs/CheckRVMTriggers.php

class CheckRVMTriggers implements ShouldQueue
{
    public function handle(): void
    {
        // Find sends from 24h ago without opens
        $sends = CampaignSend::query()
            ->where('status', 'sent')
            ->where('sent_at', '<=', now()->subHours(24))
            ->whereNull('opened_at')
            ->where('rvm_triggered', false)
            ->with('smb')
            ->chunk(500, function ($chunk) {
                foreach ($chunk as $send) {
                    if ($this->shouldTriggerRVM($send)) {
                        dispatch(new TriggerRVM($send->id));
                    }
                }
            });
    }
    
    protected function shouldTriggerRVM(CampaignSend $send): bool
    {
        $smb = $send->smb;
        
        // Check opt-in
        if (!$smb->canContactViaRVM()) {
            return false;
        }
        
        // Check tier-based monthly limits
        $rvmThisMonth = RvmDrop::where('smb_id', $smb->id)
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();
        
        $monthlyLimit = config("fibonacco.rvm.monthly_limits.{$smb->engagement_tier}");
        
        if ($rvmThisMonth >= $monthlyLimit) {
            return false;
        }
        
        // Check time of day (8am-9pm local)
        $timezone = $smb->community->timezone ?? 'America/New_York';
        $localHour = now($timezone)->hour;
        
        if ($localHour < 8 || $localHour >= 21) {
            return false;
        }
        
        return true;
    }
}

// app/Jobs/TriggerRVM.php

class TriggerRVM implements ShouldQueue
{
    public function __construct(
        public int $campaignSendId
    ) {}
    
    public function handle(): void
    {
        $send = CampaignSend::with(['smb', 'campaign'])->findOrFail($this->campaignSendId);
        
        // Mark as triggered
        $send->update(['rvm_triggered' => true]);
        
        // Personalize script
        $script = $this->personalizeScript($send->campaign->rvm_script, $send->smb);
        
        // Calculate send time (10am local)
        $timezone = $send->smb->community->timezone ?? 'America/New_York';
        $sendTime = now($timezone)->setTime(10, 0);
        if ($sendTime->isPast()) {
            $sendTime->addDay();
        }
        
        // Create RVM drop record
        $drop = RvmDrop::create([
            'smb_id' => $send->smb_id,
            'campaign_send_id' => $send->id,
            'phone' => $send->smb->primary_phone,
            'script' => $script,
            'voice_persona' => config('fibonacco.ai.persona'),
            'scheduled_for' => $sendTime->setTimezone('UTC'),
            'status' => 'queued',
        ]);
        
        // Update campaign send
        $send->update(['rvm_drop_id' => $drop->id]);
        
        // Queue the RVM followup email (5 min after drop)
        dispatch(new SendRVMFollowupEmail($send->id, $drop->id))
            ->delay($sendTime->addMinutes(5));
    }
    
    protected function personalizeScript(string $script, SMB $smb): string
    {
        return str_replace(
            ['{business_name}', '{community}', '{first_name}'],
            [$smb->business_name, $smb->community->name, explode(' ', $smb->primary_contact_name)[0] ?? 'there'],
            $script
        );
    }
}

// app/Jobs/ProcessRVMDrops.php

class ProcessRVMDrops implements ShouldQueue
{
    public function handle(DropCowboyClient $client): void
    {
        $drops = RvmDrop::query()
            ->where('status', 'queued')
            ->where('scheduled_for', '<=', now())
            ->limit(100)
            ->get();
        
        foreach ($drops as $drop) {
            try {
                $response = $client->sendMessage([
                    'phone' => $drop->phone,
                    'message' => $drop->script,
                    'voice' => $drop->voice_persona . '_clone',
                    'caller_id' => config('services.drop_cowboy.caller_id'),
                    'metadata' => [
                        'smb_id' => $drop->smb_id,
                        'drop_id' => $drop->id,
                    ],
                ]);
                
                $drop->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                    'provider_message_id' => $response['message_id'],
                ]);
                
                event(new RVMDropQueued($drop->id, $drop->smb_id));
                
            } catch (\Exception $e) {
                $drop->update(['status' => 'failed']);
                Log::error('RVM drop failed', ['drop_id' => $drop->id, 'error' => $e->getMessage()]);
            }
        }
    }
}
```

### 5. Drop Cowboy Integration

```php
// app/Services/DropCowboyClient.php

class DropCowboyClient
{
    protected Http $http;
    protected string $apiKey;
    protected string $campaignId;
    
    public function __construct()
    {
        $this->apiKey = config('services.drop_cowboy.api_key');
        $this->campaignId = config('services.drop_cowboy.campaign_id');
        $this->http = Http::baseUrl('https://api.dropcowboy.com/v1/')
            ->withHeaders(['X-API-Key' => $this->apiKey]);
    }
    
    public function sendMessage(array $data): array
    {
        $response = $this->http->post("campaigns/{$this->campaignId}/messages", $data);
        
        if (!$response->successful()) {
            throw new DropCowboyException($response->body());
        }
        
        return $response->json();
    }
    
    public function getMessageStatus(string $messageId): array
    {
        return $this->http->get("messages/{$messageId}")->json();
    }
}

// Webhook handler
// POST /webhooks/rvm
public function rvm(Request $request)
{
    $payload = $request->all();
    
    $drop = RvmDrop::where('provider_message_id', $payload['message_id'])->first();
    
    if (!$drop) {
        return response('OK');
    }
    
    switch ($payload['event']) {
        case 'delivered':
            $drop->update([
                'status' => 'delivered',
                'delivered_at' => now(),
                'delivery_status' => $payload['delivery_status'] ?? 'delivered',
            ]);
            event(new RVMDelivered($drop->id, $drop->smb_id));
            break;
            
        case 'failed':
            $drop->update([
                'status' => 'failed',
                'delivery_status' => $payload['failure_reason'] ?? 'unknown',
            ]);
            break;
            
        case 'callback':
            $drop->update([
                'callback_received' => true,
                'callback_at' => now(),
            ]);
            
            // Create callback record
            $callback = Callback::create([
                'smb_id' => $drop->smb_id,
                'rvm_drop_id' => $drop->id,
                'caller_phone' => $payload['caller'],
                'called_number' => $payload['called'],
                'started_at' => now(),
            ]);
            
            $drop->update(['callback_id' => $callback->id]);
            
            event(new CallbackReceived($callback->id, $drop->smb_id, $drop->id));
            break;
    }
    
    return response('OK');
}
```

### 6. Campaign Management API

```php
// app/Http/Controllers/Api/V1/CampaignController.php

class CampaignController extends Controller
{
    // GET /api/v1/campaigns
    public function index(Request $request)
    {
        return Campaign::query()
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->when($request->week, fn($q, $week) => $q->where('week', $week))
            ->orderBy('week')
            ->orderBy('day')
            ->paginate();
    }
    
    // GET /api/v1/campaigns/{id}
    public function show(Campaign $campaign)
    {
        return $campaign->load(['sends' => fn($q) => $q->latest()->limit(10)]);
    }
    
    // GET /api/v1/campaigns/{id}/stats
    public function stats(Campaign $campaign)
    {
        return [
            'total_sends' => $campaign->sends()->count(),
            'sent' => $campaign->sends()->where('status', 'sent')->count(),
            'opened' => $campaign->sends()->whereNotNull('opened_at')->count(),
            'clicked' => $campaign->sends()->whereNotNull('clicked_at')->count(),
            'bounced' => $campaign->sends()->where('status', 'bounced')->count(),
            'open_rate' => $this->calculateRate($campaign, 'opened_at'),
            'click_rate' => $this->calculateRate($campaign, 'clicked_at'),
            'rvm_triggered' => $campaign->sends()->where('rvm_triggered', true)->count(),
        ];
    }
    
    // POST /api/v1/campaigns/{id}/test-send
    public function testSend(Campaign $campaign, Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        // Send test email (doesn't create CampaignSend record)
        dispatch(new SendTestCampaignEmail($campaign->id, $request->email));
        
        return response()->json(['message' => 'Test email queued']);
    }
}
```

---

## API ENDPOINTS

```
GET    /api/v1/campaigns                      # List campaigns
GET    /api/v1/campaigns/{id}                 # Get campaign
GET    /api/v1/campaigns/{id}/stats           # Campaign statistics
POST   /api/v1/campaigns/{id}/test-send       # Send test email

GET    /api/v1/campaign-sends                 # List sends (filterable)
GET    /api/v1/campaign-sends/{id}            # Get send details

GET    /api/v1/rvm-drops                      # List RVM drops
GET    /api/v1/rvm-drops/{id}                 # Get drop details

# Tracking (public, no auth)
GET    /track/open/{uuid}                     # Tracking pixel
GET    /track/click/{uuid}                    # Link tracking

# Webhooks
POST   /webhooks/ses                          # AWS SES events
POST   /webhooks/rvm                          # Drop Cowboy events
```

---

## EVENTS TO EMIT

```php
CampaignSendQueued::class     // When send is scheduled
CampaignSendCompleted::class  // When email sent successfully
EmailOpened::class            // When tracking pixel loaded
EmailClicked::class           // When link clicked
EmailBounced::class           // When email bounces
RVMDropQueued::class          // When RVM drop scheduled
RVMDelivered::class           // When RVM delivered
CallbackReceived::class       // When SMB calls back
```

---

## SCHEDULED JOBS

```php
// Every 5 minutes: Process queued sends
$schedule->job(new ProcessQueuedSends)->everyFiveMinutes();

// Hourly: Check for RVM triggers
$schedule->job(new CheckRVMTriggers)->hourly();

// Every 10 minutes: Process RVM drops
$schedule->job(new ProcessRVMDrops)->everyTenMinutes();

// Daily at 6am: Schedule day's campaigns
$schedule->job(new ScheduleDailyCampaigns)->dailyAt('06:00');

// Daily: Clean up old tracking data
$schedule->job(new CleanupOldTrackingData)->dailyAt('03:00');
```

---

## ACCEPTANCE CRITERIA

- [ ] Campaign scheduling logic working
- [ ] AWS SES integration complete (send + webhooks)
- [ ] Email personalization working
- [ ] Tracking pixel and link tracking working
- [ ] RVM trigger logic working
- [ ] Drop Cowboy integration complete
- [ ] RVM followup email sending
- [ ] All webhooks handling events correctly
- [ ] Campaign stats API working
- [ ] Unit tests: 80% coverage
- [ ] Integration tests for full send flow
