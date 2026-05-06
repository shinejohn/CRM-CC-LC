<?php

declare(strict_types=1);

namespace App\Models\Communication;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class MessageTemplate extends Model
{
    use HasUuids;

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
