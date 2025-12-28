<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeneratedAd extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'platform',
        'ad_type',
        'status',
        'headline',
        'description',
        'call_to_action',
        'destination_url',
        'media_urls',
        'content',
        'metadata',
        'campaign_id',
        'content_id',
        'template_id',
        'generation_params',
        'targeting',
        'budget',
        'schedule',
        'scheduled_start_at',
        'scheduled_end_at',
        'started_at',
        'ended_at',
        'external_ad_id',
        'external_campaign_id',
        'impressions',
        'clicks',
        'spend',
        'conversions',
        'analytics_data',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'media_urls' => 'array',
            'content' => 'array',
            'metadata' => 'array',
            'generation_params' => 'array',
            'targeting' => 'array',
            'budget' => 'array',
            'schedule' => 'array',
            'analytics_data' => 'array',
            'scheduled_start_at' => 'datetime',
            'scheduled_end_at' => 'datetime',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'impressions' => 'integer',
            'clicks' => 'integer',
            'spend' => 'decimal:2',
            'conversions' => 'decimal:2',
        ];
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(AdTemplate::class, 'template_id');
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(GeneratedContent::class, 'content_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    public function getCtrAttribute(): float
    {
        if ($this->impressions === 0) {
            return 0;
        }
        return ($this->clicks / $this->impressions) * 100;
    }

    public function getCpcAttribute(): float
    {
        if ($this->clicks === 0) {
            return 0;
        }
        return $this->spend / $this->clicks;
    }

    public function getCpaAttribute(): float
    {
        if ($this->conversions === 0) {
            return 0;
        }
        return $this->spend / $this->conversions;
    }
}
