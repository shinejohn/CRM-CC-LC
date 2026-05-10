<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class ChatMessage extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'session_id',
        'smb_id',
        'role',
        'content',
        'intent',
        'actions_taken',
    ];

    protected $casts = [
        'actions_taken' => 'array',
    ];
}



