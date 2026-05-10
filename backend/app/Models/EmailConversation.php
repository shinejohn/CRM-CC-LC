<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class EmailConversation extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'smb_id',
        'direction',
        'from_email',
        'to_email',
        'subject',
        'body',
        'body_html',
        'in_reply_to',
        'campaign_send_id',
        'intent',
        'sentiment',
        'ai_responded',
        'ai_response',
    ];

    protected $casts = [
        'ai_responded' => 'boolean',
    ];
}



