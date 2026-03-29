<?php

declare(strict_types=1);

namespace App\Services\Pitch;

use App\Models\CampaignRecipient;
use App\Models\Community;
use App\Models\CommunitySlotInventory;
use App\Models\Customer;
use App\Models\OutboundCampaign;
use App\Models\PitchReengagementQueue;
use App\Models\PitchSession;
use App\Models\SMB;

final class ReengagementQueueService
{
    /**
     * Days to wait before sending, by re-engagement type.
     */
    public const RETRY_WINDOWS = [
        'resume_incomplete' => 1,
        'deferred_gate' => 30,
        'deferred_product' => 30,
        'slot_alert' => 0,
        'proposal_followup' => 7,
        'founder_window' => 0,
    ];

    public function queue(PitchSession $session, string $type, array $context = [], ?\Illuminate\Support\Carbon $sendAfterOverride = null): void
    {
        if (! isset(self::RETRY_WINDOWS[$type])) {
            throw new \InvalidArgumentException("Unknown re-engagement type: {$type}");
        }

        $customer = $session->customer_id
            ? Customer::query()->find($session->customer_id)
            : null;

        if (! $customer) {
            return;
        }

        $email = $customer->email ?? $customer->primary_email ?? null;
        if (! $email) {
            return;
        }

        $smb = $session->smb_id ? SMB::query()->find($session->smb_id) : null;
        $community = Community::query()->find($session->community_id);

        $sendAfter = $sendAfterOverride ?? now()->addDays(self::RETRY_WINDOWS[$type]);

        PitchReengagementQueue::query()->create([
            'session_id' => $session->id,
            'smb_id' => $session->smb_id,
            'customer_id' => $session->customer_id,
            'contact_email' => $email,
            'reengagement_type' => $type,
            'context' => array_merge($context, [
                'business_name' => $smb?->business_name,
                'contact_name' => $customer->primary_contact_name ?? $customer->owner_name,
                'community_name' => $community?->name,
                'last_step' => $session->last_step,
                'gates_deferred' => $smb?->gates_deferred ?? [],
                'products_deferred' => $smb?->products_deferred ?? [],
                'slot_counts' => $this->getCurrentSlotCounts($session),
            ]),
            'deferred_gates' => $smb?->gates_deferred,
            'deferred_products' => $smb?->products_deferred,
            'send_after' => $sendAfter,
            'status' => 'queued',
        ]);
    }

    public function dispatch(): void
    {
        $due = PitchReengagementQueue::query()->dueNow()->get();

        foreach ($due as $item) {
            $this->send($item);
        }
    }

    public function send(PitchReengagementQueue $item): void
    {
        $customer = $item->customer_id
            ? Customer::query()->find($item->customer_id)
            : null;

        $tenantId = $customer?->tenant_id ?? (string) config('fibonacco.system_tenant_id');

        $context = $item->context ?? [];
        $template = $this->resolveTemplate($item->reengagement_type, $context);

        $campaign = OutboundCampaign::query()->create([
            'tenant_id' => $tenantId,
            'name' => 'Re-engagement: '.$item->reengagement_type.' — '.($context['business_name'] ?? 'Business'),
            'type' => 'email',
            'status' => 'running',
            'subject' => $template['subject'],
            'message' => $template['body'],
            'metadata' => ['pitch_queue_id' => $item->id],
            'total_recipients' => 1,
        ]);

        CampaignRecipient::query()->create([
            'tenant_id' => $tenantId,
            'campaign_id' => $campaign->id,
            'customer_id' => $item->customer_id,
            'email' => $item->contact_email,
            'name' => $customer?->primary_contact_name ?? $customer?->owner_name,
            'status' => 'pending',
        ]);

        $item->update([
            'status' => 'sent',
            'outbound_campaign_id' => $campaign->id,
            'sent_at' => now(),
        ]);
    }

    /**
     * Daily founder-window reminders (calls queue with proposal_followup context).
     */
    public function dispatchFounderExpiryAlerts(): void
    {
        $smbs = SMB::query()
            ->whereNotNull('founder_days_remaining')
            ->where('founder_days_remaining', '<=', 3)
            ->where('pitch_status', 'in_progress')
            ->get();

        foreach ($smbs as $smb) {
            $session = PitchSession::query()
                ->where('id', $smb->active_pitch_session_id)
                ->first()
                ?? PitchSession::query()
                    ->where('smb_id', $smb->id)
                    ->whereIn('status', ['pitching', 'proposed', 'deferred'])
                    ->orderByDesc('updated_at')
                    ->first();

            if ($session) {
                $this->queue($session, 'founder_window', [
                    'founder_days_remaining' => $smb->founder_days_remaining,
                    'alert' => 'founder_window',
                ], now());
            }
        }
    }

    /**
     * @return list<array{slot_type: string, category: string, held_slots: int, total_slots: int}>
     */
    private function getCurrentSlotCounts(PitchSession $session): array
    {
        return CommunitySlotInventory::query()
            ->where('community_id', $session->community_id)
            ->get(['slot_type', 'category', 'held_slots', 'total_slots'])
            ->map(static fn (CommunitySlotInventory $r) => [
                'slot_type' => $r->slot_type,
                'category' => $r->category,
                'held_slots' => $r->held_slots,
                'total_slots' => $r->total_slots,
            ])
            ->all();
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array{subject: string, body: string}
     */
    public function resolveTemplate(string $type, array $context): array
    {
        $viewCtx = ['context' => $context];

        return match ($type) {
            'resume_incomplete' => [
                'subject' => sprintf(
                    'We never finished your %s profile, %s',
                    $context['community_name'] ?? 'community',
                    $context['contact_name'] ?? 'there'
                ),
                'body' => view('emails.pitch.resume_incomplete', $viewCtx)->render(),
            ],
            'deferred_gate' => [
                'subject' => sprintf(
                    '%s — got a minute?',
                    $context['business_name'] ?? 'Your business'
                ),
                'body' => view('emails.pitch.deferred_gate', $viewCtx)->render(),
            ],
            'deferred_product' => [
                'subject' => sprintf(
                    '%s — got a minute?',
                    $context['business_name'] ?? 'Your business'
                ),
                'body' => view('emails.pitch.deferred_gate', $viewCtx)->render(),
            ],
            'slot_alert' => [
                'subject' => sprintf(
                    '%s — %s spots are filling up',
                    $context['community_name'] ?? 'Your community',
                    $context['category'] ?? 'Featured'
                ),
                'body' => view('emails.pitch.slot_alert', $viewCtx)->render(),
            ],
            'proposal_followup' => [
                'subject' => sprintf(
                    'Your %s proposal is still here',
                    $context['community_name'] ?? 'community'
                ),
                'body' => view('emails.pitch.proposal_followup', $viewCtx)->render(),
            ],
            'founder_window' => [
                'subject' => sprintf(
                    '%s founder pricing window is closing soon',
                    $context['community_name'] ?? 'Your community'
                ),
                'body' => view('emails.pitch.proposal_followup', $viewCtx)->render(),
            ],
            default => throw new \InvalidArgumentException("Unknown reengagement type: {$type}"),
        };
    }
}
