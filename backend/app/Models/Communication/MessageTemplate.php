<?php

namespace App\Models\Communication;

use Illuminate\Database\Eloquent\Model;

class MessageTemplate extends Model
{
    protected $table = 'message_templates';

    protected $fillable = [
        'slug',
        'name',
        'description',
        'channel',
        'subject',
        'body_html',
        'body_text',
        'variables',
        'version',
        'is_active',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
        'version' => 'integer',
    ];
}
