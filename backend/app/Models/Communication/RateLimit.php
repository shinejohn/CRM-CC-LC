<?php

declare(strict_types=1);

namespace App\Models\Communication;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class RateLimit extends Model
{
    use HasUuids;

    protected $table = 'rate_limits';

    protected $fillable = [
        'limit_type',
        'limit_key',
        'max_per_second',
        'max_per_minute',
        'max_per_hour',
        'max_per_day',
        'current_hour_count',
        'current_day_count',
        'hour_reset_at',
        'day_reset_at',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'hour_reset_at' => 'datetime',
        'day_reset_at' => 'datetime',
    ];
}
