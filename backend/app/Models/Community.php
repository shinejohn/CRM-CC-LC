<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Community extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'slug',
        'state',
        'county',
        'population',
        'timezone',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($community) {
            if (empty($community->id)) {
                $community->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get all customers in this community
     */
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class, 'community_id');
    }

    /**
     * Get all subscribers in this community
     */
    public function subscribers(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Subscriber\Subscriber::class, 'subscriber_communities')
            ->withPivot(['subscribed_at', 'is_primary', 'newsletters_enabled', 'alerts_enabled'])
            ->withTimestamps();
    }

    /**
     * Get count of active SMBs (customers with active campaigns)
     */
    public function getActiveSMBCount(): int
    {
        return $this->customers()
            ->where('campaign_status', 'running')
            ->count();
    }

    /**
     * Get total SMB count
     */
    public function getTotalSMBCount(): int
    {
        return $this->customers()->count();
    }

    /**
     * Get the latest metric snapshot
     */
    public function latestMetrics(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(\App\Models\Operations\MetricSnapshot::class)->latestOfMany();
    }

    /**
     * Get all revenue records
     */
    public function revenueRecords(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RevenueRecord::class, 'community_id');
    }
}

