<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailEvent extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'event_at' => 'datetime',
        'raw_event' => 'array',
    ];
}



