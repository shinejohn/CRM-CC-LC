<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class ChatMessage extends Model
{
    use HasUuids, HasFactory;

    protected $guarded = [];

    protected $casts = [
        'actions_taken' => 'array',
    ];
}



