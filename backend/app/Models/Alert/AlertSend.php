<?php

namespace App\Models\Alert;

use App\Models\Subscriber\Subscriber;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlertSend extends Model
{
    use HasFactory;

    protected $fillable = [
        'alert_id',
        'subscriber_id',
        'email_sent',
        'email_message_id',
        'sms_sent',
        'sms_message_id',
        'push_sent',
        'push_message_id',
        'opened_at',
        'clicked_at',
    ];

    protected $casts = [
        'email_sent' => 'boolean',
        'sms_sent' => 'boolean',
        'push_sent' => 'boolean',
        'opened_at' => 'datetime',
        'clicked_at' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Get the alert
     */
    public function alert(): BelongsTo
    {
        return $this->belongsTo(Alert::class);
    }

    /**
     * Get the subscriber
     */
    public function subscriber(): BelongsTo
    {
        return $this->belongsTo(Subscriber::class);
    }

    /**
     * Check if alert was opened
     */
    public function isOpened(): bool
    {
        return $this->opened_at !== null;
    }

    /**
     * Check if alert was clicked
     */
    public function isClicked(): bool
    {
        return $this->clicked_at !== null;
    }
}



