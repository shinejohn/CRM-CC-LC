<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class CampaignVariant extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'outbound_campaign_id',
        'label',
        'subject',
        'message',
        'template_id',
        'weight',
        'recipients_count',
        'sent_count',
        'open_count',
        'click_count',
        'is_winner',
    ];

    protected function casts(): array
    {
        return [
            'weight' => 'integer',
            'recipients_count' => 'integer',
            'sent_count' => 'integer',
            'open_count' => 'integer',
            'click_count' => 'integer',
            'is_winner' => 'boolean',
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(OutboundCampaign::class, 'outbound_campaign_id');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(CampaignRecipient::class, 'variant_id');
    }

    public function getOpenRateAttribute(): float
    {
        if ($this->sent_count === 0) {
            return 0.0;
        }

        return ($this->open_count / $this->sent_count) * 100;
    }

    public function getClickRateAttribute(): float
    {
        if ($this->sent_count === 0) {
            return 0.0;
        }

        return ($this->click_count / $this->sent_count) * 100;
    }
}
