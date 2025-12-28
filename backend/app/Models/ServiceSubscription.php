<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceSubscription extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'user_id',
        'service_id',
        'order_id',
        'tier', // 'trial', 'basic', 'standard', 'premium', 'enterprise'
        'status', // 'active', 'cancelled', 'expired', 'suspended'
        'trial_started_at',
        'trial_expires_at',
        'trial_converted_at',
        'subscription_started_at',
        'subscription_expires_at',
        'auto_renew',
        'stripe_subscription_id',
        'stripe_customer_id',
        'monthly_amount',
        'billing_cycle', // 'monthly', 'annual'
        'ai_services_enabled',
        'cancelled_at',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function isTrial(): bool
    {
        return $this->tier === 'trial' && 
               $this->status === 'active' && 
               $this->trial_expires_at && 
               $this->trial_expires_at->isFuture();
    }

    public function isPremium(): bool
    {
        return in_array($this->tier, ['standard', 'premium', 'enterprise']) &&
               $this->status === 'active';
    }

    public function isExpired(): bool
    {
        if ($this->tier === 'trial') {
            return $this->trial_expires_at && $this->trial_expires_at->isPast();
        }
        
        return $this->subscription_expires_at && $this->subscription_expires_at->isPast();
    }


    protected function casts(): array
    {
        return [
            'trial_started_at' => 'datetime',
            'trial_expires_at' => 'datetime',
            'trial_converted_at' => 'datetime',
            'subscription_started_at' => 'datetime',
            'subscription_expires_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'auto_renew' => 'boolean',
            'monthly_amount' => 'decimal:2',
            'ai_services_enabled' => 'array',
        ];
    }
}
