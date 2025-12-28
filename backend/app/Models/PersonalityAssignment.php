<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PersonalityAssignment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'personality_id',
        'customer_id',
        'tenant_id',
        'status',
        'assigned_at',
        'last_interaction_at',
        'assignment_rules',
        'context',
        'interaction_count',
        'conversation_count',
        'average_rating',
        'performance_metrics',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'assignment_rules' => 'array',
            'context' => 'array',
            'performance_metrics' => 'array',
            'assigned_at' => 'datetime',
            'last_interaction_at' => 'datetime',
            'interaction_count' => 'integer',
            'conversation_count' => 'integer',
            'average_rating' => 'decimal:2',
        ];
    }

    public function personality(): BelongsTo
    {
        return $this->belongsTo(AiPersonality::class, 'personality_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Record an interaction
     */
    public function recordInteraction(): void
    {
        $this->increment('interaction_count');
        $this->update(['last_interaction_at' => now()]);
    }

    /**
     * Record a conversation
     */
    public function recordConversation(): void
    {
        $this->increment('conversation_count');
        $this->recordInteraction();
    }
}
