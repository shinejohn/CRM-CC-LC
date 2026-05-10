<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class Callback extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'uuid',
        'smb_id',
        'rvm_drop_id',
        'caller_phone',
        'called_number',
        'started_at',
        'ended_at',
        'duration_seconds',
        'transcript',
        'summary',
        'intent_detected',
        'actions_taken',
        'followup_email_sent',
        'followup_email_sent_at',
        'metadata',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'followup_email_sent' => 'boolean',
        'followup_email_sent_at' => 'datetime',
        'metadata' => 'array',
    ];
}



