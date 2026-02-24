<?php

namespace App\Models\Cssn;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\SMB;
use App\Models\Community;

class CssnSubscription extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'smb_id',
        'community_id',
        'tier',
        'mode',
        'status',
        'campaign_start_date',
        'campaign_end_date',
        'cross_community_ids',
        'billing_amount_cents',
        'billing_interval',
        'stripe_subscription_id',
        'activated_at',
        'cancelled_at',
    ];

    protected $casts = [
        'campaign_start_date' => 'date',
        'campaign_end_date' => 'date',
        'cross_community_ids' => 'array',
        'activated_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class);
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function isActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->mode === 'campaign') {
            $now = now();
            if (!$this->campaign_start_date || !$this->campaign_end_date) {
                return false;
            }
            
            return $now->between($this->campaign_start_date, $this->campaign_end_date->copy()->endOfDay());
        }

        return true;
    }
}
