<?php

namespace App\Models\Communication;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryEvent extends Model
{
    protected $table = 'delivery_events';

    protected $fillable = [
        'message_queue_id',
        'event_type',
        'event_data',
        'source',
        'external_event_id',
        'occurred_at',
    ];

    protected $casts = [
        'event_data' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function messageQueue(): BelongsTo
    {
        return $this->belongsTo(MessageQueue::class, 'message_queue_id');
    }
}
