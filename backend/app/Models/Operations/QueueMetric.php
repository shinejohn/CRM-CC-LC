<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;

class QueueMetric extends Model
{
    protected $table = 'ops.queue_metrics';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'queue_name',
        'queue_type',
        'priority',
        'current_depth',
        'depth_24h_avg',
        'depth_24h_max',
        'messages_in_1h',
        'messages_out_1h',
        'messages_failed_1h',
        'avg_processing_time_ms',
        'p95_processing_time_ms',
        'p99_processing_time_ms',
        'oldest_message_age_seconds',
        'active_consumers',
        'consumer_utilization',
        'status',
        'recorded_at',
    ];

    protected $casts = [
        'current_depth' => 'integer',
        'depth_24h_avg' => 'integer',
        'depth_24h_max' => 'integer',
        'messages_in_1h' => 'integer',
        'messages_out_1h' => 'integer',
        'messages_failed_1h' => 'integer',
        'avg_processing_time_ms' => 'integer',
        'p95_processing_time_ms' => 'integer',
        'p99_processing_time_ms' => 'integer',
        'oldest_message_age_seconds' => 'integer',
        'active_consumers' => 'integer',
        'consumer_utilization' => 'decimal:2',
        'recorded_at' => 'datetime',
    ];
}

