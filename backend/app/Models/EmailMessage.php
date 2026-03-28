<?php

namespace App\Models;

use App\Enums\EmailClass;
use App\Enums\EmailStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailMessage extends Model
{
    use HasUuids;

    protected $fillable = [
        'email_client_id',
        'email_sender_id',
        'email_pool_id',
        'to_address',
        'subject',
        'email_class',
        'status',
        'provider_message_id',
        'error_message',
        'payload_log',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'email_class' => EmailClass::class,
            'status' => EmailStatus::class,
            'payload_log' => 'array',
            'delivered_at' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(EmailClient::class, 'email_client_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(EmailSender::class, 'email_sender_id');
    }

    public function pool(): BelongsTo
    {
        return $this->belongsTo(EmailPool::class, 'email_pool_id');
    }
}
