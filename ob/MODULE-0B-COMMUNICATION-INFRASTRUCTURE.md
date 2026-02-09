# Module 0B: Communication Infrastructure

## Overview

**Owner:** Infrastructure Agent (same as Module 0)
**Timeline:** Week 1-2 (parallel with Module 0)
**Dependencies:** Module 0 (Core Infrastructure)
**Depends On:** Module 0C (Email Gateway)

The Communication Infrastructure module provides the unified messaging layer that all other modules use to send communications across any channel. It abstracts away the complexity of multi-channel delivery, priority queuing, rate limiting, and failover handling.

## Core Principle

**No module sends messages directly.** Every email, SMS, push notification, and voice message flows through this infrastructure. This enables:

- Unified priority management (emergencies always go first)
- Channel abstraction (app code doesn't know/care about SES vs Postal)
- Rate limiting and throttling
- Failover handling
- Unified tracking and analytics
- Future channel additions without app changes

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        MESSAGE ORCHESTRATOR                                      │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         MessageService                                   │   │
│  │                                                                          │   │
│  │   send() ──► validateMessage() ──► assignPriority() ──► routeToChannel │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│              ┌───────────────────────┼───────────────────────┐                 │
│              │                       │                       │                 │
│              ▼                       ▼                       ▼                 │
│  ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐        │
│  │   EmailChannel    │   │    SmsChannel     │   │   PushChannel     │        │
│  │                   │   │                   │   │                   │        │
│  │ ├─ PostalGateway  │   │ ├─ TwilioGateway  │   │ ├─ FCMGateway     │        │
│  │ └─ SesGateway     │   │ └─ BandwidthGW    │   │ └─ APNsGateway    │        │
│  └───────────────────┘   └───────────────────┘   └───────────────────┘        │
│              │                       │                       │                 │
│              └───────────────────────┼───────────────────────┘                 │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      PRIORITY QUEUE SYSTEM                               │   │
│  │                                                                          │   │
│  │   P0 (Emergency) ──► P1 (Alerts) ──► P2 (Newsletters) ──► P3 (Campaigns)│   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      DELIVERY TRACKING                                   │   │
│  │                                                                          │   │
│  │   Sent ──► Delivered ──► Opened ──► Clicked ──► Converted               │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Tables

### Owned by This Module

```sql
-- ═══════════════════════════════════════════════════════════════════════════════
-- MESSAGE QUEUE (Priority-Partitioned)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE message_queue (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    
    -- Priority (P0 always processed first)
    priority VARCHAR(10) NOT NULL,  -- P0, P1, P2, P3, P4
    
    -- Message classification
    message_type VARCHAR(50) NOT NULL,  -- emergency, alert, newsletter, campaign, transactional
    
    -- Source reference
    source_type VARCHAR(50),  -- emergency_broadcasts, alerts, newsletters, campaign_sends
    source_id BIGINT,
    
    -- Channel
    channel VARCHAR(20) NOT NULL,  -- email, sms, push, voice
    
    -- Recipient
    recipient_type VARCHAR(20),  -- subscriber, smb
    recipient_id BIGINT,
    recipient_address VARCHAR(255),  -- email, phone, or device token
    
    -- Content (denormalized for speed)
    subject VARCHAR(255),
    template VARCHAR(100),
    content_data JSONB,
    
    -- Routing
    ip_pool VARCHAR(50),  -- Which IP pool to use
    gateway VARCHAR(50),  -- postal, ses, twilio, etc.
    
    -- Processing state
    status VARCHAR(20) DEFAULT 'pending',  -- pending, processing, sent, delivered, failed, bounced
    scheduled_for TIMESTAMP DEFAULT NOW(),
    locked_by VARCHAR(100),
    locked_at TIMESTAMP,
    
    -- Results
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    external_id VARCHAR(255),  -- ID from gateway (SES message ID, etc.)
    
    -- Error handling
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    next_retry_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
) PARTITION BY LIST (priority);

-- Partition by priority for fastest P0 access
CREATE TABLE message_queue_p0 PARTITION OF message_queue FOR VALUES IN ('P0');
CREATE TABLE message_queue_p1 PARTITION OF message_queue FOR VALUES IN ('P1');
CREATE TABLE message_queue_p2 PARTITION OF message_queue FOR VALUES IN ('P2');
CREATE TABLE message_queue_p3 PARTITION OF message_queue FOR VALUES IN ('P3');
CREATE TABLE message_queue_p4 PARTITION OF message_queue FOR VALUES IN ('P4');

-- Indexes for worker claims (most critical)
CREATE INDEX idx_queue_pending_p0 ON message_queue_p0 (scheduled_for) 
    WHERE status = 'pending' AND locked_at IS NULL;
CREATE INDEX idx_queue_pending_p1 ON message_queue_p1 (scheduled_for) 
    WHERE status = 'pending' AND locked_at IS NULL;
CREATE INDEX idx_queue_pending_p2 ON message_queue_p2 (scheduled_for) 
    WHERE status = 'pending' AND locked_at IS NULL;
CREATE INDEX idx_queue_pending_p3 ON message_queue_p3 (scheduled_for) 
    WHERE status = 'pending' AND locked_at IS NULL;
CREATE INDEX idx_queue_pending_p4 ON message_queue_p4 (scheduled_for) 
    WHERE status = 'pending' AND locked_at IS NULL;

-- Index for retry processing
CREATE INDEX idx_queue_retry ON message_queue (next_retry_at) 
    WHERE status = 'failed' AND attempts < max_attempts;

-- Index for status lookups
CREATE INDEX idx_queue_source ON message_queue (source_type, source_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- DELIVERY EVENTS (Append-Only Log)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE delivery_events (
    id BIGSERIAL PRIMARY KEY,
    message_queue_id BIGINT REFERENCES message_queue(id),
    
    -- Event details
    event_type VARCHAR(50) NOT NULL,  -- queued, sent, delivered, opened, clicked, bounced, complained, unsubscribed
    event_data JSONB,
    
    -- Source
    source VARCHAR(50),  -- postal, ses, twilio, webhook
    external_event_id VARCHAR(255),
    
    occurred_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_delivery_message (message_queue_id),
    INDEX idx_delivery_type_time (event_type, occurred_at)
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- CHANNEL HEALTH (For Failover Decisions)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE channel_health (
    id SERIAL PRIMARY KEY,
    channel VARCHAR(20) NOT NULL,  -- email, sms, push
    gateway VARCHAR(50) NOT NULL,  -- postal, ses, twilio
    
    -- Health metrics (updated by monitoring job)
    is_healthy BOOLEAN DEFAULT TRUE,
    success_rate_1h DECIMAL(5,2),  -- Last hour success rate
    success_rate_24h DECIMAL(5,2),  -- Last 24h success rate
    avg_latency_ms INTEGER,
    
    -- Capacity
    current_rate_per_sec INTEGER,
    max_rate_per_sec INTEGER,
    
    -- Last check
    last_check_at TIMESTAMP,
    last_failure_at TIMESTAMP,
    failure_reason TEXT,
    
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE (channel, gateway)
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- RATE LIMITS (Per-Domain Throttling)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE rate_limits (
    id SERIAL PRIMARY KEY,
    
    -- What's being limited
    limit_type VARCHAR(50) NOT NULL,  -- domain, ip_pool, gateway, recipient
    limit_key VARCHAR(255) NOT NULL,  -- gmail.com, pool_alerts, ses, etc.
    
    -- Limits
    max_per_second INTEGER,
    max_per_minute INTEGER,
    max_per_hour INTEGER,
    max_per_day INTEGER,
    
    -- Current usage (updated by Redis, persisted periodically)
    current_hour_count INTEGER DEFAULT 0,
    current_day_count INTEGER DEFAULT 0,
    hour_reset_at TIMESTAMP,
    day_reset_at TIMESTAMP,
    
    -- Config
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE (limit_type, limit_key)
);

-- Default rate limits for major ISPs
INSERT INTO rate_limits (limit_type, limit_key, max_per_hour, notes) VALUES
    ('domain', 'gmail.com', 10000, 'Google rate limits'),
    ('domain', 'yahoo.com', 5000, 'Yahoo rate limits'),
    ('domain', 'hotmail.com', 5000, 'Microsoft rate limits'),
    ('domain', 'outlook.com', 5000, 'Microsoft rate limits'),
    ('domain', 'aol.com', 3000, 'AOL rate limits');


-- ═══════════════════════════════════════════════════════════════════════════════
-- SUPPRESSION LIST (Do Not Contact)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE suppression_list (
    id BIGSERIAL PRIMARY KEY,
    
    -- What's suppressed
    channel VARCHAR(20) NOT NULL,  -- email, sms, push, all
    address VARCHAR(255) NOT NULL,  -- email or phone
    
    -- Why
    reason VARCHAR(50) NOT NULL,  -- bounce_hard, complaint, unsubscribe, manual, legal
    source VARCHAR(100),  -- Where the suppression came from
    
    -- Scope
    community_id BIGINT,  -- NULL = global, otherwise community-specific
    
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,  -- NULL = permanent
    
    UNIQUE (channel, address, community_id)
);

CREATE INDEX idx_suppression_lookup ON suppression_list (channel, address) 
    WHERE expires_at IS NULL OR expires_at > NOW();


-- ═══════════════════════════════════════════════════════════════════════════════
-- TEMPLATES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE message_templates (
    id SERIAL PRIMARY KEY,
    
    -- Identification
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Channel
    channel VARCHAR(20) NOT NULL,  -- email, sms, push
    
    -- Content
    subject VARCHAR(255),  -- For email
    body_html TEXT,  -- For email
    body_text TEXT,  -- For email/SMS
    
    -- Variables
    variables JSONB DEFAULT '[]',  -- List of expected variables
    
    -- Versioning
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Service Interfaces

### MessageServiceInterface

```php
<?php

namespace App\Contracts\Communication;

interface MessageServiceInterface
{
    /**
     * Send a single message
     */
    public function send(MessageRequest $request): MessageResult;
    
    /**
     * Send bulk messages (for newsletters, alerts)
     */
    public function sendBulk(BulkMessageRequest $request): BulkMessageResult;
    
    /**
     * Get message status
     */
    public function getStatus(string $uuid): MessageStatus;
    
    /**
     * Cancel a pending message
     */
    public function cancel(string $uuid): bool;
}
```

### MessageRequest DTO

```php
<?php

namespace App\DTOs\Communication;

class MessageRequest
{
    public function __construct(
        public string $channel,           // email, sms, push
        public string $priority,          // P0, P1, P2, P3, P4
        public string $messageType,       // emergency, alert, newsletter, campaign, transactional
        public string $recipientAddress,  // email, phone, or device token
        public ?int $recipientId = null,
        public ?string $recipientType = null,  // subscriber, smb
        public ?string $template = null,
        public ?string $subject = null,
        public ?string $body = null,
        public array $data = [],          // Template variables
        public ?string $sourceType = null,
        public ?int $sourceId = null,
        public ?Carbon $scheduledFor = null,
        public ?string $ipPool = null,    // Override default pool
    ) {}
}
```

### ChannelInterface

```php
<?php

namespace App\Contracts\Communication;

interface ChannelInterface
{
    /**
     * Get channel name
     */
    public function getName(): string;
    
    /**
     * Check if channel can send to address
     */
    public function canSend(string $address): bool;
    
    /**
     * Send message through this channel
     */
    public function send(QueuedMessage $message): SendResult;
    
    /**
     * Send bulk through this channel
     */
    public function sendBulk(array $messages): array;
    
    /**
     * Get current health status
     */
    public function getHealth(): ChannelHealth;
}
```

### GatewayInterface

```php
<?php

namespace App\Contracts\Communication;

interface GatewayInterface
{
    /**
     * Get gateway identifier
     */
    public function getName(): string;
    
    /**
     * Check if gateway is available
     */
    public function isAvailable(): bool;
    
    /**
     * Send single message
     */
    public function send(OutboundMessage $message): GatewayResult;
    
    /**
     * Send batch (if supported)
     */
    public function sendBatch(array $messages): array;
    
    /**
     * Get current rate limit status
     */
    public function getRateStatus(): RateStatus;
}
```

---

## Core Services

### MessageService

```php
<?php

namespace App\Services\Communication;

use App\Contracts\Communication\MessageServiceInterface;
use App\Models\Communication\MessageQueue;
use App\DTOs\Communication\MessageRequest;
use App\Events\Communication\MessageQueued;

class MessageService implements MessageServiceInterface
{
    public function __construct(
        private SuppressionService $suppression,
        private RateLimitService $rateLimiter,
        private ChannelRouter $router,
    ) {}
    
    public function send(MessageRequest $request): MessageResult
    {
        // 1. Check suppression list
        if ($this->suppression->isSuppressed($request->channel, $request->recipientAddress)) {
            return MessageResult::suppressed('Address is on suppression list');
        }
        
        // 2. Validate address format
        if (!$this->validateAddress($request->channel, $request->recipientAddress)) {
            return MessageResult::invalid('Invalid address format');
        }
        
        // 3. Determine routing
        $routing = $this->router->route($request);
        
        // 4. Create queue entry
        $message = MessageQueue::create([
            'priority' => $request->priority,
            'message_type' => $request->messageType,
            'channel' => $request->channel,
            'recipient_type' => $request->recipientType,
            'recipient_id' => $request->recipientId,
            'recipient_address' => $request->recipientAddress,
            'subject' => $request->subject,
            'template' => $request->template,
            'content_data' => $request->data,
            'source_type' => $request->sourceType,
            'source_id' => $request->sourceId,
            'ip_pool' => $routing->ipPool,
            'gateway' => $routing->gateway,
            'scheduled_for' => $request->scheduledFor ?? now(),
        ]);
        
        // 5. Emit event
        event(new MessageQueued($message));
        
        // 6. For P0 messages, dispatch immediately
        if ($request->priority === 'P0') {
            dispatch(new ProcessMessage($message->id))->onQueue('emergency');
        }
        
        return MessageResult::queued($message->uuid);
    }
    
    public function sendBulk(BulkMessageRequest $request): BulkMessageResult
    {
        // For large bulk sends (newsletters, alerts), we use batching
        $recipients = $request->recipients;
        $batchSize = 1000;
        $totalQueued = 0;
        $suppressed = 0;
        
        foreach (array_chunk($recipients, $batchSize) as $batch) {
            $rows = [];
            
            foreach ($batch as $recipient) {
                if ($this->suppression->isSuppressed($request->channel, $recipient['address'])) {
                    $suppressed++;
                    continue;
                }
                
                $rows[] = [
                    'uuid' => Str::uuid(),
                    'priority' => $request->priority,
                    'message_type' => $request->messageType,
                    'channel' => $request->channel,
                    'recipient_type' => $recipient['type'] ?? 'subscriber',
                    'recipient_id' => $recipient['id'] ?? null,
                    'recipient_address' => $recipient['address'],
                    'subject' => $request->subject,
                    'template' => $request->template,
                    'content_data' => json_encode(array_merge(
                        $request->sharedData,
                        $recipient['data'] ?? []
                    )),
                    'source_type' => $request->sourceType,
                    'source_id' => $request->sourceId,
                    'ip_pool' => $request->ipPool,
                    'scheduled_for' => $request->scheduledFor ?? now(),
                    'created_at' => now(),
                ];
            }
            
            if (!empty($rows)) {
                MessageQueue::insert($rows);
                $totalQueued += count($rows);
            }
        }
        
        return new BulkMessageResult(
            queued: $totalQueued,
            suppressed: $suppressed,
            sourceType: $request->sourceType,
            sourceId: $request->sourceId,
        );
    }
}
```

### ChannelRouter

```php
<?php

namespace App\Services\Communication;

class ChannelRouter
{
    public function __construct(
        private ChannelHealth $health,
        private array $config,
    ) {}
    
    public function route(MessageRequest $request): RoutingDecision
    {
        $channel = $request->channel;
        
        return match ($channel) {
            'email' => $this->routeEmail($request),
            'sms' => $this->routeSms($request),
            'push' => $this->routePush($request),
            default => throw new InvalidChannelException($channel),
        };
    }
    
    private function routeEmail(MessageRequest $request): RoutingDecision
    {
        // Determine IP pool based on message type
        $ipPool = $request->ipPool ?? match ($request->messageType) {
            'emergency' => 'emergency',
            'alert' => 'alerts',
            'newsletter' => 'newsletters',
            'campaign' => 'campaigns',
            'transactional' => 'transactional',
            default => 'default',
        };
        
        // Check gateway health, prefer Postal
        $postalHealthy = $this->health->isHealthy('email', 'postal');
        $sesHealthy = $this->health->isHealthy('email', 'ses');
        
        // For emergencies and transactional, always try both
        if (in_array($request->messageType, ['emergency', 'transactional'])) {
            $gateway = $postalHealthy ? 'postal' : ($sesHealthy ? 'ses' : 'postal');
        } else {
            // Prefer Postal for cost, fall back to SES
            $gateway = $postalHealthy ? 'postal' : 'ses';
        }
        
        return new RoutingDecision(
            gateway: $gateway,
            ipPool: $ipPool,
            failover: $gateway === 'postal' ? 'ses' : 'postal',
        );
    }
    
    private function routeSms(MessageRequest $request): RoutingDecision
    {
        return new RoutingDecision(
            gateway: 'twilio',
            failover: 'bandwidth',
        );
    }
    
    private function routePush(MessageRequest $request): RoutingDecision
    {
        return new RoutingDecision(
            gateway: 'firebase',
        );
    }
}
```

### MessageWorker

```php
<?php

namespace App\Jobs\Communication;

use App\Models\Communication\MessageQueue;
use App\Services\Communication\ChannelFactory;
use App\Events\Communication\MessageSent;
use App\Events\Communication\MessageFailed;

class ProcessMessages implements ShouldQueue
{
    public $queue = 'messages';
    public $timeout = 300;
    
    public function __construct(
        private string $priority = 'P3',
        private int $batchSize = 100,
    ) {}
    
    public function handle(ChannelFactory $channels)
    {
        // Claim batch of messages
        $messages = $this->claimBatch();
        
        if ($messages->isEmpty()) {
            return;
        }
        
        // Group by channel and gateway for efficient sending
        $grouped = $messages->groupBy(fn($m) => $m->channel . ':' . $m->gateway);
        
        foreach ($grouped as $key => $batch) {
            [$channel, $gateway] = explode(':', $key);
            
            $channelService = $channels->get($channel, $gateway);
            
            foreach ($batch as $message) {
                try {
                    $result = $channelService->send($message);
                    
                    if ($result->success) {
                        $message->update([
                            'status' => 'sent',
                            'sent_at' => now(),
                            'external_id' => $result->externalId,
                            'locked_by' => null,
                            'locked_at' => null,
                        ]);
                        
                        event(new MessageSent($message, $result));
                    } else {
                        $this->handleFailure($message, $result->error);
                    }
                } catch (\Exception $e) {
                    $this->handleFailure($message, $e->getMessage());
                }
            }
        }
        
        // If we processed a full batch, there might be more
        if ($messages->count() === $this->batchSize) {
            dispatch(new self($this->priority, $this->batchSize));
        }
    }
    
    private function claimBatch(): Collection
    {
        return DB::transaction(function () {
            $lockId = Str::uuid()->toString();
            
            // Priority-aware claiming
            $table = 'message_queue_' . strtolower($this->priority);
            
            $claimed = DB::table($table)
                ->where('status', 'pending')
                ->where('scheduled_for', '<=', now())
                ->whereNull('locked_at')
                ->limit($this->batchSize)
                ->lockForUpdate()
                ->pluck('id');
            
            if ($claimed->isEmpty()) {
                return collect();
            }
            
            DB::table($table)
                ->whereIn('id', $claimed)
                ->update([
                    'locked_by' => $lockId,
                    'locked_at' => now(),
                    'status' => 'processing',
                ]);
            
            return MessageQueue::whereIn('id', $claimed)->get();
        });
    }
    
    private function handleFailure(MessageQueue $message, string $error)
    {
        $message->attempts++;
        
        if ($message->attempts >= $message->max_attempts) {
            $message->update([
                'status' => 'failed',
                'last_error' => $error,
                'locked_by' => null,
                'locked_at' => null,
            ]);
            
            event(new MessageFailed($message, $error));
            
            // Try failover gateway if available
            if ($message->gateway === 'postal') {
                $this->retryWithFailover($message, 'ses');
            }
        } else {
            // Exponential backoff
            $delay = pow(2, $message->attempts) * 60; // 2, 4, 8 minutes
            
            $message->update([
                'status' => 'pending',
                'last_error' => $error,
                'next_retry_at' => now()->addSeconds($delay),
                'scheduled_for' => now()->addSeconds($delay),
                'locked_by' => null,
                'locked_at' => null,
            ]);
        }
    }
    
    private function retryWithFailover(MessageQueue $message, string $failoverGateway)
    {
        MessageQueue::create([
            'priority' => $message->priority,
            'message_type' => $message->messageType,
            'channel' => $message->channel,
            'recipient_type' => $message->recipient_type,
            'recipient_id' => $message->recipient_id,
            'recipient_address' => $message->recipient_address,
            'subject' => $message->subject,
            'template' => $message->template,
            'content_data' => $message->content_data,
            'source_type' => $message->source_type,
            'source_id' => $message->source_id,
            'ip_pool' => $message->ip_pool,
            'gateway' => $failoverGateway,
            'scheduled_for' => now(),
        ]);
    }
}
```

---

## Queue Configuration

### Horizon Queues

```php
<?php
// config/horizon.php

'environments' => [
    'production' => [
        // P0: Emergency - ALWAYS running, highest priority
        'emergency-workers' => [
            'connection' => 'redis',
            'queue' => ['emergency'],
            'balance' => 'false',  // Always max workers
            'processes' => 10,
            'tries' => 1,  // Fail fast, handle in code
            'timeout' => 30,
        ],
        
        // P1: Alerts - Fast processing
        'alert-workers' => [
            'connection' => 'redis',
            'queue' => ['alerts'],
            'balance' => 'auto',
            'minProcesses' => 5,
            'maxProcesses' => 30,
            'balanceMaxShift' => 5,
            'balanceCooldown' => 1,
        ],
        
        // P2: Newsletters - Batch processing
        'newsletter-workers' => [
            'connection' => 'redis',
            'queue' => ['newsletters'],
            'balance' => 'auto',
            'minProcesses' => 3,
            'maxProcesses' => 20,
            'balanceMaxShift' => 3,
            'balanceCooldown' => 3,
        ],
        
        // P3: Campaigns - Steady state
        'campaign-workers' => [
            'connection' => 'redis',
            'queue' => ['campaigns'],
            'balance' => 'auto',
            'minProcesses' => 5,
            'maxProcesses' => 25,
            'balanceMaxShift' => 3,
            'balanceCooldown' => 3,
        ],
        
        // P4: Transactional - Low volume, fast
        'transactional-workers' => [
            'connection' => 'redis',
            'queue' => ['transactional'],
            'balance' => 'auto',
            'minProcesses' => 2,
            'maxProcesses' => 10,
        ],
        
        // Message processing by priority
        'message-p0' => [
            'connection' => 'redis',
            'queue' => ['messages-p0'],
            'balance' => 'false',
            'processes' => 10,
        ],
        'message-p1' => [
            'connection' => 'redis',
            'queue' => ['messages-p1'],
            'balance' => 'auto',
            'minProcesses' => 5,
            'maxProcesses' => 30,
        ],
        'message-p2' => [
            'connection' => 'redis',
            'queue' => ['messages-p2'],
            'balance' => 'auto',
            'minProcesses' => 3,
            'maxProcesses' => 20,
        ],
        'message-p3' => [
            'connection' => 'redis',
            'queue' => ['messages-p3'],
            'balance' => 'auto',
            'minProcesses' => 5,
            'maxProcesses' => 25,
        ],
    ],
],
```

### Priority Dispatcher

```php
<?php

namespace App\Services\Communication;

class PriorityDispatcher
{
    /**
     * Dispatch message processing jobs based on queue depth
     */
    public function dispatch(): void
    {
        // Always process P0 first
        $this->dispatchForPriority('P0', 'messages-p0');
        
        // Check P1 queue depth
        $p1Depth = $this->getQueueDepth('P1');
        if ($p1Depth > 0) {
            $this->dispatchForPriority('P1', 'messages-p1', min($p1Depth / 100, 10));
        }
        
        // P2 and P3 only if P1 is manageable
        if ($p1Depth < 10000) {
            $this->dispatchForPriority('P2', 'messages-p2');
            $this->dispatchForPriority('P3', 'messages-p3');
        }
    }
    
    private function dispatchForPriority(string $priority, string $queue, int $jobs = 1): void
    {
        for ($i = 0; $i < $jobs; $i++) {
            dispatch(new ProcessMessages($priority))->onQueue($queue);
        }
    }
    
    private function getQueueDepth(string $priority): int
    {
        $table = 'message_queue_' . strtolower($priority);
        return DB::table($table)
            ->where('status', 'pending')
            ->where('scheduled_for', '<=', now())
            ->count();
    }
}
```

---

## Scheduled Jobs

```php
<?php
// app/Console/Kernel.php

protected function schedule(Schedule $schedule)
{
    // Priority dispatcher - runs every 10 seconds
    $schedule->call(function () {
        app(PriorityDispatcher::class)->dispatch();
    })->everyTenSeconds();
    
    // Clean up old messages (keep 30 days)
    $schedule->job(new CleanupMessageQueue)->dailyAt('04:00');
    
    // Update channel health metrics
    $schedule->job(new UpdateChannelHealth)->everyFiveMinutes();
    
    // Compile suppression list from bounces/complaints
    $schedule->job(new ProcessSuppressions)->everyFifteenMinutes();
    
    // Release stuck messages (locked > 10 minutes)
    $schedule->job(new ReleaseStuckMessages)->everyFiveMinutes();
    
    // Update rate limit counters from Redis to DB
    $schedule->job(new PersistRateLimitCounters)->everyFiveMinutes();
}
```

---

## Events

### Emitted Events

```php
// Message lifecycle
MessageQueued::class       // Message added to queue
MessageSent::class         // Message sent to gateway
MessageDelivered::class    // Delivery confirmed
MessageOpened::class       // Email/push opened
MessageClicked::class      // Link clicked
MessageBounced::class      // Hard/soft bounce
MessageComplained::class   // Spam complaint
MessageFailed::class       // All retries exhausted

// System events
ChannelHealthChanged::class    // Gateway health status change
RateLimitExceeded::class       // Hit rate limit
SuppressionAdded::class        // Address added to suppression
```

### Listened Events

```php
// From webhooks
SesWebhookReceived::class      // AWS SES event
PostalWebhookReceived::class   // Postal event
TwilioWebhookReceived::class   // Twilio SMS event
```

---

## API Endpoints

```php
<?php
// routes/api.php

Route::prefix('v1/messages')->group(function () {
    // Send messages (internal use)
    Route::post('/', [MessageController::class, 'send']);
    Route::post('/bulk', [MessageController::class, 'sendBulk']);
    
    // Status
    Route::get('/{uuid}', [MessageController::class, 'status']);
    Route::delete('/{uuid}', [MessageController::class, 'cancel']);
    
    // Queue stats (admin)
    Route::get('/stats/queue', [MessageController::class, 'queueStats']);
    Route::get('/stats/channels', [MessageController::class, 'channelStats']);
});

// Webhooks (external - no auth, signature verification)
Route::prefix('webhooks')->group(function () {
    Route::post('/ses', [WebhookController::class, 'ses']);
    Route::post('/postal', [WebhookController::class, 'postal']);
    Route::post('/twilio', [WebhookController::class, 'twilio']);
    Route::post('/firebase', [WebhookController::class, 'firebase']);
});
```

---

## Configuration

```php
<?php
// config/communication.php

return [
    'channels' => [
        'email' => [
            'enabled' => true,
            'default_gateway' => env('EMAIL_DEFAULT_GATEWAY', 'postal'),
            'failover_gateway' => env('EMAIL_FAILOVER_GATEWAY', 'ses'),
        ],
        'sms' => [
            'enabled' => env('SMS_ENABLED', true),
            'default_gateway' => env('SMS_DEFAULT_GATEWAY', 'twilio'),
        ],
        'push' => [
            'enabled' => env('PUSH_ENABLED', true),
            'default_gateway' => 'firebase',
        ],
    ],
    
    'priorities' => [
        'P0' => [
            'name' => 'Emergency',
            'max_age_seconds' => 300,      // Must send within 5 minutes
            'retry_attempts' => 5,
            'queue' => 'messages-p0',
        ],
        'P1' => [
            'name' => 'Alerts',
            'max_age_seconds' => 900,      // 15 minutes
            'retry_attempts' => 3,
            'queue' => 'messages-p1',
        ],
        'P2' => [
            'name' => 'Newsletters',
            'max_age_seconds' => 3600,     // 1 hour
            'retry_attempts' => 3,
            'queue' => 'messages-p2',
        ],
        'P3' => [
            'name' => 'Campaigns',
            'max_age_seconds' => 86400,    // 24 hours
            'retry_attempts' => 3,
            'queue' => 'messages-p3',
        ],
        'P4' => [
            'name' => 'Transactional',
            'max_age_seconds' => 3600,
            'retry_attempts' => 5,
            'queue' => 'messages-p4',
        ],
    ],
    
    'rate_limiting' => [
        'enabled' => true,
        'redis_prefix' => 'comm:rate:',
    ],
    
    'suppression' => [
        'hard_bounce_permanent' => true,
        'soft_bounce_threshold' => 3,      // Suppress after 3 soft bounces
        'complaint_permanent' => true,
    ],
];
```

---

## Acceptance Criteria

### Must Have
- [ ] All database tables created with proper indexes and partitioning
- [ ] MessageService can queue messages for all channels
- [ ] Priority-based processing (P0 always first)
- [ ] Suppression list checking before send
- [ ] Basic rate limiting per domain
- [ ] Failover between gateways
- [ ] Webhook handlers for all gateways
- [ ] Message status tracking

### Should Have
- [ ] Channel health monitoring
- [ ] Automatic retry with exponential backoff
- [ ] Bulk send batching (1000+ recipients)
- [ ] Template management
- [ ] Queue depth monitoring

### Nice to Have
- [ ] Real-time queue metrics dashboard
- [ ] Per-IP reputation tracking
- [ ] Advanced rate limiting (per ISP)
- [ ] A/B testing support

---

## Integration Points

### Modules That Call This Module
- Module 2: SMB Campaign Engine → sends campaign emails, RVM
- Module 9: Newsletter Engine → sends bulk newsletters
- Module 10: Alert System → sends breaking news alerts
- Module 11: Emergency Broadcast → sends P0 emergency messages
- Module 5: Inbound Engine → sends email replies

### External Dependencies
- Module 0C: Email Gateway (Postal) → primary email sending
- AWS SES → failover email sending
- Twilio → SMS sending
- Firebase → push notifications

---

## Notes for Agent

1. **Priority is sacred** - P0 messages must NEVER wait behind P3 messages
2. **Suppression checks are mandatory** - Never send to suppressed addresses
3. **Failover is automatic** - If Postal fails, try SES without human intervention
4. **Batch everything** - Never insert 1 row at a time for bulk sends
5. **Redis for speed, PostgreSQL for durability** - Rate limits in Redis, messages in PostgreSQL
