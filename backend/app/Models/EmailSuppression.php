<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailSuppression extends Model
{
    use HasUuids;

    protected $fillable = [
        'email_address',
        'email_client_id',
        'reason',
        'source',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(EmailClient::class, 'email_client_id');
    }
}
