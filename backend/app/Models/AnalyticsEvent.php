<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class AnalyticsEvent extends Model
{
    use HasUuids, HasFactory;

    protected $guarded = [];

    protected $casts = [
        'properties' => 'array',
        'occurred_at' => 'datetime',
    ];
}



