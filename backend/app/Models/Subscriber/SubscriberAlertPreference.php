<?php

namespace App\Models\Subscriber;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriberAlertPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'subscriber_id',
        'category_slug',
        'email_enabled',
        'sms_enabled',
        'push_enabled',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'sms_enabled' => 'boolean',
        'push_enabled' => 'boolean',
    ];

    public $timestamps = false;

    /**
     * Get the subscriber
     */
    public function subscriber(): BelongsTo
    {
        return $this->belongsTo(Subscriber::class);
    }
}



