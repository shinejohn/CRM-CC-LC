<?php

namespace App\Services;

use App\Models\Interaction;
use App\Models\InteractionTemplate;
use App\Models\Customer;
use Illuminate\Support\Facades\Log;

class InteractionService
{
    /**
     * Create a new interaction for a customer
     */
    public function createInteraction(
        string $customerId,
        string $type,
        string $title,
        array $options = []
    ): Interaction {
        $customer = Customer::findOrFail($customerId);
        
        $interaction = Interaction::create([
            'tenant_id' => $customer->tenant_id,
            'customer_id' => $customerId,
            'type' => $type,
            'title' => $title,
            'description' => $options['description'] ?? null,
            'notes' => $options['notes'] ?? null,
            'scheduled_at' => $options['scheduled_at'] ?? null,
            'due_at' => $options['due_at'] ?? null,
            'status' => $options['status'] ?? 'pending',
            'priority' => $options['priority'] ?? 'normal',
            'template_id' => $options['template_id'] ?? null,
            'entry_point' => $options['entry_point'] ?? 'manual',
            'campaign_id' => $options['campaign_id'] ?? null,
            'conversation_id' => $options['conversation_id'] ?? null,
            'metadata' => $options['metadata'] ?? [],
        ]);

        return $interaction;
    }

    /**
     * Start an interaction workflow from a template
     */
    public function startWorkflow(
        string $customerId,
        string $templateId,
        array $options = []
    ): Interaction {
        $customer = Customer::findOrFail($customerId);
        $template = InteractionTemplate::where('tenant_id', $customer->tenant_id)
            ->findOrFail($templateId);

        if (!$template->is_active) {
            throw new \Exception('Template is not active');
        }

        if (!$template->validateSteps()) {
            throw new \Exception('Template steps are invalid');
        }

        // Get first step
        $firstStep = $template->getFirstStep();
        if (!$firstStep) {
            throw new \Exception('Template has no steps');
        }

        // Calculate scheduled_at and due_at
        $scheduledAt = $options['start_date'] ?? now();
        if (isset($firstStep['scheduled_offset_days'])) {
            $scheduledAt = $scheduledAt->copy()->addDays($firstStep['scheduled_offset_days']);
        }

        $dueAt = null;
        if (isset($firstStep['due_offset_days'])) {
            $dueAt = $scheduledAt->copy()->addDays($firstStep['due_offset_days']);
        }

        // Create first interaction
        $interaction = $this->createInteraction($customerId, $firstStep['type'], $firstStep['title'], [
            'description' => $firstStep['description'] ?? null,
            'scheduled_at' => $scheduledAt,
            'due_at' => $dueAt,
            'template_id' => $templateId,
            'entry_point' => 'workflow',
            'campaign_id' => $options['campaign_id'] ?? null,
            'metadata' => array_merge($firstStep['metadata'] ?? [], [
                'step_number' => $firstStep['step_number'],
                'next_step' => $firstStep['next_step'] ?? null,
            ]),
        ]);

        return $interaction;
    }

    /**
     * Create the next interaction when one is completed
     */
    public function createNextInteraction(Interaction $completedInteraction): ?Interaction
    {
        // Don't create if already has a next interaction
        if ($completedInteraction->next_interaction_id) {
            return Interaction::find($completedInteraction->next_interaction_id);
        }

        $customer = $completedInteraction->customer;
        $nextInteraction = null;

        // Check if this interaction is part of a template workflow
        if ($completedInteraction->template_id) {
            $template = InteractionTemplate::find($completedInteraction->template_id);
            
            if ($template && $template->is_active) {
                $currentStepNumber = $completedInteraction->metadata['step_number'] ?? null;
                
                if ($currentStepNumber !== null) {
                    $nextStep = $template->getNextStep($currentStepNumber);
                    
                    if ($nextStep) {
                        // Calculate scheduled_at based on completion time + offset
                        $scheduledAt = $completedInteraction->completed_at ?? now();
                        if (isset($nextStep['scheduled_offset_days'])) {
                            $scheduledAt = $scheduledAt->copy()->addDays($nextStep['scheduled_offset_days']);
                        }

                        // Calculate due_at
                        $dueAt = null;
                        if (isset($nextStep['due_offset_days'])) {
                            $dueAt = $scheduledAt->copy()->addDays($nextStep['due_offset_days']);
                        }

                        // Create next interaction
                        $nextInteraction = $this->createInteraction(
                            $customer->id,
                            $nextStep['type'],
                            $nextStep['title'],
                            [
                                'description' => $nextStep['description'] ?? null,
                                'scheduled_at' => $scheduledAt,
                                'due_at' => $dueAt,
                                'template_id' => $template->id,
                                'previous_interaction_id' => $completedInteraction->id,
                                'entry_point' => 'workflow',
                                'campaign_id' => $completedInteraction->campaign_id,
                                'metadata' => array_merge($nextStep['metadata'] ?? [], [
                                    'step_number' => $nextStep['step_number'],
                                    'next_step' => $nextStep['next_step'] ?? null,
                                ]),
                            ]
                        );

                        // Link them
                        $completedInteraction->update(['next_interaction_id' => $nextInteraction->id]);
                    }
                }
            }
        }

        // If no template workflow, check for default template
        if (!$nextInteraction) {
            $defaultTemplate = InteractionTemplate::where('tenant_id', $customer->tenant_id)
                ->where('is_active', true)
                ->where('is_default', true)
                ->first();

            if ($defaultTemplate) {
                // Start workflow from beginning with default template
                try {
                    $nextInteraction = $this->startWorkflow($customer->id, $defaultTemplate->id, [
                        'start_date' => now()->addDay(), // Start tomorrow
                        'campaign_id' => $completedInteraction->campaign_id,
                    ]);
                    
                    // Link to previous interaction
                    $nextInteraction->update(['previous_interaction_id' => $completedInteraction->id]);
                    $completedInteraction->update(['next_interaction_id' => $nextInteraction->id]);
                } catch (\Exception $e) {
                    Log::warning('Failed to create next interaction from default template', [
                        'customer_id' => $customer->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        // If still no next interaction, create a default follow-up
        if (!$nextInteraction) {
            $nextInteraction = $this->createDefaultFollowUp($completedInteraction);
        }

        return $nextInteraction;
    }

    /**
     * Create a default follow-up interaction when no template is available
     */
    protected function createDefaultFollowUp(Interaction $completedInteraction): Interaction
    {
        $customer = $completedInteraction->customer;
        
        // Determine follow-up type based on completed interaction type
        $followUpType = match($completedInteraction->type) {
            'phone_call' => 'follow_up',
            'send_proposal' => 'follow_up',
            'email' => 'follow_up',
            default => 'follow_up',
        };

        // Schedule follow-up for 3 days after completion
        $scheduledAt = ($completedInteraction->completed_at ?? now())->copy()->addDays(3);
        $dueAt = $scheduledAt->copy()->addDays(2); // Due 2 days after scheduled

        $followUp = $this->createInteraction(
            $customer->id,
            $followUpType,
            'Follow-up',
            [
                'description' => 'Follow-up on previous interaction',
                'scheduled_at' => $scheduledAt,
                'due_at' => $dueAt,
                'previous_interaction_id' => $completedInteraction->id,
                'entry_point' => 'auto',
                'campaign_id' => $completedInteraction->campaign_id,
                'metadata' => [
                    'auto_created' => true,
                    'previous_type' => $completedInteraction->type,
                ],
            ]
        );

        // Link them
        $completedInteraction->update(['next_interaction_id' => $followUp->id]);

        return $followUp;
    }

    /**
     * Get next pending interaction for a customer
     */
    public function getNextPendingInteraction(string $customerId): ?Interaction
    {
        return Interaction::where('customer_id', $customerId)
            ->where('status', 'pending')
            ->where(function ($query) {
                $query->whereNull('scheduled_at')
                      ->orWhere('scheduled_at', '<=', now());
            })
            ->orderBy('due_at', 'asc')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'asc')
            ->first();
    }

    /**
     * Get all pending interactions for a customer
     */
    public function getPendingInteractions(string $customerId): \Illuminate\Database\Eloquent\Collection
    {
        return Interaction::where('customer_id', $customerId)
            ->where('status', 'pending')
            ->orderBy('due_at', 'asc')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Get overdue interactions for a customer
     */
    public function getOverdueInteractions(string $customerId): \Illuminate\Database\Eloquent\Collection
    {
        return Interaction::where('customer_id', $customerId)
            ->where('status', 'pending')
            ->whereNotNull('due_at')
            ->where('due_at', '<', now())
            ->orderBy('due_at', 'asc')
            ->get();
    }
}

