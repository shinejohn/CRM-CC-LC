<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetricAggregate extends Model
{
    protected $table = 'ops.metric_aggregates';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'metric_id',
        'dimension_key',
        'dimension_value',
        'period_type',
        'period_start',
        'period_end',
        'value_sum',
        'value_avg',
        'value_min',
        'value_max',
        'value_count',
        'value_first',
        'value_last',
        'value_stddev',
        'value_p50',
        'value_p95',
        'value_p99',
        'computed_at',
    ];

    protected $casts = [
        'value_sum' => 'decimal:4',
        'value_avg' => 'decimal:4',
        'value_min' => 'decimal:4',
        'value_max' => 'decimal:4',
        'value_first' => 'decimal:4',
        'value_last' => 'decimal:4',
        'value_stddev' => 'decimal:4',
        'value_p50' => 'decimal:4',
        'value_p95' => 'decimal:4',
        'value_p99' => 'decimal:4',
        'value_count' => 'integer',
        'period_start' => 'datetime',
        'period_end' => 'datetime',
        'computed_at' => 'datetime',
    ];

    public function metric(): BelongsTo
    {
        return $this->belongsTo(MetricDefinition::class, 'metric_id');
    }
}

