<?php

namespace App\Services\Emergency;

use App\Contracts\Emergency\EmergencyBroadcastServiceInterface;
use App\Events\Emergency\EmergencyBroadcastAuthorized;
use App\Events\Emergency\EmergencyBroadcastCancelled;
use App\Events\Emergency\EmergencyBroadcastCreated;
use App\Events\Emergency\EmergencyBroadcastSendCompleted;
use App\Events\Emergency\EmergencyBroadcastSendStarted;
use App\Jobs\Emergency\SendEmergencyEmail;
use App\Jobs\Emergency\SendEmergencyPush;
use App\Jobs\Emergency\SendEmergencySms;
use App\Jobs\Emergency\SendEmergencyVoice;
use App\Models\Emergency\EmergencyAuditLog;
use App\Models\Emergency\EmergencyBroadcast;
use App\Models\Emergency\EmergencyCategory;
use App\Models\Emergency\MunicipalAdmin;
use App\Models\Subscriber\Subscriber;
use App\Services\EmailService;
use App\Services\SMSService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EmergencyBroadcastService implements EmergencyBroadcastServiceInterface
{
    public function __construct(
        private EmailService $emailService,
        private SMSService $smsService,
    ) {}
    
    public function create(array $data, string $authorizationPin): EmergencyBroadcast
    {
        // 1. Verify user is authorized municipal admin
        $admin = $this->verifyAuthorization($data['community_ids'], $authorizationPin);
        
        // 2. Generate authorization code
        $authCode = strtoupper(Str::random(8));
        
        // 3. Create broadcast
        $broadcast = EmergencyBroadcast::create([
            'title' => $data['title'],
            'message' => $data['message'],
            'instructions' => $data['instructions'] ?? null,
            'category' => $data['category'],
            'severity' => $data['severity'],
            'community_ids' => $data['community_ids'],
            'send_email' => $data['send_email'] ?? true,
            'send_sms' => $data['send_sms'] ?? true,
            'send_push' => $data['send_push'] ?? true,
            'send_voice' => $data['send_voice'] ?? false,
            'authorized_by' => $admin->user_id,
            'authorizer_name' => $admin->user->name,
            'authorizer_title' => $admin->title,
            'authorization_code' => $authCode,
            'authorized_at' => now(),
            'status' => 'authorized',
        ]);
        
        // 4. Log audit
        $this->logAudit($broadcast, 'created', [
            'admin_id' => $admin->id,
            'communities' => $data['community_ids'],
        ]);
        
        $this->logAudit($broadcast, 'authorized', [
            'admin_id' => $admin->id,
            'authorization_code' => $authCode,
        ]);
        
        event(new EmergencyBroadcastCreated($broadcast));
        event(new EmergencyBroadcastAuthorized($broadcast));
        
        return $broadcast;
    }
    
    private function verifyAuthorization(array $communityIds, string $pin): MunicipalAdmin
    {
        $user = auth()->user();
        
        if (!$user) {
            throw new \Illuminate\Auth\AuthenticationException('User must be authenticated');
        }
        
        // Find admin record for these communities
        $admin = MunicipalAdmin::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('can_send_emergency', true)
            ->whereIn('community_id', $communityIds)
            ->first();
        
        if (!$admin) {
            Log::warning('Unauthorized emergency broadcast attempt', [
                'user_id' => $user->id,
                'communities' => $communityIds,
                'ip' => request()->ip(),
            ]);
            
            throw new \Illuminate\Auth\Access\AuthorizationException('User is not authorized to send emergency broadcasts to these communities');
        }
        
        // Verify PIN
        if (!Hash::check($pin, $admin->authorization_pin_hash)) {
            // Log failed attempt
            Log::warning('Failed emergency authorization PIN attempt', [
                'user_id' => $user->id,
                'communities' => $communityIds,
                'ip' => request()->ip(),
            ]);
            
            throw new \Illuminate\Auth\Access\AuthorizationException('Invalid authorization PIN');
        }
        
        return $admin;
    }
    
    public function send(int $broadcastId): array
    {
        $broadcast = EmergencyBroadcast::findOrFail($broadcastId);
        
        if ($broadcast->status !== 'authorized') {
            throw new \InvalidArgumentException("Broadcast must be authorized before sending");
        }
        
        $broadcast->update([
            'status' => 'sending',
            'sending_started_at' => now(),
        ]);
        
        $this->logAudit($broadcast, 'send_started');
        event(new EmergencyBroadcastSendStarted($broadcast));
        
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
                ->onConnection(config('queue.default'));
        }
        
        return [
            'success' => true,
            'broadcast_id' => $broadcast->id,
            'total_recipients' => count($recipients),
            'channels_dispatched' => array_keys($jobs),
        ];
    }
    
    private function getAllRecipients(array $communityIds): array
    {
        // Get ALL subscribers - no filtering for emergencies
        return Subscriber::whereHas('communities', function ($q) use ($communityIds) {
                $q->whereIn('community_id', $communityIds);
            })
            ->where('status', 'active')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'email' => $s->email,
                'phone' => $s->phone,
                'device_tokens' => $s->device_tokens ?? [],
            ])
            ->toArray();
    }
    
    public function getDeliveryStatus(int $broadcastId): array
    {
        $broadcast = EmergencyBroadcast::findOrFail($broadcastId);
        
        return [
            'broadcast_id' => $broadcast->id,
            'status' => $broadcast->status,
            'total_recipients' => $broadcast->total_recipients,
            
            'email' => [
                'queued' => $broadcast->email_queued,
                'sent' => $broadcast->email_sent,
                'delivered' => $broadcast->email_delivered,
                'percent' => $broadcast->getEmailDeliveryPercentage(),
            ],
            
            'sms' => [
                'queued' => $broadcast->sms_queued,
                'sent' => $broadcast->sms_sent,
                'delivered' => $broadcast->sms_delivered,
                'percent' => $broadcast->getSmsDeliveryPercentage(),
            ],
            
            'push' => [
                'queued' => $broadcast->push_queued,
                'sent' => $broadcast->push_sent,
                'delivered' => $broadcast->push_delivered,
                'percent' => $broadcast->getPushDeliveryPercentage(),
            ],
            
            'voice' => [
                'queued' => $broadcast->voice_queued,
                'sent' => $broadcast->voice_sent,
                'answered' => $broadcast->voice_answered,
            ],
            
            'elapsed_seconds' => $broadcast->sending_started_at 
                ? now()->diffInSeconds($broadcast->sending_started_at) 
                : 0,
        ];
    }
    
    public function sendTest(int $broadcastId, array $testRecipients): array
    {
        $broadcast = EmergencyBroadcast::findOrFail($broadcastId);
        
        // Verify user can send tests
        $admin = MunicipalAdmin::where('user_id', auth()->id())
            ->where('can_send_test', true)
            ->first();
        
        if (!$admin) {
            throw new \Illuminate\Auth\Access\AuthorizationException('User cannot send test broadcasts');
        }
        
        // Send to limited recipients (max 5)
        $testRecipients = array_slice($testRecipients, 0, 5);
        
        $this->logAudit($broadcast, 'test_sent', [
            'recipients' => $testRecipients,
        ]);
        
        // Send test emails only (not SMS to avoid costs)
        $sent = 0;
        foreach ($testRecipients as $email) {
            try {
                $result = $this->emailService->send(
                    $email,
                    '[TEST] ' . $broadcast->title,
                    $this->buildTestEmailContent($broadcast),
                    strip_tags($this->buildTestEmailContent($broadcast)),
                    [
                        'track_opens' => false,
                        'emergency_broadcast_id' => $broadcast->id,
                        'is_test' => true,
                    ]
                );
                
                if ($result && ($result['success'] ?? false)) {
                    $sent++;
                }
            } catch (\Exception $e) {
                Log::error('Failed to send test emergency email', [
                    'broadcast_id' => $broadcast->id,
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
        
        return [
            'success' => true,
            'is_test' => true,
            'recipient_count' => count($testRecipients),
            'sent' => $sent,
        ];
    }
    
    private function buildTestEmailContent(EmergencyBroadcast $broadcast): string
    {
        return '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
        <strong style="color: #f59e0b;">⚠️ TEST BROADCAST - NOT A REAL EMERGENCY</strong>
    </div>
    <h1 style="color: #dc2626;">' . htmlspecialchars($broadcast->title) . '</h1>
    <p style="font-size: 16px;">' . nl2br(htmlspecialchars($broadcast->message)) . '</p>
    ' . ($broadcast->instructions ? '<div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-left: 3px solid #dc2626;">
        <strong>Instructions:</strong><br>
        ' . nl2br(htmlspecialchars($broadcast->instructions)) . '
    </div>' : '') . '
</body>
</html>';
    }
    
    public function cancel(int $broadcastId, string $reason): bool
    {
        $broadcast = EmergencyBroadcast::findOrFail($broadcastId);
        
        if (!in_array($broadcast->status, ['pending', 'authorized'])) {
            throw new \InvalidArgumentException("Broadcast cannot be cancelled in current status");
        }
        
        $broadcast->update(['status' => 'cancelled']);
        
        $this->logAudit($broadcast, 'cancelled', [
            'reason' => $reason,
            'cancelled_by' => auth()->id(),
        ]);
        
        event(new EmergencyBroadcastCancelled($broadcast, $reason));
        
        return true;
    }
    
    private function logAudit(EmergencyBroadcast $broadcast, string $action, array $details = []): void
    {
        EmergencyAuditLog::create([
            'broadcast_id' => $broadcast->id,
            'action' => $action,
            'user_id' => auth()->id(),
            'user_name' => auth()->user()?->name,
            'user_ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'details' => $details,
            'created_at' => now(),
        ]);
        
        // Also update the audit_log JSONB field on the broadcast
        $auditLog = $broadcast->audit_log ?? [];
        $auditLog[] = [
            'action' => $action,
            'user_id' => auth()->id(),
            'user_name' => auth()->user()?->name,
            'timestamp' => now()->toIso8601String(),
            'details' => $details,
        ];
        $broadcast->update(['audit_log' => $auditLog]);
    }
}

