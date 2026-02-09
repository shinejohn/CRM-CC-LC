<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Interaction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'type',
        'title',
        'description',
        'notes',
        'scheduled_at',
        'completed_at',
        'due_at',
        'status',
        'priority',
        'template_id',
        'next_interaction_id',
        'previous_interaction_id',
        'entry_point',
        'campaign_id',
        'conversation_id',
        'outcome',
        'outcome_details',
        'metadata',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'due_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the customer this interaction belongs to
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the template this interaction is based on
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(InteractionTemplate::class, 'template_id');
    }

    /**
     * Get the next interaction in the sequence
     */
    public function nextInteraction(): HasOne
    {
        return $this->hasOne(Interaction::class, 'previous_interaction_id');
    }

    /**
     * Get the previous interaction that created this one
     */
    public function previousInteraction(): BelongsTo
    {
        return $this->belongsTo(Interaction::class, 'previous_interaction_id');
    }

    /**
     * Get the campaign that created this interaction (if any)
     */
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }

    /**
     * Get the conversation related to this interaction (if any)
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Mark interaction as completed and trigger next step creation
     */
    public function complete(string $outcome = null, string $outcomeDetails = null): ?Interaction
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'outcome' => $outcome,
            'outcome_details' => $outcomeDetails,
        ]);

        // Trigger next step creation via service
        return app(\App\Services\InteractionService::class)->createNextInteraction($this);
    }

    /**
     * Check if interaction is overdue
     */
    public function isOverdue(): bool
    {
        if (!$this->due_at || $this->status === 'completed' || $this->status === 'cancelled') {
            return false;
        }

        return now()->isAfter($this->due_at);
    }

    /**
     * Check if interaction is due soon (within 24 hours)
     */
    public function isDueSoon(): bool
    {
        if (!$this->due_at || $this->status === 'completed' || $this->status === 'cancelled') {
            return false;
        }

        return now()->addDay()->isAfter($this->due_at) && !now()->isAfter($this->due_at);
    }

    /**
     * Get formatted status
     */
    public function getFormattedStatusAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Pending',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            'skipped' => 'Skipped',
            default => ucfirst($this->status),
        };
    }
}

