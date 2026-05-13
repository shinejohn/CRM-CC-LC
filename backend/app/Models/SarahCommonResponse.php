<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class SarahCommonResponse extends Model
{
    use HasUuids;

    protected $fillable = [
        'intent_key',
        'category',
        'response_text',
        'trigger_phrases',
        'audio_file',
        'audio_url',
        'audio_generated',
        'always_ai',
        'match_count',
        'priority',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'trigger_phrases' => 'array',
            'audio_generated' => 'boolean',
            'always_ai' => 'boolean',
            'is_active' => 'boolean',
            'match_count' => 'integer',
            'priority' => 'integer',
        ];
    }
}
