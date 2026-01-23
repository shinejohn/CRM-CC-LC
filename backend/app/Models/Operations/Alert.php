<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    protected $table = 'ops.alerts';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'rule_id',
        'category',
        'severity',
        'title',
        'description',
        'metric_value',
        'threshold_value',
        'component_id',
        'context_data',
        'status',
        'triggered_at',
        'acknowledged_at',
        'acknowledged_by',
        'resolved_at',
        'resolved_by',
        'resolution_notes',
        'snoozed_until',
        'snoozed_by',
        'snooze_reason',
        'escalation_level',
        'escalated_at',
        'related_alert_ids',
        'incident_id',
    ];

    protected $casts = [
        'metric_value' => 'decimal:4',
        'threshold_value' => 'decimal:4',
        'context_data' => 'array',
        'related_alert_ids' => 'array',
        'escalation_level' => 'integer',
        'triggered_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
        'snoozed_until' => 'datetime',
        'escalated_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function rule(): BelongsTo
    {
        return $this->belongsTo(AlertRule::class, 'rule_id');
    }

    public function component(): BelongsTo
    {
        return $this->belongsTo(InfrastructureComponent::class, 'component_id');
    }

    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class, 'incident_id');
    }

    /**
     * Check if alert is resolved
     */
    public function isResolved(): bool
    {
        return $this->status === 'resolved' && $this->resolved_at !== null;
    }

    /**
     * Check if alert is acknowledged
     */
    public function isAcknowledged(): bool
    {
        return $this->acknowledged_at !== null;
    }

    /**
     * Check if alert is snoozed
     */
    public function isSnoozed(): bool
    {
        return $this->snoozed_until !== null && $this->snoozed_until > now();
    }

    /**
     * Check if alert is active (not resolved or snoozed)
     */
    public function isActive(): bool
    {
        return !$this->isResolved() && !$this->isSnoozed();
    }
}

