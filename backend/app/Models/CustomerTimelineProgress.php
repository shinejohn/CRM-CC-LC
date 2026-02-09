<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerTimelineProgress extends Model
{
    protected $table = 'customer_timeline_progress';
    
    protected $fillable = [
        'customer_id',
        'campaign_timeline_id',
        'current_day',
        'started_at',
        'last_action_at',
        'completed_at',
        'paused_at',
        'status',
        'completed_actions',
        'skipped_actions',
        'metadata',
    ];
    
    protected $casts = [
        'started_at' => 'datetime',
        'last_action_at' => 'datetime',
        'completed_at' => 'datetime',
        'paused_at' => 'datetime',
        'completed_actions' => 'array',
        'skipped_actions' => 'array',
        'metadata' => 'array',
    ];
    
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
    
    public function timeline(): BelongsTo
    {
        return $this->belongsTo(CampaignTimeline::class, 'campaign_timeline_id');
    }
    
    public function markActionCompleted(int $actionId): void
    {
        $completed = $this->completed_actions ?? [];
        if (!in_array($actionId, $completed)) {
            $completed[] = $actionId;
            $this->update([
                'completed_actions' => $completed,
                'last_action_at' => now(),
            ]);
        }
    }
    
    public function markActionSkipped(int $actionId): void
    {
        $skipped = $this->skipped_actions ?? [];
        if (!in_array($actionId, $skipped)) {
            $skipped[] = $actionId;
            $this->update(['skipped_actions' => $skipped]);
        }
    }
    
    public function advanceDay(): void
    {
        $newDay = $this->current_day + 1;
        
        // Load timeline if not already loaded
        if (!$this->relationLoaded('timeline')) {
            $this->load('timeline');
        }
        
        if ($newDay > $this->timeline->duration_days) {
            $this->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
        } else {
            $this->update(['current_day' => $newDay]);
        }
    }
    
    public function isActionCompleted(int $actionId): bool
    {
        return in_array($actionId, $this->completed_actions ?? []);
    }
}

