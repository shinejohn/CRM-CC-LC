<?php

namespace App\Models\Communication;

use Illuminate\Database\Eloquent\Model;

class ChannelHealth extends Model
{
    protected $table = 'channel_health';

    protected $fillable = [
        'channel',
        'gateway',
        'is_healthy',
        'success_rate_1h',
        'success_rate_24h',
        'avg_latency_ms',
        'current_rate_per_sec',
        'max_rate_per_sec',
        'last_check_at',
        'last_failure_at',
        'failure_reason',
    ];

    protected $casts = [
        'is_healthy' => 'boolean',
        'success_rate_1h' => 'decimal:2',
        'success_rate_24h' => 'decimal:2',
        'last_check_at' => 'datetime',
        'last_failure_at' => 'datetime',
    ];
}
