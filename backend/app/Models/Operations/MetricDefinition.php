<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MetricDefinition extends Model
{
    protected $table = 'ops.metric_definitions';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'metric_key',
        'name',
        'description',
        'category',
        'subcategory',
        'data_type',
        'unit',
        'decimal_places',
        'aggregation_method',
        'rollup_intervals',
        'warning_threshold',
        'warning_direction',
        'critical_threshold',
        'critical_direction',
        'collection_method',
        'collection_interval_seconds',
        'source_table',
        'source_query',
        'ai_importance',
        'ai_context_notes',
        'is_active',
    ];

    protected $casts = [
        'rollup_intervals' => 'array',
        'warning_threshold' => 'decimal:4',
        'critical_threshold' => 'decimal:4',
        'decimal_places' => 'integer',
        'collection_interval_seconds' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function snapshots(): HasMany
    {
        return $this->hasMany(MetricSnapshot::class, 'metric_id');
    }

    public function aggregates(): HasMany
    {
        return $this->hasMany(MetricAggregate::class, 'metric_id');
    }

    /**
     * Check if metric is active
     */
    public function isActive(): bool
    {
        return $this->is_active === true;
    }

    /**
     * Get latest snapshot
     */
    public function latestSnapshot()
    {
        return $this->snapshots()->latest('recorded_at')->first();
    }
}

