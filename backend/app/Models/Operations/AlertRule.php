<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AlertRule extends Model
{
    protected $table = 'ops.alert_rules';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'rule_key',
        'name',
        'description',
        'category',
        'severity',
        'metric_id',
        'component_id',
        'condition_type',
        'condition_operator',
        'condition_value',
        'condition_window_seconds',
        'condition_query',
        'notification_channels',
        'notification_recipients',
        'notification_template',
        'evaluation_interval_seconds',
        'cooldown_seconds',
        'auto_action_id',
        'auto_action_params',
        'is_active',
        'last_triggered_at',
    ];

    protected $casts = [
        'condition_value' => 'decimal:4',
        'notification_channels' => 'array',
        'notification_recipients' => 'array',
        'auto_action_params' => 'array',
        'condition_window_seconds' => 'integer',
        'evaluation_interval_seconds' => 'integer',
        'cooldown_seconds' => 'integer',
        'is_active' => 'boolean',
        'last_triggered_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function metric(): BelongsTo
    {
        return $this->belongsTo(MetricDefinition::class, 'metric_id');
    }

    public function component(): BelongsTo
    {
        return $this->belongsTo(InfrastructureComponent::class, 'component_id');
    }

    public function autoAction(): BelongsTo
    {
        return $this->belongsTo(ActionDefinition::class, 'auto_action_id');
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'rule_id');
    }

    /**
     * Check if rule is active
     */
    public function isActive(): bool
    {
        return $this->is_active === true;
    }

    /**
     * Check if rule is in cooldown
     */
    public function isInCooldown(): bool
    {
        if (!$this->last_triggered_at || !$this->cooldown_seconds) {
            return false;
        }
        return $this->last_triggered_at->addSeconds($this->cooldown_seconds) > now();
    }
}

