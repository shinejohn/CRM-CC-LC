<?php

declare(strict_types=1);

namespace App\Models\Subscriber;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class UnsubscribeToken extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'subscriber_id',
        'token',
        'scope',
        'scope_id',
        'used_at',
    ];

    protected $casts = [
        'used_at' => 'datetime',
    ];

    /**
     * Get the subscriber
     */
    public function subscriber(): BelongsTo
    {
        return $this->belongsTo(Subscriber::class);
    }

    /**
     * Check if token is used
     */
    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }
}



