<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class Approval extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'uuid',
        'customer_id',
        'service_type',
        'task_id',
        'approver_name',
        'approver_email',
        'approver_phone',
        'approver_role',
        'source_type',
        'source_id',
        'source_url',
        'contact_consent',
        'status',
        'approved_at',
        'provisioning_started_at',
        'provisioned_at',
        'metadata',
    ];

    protected $casts = [
        'contact_consent' => 'boolean',
        'approved_at' => 'datetime',
        'provisioning_started_at' => 'datetime',
        'provisioned_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (Approval $approval) {
            if (empty($approval->uuid)) {
                $approval->uuid = (string) Str::uuid();
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function upsells(): HasMany
    {
        return $this->hasMany(ApprovalUpsell::class);
    }

    public function provisioningTask(): HasOne
    {
        return $this->hasOne(ProvisioningTask::class);
    }
}

