<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class ProvisioningTask extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'approval_id',
        'customer_id',
        'service_type',
        'status',
        'priority',
        'started_at',
        'completed_at',
        'failed_at',
        'failure_reason',
        'result_data',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'failed_at' => 'datetime',
        'result_data' => 'array',
    ];

    public function approval(): BelongsTo
    {
        return $this->belongsTo(Approval::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }
}

