<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActionExecution extends Model
{
    protected $table = 'ops.action_executions';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'action_id',
        'recommendation_id',
        'session_id',
        'params',
        'status',
        'scheduled_for',
        'started_at',
        'completed_at',
        'duration_ms',
        'result',
        'error_message',
        'error_details',
        'rolled_back_at',
        'rollback_reason',
        'rollback_result',
        'initiated_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'params' => 'array',
        'result' => 'array',
        'error_details' => 'array',
        'rollback_result' => 'array',
        'duration_ms' => 'integer',
        'scheduled_for' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'rolled_back_at' => 'datetime',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function action(): BelongsTo
    {
        return $this->belongsTo(ActionDefinition::class, 'action_id');
    }

    public function recommendation(): BelongsTo
    {
        return $this->belongsTo(AIRecommendation::class, 'recommendation_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AISession::class, 'session_id');
    }

    /**
     * Check if execution is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed' && $this->completed_at !== null;
    }

    /**
     * Check if execution is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending' || $this->status === 'scheduled';
    }

    /**
     * Check if execution is approved
     */
    public function isApproved(): bool
    {
        return $this->approved_at !== null;
    }

    /**
     * Check if execution can be rolled back
     */
    public function canRollback(): bool
    {
        if (!$this->isCompleted() || $this->rolled_back_at !== null) {
            return false;
        }
        
        $action = $this->action;
        return $action && $action->is_reversible === true;
    }
}

