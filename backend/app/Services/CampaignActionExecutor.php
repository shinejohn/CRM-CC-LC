<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\CampaignTimelineAction;
use App\Jobs\SendEmailCampaign;
use App\Jobs\SendSMS;
use App\Jobs\MakePhoneCall;
use App\Events\PipelineStageChanged;
use Illuminate\Support\Facades\Log;

class CampaignActionExecutor
{
    /**
     * Execute a single campaign action.
     */
    public function execute(Customer $customer, CampaignTimelineAction $action): array
    {
        return match($action->action_type) {
            'send_email' => $this->sendEmail($customer, $action),
            'send_sms' => $this->sendSMS($customer, $action),
            'make_call' => $this->makeCall($customer, $action),
            'schedule_followup' => $this->scheduleFollowup($customer, $action),
            'update_stage' => $this->updateStage($customer, $action),
            'check_engagement' => $this->checkEngagement($customer, $action),
            'send_notification' => $this->sendNotification($customer, $action),
            default => throw new \InvalidArgumentException("Unknown action type: {$action->action_type}"),
        };
    }
    
    protected function sendEmail(Customer $customer, CampaignTimelineAction $action): array
    {
        $params = $action->parameters ?? [];
        
        // Get the campaign/template to use
        $campaignId = $action->campaign_id ?? $params['campaign_id'] ?? null;
        $templateType = $action->template_type ?? $params['template_type'] ?? 'welcome';
        
        // Note: The existing SendEmailCampaign job expects CampaignRecipient and OutboundCampaign
        // For now, we'll log and create a placeholder implementation
        // TODO: Adapt to work with Customer model or create CampaignRecipient/OutboundCampaign as needed
        Log::info("Timeline action: send_email for customer {$customer->id}", [
            'action_id' => $action->id,
            'campaign_id' => $campaignId,
            'template_type' => $templateType,
            'day_number' => $action->day_number,
        ]);
        
        // TODO: Implement actual email sending via appropriate service
        // This might require creating CampaignRecipient and OutboundCampaign records
        // or using a different email service method
        
        return [
            'type' => 'email',
            'campaign_id' => $campaignId,
            'template' => $templateType,
            'dispatched' => false, // Set to true when actual implementation is added
            'note' => 'Email sending needs to be adapted to work with Customer model',
        ];
    }
    
    protected function sendSMS(Customer $customer, CampaignTimelineAction $action): array
    {
        $params = $action->parameters ?? [];
        $message = $params['message'] ?? null;
        $templateId = $params['template_id'] ?? null;
        
        Log::info("Timeline action: send_sms for customer {$customer->id}", [
            'action_id' => $action->id,
            'template_id' => $templateId,
            'day_number' => $action->day_number,
        ]);
        
        // TODO: Implement actual SMS sending via appropriate service
        // Similar to email, this needs adaptation
        
        return [
            'type' => 'sms',
            'template_id' => $templateId,
            'dispatched' => false,
            'note' => 'SMS sending needs to be adapted to work with Customer model',
        ];
    }
    
    protected function makeCall(Customer $customer, CampaignTimelineAction $action): array
    {
        $params = $action->parameters ?? [];
        $scriptId = $params['script_id'] ?? null;
        
        Log::info("Timeline action: make_call for customer {$customer->id}", [
            'action_id' => $action->id,
            'script_id' => $scriptId,
            'day_number' => $action->day_number,
        ]);
        
        // TODO: Implement actual phone call via appropriate service
        
        return [
            'type' => 'phone',
            'script_id' => $scriptId,
            'dispatched' => false,
            'note' => 'Phone call needs to be adapted to work with Customer model',
        ];
    }
    
    protected function scheduleFollowup(Customer $customer, CampaignTimelineAction $action): array
    {
        $params = $action->parameters ?? [];
        $followupType = $params['followup_type'] ?? 'general';
        $delayDays = $params['delay_days'] ?? 1;
        
        // Create an interaction for followup
        $customer->interactions()->create([
            'type' => 'scheduled_followup',
            'channel' => $params['channel'] ?? 'email',
            'scheduled_at' => now()->addDays($delayDays),
            'metadata' => [
                'timeline_action_id' => $action->id,
                'followup_type' => $followupType,
            ],
        ]);
        
        return [
            'type' => 'followup',
            'scheduled_for' => now()->addDays($delayDays)->toISOString(),
        ];
    }
    
    protected function updateStage(Customer $customer, CampaignTimelineAction $action): array
    {
        $params = $action->parameters ?? [];
        $newStage = $params['new_stage'] ?? null;
        
        if ($newStage) {
            $oldStage = $customer->pipeline_stage;
            $customer->advanceToStage(\App\Enums\PipelineStage::from($newStage));
            
            event(new PipelineStageChanged(
                $customer, 
                $oldStage, 
                $customer->pipeline_stage,
                'timeline_action'
            ));
        }
        
        return [
            'type' => 'stage_update',
            'new_stage' => $newStage,
        ];
    }
    
    protected function checkEngagement(Customer $customer, CampaignTimelineAction $action): array
    {
        $params = $action->parameters ?? [];
        $threshold = $params['threshold'] ?? 50;
        
        $meetsThreshold = $customer->engagement_score >= $threshold;
        
        return [
            'type' => 'engagement_check',
            'score' => $customer->engagement_score,
            'threshold' => $threshold,
            'meets_threshold' => $meetsThreshold,
        ];
    }
    
    protected function sendNotification(Customer $customer, CampaignTimelineAction $action): array
    {
        $params = $action->parameters ?? [];
        
        // Send internal notification (e.g., to account manager)
        // This could trigger a Slack message, email to AM, etc.
        Log::info("Timeline action: send_notification for customer {$customer->id}", [
            'action_id' => $action->id,
            'notification_type' => $params['notification_type'] ?? 'general',
        ]);
        
        return [
            'type' => 'notification',
            'notification_type' => $params['notification_type'] ?? 'general',
        ];
    }
}

