<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class ObjectionEncounter extends Model
{
    use HasUuids;

    protected $fillable = [
        'customer_id',
        'objection_handler_id',
        'channel',
        'customer_statement',
        'am_response',
        'outcome',
        'metadata',
    ];
    
    protected $casts = [
        'metadata' => 'array',
    ];
    
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
    
    public function objectionHandler(): BelongsTo
    {
        return $this->belongsTo(ObjectionHandler::class);
    }
}

