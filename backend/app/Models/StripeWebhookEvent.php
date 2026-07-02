<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class StripeWebhookEvent extends Model
{
    use HasUuids;

    protected $fillable = [
        'stripe_event_id',
        'type',
        'processed_at',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
    ];
}
