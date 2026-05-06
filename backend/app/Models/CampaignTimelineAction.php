<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class CampaignTimelineAction extends Model
{
    use HasUuids;

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
        if (! $this->conditions) {
            return true;
        }

        // Evaluate conditions
        return $this->evaluateConditions($customer);
    }

    protected function evaluateConditions(Customer $customer): bool
    {
        $conditions = $this->conditions;

        if (! isset($conditions['if'])) {
            return true;
        }

        switch ($conditions['if']) {
            case 'email_opened':
                $hours = $conditions['within_hours'] ?? 48;
                $recentOpen = $customer->last_email_open &&
                    $customer->last_email_open->diffInHours(now()) <= $hours;

                if (($conditions['then'] ?? '') === 'skip' && $recentOpen) {
                    return false;
                }
                if (($conditions['then'] ?? '') === 'proceed' && ! $recentOpen) {
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

            case 'founder_window_open':
                if (! $this->isFounderWindowOpen($customer)) {
                    return false;
                }
                break;
        }

        return true;
    }

    protected function isFounderWindowOpen(Customer $customer): bool
    {
        $customer->loadMissing('community');
        $community = $customer->community;
        if (! $community?->launched_at) {
            return true;
        }

        $days = (int) ($community->founder_window_days ?? 90);

        return now()->lte($community->launched_at->copy()->addDays($days));
    }
}
