<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailConversation extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'ai_responded' => 'boolean',
    ];
}



