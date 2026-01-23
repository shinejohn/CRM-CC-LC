<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InfrastructureComponent extends Model
{
    protected $table = 'ops.infrastructure_components';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'component_key',
        'name',
        'description',
        'component_type',
        'category',
        'environment',
        'host',
        'port',
        'connection_string_encrypted',
        'health_check_type',
        'health_check_endpoint',
        'health_check_interval_seconds',
        'health_check_timeout_seconds',
        'warning_response_time_ms',
        'critical_response_time_ms',
        'depends_on',
        'current_status',
        'last_status_change',
        'is_active',
        'tags',
        'metadata',
    ];

    protected $casts = [
        'depends_on' => 'array',
        'tags' => 'array',
        'metadata' => 'array',
        'port' => 'integer',
        'health_check_interval_seconds' => 'integer',
        'health_check_timeout_seconds' => 'integer',
        'warning_response_time_ms' => 'integer',
        'critical_response_time_ms' => 'integer',
        'is_active' => 'boolean',
        'last_status_change' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function healthChecks(): HasMany
    {
        return $this->hasMany(HealthCheck::class, 'component_id');
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'component_id');
    }

    /**
     * Check if component is active
     */
    public function isActive(): bool
    {
        return $this->is_active === true;
    }

    /**
     * Check if component is healthy
     */
    public function isHealthy(): bool
    {
        return $this->current_status === 'healthy';
    }

    /**
     * Get latest health check
     */
    public function latestHealthCheck()
    {
        return $this->healthChecks()->latest('checked_at')->first();
    }
}

