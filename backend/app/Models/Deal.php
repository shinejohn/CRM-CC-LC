<?php

namespace App\Models;

use App\Enums\DealStage;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Deal extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'contact_id',
        'name',
        'value',
        'stage',
        'probability',
        'loss_reason',
        'notes',
        'expected_close_at',
        'closed_at',
        'metadata',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'expected_close_at' => 'datetime',
        'closed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(CrmContact::class, 'contact_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(DealActivity::class);
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    public function crmActivities(): HasMany
    {
        return $this->hasMany(CrmActivity::class);
    }

    public function isWon(): bool
    {
        return $this->stage === DealStage::WON->value;
    }

    public function isLost(): bool
    {
        return $this->stage === DealStage::LOST->value;
    }

    public function isTerminal(): bool
    {
        return $this->isWon() || $this->isLost();
    }
}
