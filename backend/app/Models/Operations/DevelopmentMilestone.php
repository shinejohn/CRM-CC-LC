<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;

class DevelopmentMilestone extends Model
{
    protected $table = 'ops.development_milestones';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'milestone_key',
        'name',
        'description',
        'category',
        'module',
        'planned_start',
        'planned_end',
        'actual_start',
        'actual_end',
        'status',
        'progress_percentage',
        'depends_on',
        'blocks',
        'owner',
        'team',
        'requirements',
        'acceptance_criteria',
        'blockers',
        'estimated_hours',
        'actual_hours',
    ];

    protected $casts = [
        'depends_on' => 'array',
        'blocks' => 'array',
        'team' => 'array',
        'acceptance_criteria' => 'array',
        'blockers' => 'array',
        'progress_percentage' => 'integer',
        'estimated_hours' => 'integer',
        'actual_hours' => 'integer',
        'planned_start' => 'date',
        'planned_end' => 'date',
        'actual_start' => 'date',
        'actual_end' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Check if milestone is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed' && $this->actual_end !== null;
    }

    /**
     * Check if milestone is in progress
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress' && $this->actual_start !== null;
    }

    /**
     * Check if milestone is blocked
     */
    public function isBlocked(): bool
    {
        return !empty($this->blockers) || $this->status === 'blocked';
    }

    /**
     * Check if milestone is overdue
     */
    public function isOverdue(): bool
    {
        if ($this->isCompleted()) {
            return false;
        }
        return $this->planned_end !== null && $this->planned_end < now();
    }
}

