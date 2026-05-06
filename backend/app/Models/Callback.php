<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class Callback extends Model
{
    use HasUuids, HasFactory;

    protected $guarded = [];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'followup_email_sent' => 'boolean',
        'followup_email_sent_at' => 'datetime',
        'metadata' => 'array',
    ];
}



