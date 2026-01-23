<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AISession extends Model
{
    protected $table = 'ops.ai_sessions';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'session_type',
        'trigger_source',
        'context_metrics',
        'context_alerts',
        'context_recent_actions',
        'user_query',
        'model_used',
        'prompt_tokens',
        'completion_tokens',
        'analysis_summary',
        'recommendations',
        'actions_taken',
        'report_generated_id',
        'status',
        'error_message',
        'started_at',
        'completed_at',
        'duration_ms',
        'created_by',
    ];

    protected $casts = [
        'context_metrics' => 'array',
        'context_alerts' => 'array',
        'context_recent_actions' => 'array',
        'recommendations' => 'array',
        'actions_taken' => 'array',
        'prompt_tokens' => 'integer',
        'completion_tokens' => 'integer',
        'duration_ms' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function aiRecommendations(): HasMany
    {
        return $this->hasMany(AIRecommendation::class, 'session_id');
    }

    public function contextMemories(): HasMany
    {
        return $this->hasMany(AIContextMemory::class, 'source_session_id');
    }

    public function actionExecutions(): HasMany
    {
        return $this->hasMany(ActionExecution::class, 'session_id');
    }

    /**
     * Check if session is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed' && $this->completed_at !== null;
    }

    /**
     * Check if session is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending' || $this->status === 'in_progress';
    }
}

