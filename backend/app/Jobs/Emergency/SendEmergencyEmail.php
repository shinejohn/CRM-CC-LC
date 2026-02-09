<?php

namespace App\Jobs\Emergency;

use App\Models\Emergency\EmergencyBroadcast;
use App\Services\EmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendEmergencyEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $queue = 'emergency';
    public $timeout = 600; // 10 minutes max
    public $tries = 1; // No retries - must succeed first time
    
    public function __construct(
        private int $broadcastId,
        private array $recipients,
    ) {}
    
    public function handle(EmailService $emailService)
    {
        $broadcast = EmergencyBroadcast::find($this->broadcastId);
        
        if (!$broadcast) {
            Log::error('Emergency broadcast not found', ['broadcast_id' => $this->broadcastId]);
            return;
        }
        
        // Filter to recipients with email
        $emailRecipients = collect($this->recipients)
            ->filter(fn($r) => !empty($r['email']))
            ->toArray();
        
        $broadcast->update(['email_queued' => count($emailRecipients)]);
        
        $subject = $this->buildSubject($broadcast);
        $htmlContent = $this->buildEmailContent($broadcast);
        $textContent = strip_tags($htmlContent);
        
        $sent = 0;
        $failed = 0;
        
        // Send via EmailService - P0 PRIORITY
        foreach ($emailRecipients as $recipient) {
            try {
                $result = $emailService->send(
                    $recipient['email'],
                    $subject,
                    $htmlContent,
                    $textContent,
                    [
                        'track_opens' => true,
                        'emergency_broadcast_id' => $broadcast->id,
                        'recipient_id' => $recipient['id'],
                        'ip_pool' => 'emergency', // Best reputation IPs
                        'priority' => 'P0', // EMERGENCY - HIGHEST PRIORITY
                    ]
                );
                
                if ($result && ($result['success'] ?? false)) {
                    $sent++;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                Log::error('Failed to send emergency email', [
                    'broadcast_id' => $broadcast->id,
                    'recipient_id' => $recipient['id'],
                    'error' => $e->getMessage(),
                ]);
                $failed++;
            }
        }
        
        $broadcast->increment('email_sent', $sent);
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
    
    private function buildEmailContent(EmergencyBroadcast $broadcast): string
    {
        $categoryIcon = match ($broadcast->category) {
            'fire' => '🔥',
            'flood' => '🌊',
            'tornado' => '🌪️',
            'earthquake' => '⚠️',
            'shooter' => '🚨',
            'amber' => '🚨',
            default => '⚠️',
        };
        
        $severityColor = match ($broadcast->severity) {
            'critical' => '#dc2626',
            'severe' => '#f59e0b',
            default => '#6b7280',
        };
        
        return '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: ' . $severityColor . '; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">' . $categoryIcon . ' ' . htmlspecialchars($broadcast->title) . '</h1>
    </div>
    <div style="background: #fff; padding: 20px; border: 2px solid ' . $severityColor . '; border-top: none; border-radius: 0 0 5px 5px;">
        <p style="font-size: 16px; font-weight: bold; color: ' . $severityColor . ';">' . nl2br(htmlspecialchars($broadcast->message)) . '</p>
        ' . ($broadcast->instructions ? '<div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 3px solid ' . $severityColor . ';">
            <strong>What you should do:</strong><br>
            ' . nl2br(htmlspecialchars($broadcast->instructions)) . '
        </div>' : '') . '
        <div style="margin-top: 20px; padding: 10px; background: #f3f4f6; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">Authorization Code: <strong>' . htmlspecialchars($broadcast->authorization_code) . '</strong></p>
            <p style="margin: 5px 0 0 0;">Authorized by: ' . htmlspecialchars($broadcast->authorizer_name) . ' (' . htmlspecialchars($broadcast->authorizer_title) . ')</p>
        </div>
    </div>
</body>
</html>';
    }
}



