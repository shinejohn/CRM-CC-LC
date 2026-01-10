<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Conversation extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'session_id',
        'entry_point',
        'template_id',
        'slide_at_start',
        'presenter_id',
        'human_rep_id',
        'messages',
        'topics_discussed',
        'questions_asked',
        'objections_raised',
        'sentiment_trajectory',
        'new_data_collected',
        'faqs_generated',
        'outcome',
        'outcome_details',
        'followup_needed',
        'followup_scheduled_at',
        'followup_notes',
        'started_at',
        'ended_at',
        'duration_seconds',
        'user_agent',
        'ip_address',
    ];

    protected $casts = [
        'messages' => 'array',
        'topics_discussed' => 'array',
        'questions_asked' => 'array',
        'objections_raised' => 'array',
        'sentiment_trajectory' => 'array',
        'new_data_collected' => 'array',
        'faqs_generated' => 'array',
        'followup_needed' => 'boolean',
        'followup_scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration_seconds' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($conversation) {
            if (empty($conversation->id)) {
                $conversation->id = (string) Str::uuid();
            }
            if (empty($conversation->session_id)) {
                $conversation->session_id = 'session_' . Str::random(32);
            }
        });
    }

    /**
     * Get the customer this conversation belongs to
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get all messages in this conversation
     */
    public function conversationMessages(): HasMany
    {
        return $this->hasMany(ConversationMessage::class);
    }

    /**
     * Calculate and set duration when conversation ends
     */
    public function end(): void
    {
        $this->ended_at = now();
        if ($this->started_at) {
            $this->duration_seconds = $this->started_at->diffInSeconds($this->ended_at);
        }
        $this->save();
    }
    
    /**
     * Get formatted duration
     */
    public function getFormattedDurationAttribute(): string
    {
        if (!$this->duration_seconds) {
            return 'N/A';
        }
        
        $minutes = floor($this->duration_seconds / 60);
        $seconds = $this->duration_seconds % 60;
        
        if ($minutes > 0) {
            return "{$minutes}m {$seconds}s";
        }
        return "{$seconds}s";
    }
}
