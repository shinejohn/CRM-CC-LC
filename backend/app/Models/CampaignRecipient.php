<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignRecipient extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'campaign_id',
        'customer_id',
        'tenant_id',
        'email',
        'phone',
        'name',
        'status',
        'sent_at',
        'delivered_at',
        'opened_at',
        'clicked_at',
        'replied_at',
        'answered_at',
        'duration_seconds',
        'external_id',
        'error_message',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'sent_at' => 'datetime',
            'delivered_at' => 'datetime',
            'opened_at' => 'datetime',
            'clicked_at' => 'datetime',
            'replied_at' => 'datetime',
            'answered_at' => 'datetime',
            'duration_seconds' => 'integer',
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(OutboundCampaign::class, 'campaign_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isSent(): bool
    {
        return in_array($this->status, ['sent', 'delivered', 'opened', 'clicked', 'replied', 'answered', 'voicemail']);
    }

    public function isFailed(): bool
    {
        return in_array($this->status, ['failed', 'bounced']);
    }
}
