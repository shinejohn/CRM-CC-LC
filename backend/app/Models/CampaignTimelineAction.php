<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignTimelineAction extends Model
{
    protected $fillable = [
        'campaign_timeline_id',
        'day_number',
        'channel',
        'action_type',
        'template_type',
        'campaign_id',
        'conditions',
        'parameters',
        'delay_hours',
        'priority',
        'is_active',
    ];
    
    protected $casts = [
        'conditions' => 'array',
        'parameters' => 'array',
        'is_active' => 'boolean',
    ];
    
    public function timeline(): BelongsTo
    {
        return $this->belongsTo(CampaignTimeline::class, 'campaign_timeline_id');
    }
    
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id', 'id');
    }
    
    public function shouldExecute(Customer $customer): bool
    {
        if (!$this->conditions) {
            return true;
        }
        
        // Evaluate conditions
        return $this->evaluateConditions($customer);
    }
    
    protected function evaluateConditions(Customer $customer): bool
    {
        $conditions = $this->conditions;
        
        // Example: {"if": "email_opened", "within_hours": 48, "then": "skip"}
        if (isset($conditions['if'])) {
            switch ($conditions['if']) {
                case 'email_opened':
                    $hours = $conditions['within_hours'] ?? 48;
                    $recentOpen = $customer->last_email_open && 
                        $customer->last_email_open->diffInHours(now()) <= $hours;
                    
                    if ($recentOpen && ($conditions['then'] ?? '') === 'skip') {
                        return false;
                    }
                    break;
                    
                case 'engagement_score_above':
                    $threshold = $conditions['threshold'] ?? 50;
                    if ($customer->engagement_score >= $threshold && 
                        ($conditions['then'] ?? '') === 'skip') {
                        return false;
                    }
                    break;
            }
        }
        
        return true;
    }
}

