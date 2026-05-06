<?php

declare(strict_types=1);

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class HealthCheck extends Model
{
    use HasUuids;

    protected $table = 'ops.health_checks';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'component_id',
        'status',
        'response_time_ms',
        'check_type',
        'endpoint_checked',
        'response_code',
        'response_body_sample',
        'error_message',
        'checked_from',
        'checked_at',
    ];

    protected $casts = [
        'response_time_ms' => 'integer',
        'response_code' => 'integer',
        'checked_at' => 'datetime',
    ];

    public function component(): BelongsTo
    {
        return $this->belongsTo(InfrastructureComponent::class, 'component_id');
    }
}

