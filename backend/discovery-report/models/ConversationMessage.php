<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ConversationMessage extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'tokens_used',
        'model_used',
        'response_time_ms',
        'actions_triggered',
        'timestamp',
    ];

    protected $casts = [
        'actions_triggered' => 'array',
        'tokens_used' => 'integer',
        'response_time_ms' => 'integer',
        'timestamp' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($message) {
            if (empty($message->id)) {
                $message->id = (string) Str::uuid();
            }
            if (empty($message->timestamp)) {
                $message->timestamp = now();
            }
        });
    }

    /**
     * Get the conversation this message belongs to
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }
}
