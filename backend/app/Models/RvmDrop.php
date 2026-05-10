<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class RvmDrop extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'uuid',
        'smb_id',
        'campaign_send_id',
        'phone',
        'script',
        'voice_persona',
        'scheduled_for',
        'sent_at',
        'provider',
        'provider_message_id',
        'status',
        'delivered_at',
        'delivery_status',
        'callback_received',
        'callback_at',
        'callback_id',
    ];

    protected $casts = [
        'scheduled_for' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'callback_received' => 'boolean',
        'callback_at' => 'datetime',
    ];
}



