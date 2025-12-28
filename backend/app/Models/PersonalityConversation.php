<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PersonalityConversation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'personality_id',
        'conversation_id',
        'tenant_id',
        'personality_context',
        'personality_metadata',
        'messages_handled',
    ];

    protected function casts(): array
    {
        return [
            'personality_context' => 'array',
            'personality_metadata' => 'array',
            'messages_handled' => 'integer',
        ];
    }

    public function personality(): BelongsTo
    {
        return $this->belongsTo(AiPersonality::class, 'personality_id');
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }
}
