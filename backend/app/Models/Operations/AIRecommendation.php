<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AIRecommendation extends Model
{
    protected $table = 'ops.ai_recommendations';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'session_id',
        'category',
        'priority',
        'title',
        'description',
        'rationale',
        'supporting_metrics',
        'projected_impact',
        'confidence_score',
        'suggested_action_type',
        'suggested_action_params',
        'requires_approval',
        'auto_execute_after',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'executed_at',
        'execution_result',
        'valid_until',
        'superseded_by',
    ];

    protected $casts = [
        'supporting_metrics' => 'array',
        'projected_impact' => 'array',
        'suggested_action_params' => 'array',
        'execution_result' => 'array',
        'confidence_score' => 'decimal:2',
        'requires_approval' => 'boolean',
        'reviewed_at' => 'datetime',
        'executed_at' => 'datetime',
        'auto_execute_after' => 'datetime',
        'valid_until' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AISession::class, 'session_id');
    }

    public function actionExecutions(): HasMany
    {
        return $this->hasMany(ActionExecution::class, 'recommendation_id');
    }

    public function supersededBy(): BelongsTo
    {
        return $this->belongsTo(AIRecommendation::class, 'superseded_by');
    }

    /**
     * Check if recommendation is executed
     */
    public function isExecuted(): bool
    {
        return $this->executed_at !== null;
    }

    /**
     * Check if recommendation is pending review
     */
    public function isPendingReview(): bool
    {
        return $this->status === 'pending' && $this->reviewed_at === null;
    }

    /**
     * Check if recommendation can be auto-executed
     */
    public function canAutoExecute(): bool
    {
        return $this->auto_execute_after !== null 
            && $this->auto_execute_after <= now() 
            && !$this->isExecuted()
            && $this->status === 'approved';
    }

    /**
     * Check if recommendation is valid
     */
    public function isValid(): bool
    {
        if ($this->valid_until === null) {
            return true;
        }
        return $this->valid_until > now();
    }
}

