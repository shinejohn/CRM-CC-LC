<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OutboundCampaign extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'status',
        'subject',
        'message',
        'template_id',
        'template_variables',
        'scheduled_at',
        'started_at',
        'completed_at',
        'recipient_segments',
        'total_recipients',
        'sent_count',
        'delivered_count',
        'failed_count',
        'opened_count',
        'clicked_count',
        'replied_count',
        'answered_count',
        'voicemail_count',
        'metadata',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'template_variables' => 'array',
            'recipient_segments' => 'array',
            'metadata' => 'array',
            'scheduled_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'total_recipients' => 'integer',
            'sent_count' => 'integer',
            'delivered_count' => 'integer',
            'failed_count' => 'integer',
            'opened_count' => 'integer',
            'clicked_count' => 'integer',
            'replied_count' => 'integer',
            'answered_count' => 'integer',
            'voicemail_count' => 'integer',
        ];
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(CampaignRecipient::class, 'campaign_id');
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function getDeliveryRateAttribute(): float
    {
        if ($this->sent_count === 0) {
            return 0;
        }
        return ($this->delivered_count / $this->sent_count) * 100;
    }

    public function getOpenRateAttribute(): float
    {
        if ($this->delivered_count === 0) {
            return 0;
        }
        return ($this->opened_count / $this->delivered_count) * 100;
    }

    public function getClickRateAttribute(): float
    {
        if ($this->delivered_count === 0) {
            return 0;
        }
        return ($this->clicked_count / $this->delivered_count) * 100;
    }
}
