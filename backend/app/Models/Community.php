<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class Community extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'state',
        'county',
        'population',
        'timezone',
        'settings',
        'launched_at',
        'founder_window_days',
    ];

    protected $casts = [
        'settings' => 'array',
        'launched_at' => 'datetime',
        'founder_window_days' => 'integer',
    ];

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
