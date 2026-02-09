<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RvmDrop extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'scheduled_for' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'callback_received' => 'boolean',
        'callback_at' => 'datetime',
    ];
}



