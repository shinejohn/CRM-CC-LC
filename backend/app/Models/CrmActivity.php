<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrmActivity extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'crm_activities';

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'deal_id',
        'contact_id',
        'type',
        'subject',
        'description',
        'scheduled_at',
        'completed_at',
        'status',
        'priority',
        'reminder_sent',
        'reminder_at',
        'outcome',
        'metadata',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'reminder_at' => 'datetime',
        'reminder_sent' => 'boolean',
        'metadata' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(CrmContact::class, 'contact_id');
    }

    public function isOverdue(): bool
    {
        if (!$this->scheduled_at || $this->status === 'completed' || $this->status === 'cancelled') {
            return false;
        }
        return now()->isAfter($this->scheduled_at);
    }
}
