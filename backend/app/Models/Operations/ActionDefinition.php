<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ActionDefinition extends Model
{
    protected $table = 'ops.action_definitions';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'action_key',
        'name',
        'description',
        'category',
        'risk_level',
        'handler_class',
        'default_params',
        'required_params',
        'requires_approval',
        'auto_approve_conditions',
        'max_executions_per_hour',
        'max_executions_per_day',
        'cooldown_seconds',
        'is_reversible',
        'rollback_handler_class',
        'prerequisite_checks',
        'is_active',
    ];

    protected $casts = [
        'default_params' => 'array',
        'required_params' => 'array',
        'auto_approve_conditions' => 'array',
        'prerequisite_checks' => 'array',
        'requires_approval' => 'boolean',
        'is_reversible' => 'boolean',
        'is_active' => 'boolean',
        'max_executions_per_hour' => 'integer',
        'max_executions_per_day' => 'integer',
        'cooldown_seconds' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function executions(): HasMany
    {
        return $this->hasMany(ActionExecution::class, 'action_id');
    }

    /**
     * Check if action is active
     */
    public function isActive(): bool
    {
        return $this->is_active === true;
    }

    /**
     * Check if action requires approval
     */
    public function requiresApproval(): bool
    {
        return $this->requires_approval === true;
    }
}

