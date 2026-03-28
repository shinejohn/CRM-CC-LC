<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunitySubscription extends Model
{
    use HasUuids;

    protected $fillable = [
        'customer_id',
        'community_id',
        'product_slug',
        'tier',
        'status',
        'monthly_rate',
        'stripe_subscription_id',
        'stripe_customer_id',
        'commitment_months',
        'commitment_starts_at',
        'commitment_ends_at',
        'bonus_months',
        'bonus_starts_at',
        'bonus_ends_at',
        'next_renewal_at',
        'is_founder_pricing',
        'founder_lock_expires_at',
        'category_group',
        'category_subtype',
        'expert_column_name',
        'expert_column_slug',
        'sponsored_section',
        'section_price',
        'cancelled_at',
        'cancellation_reason',
        'early_termination_balance',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isInBonusPeriod(): bool
    {
        if (! $this->bonus_starts_at || ! $this->bonus_ends_at) {
            return false;
        }

        return now()->between($this->bonus_starts_at, $this->bonus_ends_at);
    }

    public function isFounderPricing(): bool
    {
        if (! $this->is_founder_pricing || ! $this->founder_lock_expires_at) {
            return false;
        }

        return $this->founder_lock_expires_at->isFuture();
    }

    public function monthsRemaining(): int
    {
        if (! $this->commitment_ends_at) {
            return 0;
        }

        if ($this->commitment_ends_at->isPast()) {
            // Check bonus period
            if ($this->bonus_ends_at && $this->bonus_ends_at->isFuture()) {
                return (int) now()->diffInMonths($this->bonus_ends_at);
            }

            return 0;
        }

        return (int) now()->diffInMonths($this->commitment_ends_at);
    }

    protected function casts(): array
    {
        return [
            'monthly_rate' => 'decimal:2',
            'section_price' => 'decimal:2',
            'early_termination_balance' => 'decimal:2',
            'commitment_months' => 'integer',
            'bonus_months' => 'integer',
            'is_founder_pricing' => 'boolean',
            'commitment_starts_at' => 'datetime',
            'commitment_ends_at' => 'datetime',
            'bonus_starts_at' => 'datetime',
            'bonus_ends_at' => 'datetime',
            'next_renewal_at' => 'datetime',
            'founder_lock_expires_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }
}
