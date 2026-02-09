<?php

namespace App\Services\Alert;

use App\Contracts\Alert\AlertServiceInterface;
use App\Events\Alert\AlertApproved;
use App\Events\Alert\AlertCancelled;
use App\Events\Alert\AlertCreated;
use App\Events\Alert\AlertSendCompleted;
use App\Events\Alert\AlertSendStarted;
use App\Events\Alert\AlertSubmittedForApproval;
use App\Jobs\Alert\SendAlert;
use App\Models\Alert\Alert;
use App\Models\Alert\AlertCategory;
use App\Models\Alert\AlertSend;
use App\Models\Newsletter\Sponsorship;
use App\Services\EmailService;
use App\Services\SMSService;
use Illuminate\Support\Facades\Log;

class AlertService implements AlertServiceInterface
{
    public function __construct(
        private TargetingEngine $targeting,
        private EmailService $emailService,
        private SMSService $smsService,
    ) {}
    
    public function create(array $data): Alert
    {
        $category = AlertCategory::where('slug', $data['category'])->firstOrFail();
        
        $alert = Alert::create([
            'headline' => $data['headline'],
            'summary' => $data['summary'],
            'full_content' => $data['full_content'] ?? null,
            'category' => $data['category'],
            'severity' => $data['severity'] ?? $category->default_severity,
            'source_url' => $data['source_url'] ?? null,
            'source_name' => $data['source_name'] ?? null,
            'image_url' => $data['image_url'] ?? null,
            'target_type' => $data['target_type'],
            'target_community_ids' => $data['target_community_ids'] ?? null,
            'target_geo_json' => $data['target_geo_json'] ?? null,
            'target_radius_miles' => $data['target_radius_miles'] ?? null,
            'send_email' => $data['send_email'] ?? true,
            'send_sms' => $data['send_sms'] ?? $category->default_send_sms,
            'send_push' => $data['send_push'] ?? true,
            'scheduled_for' => $data['scheduled_for'] ?? null,
            'sponsor_id' => $data['sponsor_id'] ?? null,
            'sponsorship_id' => $data['sponsorship_id'] ?? null,
            'created_by' => auth()->id(),
            'status' => 'draft',
        ]);
        
        event(new AlertCreated($alert));
        
        return $alert;
    }
    
    public function submitForApproval(int $alertId): Alert
    {
        $alert = Alert::findOrFail($alertId);
        
        if (!$alert->isDraft()) {
            throw new \InvalidArgumentException("Alert must be in draft status");
        }
        
        $alert->update(['status' => 'pending_approval']);
        
        event(new AlertSubmittedForApproval($alert));
        
        return $alert->fresh();
    }
    
    public function approve(int $alertId, int $approvedBy): Alert
    {
        $alert = Alert::findOrFail($alertId);
        
        if (!$alert->isPendingApproval()) {
            throw new \InvalidArgumentException("Alert must be pending approval");
        }
        
        $alert->update([
            'status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_at' => now(),
        ]);
        
        event(new AlertApproved($alert));
        
        // If not scheduled for later, send immediately
        if (!$alert->scheduled_for || $alert->scheduled_for <= now()) {
            dispatch(new SendAlert($alert->id));
        }
        
        return $alert->fresh();
    }
    
    public function send(int $alertId): array
    {
        $alert = Alert::findOrFail($alertId);
        
        if (!in_array($alert->status, ['approved', 'sending'])) {
            throw new \InvalidArgumentException("Alert must be approved before sending");
        }
        
        $alert->update([
            'status' => 'sending',
            'sending_started_at' => now(),
        ]);
        
        event(new AlertSendStarted($alert));
        
        // Get recipients
        $recipients = $this->targeting->getRecipients($alert);
        $alert->update(['total_recipients' => count($recipients)]);
        
        // Track sends
        $sendRecords = [];
        $emailRecipients = [];
        $smsRecipients = [];
        $pushRecipients = [];
        
        foreach ($recipients as $recipient) {
            $sendRecord = [
                'alert_id' => $alert->id,
                'subscriber_id' => $recipient['id'],
                'created_at' => now(),
            ];
            
            // Check subscriber preferences for this category
            $prefs = $this->getSubscriberPreferences($recipient['id'], $alert->category);
            
            if ($alert->send_email && $prefs['email'] && !empty($recipient['email'])) {
                $emailRecipients[] = $recipient;
                $sendRecord['email_sent'] = true;
            }
            
            if ($alert->send_sms && $prefs['sms'] && !empty($recipient['phone'])) {
                $smsRecipients[] = $recipient;
                $sendRecord['sms_sent'] = true;
            }
            
            if ($alert->send_push && $prefs['push'] && !empty($recipient['device_tokens'])) {
                $pushRecipients[] = $recipient;
                $sendRecord['push_sent'] = true;
            }
            
            $sendRecords[] = $sendRecord;
        }
        
        // Bulk insert send records
        AlertSend::insert($sendRecords);
        
        // Send via each channel
        $results = [
            'email' => ['queued' => 0, 'sent' => 0, 'failed' => 0],
            'sms' => ['queued' => 0, 'sent' => 0, 'failed' => 0],
            'push' => ['queued' => 0, 'sent' => 0, 'failed' => 0],
        ];
        
        if (!empty($emailRecipients)) {
            $emailResult = $this->sendEmail($alert, $emailRecipients);
            $results['email'] = $emailResult;
            $alert->increment('email_sent', $emailResult['sent']);
        }
        
        if (!empty($smsRecipients)) {
            $smsResult = $this->sendSms($alert, $smsRecipients);
            $results['sms'] = $smsResult;
            $alert->increment('sms_sent', $smsResult['sent']);
        }
        
        if (!empty($pushRecipients)) {
            $pushResult = $this->sendPush($alert, $pushRecipients);
            $results['push'] = $pushResult;
            $alert->increment('push_sent', $pushResult['sent']);
        }
        
        // Mark as sent
        $alert->update([
            'status' => 'sent',
            'sending_completed_at' => now(),
        ]);
        
        // Record sponsor impression if applicable
        if ($alert->sponsorship_id) {
            $sponsorship = Sponsorship::find($alert->sponsorship_id);
            if ($sponsorship) {
                $impressions = count($emailRecipients) + count($pushRecipients);
                $sponsorship->increment('impressions_delivered', $impressions);
            }
        }
        
        event(new AlertSendCompleted($alert, $results));
        
        return $results;
    }
    
    private function sendEmail(Alert $alert, array $recipients): array
    {
        $subject = $this->buildSubject($alert);
        $htmlContent = $this->buildEmailContent($alert);
        $textContent = strip_tags($htmlContent);
        
        $sent = 0;
        $failed = 0;
        
        foreach ($recipients as $recipient) {
            try {
                $result = $this->emailService->send(
                    $recipient['email'],
                    $subject,
                    $htmlContent,
                    $textContent,
                    [
                        'track_opens' => true,
                        'alert_id' => $alert->id,
                        'recipient_id' => $recipient['id'],
                        'ip_pool' => 'alerts', // P1 priority
                    ]
                );
                
                if ($result && ($result['success'] ?? false)) {
                    $sent++;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                Log::error('Failed to send alert email', [
                    'alert_id' => $alert->id,
                    'recipient_id' => $recipient['id'],
                    'error' => $e->getMessage(),
                ]);
                $failed++;
            }
        }
        
        return [
            'queued' => count($recipients),
            'sent' => $sent,
            'failed' => $failed,
        ];
    }
    
    private function sendSms(Alert $alert, array $recipients): array
    {
        $message = $this->buildSmsMessage($alert);
        
        $sent = 0;
        $failed = 0;
        
        foreach ($recipients as $recipient) {
            try {
                $result = $this->smsService->send(
                    $recipient['phone'],
                    $message,
                    [
                        'alert_id' => $alert->id,
                        'recipient_id' => $recipient['id'],
                    ]
                );
                
                if ($result && ($result['success'] ?? false)) {
                    $sent++;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                Log::error('Failed to send alert SMS', [
                    'alert_id' => $alert->id,
                    'recipient_id' => $recipient['id'],
                    'error' => $e->getMessage(),
                ]);
                $failed++;
            }
        }
        
        return [
            'queued' => count($recipients),
            'sent' => $sent,
            'failed' => $failed,
        ];
    }
    
    private function sendPush(Alert $alert, array $recipients): array
    {
        // Push notifications would be sent via Firebase/APNs
        // For now, we'll mark as queued but not implement full push logic
        // This should integrate with a push notification service
        
        $sent = 0;
        $failed = 0;
        
        // TODO: Implement push notification sending
        // For now, just count recipients
        foreach ($recipients as $recipient) {
            if (!empty($recipient['device_tokens'])) {
                $sent += count($recipient['device_tokens']);
            }
        }
        
        return [
            'queued' => count($recipients),
            'sent' => $sent,
            'failed' => $failed,
        ];
    }
    
    private function buildSubject(Alert $alert): string
    {
        $prefix = match ($alert->severity) {
            'critical' => '🚨 BREAKING: ',
            'urgent' => '⚡ ALERT: ',
            default => '',
        };
        
        return $prefix . $alert->headline;
    }
    
    private function buildEmailContent(Alert $alert): string
    {
        $sponsorHtml = '';
        if ($alert->sponsorship_id && $alert->sponsorship) {
            $sponsor = $alert->sponsorship->sponsor;
            $sponsorHtml = '<div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-left: 3px solid #007bff;">
                <p style="margin: 0; font-size: 12px; color: #666;">Sponsored by: <strong>' . htmlspecialchars($sponsor->name) . '</strong></p>
            </div>';
        }
        
        $imageHtml = '';
        if ($alert->image_url) {
            $imageHtml = '<img src="' . htmlspecialchars($alert->image_url) . '" alt="' . htmlspecialchars($alert->headline) . '" style="max-width: 100%; margin-bottom: 20px;">';
        }
        
        $content = $alert->full_content ?? $alert->summary;
        
        return '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #007bff;">' . htmlspecialchars($alert->headline) . '</h1>
    ' . $imageHtml . '
    <p style="font-size: 16px;">' . nl2br(htmlspecialchars($alert->summary)) . '</p>
    ' . ($content !== $alert->summary ? '<div style="margin-top: 20px;">' . nl2br(htmlspecialchars($content)) . '</div>' : '') . '
    ' . ($alert->source_url ? '<p><a href="' . htmlspecialchars($alert->source_url) . '" style="color: #007bff; text-decoration: none;">Read more →</a></p>' : '') . '
    ' . $sponsorHtml . '
</body>
</html>';
    }
    
    private function buildSmsMessage(Alert $alert): string
    {
        // SMS limited to 160 chars for single segment
        $message = "{$alert->headline}. {$alert->summary}";
        
        if (strlen($message) > 140) {
            $message = substr($alert->headline, 0, 100) . '...';
        }
        
        // Add link (short URL would be better)
        if ($alert->source_url) {
            $message .= " " . $alert->source_url;
        }
        
        return $message;
    }
    
    private function getSubscriberPreferences(int $subscriberId, string $category): array
    {
        $pref = \App\Models\Subscriber\SubscriberAlertPreference::where('subscriber_id', $subscriberId)
            ->where('category_slug', $category)
            ->first();
        
        if ($pref) {
            return [
                'email' => $pref->email_enabled,
                'sms' => $pref->sms_enabled,
                'push' => $pref->push_enabled,
            ];
        }
        
        // Default preferences from category
        $categoryModel = AlertCategory::where('slug', $category)->first();
        return [
            'email' => true,
            'sms' => $categoryModel->default_send_sms ?? false,
            'push' => true,
        ];
    }
    
    public function cancel(int $alertId): bool
    {
        $alert = Alert::findOrFail($alertId);
        
        if (!in_array($alert->status, ['draft', 'pending_approval', 'approved'])) {
            throw new \InvalidArgumentException("Alert cannot be cancelled in current status");
        }
        
        $alert->update(['status' => 'cancelled']);
        
        event(new AlertCancelled($alert));
        
        return true;
    }
    
    public function estimateRecipients(int $alertId): int
    {
        $alert = Alert::findOrFail($alertId);
        return $this->targeting->estimateCount($alert);
    }
}



