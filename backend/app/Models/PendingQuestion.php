<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PendingQuestion extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'field_to_populate',
        'table_to_update',
        'question',
        'context',
        'alternative_phrasings',
        'priority',
        'ask_during',
        'asked',
        'asked_at',
        'asked_in_conversation_id',
        'answered',
        'answer',
        'answered_at',
        'needs_verification',
        'verified',
    ];

    protected $casts = [
        'alternative_phrasings' => 'array',
        'ask_during' => 'array',
        'priority' => 'integer',
        'asked' => 'boolean',
        'asked_at' => 'datetime',
        'answered' => 'boolean',
        'answered_at' => 'datetime',
        'needs_verification' => 'boolean',
        'verified' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($question) {
            if (empty($question->id)) {
                $question->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the customer this question is for
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Mark question as asked
     */
    public function markAsAsked(string $conversationId): void
    {
        $this->asked = true;
        $this->asked_at = now();
        $this->asked_in_conversation_id = $conversationId;
        $this->save();
    }

    /**
     * Mark question as answered
     */
    public function markAsAnswered(string $answer): void
    {
        $this->answered = true;
        $this->answer = $answer;
        $this->answered_at = now();
        $this->save();
    }
}
