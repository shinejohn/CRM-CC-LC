<?php

namespace App\Models\Newsletter;

use App\Models\Community;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sponsorship extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'uuid',
        'sponsor_id',
        'sponsorship_type',
        'community_id',
        'start_date',
        'end_date',
        'impressions_purchased',
        'impressions_delivered',
        'creative_json',
        'rate_type',
        'rate_cents',
        'total_value_cents',
        'status',
        'click_count',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'creative_json' => 'array',
    ];

    /**
     * Get the sponsor
     */
    public function sponsor(): BelongsTo
    {
        return $this->belongsTo(Sponsor::class);
    }

    /**
     * Get the community (if scoped)
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * Check if sponsorship is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' 
            && $this->start_date <= now() 
            && $this->end_date >= now()
            && $this->impressions_delivered < $this->impressions_purchased;
    }

    /**
     * Get delivery percentage
     */
    public function getDeliveryPercentageAttribute(): float
    {
        if ($this->impressions_purchased === 0) {
            return 0.0;
        }
        return ($this->impressions_delivered / $this->impressions_purchased) * 100;
    }

    /**
     * Get click-through rate
     */
    public function getCtrAttribute(): float
    {
        if ($this->impressions_delivered === 0) {
            return 0.0;
        }
        return ($this->click_count / $this->impressions_delivered) * 100;
    }
}



