# Module 11: Emergency Broadcast System

## Overview

**Owner:** Agent 11
**Timeline:** Week 4-7 (parallel development)
**Dependencies:** Module 0, 0B, 12 (Subscriber Management)
**Depended On By:** Module 8 (Analytics)

The Emergency Broadcast System handles life-safety communications - natural disasters, active threats, public health emergencies. These are **P0 priority** messages that override all other sending and go to ALL channels simultaneously. This is a potential revenue source through municipal contracts.

## Critical Design Principles

```
⚠️  EMERGENCY BROADCASTS ARE DIFFERENT ⚠️

1. P0 PRIORITY - Nothing else sends until emergency is delivered
2. ALL CHANNELS - Email, SMS, Push, and potentially Voice simultaneously
3. NO OPT-OUT - Life safety > subscriber preferences (within legal bounds)
4. AUDIT TRAIL - Every action logged for liability protection
5. AUTHORIZATION - Must have verified municipal authority to send
6. REDUNDANCY - Multiple delivery paths, must succeed
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        EMERGENCY BROADCAST SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      AUTHORIZATION LAYER                                 │   │
│  │                                                                          │   │
│  │   Municipal Admin ──► 2FA + PIN ──► Role Verification ──► Authorized    │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      BROADCAST CREATION                                  │   │
│  │                                                                          │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐  │   │
│  │   │  Category    │  Severity    │  Message    │  Communities       │  │   │
│  │   │  (Required)  │  (Required)  │  (Required) │  (Required)        │  │   │
│  │   └─────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    SIMULTANEOUS DISPATCH                                 │   │
│  │                                                                          │   │
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                   │   │
│  │   │  EMAIL  │  │   SMS   │  │  PUSH   │  │  VOICE  │                   │   │
│  │   │  (P0)   │  │  (P0)   │  │  (P0)   │  │  (P0)   │                   │   │
│  │   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘                   │   │
│  │        │            │            │            │                         │   │
│  │        └────────────┴────────────┴────────────┘                         │   │
│  │                           │                                              │   │
│  │              Module 0B (P0 Queue - HIGHEST PRIORITY)                    │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      DELIVERY CONFIRMATION                               │   │
│  │                                                                          │   │
│  │   Real-time tracking ──► Delivery % Dashboard ──► Completion Report     │   │
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
-- EMERGENCY BROADCASTS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE emergency_broadcasts (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    instructions TEXT,  -- What should people do?
    
    -- Classification
    category VARCHAR(50) NOT NULL,  -- fire, flood, earthquake, tornado, shooter, amber, shelter, evacuation, other
    severity VARCHAR(20) NOT NULL,  -- critical, severe, moderate
    
    -- Targeting
    community_ids BIGINT[] NOT NULL,
    
    -- ALL channels for emergencies
    send_email BOOLEAN DEFAULT TRUE,
    send_sms BOOLEAN DEFAULT TRUE,
    send_push BOOLEAN DEFAULT TRUE,
    send_voice BOOLEAN DEFAULT FALSE,  -- Optional voice broadcast
    
    -- Authorization (CRITICAL)
    authorized_by BIGINT NOT NULL REFERENCES users(id),
    authorizer_name VARCHAR(255) NOT NULL,  -- Full name for audit
    authorizer_title VARCHAR(255) NOT NULL,  -- e.g., "Emergency Manager"
    authorization_code VARCHAR(100) NOT NULL,  -- Verification code they entered
    authorized_at TIMESTAMP NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- pending, authorized, sending, sent, cancelled
    
    -- Timing
    created_at TIMESTAMP DEFAULT NOW(),
    sending_started_at TIMESTAMP,
    sending_completed_at TIMESTAMP,
    
    -- Delivery stats
    total_recipients INTEGER DEFAULT 0,
    
    email_queued INTEGER DEFAULT 0,
    email_sent INTEGER DEFAULT 0,
    email_delivered INTEGER DEFAULT 0,
    
    sms_queued INTEGER DEFAULT 0,
    sms_sent INTEGER DEFAULT 0,
    sms_delivered INTEGER DEFAULT 0,
    
    push_queued INTEGER DEFAULT 0,
    push_sent INTEGER DEFAULT 0,
    push_delivered INTEGER DEFAULT 0,
    
    voice_queued INTEGER DEFAULT 0,
    voice_sent INTEGER DEFAULT 0,
    voice_answered INTEGER DEFAULT 0,
    
    -- External integrations
    ipaws_alert_id VARCHAR(100),  -- FEMA IPAWS ID if integrated
    
    -- Audit
    audit_log JSONB DEFAULT '[]'
);

CREATE INDEX idx_emergency_status ON emergency_broadcasts (status, created_at DESC);
CREATE INDEX idx_emergency_communities ON emergency_broadcasts USING GIN (community_ids);


-- ═══════════════════════════════════════════════════════════════════════════════
-- MUNICIPAL ADMINISTRATORS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE municipal_admins (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    community_id BIGINT NOT NULL REFERENCES communities(id),
    
    -- Role
    title VARCHAR(255) NOT NULL,  -- Emergency Manager, Fire Chief, Police Chief, Mayor
    department VARCHAR(255),
    
    -- Permissions
    can_send_emergency BOOLEAN DEFAULT FALSE,
    can_send_test BOOLEAN DEFAULT TRUE,
    
    -- Extra security
    authorization_pin_hash VARCHAR(255) NOT NULL,  -- Hashed 6-digit PIN
    
    -- Contact for verification
    phone VARCHAR(50) NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMP,
    verified_by VARCHAR(255),  -- Who verified this admin
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE (user_id, community_id)
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- EMERGENCY CATEGORIES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE emergency_categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Template defaults
    default_severity VARCHAR(20) DEFAULT 'severe',
    template_message TEXT,  -- Pre-written template
    template_instructions TEXT,
    
    -- Channel defaults
    default_voice BOOLEAN DEFAULT FALSE,  -- Voice is expensive
    
    -- Display
    icon VARCHAR(50),
    color VARCHAR(20),
    
    display_order INTEGER DEFAULT 0
);

-- Default categories
INSERT INTO emergency_categories (slug, name, default_severity, template_message, template_instructions, default_voice) VALUES
    ('fire', 'Fire/Wildfire', 'critical', 'A fire emergency has been declared in your area.', 'Follow evacuation orders. Do not return until authorities indicate it is safe.', true),
    ('flood', 'Flood', 'severe', 'A flood warning is in effect for your area.', 'Move to higher ground immediately. Avoid walking or driving through flood waters.', true),
    ('earthquake', 'Earthquake', 'critical', 'An earthquake has occurred in your area.', 'Drop, Cover, and Hold On. After shaking stops, check for injuries and damage.', false),
    ('tornado', 'Tornado', 'critical', 'A tornado warning is in effect for your area.', 'Seek shelter immediately in a basement or interior room on the lowest floor.', true),
    ('shooter', 'Active Threat', 'critical', 'An active threat has been reported in your area.', 'Run, Hide, Fight. If possible, evacuate. If not, hide and silence your phone.', true),
    ('amber', 'AMBER Alert', 'severe', 'An AMBER Alert has been issued.', 'If you see the suspect or vehicle, call 911 immediately. Do not approach.', false),
    ('shelter', 'Shelter in Place', 'severe', 'A shelter in place order has been issued for your area.', 'Remain indoors. Close all windows and doors. Monitor local news for updates.', false),
    ('evacuation', 'Evacuation Order', 'critical', 'An evacuation order has been issued for your area.', 'Leave immediately using designated routes. Take essential items only.', true),
    ('health', 'Public Health', 'severe', 'A public health emergency has been declared.', 'Follow guidance from health authorities.', false),
    ('other', 'Other Emergency', 'moderate', NULL, 'Follow instructions from local authorities.', false);


-- ═══════════════════════════════════════════════════════════════════════════════
-- EMERGENCY BROADCAST AUDIT LOG
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE emergency_audit_log (
    id BIGSERIAL PRIMARY KEY,
    broadcast_id BIGINT NOT NULL REFERENCES emergency_broadcasts(id),
    
    -- Action
    action VARCHAR(50) NOT NULL,  -- created, authorized, send_started, send_completed, cancelled
    
    -- Actor
    user_id BIGINT REFERENCES users(id),
    user_name VARCHAR(255),
    user_ip VARCHAR(50),
    user_agent TEXT,
    
    -- Details
    details JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_broadcast ON emergency_audit_log (broadcast_id, created_at);
```

---

## Service Interfaces

### EmergencyBroadcastServiceInterface

```php
<?php

namespace App\Contracts\Emergency;

interface EmergencyBroadcastServiceInterface
{
    /**
     * Create emergency broadcast (requires authorization)
     */
    public function create(CreateEmergencyRequest $request, string $authorizationPin): EmergencyBroadcast;
    
    /**
     * Send broadcast immediately (P0 priority)
     */
    public function send(int $broadcastId): SendResult;
    
    /**
     * Cancel broadcast (if not yet sent)
     */
    public function cancel(int $broadcastId, string $reason): bool;
    
    /**
     * Get real-time delivery status
     */
    public function getDeliveryStatus(int $broadcastId): DeliveryStatus;
    
    /**
     * Send test broadcast (limited recipients)
     */
    public function sendTest(int $broadcastId, array $testRecipients): SendResult;
}
```

---

## Core Services

### EmergencyBroadcastService

```php
<?php

namespace App\Services\Emergency;

use App\Contracts\Emergency\EmergencyBroadcastServiceInterface;
use App\Contracts\Communication\MessageServiceInterface;
use App\Models\Emergency\EmergencyBroadcast;
use App\Models\Emergency\MunicipalAdmin;
use Illuminate\Support\Facades\Hash;

class EmergencyBroadcastService implements EmergencyBroadcastServiceInterface
{
    public function __construct(
        private MessageServiceInterface $messages,
        private AuditLogger $audit,
    ) {}
    
    public function create(CreateEmergencyRequest $request, string $authorizationPin): EmergencyBroadcast
    {
        // 1. Verify user is authorized municipal admin
        $admin = $this->verifyAuthorization($request->communityIds, $authorizationPin);
        
        // 2. Generate authorization code
        $authCode = strtoupper(Str::random(8));
        
        // 3. Create broadcast
        $broadcast = EmergencyBroadcast::create([
            'title' => $request->title,
            'message' => $request->message,
            'instructions' => $request->instructions,
            'category' => $request->category,
            'severity' => $request->severity,
            'community_ids' => $request->communityIds,
            'send_email' => true,
            'send_sms' => true,
            'send_push' => true,
            'send_voice' => $request->sendVoice ?? false,
            'authorized_by' => $admin->user_id,
            'authorizer_name' => $admin->user->name,
            'authorizer_title' => $admin->title,
            'authorization_code' => $authCode,
            'authorized_at' => now(),
            'status' => 'authorized',
        ]);
        
        // 4. Log audit
        $this->audit->log($broadcast, 'created', [
            'admin_id' => $admin->id,
            'communities' => $request->communityIds,
        ]);
        
        $this->audit->log($broadcast, 'authorized', [
            'admin_id' => $admin->id,
            'authorization_code' => $authCode,
        ]);
        
        return $broadcast;
    }
    
    private function verifyAuthorization(array $communityIds, string $pin): MunicipalAdmin
    {
        $user = auth()->user();
        
        // Find admin record for these communities
        $admin = MunicipalAdmin::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('can_send_emergency', true)
            ->whereIn('community_id', $communityIds)
            ->first();
        
        if (!$admin) {
            throw new UnauthorizedException("User is not authorized to send emergency broadcasts to these communities");
        }
        
        // Verify PIN
        if (!Hash::check($pin, $admin->authorization_pin_hash)) {
            // Log failed attempt
            Log::warning('Failed emergency authorization PIN attempt', [
                'user_id' => $user->id,
                'communities' => $communityIds,
                'ip' => request()->ip(),
            ]);
            
            throw new UnauthorizedException("Invalid authorization PIN");
        }
        
        return $admin;
    }
    
    public function send(int $broadcastId): SendResult
    {
        $broadcast = EmergencyBroadcast::findOrFail($broadcastId);
        
        if ($broadcast->status !== 'authorized') {
            throw new InvalidStateException("Broadcast must be authorized before sending");
        }
        
        $broadcast->update([
            'status' => 'sending',
            'sending_started_at' => now(),
        ]);
        
        $this->audit->log($broadcast, 'send_started');
        
        // Get ALL subscribers for target communities
        // Note: No opt-out filtering for emergencies
        $recipients = $this->getAllRecipients($broadcast->community_ids);
        $broadcast->update(['total_recipients' => count($recipients)]);
        
        // PARALLEL DISPATCH - All channels simultaneously
        $jobs = [];
        
        if ($broadcast->send_email) {
            $jobs['email'] = new SendEmergencyEmail($broadcast->id, $recipients);
        }
        
        if ($broadcast->send_sms) {
            $jobs['sms'] = new SendEmergencySms($broadcast->id, $recipients);
        }
        
        if ($broadcast->send_push) {
            $jobs['push'] = new SendEmergencyPush($broadcast->id, $recipients);
        }
        
        if ($broadcast->send_voice) {
            $jobs['voice'] = new SendEmergencyVoice($broadcast->id, $recipients);
        }
        
        // Dispatch all jobs simultaneously on emergency queue
        foreach ($jobs as $channel => $job) {
            dispatch($job)
                ->onQueue('emergency')
                ->onConnection('emergency');  // Dedicated connection
        }
        
        return new SendResult(
            success: true,
            broadcastId: $broadcast->id,
            totalRecipients: count($recipients),
            channelsDispatched: array_keys($jobs),
        );
    }
    
    private function getAllRecipients(array $communityIds): array
    {
        // Get ALL subscribers - no filtering for emergencies
        return Subscriber::whereHas('communities', function ($q) use ($communityIds) {
                $q->whereIn('community_id', $communityIds);
            })
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'email' => $s->email,
                'phone' => $s->phone,
                'device_tokens' => $s->device_tokens ?? [],
            ])
            ->toArray();
    }
    
    public function getDeliveryStatus(int $broadcastId): DeliveryStatus
    {
        $broadcast = EmergencyBroadcast::findOrFail($broadcastId);
        
        return new DeliveryStatus(
            broadcastId: $broadcast->id,
            status: $broadcast->status,
            totalRecipients: $broadcast->total_recipients,
            
            emailQueued: $broadcast->email_queued,
            emailSent: $broadcast->email_sent,
            emailDelivered: $broadcast->email_delivered,
            emailPercent: $broadcast->total_recipients > 0 
                ? round(($broadcast->email_delivered / $broadcast->total_recipients) * 100, 1) 
                : 0,
            
            smsQueued: $broadcast->sms_queued,
            smsSent: $broadcast->sms_sent,
            smsDelivered: $broadcast->sms_delivered,
            smsPercent: $broadcast->total_recipients > 0 
                ? round(($broadcast->sms_delivered / $broadcast->total_recipients) * 100, 1) 
                : 0,
            
            pushQueued: $broadcast->push_queued,
            pushSent: $broadcast->push_sent,
            pushDelivered: $broadcast->push_delivered,
            
            elapsedSeconds: $broadcast->sending_started_at 
                ? now()->diffInSeconds($broadcast->sending_started_at) 
                : 0,
        );
    }
    
    public function sendTest(int $broadcastId, array $testRecipients): SendResult
    {
        $broadcast = EmergencyBroadcast::findOrFail($broadcastId);
        
        // Verify user can send tests
        $admin = MunicipalAdmin::where('user_id', auth()->id())
            ->where('can_send_test', true)
            ->first();
        
        if (!$admin) {
            throw new UnauthorizedException("User cannot send test broadcasts");
        }
        
        // Send to limited recipients (max 5)
        $testRecipients = array_slice($testRecipients, 0, 5);
        
        $this->audit->log($broadcast, 'test_sent', [
            'recipients' => $testRecipients,
        ]);
        
        // Send test emails only (not SMS to avoid costs)
        foreach ($testRecipients as $email) {
            $this->messages->send(new MessageRequest(
                channel: 'email',
                priority: 'P4',  // Test is low priority
                messageType: 'emergency_test',
                recipientAddress: $email,
                template: 'emergency',
                subject: '[TEST] ' . $broadcast->title,
                data: [
                    'broadcast_id' => $broadcast->id,
                    'title' => $broadcast->title,
                    'message' => $broadcast->message,
                    'instructions' => $broadcast->instructions,
                    'category' => $broadcast->category,
                    'is_test' => true,
                ],
            ));
        }
        
        return new SendResult(
            success: true,
            isTest: true,
            recipientCount: count($testRecipients),
        );
    }
}
```

### SendEmergencyEmail Job

```php
<?php

namespace App\Jobs\Emergency;

use App\Contracts\Communication\MessageServiceInterface;
use App\Models\Emergency\EmergencyBroadcast;

class SendEmergencyEmail implements ShouldQueue
{
    public $queue = 'emergency';
    public $timeout = 600;  // 10 minutes max
    public $tries = 1;  // No retries - must succeed first time
    
    public function __construct(
        private int $broadcastId,
        private array $recipients,
    ) {}
    
    public function handle(MessageServiceInterface $messages)
    {
        $broadcast = EmergencyBroadcast::find($this->broadcastId);
        
        // Filter to recipients with email
        $emailRecipients = collect($this->recipients)
            ->filter(fn($r) => !empty($r['email']))
            ->map(fn($r) => [
                'id' => $r['id'],
                'type' => 'subscriber',
                'address' => $r['email'],
            ])
            ->toArray();
        
        $broadcast->update(['email_queued' => count($emailRecipients)]);
        
        // Send via Communication Infrastructure - P0 PRIORITY
        $result = $messages->sendBulk(new BulkMessageRequest(
            channel: 'email',
            priority: 'P0',  // EMERGENCY - HIGHEST PRIORITY
            messageType: 'emergency',
            recipients: $emailRecipients,
            subject: $this->buildSubject($broadcast),
            template: 'emergency',
            sharedData: [
                'broadcast_id' => $broadcast->id,
                'title' => $broadcast->title,
                'message' => $broadcast->message,
                'instructions' => $broadcast->instructions,
                'category' => $broadcast->category,
                'severity' => $broadcast->severity,
                'authorization_code' => $broadcast->authorization_code,
            ],
            sourceType: 'emergency_broadcasts',
            sourceId: $broadcast->id,
            ipPool: 'emergency',  // Best reputation IPs
        ));
        
        $broadcast->update(['email_sent' => $result->queued]);
    }
    
    private function buildSubject(EmergencyBroadcast $broadcast): string
    {
        $icon = match ($broadcast->category) {
            'fire' => '🔥',
            'flood' => '🌊',
            'tornado' => '🌪️',
            'earthquake' => '⚠️',
            'shooter' => '🚨',
            'amber' => '🚨',
            default => '⚠️',
        };
        
        $prefix = match ($broadcast->severity) {
            'critical' => 'EMERGENCY',
            'severe' => 'ALERT',
            default => 'NOTICE',
        };
        
        return "{$icon} {$prefix}: {$broadcast->title}";
    }
}
```

### SendEmergencySms Job

```php
<?php

namespace App\Jobs\Emergency;

class SendEmergencySms implements ShouldQueue
{
    public $queue = 'emergency';
    public $timeout = 600;
    public $tries = 1;
    
    public function __construct(
        private int $broadcastId,
        private array $recipients,
    ) {}
    
    public function handle(MessageServiceInterface $messages)
    {
        $broadcast = EmergencyBroadcast::find($this->broadcastId);
        
        // Filter to recipients with phone
        $smsRecipients = collect($this->recipients)
            ->filter(fn($r) => !empty($r['phone']))
            ->map(fn($r) => [
                'id' => $r['id'],
                'type' => 'subscriber',
                'address' => $r['phone'],
            ])
            ->toArray();
        
        $broadcast->update(['sms_queued' => count($smsRecipients)]);
        
        // Build SMS message (max 160 chars for reliability)
        $message = $this->buildSmsMessage($broadcast);
        
        // Send via Communication Infrastructure - P0 PRIORITY
        $result = $messages->sendBulk(new BulkMessageRequest(
            channel: 'sms',
            priority: 'P0',
            messageType: 'emergency',
            recipients: $smsRecipients,
            body: $message,
            sourceType: 'emergency_broadcasts',
            sourceId: $broadcast->id,
        ));
        
        $broadcast->update(['sms_sent' => $result->queued]);
    }
    
    private function buildSmsMessage(EmergencyBroadcast $broadcast): string
    {
        // SMS must be concise
        $prefix = strtoupper($broadcast->category);
        $message = "{$prefix}: {$broadcast->title}. ";
        
        if ($broadcast->instructions) {
            $message .= Str::limit($broadcast->instructions, 80);
        } else {
            $message .= Str::limit($broadcast->message, 80);
        }
        
        // Don't exceed 160 chars
        return Str::limit($message, 160);
    }
}
```

---

## Municipal Admin Interface

### API Endpoints

```php
<?php
// routes/api.php

Route::prefix('v1/emergency')->middleware(['auth:sanctum', 'municipal_admin'])->group(function () {
    // Broadcast management
    Route::get('/', [EmergencyBroadcastController::class, 'index']);
    Route::post('/', [EmergencyBroadcastController::class, 'create']);
    Route::get('/{id}', [EmergencyBroadcastController::class, 'show']);
    
    // Actions
    Route::post('/{id}/send', [EmergencyBroadcastController::class, 'send']);
    Route::post('/{id}/cancel', [EmergencyBroadcastController::class, 'cancel']);
    Route::post('/{id}/test', [EmergencyBroadcastController::class, 'sendTest']);
    
    // Real-time status
    Route::get('/{id}/status', [EmergencyBroadcastController::class, 'status']);
    
    // Categories
    Route::get('/categories', [EmergencyBroadcastController::class, 'categories']);
    
    // Audit log
    Route::get('/{id}/audit', [EmergencyBroadcastController::class, 'auditLog']);
});

// Admin management (super admin only)
Route::prefix('v1/municipal-admins')->middleware(['auth:sanctum', 'super_admin'])->group(function () {
    Route::get('/', [MunicipalAdminController::class, 'index']);
    Route::post('/', [MunicipalAdminController::class, 'create']);
    Route::put('/{id}', [MunicipalAdminController::class, 'update']);
    Route::delete('/{id}', [MunicipalAdminController::class, 'destroy']);
    Route::post('/{id}/verify', [MunicipalAdminController::class, 'verify']);
});
```

### MunicipalAdminMiddleware

```php
<?php

namespace App\Http\Middleware;

class MunicipalAdminMiddleware
{
    public function handle($request, Closure $next)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        
        $isAdmin = MunicipalAdmin::where('user_id', $user->id)
            ->where('is_active', true)
            ->exists();
        
        if (!$isAdmin) {
            return response()->json(['error' => 'Not authorized as municipal administrator'], 403);
        }
        
        return $next($request);
    }
}
```

---

## Events

### Emitted Events

```php
EmergencyBroadcastCreated::class
EmergencyBroadcastAuthorized::class
EmergencyBroadcastSendStarted::class
EmergencyBroadcastSendCompleted::class
EmergencyBroadcastCancelled::class

// Delivery events
EmergencyEmailDelivered::class
EmergencySmsDelivered::class
EmergencyPushDelivered::class
```

### Listened Events

```php
// From Module 0B
MessageSent::class      // Update sent counts
MessageDelivered::class // Update delivered counts
```

---

## Configuration

```php
<?php
// config/emergency.php

return [
    'authorization' => [
        'pin_required' => true,
        'pin_length' => 6,
        'max_failed_attempts' => 3,
        'lockout_minutes' => 30,
    ],
    
    'channels' => [
        'email' => [
            'enabled' => true,
            'ip_pool' => 'emergency',
        ],
        'sms' => [
            'enabled' => true,
            'max_length' => 160,
        ],
        'push' => [
            'enabled' => true,
            'sound' => 'emergency.wav',
            'priority' => 'high',
        ],
        'voice' => [
            'enabled' => env('EMERGENCY_VOICE_ENABLED', false),
            'message_max_seconds' => 30,
        ],
    ],
    
    'rate_limits' => [
        'max_per_hour' => 5,  // Prevent accidental spam
        'cooldown_minutes' => 5,  // Between broadcasts
    ],
    
    'ipaws' => [
        'enabled' => env('IPAWS_ENABLED', false),
        'cog_id' => env('IPAWS_COG_ID'),
        'endpoint' => env('IPAWS_ENDPOINT'),
    ],
];
```

---

## Acceptance Criteria

### Must Have
- [ ] Municipal admin authorization with PIN
- [ ] Emergency broadcast creation
- [ ] Multi-channel simultaneous dispatch (email, SMS, push)
- [ ] P0 priority in Communication Infrastructure
- [ ] Real-time delivery status tracking
- [ ] Complete audit trail
- [ ] Test broadcast capability

### Should Have
- [ ] Pre-defined category templates
- [ ] Voice broadcast support
- [ ] Rate limiting to prevent accidental spam
- [ ] Admin management interface

### Nice to Have
- [ ] IPAWS/FEMA integration
- [ ] Multi-language support
- [ ] TTY/TDD accessibility
- [ ] Mobile app for municipal admins

---

## Notes for Agent

1. **P0 IS SACRED** - Emergency messages MUST go out immediately, override everything
2. **Authorization is critical** - Never allow unauthorized sends, log everything
3. **No opt-out for true emergencies** - Life safety overrides preferences
4. **Audit everything** - Complete trail for liability protection
5. **SMS costs are acceptable** - Don't optimize cost for emergencies
6. **Redundancy matters** - If one channel fails, others must succeed
