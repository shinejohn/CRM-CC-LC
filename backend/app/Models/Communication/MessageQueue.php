<?php

namespace App\Models\Communication;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MessageQueue extends Model
{
    use HasUuids;

    protected $table = 'message_queue';

    protected $fillable = [
        'uuid',
        'priority',
        'message_type',
        'source_type',
        'source_id',
        'channel',
        'recipient_type',
        'recipient_id',
        'recipient_address',
        'subject',
        'template',
        'content_data',
        'ip_pool',
        'gateway',
        'status',
        'scheduled_for',
        'locked_by',
        'locked_at',
        'sent_at',
        'delivered_at',
        'external_id',
        'attempts',
        'max_attempts',
        'last_error',
        'next_retry_at',
    ];

    protected $casts = [
        'content_data' => 'array',
        'scheduled_for' => 'datetime',
        'locked_at' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'next_retry_at' => 'datetime',
        'attempts' => 'integer',
        'max_attempts' => 'integer',
    ];

    public function deliveryEvents(): HasMany
    {
        return $this->hasMany(DeliveryEvent::class, 'message_queue_id');
    }
}
