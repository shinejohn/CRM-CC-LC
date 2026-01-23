<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;

class FeatureFlag extends Model
{
    protected $table = 'ops.feature_flags';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'flag_key',
        'name',
        'description',
        'is_enabled',
        'rollout_percentage',
        'target_communities',
        'target_customer_tiers',
        'target_users',
        'variants',
        'default_variant',
        'enabled_at',
        'disabled_at',
        'owner',
        'tags',
    ];

    protected $casts = [
        'target_communities' => 'array',
        'target_customer_tiers' => 'array',
        'target_users' => 'array',
        'variants' => 'array',
        'tags' => 'array',
        'is_enabled' => 'boolean',
        'rollout_percentage' => 'integer',
        'enabled_at' => 'datetime',
        'disabled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Check if feature flag is enabled
     */
    public function isEnabled(): bool
    {
        return $this->is_enabled === true;
    }

    /**
     * Check if feature flag is active (enabled and not disabled)
     */
    public function isActive(): bool
    {
        return $this->isEnabled() && ($this->disabled_at === null || $this->disabled_at > now());
    }
}

