<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetricSnapshot extends Model
{
    protected $table = 'ops.metric_snapshots';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'metric_id',
        'dimension_key',
        'dimension_value',
        'value',
        'recorded_at',
        'period_start',
        'period_end',
        'granularity',
        'metadata',
    ];

    protected $casts = [
        'value' => 'decimal:4',
        'metadata' => 'array',
        'recorded_at' => 'datetime',
        'period_start' => 'datetime',
        'period_end' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function metric(): BelongsTo
    {
        return $this->belongsTo(MetricDefinition::class, 'metric_id');
    }
}

