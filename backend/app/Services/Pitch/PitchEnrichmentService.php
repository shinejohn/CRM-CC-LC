<?php

declare(strict_types=1);

namespace App\Services\Pitch;

use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\Customer;
use App\Models\PitchSession;
use App\Models\SMB;
use Illuminate\Support\Str;

final class PitchEnrichmentService
{
    public function process(PitchSession $session, string $eventType, array $payload): void
    {
        match ($eventType) {
            'business_profiled' => $this->enrichFromProfile($session, $payload),
            'discovery_completed' => $this->enrichFromDiscovery($session, $payload),
            'territory_selected' => $this->enrichFromTerritory($session, $payload),
            'gate_permission_granted' => $this->logGateDecision($session, $payload, 'completed'),
            'gate_permission_denied' => $this->logGateDecision($session, $payload, 'deferred'),
            'gate_permission_deferred' => $this->logGateDecision($session, $payload, 'deferred'),
            'product_accepted' => $this->logProductDecision($session, $payload, 'accepted'),
            'product_declined' => $this->logProductDecision($session, $payload, 'declined'),
            'product_deferred' => $this->logProductDecision($session, $payload, 'deferred'),
            'proposal_presented' => $this->logProposal($session, $payload),
            'session_abandoned' => $this->handleAbandonment($session, $payload),
            'pitch_completed' => $this->handleConversion($session, $payload),
            default => null,
        };
    }

    private function enrichFromProfile(PitchSession $session, array $payload): void
    {
        $smb = $session->smb_id
            ? SMB::query()->find($session->smb_id)
            : new SMB;

        if (! $smb->exists) {
            $smb->uuid = (string) Str::uuid();
            $smb->community_id = $session->community_id;
            $smb->business_name = $payload['business_name'] ?? 'Unknown business';
            if (! empty($payload['category'])) {
                $smb->category = $payload['category'];
            }
        }

        $smb->fill([
            'org_type' => $payload['org_type'] ?? $smb->org_type,
            'pitch_track' => $payload['pitch_track'] ?? $smb->pitch_track,
            'has_events' => (bool) ($payload['has_events'] ?? $smb->has_events),
            'has_venue' => (bool) ($payload['has_venue'] ?? $smb->has_venue),
            'is_performer' => (bool) ($payload['is_performer'] ?? $smb->is_performer),
            'pitch_status' => 'in_progress',
            'pitch_started_at' => $smb->pitch_started_at ?? now(),
            'last_pitch_activity_at' => now(),
            'active_pitch_session_id' => $session->id,
        ]);

        if (! empty($payload['primary_email'])) {
            $smb->primary_email = $payload['primary_email'];
        }
        if (! empty($payload['primary_phone'])) {
            $smb->primary_phone = $payload['primary_phone'];
        }
        if (! empty($payload['primary_contact_name'])) {
            $smb->primary_contact_name = $payload['primary_contact_name'];
        }

        $smb->save();

        $email = $payload['contact_email'] ?? $payload['primary_email'] ?? null;
        if (! $email) {
            $session->smb_id = $smb->id;
            $session->save();

            return;
        }

        $customer = Customer::query()->firstOrCreate(
            [
                'primary_email' => $email,
                'community_id' => $session->community_id,
            ],
            [
                'tenant_id' => (string) config('fibonacco.system_tenant_id'),
                'email' => $email,
                'primary_contact_name' => $payload['contact_name'] ?? $payload['primary_contact_name'] ?? null,
                'owner_name' => $payload['contact_name'] ?? $payload['primary_contact_name'] ?? null,
                'phone' => $payload['contact_phone'] ?? $payload['primary_phone'] ?? null,
                'business_name' => $smb->business_name,
                'category' => $smb->category,
                'subscription_tier' => 'prospect',
                'lead_source' => 'pitch_engine',
            ]
        );

        $customer->update([
            'smb_id' => $smb->id,
            'email' => $customer->email ?? $email,
            'primary_email' => $customer->primary_email ?? $email,
            'primary_contact_name' => $payload['contact_name'] ?? $customer->primary_contact_name,
            'owner_name' => $payload['contact_name'] ?? $customer->owner_name,
            'phone' => $payload['contact_phone'] ?? $customer->phone,
            'subscription_tier' => $customer->subscription_tier ?? 'prospect',
            'lead_source' => 'pitch_engine',
        ]);

        if ($session->conversation_id) {
            $session->update([
                'smb_id' => $smb->id,
                'customer_id' => $customer->id,
            ]);
            $smb->update([
                'active_pitch_session_id' => $session->id,
            ]);
            $this->updateAiContext($customer, $smb);

            return;
        }

        $conversation = Conversation::query()->create([
            'tenant_id' => $customer->tenant_id,
            'customer_id' => $customer->id,
            'session_id' => 'pitch_'.$session->id,
            'entry_point' => 'pitch_engine',
            'pitch_subject' => 'Pitch — '.$smb->business_name.' — '.now()->format('M j, Y'),
            'pitch_status' => 'active',
            'pitch_source' => 'pitch_engine',
            'pitch_metadata' => [
                'session_id' => $session->id,
                'community_id' => $session->community_id,
            ],
        ]);

        $session->update([
            'smb_id' => $smb->id,
            'customer_id' => $customer->id,
            'conversation_id' => $conversation->id,
        ]);

        $smb->active_pitch_session_id = $session->id;
        $smb->save();

        $this->updateAiContext($customer, $smb);
    }

    private function enrichFromDiscovery(PitchSession $session, array $payload): void
    {
        $smb = $session->smb_id ? SMB::query()->find($session->smb_id) : null;
        if ($smb) {
            $smb->update([
                'primary_goal' => $payload['goal'] ?? $payload['primary_goal'] ?? null,
                'customer_source' => $payload['customer_source'] ?? $payload['source'] ?? null,
                'marketing_spend_range' => $payload['marketing_spend'] ?? $payload['marketing_spend_range'] ?? null,
                'last_pitch_activity_at' => now(),
            ]);
        }

        $this->appendConversationMessage($session, 'user_decision', [
            'step' => 'discovery',
            'goal' => $payload['goal'] ?? null,
            'source' => $payload['customer_source'] ?? null,
            'spend' => $payload['marketing_spend'] ?? null,
        ]);

        $this->updateAiContext(
            $session->customer_id ? Customer::query()->find($session->customer_id) : null,
            $smb
        );
    }

    private function enrichFromTerritory(PitchSession $session, array $payload): void
    {
        $smb = $session->smb_id ? SMB::query()->find($session->smb_id) : null;
        if ($smb && isset($payload['community_ids']) && is_array($payload['community_ids'])) {
            $smb->update([
                'communities_of_interest' => $payload['community_ids'],
                'last_pitch_activity_at' => now(),
            ]);
        }

        $this->appendConversationMessage($session, 'user_decision', [
            'step' => 'territory',
            'community_ids' => $payload['community_ids'] ?? [],
        ]);

        $this->updateAiContext(
            $session->customer_id ? Customer::query()->find($session->customer_id) : null,
            $smb
        );
    }

    private function logGateDecision(PitchSession $session, array $payload, string $outcome): void
    {
        $smb = $session->smb_id ? SMB::query()->find($session->smb_id) : null;
        if (! $smb || empty($payload['gate'])) {
            return;
        }

        $field = $outcome === 'completed' ? 'gates_completed' : 'gates_deferred';

        $existing = $smb->{$field} ?? [];
        if (! is_array($existing)) {
            $existing = [];
        }

        if ($outcome === 'completed') {
            $existing[] = $payload['gate'];
        } else {
            $existing[] = [
                'gate' => $payload['gate'],
                'reason' => $payload['reason'] ?? 'not_now',
                'retry_after' => $payload['retry_after'] ?? null,
            ];
        }

        $smb->update([
            $field => $existing,
            'last_pitch_activity_at' => now(),
        ]);

        $this->appendConversationMessage($session, 'user_decision', [
            'step' => 'gate_'.$payload['gate'],
            'outcome' => $outcome,
            'gate' => $payload['gate'],
            'reason' => $payload['reason'] ?? null,
        ]);

        $this->updateAiContext(
            $session->customer_id ? Customer::query()->find($session->customer_id) : null,
            $smb
        );

        if ($outcome === 'deferred') {
            app(ReengagementQueueService::class)->queue($session, 'deferred_gate', [
                'gate' => $payload['gate'],
            ]);
        }
    }

    private function logProductDecision(PitchSession $session, array $payload, string $outcome): void
    {
        $smb = $session->smb_id ? SMB::query()->find($session->smb_id) : null;
        if (! $smb || empty($payload['product'])) {
            return;
        }

        $field = match ($outcome) {
            'accepted' => 'products_accepted',
            'declined' => 'products_declined',
            'deferred' => 'products_deferred',
            default => 'products_declined',
        };

        $existing = $smb->{$field} ?? [];
        if (! is_array($existing)) {
            $existing = [];
        }

        if ($outcome === 'accepted') {
            $existing[] = ['product' => $payload['product'], 'price' => $payload['price'] ?? null];
        } elseif ($outcome === 'deferred') {
            $existing[] = [
                'product' => $payload['product'],
                'retry_after' => $payload['retry_after'] ?? null,
                'reason' => $payload['reason'] ?? null,
                'category' => $payload['category'] ?? null,
            ];
        } else {
            $existing[] = ['product' => $payload['product'], 'reason' => $payload['reason'] ?? null];
        }

        $smb->update([
            $field => $existing,
            'last_pitch_activity_at' => now(),
        ]);

        $this->updateAiContext(
            $session->customer_id ? Customer::query()->find($session->customer_id) : null,
            $smb
        );

        if ($outcome === 'deferred') {
            app(ReengagementQueueService::class)->queue($session, 'deferred_product', [
                'product' => $payload['product'],
            ]);
        }
    }

    private function logProposal(PitchSession $session, array $payload): void
    {
        $smb = $session->smb_id ? SMB::query()->find($session->smb_id) : null;
        $value = $payload['total_mrr'] ?? $payload['proposal_value'] ?? null;

        if ($value !== null && $smb) {
            $smb->update([
                'proposal_value' => $value,
                'last_pitch_activity_at' => now(),
            ]);
        }

        $session->proposal_value = $value;
        if (! empty($payload['proposal_id'])) {
            $session->proposal_id = $payload['proposal_id'];
        }
        $session->save();

        $this->appendConversationMessage($session, 'proposal_presented', $payload);

        $this->updateAiContext(
            $session->customer_id ? Customer::query()->find($session->customer_id) : null,
            $smb
        );

        app(ReengagementQueueService::class)->queue($session, 'proposal_followup', [
            'proposal_id' => $session->proposal_id,
            'total_mrr' => $value,
        ]);
    }

    private function handleAbandonment(PitchSession $session, array $payload): void
    {
        $smb = $session->smb_id ? SMB::query()->find($session->smb_id) : null;
        $smb?->update([
            'pitch_status' => 'in_progress',
            'last_pitch_activity_at' => now(),
        ]);

        $this->appendConversationMessage($session, 'session_abandoned', [
            'last_step' => $payload['last_step'] ?? $session->last_step,
            'gates_remaining' => $payload['gates_remaining'] ?? [],
        ]);

        app(ReengagementQueueService::class)->queue($session, 'resume_incomplete');
    }

    private function handleConversion(PitchSession $session, array $payload): void
    {
        $smb = $session->smb_id ? SMB::query()->find($session->smb_id) : null;
        $smb?->update([
            'pitch_status' => 'converted',
            'converted_campaign_id' => $payload['campaign_id'] ?? null,
            'pitch_completed_at' => now(),
            'last_pitch_activity_at' => now(),
        ]);

        if ($session->customer_id) {
            Customer::query()->whereKey($session->customer_id)->update([
                'subscription_tier' => 'active',
            ]);
        }

        $this->appendConversationMessage($session, 'pitch_completed', [
            'campaign_id' => $payload['campaign_id'] ?? null,
            'products' => $payload['products'] ?? [],
            'total_mrr' => $payload['total_mrr'] ?? null,
        ]);
    }

    private function updateAiContext(?Customer $customer, ?SMB $smb): void
    {
        if (! $customer || ! $smb) {
            return;
        }

        $prior = is_array($customer->ai_context) ? $customer->ai_context : [];

        $customer->update([
            'ai_context' => array_merge($prior, [
                'business_name' => $smb->business_name,
                'category' => $smb->category,
                'org_type' => $smb->org_type,
                'primary_goal' => $smb->primary_goal,
                'customer_source' => $smb->customer_source,
                'marketing_spend' => $smb->marketing_spend_range,
                'has_events' => $smb->has_events,
                'communities' => $smb->communities_of_interest,
                'gates_completed' => $smb->gates_completed,
                'gates_deferred' => $smb->gates_deferred,
                'products_accepted' => $smb->products_accepted,
                'products_deferred' => $smb->products_deferred,
                'pitch_status' => $smb->pitch_status,
                'last_updated' => now()->toIso8601String(),
            ]),
        ]);
    }

    private function appendConversationMessage(PitchSession $session, string $type, array $data): void
    {
        if (! $session->conversation_id) {
            return;
        }

        ConversationMessage::query()->create([
            'conversation_id' => $session->conversation_id,
            'role' => 'system',
            'message_type' => $type,
            'source' => 'pitch_engine',
            'content' => json_encode($data),
        ]);
    }
}
