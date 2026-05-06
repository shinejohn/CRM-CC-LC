<?php

declare(strict_types=1);

namespace App\Services;

use App\Events\PipelineStageChanged;
use App\Jobs\SendEmailCampaign;
use App\Models\CampaignRecipient;
use App\Models\CampaignTimelineAction;
use App\Models\Customer;
use App\Models\EmailTemplate;
use App\Models\OutboundCampaign;
use App\Models\PhoneScript;
use App\Models\SmsTemplate;
use Illuminate\Support\Facades\Log;

final class CampaignActionExecutor
{
    public function __construct(
        protected SMSService $smsService,
        protected PhoneService $phoneService,
    ) {}

    public function execute(Customer $customer, CampaignTimelineAction $action): array
    {
        return match ($action->action_type) {
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
        if (! $customer->canContactViaEmail()) {
            return [
                'type' => 'email',
                'dispatched' => false,
                'reason' => 'customer_not_emailable',
            ];
        }

        $params = $action->parameters ?? [];
        $templateType = $action->template_type ?? ($params['template_type'] ?? null);
        if (! $templateType) {
            return ['type' => 'email', 'dispatched' => false, 'reason' => 'missing_template_type'];
        }

        $template = $this->resolveEmailTemplate($customer, $templateType);
        if (! $template) {
            Log::warning("Timeline send_email: template not found for slug {$templateType}", [
                'customer_id' => $customer->id,
                'action_id' => $action->id,
            ]);

            return ['type' => 'email', 'dispatched' => false, 'reason' => 'template_not_found'];
        }

        $vars = $this->buildMergeData($customer);
        $rendered = $template->render($vars);

        $campaign = OutboundCampaign::create([
            'tenant_id' => $customer->tenant_id,
            'name' => 'Manifest Destiny: '.$templateType,
            'type' => 'email',
            'status' => 'running',
            'subject' => $rendered['subject'],
            'message' => $rendered['html'],
            'template_id' => $template->id,
            'template_variables' => $vars,
            'total_recipients' => 1,
            'metadata' => [
                'source' => 'campaign_timeline',
                'timeline_action_id' => $action->id,
                'template_type' => $templateType,
            ],
        ]);

        $recipient = CampaignRecipient::create([
            'tenant_id' => $customer->tenant_id,
            'campaign_id' => $campaign->id,
            'customer_id' => $customer->id,
            'email' => $customer->email,
            'name' => $customer->business_name ?? $customer->owner_name,
            'status' => 'pending',
            'metadata' => [
                'timeline_action_id' => $action->id,
            ],
        ]);

        SendEmailCampaign::dispatch($recipient, $campaign);

        return [
            'type' => 'email',
            'dispatched' => true,
            'campaign_id' => $campaign->id,
            'recipient_id' => $recipient->id,
            'template_type' => $templateType,
        ];
    }

    protected function sendSMS(Customer $customer, CampaignTimelineAction $action): array
    {
        if (! $customer->canContactViaSMS()) {
            return [
                'type' => 'sms',
                'dispatched' => false,
                'reason' => 'customer_not_sms_contactable',
            ];
        }

        $params = $action->parameters ?? [];
        $slug = $action->template_type ?? ($params['template_type'] ?? null);
        $templateId = $params['template_id'] ?? null;

        $smsTemplate = null;
        if ($templateId && is_string($templateId)) {
            $smsTemplate = SmsTemplate::withoutGlobalScopes()
                ->where('is_active', true)
                ->where(function ($q) use ($templateId) {
                    $q->where('id', $templateId)->orWhere('slug', $templateId);
                })
                ->first();
        }
        if (! $smsTemplate && $slug) {
            $smsTemplate = $this->resolveSmsTemplate($customer, $slug);
        }

        if (! $smsTemplate) {
            Log::warning('Timeline send_sms: template not found', [
                'customer_id' => $customer->id,
                'action_id' => $action->id,
                'slug' => $slug,
            ]);

            return ['type' => 'sms', 'dispatched' => false, 'reason' => 'template_not_found'];
        }

        $body = $smsTemplate->render($this->buildMergeData($customer));
        $result = $this->smsService->send($customer->phone, $body, [
            'status_callback' => $params['status_callback'] ?? null,
        ]);

        $ok = is_array($result) && ($result['success'] ?? false);

        return [
            'type' => 'sms',
            'dispatched' => $ok,
            'message_sid' => $result['message_sid'] ?? null,
            'provider' => $result['provider'] ?? null,
        ];
    }

    protected function makeCall(Customer $customer, CampaignTimelineAction $action): array
    {
        if (! $customer->canContactViaPhone()) {
            return [
                'type' => 'phone',
                'dispatched' => false,
                'reason' => 'customer_not_callable',
            ];
        }

        $params = $action->parameters ?? [];
        $scriptId = $params['script_id'] ?? null;
        $scriptText = null;

        if ($scriptId) {
            $script = PhoneScript::withoutGlobalScopes()
                ->where('is_active', true)
                ->where(function ($q) use ($scriptId) {
                    $q->where('id', $scriptId)->orWhere('slug', $scriptId);
                })
                ->first();
            if ($script) {
                $scriptText = $script->render($this->buildMergeData($customer));
            }
        }

        if (! $scriptText) {
            $scriptText = $params['script_text'] ?? 'Hello from Day.News. We wanted to reach out about your free listing in the community.';
        }

        $result = $this->phoneService->makeCall($customer->phone, $scriptText, [
            'use_tts' => true,
        ]);

        $ok = is_array($result) && ($result['success'] ?? false);

        return [
            'type' => 'phone',
            'dispatched' => $ok,
            'call_sid' => $result['call_sid'] ?? null,
            'provider' => $result['provider'] ?? null,
        ];
    }

    protected function resolveEmailTemplate(Customer $customer, string $slug): ?EmailTemplate
    {
        $systemTenant = (string) config('fibonacco.system_tenant_id');

        $preferred = EmailTemplate::withoutGlobalScopes()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->where('tenant_id', $customer->tenant_id)
            ->first();
        if ($preferred) {
            return $preferred;
        }

        return EmailTemplate::withoutGlobalScopes()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->where('tenant_id', $systemTenant)
            ->first();
    }

    protected function resolveSmsTemplate(Customer $customer, string $slug): ?SmsTemplate
    {
        $systemTenant = (string) config('fibonacco.system_tenant_id');

        $preferred = SmsTemplate::withoutGlobalScopes()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->where('tenant_id', $customer->tenant_id)
            ->first();
        if ($preferred) {
            return $preferred;
        }

        return SmsTemplate::withoutGlobalScopes()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->where('tenant_id', $systemTenant)
            ->first();
    }

    /**
     * @return array<string, string>
     */
    protected function buildMergeData(Customer $customer): array
    {
        $customer->loadMissing('community');
        $community = $customer->community;
        $founderDays = '0';
        if ($community?->launched_at) {
            $days = (int) ($community->founder_window_days ?? 90);
            $end = $community->launched_at->copy()->addDays($days);
            if (now()->lt($end)) {
                $founderDays = (string) max(0, (int) now()->diffInDays($end));
            }
        }

        $baseUrl = rtrim((string) config('app.url'), '/');

        return [
            'business_name' => (string) ($customer->business_name ?? ''),
            'community_name' => (string) ($community->name ?? 'Day.News'),
            'founder_days_remaining' => $founderDays,
            'city' => (string) ($customer->city ?? ''),
            'listing_url' => $baseUrl.'/business/'.$customer->slug,
            'customer_name' => (string) ($customer->owner_name ?? $customer->business_name ?? ''),
        ];
    }

    protected function scheduleFollowup(Customer $customer, CampaignTimelineAction $action): array
    {
        $params = $action->parameters ?? [];
        $followupType = $params['followup_type'] ?? 'general';
        $delayDays = $params['delay_days'] ?? 1;

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
